const twitterPublishService = require('../../src/services/twitterPublishService');
const twitterTokenService = require('../../src/services/twitterTokenService');
const axios = require('axios');

jest.mock('../../src/services/twitterTokenService');
jest.mock('axios');

describe('TwitterPublishService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should publish a tweet successfully', async () => {
        const mockUserId = 'user123';
        const mockContent = 'Hello Twitter!';
        const mockTweetId = 'tweet789';

        twitterTokenService.ensureValidToken.mockResolvedValue('valid-token');
        axios.post.mockResolvedValue({
            data: {
                data: {
                    id: mockTweetId
                }
            }
        });

        const result = await twitterPublishService.publishTweet(mockUserId, mockContent);

        expect(result).toBe(mockTweetId);
        expect(twitterTokenService.ensureValidToken).toHaveBeenCalledWith(mockUserId);
        expect(axios.post).toHaveBeenCalledWith(
            'https://api.twitter.com/2/tweets',
            { text: mockContent },
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer valid-token'
                })
            })
        );
    });

    it('should handle recoverable twitter errors', async () => {
        twitterTokenService.ensureValidToken.mockResolvedValue('valid-token');
        axios.post.mockRejectedValue({
            response: {
                status: 500,
                data: {
                    errors: [{ message: 'Internal Server Error', code: 999 }]
                }
            }
        });

        try {
            await twitterPublishService.publishTweet('u1', 'c1');
        } catch (error) {
            expect(error.message).toBe('Internal Server Error');
            expect(error.isRecoverable).toBe(true);
        }
    });

    it('should handle non-recoverable duplicate tweet error', async () => {
        twitterTokenService.ensureValidToken.mockResolvedValue('valid-token');
        axios.post.mockRejectedValue({
            response: {
                status: 403,
                data: {
                    errors: [{ message: 'Duplicate tweet', code: 187 }]
                }
            }
        });

        try {
            await twitterPublishService.publishTweet('u1', 'c1');
        } catch (error) {
            expect(error.message).toBe('Duplicate tweet');
            expect(error.isRecoverable).toBe(false);
        }
    });

    it('should handle unauthorized error as non-recoverable', async () => {
        twitterTokenService.ensureValidToken.mockResolvedValue('valid-token');
        axios.post.mockRejectedValue({
            response: {
                status: 401
            }
        });

        try {
            await twitterPublishService.publishTweet('u1', 'c1');
        } catch (error) {
            expect(error.message).toBe('Invalid or expired Twitter tokens');
            expect(error.isRecoverable).toBe(false);
        }
    });
});
