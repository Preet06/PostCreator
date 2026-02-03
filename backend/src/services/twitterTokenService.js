const axios = require('axios');
const User = require('../models/User');

/**
 * Check if a token is expired or expiring soon (within 5 minutes)
 * @param {Date} expiresAt - Token expiration timestamp
 * @returns {boolean} - True if token is expired or expiring soon
 */
const isTokenExpired = (expiresAt) => {
    if (!expiresAt) return true;
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return new Date(expiresAt).getTime() - Date.now() < bufferTime;
};

/**
 * Refresh Twitter OAuth tokens using the refresh token
 * @param {string} userId - User ID
 * @returns {Object} - New access token, refresh token, and expiry
 */
const refreshTwitterToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user || !user.twitterTokens || !user.twitterTokens.refreshToken) {
            throw new Error('No refresh token available');
        }

        const refreshToken = user.twitterTokens.refreshToken;

        // Call Twitter's token refresh endpoint
        const tokenResponse = await axios.post(
            'https://api.twitter.com/2/oauth2/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: process.env.TWITTER_CLIENT_ID,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
                },
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // Update user's tokens in database
        user.twitterTokens.accessToken = access_token;
        user.twitterTokens.refreshToken = refresh_token || refreshToken; // Twitter may not return new refresh token
        user.twitterTokens.expiresAt = new Date(Date.now() + expires_in * 1000);

        await user.save();

        console.log(`Twitter tokens refreshed for user ${userId}`);

        return {
            accessToken: access_token,
            refreshToken: refresh_token || refreshToken,
            expiresAt: user.twitterTokens.expiresAt
        };
    } catch (error) {
        console.error('Token refresh error:', error.response?.data || error.message);
        throw new Error('Failed to refresh Twitter token');
    }
};

/**
 * Ensure user has a valid Twitter access token, refreshing if necessary
 * @param {string} userId - User ID
 * @returns {string} - Valid access token
 */
const ensureValidToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user || !user.twitterTokens || !user.twitterTokens.accessToken) {
            throw new Error('User has not connected Twitter account');
        }

        // Check if token is expired or expiring soon
        if (isTokenExpired(user.twitterTokens.expiresAt)) {
            console.log(`Token expired for user ${userId}, refreshing...`);
            const refreshed = await refreshTwitterToken(userId);
            return refreshed.accessToken;
        }

        return user.twitterTokens.accessToken;
    } catch (error) {
        console.error('ensureValidToken error:', error.message);
        throw error;
    }
};

module.exports = {
    isTokenExpired,
    refreshTwitterToken,
    ensureValidToken
};
