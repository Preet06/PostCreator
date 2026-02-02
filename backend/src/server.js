require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { globalLimiter } = require('./middleware/securityMiddleware');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Security Middleware
app.use(helmet());
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(globalLimiter); // Rate limiting

app.use(cors({
    origin: 'http://localhost:5173', // Vite default
    credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Body parser with cap
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
