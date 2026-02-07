const twitterTokenService = require('../../src/services/twitterTokenService');
const User = require('../../src/models/User');
const axios = require('axios');

jest.mock('../../src/models/User');
jest.mock('axios');

describe('TwitterTokenService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isTokenExpired', () => {
        it('should return true if expiresAt is missing', () => {
            expect(twitterTokenService.isTokenExpired(null)).toBe(true);
        });

        it('should return true if token expires in less than 5 minutes', () => {
            const fiveMinutesFromNowShifted = new Date(Date.now() + 4 * 60 * 1000);
            expect(twitterTokenService.isTokenExpired(fiveMinutesFromNowShifted)).toBe(true);
        });

        it('should return false if token is valid for more than 5 minutes', () => {
            const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
            expect(twitterTokenService.isTokenExpired(tenMinutesFromNow)).toBe(false);
        });
    });

    describe('refreshTwitterToken', () => {
        it('should refresh token and update user', async () => {
            const mockUserId = 'user123';
            const mockUser = {
                _id: mockUserId,
                twitterTokens: {
                    refreshToken: 'old-refresh-token',
                    save: jest.fn()
                },
                save: jest.fn().mockResolvedValue(true)
            };

            User.findById.mockResolvedValue(mockUser);
            axios.post.mockResolvedValue({
                data: {
                    access_token: 'new-access-token',
                    refresh_token: 'new-refresh-token',
                    expires_in: 7200
                }
            });

            const result = await twitterTokenService.refreshTwitterToken(mockUserId);

            expect(result.accessToken).toBe('new-access-token');
            expect(mockUser.twitterTokens.accessToken).toBe('new-access-token');
            expect(mockUser.save).toHaveBeenCalled();
            expect(axios.post).toHaveBeenCalledWith(
                'https://api.twitter.com/2/oauth2/token',
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/x-www-form-urlencoded'
                    })
                })
            );
        });

        it('should throw error if user or refresh token is missing', async () => {
            User.findById.mockResolvedValue(null);
            await expect(twitterTokenService.refreshTwitterToken('invalid'))
                .rejects
                .toThrow('Failed to refresh Twitter token');
        });
    });

    describe('ensureValidToken', () => {
        it('should return existing token if not expired', async () => {
            const mockUserId = 'user123';
            const mockUser = {
                twitterTokens: {
                    accessToken: 'valid-token',
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000)
                }
            };
            User.findById.mockResolvedValue(mockUser);

            const token = await twitterTokenService.ensureValidToken(mockUserId);
            expect(token).toBe('valid-token');
            expect(axios.post).not.toHaveBeenCalled();
        });

        it('should refresh token if expired', async () => {
            const mockUserId = 'user123';
            const mockUser = {
                _id: mockUserId,
                twitterTokens: {
                    accessToken: 'expired-token',
                    refreshToken: 'refresh-token',
                    expiresAt: new Date(Date.now() - 1000)
                },
                save: jest.fn().mockResolvedValue(true)
            };
            User.findById.mockResolvedValue(mockUser);
            axios.post.mockResolvedValue({
                data: {
                    access_token: 'new-token',
                    expires_in: 3600
                }
            });

            const token = await twitterTokenService.ensureValidToken(mockUserId);
            expect(token).toBe('new-token');
            expect(axios.post).toHaveBeenCalled();
        });
    });
});
