require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const testRegistrationLogic = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for registration test...');

        const testEmail = `testuser_${Date.now()}@example.com`;
        const testPassword = 'Password123!';

        // Create user
        const user = new User({
            email: testEmail,
            passwordHash: testPassword,
            name: 'Test User'
        });

        await user.save();
        console.log('User created successfully.');

        // Verify hashing
        const savedUser = await User.findOne({ email: testEmail });
        console.log('Checking saved password hashing...');

        if (savedUser.passwordHash === testPassword) {
            throw new Error('FAILED: Password was saved in plain text!');
        }
        console.log('SUCCESS: Password is hashed.');

        // Verify comparison
        const isMatch = await savedUser.comparePassword(testPassword);
        if (!isMatch) {
            throw new Error('FAILED: comparePassword method returned false for correct password!');
        }
        console.log('SUCCESS: comparePassword verified.');

        // Clean up
        await User.deleteOne({ _id: savedUser._id });
        console.log('Cleaned up test user.');

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    }
};

testRegistrationLogic();
