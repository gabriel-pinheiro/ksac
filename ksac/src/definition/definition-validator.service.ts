import { injectable } from "inversify";
import * as Joi from 'joi';
import { DefinitionFile } from "./definition-file.service";
import { CommandError } from "../command/command.error";

const debug = require('debug')('ksac:definition-validator:service');

export type KnowledgeObject = {
    slug: string,
    useCases: string[],
    language: string,
    content: string,
};

export type KnowledgeSource = {
    slug: string,
    name: string,
    description: string,
    knowledgeObjects: KnowledgeObject[],
    fileName?: string,
};

export type Definition = {
    knowledgeSources: KnowledgeSource[],
    fileName: string,
};

const knowledgeObjectSchema = Joi.object({
    slug: Joi.string().required(),
    useCases: Joi.array().items(Joi.string()).required(),
    language: Joi.string().required(),
    content: Joi.string().required(),
});

const knowledgeSourceSchema = Joi.object({
    slug: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
    knowledgeObjects: Joi.array().items(knowledgeObjectSchema).required(),
    fileName: Joi.string().required(),
});

const definitionSchema = Joi.object({
    knowledgeSources: Joi.array().items(knowledgeSourceSchema).required(),
    fileName: Joi.string().required(),
});

const WARN = 'Warning!'.yellow.bold;


@injectable()
export class DefinitionValidationService {

    validateDefinition(definitions: Definition) {
        debug(`validating definition format in file '${definitions.fileName}'`);
        const { error } = definitionSchema.validate(definitions);
        if (!error) {
            return;
        }

        throw new CommandError(`Invalid definition format in file '${definitions.fileName}'\n${error.message}`);
    }

    mapFileToDefinition(file: DefinitionFile): Definition {
        debug(`merging objects within file '${file.name}'`);
        this.validateFileIsObject(file);
        this.validateDefinitionFormat(file);

        const knowledgeSources = file.content.knowledge_source
            .map(ks => this.mapKnowledgeSource(ks, file.name));

        return { knowledgeSources, fileName: file.name };
    }

    private validateFileIsObject(file: DefinitionFile) {
        if (typeof file.content === 'object') {
            return;
        }

        throw new CommandError(`File '${file.name}' is not a valid object`);
    }

    private validateDefinitionFormat(file: DefinitionFile) {
        const wrongKeys = Object.keys(file.content)
            .filter(key => key !== 'knowledge_source');
        if (wrongKeys.length) {
            throw new CommandError(`File '${file.name}' contains invalid keys: ${wrongKeys.join(', ')}`);
        }

        if (!file.content.hasOwnProperty('knowledge_source')) {
            console.error(`${WARN} File '${file.name}' does not contain 'knowledge_source's`);
            file.content.knowledge_source = [];
        }

        if (!Array.isArray(file.content.knowledge_source)) {
            throw new CommandError(`'knowledge_source' in file '${file.name}' is not a named object, invalid format`);
        }
    }

    private mapKnowledgeSource(ks: any, fileName: string): KnowledgeSource {
        this.validateOneKSKey(ks, fileName);

        const slug = Object.keys(ks)[0];
        const sources = ks[slug];
        this.validateKSSources(sources, slug, fileName);
        const source = sources[0];
        if (!source.knowledge_object) {
            source.knowledge_object = [];
        }

        const knowledgeSource = {
            slug, fileName, ...source,
        };
        delete knowledgeSource.knowledge_object;
        knowledgeSource.knowledgeObjects = source.knowledge_object
            .map(ko => this.mapKnowledgeObject(ko, slug, fileName));
        return knowledgeSource;
    }

    private validateKSSources(sources: any[], slug: string, fileName: string) {
        if (!Array.isArray(sources)) {
            throw new CommandError(`Knowledge Source '${slug}' in file '${fileName}' is not a named object, invalid format`);
        }

        if (sources.length === 0) {
            throw new CommandError(`Knowledge Source '${slug}' in file '${fileName}' is empty`);
        }

        if (sources.length > 1) {
            throw new CommandError(`Knowledge Source '${slug}' in file '${fileName}' is duplicated`);
        }
    }

    private validateOneKSKey(obj: any, fileName: string) {
        if (Object.keys(obj).length === 1) {
            return;
        }

        throw new CommandError(`File '${fileName}' contains an Knowledge Source with more than one key, invalid format`);
    }

    private mapKnowledgeObject(ko: any, ksSlug: string, fileName: string): KnowledgeObject {
        this.validateOneKOKey(ko, ksSlug, fileName);

        const slug = Object.keys(ko)[0];
        const objects = ko[slug];
        this.validateKOObjects(objects, slug, ksSlug, fileName);
        const object = objects[0];

        const knowledgeObject = {
            slug, ...object,
        };
        delete knowledgeObject.use_cases;
        knowledgeObject.useCases = object.use_cases || [];
        knowledgeObject.language = knowledgeObject.language || 'markdown';
        knowledgeObject.content = knowledgeObject.content.trim();

        return knowledgeObject;
    }

    private validateOneKOKey(obj: any, ksSlug: string, fileName: string) {
        if (Object.keys(obj).length === 1) {
            return;
        }

        throw new CommandError(`Knowledge Source '${ksSlug}' in file '${fileName}' contains an Knowledge Object with more than one key, invalid format`);
    }

    private validateKOObjects(objects: any[], slug: string, ksSlug: string, fileName: string) {
        if (!Array.isArray(objects)) {
            throw new CommandError(`Knowledge Object '${slug}' in Knowledge Source '${ksSlug}' in file '${fileName}' is not a named object, invalid format`);
        }

        if (objects.length === 0) {
            throw new CommandError(`Knowledge Object '${slug}' in Knowledge Source '${ksSlug}' in file '${fileName}' is empty`);
        }

        if (objects.length > 1) {
            throw new CommandError(`Knowledge Object '${slug}' in Knowledge Source '${ksSlug}' in file '${fileName}' is duplicated`);
        }
    }
}
