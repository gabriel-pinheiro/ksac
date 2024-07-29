import { ConciliationService } from '../../conciliation/conciliation.service';
import { KnowledgeSource } from '../../definition/data/models';
import { Step } from './step';

const ARROW = ' >'.blue.bold;
const ADD = '[+]'.green.bold;

export class CreateKSStep extends Step {
    private constructor(private readonly knowledgeSource: KnowledgeSource) {
        super();
    }

    async run(service: ConciliationService): Promise<void> {
        console.log(
            `${ARROW} Creating Knowledge Source '${this.knowledgeSource.slug.bold}'`,
        );
        await service.createKnowledgeSource(this.knowledgeSource);
    }

    get description(): string {
        return `  ${ADD} Create Knowledge Source '${this.knowledgeSource.slug.bold}'`;
    }

    static of(ks: KnowledgeSource): CreateKSStep {
        return new CreateKSStep(ks);
    }
}
