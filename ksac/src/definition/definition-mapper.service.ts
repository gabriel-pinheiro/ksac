import 'colors';
import { injectable } from 'inversify';
import {
    Definition,
    DefinitionFile,
    RawDefinition,
    RawKnowledgeObject,
    RawKnowledgeSource,
} from './data/models';

const debug = require('debug')('ksac:definition-mapper:service');

const WARN = 'Warning!'.yellow.bold;

@injectable()
export class DefinitionMapperService {
    mapFileToRawDefinition(file: DefinitionFile): RawDefinition {
        debug(`mapping file '${file.name}' content to raw definition`);

        if (!file.content.knowledge_source) {
            console.error(
                `${WARN} File '${file.name}' does not contain any knowledge source`,
            );
            return { knowledgeSources: [], fileName: file.name };
        }

        const knowledgeSources = file.content.knowledge_source.map((ks) =>
            this.mapKnowledgeSource(ks, file.name),
        );

        return { knowledgeSources, fileName: file.name };
    }

    mergeDefinitions(definitions: Definition[]): Definition {
        debug('merging definitions');
        const knowledgeSources = definitions
            .map((d) => d.knowledgeSources)
            .reduce((acc, val) => [...acc, ...val], []);

        return { knowledgeSources };
    }

    private mapKnowledgeSource(ks: any, fileName: string): RawKnowledgeSource {
        const slug = Object.keys(ks)[0];
        debug(`mapping knowledge source '${slug}'`);
        const sources = ks[slug];
        const source = sources[0];
        if (!source.knowledge_object) {
            source.knowledge_object = [];
        }

        const knowledgeSource = {
            slug,
            fileName,
            ...source,
        };
        delete knowledgeSource.knowledge_object;
        knowledgeSource.knowledgeObjects = source.knowledge_object.map((ko) =>
            this.mapKnowledgeObject(ko),
        );
        return knowledgeSource;
    }

    private mapKnowledgeObject(ko: any): RawKnowledgeObject {
        const slug = Object.keys(ko)[0];
        debug(`mapping knowledge object '${slug}'`);
        const objects = ko[slug];
        const object = objects[0];

        const knowledgeObject = {
            slug,
            ...object,
        };
        delete knowledgeObject.use_cases;
        delete knowledgeObject.import_file;
        knowledgeObject.useCases = object.use_cases || [];
        knowledgeObject.importFile = object.import_file;
        knowledgeObject.language = knowledgeObject.language || 'markdown';
        knowledgeObject.content = knowledgeObject.content;

        return knowledgeObject;
    }
}
