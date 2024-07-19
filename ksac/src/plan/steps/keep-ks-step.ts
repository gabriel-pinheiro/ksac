import { ConciliationService } from "../../conciliation/conciliation.service";
import { KnowledgeSource } from "../../definition/definition-validator.service";
import { Step } from "./step";

const ARROW = ' >'.blue.bold;
const KEEP = '[@]'.gray.bold;

export class KeepKSStep extends Step {
    private constructor(
        private readonly knowledgeSource: KnowledgeSource,
    ) { super() }

    async run(_service: ConciliationService): Promise<void> {
        console.log(`${ARROW} On Knowledge Source '${this.knowledgeSource.slug.bold}'`);
    }

    get description(): string {
        return `  ${KEEP} On Knowledge Source '${this.knowledgeSource.slug.bold}'`;
    }

    static of(ks: KnowledgeSource): KeepKSStep {
        return new KeepKSStep(ks);
    }
}
