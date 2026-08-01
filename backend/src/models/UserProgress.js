'use strict';

const mongoose = require('mongoose');

// The Submission model now handles raw query history.
// UserProgress acts as a gamification and aggregate caching layer.

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
    totalXp: { type: Number, default: 0 },
    eloRating: { type: Number, default: 1000 }, // ELO matchmaking rating
    level: { type: Number, default: 1 },
    rankTitle: { type: String, default: 'Novice' },
    
    currentStreak: { type: Number, default: 0, min: 0 },
    maxStreak: { type: Number, default: 0, min: 0 },
    lastPracticeDate: { type: String, default: null }, // 'YYYY-MM-DD'
    badges: {
      type: [String],
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
