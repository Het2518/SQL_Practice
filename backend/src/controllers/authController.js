'use strict';

const { body } = require('express-validator');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const { signToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

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

const verifyEmailValidation = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
];

const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
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

    const verificationCode = generateCode();
    const verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    const user = await User.create({ 
      email, 
      password, 
      displayName,
      verificationCode,
      verificationCodeExpires
    });

    // Create an empty progress record for the new user
    await UserProgress.create({ userId: user._id, displayName: user.displayName });

    // Send email asynchronously but await so it doesn't get killed
    await sendVerificationEmail(user.email, verificationCode);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Account created. Please verify your email with the 6-digit code sent to you.',
      data: { email: user.email }, // Do not return token yet
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/verify-email
 */
async function verifyEmail(req, res, next) {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return sendError(res, { statusCode: 400, message: 'User not found.' });
    if (user.isVerified) return sendError(res, { statusCode: 400, message: 'User already verified.' });
    if (user.verificationCode !== code) return sendError(res, { statusCode: 400, message: 'Invalid verification code.' });
    if (user.verificationCodeExpires < Date.now()) return sendError(res, { statusCode: 400, message: 'Verification code has expired.' });

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    return sendSuccess(res, {
      message: 'Email verified successfully',
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

    // Explicitly select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, { statusCode: 401, message: 'No account found with this email. Please sign up.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, { statusCode: 401, message: 'Incorrect password.' });
    }

    // Check if verified
    if (!user.isVerified) {
      user.verificationCode = generateCode();
      user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
      await user.save();
      await sendVerificationEmail(user.email, user.verificationCode);
      return sendError(res, { 
        statusCode: 403, 
        message: 'Account not verified. A new 6-digit code has been sent to your email.',
        code: 'NOT_VERIFIED'
      });
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
 * POST /api/auth/forgot-password
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      user.resetPasswordCode = generateCode();
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
      await user.save();
      await sendPasswordResetEmail(user.email, user.resetPasswordCode);
    }

    // Always return success even if user not found (security best practice)
    return sendSuccess(res, { message: 'If an account exists, a password reset email has been sent.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/reset-password
 */
async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) return sendError(res, { statusCode: 400, message: 'Invalid request.' });
    if (user.resetPasswordCode !== code) return sendError(res, { statusCode: 400, message: 'Invalid reset code.' });
    if (user.resetPasswordExpires < Date.now()) return sendError(res, { statusCode: 400, message: 'Reset code has expired.' });

    // The pre-save hook will hash the new password
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return sendSuccess(res, { message: 'Password reset successfully. You can now log in.' });
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
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateDisplayName,
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateNameValidation,
};
