import { injectable } from "inversify";
import { Step } from "../plan/steps/step";
import { KnowledgeSource } from "../definition/definition-validator.service";
import { AuthService } from "../auth/auth.service";

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
}
