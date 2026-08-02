'use strict';

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Tracks which users have voted to prevent stuffing
    votedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    downvotes: {
      type: Number,
      default: 0,
    },
    isAcceptedSolution: {
      type: Boolean,
      default: false,
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null, // If null, this is a top-level comment
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for sorting by upvotes then date
commentSchema.index({ questionId: 1, upvotes: -1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
