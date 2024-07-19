import { Synchronize } from "@mocko/sync";
import { KnowledgeObject, KnowledgeSource, KnowledgeSourceType, StackSpotAPI, StackSpotOptions } from "./stackspot-api";

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

    /**
     * Retrieves an existing knowledge source.
     *
     * @param slug - The slug identifier for the knowledge source.
     * @returns A promise that resolves to the knowledge source.
     */
    async getKnowledgeSource(slug: string): Promise<KnowledgeSource> {
        await this.assertAuthenticated();
        const { data } = await this.api.getKnowledgeSource(this.token, slug);
        return data;
    }

    /**
     * Updates an existing knowledge source.
     *
     * @param slug - The slug identifier for the knowledge source.
     * @param name - The name of the knowledge source.
     * @param description - The description of the knowledge source.
     */
    async updateKnowledgeSource(
        slug: string,
        name: string,
        description: string,
    ): Promise<void> {
        await this.assertAuthenticated();
        await this.api.updateKnowledgeSource(
            this.token,
            slug,
            name,
            description
        );
    }

    /**
     * Retrieves all knowledge objects in a knowledge source.
     *
     * @param slug - The slug identifier for the knowledge source.
     * @returns A promise that resolves to the knowledge objects.
     */
    async getKnowledgeObjects(slug: string): Promise<KnowledgeObject[]> {
        await this.assertAuthenticated();
        const { data } = await this.api.getKnowledgeObjects(this.token, slug);
        return data;
    }

    /**
     * Creates a new snippet in a knowledge source.
     *
     * @param slug - The slug identifier for the knowledge source.
     * @param code - The code content of the snippet.
     * @param language - The language of the code snippet.
     * @param useCase - The use case of the code snippet.
     */
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
     * Deletes a knowledge source.
     *
     * @param slug - The slug identifier for the knowledge source.
     */
    async deleteKnowledgeSource(slug: string): Promise<void> {
        await this.assertAuthenticated();
        await this.api.deleteKnowledgeSource(this.token, slug);
    }

    /**
     * Deletes a knowledge object from a knowledge source.
     *
     * @param slug - The slug identifier for the knowledge source.
     * @param koId - The identifier for the knowledge object.
     */
    async deleteKnowledgeObject(
        slug: string,
        koId: string,
    ): Promise<void> {
        await this.assertAuthenticated();
        await this.api.deleteKnowledgeObject(this.token, slug, koId);
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
