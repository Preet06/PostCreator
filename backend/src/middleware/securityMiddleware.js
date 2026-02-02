const rateLimit = require('express-rate-limit');

// 1. Global Rate Limiter: 100 requests per 15 minutes
exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// 2. Auth Rate Limiter: 5 attempts per 10 minutes (for Login/Register)
exports.authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { message: 'Too many authentication attempts, please try again after 10 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. AI Generation Rate Limiter: 10 variations per hour
exports.aiGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { message: 'AI generation limit reached for this hour' },
    standardHeaders: true,
    legacyHeaders: false,
});
