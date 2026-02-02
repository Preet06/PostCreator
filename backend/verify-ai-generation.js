require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'ai_tester@example.com';

const verifyAIGeneration = async () => {
    try {
        console.log('--- AI Post Generation Verification ---');

        // 1. Connect to DB
        await connectDB();

        // 2. Find or Create Test User
        let user = await User.findOne({ email: TEST_EMAIL });
        if (!user) {
            user = await User.create({
                name: 'AI Tester',
                email: TEST_EMAIL,
                passwordHash: 'password123'
            });
        }

        // 3. Login to get Token (using fallback header support in middleware)
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('\n1. Requesting variations...');
        const testContent = "I'm building a project that uses Groq and Llama 3 for fast social media content generation.";

        const response = await axios.post(`${API_URL}/posts/generate`,
            { content: testContent },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
            console.log('AI Generation Successful!');
            console.log('\n--- Variations ---');
            console.log('Original:', response.data.data.original);
            console.log('Emoji:', response.data.data.emoji);
            console.log('Hashtag:', response.data.data.hashtag);
        } else {
            throw new Error('API returned failure status');
        }

        // 4. Test Saving a Post
        console.log('\n2. Saving selected variation...');
        const saveRes = await axios.post(`${API_URL}/posts`,
            { content: response.data.data.emoji, status: 'draft' },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (saveRes.data.success) {
            console.log('Post saved successfully to database.');
        }

    } catch (error) {
        console.error('\nVerification failed!');
        console.error(error.message);
        if (error.response) console.log(error.response.data);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
};

verifyAIGeneration();
