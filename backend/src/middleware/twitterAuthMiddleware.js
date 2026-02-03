const { ensureValidToken } = require('../services/twitterTokenService');

/**
 * Middleware to ensure user has a valid Twitter access token
 * Automatically refreshes token if expired
 * Attaches valid access token to req.twitterAccessToken
 */
const ensureTwitterAuth = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Check if user has connected Twitter
        if (!req.user.twitterTokens || !req.user.twitterTokens.accessToken) {
            return res.status(403).json({
                message: 'Twitter account not connected. Please connect your Twitter account first.',
                action: 'connect_twitter'
            });
        }

        // Ensure token is valid (will refresh if needed)
        const accessToken = await ensureValidToken(req.user._id);

        // Attach token to request for use in controllers
        req.twitterAccessToken = accessToken;

        next();
    } catch (error) {
        console.error('Twitter auth middleware error:', error.message);

        if (error.message.includes('not connected')) {
            return res.status(403).json({
                message: 'Twitter account not connected',
                action: 'connect_twitter'
            });
        }

        if (error.message.includes('refresh')) {
            return res.status(401).json({
                message: 'Failed to refresh Twitter token. Please reconnect your Twitter account.',
                action: 'reconnect_twitter'
            });
        }

        res.status(500).json({ message: 'Twitter authentication error' });
    }
};

module.exports = { ensureTwitterAuth };
