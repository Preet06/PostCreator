const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/securityMiddleware');
const { registerValidation, loginValidation } = require('../middleware/validator');

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:resettoken', authLimiter, resetPassword);

module.exports = router;
