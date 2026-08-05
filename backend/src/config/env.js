'use strict';

const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
];

const RECOMMENDED_ENV_VARS = [
  'EMAIL_USER',
  'EMAIL_PASS',
  'CLIENT_URL',
];

/**
 * Validates all required environment variables are set.
 * Warns on recommended variables that are missing.
 * Throws early on startup if any required vars are missing.
 */
function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[Config] Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file.'
    );
  }

  // JWT secret entropy check — must be at least 32 characters
  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32) {
    throw new Error(
      '[Config] JWT_SECRET must be at least 32 characters long. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
    );
  }

  // Warn (but do not crash) on missing recommended vars
  const missingRecommended = RECOMMENDED_ENV_VARS.filter((key) => !process.env[key]);
  if (missingRecommended.length > 0) {
    console.warn(
      `[Config] WARNING: Recommended env vars not set: ${missingRecommended.join(', ')}`
    );
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  isDev: process.env.NODE_ENV !== 'production',
  emailHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  emailPort: parseInt(process.env.EMAIL_PORT, 10) || 465,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  
  // Redis for rate-limiting (optional)
  redisUri: process.env.REDIS_URI,
};

module.exports = { validateEnv, env };
