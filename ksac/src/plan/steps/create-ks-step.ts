import { KnowledgeSource } from "../../definition/definition-validator.service";
import { Step } from "./step";

const ADD = '[+]'.green.bold;

export class CreateKSStep extends Step {
    private constructor(
        private readonly knowledgeSource: KnowledgeSource,
    ) { super() }

    async run(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    get description(): string {
        return `  ${ADD} Create Knowledge Source '${this.knowledgeSource.slug.bold}'`;
    }

    static of(ks: KnowledgeSource): CreateKSStep {
        return new CreateKSStep(ks);
    }
}
