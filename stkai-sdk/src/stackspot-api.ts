import Axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

export type StackSpotOptions = {
    apiUrl?: string;
    idmUrl?: string;
};

export type KnowledgeSourceType = 'SNIPPET' | 'API' | 'CUSTOM';
export type KnowledgeSourceVisibilityLevel = 'personal' | 'account';

export type AuthenticateResponse = {
    refresh_token: string;
    refresh_expires_in: number;
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    session_state: string;
};

export type KnowledgeSource = {
    slug: string;
    name: string;
    description: string;
    type: KnowledgeSourceType;
    creator: string;
    default: boolean;
    visibility_level: KnowledgeSourceVisibilityLevel;
};

/**
 * A raw connector for the StackSpot API, use `StackSpot` for a more user-friendly interface.
 */
export class StackSpotAPI {
    private readonly api: AxiosInstance;
    private readonly idm: AxiosInstance;

    /**
     * Creates an instance of StackSpotAPI.
     * @param options - Configuration options for the API.
     * @param options.apiUrl - The base URL for the StackSpot API, defaults to 'https://genai-code-buddy-api.stackspot.com'.
     * @param options.idmUrl - The base URL for the StackSpot Identity Manager, defaults to 'https://idm.stackspot.com'.
     */
    constructor(options: StackSpotOptions = {}) {
        const {
            apiUrl = 'https://genai-code-buddy-api.stackspot.com',
            idmUrl = 'https://idm.stackspot.com',
        } = options;

        this.api = Axios.create({
            baseURL: apiUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.idm = Axios.create({
            baseURL: idmUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }

    /**
     * Authenticates the client with the given credentials.
     * @param realm - The realm for authentication.
     * @param clientId - The client ID.
     * @param clientKey - The client secret key.
     * @returns A promise that resolves to the authentication response, get the token with `.data.access_token`.
     */
    async authenticate(
        realm: string,
        clientId: string,
        clientKey: string,
    ): Promise<AxiosResponse<AuthenticateResponse>> {
        return await this.idm.post(`/${realm}/oidc/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientKey,
        });
    }

    /**
     * Creates a new knowledge source.
     * @param jwt - The JWT for authorization, obtained from `StackSpotAPI#authenticate`.
     * @param slug - The slug identifier for the knowledge source.
     * @param name - The name of the knowledge source.
     * @param description - The description of the knowledge source.
     * @param type - The type of the knowledge source, either 'SNIPPET', 'API', or 'CUSTOM'.
     * @param isDefault - Whether the knowledge source is used by default or must be added manually.
     * @param visibilityLevel - The visibility level of the knowledge source, either 'personal' or 'account'.
     * @returns A promise that resolves when the knowledge source is created.
     */
    async createKnowledgeSource(
        jwt: string,
        slug: string,
        name: string,
        description: string,
        type: KnowledgeSourceType,
        isDefault: boolean,
        visibilityLevel: KnowledgeSourceVisibilityLevel,
    ): Promise<AxiosResponse> {
        return await this.api.post('/v1/knowledge-sources', {
            slug,
            name,
            description,
            type,
            'default': isDefault,
            visibility_level: visibilityLevel,
        }, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
    }

    async getKnowledgeSource(
        jwt: string,
        slug: string,
    ): Promise<AxiosResponse<KnowledgeSource>> {
        return await this.api.get(`/v1/knowledge-sources/${slug}`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
    }

    /**
     * Shares an existing knowledge source.
     * @param jwt - The JSON Web Token for authorization.
     * @param slug - The slug identifier for the knowledge source.
     * @returns A promise that resolves when the knowledge source is shared.
     */
    async shareKnowledgeSource(
        jwt: string,
        slug: string
    ): Promise<AxiosResponse> {
        return await this.api.post(`/v1/knowledge-sources/${slug}/share`, {}, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
    }

    /**
     * Creates a new snippet in a knowledge source.
     *
     * @param jwt - The JWT for authorization, obtained from `StackSpotAPI#authenticate`.
     * @param slug - The slug identifier for the knowledge source.
     * @param code - The code content of the snippet.
     * @param language - The language of the code snippet.
     * @param useCase - The use case of the code snippet.
     */
    async createSnippet(
        jwt: string,
        slug: string,
        code: string,
        language: string,
        useCase: string,
    ): Promise<AxiosResponse> {
        return await this.api.post(`/v1/knowledge-sources/${slug}/snippets`, {
            code,
            language,
            use_case: useCase,
        }, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
    }
}
