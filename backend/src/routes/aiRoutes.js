const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// All AI routes could potentially be rate-limited heavily here
router.post('/chat', aiController.chat);

module.exports = router;
