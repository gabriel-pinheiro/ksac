import { ConciliationService } from "../../conciliation/conciliation.service";
import { KnowledgeSource } from "../../definition/data/models";
import { Step } from "./step";

const ARROW = ' >'.blue.bold;
const DEL = '[-]'.red.bold;

export class DeleteKSStep extends Step {
    private constructor(
        private readonly knowledgeSource: KnowledgeSource,
    ) { super() }

    async run(service: ConciliationService): Promise<void> {
        console.log(`${ARROW} Deleting Knowledge Source '${this.knowledgeSource.slug.bold}'`);
        await service.deleteKnowledgeSource(this.knowledgeSource.slug);
    }

    get description(): string {
        return `  ${DEL} Delete Knowledge Source '${this.knowledgeSource.slug.bold}'`;
    }

    static of(ks: KnowledgeSource): DeleteKSStep {
        return new DeleteKSStep(ks);
    }
}
