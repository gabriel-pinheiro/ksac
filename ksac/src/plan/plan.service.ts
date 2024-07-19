import { injectable } from "inversify";
import { DefinitionServices } from "../definition/definition.service";
import { KnowledgeObject, KnowledgeSource } from "../definition/definition-validator.service";
import { CreateKSStep } from "./steps/create-ks-step";
import { FIELDS, PartialKnowledgeSource, UpdateKSStep } from "./steps/update-ks-step";
import { KeepKSStep } from "./steps/keep-ks-step";
import { CreateKOStep } from "./steps/create-ko-step";
import { DeleteKOStep } from "./steps/delete-ko-step";
import { Step } from "./steps/step";
import { AuthService } from "../auth/auth.service";
import { CommandError } from "../command/command.error";
import { KnowledgeObject as ApiKnowledgeObject } from "stkai-sdk";

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
        const ksSteps = await this.getKSOnlySteps(desired);
        const koSteps = await this.getKOSteps(desired);

        if (!ksSteps.length && !koSteps.length) {
            debug(`knowledge source '${desired.slug}' is up to date, no steps added`);
            return [];
        }

        if (!ksSteps.length && koSteps.length) {
            debug(`knowledge source '${desired.slug}' is up to date, but kos must be updated, adding 'keep' step`);
            ksSteps.push(KeepKSStep.of(desired));
        }

        return [...ksSteps, ...koSteps];
    }

    private async getKSOnlySteps(desired: KnowledgeSource): Promise<Step[]> {
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

        return steps;
    }

    private async getKOSteps(ks: KnowledgeSource): Promise<Step[]> {
        const currentKOs = await this.fetchKnowledgeObjects(ks.slug);
        const desiredKOs = ks.knowledgeObjects;

        const steps = [];

        for (const current of currentKOs) {
            const desired = desiredKOs.find(ko => this.compareKOs(current, ko));
            if (desired) {
                continue;
            }

            debug(`knowledge object '${current.metadata.custom_id}' not defined, adding delete step`);
            steps.push(DeleteKOStep.of(ks.slug, current));
        }

        for (const desired of desiredKOs) {
            const current = currentKOs.find(ko => this.compareKOs(ko, desired));
            if (current) {
                debug(`knowledge object '${desired.slug}' is up to date`);
                continue;
            }

            debug(`knowledge object '${desired.slug}' not found, adding create step`);
            steps.push(CreateKOStep.of(ks.slug, desired));
        }

        return steps;
    }

    private compareKOs(current: ApiKnowledgeObject, desired: KnowledgeObject): boolean {
        return current.page_content === desired.content
            && current.metadata.language === desired.language
            && current.metadata.hint === desired.useCases.join('\n');
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

    private async fetchKnowledgeObjects(ksSlug: string): Promise<ApiKnowledgeObject[]> {
        const stk = await this.authService.getStackSpot();

        try {
            debug(`fetching knowledge objects for knowledge source '${ksSlug}'`);
            return await stk.getKnowledgeObjects(ksSlug);
        } catch (e) {
            const data = e.response?.data;
            if (data?.type === 'NotFoundError') {
                return [];
            }

            if (data?.message && data?.code) {
                throw new CommandError(`Failed to fetch knowledge objects for knowledge source '${ksSlug}', ${data.message} (${data.code})`);
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
