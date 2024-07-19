import { Command } from 'commander';
import { injectable } from 'inversify';
import { Controller } from 'src/controller';
import { CommandService } from './command.service';
import { CommandError } from './command.error';

const debug = require('debug')('ksac:command:controller');

@injectable()
export class CommandController implements Controller {
    constructor(
        private readonly command: Command,
        private readonly service: CommandService,
    ) { }

    async registerCommands() {
        this.command
            .command('login')
            .description('Set the credentials to access the StackSpot AI API')
            .action(() => this.errorProxy(() => this.service.login()));

        this.command
            .command('validate')
            .option('-s, --show', 'Show the definitions after validation')
            .description('Checks the KSaC definitions for errors or warnings')
            .action(({ show }) => this.errorProxy(() => this.service.validate(show)));

        this.command
            .command('plan')
            .description('Shows the changes that will be made by the KSaC definitions')
            .action(() => this.errorProxy(() => this.service.plan()));

        this.command
            .command('apply')
            .description('Apply changes to the StackSpot resources so they match the KSaC definitions')
            .action(() => this.errorProxy(() => this.service.apply()));

        this.command
            .command('destroy')
            .description('Destroys the resources defined in the KSaC definitions')
            .action(() => this.errorProxy(() => this.service.apply(true)));

        this.command
            .command('logout')
            .description('Remove the saved credentials')
            .action(() => this.errorProxy(() => this.service.logout()));
    }

    private async errorProxy<R, F extends (...args: any[]) => Promise<R>>(fn: F): Promise<R> {
        try {
            return await fn();
        } catch(e) {
            if (e instanceof CommandError) {
                console.error(e.message.red);
                process.exit(1);
            }

            const data = e.response?.data ?? {};
            const dataKeyCount = Object.keys(data).length;
            if (dataKeyCount) {
                console.error("A request error occurred. Run with 'DEBUG=ksac*' for more info".red);
                console.error(e.message.red);
                console.error(JSON.stringify(data, null, 2));
                debug(e);
                process.exit(1);
            }

            console.error("An unexpected error occurred. Run with 'DEBUG=ksac*' for more info".red);
            console.error(e.message.red);
            debug(e);
            process.exit(1);
        }
    }
}
