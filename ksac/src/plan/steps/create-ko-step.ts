import { ConciliationService } from "../../conciliation/conciliation.service";
import { KnowledgeObject } from "../../definition/definition-validator.service";
import { Step } from "./step";

const ARROW = ' >'.blue.bold;
const ADD = '[+]'.green.bold;

export class CreateKOStep extends Step {
    private constructor(
        private readonly knowledgeObject: KnowledgeObject,
    ) { super() }

    async run(service: ConciliationService): Promise<void> {
        console.log(`${ARROW} Creating Knowledge Object '${this.knowledgeObject.slug.bold}'`);
    }

    get description(): string {
        return `    ${ADD} Create Knowledge Object '${this.knowledgeObject.slug.bold}'`;
    }

    static of(ks: KnowledgeObject): CreateKOStep {
        return new CreateKOStep(ks);
    }
}
