require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const testLoginLogic = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB for login test...');

        const testEmail = `login_test_${Date.now()}@example.com`;
        const testPassword = 'Password123!';

        // 1. Create a user manually to test login against
        const user = new User({
            email: testEmail,
            passwordHash: testPassword,
            name: 'Login Tester'
        });
        await user.save();
        console.log('Test user created.');

        // 2. Verify password comparison (direct model test)
        const savedUser = await User.findOne({ email: testEmail });
        const isMatch = await savedUser.comparePassword(testPassword);
        const isNotMatch = await savedUser.comparePassword('WrongPass!');

        if (isMatch && !isNotMatch) {
            console.log('SUCCESS: Password verification logic works.');
        } else {
            throw new Error('FAILED: Password verification logic failed.');
        }

        // Clean up
        await User.deleteOne({ _id: savedUser._id });
        console.log('Cleaned up test user.');

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error.message);
        process.exit(1);
    }
};

testLoginLogic();
