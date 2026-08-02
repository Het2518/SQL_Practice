'use strict';

const InterviewSession = require('../models/InterviewSession');
const Company = require('../models/Company');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Save an interview score
// @route   POST /api/interviews/score
// @access  Private
exports.saveScore = async (req, res, next) => {
  try {
    const { companyName, score, verdict, feedback, durationMinutes } = req.body;

    let companyId = null;
    if (companyName) {
      // Use $eq with case-insensitive collation to avoid ReDoS from regex on user input
      const company = await Company.findOne({ name: companyName }).collation({ locale: 'en', strength: 2 }).lean();
      if (company) companyId = company._id;
    }

    const session = await InterviewSession.create({
      userId: req.user._id,
      companyId,
      overallScore: score,
      verdict,
      aiFeedbackSummary: feedback,
      durationMinutes: durationMinutes || 0,
      status: 'completed',
      completedAt: new Date(),
    });

    return sendSuccess(res, { statusCode: 201, data: { session } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user interview history
// @route   GET /api/interviews/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

    // Consolidate 3 separate DB queries into a single aggregation pipeline
    const [sessions, [statsDoc]] = await Promise.all([
      InterviewSession.find({ userId: req.user._id, status: 'completed' })
        .populate('companyId', 'name logo')
        .sort('-createdAt')
        .limit(limit)
        .lean(),
      InterviewSession.aggregate([
        { $match: { userId: req.user._id, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalInterviews: { $sum: 1 },
            avgScore: { $avg: '$overallScore' },
          },
        },
      ]),
    ]);

    const totalInterviews = statsDoc?.totalInterviews ?? 0;
    const averageScore = statsDoc ? Math.round(statsDoc.avgScore) : 0;

    return sendSuccess(res, {
      data: {
        sessions,
        stats: { totalInterviews, averageScore },
      },
    });
  } catch (error) {
    next(error);
  }
};
