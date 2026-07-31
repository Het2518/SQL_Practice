'use strict';

const { Router } = require('express');
const { getLeaderboard } = require('../controllers/leaderboardController');

const router = Router();

// Leaderboard is public (only exposes safe fields)
router.get('/', getLeaderboard);

module.exports = router;
