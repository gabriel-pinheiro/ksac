import { Command } from 'commander';
import { injectable } from 'inversify';
import { Controller } from 'src/controller';
import { CommandService } from './command.service';

@injectable()
export class CommandController implements Controller {
    constructor(
        private readonly command: Command,
        private readonly service: CommandService,
    ) { }

    async registerCommands() {
        this.command
            .command('validate')
            .description('Checks the KSaC definitions for errors or warnings')
            .action(() => this.service.validate());

        this.command
            .command('plan')
            .description('Shows the changes that will be made by the KSaC definitions')
            .action(() => this.service.plan());

        this.command
            .command('apply')
            .description('Apply changes to the StackSpot resources so they match the KSaC definitions')
            .action(() => this.service.apply());

        this.command
            .command('destroy')
            .description('Destroys the resources defined in the KSaC definitions')
            .action(() => this.service.destroy());
    }
}
