'use strict';

const { body } = require('express-validator');
const UserProgress = require('../models/UserProgress');
const { sendSuccess, sendError } = require('../utils/apiResponse');

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
  body('dbName').notEmpty().withMessage('dbName is required'),
  body('status').optional().isString(),
];

// ── Helper: Convert Map → plain object for JSON serialization ──────────────
function mapToObject(map) {
  if (!map) return {};
  if (map instanceof Map) return Object.fromEntries(map);
  return map;
}

// ── Controllers ────────────────────────────────────────────────────────────

/**
 * GET /api/progress
 * Returns the authenticated user's full progress document.
 */
async function getProgress(req, res, next) {
  try {
    const progress = await UserProgress.findOne({ userId: req.user._id }).lean();

    if (!progress) {
      // No record yet — return defaults
      return sendSuccess(res, {
        data: {
          completedQuestions: {},
          activity: {},
          currentStreak: 0,
          maxStreak: 0,
          lastPracticeDate: null,
          badges: [],
          recentSubmissions: [],
        },
      });
    }

    return sendSuccess(res, {
      data: {
        completedQuestions: mapToObject(progress.completedQuestions),
        activity: mapToObject(progress.activity),
        currentStreak: progress.currentStreak,
        maxStreak: progress.maxStreak,
        lastPracticeDate: progress.lastPracticeDate,
        badges: progress.badges,
        recentSubmissions: progress.recentSubmissions,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/progress/question
 * Updates a single question's completion status for the authenticated user.
 */
async function updateQuestionProgress(req, res, next) {
  try {
    const { questionId, status } = req.body;

    const progress = await UserProgress.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { [`completedQuestions.${questionId}`]: status } },
      { new: true, upsert: true }
    ).lean();

    return sendSuccess(res, {
      message: 'Progress updated',
      data: { completedQuestions: mapToObject(progress.completedQuestions) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/progress/activity
 * Records a question attempt and updates streaks, badges, and recent submissions.
 */
async function recordActivity(req, res, next) {
  try {
    const { question, dbName, status = 'attempted' } = req.body;
    const today = new Date().toLocaleDateString('en-CA'); // 'YYYY-MM-DD'

    let doc = await UserProgress.findOne({ userId: req.user._id });
    if (!doc) {
      doc = new UserProgress({ userId: req.user._id });
    }

    // Update activity heatmap
    const currentCount = doc.activity.get(today) || 0;
    doc.activity.set(today, currentCount + 1);

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

    // Compute badges
    const badgeSet = new Set(doc.badges);
    if (doc.activity.get(today) >= 1) badgeSet.add('first_query');
    if (doc.currentStreak >= 3) badgeSet.add('streak_3');
    if (doc.currentStreak >= 7) badgeSet.add('streak_7');

    const totalSolved = Array.from(doc.completedQuestions.values()).filter(
      (s) => s === 'complete'
    ).length;
    if (totalSolved >= 10) badgeSet.add('solved_10');
    if (totalSolved >= 50) badgeSet.add('solved_50');
    doc.badges = Array.from(badgeSet);

    // Add recent submission
    if (question && dbName) {
      const sub = {
        questionId: String(question.id),
        title: question.title || (question.prompt || '').substring(0, 40) + '...',
        db: dbName,
        difficulty: question.difficulty,
        status,
        timestamp: new Date(),
      };
      doc.recentSubmissions.unshift(sub);
      if (doc.recentSubmissions.length > 20) {
        doc.recentSubmissions = doc.recentSubmissions.slice(0, 20);
      }
    }

    await doc.save();

    return sendSuccess(res, {
      message: 'Activity recorded',
      data: {
        currentStreak: doc.currentStreak,
        maxStreak: doc.maxStreak,
        lastPracticeDate: doc.lastPracticeDate,
        badges: doc.badges,
        activity: mapToObject(doc.activity),
        recentSubmissions: doc.recentSubmissions,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/progress/reset
 * Resets all user progress (for dev/testing or user account reset).
 */
async function resetProgress(req, res, next) {
  try {
    await UserProgress.findOneAndUpdate(
      { userId: req.user._id },
      {
        completedQuestions: new Map(),
        activity: new Map(),
        currentStreak: 0,
        maxStreak: 0,
        lastPracticeDate: null,
        badges: [],
        recentSubmissions: [],
      },
      { upsert: true }
    );

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
