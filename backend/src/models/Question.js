'use strict';

const mongoose = require('mongoose');

const DIFFICULTY_LEVELS = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
const QUESTION_TYPES = ['Query Writing', 'Debugging', 'Output Prediction', 'Optimization'];

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
    },
    schemaName: {
      type: String,
      required: [true, 'Schema name is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: DIFFICULTY_LEVELS,
        message: `Difficulty must be one of: ${DIFFICULTY_LEVELS.join(', ')}`,
      },
    },
    questionType: {
      type: String,
      enum: QUESTION_TYPES,
      default: 'Query Writing',
    },
    estimatedTimeMinutes: {
      type: Number,
      default: 15,
      min: 1,
    },
    expectedApproach: String,
    commonMistakes: String,
    solutionSql: String,
    keywords: {
      type: [String],
      default: [],
    },
    // References to companies that ask this question
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
    ],
    // References to topics this question covers
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    
    // --- Advanced Community / Platform Features ---
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null if created by system admin
    },
    hints: {
      type: [String],
      default: [],
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    
    // --- Computed Stats ---
    totalAttempts: {
      type: Number,
      default: 0,
    },
    totalAccepted: {
      type: Number,
      default: 0,
    },
    acceptanceRate: {
      type: Number,
      default: 0, // Computed as (totalAccepted / totalAttempts) * 100
    },
    averageExecutionTimeMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search
questionSchema.index({ title: 'text', prompt: 'text', keywords: 'text' });
questionSchema.index({ difficulty: 1, schemaName: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
