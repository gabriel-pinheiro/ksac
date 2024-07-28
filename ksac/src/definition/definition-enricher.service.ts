import { injectable } from "inversify";
import {
    Definition,
    RawDefinition,
    RawKnowledgeObject,
    RawKnowledgeSource,
    KnowledgeObject,
    KnowledgeSource,
} from "./data/models";
import path from 'path';
import { promises } from 'fs';
import { CommandError } from "../command/command.error";

const { readFile } = promises;

const debug = require('debug')('ksac:definition-enricher:service');

@injectable()
export class DefinitionEnricherService {
    async enrichDefinitions(rawDefinitions: RawDefinition[]): Promise<Definition[]> {
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

    private async enrichKnowledgeSource(raw: RawKnowledgeSource): Promise<KnowledgeSource> {
        debug(`enriching knowledge source '${raw.slug}'`);
        const knowledgeObjects: KnowledgeObject[] = [];

        for (const rawKO of raw.knowledgeObjects) {
            const enrichedKO = await this.enrichKnowledgeObject(rawKO, raw);
            knowledgeObjects.push(enrichedKO);
        }

        return { ...raw, knowledgeObjects };
    }

    private async enrichKnowledgeObject(raw: RawKnowledgeObject, ks: RawKnowledgeSource): Promise<KnowledgeObject> {
        debug(`enriching knowledge object '${raw.slug}'`);
        let content = raw.content;
        if (raw.importFile) {
            content = await this.importContent(raw.importFile, ks.fileName, ks.slug, raw.slug);
        }

        content = content?.trim?.() ?? '';

        return {
            content,
            slug: raw.slug,
            language: raw.language,
            useCases: raw.useCases.join('\n'),
        };
    }

    private async importContent(file: string, originPath: string, ksSlug: string, koSlug: string): Promise<string> {
        const dir = path.dirname(originPath);
        const filePath = path.join(dir, file);
        try {
            debug(`importing content from file '${filePath}'`);
            const content = await readFile(filePath);
            return content.toString();
        } catch (error) {
            throw new CommandError(`Error importing content from '${filePath}' for knowledge object '${koSlug}' in knowledge source '${ksSlug}':\n${error.message}`);
        }
    }
}
