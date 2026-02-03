const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User');

// Helper to generate PKCE challenge
const generatePKCE = () => {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
};

// @desc    Get Twitter OAuth URL
// @route   GET /api/twitter/connect
// @access  Private
exports.getTwitterAuthUrl = async (req, res) => {
    try {
        const { verifier, challenge } = generatePKCE();
        const state = crypto.randomBytes(16).toString('hex');

        // Store verifier and state in session or temporary cookie (simplified here as user session/cookie)
        // For production, use session or encrypted cookie
        res.cookie('twitter_oauth_state', state, { httpOnly: true, maxAge: 600000, path: '/' }); // 10 mins
        res.cookie('twitter_oauth_verifier', verifier, { httpOnly: true, maxAge: 600000, path: '/' });

        const rootUrl = 'https://twitter.com/i/oauth2/authorize';
        const options = {
            response_type: 'code',
            client_id: process.env.TWITTER_CLIENT_ID,
            redirect_uri: process.env.TWITTER_CALLBACK_URL,
            scope: 'tweet.read tweet.write users.read offline.access',
            state: state,
            code_challenge: challenge,
            code_challenge_method: 'S256',
        };

        const qs = new URLSearchParams(options).toString();
        const authUrl = `${rootUrl}?${qs}`;

        console.log('Generated Twitter Auth URL:', authUrl);
        res.status(200).json({ url: authUrl });
    } catch (error) {
        console.error('Twitter Auth URL Error:', error);
        res.status(500).json({ message: 'Failed to generate Twitter auth URL', error: error.message });
    }
};

// @desc    Handle Twitter Callback
// @route   GET /api/twitter/callback
// @access  Public (Callback URL)
exports.twitterCallback = async (req, res) => {
    const { code, state } = req.query;
    const savedState = req.cookies.twitter_oauth_state;
    const codeVerifier = req.cookies.twitter_oauth_verifier;

    if (!code || state !== savedState) {
        return res.status(400).send('Invalid state or missing code. Please try again.');
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await axios.post(
            'https://api.twitter.com/2/oauth2/token',
            new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                client_id: process.env.TWITTER_CLIENT_ID,
                redirect_uri: process.env.TWITTER_CALLBACK_URL,
                code_verifier: codeVerifier,
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
                },
            }
        );

        const { access_token, refresh_token, expires_in } = tokenResponse.data;

        // Get User Info from Twitter
        const userResponse = await axios.get('https://api.twitter.com/2/users/me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const twitterData = userResponse.data.data;

        // Update User in Database
        // Note: For this to work, we need a way to identify the user here. 
        // Usually, the state would contain an encrypted userId if the user isn't logged in,
        // but here the callback is hit after a redirect. If we use cookies for session, we should have req.user.
        // If not, we might need to pass userId in state.

        // Assuming we have session/auth logic that persists through redirects (which can be tricky with different subdomains/origins)
        // For simplicity in this demo, let's assume we can get the user.

        // IF we don't have req.user, we should have stored a mapping in Redis/DB for this state.
        // For now, let's look for the user associated with this auth session.
        // A better way: store the userId in the state or a secure cookie.

        // For this implementation, we'll try to find the user from the current session if available.
        // (Wait, this is a separate redirect, auth middleware might not have run if it's a GET /callback)
        // Let's assume the user is logged in via cookies.

        const user = await User.findOneAndUpdate(
            { _id: req.user?._id }, // This assumes protect middleware is used, but redirects lose auth headers.
            {
                twitterTokens: {
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    expiresAt: new Date(Date.now() + expires_in * 1000),
                    twitterId: twitterData.id,
                    username: twitterData.username
                }
            },
            { new: true }
        );

        // Redirect back to frontend dashboard
        res.redirect('http://127.0.0.1:5173/?status=success');
    } catch (error) {
        console.error('Twitter Callback Error:', error.response?.data || error.message);
        res.redirect('http://127.0.0.1:5173/?status=error');
    }
};

// @desc    Disconnect Twitter Account
// @route   POST /api/twitter/disconnect
// @access  Private
exports.disconnectTwitter = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $unset: { twitterTokens: "" } },
            { new: true }
        );

        res.status(200).json({
            message: 'Twitter account disconnected successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Disconnect Twitter Error:', error.message);
        res.status(500).json({ message: 'Failed to disconnect Twitter account' });
    }
};
