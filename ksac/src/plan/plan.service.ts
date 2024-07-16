import { injectable } from "inversify";
import { DefinitionServices } from "../definition/definition.service";
import { KnowledgeSource } from "../definition/definition-validator.service";
import { CreateKSStep } from "./steps/create-ks-step";
import { FIELDS, UpdateKSStep } from "./steps/update-ks-step";
import { Step } from "./steps/step";

const debug = require('debug')('ksac:plan:service');

@injectable()
export class PlanService {
    constructor(
        private readonly definitionService: DefinitionServices,
    ) { }

    async getExecutionPlan(): Promise<Step[]> {
        debug('getting execution plan');
        const definitions = await this.definitionService.getDefinitions();
        const steps = [];

        for (const ks of definitions.knowledgeSources) {
            const subSteps = await this.getKnowledgeSourceSteps(ks);
            steps.push(...subSteps);
        }

        return steps;
    }

    private async getKnowledgeSourceSteps(desired: KnowledgeSource): Promise<Step[]> {
        debug(`getting steps for knowledge source '${desired.slug}'`);
        const steps = [];

        const current = await this.fetchKnowledgeSource(desired.slug);

        if(!current) {
            steps.push(CreateKSStep.of(desired));
            return steps;
        }

        const mustUpdate = this.mustUpdateKnowledgeSource(current, desired);
        if(mustUpdate) {
            steps.push(UpdateKSStep.of(current, desired));
        }

        return steps;
    }

    private async fetchKnowledgeSource(slug: string): Promise<KnowledgeSource> {
        debug(`fetching knowledge source '${slug}'`);
        throw new Error('Method not implemented.');
    }

    private mustUpdateKnowledgeSource(
        current: KnowledgeSource,
        desired: KnowledgeSource
    ): boolean {
        return FIELDS.some(field => current[field] !== desired[field]);
    }
}
