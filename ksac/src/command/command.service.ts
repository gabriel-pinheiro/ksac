import { injectable } from 'inversify';
import 'colors';
import { DefinitionServices } from '../definition/definition.service';
import { PlanService } from '../plan/plan.service';
import { InquirerService } from '../inquirer/inquirer.service';
import { AuthService } from '../auth/auth.service';
import { Step } from '../plan/steps/step';
import { ConciliationService } from '../conciliation/conciliation.service';
import * as Hoek from '@hapi/hoek';
import { PreferenceService } from '../preference/preference.service';
import { FetchService } from '../fetch/fetch.service';

@injectable()
export class CommandService {
    constructor(
        private readonly definitionService: DefinitionServices,
        private readonly planService: PlanService,
        private readonly inquirerService: InquirerService,
        private readonly authService: AuthService,
        private readonly conciliationService: ConciliationService,
        private readonly preferenceService: PreferenceService,
        private readonly fetchService: FetchService,
    ) {}

    async login(
        realmOverride?: string,
        clientIdOverride?: string,
        clientKeyOverride?: string,
    ) {
        if (!realmOverride || !clientIdOverride || !clientKeyOverride) {
            console.log(
                `Start by creating a Service Account or Access Token on StackSpot:`,
            );
            console.log(`https://app.stackspot.com/account/access-token`);
        }

        const realm =
            realmOverride ?? (await this.inquirerService.promptRealm());
        const clientId =
            clientIdOverride ?? (await this.inquirerService.promptClientId());
        const clientKey =
            clientKeyOverride ?? (await this.inquirerService.promptClientKey());

        await this.authService.login(realm, clientId, clientKey);
        console.log('Credentials saved'.green);
    }

    async logout() {
        await this.authService.logout();
        console.log('Credentials removed'.green);
    }

    async validate(options: any, mustShow: boolean) {
        this.preferenceService.setOptions(options);
        const definitions = await this.definitionService.getDefinitions();

        if (mustShow) {
            console.log(JSON.stringify(definitions, null, 2));
        }

        console.log('The definitions are valid'.green);
    }

    async plan(options: any) {
        this.preferenceService.setOptions(options);
        const steps = await this.planService.getExecutionPlan();
        this.printPlan(steps);
    }

    async apply(options: any, isDestroy?: boolean) {
        this.preferenceService.setOptions(options);
        const steps = await this.planService.getExecutionPlan(isDestroy);
        this.printPlan(steps);

        if (!steps.length) {
            return;
        }

        if (isDestroy) {
            console.error('\nAll the Knowledge Sources above and their'.yellow);
            console.error(
                'Knowledge Objects will be destroyed in 2 seconds.'.yellow,
            );
            console.error('Press Ctrl+C to cancel'.yellow.bold);
            await Hoek.wait(2000);
        }

        console.log('\nExecuting changes:');
        await this.conciliationService.applyPlan(steps);
        console.log('');
        console.log('Changes applied'.green);
    }

    async fetch(slug: string) {
        const definition = await this.fetchService.fetch(slug);
        console.log(definition);
    }

    private printPlan(steps: Step[]) {
        console.log('');

        if (!steps.length) {
            console.log(
                'Knowledge Sources are up to date. No changes needed'.green,
            );
            return;
        }

        console.log('The following changes will be made:');
        steps.forEach((step) => console.log(step.description));
    }
}
