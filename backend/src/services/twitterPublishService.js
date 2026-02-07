const axios = require('axios');
const twitterTokenService = require('./twitterTokenService');

/**
 * Robust service for publishing tweets using Twitter API v2.
 * Handles token refresh and error extraction.
 */
const publishTweet = async (userId, content) => {
    try {
        // 1. Ensure user has a valid access token (refreshes if needed)
        const accessToken = await twitterTokenService.ensureValidToken(userId);

        // 2. Post the tweet
        const response = await axios.post(
            'https://api.twitter.com/2/tweets',
            { text: content },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        console.log(`[TwitterService] Tweet published for user ${userId}: ${response.data.data.id}`);
        return response.data.data.id;
    } catch (error) {
        console.error('[TwitterService] Publish Error:', error.response?.data || error.message);

        let errorMessage = 'Twitter API call failed';
        let isRecoverable = true;

        if (error.response?.data?.errors?.[0]) {
            const twitterError = error.response.data.errors[0];
            errorMessage = twitterError.message;

            // Some errors are not recoverable (e.g., unauthorized or duplicate tweet)
            const nonRecoverableCodes = [220, 187]; // 187 is duplicate tweet
            if (nonRecoverableCodes.includes(twitterError.code)) {
                isRecoverable = false;
                console.error(`[ALERT] Non-recoverable Twitter Error for user ${userId}: ${errorMessage}`);
            }
        } else if (error.response?.status === 401) {
            errorMessage = 'Invalid or expired Twitter tokens';
            isRecoverable = false;
            console.error(`[ALERT] Authentication Failure for user ${userId}: ${errorMessage}`);
        }

        const err = new Error(errorMessage);
        err.isRecoverable = isRecoverable;
        err.status = error.response?.status;
        throw err;
    }
};

module.exports = {
    publishTweet,
};
