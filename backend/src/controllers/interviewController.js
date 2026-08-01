'use strict';

const InterviewSession = require('../models/InterviewSession');
const Company = require('../models/Company');

// @desc    Save an interview score
// @route   POST /api/interviews/score
// @access  Private
exports.saveScore = async (req, res, next) => {
  try {
    const { companyName, score, verdict, feedback, durationMinutes } = req.body;
    
    let companyId = null;
    if (companyName) {
      const company = await Company.findOne({ name: { $regex: new RegExp(`^${companyName}$`, 'i') } });
      if (company) {
        companyId = company._id;
      }
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

    res.status(201).json({
      success: true,
      data: { session }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user interview history
// @route   GET /api/interviews/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    
    const sessions = await InterviewSession.find({ userId: req.user._id, status: 'completed' })
      .populate('companyId', 'name logo')
      .sort('-createdAt')
      .limit(limit);

    // Calculate aggregated stats
    const totalInterviews = await InterviewSession.countDocuments({ userId: req.user._id, status: 'completed' });
    const stats = await InterviewSession.aggregate([
      { $match: { userId: req.user._id, status: 'completed' } },
      { 
        $group: { 
          _id: null, 
          avgScore: { $avg: '$overallScore' } 
        } 
      }
    ]);

    const averageScore = stats.length > 0 ? Math.round(stats[0].avgScore) : 0;

    res.status(200).json({
      success: true,
      data: { 
        sessions,
        stats: {
          totalInterviews,
          averageScore
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
