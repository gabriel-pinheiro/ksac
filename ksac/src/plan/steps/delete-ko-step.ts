import { KnowledgeObject as ApiKnowledgeObject } from "stkai-sdk";
import { ConciliationService } from "../../conciliation/conciliation.service";
import { Step } from "./step";

const ARROW = ' >'.blue.bold;
const DEL = '[-]'.red.bold;

export class DeleteKOStep extends Step {
    private constructor(
        private readonly knowledgeObject: ApiKnowledgeObject,
    ) { super() }

    async run(service: ConciliationService): Promise<void> {
        console.log(`${ARROW} Deleting Knowledge Object '${this.knowledgeObject.metadata.custom_id.bold}'`);
    }

    get description(): string {
        return `    ${DEL} Delete Knowledge Object '${this.knowledgeObject.metadata.custom_id.bold}'`;
    }

    static of(ks: ApiKnowledgeObject): DeleteKOStep {
        return new DeleteKOStep(ks);
    }
}
