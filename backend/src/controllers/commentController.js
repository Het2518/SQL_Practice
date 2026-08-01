'use strict';

const Comment = require('../models/Comment');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Validation middleware
const validateComment = [
  body('questionId').notEmpty().withMessage('questionId is required'),
  body('content')
    .notEmpty().withMessage('Content is required')
    .isLength({ max: 2000 }).withMessage('Comment cannot exceed 2000 characters')
];

/**
 * GET /api/comments/question/:questionId
 * Fetch all comments for a specific question
 */
async function getCommentsByQuestion(req, res, next) {
  try {
    const { questionId } = req.params;
    const comments = await Comment.find({ questionId })
      .populate('userId', 'displayName username avatarUrl')
      .sort({ upvotes: -1, createdAt: -1 })
      .lean();

    // Map to a frontend friendly structure
    const formattedComments = comments.map(c => ({
      id: c._id.toString(),
      user: c.userId?.displayName || c.userId?.username || 'Anonymous',
      avatar: c.userId?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.userId?._id || 'anon'}`,
      content: c.content,
      upvotes: c.upvotes,
      isAccepted: c.isAcceptedSolution,
      time: c.createdAt,
      isOwner: req.user ? c.userId?._id?.toString() === req.user._id.toString() : false
    }));

    return sendSuccess(res, { data: { comments: formattedComments } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/comments
 * Create a new comment
 */
async function createComment(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, { statusCode: 400, message: 'Validation failed', errors: errors.array() });
    }

    const { questionId, content } = req.body;

    const comment = await Comment.create({
      userId: req.user._id,
      questionId,
      content,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'displayName username avatarUrl')
      .lean();

    const formattedComment = {
      id: populatedComment._id.toString(),
      user: populatedComment.userId?.displayName || populatedComment.userId?.username || 'Anonymous',
      avatar: populatedComment.userId?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${populatedComment.userId?._id || 'anon'}`,
      content: populatedComment.content,
      upvotes: populatedComment.upvotes,
      isAccepted: populatedComment.isAcceptedSolution,
      time: populatedComment.createdAt,
      isOwner: true
    };

    return sendSuccess(res, { 
      statusCode: 201, 
      message: 'Comment posted successfully', 
      data: { comment: formattedComment } 
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/comments/:id/upvote
 * Upvote a comment
 */
async function upvoteComment(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
       return sendError(res, { statusCode: 400, message: 'Invalid comment ID' });
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!comment) {
      return sendError(res, { statusCode: 404, message: 'Comment not found' });
    }

    return sendSuccess(res, { data: { upvotes: comment.upvotes } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/comments/user/me
 * Fetch all comments made by the authenticated user
 */
async function getMyComments(req, res, next) {
  try {
    const comments = await Comment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, { data: { comments } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateComment,
  getCommentsByQuestion,
  createComment,
  upvoteComment,
  getMyComments
};
