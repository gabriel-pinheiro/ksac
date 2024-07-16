import { injectable } from 'inversify';
import 'colors';
import { DefinitionServices } from '../definition/definition.service';
import { CommandError } from './command.error';
import { PlanService } from '../plan/plan.service';

const ADD = '+'.green.bold;
const DELETE = '-'.red.bold;
const MODIFY = '~'.yellow.bold;
const KEEP = '@'.gray.bold;

@injectable()
export class CommandService {
    constructor(
        private readonly definitionService: DefinitionServices,
        private readonly planService: PlanService,
    ) { }

    async validate(mustShow: boolean) {
        const definitions = await this.definitionService.getDefinitions();

        if(mustShow) {
            console.log(JSON.stringify(definitions, null, 2));
        }

        console.log('The definitions are valid'.green);
    }

    async plan() {
        const steps = await this.planService.getExecutionPlan();
        if (!steps.length) {
            console.log('Knowledge Sources are up to date. No changes needed'.green);
            return;
        }

        console.log('The following changes will be made:');
        steps.forEach(step => console.log(step.description));
    }

    async apply() {
        throw new CommandError('Not implemented yet');
    }

    async destroy() {
        throw new CommandError('Not implemented yet');
    }
}
