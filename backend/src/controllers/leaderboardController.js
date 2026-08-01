'use strict';

const UserProgress = require('../models/UserProgress');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/leaderboard
 * Returns top 100 users sorted by maxStreak (then currentStreak).
 * Only exposes non-sensitive public fields.
 */
async function getLeaderboard(req, res, next) {
  try {
    const { limit = 100 } = req.query;

    const entries = await UserProgress.find({})
      .select('userId displayName totalXp currentStreak maxStreak badges')
      .sort({ maxStreak: -1, currentStreak: -1 })
      .limit(Math.min(parseInt(limit, 10), 200))
      .lean();

    const leaderboard = entries.map((entry, idx) => {
      // Compute XP score: Use totalXp now that completedQuestions is stored in Submissions
      const score = entry.totalXp || 0;
      const completed = Math.floor(score / 10);

      return {
        rank: idx + 1,
        userId: entry.userId,
        displayName: entry.displayName || 'Anonymous',
        completed,
        score,
        currentStreak: entry.currentStreak,
        maxStreak: entry.maxStreak,
        badges: entry.badges,
      };
    });

    return sendSuccess(res, { data: { leaderboard } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLeaderboard };
