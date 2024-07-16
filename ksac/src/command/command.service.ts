import { injectable } from 'inversify';
import 'colors';
import { DefinitionServices } from '../definition/definition.service';
import { CommandError } from './command.error';

const ADD = '+'.green.bold;
const DELETE = '-'.red.bold;
const MODIFY = '~'.yellow.bold;
const KEEP = '@'.gray.bold;

@injectable()
export class CommandService {
    constructor(
        private readonly definitionService: DefinitionServices,
    ) { }

    async validate() {
        const definitions = await this.definitionService.getDefinitions();
        console.log(JSON.stringify(definitions, null, 2));
        console.log('The definitions are valid'.green);
    }

    async plan() {
        throw new CommandError('Not implemented yet');
    }

    async apply() {
        throw new CommandError('Not implemented yet');
    }

    async destroy() {
        throw new CommandError('Not implemented yet');
    }
}
