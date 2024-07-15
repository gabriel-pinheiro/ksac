import { jest } from '@jest/globals';
import { StackSpot } from './stackspot';
import { KnowledgeSourceType, StackSpotAPI } from './stackspot-api';

jest.mock('./stackspot-api');

describe('StackSpot', () => {
    const realm = 'test-realm';
    const clientId = 'test-client-id';
    const clientKey = 'test-client-key';

    let stackSpot: StackSpot;
    let mockApi: jest.Mocked<StackSpotAPI>;

    beforeEach(() => {
        stackSpot = new StackSpot(realm, clientId, clientKey);
        mockApi = new StackSpotAPI() as jest.Mocked<StackSpotAPI>;
        (stackSpot as any).api = mockApi;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createAccountKnowledgeSource', () => {
        it('should create and share a knowledge source', async () => {
            const slug = 'test-slug';
            const name = 'Test Knowledge Source';
            const type: KnowledgeSourceType = 'SNIPPET';
            const description = 'Test description';

            mockApi.createKnowledgeSource.mockResolvedValue({} as any);
            mockApi.shareKnowledgeSource.mockResolvedValue({} as any);
            mockApi.authenticate.mockResolvedValue({
                data: {
                    access_token: 'test-token',
                    expires_in: 3600,
                },
            } as any);

            await stackSpot.createAccountKnowledgeSource(slug, name, type, description);

            expect(mockApi.authenticate).toHaveBeenCalledWith(realm, clientId, clientKey);
            expect(mockApi.createKnowledgeSource).toHaveBeenCalledWith(
                'test-token',
                slug,
                name,
                description,
                type,
                false,
                'personal'
            );
            expect(mockApi.shareKnowledgeSource).toHaveBeenCalledWith('test-token', slug);
        });
    });

    describe('assertAuthenticated', () => {
        it('should authenticate if not already authenticated', async () => {
            mockApi.authenticate.mockResolvedValue({
                data: {
                    access_token: 'new-test-token',
                    expires_in: 3600,
                },
            } as any);

            await (stackSpot as any).assertAuthenticated();

            expect(mockApi.authenticate).toHaveBeenCalledWith(realm, clientId, clientKey);
            expect((stackSpot as any).token).toBe('new-test-token');
        });

        it('should authenticate if token has expired', async () => {
            (stackSpot as any).token = 'expired-token';
            (stackSpot as any).expiresAt = Date.now() - 10000; // Token is expired

            mockApi.authenticate.mockResolvedValue({
                data: {
                    access_token: 'new-test-token',
                    expires_in: 3600,
                },
            } as any);

            await (stackSpot as any).assertAuthenticated();

            expect(mockApi.authenticate).toHaveBeenCalledWith(realm, clientId, clientKey);
            expect((stackSpot as any).token).toBe('new-test-token');
        });

        it('should not authenticate if token is still valid', async () => {
            (stackSpot as any).token = 'valid-token';
            (stackSpot as any).expiresAt = Date.now() + 10000; // Token is still valid

            await (stackSpot as any).assertAuthenticated();

            expect(mockApi.authenticate).not.toHaveBeenCalled();
        });
    });
});
