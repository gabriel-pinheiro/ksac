import Axios from 'axios';
import type { AxiosInstance } from 'axios';

export type StackSpotOptions = {
    apiUrl?: string;
    idmUrl?: string;
};

export type KnowledgeSourceType = 'SNIPPET' | 'API' | 'CUSTOM';
export type KnowledgeSourceVisibilityLevel = 'personal' | 'account';

export class StackSpotAPI {
    private api: AxiosInstance;
    private idm: AxiosInstance;

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

    authenticate(clientId: string, clientKey: string, realm: string) {
        return this.idm.post(`/${realm}/oidc/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientKey,
        });
    }

    createKnowledgeSource(jwt: string, slug: string, name: string, description: string, type: string, isDefault: boolean, visibilityLevel: string) {
        return this.api.post('/v1/knowledge-sources', {
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

    shareKnowledgeSource(jwt: string, slug: string) {
        return this.api.post(`/v1/knowledge-sources/${slug}/share`, {}, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
        });
    }
}
