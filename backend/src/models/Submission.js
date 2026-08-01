'use strict';

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionId: {
      type: String, // String because we use string IDs from our static data right now
      required: true,
      index: true,
    },
    sql: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Error', 'Time Limit Exceeded'],
      required: true,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    memoryBytes: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    // Used for TTL Archiving of failed queries. 
    // Set to Date.now() + 30 days for failed queries. Null for accepted/bookmarked.
    expiresAt: {
      type: Date,
      default: null, 
    }
  },
  {
    timestamps: true,
  }
);

// Compound index for fast cursor pagination of a user's submissions for a question
submissionSchema.index({ userId: 1, questionId: 1, createdAt: -1 });

// TTL Index: Automatically drops documents when the current time >= expiresAt
// If expiresAt is null, the document is kept forever.
submissionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
