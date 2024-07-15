import Axios from 'axios';
import type { Axios, AxiosInstance, AxiosResponse } from 'axios';

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

export class StackSpotAPI {
    private readonly api: AxiosInstance;
    private readonly idm: AxiosInstance;

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
}
