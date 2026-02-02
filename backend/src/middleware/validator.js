const { body, validationResult } = require('express-validator');

// Generic helper to handle validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    }
    next();
};

// 1. Auth Validations
exports.registerValidation = [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6 or more characters'),
    validate
];

exports.loginValidation = [
    body('email').isEmail().withMessage('Please include a valid email').normalizeEmail(),
    body('password').exists().withMessage('Password is required'),
    validate
];

// 2. Post Validations
exports.createPostValidation = [
    body('content').notEmpty().withMessage('Content is required').isLength({ max: 280 }).withMessage('Content cannot exceed 280 characters'),
    body('status').optional().isIn(['draft', 'scheduled']).withMessage('Invalid status'),
    body('scheduledAt').optional().isISO8601().withMessage('Invalid date format'),
    validate
];

exports.generateValidation = [
    body('content').notEmpty().withMessage('Content is required').isLength({ max: 500 }).withMessage('Base content is too long'),
    validate
];
