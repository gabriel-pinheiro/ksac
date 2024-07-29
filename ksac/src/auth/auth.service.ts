import { injectable } from 'inversify';
import { CommandError } from '../command/command.error';
import { StackSpot } from 'stkai-sdk';
import os from 'os';
import path from 'path';
import { promises } from 'fs';
import { Synchronize } from '@mocko/sync';

const { mkdir, writeFile, readFile, rm } = promises;
const debug = require('debug')('ksac:auth:service');

const HOME = os.homedir();
const KSAC_DIR = path.join(HOME, '.ksac');
const AUTH_FILE = path.join(KSAC_DIR, 'credentials.json');

type Credentials = {
    realm: string;
    clientId: string;
    clientSecret: string;
};

@injectable()
export class AuthService {
    private stackspot: StackSpot;

    async login(realm: string, clientId: string, clientSecret: string) {
        await this.validateCredentials({ realm, clientId, clientSecret });
        await this.saveCredentials({ realm, clientId, clientSecret });
    }

    async logout() {
        debug('removing credentials');
        await rm(AUTH_FILE, { force: true });
    }

    @Synchronize()
    async getStackSpot(): Promise<StackSpot> {
        if (this.stackspot) {
            debug('using cached stackspot instance');
            return this.stackspot;
        }

        debug('reading credentials');
        const { realm, clientId, clientSecret } = await this.getCredentials();

        debug('creating stackspot instance');
        this.stackspot = new StackSpot(realm, clientId, clientSecret);
        return this.stackspot;
    }

    private async getCredentials(): Promise<Credentials> {
        try {
            const content = await readFile(AUTH_FILE);
            return JSON.parse(content.toString());
        } catch (e) {
            throw new CommandError(
                'Failed to read credentials, login with `ksac login`',
            );
        }
    }

    private async validateCredentials({
        realm,
        clientId,
        clientSecret,
    }: Credentials) {
        debug('validating credentials');
        try {
            const stk = new StackSpot(realm, clientId, clientSecret);
            await stk.assertAuthenticated();
        } catch (e) {
            const data = e.response?.data;
            const message = data?.message || data?.error || e.message;
            throw new CommandError(`Failed to login: ${message}`);
        }
    }

    private async saveCredentials({
        realm,
        clientId,
        clientSecret,
    }: Credentials) {
        debug('creating KSAC dir to save credentials');
        await mkdir(KSAC_DIR, { recursive: true });
        debug('saving credentials');
        const content = JSON.stringify(
            { realm, clientId, clientSecret },
            null,
            2,
        );
        await writeFile(AUTH_FILE, content);
    }
}
