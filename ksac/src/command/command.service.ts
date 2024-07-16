import { injectable } from 'inversify';
import 'colors';
import { DefinitionServices } from '../definition/definition.service';

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
        await this.definitionService.getDefinitions();
        console.log('The definitions are valid');
    }

    async plan() {
        console.log('The following changes will be made:');
        console.log(`  ${ADD} Create Knowledge Source vivo-easy-schema`);
        console.log(`    ${ADD} Create Knowledge Object client-table`);
        console.log(`    ${ADD} Create Knowledge Object payment-table`);
        console.log(`    ${ADD} Create Knowledge Object transaction-table`);
        console.log(`  ${MODIFY} Rename Knowledge Source operation-alerts`);
        console.log(`  ${KEEP} On Knowledge Source onboarding`);
        console.log(`    ${DELETE} Delete Knowledge Object 01J2M2NF01AKVBPT4NA35CPTHD[a18b4a0b]`);
        console.log(`    ${ADD} Create Knowledge Object pandora`);
    }

    async apply() {
    }

    async destroy() {
    }
}
