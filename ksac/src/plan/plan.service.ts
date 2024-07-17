import { injectable } from "inversify";
import { DefinitionServices } from "../definition/definition.service";
import { KnowledgeSource } from "../definition/definition-validator.service";
import { CreateKSStep } from "./steps/create-ks-step";
import { FIELDS, PartialKnowledgeSource, UpdateKSStep } from "./steps/update-ks-step";
import { Step } from "./steps/step";
import { AuthService } from "../auth/auth.service";
import { CommandError } from "../command/command.error";

const debug = require('debug')('ksac:plan:service');

@injectable()
export class PlanService {
    constructor(
        private readonly definitionService: DefinitionServices,
        private readonly authService: AuthService,
    ) { }

    async getExecutionPlan(): Promise<Step[]> {
        debug('getting definitions');
        console.log('Building definitions');
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
        console.log(`Creating plan for Knowledge Source '${desired.slug.bold}'`);
        const steps = [];

        const current = await this.fetchKnowledgeSource(desired.slug);

        if(!current) {
            debug(`knowledge source '${desired.slug}' not found, adding create step`);
            steps.push(CreateKSStep.of(desired));
            return steps;
        }

        const mustUpdate = this.mustUpdateKnowledgeSource(current, desired);
        if(mustUpdate) {
            debug(`knowledge source '${desired.slug}' must be updated, adding update step`);
            steps.push(UpdateKSStep.of(current, desired));
        }

        if(!steps.length) {
            debug(`knowledge source '${desired.slug}' is up to date, no steps added`);
        }

        return steps;
    }

    private async fetchKnowledgeSource(slug: string): Promise<PartialKnowledgeSource> {
        const stk = await this.authService.getStackSpot();

        try {
            debug(`fetching knowledge source '${slug}'`);
            return await stk.getKnowledgeSource(slug);
        } catch (e) {
            const data = e.response?.data;
            if (data?.type === 'NotFoundError') {
                return null;
            }

            if (data?.message && data?.code) {
                throw new CommandError(`Failed to fetch knowledge source '${slug}', ${data.message} (${data.code})`);
            }

            throw e;
        }
    }

    private mustUpdateKnowledgeSource(
        current: PartialKnowledgeSource,
        desired: PartialKnowledgeSource
    ): boolean {
        return FIELDS.some(field => current[field] !== desired[field]);
    }
}
