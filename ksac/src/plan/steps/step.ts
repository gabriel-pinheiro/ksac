import { ConciliationService } from '../../conciliation/conciliation.service';

export abstract class Step {
    abstract run(service: ConciliationService): Promise<void>;
    abstract get description(): string;
}
