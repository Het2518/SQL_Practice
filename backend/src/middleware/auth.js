'use strict';

const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware: Verifies the Bearer JWT in the Authorization header.
 * Attaches the authenticated user document to `req.user`.
 * Returns 401 if token is missing or invalid.
 */
async function protect(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return sendError(res, { statusCode: 401, message: 'Authentication required. Please log in.' });
    }

    const decoded = verifyToken(token); // Throws if expired or invalid

    const user = await User.findById(decoded.sub).select('-password');
    if (!user) {
      return sendError(res, { statusCode: 401, message: 'User not found. Token may be stale.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, { statusCode: 401, message: 'Session expired. Please log in again.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, { statusCode: 401, message: 'Invalid token. Please log in again.' });
    }
    next(err);
  }
}

async function attachUserIfPresent(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return next();

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub).select('-password');
    if (user) req.user = user;
    next();
  } catch (err) {
    next();
  }
}

module.exports = { protect, attachUserIfPresent };
