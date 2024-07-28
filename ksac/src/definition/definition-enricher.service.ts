import { injectable } from "inversify";
import {
    Definition,
    RawDefinition,
    RawKnowledgeObject,
    RawKnowledgeSource,
    KnowledgeObject,
    KnowledgeSource,
} from "./data/models";

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
            const enrichedKO = await this.enrichKnowledgeObject(rawKO);
            knowledgeObjects.push(enrichedKO);
        }

        return { ...raw, knowledgeObjects };
    }

    private async enrichKnowledgeObject(raw: RawKnowledgeObject): Promise<KnowledgeObject> {
        debug(`enriching knowledge object '${raw.slug}'`);
        return {
            ...raw,
            useCases: raw.useCases.join('\n'),
        };
    }
}
