'use strict';

const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { saveScore, getHistory } = require('../controllers/interviewController');

// All interview routes require authentication
router.use(protect);

router.post('/score', saveScore);
router.get('/history', getHistory);

module.exports = router;
