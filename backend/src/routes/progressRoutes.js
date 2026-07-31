'use strict';

const { Router } = require('express');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
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
router.patch('/question', updateProgressValidation, validate, updateQuestionProgress);
router.post('/activity', recordActivityValidation, validate, recordActivity);
router.delete('/reset', resetProgress);

module.exports = router;
