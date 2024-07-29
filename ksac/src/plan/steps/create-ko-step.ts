import { KnowledgeObject } from '../../definition/data/models';
import { ConciliationService } from '../../conciliation/conciliation.service';
import { Step } from './step';

const ARROW = ' >'.blue.bold;
const ADD = '[+]'.green.bold;

export class CreateKOStep extends Step {
    private constructor(
        private readonly ksSlug: string,
        private readonly knowledgeObject: KnowledgeObject,
    ) {
        super();
    }

    async run(service: ConciliationService): Promise<void> {
        console.log(
            `${ARROW} Creating Knowledge Object '${this.knowledgeObject.slug.bold}' on KS '${this.ksSlug.bold}'`,
        );
        await service.createKnowledgeObject(this.ksSlug, this.knowledgeObject);
    }

    get description(): string {
        return `    ${ADD} Create Knowledge Object '${this.knowledgeObject.slug.bold}'`;
    }

    static of(ksSlug: string, ko: KnowledgeObject): CreateKOStep {
        return new CreateKOStep(ksSlug, ko);
    }
}
