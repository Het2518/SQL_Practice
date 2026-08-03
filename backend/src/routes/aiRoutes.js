const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// All AI routes could potentially be rate-limited heavily here
router.post('/chat', aiController.chat);
router.post('/interview/generate', aiController.generateInterviewTask);
router.post('/interview/chat', aiController.chatInterview);
router.post('/interview/dry-run', aiController.dryRunInterview);
router.post('/interview/evaluate', aiController.evaluateInterview);

module.exports = router;
