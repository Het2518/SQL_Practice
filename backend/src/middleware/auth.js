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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, { statusCode: 401, message: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
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

module.exports = { protect };
