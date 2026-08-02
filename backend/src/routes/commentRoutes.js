'use strict';

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect, attachUserIfPresent } = require('../middleware/auth');
const { upvoteLimiter } = require('../middleware/rateLimiter');

// Public endpoints (with optional user attachment for ownership flag)
router.get('/question/:questionId', attachUserIfPresent, commentController.getCommentsByQuestion);

// Protected endpoints
router.use(protect);
router.get('/user/me', commentController.getMyComments);
router.post('/', commentController.validateComment, commentController.createComment);
router.post('/:id/upvote', upvoteLimiter, commentController.upvoteComment);

module.exports = router;
