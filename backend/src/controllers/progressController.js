'use strict';

const { body } = require('express-validator');
const UserProgress = require('../models/UserProgress');
const Submission = require('../models/Submission');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const mongoose = require('mongoose');

// ── Validation ─────────────────────────────────────────────────────────────
const updateProgressValidation = [
  body('questionId').notEmpty().withMessage('questionId is required'),
  body('status')
    .isIn(['complete', 'attempted'])
    .withMessage('status must be "complete" or "attempted"'),
];

const recordActivityValidation = [
  body('question').isObject().withMessage('question object is required'),
  body('question.id').notEmpty().withMessage('question.id is required'),
  body('sql').notEmpty().withMessage('sql query is required').isLength({ max: 50000 }).withMessage('SQL query too large'),
  body('status').optional().isString(),
  body('executionTimeMs').optional().isNumeric(),
];

// ── Controllers ────────────────────────────────────────────────────────────

/**
 * GET /api/progress
 * Returns the authenticated user's full progress document + aggregates from Submissions.
 */
async function getProgress(req, res, next) {
  try {
    let progress = await UserProgress.findOne({ userId: req.user._id }).lean();
    if (!progress) {
      progress = {
        totalXp: 0,
        eloRating: 1000,
        level: 1,
        rankTitle: 'Novice',
        currentStreak: 0,
        maxStreak: 0,
        lastPracticeDate: null,
        badges: [],
      };
    }

    // Aggregate completed questions from Submissions
    const completedRaw = await Submission.aggregate([
      { $match: { userId: req.user._id, status: 'Accepted' } },
      { $group: { _id: '$questionId' } }
    ]);
    const completedQuestions = {};
    completedRaw.forEach(q => { completedQuestions[q._id] = 'complete'; });

    // Activity heatmap (last 365 days only)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const activityRaw = await Submission.aggregate([
      { $match: { userId: req.user._id, createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);
    const activity = {};
    activityRaw.forEach(a => { activity[a._id] = a.count; });

    // Recent Submissions (Top 20)
    const recentSubmissions = await Submission.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Map recentSubmissions to the format the frontend expects
    const formattedRecentSubmissions = recentSubmissions.map(s => ({
      questionId: s.questionId,
      // Title is stored on the Submission model if provided, otherwise fall back to generic label
      title: s.questionTitle || `Question ${s.questionId}`,
      status: s.status === 'Accepted' ? 'complete' : 'attempted',
      timestamp: s.createdAt,
    }));

    return sendSuccess(res, {
      data: {
        completedQuestions,
        activity,
        currentStreak: progress.currentStreak,
        maxStreak: progress.maxStreak,
        lastPracticeDate: progress.lastPracticeDate,
        badges: progress.badges,
        totalXp: progress.totalXp,
        eloRating: progress.eloRating,
        level: progress.level,
        rankTitle: progress.rankTitle,
        recentSubmissions: formattedRecentSubmissions,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/progress/question
 * @deprecated Use POST /api/progress/activity instead.
 */
async function updateQuestionProgress(req, res) {
  res.status(410).json({
    success: false,
    message: 'This endpoint has been removed. Use POST /api/progress/activity.',
  });
}

/**
 * POST /api/progress/activity
 * Records a question attempt (Submission) and updates streaks, badges, and XP.
 */
async function recordActivity(req, res, next) {
  try {
    const { question, sql, status = 'Error', executionTimeMs = 0 } = req.body;
    const today = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
    const isAccepted = status === 'Accepted' || status === 'complete';
    const dbStatus = isAccepted ? 'Accepted' : 'Error';

    // 1. Create the Submission Record
    await Submission.create({
      userId: req.user._id,
      questionId: String(question.id),
      questionTitle: question.title || null, // Store title for profile activity feed
      sql,
      status: dbStatus,
      executionTimeMs,
      // Automatically set expiration to 30 days for failed queries to save space
      expiresAt: isAccepted ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // 2. Update gamification stats
    let doc = await UserProgress.findOne({ userId: req.user._id });
    if (!doc) {
      doc = new UserProgress({ userId: req.user._id });
    }
    
    // Ensure displayName is synced for leaderboard
    const currentName = req.user.name || req.user.displayName || req.user.username;
    if (doc.displayName !== currentName) {
      doc.displayName = currentName;
    }

    // Update streak
    if (doc.lastPracticeDate !== today) {
      if (!doc.lastPracticeDate) {
        doc.currentStreak = 1;
      } else {
        const lastDate = new Date(doc.lastPracticeDate);
        const todayDate = new Date(today);
        const diffDays = Math.round((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          doc.currentStreak += 1;
        } else if (diffDays > 1) {
          doc.currentStreak = 1;
        }
      }
      doc.lastPracticeDate = today;
      doc.maxStreak = Math.max(doc.maxStreak, doc.currentStreak);
    }

    if (isAccepted) {
      // Award XP based on question difficulty
      const difficulty = (req.body.question?.difficulty || 'easy').toLowerCase();
      const XP_MAP = { easy: 10, medium: 30, hard: 50 };
      const xpGain = XP_MAP[difficulty] ?? 10;
      doc.totalXp += xpGain;
      doc.eloRating += Math.round(xpGain / 2); // ELO scales with difficulty too
    }

    // Compute badges
    const badgeSet = new Set(doc.badges);
    if (isAccepted) badgeSet.add('first_query');
    if (doc.currentStreak >= 3) badgeSet.add('streak_3');
    if (doc.currentStreak >= 7) badgeSet.add('streak_7');
    doc.badges = Array.from(badgeSet);

    await doc.save();

    return sendSuccess(res, {
      message: 'Activity recorded',
      data: {
        currentStreak: doc.currentStreak,
        maxStreak: doc.maxStreak,
        lastPracticeDate: doc.lastPracticeDate,
        badges: doc.badges,
        totalXp: doc.totalXp,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/progress/reset
 */
async function resetProgress(req, res, next) {
  try {
    await UserProgress.findOneAndDelete({ userId: req.user._id });
    await Submission.deleteMany({ userId: req.user._id });

    return sendSuccess(res, { message: 'Progress reset successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProgress,
  updateQuestionProgress,
  recordActivity,
  resetProgress,
  updateProgressValidation,
  recordActivityValidation,
};
