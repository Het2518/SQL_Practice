'use strict';

const { Router } = require('express');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { activityLimiter } = require('../middleware/rateLimiter');
const {
  getProgress,
  updateQuestionProgress,
  recordActivity,
  resetProgress,
  updateProgressValidation,
  recordActivityValidation,
} = require('../controllers/progressController');

const router = Router();

// All progress routes require authentication
router.use(protect);

router.get('/', getProgress);
// Deprecated: kept for backward compatibility, returns no-op
router.patch('/question', updateProgressValidation, validate, updateQuestionProgress);
// Activity recording is rate-limited to prevent XP farming
router.post('/activity', activityLimiter, recordActivityValidation, validate, recordActivity);
router.delete('/reset', resetProgress);

module.exports = router;
