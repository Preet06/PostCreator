/**
 * Test script to verify Twitter token refresh functionality
 * 
 * This script:
 * 1. Finds a user with Twitter tokens
 * 2. Sets their token expiry to the past
 * 3. Instructs you to call the test endpoint
 * 4. The middleware should automatically refresh the token
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const testTokenRefresh = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find a user with Twitter tokens
        const user = await User.findOne({ 'twitterTokens.accessToken': { $exists: true } });

        if (!user) {
            console.log('❌ No user found with Twitter connection. Please connect Twitter first.');
            process.exit(1);
        }

        console.log(`\n📝 Found user: ${user.email}`);
        console.log(`Current token expiry: ${user.twitterTokens.expiresAt}`);

        // Set token to expired (1 minute ago)
        user.twitterTokens.expiresAt = new Date(Date.now() - 60 * 1000);
        await user.save();

        console.log(`✅ Token expiry set to past: ${user.twitterTokens.expiresAt}`);
        console.log(`\n🧪 TEST INSTRUCTIONS:`);
        console.log(`1. Make a request to: GET http://127.0.0.1:5000/api/twitter/test-auth`);
        console.log(`2. Include your authentication cookie`);
        console.log(`3. The middleware should automatically refresh the token`);
        console.log(`4. Check the backend logs for "Twitter tokens refreshed for user..."`);
        console.log(`5. Verify the response shows tokenValid: true`);
        console.log(`\n💡 You can use the browser (while logged in) or curl with cookies.`);
        console.log(`\nAfter testing, check the database to see the updated expiresAt timestamp.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

testTokenRefresh();
