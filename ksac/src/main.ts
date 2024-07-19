import * as semver from 'semver';
if(!semver.satisfies(process.version, '>=16')) {
  console.error(`Your NodeJS version (${process.version}) is too old for ksac\nUse at least NodeJS 16`);
  process.exit(1);
}

const debug = require('debug')('ksac:main');
const debugUpdate = require('debug')('ksac:updater');

const startedAt = Date.now();
debug('importing dependencies');
import 'reflect-metadata';
import updateNotifier from 'gp-simple-update-notifier';
import { Container } from 'inversify';
import { CommandController } from './command/command.controller';
import { Command } from 'commander';
const pkg = require('../package.json');

let notifyUpdate: () => void;

async function bootstrap() {
    debug('checking for updates');
    updateCheck();

    debug('creating Commander');
    const command = new Command()
        .version(`ksac/${pkg.version} node/${process.version}`);

    debug('resolving dependencies');
    const container = new Container({
        autoBindInjectable: true,
        defaultScope: 'Singleton',
    });

    container.bind<Command>(Command).toConstantValue(command);

    debug('registering commands');
    await container
        .resolve<CommandController>(CommandController)
        .registerCommands();

    debug('parsing/starting command');
    await command.parseAsync();

    if (notifyUpdate) {
        debug('showing update message');
        notifyUpdate();
    }

    debug(`command finished in ${Date.now() - startedAt}ms`);
    process.exit(0); // Exiting to kill update check, if it's still running
}

async function updateCheck() {
    debugUpdate('starting update check');
    updateNotifier({ pkg })
        .then(notify => {
            notifyUpdate = notify;
            debugUpdate('update check done');
        });

    debugUpdate('update check started');
}

bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
