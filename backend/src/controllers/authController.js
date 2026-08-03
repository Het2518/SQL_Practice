'use strict';

const { body } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');
const { signToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

const generateCode = () => crypto.randomInt(100000, 999999).toString();

/**
 * Returns consistent cookie options based on the request context.
 * Extracted to avoid duplication across register, login, logout, and refresh.
 */
function getCookieOptions(req, overrides = {}) {
  const isCrossSite =
    req.headers.origin &&
    !req.headers.origin.includes('localhost') &&
    !req.headers.origin.includes('127.0.0.1');
  return {
    httpOnly: true,
    secure: isCrossSite || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: isCrossSite ? 'none' : 'lax',
    ...overrides,
  };
}

// ── Validation Rules ───────────────────────────────────────────────────────
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Display name cannot exceed 50 characters'),
];

const loginValidation = [
  body('identifier').notEmpty().withMessage('Email or Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updatePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
];

const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
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
    username: user.username,
    displayName: user.displayName || user.username,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

// ── Controllers ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, username, password, displayName } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return sendError(res, { statusCode: 409, message: 'An account with this email already exists.' });
      }
      return sendError(res, { statusCode: 409, message: 'This username is already taken.' });
    }

    const user = await User.create({ 
      email, 
      username,
      password, 
      displayName,
      isVerified: true, // Auto verify to bypass email entirely
    });

    // Create an empty progress record for the new user
    await UserProgress.create({ userId: user._id, displayName: user.displayName || user.username });
    
    await AuditLog.create({
      userId: user._id,
      action: 'ACCOUNT_CREATED',
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    const token = signToken(user._id, '15m'); // 15 mins
    const refreshStr = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await RefreshToken.create({
      userId: user._id,
      token: refreshStr,
      expiresAt,
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceInfo: req.headers['user-agent']
    });

    const cookieBase = getCookieOptions(req);
    res.cookie('token', token, { ...cookieBase, path: '/', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshStr, {
      ...cookieBase,
      path: '/api/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Account created successfully!',
      data: { 
        user: formatUser(user)
      },
    });
  } catch (err) {
    next(err);
  }
}

// Email Verification logic removed as per requirements.

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }] 
    }).select('+password');
    
    if (!user) {
      return sendError(res, { statusCode: 401, message: 'Invalid credentials.' });
    }

    if (user.accountStatus === 'suspended' || user.accountStatus === 'banned') {
      return sendError(res, { statusCode: 403, message: `Your account is ${user.accountStatus}.` });
    }

    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return sendError(res, { statusCode: 429, message: `Account locked. Try again in ${minutesLeft} minutes.` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      let auditAction = 'LOGIN_FAILED';
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 mins
        auditAction = 'ACCOUNT_LOCKED';
      }
      await user.save();
      await AuditLog.create({ userId: user._id, action: auditAction, ipAddress: req.ip });
      
      if (auditAction === 'ACCOUNT_LOCKED') {
        return sendError(res, { statusCode: 429, message: 'Too many failed attempts. Account locked for 15 minutes.' });
      }
      return sendError(res, { statusCode: 401, message: 'Invalid credentials.' });
    }

    // Success! Reset lockouts
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = Date.now();
    await user.save();

    await AuditLog.create({ userId: user._id, action: 'LOGIN_SUCCESS', ipAddress: req.ip });

    const token = signToken(user._id, '15m'); // 15 mins
    const refreshStr = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await RefreshToken.create({
      userId: user._id,
      token: refreshStr,
      expiresAt,
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceInfo: req.headers['user-agent']
    });

    const cookieBase = getCookieOptions(req);
    res.cookie('token', token, { ...cookieBase, path: '/', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshStr, {
      ...cookieBase,
      path: '/api/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, {
      message: 'Logged in successfully',
      data: { user: formatUser(user) },
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
      const emailResult = await sendPasswordResetEmail(user.email, user.resetPasswordCode);
      if (!emailResult.success) {
        return sendError(res, { statusCode: 500, message: `Failed to send email. SMTP Error: ${emailResult.error}` });
      }
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
 * POST /api/auth/logout
 * Clears the HttpOnly authentication cookie.
 */
async function logout(req, res) {
  const refreshStr = req.cookies?.refreshToken;
  if (refreshStr) {
    await RefreshToken.deleteOne({ token: refreshStr });
  }

  const cookieBase = getCookieOptions(req);
  res.cookie('token', '', { ...cookieBase, path: '/', expires: new Date(0) });
  res.cookie('refreshToken', '', {
    ...cookieBase,
    path: '/api/auth/refresh',
    expires: new Date(0),
  });
  return sendSuccess(res, { message: 'Logged out successfully' });
}

/**
 * POST /api/auth/refresh
 * Validates refreshToken and issues a new access token.
 */
async function refreshTokenEndpoint(req, res) {
  const refreshStr = req.cookies?.refreshToken;
  if (!refreshStr) {
    return sendError(res, { statusCode: 401, message: 'No refresh token provided.' });
  }

  const tokenDoc = await RefreshToken.findOne({ token: refreshStr }).populate('userId');
  if (!tokenDoc || tokenDoc.revoked) {
    return sendError(res, { statusCode: 401, message: 'Invalid refresh token.' });
  }

  if (new Date() > tokenDoc.expiresAt) {
    await RefreshToken.deleteOne({ _id: tokenDoc._id });
    return sendError(res, { statusCode: 401, message: 'Refresh token expired. Please log in.' });
  }

  const user = tokenDoc.userId;
  if (!user) {
    return sendError(res, { statusCode: 401, message: 'Invalid refresh token.' });
  }

  // Rotate: delete old refresh token and issue a brand-new one
  await RefreshToken.deleteOne({ _id: tokenDoc._id });
  const newRefreshStr = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    userId: user._id,
    token: newRefreshStr,
    expiresAt,
    ipAddress: req.ip || req.connection?.remoteAddress,
    deviceInfo: req.headers['user-agent'],
  });

  // Issue new access token (15 mins)
  const token = signToken(user._id, '15m');
  const cookieBase = getCookieOptions(req);
  res.cookie('token', token, { ...cookieBase, path: '/', maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', newRefreshStr, {
    ...cookieBase,
    path: '/api/auth/refresh',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, { message: 'Token refreshed successfully' });
}

/**
 * GET /api/auth/csrf
 * Issues a CSRF token to the client.
 */
async function getCsrfToken(req, res) {
  const { setCsrfCookie } = require('../middleware/csrf');
  const token = setCsrfCookie(req, res);
  return sendSuccess(res, { data: { csrfToken: token } });
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

    await UserProgress.findOneAndUpdate(
      { userId: req.user._id },
      { displayName: displayName || req.user.username },
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

/**
 * PATCH /api/auth/me/password
 * Updates the authenticated user's password.
 */
async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    // We need to re-fetch the user to get the password field which is select: false
    const user = await User.findById(req.user._id).select('+password');
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, { statusCode: 400, message: 'Incorrect current password.' });
    }

    user.password = newPassword;
    await user.save();
    
    await AuditLog.create({ userId: user._id, action: 'PASSWORD_CHANGE', ipAddress: req.ip });

    return sendSuccess(res, { message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  refreshTokenEndpoint,
  forgotPassword,
  resetPassword,
  getMe,
  getCsrfToken,
  updateDisplayName,
  updatePassword,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateNameValidation,
  updatePasswordValidation,
};
