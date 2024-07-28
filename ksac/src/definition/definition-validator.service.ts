import { injectable } from "inversify";
import { CommandError } from "../command/command.error";
import { Definition, RawDefinition, KnowledgeSource } from "./data/models";
import { rawDefinitionSchema } from "./data/schemas";

const debug = require('debug')('ksac:definition-validator:service');

const SLUG_REGEX = /^[a-z0-9\-]+$/;

@injectable()
export class DefinitionValidationService {
    validateDefinition(definition: RawDefinition) {
        debug(`validating definition format in file '${definition.fileName}'`);
        const { error } = rawDefinitionSchema.validate(definition);
        if (!error) {
            return;
        }

        throw new CommandError(`Invalid definition format in file '${definition.fileName}'\n${error.message}`);
    }

    validateContent(definition: Definition) {
        debug(`validating definition content`);
        this.validateDuplicatedKS(definition);
        definition.knowledgeSources.forEach(ks => {
            this.validateDuplicatedKO(ks);
            this.validateSlugs(ks);
            this.validateEmptyContent(ks);
        });
    }

    private validateDuplicatedKS(definition: Definition) {
        const slugs = new Set<string>();
        definition.knowledgeSources.forEach(ks => {
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
            .map(slug => this.validateSlug(slug))
            .filter(error => Boolean(error));

        if (invalidSlugs.length) {
            throw new CommandError(`Invalid knowledge object slug(s) found in knowledge source '${ks.slug}' on file '${ks.fileName}:'\n${invalidSlugs.join('\n')}`);
        }

        const ksSlugError = this.validateSlug(ks.slug);
        if (ksSlugError) {
            throw new CommandError(`Invalid knowledge source slug '${ks.slug}' found on file '${ks.fileName}':\n${ksSlugError}`);
        }
    }

    private validateSlug(slug: string): string {
        if (slug.length < 2) {
            return `'${slug}' is too short`;
        }

        if (slug.length > 36) {
            return `'${slug}' is too long`;
        }

        if (!SLUG_REGEX.test(slug)) {
            return `'${slug}' is an invalid slug`;
        }

        return '';
    }

    private validateEmptyContent(ks: KnowledgeSource) {
        ks.knowledgeObjects.forEach(ko => {
            if (!ko.content) {
                throw new CommandError(`Knowledge object '${ko.slug}' in source '${ks.slug}' on file '${ks.fileName}' has no content`);
            }
        });
    }
}
