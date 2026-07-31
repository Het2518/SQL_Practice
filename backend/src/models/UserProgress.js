'use strict';

const mongoose = require('mongoose');

// Sub-schema for recent submissions
const submissionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    title: String,
    db: String,
    difficulty: String,
    status: { type: String, enum: ['complete', 'attempted'], default: 'attempted' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false } // No separate _id for sub-documents
);

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    // Map of questionId → status ('complete' | 'attempted')
    completedQuestions: {
      type: Map,
      of: String,
      default: new Map(),
    },
    // Activity heatmap: date string → count of questions solved
    activity: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    currentStreak: { type: Number, default: 0, min: 0 },
    maxStreak: { type: Number, default: 0, min: 0 },
    lastPracticeDate: { type: String, default: null }, // 'YYYY-MM-DD'
    badges: {
      type: [String],
      default: [],
    },
    recentSubmissions: {
      type: [submissionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ── Leaderboard index: score is computed, so we index on maxStreak ─────────
userProgressSchema.index({ maxStreak: -1, currentStreak: -1 });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

module.exports = UserProgress;
