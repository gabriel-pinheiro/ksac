import { Synchronize } from "@mocko/sync";
import { KnowledgeSource, KnowledgeSourceType, StackSpotAPI, StackSpotOptions } from "./stackspot-api";

const AUTHENTICATION_JITTER = 3000;

/**
 * A client for the StackSpot API that handles authentication and implements multi-request actions.
 */
export class StackSpot {
    private readonly api = new StackSpotAPI(this.options);
    private token = '';
    private expiresAt = 0;

    /**
     * Creates an instance of StackSpot.
     *
     * @param realm - The realm for authentication.
     * @param clientId - The client ID for authentication.
     * @param clientKey - The client secret key for authentication.
     * @param options - Configuration options for the StackSpot client.
     * @param options.apiUrl - The base URL for the StackSpot API, defaults to 'https://genai-code-buddy-api.stackspot.com'.
     * @param options.idmUrl - The base URL for the StackSpot Identity Manager, defaults to 'https://idm.stackspot.com'.
     */
    constructor(
        private readonly realm: string,
        private readonly clientId: string,
        private readonly clientKey: string,
        private readonly options: StackSpotOptions = {},
    ) { }

    /**
     * Creates a new knowledge source and shares it with the account.
     *
     * @param slug - The slug for the knowledge source.
     * @param name - The name of the knowledge source.
     * @param type - The type of the knowledge source, either 'SNIPPET', 'API', or 'CUSTOM'.
     * @param description - The description of the knowledge source.
     * @returns A promise that resolves when the knowledge source is created and shared.
     */
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

    async getKnowledgeSource(slug: string): Promise<KnowledgeSource> {
        await this.assertAuthenticated();
        const { data } = await this.api.getKnowledgeSource(this.token, slug);
        return data;
    }

    async createSnippet(
        slug: string,
        code: string,
        language: string,
        useCase: string,
    ): Promise<void> {
        await this.assertAuthenticated();
        await this.api.createSnippet(
            this.token,
            slug,
            code,
            language,
            useCase,
        );
    }

    /**
     * Authenticates the client if not already authenticated. Returns an error if authentication fails.
     */
    @Synchronize()
    async assertAuthenticated(): Promise<void> {
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
