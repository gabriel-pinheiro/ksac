import { KnowledgeSource } from "../../definition/definition-validator.service";
import { Step } from "./step";

const CHANGE = '[~]'.yellow.bold;
export const FIELDS = ['name', 'description'];

export class UpdateKSStep extends Step {
    private constructor(
        private readonly current: KnowledgeSource,
        private readonly desired: KnowledgeSource,
    ) { super() }

    async run(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    get description(): string {
        const changedFields = FIELDS
            .filter(field => this.current[field] !== this.desired[field])
            .map(field => field.bold)
            .join(', ');

        return `  ${CHANGE} Update ${changedFields} for Knowledge Source '${this.current.slug.bold}'`;
    }

    static of(
        current: KnowledgeSource,
        desired: KnowledgeSource
    ): UpdateKSStep {
        return new UpdateKSStep(current, desired);
    }
}
