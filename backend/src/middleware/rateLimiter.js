'use strict';

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const redisClient = require('../config/redis');

// Helper to optionally inject the Redis store if the client is connected
const getStore = () => {
  if (redisClient) {
    return new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });
  }
  return undefined; // Falls back to express-rate-limit's default MemoryStore
};

/**
 * Strict rate limiter for auth endpoints (login, register, forgot-password).
 * 10 requests per 15 minutes per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  store: getStore(),
});

/**
 * General API rate limiter.
 * 200 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  store: getStore(),
});

/**
 * Strict limiter for activity recording to prevent XP farming.
 * 60 per 15 minutes — allows ~4/minute which is generous for legit use.
 */
const activityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions. Please slow down.',
  },
  store: getStore(),
});

/**
 * Limiter for upvoting to prevent abuse.
 * 30 upvotes per 15 minutes per IP.
 */
const upvoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many votes. Please slow down.',
  },
  store: getStore(),
});

/**
 * Comment creation limiter to reduce spam and flooding.
 * 20 comments per 15 minutes per IP.
 */
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many comments. Please slow down.',
  },
  store: getStore(),
});

module.exports = { authLimiter, apiLimiter, activityLimiter, upvoteLimiter, commentLimiter };
