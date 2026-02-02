const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        maxlength: 280,
    },
    variations: [{
        type: String,
        maxlength: 280,
    }],
    scheduledAt: {
        type: Date,
        // Optional for drafts, but required when status is 'scheduled'
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'published', 'failed'],
        default: 'draft',
    },
    twitterId: {
        type: String, // ID returned from Twitter after posting
    },
    error: {
        type: String, // Reason for failure if any
    }
}, {
    timestamps: true,
});

// Indexes for common queries
postSchema.index({ userId: 1, scheduledAt: 1 });
postSchema.index({ status: 1, scheduledAt: 1 });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
