const twitterTokenService = require('../twitterTokenService');
const User = require('../../models/User');
const axios = require('axios');

jest.mock('../../models/User');
jest.mock('axios');

describe('twitterTokenService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isTokenExpired', () => {
        it('should return true if no expiry date provided', () => {
            expect(twitterTokenService.isTokenExpired(null)).toBe(true);
        });

        it('should return true if token is expired', () => {
            const pastDate = new Date(Date.now() - 10000); // 10s ago
            expect(twitterTokenService.isTokenExpired(pastDate)).toBe(true);
        });

        it('should return true if token is expiring within 5 minutes', () => {
            const soonDate = new Date(Date.now() + 2 * 60 * 1000); // 2m from now
            expect(twitterTokenService.isTokenExpired(soonDate)).toBe(true);
        });

        it('should return false if token is valid for > 5 minutes', () => {
            const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10m from now
            expect(twitterTokenService.isTokenExpired(futureDate)).toBe(false);
        });
    });

    describe('refreshTwitterToken', () => {
        const mockUserId = 'user123';
        const mockUser = {
            _id: mockUserId,
            twitterTokens: {
                refreshToken: 'old_refresh_token',
                accessToken: 'old_access_token',
                expiresAt: new Date(),
            },
            save: jest.fn().mockResolvedValue(true),
        };

        it('should refresh tokens successfully', async () => {
            User.findById.mockResolvedValue(mockUser);
            axios.post.mockResolvedValue({
                data: {
                    access_token: 'new_access_token',
                    refresh_token: 'new_refresh_token',
                    expires_in: 3600
                }
            });

            process.env.TWITTER_CLIENT_ID = 'test_id';
            process.env.TWITTER_CLIENT_SECRET = 'test_secret';

            const result = await twitterTokenService.refreshTwitterToken(mockUserId);

            expect(result.accessToken).toBe('new_access_token');
            expect(mockUser.save).toHaveBeenCalled();
            expect(axios.post).toHaveBeenCalled();
        });

        it('should throw error if user not found', async () => {
            User.findById.mockResolvedValue(null);
            await expect(twitterTokenService.refreshTwitterToken(mockUserId))
                .rejects.toThrow('Failed to refresh Twitter token');
        });
    });

    describe('ensureValidToken', () => {
        it('should return existing token if not expired', async () => {
            const mockUser = {
                twitterTokens: {
                    accessToken: 'valid_token',
                    expiresAt: new Date(Date.now() + 20 * 60 * 1000)
                }
            };
            User.findById.mockResolvedValue(mockUser);

            const token = await twitterTokenService.ensureValidToken('user123');
            expect(token).toBe('valid_token');
        });
    });
});
