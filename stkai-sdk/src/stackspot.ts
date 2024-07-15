import { KnowledgeSourceType, StackSpotAPI, StackSpotOptions } from "./stackspot-api";

const AUTHENTICATION_JITTER = 3000;

export class StackSpot {
    private readonly api = new StackSpotAPI(this.options);
    private token = '';
    private expiresAt = 0;

    constructor(
        private readonly realm: string,
        private readonly clientId: string,
        private readonly clientKey: string,
        private readonly options: StackSpotOptions = {},
    ) { }

    async createAccountKnowledgeSource(
        slug: string,
        name: string,
        type: KnowledgeSourceType,
        description: string,
    ): Promise<void> {
        await this.assertAuthenticated();
        await this.api.createKnowledgeSource(
            this.token,
            slug,
            name,
            description,
            type,
            false,
            'personal'
        );
        await this.api.shareKnowledgeSource(
            this.token,
            slug
        );
    }

    private async assertAuthenticated(): Promise<void> {
        if (this.token && Date.now() < this.expiresAt) {
            return;
        }

        const auth = await this.api.authenticate(
            this.realm,
            this.clientId,
            this.clientKey
        );
        this.token = auth.data.access_token;
        this.expiresAt = Date.now()
                + (auth.data.expires_in * 1000)
                - AUTHENTICATION_JITTER;
    }
}
