const path = require('path');
// Load environment variables from the backend folder
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const { initAppInsights } = require('../backend/src/config/appInsights');
initAppInsights();

const mongoose = require('mongoose');
const connectDB = require('../backend/src/config/db');
const Post = require('../backend/src/models/Post');
const JobQueue = require('../backend/src/models/JobQueue');
const twitterPublishService = require('../backend/src/services/twitterPublishService');
const logger = require('../backend/src/utils/logger');

const postId = process.argv[2];

if (!postId) {
    logger.error('Worker started without Post ID');
    process.exit(1);
}

/**
 * Worker: The Execution Engine.
 * Responsible for publishing a single post and handling its lifecycle.
 */
const { appInsights } = require('../backend/src/config/appInsights');

const runWorker = async () => {
    logger.info('Worker processing started', { postId });
    const startTime = Date.now();

    try {
        await connectDB();

        // 1. Fetch Post and Queue Entry
        const post = await Post.findById(postId);
        const job = await JobQueue.findOne({ postId: postId, status: 'processing' });

        if (!post || !job) {
            logger.error('Post or Job not found', { postId });
            process.exit(1);
        }

        // 2. Validate Post Status (Supports Live Edits/Cancellations)
        if (post.status !== 'scheduled') {
            logger.info('Post no longer scheduled. Skipping.', { postId, currentStatus: post.status });
            job.status = 'completed'; // Mark as done since we don't need to process it
            await job.save();
            return;
        }

        // 3. Attempt to publish
        try {
            const twitterId = await twitterPublishService.publishTweet(post.userId, post.content);

            // SUCCESS
            post.status = 'published';
            post.twitterId = twitterId;
            post.attempts += 1;
            post.lastAttempt = new Date();
            post.error = null;
            await post.save();

            job.status = 'completed';
            await job.save();

            // Track Success Metric
            if (appInsights && appInsights.defaultClient) {
                appInsights.defaultClient.trackMetric({ name: 'PostPublished', value: 1 });
            }

            logger.info('Post successfully published', { postId, twitterId });

        } catch (error) {
            logger.error('Publish failed', { postId, error: error.message, isRecoverable: error.isRecoverable });

            // FAILURE & RETRY LOGIC
            post.attempts += 1;
            post.lastAttempt = new Date();
            post.error = error.message;

            const maxAttempts = 3;

            if (error.isRecoverable && post.attempts < maxAttempts) {
                // Exponential Backoff: 10m, 20m, etc.
                const backoffMinutes = post.attempts * 10;
                const nextRun = new Date(Date.now() + backoffMinutes * 60 * 1000);
                const nextPartition = nextRun.toISOString().slice(0, 16);

                // Re-queue the job
                job.status = 'pending';
                job.partitionKey = nextPartition;
                job.lockedUntil = null;
                await job.save();

                await post.save();
                logger.info('Rescheduled post for retry', { postId, nextPartition });
            } else {
                // DEAD LETTER
                post.status = 'failed';
                await post.save();

                job.status = 'failed';
                await job.save();

                // Track Failure Metric
                if (appInsights && appInsights.defaultClient) {
                    appInsights.defaultClient.trackMetric({ name: 'PostFailed', value: 1 });
                }

                logger.error('Post failed permanently', { postId, attempts: post.attempts });
            }
        }

    } catch (error) {
        logger.error('Worker system error', { postId, error: error.message });
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

runWorker();
