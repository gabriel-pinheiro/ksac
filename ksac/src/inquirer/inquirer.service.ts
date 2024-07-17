import { injectable } from "inversify";
import inquirer from 'inquirer';

@injectable()
export class InquirerService {

    async promptRealm(): Promise<string> {
        const { realm } = await inquirer.prompt({
            type: 'input',
            name: 'realm',
            // @ts-ignore
            message: 'Realm:',
            // @ts-ignore
            validate: (input: string) => input.length > 0 ? true : 'Realm is required',
        });

        return realm;
    }

    async promptClientId(): Promise<string> {
        const { clientId } = await inquirer.prompt({
            type: 'input',
            name: 'clientId',
            // @ts-ignore
            message: 'Client ID:',
            // @ts-ignore
            validate: (input: string) => input.length > 0 ? true : 'Client ID is required',
        });

        return clientId;
    }

    async promptClientSecret(): Promise<string> {
        const { clientSecret } = await inquirer.prompt({
            type: 'input',
            name: 'clientSecret',
            // @ts-ignore
            message: 'Client Secret:',
            // @ts-ignore
            validate: (input: string) => input.length > 0 ? true : 'Client Secret is required',
        });

        return clientSecret;
    }
}
