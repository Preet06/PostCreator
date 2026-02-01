const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Optional for system-level events
    },
    action: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['success', 'failure', 'pending'],
        required: true,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
}, {
    timestamps: true,
});

// Index for efficient querying of user-specific logs and action history
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
