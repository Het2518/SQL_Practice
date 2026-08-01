'use strict';

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN_SUCCESS',
        'LOGIN_FAILED',
        'PASSWORD_CHANGE',
        'ACCOUNT_LOCKED',
        'ACCOUNT_CREATED',
        'SESSION_REVOKED',
        'EMAIL_CHANGED',
      ],
      index: true,
    },
    ipAddress: {
      type: String,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Can store objects for more context
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index for Audit Logs (e.g. keep for 90 days)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
