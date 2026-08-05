'use strict';

const Redis = require('ioredis');
const { env } = require('./env');

let redisClient = null;

if (env.redisUri) {
  redisClient = new Redis(env.redisUri, {
    // Retry strategy to gracefully handle temporary connection drops
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      if (times > 5) {
        console.error(`[Redis] Failed to connect after ${times} attempts. Falling back to memory store for rate limiting.`);
        // Returning null stops retrying
        return null;
      }
      return delay;
    },
    maxRetriesPerRequest: 1, // Don't hang requests infinitely
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected successfully.');
  });

  redisClient.on('error', (err) => {
    console.error(`[Redis] Connection error: ${err.message}`);
  });
} else {
  console.log('[Redis] REDIS_URI not provided. Redis client disabled.');
}

module.exports = redisClient;
