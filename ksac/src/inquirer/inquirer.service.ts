import { injectable } from 'inversify';
import prompts from 'prompts';
import { CommandError } from '../command/command.error';

@injectable()
export class InquirerService {
    async promptRealm(): Promise<string> {
        const { realm } = await prompts.prompt({
            type: 'text',
            name: 'realm',
            message: 'Realm',
            validate: (input: string) =>
                input.length > 0 ? true : 'Realm is required',
        });

        if (!realm) {
            throw new CommandError('Login cancelled');
        }

        return realm;
    }

    async promptClientId(): Promise<string> {
        const { clientId } = await prompts.prompt({
            type: 'text',
            name: 'clientId',
            message: 'Client ID',
            validate: (input: string) =>
                input.length > 0 ? true : 'Client ID is required',
        });

        if (!clientId) {
            throw new CommandError('Login cancelled');
        }

        return clientId;
    }

    async promptClientKey(): Promise<string> {
        const { clientSecret } = await prompts.prompt({
            type: 'password',
            name: 'clientSecret',
            message: 'Client Key',
            validate: (input: string) =>
                input.length > 0 ? true : 'Client Key is required',
        });

        if (!clientSecret) {
            throw new CommandError('Login cancelled');
        }

        return clientSecret;
    }
}
