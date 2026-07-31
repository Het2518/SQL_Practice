'use strict';

const { body } = require('express-validator');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const { signToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ── Validation Rules ───────────────────────────────────────────────────────
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Display name cannot exceed 50 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateNameValidation = [
  body('displayName')
    .trim()
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ max: 50 })
    .withMessage('Display name cannot exceed 50 characters'),
];

// ── Helper: Format user for client response ────────────────────────────────
function formatUser(user) {
  return {
    id: user._id,
    email: user.email,
    displayName: user.displayName || user.email.split('@')[0],
  };
}

// ── Controllers ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, password, displayName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, { statusCode: 409, message: 'An account with this email already exists.' });
    }

    const user = await User.create({ email, password, displayName });

    // Create an empty progress record for the new user
    await UserProgress.create({ userId: user._id, displayName: user.displayName });

    const token = signToken(user._id);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Account created successfully',
      data: { token, user: formatUser(user) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Explicitly select password (it has select: false on schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, { statusCode: 401, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, { statusCode: 401, message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    return sendSuccess(res, {
      message: 'Logged in successfully',
      data: { token, user: formatUser(user) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 */
async function getMe(req, res) {
  return sendSuccess(res, {
    data: { user: formatUser(req.user) },
  });
}

/**
 * PATCH /api/auth/me/name
 * Updates the authenticated user's display name.
 */
async function updateDisplayName(req, res, next) {
  try {
    const { displayName } = req.body;

    req.user.displayName = displayName;
    await req.user.save();

    // Also update the display name in UserProgress for leaderboard
    await UserProgress.findOneAndUpdate(
      { userId: req.user._id },
      { displayName },
      { upsert: true }
    );

    return sendSuccess(res, {
      message: 'Display name updated',
      data: { user: formatUser(req.user) },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateDisplayName,
  registerValidation,
  loginValidation,
  updateNameValidation,
};
