const express = require('express');
const router = express.Router();
const { getTwitterAuthUrl, twitterCallback, disconnectTwitter } = require('../controllers/twitterController');
const { protect } = require('../middleware/authMiddleware');
const { ensureTwitterAuth } = require('../middleware/twitterAuthMiddleware');

router.get('/connect', protect, getTwitterAuthUrl);
router.get('/callback', protect, twitterCallback);
router.post('/disconnect', protect, disconnectTwitter);

// Test endpoint to verify token refresh works
router.get('/test-auth', protect, ensureTwitterAuth, (req, res) => {
    res.json({
        message: 'Twitter authentication successful',
        tokenValid: true,
        accessToken: req.twitterAccessToken.substring(0, 20) + '...' // Show partial token for verification
    });
});

module.exports = router;
