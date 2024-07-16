import { injectable } from "inversify";
import * as Joi from 'joi';
import { DefinitionFile } from "./definition-file.service";

const debug = require('debug')('ksac:definition-validator:service');

export type KnowledgeObject = {
    slug: string,
    use_cases: string[],
    language: string,
    content: string,
};

export type KnowledgeSource = {
    slug: string,
    name: string,
    description: string,
    knowledge_objects: KnowledgeObject[],
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
});

const definitionSchema = Joi.object({
    knowledgeSources: Joi.array().items(knowledgeSourceSchema).required(),
    fileName: Joi.string().required(),
});


@injectable()
export class DefinitionValidationService {

    validateDefinition(definitions: Definition) {
        debug(`validating definition format in file '${definitions.fileName}'`);
        const { error } = definitionSchema.validate(definitions);
        if (!error) {
            return;
        }

        console.error(`Invalid definition format in file '${definitions.fileName}'`);
        console.error(error.message);
        process.exit(1);
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

        console.error(`File '${file.name}' is not a valid object`);
        process.exit(1);
    }

    private validateDefinitionFormat(file: DefinitionFile) {
        if (!file.content.hasOwnProperty('knowledge_source')) {
            console.error(`File '${file.name}' does not contain 'knowledge_source's`);
            process.exit(1);
        }

        if (!Array.isArray(file.content.knowledge_source)) {
            console.error(`'knowledge_source' in file '${file.name}' is not a named object, invalid format`);
            process.exit(1);
        }

        if (Object.keys(file.content).length !== 1) {
            console.error(`File '${file.name}' contains other properties than 'knowledge_source'`);
            process.exit(1);
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
            slug, ...source,
        };
        delete knowledgeSource.knowledge_object;
        knowledgeSource.knowledgeObjects = source.knowledge_object
            .map(ko => this.mapKnowledgeObject(ko, slug, fileName));
        return knowledgeSource;
    }

    private validateKSSources(sources: any[], slug: string, fileName: string) {
        if (!Array.isArray(sources)) {
            console.error(`Knowledge Source '${slug}' in file '${fileName}' is not a named object, invalid format`);
            process.exit(1);
        }

        if (sources.length === 0) {
            console.error(`Knowledge Source '${slug}' in file '${fileName}' is empty`);
            process.exit(1);
        }

        if (sources.length > 1) {
            console.error(`Knowledge Source '${slug}' in file '${fileName}' is duplicated`);
            process.exit(1);
        }
    }

    private validateOneKSKey(obj: any, fileName: string) {
        if (Object.keys(obj).length === 1) {
            return;
        }

        console.error(`File '${fileName}' contains an Knowledge Source with more than one key, invalid format`);
        process.exit(1);
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
        knowledgeObject.useCases = object.use_cases;

        return knowledgeObject;
    }

    private validateOneKOKey(obj: any, ksSlug: string, fileName: string) {
        if (Object.keys(obj).length === 1) {
            return;
        }

        console.error(`Knowledge Source '${ksSlug}' in file '${fileName}' contains an Knowledge Object with more than one key, invalid format`);
        process.exit(1);
    }

    private validateKOObjects(objects: any[], slug: string, ksSlug: string, fileName: string) {
        if (!Array.isArray(objects)) {
            console.error(`Knowledge Object '${slug}' in Knowledge Source '${ksSlug}' in file '${fileName}' is not a named object, invalid format`);
            process.exit(1);
        }

        if (objects.length === 0) {
            console.error(`Knowledge Object '${slug}' in Knowledge Source '${ksSlug}' in file '${fileName}' is empty`);
            process.exit(1);
        }

        if (objects.length > 1) {
            console.error(`Knowledge Object '${slug}' in Knowledge Source '${ksSlug}' in file '${fileName}' is duplicated`);
            process.exit(1);
        }
    }
}
