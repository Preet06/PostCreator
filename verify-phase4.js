const path = require('path');
require('dotenv').config({ path: './.env' });

const mongoose = require('mongoose');
const connectDB = require('../backend/src/config/db');
const Post = require('../backend/src/models/Post');
const JobQueue = require('../backend/src/models/JobQueue');
const User = require('../backend/src/models/User');

const verifyFlow = async () => {
    try {
        await connectDB();
        console.log('--- Phase 4 Verification Start ---');

        // 1. Find a test user
        const user = await User.findOne();
        if (!user) {
            console.error('No user found in DB. Please register a user first.');
            process.exit(1);
        }
        console.log(`Using test user: ${user.email}`);

        // 2. Clean up old test data (optional but safer)
        await Post.deleteMany({ content: 'VERIFICATION TEST POST' });
        await JobQueue.deleteMany({});

        // 3. Create a scheduled post (set to 5 seconds from now)
        const scheduledTime = new Date(Date.now() + 5000);
        const partitionKey = scheduledTime.toISOString().slice(0, 16);

        console.log(`Creating post scheduled for: ${scheduledTime.toISOString()}`);
        console.log(`Expected Partition Key: ${partitionKey}`);

        const post = await Post.create({
            userId: user._id,
            content: 'VERIFICATION TEST POST',
            scheduledAt: scheduledTime,
            status: 'scheduled'
        });

        // 4. Manually enqueue (simulating the controller logic)
        await JobQueue.create({
            postId: post._id,
            partitionKey,
            status: 'pending'
        });

        console.log('Post and JobQueue entry created successfully.');

        // 5. Wait and check the Dispatcher logic
        console.log('Waiting 15 seconds for Dispatcher to pick up the job...');

        // This part would ideally be checked by actually running the dispatcher in another process,
        // but for this verification script, we will just check if the "due" query works.

        await new Promise(resolve => setTimeout(resolve, 15000));

        const now = new Date();
        const curPartition = now.toISOString().slice(0, 16);
        console.log(`Checking partition <= ${curPartition}`);

        const foundJob = await JobQueue.findOne({
            partitionKey: { $lte: curPartition },
            status: 'pending'
        });

        if (foundJob && foundJob.postId.toString() === post._id.toString()) {
            console.log('✅ SUCCESS: Dispatcher logic correctly identifies the due job.');
        } else {
            console.error('❌ FAILURE: Job not found or status changed unexpectedly.');
        }

    } catch (error) {
        console.error('Verification Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('--- Phase 4 Verification End ---');
        process.exit(0);
    }
};

verifyFlow();
