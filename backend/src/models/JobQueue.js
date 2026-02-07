const mongoose = require('mongoose');

const jobQueueSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    partitionKey: {
        type: String, // Format: YYYY-MM-DDTHH:MM
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
    },
    lockedUntil: {
        type: Date, // For preventing multiple workers from picking up same job
    }
}, {
    timestamps: true,
});

// Index for the Dispatcher to quickly find due jobs
jobQueueSchema.index({ partitionKey: 1, status: 1 });
// Index for postId to find queue entries for a post (e.g. for cancellation or checking status)
jobQueueSchema.index({ postId: 1 });

const JobQueue = mongoose.model('JobQueue', jobQueueSchema);
module.exports = JobQueue;
