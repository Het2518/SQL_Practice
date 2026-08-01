'use strict';

const mongoose = require('mongoose');

const roundScoreSchema = new mongoose.Schema(
  {
    round: { type: Number, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    questionId: String,
    feedback: String,
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    roundScores: {
      type: [roundScoreSchema],
      default: [],
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    verdict: {
      type: String,
      enum: ['Strong Hire', 'Hire', 'Borderline', 'No Hire'],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress',
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    aiFeedbackSummary: {
      type: String, // Detailed generated text review
    },
  },
  {
    timestamps: true,
  }
);

interviewSessionSchema.index({ userId: 1, createdAt: -1 });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

module.exports = InterviewSession;
