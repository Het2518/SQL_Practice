'use strict';

const { env } = require('../config/env');

/**
 * Global error handling middleware.
 * Catches all errors passed via next(err).
 * Returns a clean JSON error response.
 * Never leaks stack traces or internal details in production.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error (e.g. unique email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join('. ');
  }

  // Mongoose cast error (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please log in again.';
  }

  // Always log 5xx errors server-side with request context
  if (statusCode >= 500) {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
      method: req.method,
      path: req.originalUrl,
      statusCode,
      error: err.message,
      stack: env.isDev ? err.stack : undefined,
    }));
    // Never expose internal server error details to clients
    if (!env.isDev) {
      message = 'An unexpected error occurred. Please try again later.';
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = { errorHandler };

