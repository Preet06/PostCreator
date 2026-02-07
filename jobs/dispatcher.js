const path = require('path');
// Load environment variables from the backend folder
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const { initAppInsights } = require('../backend/src/config/appInsights');
initAppInsights();

const mongoose = require('mongoose');
const connectDB = require('../backend/src/config/db');
const JobQueue = require('../backend/src/models/JobQueue');
const { spawn } = require('child_process');
const logger = require('../backend/src/utils/logger');

/**
 * Dispatcher: The High-Resolution Scheduler.
 * Runs at frequent intervals to pick up due jobs from the partitioned queue.
 */
const dispatchJobs = async () => {
    logger.info('Dispatcher wake up');

    try {
        const now = new Date();
        const currentPartition = now.toISOString().slice(0, 16);

        const jobs = await JobQueue.find({
            partitionKey: { $lte: currentPartition },
            status: 'pending'
        }).limit(20);

        if (jobs.length > 0) {
            logger.info(`Found ${jobs.length} jobs to dispatch.`);
        }

        for (const job of jobs) {
            job.status = 'processing';
            job.lockedUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 min lock
            await job.save();

            const worker = spawn('node', [path.join(__dirname, 'worker.js'), job.postId.toString()], {
                detached: true,
                stdio: 'ignore'
            });

            worker.unref();
            logger.info('Dispatched worker', { postId: job.postId });
        }

    } catch (error) {
        logger.error('Dispatcher error', { error: error.message });
    }
};

/**
 * Main Loop: Runs every 10 seconds
 */
const startDispatcher = async () => {
    await connectDB();
    logger.info('Dispatcher connected to DB. Starting loop...');

    // Run immediately on start
    await dispatchJobs();

    // Then run every 10 seconds
    setInterval(dispatchJobs, 10000);
};

startDispatcher();
