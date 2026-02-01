require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const API_URL = 'http://localhost:5000/api/auth';

const verifyAuthMiddleware = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for auth middleware test...');

        const testEmail = `auth_test_${Date.now()}@example.com`;
        const testPassword = 'Password123!';

        // 1. Create a user
        console.log('Step 1: Registering user...');
        const regResponse = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
                name: 'Auth Tester'
            })
        });
        const regData = await regResponse.json();

        if (!regResponse.ok) {
            throw new Error(`Registration failed: ${regData.message}`);
        }

        const token = regData.token;
        console.log('SUCCESS: User registered and token received.');

        // 2. Test /me without token
        console.log('Step 2: Testing /me without token...');
        const noTokenResponse = await fetch(`${API_URL}/me`);
        if (noTokenResponse.status === 401) {
            console.log('SUCCESS: /me failed with 401 (Unauthorized) as expected.');
        } else {
            throw new Error(`FAILED: /me should have failed with 401, but got ${noTokenResponse.status}`);
        }

        // 3. Test /me with invalid token
        console.log('Step 3: Testing /me with invalid token...');
        const invalidTokenResponse = await fetch(`${API_URL}/me`, {
            headers: { Authorization: 'Bearer invalid_token' }
        });
        if (invalidTokenResponse.status === 401) {
            console.log('SUCCESS: /me failed with 401 (Unauthorized) for invalid token.');
        } else {
            throw new Error(`FAILED: /me should have failed with 401, but got ${invalidTokenResponse.status}`);
        }

        // 4. Test /me with valid token
        console.log('Step 4: Testing /me with valid token...');
        const meResponse = await fetch(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const meData = await meResponse.json();

        if (meResponse.ok && meData.email === testEmail && !meData.passwordHash) {
            console.log('SUCCESS: /me returned correct user data and excluded passwordHash.');
        } else {
            throw new Error('FAILED: /me returned incorrect data or included passwordHash.');
        }

        // Clean up
        await User.deleteOne({ email: testEmail });
        console.log('Cleaned up test user.');

        console.log('\nALL AUTH MIDDLEWARE TESTS PASSED!');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error.message);
        // Attempt cleanup even on failure
        const User = require('./src/models/User');
        await User.deleteOne({ email: `auth_test_` }); // Note: this might not be exact but helps
        process.exit(1);
    }
};

// We need the server to be running.
console.log('NOTE: Ensure the server is running on http://localhost:5000 before running this test.');
verifyAuthMiddleware();
