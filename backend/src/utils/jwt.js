'use strict';

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Signs a JWT token for a given user ID.
 * @param {string} userId - The MongoDB user _id
 * @param {string} [expiresIn] - Token expiry (e.g. '15m', '7d'). Falls back to env default.
 * @returns {string} Signed JWT token
 */
function signToken(userId, expiresIn) {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: expiresIn || env.jwtExpiresIn,
  });
}

/**
 * Verifies a JWT token.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { signToken, verifyToken };
