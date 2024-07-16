import { injectable } from "inversify";
import { DefinitionFileService } from "./definition-file.service";
import { Definition, DefinitionValidationService, KnowledgeSource } from "./definition-validator.service";
import { CommandError } from "../command/command.error";

const debug = require('debug')('ksac:definition:service');

export type MergedDefinition = Omit<Definition, 'fileName'>;

const SLUG_REGEX = /^(?!-)[a-z0-9]{3,30}(?:-[a-z0-9]+)*[a-z0-9]$/;

@injectable()
export class DefinitionServices {
    constructor(
        private readonly fileService: DefinitionFileService,
        private readonly validationService: DefinitionValidationService,
    ) { }

    async getDefinitions(): Promise<MergedDefinition> {
        debug('loading definition files');
        const files = await this.fileService.getDefinitionFiles();
        debug(`${files.length} definition files found, parsing`);
        const parsedFiles = await this.fileService.parseFiles(files);
        debug('definitions parsed, mapping content');
        const definitions = parsedFiles.map(f =>
            this.validationService.mapFileToDefinition(f));
        debug('content mapped, validating format');
        definitions.forEach(d =>
            this.validationService.validateDefinition(d));
        debug('formats validated, merging files');
        const merged = this.mergeDefinitions(definitions);
        debug('files merged, validating content');
        this.validateContent(merged);
        debug('content validated, done loading definitions');
        return merged;
    }

    private mergeDefinitions(definitions: Definition[]): MergedDefinition {
        return definitions.reduce((acc, value) => ({
            knowledgeSources: [...acc.knowledgeSources, ...value.knowledgeSources],
        }), { knowledgeSources: [] });
    }

    private validateContent(merged: MergedDefinition) {
        this.validateDuplicatedKS(merged);
        merged.knowledgeSources.forEach(ks => {
            this.validateDuplicatedKO(ks);
            this.validateSlugs(ks);
        });
    }

    private validateDuplicatedKS(merged: MergedDefinition) {
        const slugs = new Set<string>();
        merged.knowledgeSources.forEach(ks => {
            if (slugs.has(ks.slug)) {
                throw new CommandError(`Duplicated knowledge source slug '${ks.slug}' found on ${ks.fileName}`);
            }

            slugs.add(ks.slug);
        });
    }

    private validateDuplicatedKO(ks: KnowledgeSource) {
        const slugs = new Set<string>();
        ks.knowledgeObjects.forEach(ko => {
            if (slugs.has(ko.slug)) {
                throw new CommandError(`Duplicated knowledge object slug '${ko.slug}' in source '${ks.slug}' found on ${ks.fileName}`);
            }

            slugs.add(ko.slug);
        });
    }

    private validateSlugs(ks: KnowledgeSource) {
        const invalidSlugs = ks.knowledgeObjects
            .map(ko => ko.slug)
            .filter(slug => !SLUG_REGEX.test(slug));

        if (invalidSlugs.length) {
            throw new CommandError(`Invalid knowledge object slug(s) '${invalidSlugs.join(', ')}' in source '${ks.slug}' found on ${ks.fileName}`);
        }
        if (!SLUG_REGEX.test(ks.slug)) {
            throw new CommandError(`Invalid knowledge source slug '${ks.slug}' found on ${ks.fileName}`);
        }
    }
}
