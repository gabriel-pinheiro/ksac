import { injectable } from "inversify";
import { Step } from "../plan/steps/step";
import { KnowledgeObject, KnowledgeSource } from "../definition/definition-validator.service";
import { AuthService } from "../auth/auth.service";
import { CommandError } from "../command/command.error";

const debug = require('debug')('ksac:conciliation:service');

@injectable()
export class ConciliationService {
    constructor(
        private readonly authService: AuthService,
    ) { }

    async applyPlan(steps: Step[]) {
        for (const step of steps) {
            await step.run(this);
        }
    }

    async createKnowledgeSource(ks: KnowledgeSource) {
        const stk = await this.authService.getStackSpot();
        debug(`creating knowledge source '${ks.slug}'`);
        await stk.createAccountKnowledgeSource(
            ks.slug,
            ks.name,
            'SNIPPET',
            ks.description
        );
    }

    async updateKnowledgeSource(slug: string, ks: Partial<KnowledgeSource>) {
        const stk = await this.authService.getStackSpot();
        debug(`updating knowledge source '${slug}'`);
        await stk.updateKnowledgeSource(slug, ks.name, ks.description);
    }

    async createKnowledgeObject(ksSlug: string, ko: KnowledgeObject) {
        const stk = await this.authService.getStackSpot();
        debug(`creating knowledge object '${ko.slug}'`);
        await stk.createSnippet(
            ksSlug,
            ko.content,
            ko.language,
            ko.useCases.join('\n'),
        );
    }

    async deleteKnowledgeObject(ksSlug: string, koSlug: string) {
        const stk = await this.authService.getStackSpot();
        debug(`deleting knowledge object '${koSlug}'`);
        await stk.deleteKnowledgeObject(ksSlug, koSlug);
    }

    async deleteKnowledgeSource(slug: string) {
        const stk = await this.authService.getStackSpot();

        try {
            debug(`deleting knowledge source '${slug}'`);
            await stk.deleteKnowledgeSource(slug);
        } catch (e) {
            const data = e.response?.data;
            if (data?.type === 'NotFoundError') {
                debug(`knowledge source '${slug}' not found, skipping`);
                return;
            }

            if (data?.message && data?.code) {
                throw new CommandError(`Failed to delete knowledge source '${slug}', ${data.message} (${data.code})`);
            }

            throw e;
        }
    }
}
