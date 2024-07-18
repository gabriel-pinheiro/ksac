import * as semver from 'semver';
if(!semver.satisfies(process.version, '>=12')) {
  console.error(`Your NodeJS version (${process.version}) is too old for ksac\nUse at least NodeJS 12`);
  process.exit(1);
}

const debug = require('debug')('ksac:main');
const debugUpdate = require('debug')('ksac:updater');
debug('importing dependencies');
import 'reflect-metadata';
import updateNotifier from 'simple-update-notifier';
import { Container } from 'inversify';
import { CommandController } from './command/command.controller';
import { Command } from 'commander';
import * as Hoek from '@hapi/hoek';
const pkg = require('../package.json');

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
    command.parse();
}

async function updateCheck() {
    debugUpdate('scheduling update check');
    await Hoek.wait(50);

    debugUpdate('starting update check');
    updateNotifier({ pkg })
        .then(() => debugUpdate('update check done'));

    debugUpdate('update check started');
}

bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
