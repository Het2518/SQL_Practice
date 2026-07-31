'use strict';

const { Router } = require('express');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register,
  login,
  getMe,
  updateDisplayName,
  registerValidation,
  loginValidation,
  updateNameValidation,
} = require('../controllers/authController');

const router = Router();

// Public routes (rate-limited for brute-force protection)
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);

// Protected routes (require valid JWT)
router.get('/me', protect, getMe);
router.patch('/me/name', protect, updateNameValidation, validate, updateDisplayName);

module.exports = router;
