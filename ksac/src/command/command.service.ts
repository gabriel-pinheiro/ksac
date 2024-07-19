import { injectable } from 'inversify';
import 'colors';
import { DefinitionServices } from '../definition/definition.service';
import { CommandError } from './command.error';
import { PlanService } from '../plan/plan.service';
import { InquirerService } from '../inquirer/inquirer.service';
import { AuthService } from '../auth/auth.service';
import { Step } from '../plan/steps/step';
import { ConciliationService } from '../conciliation/conciliation.service';
import * as Hoek from '@hapi/hoek';

@injectable()
export class CommandService {
    constructor(
        private readonly definitionService: DefinitionServices,
        private readonly planService: PlanService,
        private readonly inquirerService: InquirerService,
        private readonly authService: AuthService,
        private readonly conciliationService: ConciliationService,
    ) { }

    async login() {
        console.log(`Start by creating a Service Credential on StackSpot and input the fields below`);
        console.log(`https://docs.stackspot.com/en/home/account/enterprise/service-credential`);

        let realm: string;
        let clientId: string;
        let clientSecret: string;

        try {
            realm = await this.inquirerService.promptRealm();
            clientId = await this.inquirerService.promptClientId();
            clientSecret = await this.inquirerService.promptClientSecret();
        } catch (e) {
            throw new CommandError('Login cancelled');
        }

        await this.authService.login(realm, clientId, clientSecret);
        console.log('Credentials saved'.green);
    }

    async logout() {
        await this.authService.logout();
        console.log('Credentials removed'.green);
    }

    async validate(mustShow: boolean) {
        const definitions = await this.definitionService.getDefinitions();

        if(mustShow) {
            console.log(JSON.stringify(definitions, null, 2));
        }

        console.log('The definitions are valid'.green);
    }

    async plan() {
        const steps = await this.planService.getExecutionPlan();
        this.printPlan(steps);
    }

    async apply(isDestroy?: boolean) {
        const steps = await this.planService.getExecutionPlan(isDestroy);
        this.printPlan(steps);

        if (!steps.length) {
            return;
        }

        if (isDestroy) {
            console.error('\nAll the Knowledge Sources above and their'.yellow);
            console.error('Knowledge Objects will be destroyed in 2 seconds.'.yellow);
            console.error('Press Ctrl+C to cancel'.yellow.bold);
            await Hoek.wait(2000);
        }

        console.log('\nExecuting changes:');
        await this.conciliationService.applyPlan(steps);
        console.log('');
        console.log('Changes applied'.green);
    }

    private printPlan(steps: Step[]) {
        console.log('');

        if (!steps.length) {
            console.log('Knowledge Sources are up to date. No changes needed'.green);
            return;
        }

        console.log('The following changes will be made:');
        steps.forEach(step => console.log(step.description));
    }
}
