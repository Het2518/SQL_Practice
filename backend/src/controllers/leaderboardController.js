'use strict';

const UserProgress = require('../models/UserProgress');
const Submission = require('../models/Submission');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * GET /api/leaderboard
 * Returns top users sorted by totalXp.
 * Uses real submission count for accuracy.
 */
async function getLeaderboard(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);

    const entries = await UserProgress.find({})
      .select('userId displayName totalXp currentStreak maxStreak badges')
      .sort({ totalXp: -1, maxStreak: -1 })
      .limit(limit)
      .lean();

    // Aggregate real completed question counts per user in one query
    const userIds = entries.map(e => e.userId);
    const completedCounts = await Submission.aggregate([
      { $match: { userId: { $in: userIds }, status: 'Accepted' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(completedCounts.map(c => [String(c._id), c.count]));

    const leaderboard = entries.map((entry, idx) => ({
      rank: idx + 1,
      userId: entry.userId,
      displayName: entry.displayName || 'Anonymous',
      completed: countMap.get(String(entry.userId)) || 0,
      score: entry.totalXp || 0,
      currentStreak: entry.currentStreak,
      maxStreak: entry.maxStreak,
      badges: entry.badges,
    }));

    return sendSuccess(res, { data: { leaderboard } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLeaderboard };
