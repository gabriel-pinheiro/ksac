import * as semver from 'semver';
if(!semver.satisfies(process.version, '>=12')) {
  console.error(`Your NodeJS version (${process.version}) is too old for ksac\nUse at least NodeJS 12`);
  process.exit(1);
}

import 'reflect-metadata';
import { Container } from 'inversify';
import { CommandController } from './command/command.controller';
import { Command } from 'commander';
const pkg = require('../package.json');

const debug = require('debug')('ksac:main');

async function bootstrap() {
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

bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
