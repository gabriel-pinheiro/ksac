import { ConciliationService } from '../../conciliation/conciliation.service';
import { KnowledgeSource } from '../../definition/data/models';
import { Step } from './step';

const ARROW = ' >'.blue.bold;
const CHANGE = '[~]'.yellow.bold;
export const FIELDS = ['name', 'description'];

export type PartialKnowledgeSource = Pick<
    KnowledgeSource,
    'slug' | 'name' | 'description'
>;

export class UpdateKSStep extends Step {
    private constructor(
        private readonly current: PartialKnowledgeSource,
        private readonly desired: PartialKnowledgeSource,
    ) {
        super();
    }

    async run(service: ConciliationService): Promise<void> {
        console.log(
            `${ARROW} Updating Knowledge Source '${this.current.slug.bold}'`,
        );
        await service.updateKnowledgeSource(this.current.slug, this.desired);
    }

    get description(): string {
        const changedFields = FIELDS.filter(
            (field) => this.current[field] !== this.desired[field],
        )
            .map((field) => field.bold)
            .join(', ');

        return `  ${CHANGE} Update ${changedFields} for Knowledge Source '${this.current.slug.bold}'`;
    }

    static of(
        current: PartialKnowledgeSource,
        desired: PartialKnowledgeSource,
    ): UpdateKSStep {
        return new UpdateKSStep(current, desired);
    }
}
