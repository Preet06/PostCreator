require('dotenv').config();
const { initAppInsights } = require('./config/appInsights');
initAppInsights();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { globalLimiter } = require('./middleware/securityMiddleware');

const app = express();

// Security Middleware
app.use(helmet());
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(globalLimiter); // Rate limiting

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow both for compatibility
    credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Body parser with cap
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/twitter', require('./routes/twitterRoutes'));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

module.exports = app;
