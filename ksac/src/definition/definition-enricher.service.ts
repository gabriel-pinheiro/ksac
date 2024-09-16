import { injectable } from 'inversify';
import {
    Definition,
    RawDefinition,
    RawKnowledgeObject,
    RawKnowledgeSource,
    KnowledgeObject,
    KnowledgeSource,
} from './data/models';
import path from 'path';
import pdf from 'pdf-parse';
import { isText } from 'istextorbinary';
import { fromBuffer as fileTypeFromBuffer, MimeType } from 'file-type';
import { promises } from 'fs';
import { CommandError } from '../command/command.error';
import { PreferenceService } from '../preference/preference.service';
const { readFile } = promises;

const debug = require('debug')('ksac:definition-enricher:service');

@injectable()
export class DefinitionEnricherService {
    constructor(private readonly preferenceService: PreferenceService) {}

    async enrichDefinitions(
        rawDefinitions: RawDefinition[],
    ): Promise<Definition[]> {
        const definitions: Definition[] = [];

        for (const raw of rawDefinitions) {
            const enriched = await this.enrichDefinition(raw);
            definitions.push(enriched);
        }

        return definitions;
    }

    private async enrichDefinition(raw: RawDefinition): Promise<Definition> {
        const knowledgeSources: KnowledgeSource[] = [];

        for (const rawKS of raw.knowledgeSources) {
            const enrichedKS = await this.enrichKnowledgeSource(rawKS);
            knowledgeSources.push(enrichedKS);
        }

        return { knowledgeSources };
    }

    private async enrichKnowledgeSource(
        raw: RawKnowledgeSource,
    ): Promise<KnowledgeSource> {
        debug(`enriching knowledge source '${raw.slug}'`);
        const knowledgeObjects: KnowledgeObject[] = [];

        for (const rawKO of raw.knowledgeObjects) {
            const enrichedKO = await this.enrichKnowledgeObject(rawKO, raw);
            knowledgeObjects.push(...enrichedKO);
        }

        return { ...raw, knowledgeObjects };
    }

    private async enrichKnowledgeObject(
        raw: RawKnowledgeObject,
        ks: RawKnowledgeSource,
    ): Promise<KnowledgeObject[]> {
        debug(`enriching knowledge object '${raw.slug}'`);
        let content = raw.content;
        if (raw.importFile) {
            content = await this.importContent(
                raw.importFile,
                ks.fileName,
                ks.slug,
                raw.slug,
            );
        }

        content = content?.trim?.() ?? '';
        const chunks = this.chunkContent(content);

        return chunks.map((chunk: string, idx: number) =>
            this.createKnowledgeObject(raw, chunk, idx, chunks.length),
        );
    }

    private async importContent(
        file: string,
        originPath: string,
        ksSlug: string,
        koSlug: string,
    ): Promise<string> {
        const dir = path.dirname(originPath);
        const filePath = path.join(dir, file);
        try {
            debug(`importing content from file '${filePath}'`);
            const content = await readFile(filePath);

            debug(`read ${content.length} bytes, detecting file type`);
            const type = await this.detectFileType(filePath, content);
            debug(`file type is '${type}'`);

            if (type === 'text/plain') {
                return content.toString();
            }

            if (type === 'application/pdf') {
                return this.extractTextFromPdf(content);
            }

            throw new CommandError(`Unsupported file type '${type}'`);
        } catch (error) {
            throw new CommandError(
                `Error importing content from '${filePath}' for knowledge object '${koSlug}' in knowledge source '${ksSlug}':\n${error.message}`,
            );
        }
    }

    private async detectFileType(
        filePath: string,
        content: Buffer,
    ): Promise<MimeType | 'text/plain' | 'unknown'> {
        const isTextFile = isText(filePath, content);
        if (isTextFile) {
            return 'text/plain';
        }

        const type = await fileTypeFromBuffer(content);
        return type?.mime ?? 'unknown';
    }

    private async extractTextFromPdf(content: Buffer): Promise<string> {
        debug('extracting text from PDF');
        const { text } = await pdf(content);
        debug(`extracted ${text.length} chars from PDF`);
        return text;
    }

    private chunkContent(content: string): string[] {
        const CHUNK_THRESHOLD = this.preferenceService.chunkThreshold;
        const CHUNK_SIZE = this.preferenceService.chunkSize;
        const len = this.countNonSpaceChars(content);

        if (len <= CHUNK_THRESHOLD) {
            return [content];
        }

        const chunks: string[] = [];
        let chunk = '';
        let chunkLen = 0;

        debug(`chunking content with ${len} non-space characters`);
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            chunk += char;

            if (char.match(/\S/)) {
                chunkLen++;
            }

            if (chunkLen >= CHUNK_SIZE) {
                debug(`adding ${chunk.length} chars long chunk`);
                chunks.push(chunk.trim());
                chunk = '';
                chunkLen = 0;
            }
        }

        if (chunk.trim()) {
            debug(`adding ${chunk.length} chars long chunk`);
            chunks.push(chunk.trim());
        }

        return chunks;
    }

    private countNonSpaceChars(content: string): number {
        const nonSpaceChars = content.match(/\S/g);
        return nonSpaceChars?.length ?? 0;
    }

    private createKnowledgeObject(
        raw: RawKnowledgeObject,
        content: string,
        idx: number,
        totalChunks: number,
    ): KnowledgeObject {
        let slug = raw.slug;
        if (totalChunks > 1) {
            slug = `${slug}-chunk-${idx}`;
        }

        return {
            content,
            slug,
            language: raw.language,
            useCases: raw.useCases.join('\n'),
        };
    }
}
