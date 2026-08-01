'use strict';

const crypto = require('crypto');
const { sendError } = require('../utils/apiResponse');

/**
 * CSRF Protection Middleware (Double Submit Cookie pattern)
 * Validates that the X-CSRF-Token header matches the csrfToken cookie
 * on state-changing requests (POST, PUT, PATCH, DELETE).
 */
function csrfProtection(req, res, next) {
  // Only apply to mutating requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return sendError(res, { 
      statusCode: 403, 
      message: 'Invalid or missing CSRF token' 
    });
  }

  next();
}

/**
 * Generates a random CSRF token and sets it as a non-HttpOnly cookie.
 * (Non-HttpOnly is required so the frontend Axios client can read it
 * and attach it to the X-CSRF-Token header).
 */
function setCsrfCookie(req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  const isProduction = process.env.NODE_ENV === 'production';
  
  const isCrossSite = req.headers.origin && !req.headers.origin.includes('localhost') && !req.headers.origin.includes('127.0.0.1');
  res.cookie('csrfToken', token, {
    httpOnly: false, // Must be accessible to frontend
    secure: isCrossSite || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: isCrossSite ? 'none' : 'lax',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return token;
}

module.exports = {
  csrfProtection,
  setCsrfCookie
};
