'use strict';

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Signs a JWT token for a given user ID.
 * @param {string} userId - The MongoDB user _id
 * @returns {string} Signed JWT token
 */
function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
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
