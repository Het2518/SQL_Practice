'use strict';

require('dotenv').config();

const { validateEnv, env } = require('./src/config/env');

// Validate all required env vars early — fail fast
validateEnv();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');

const { connectDB } = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const { csrfProtection } = require('./src/middleware/csrf');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const questionRoutes = require('./src/routes/questionRoutes');
const companyRoutes = require('./src/routes/companyRoutes');
const progressRoutes = require('./src/routes/progressRoutes');
const leaderboardRoutes = require('./src/routes/leaderboardRoutes');
const commentRoutes = require('./src/routes/commentRoutes');

const app = express();
app.set('trust proxy', 1);

// ── Security & Utility Middleware ──────────────────────────────────────────
app.use(helmet()); // Sets secure HTTP headers
app.use(
  cors({
    origin: [
      env.clientUrl,
      'http://localhost:5173',
      'https://sql-practice-sepia.vercel.app'
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' })); // Parse JSON, limit payload size
app.use(cookieParser()); // Parse cookies
app.use(mongoSanitize()); // Sanitize request data against NoSQL injection
app.use(csrfProtection); // Protect against Cross-Site Request Forgery
if (env.isDev) {
  app.use(morgan('dev')); // HTTP request logging in development
}
app.use('/api', apiLimiter); // Rate limit all API routes

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/comments', commentRoutes);

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'DataDesk API is running', env: env.nodeEnv });
});

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler (must be last) ───────────────────────────────────
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────────────────
async function startServer() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`[Server] DataDesk API running on port ${env.port} (${env.nodeEnv})`);
    console.log(`[Server] Health check: http://localhost:${env.port}/api/health`);
  });
}

startServer();

module.exports = app; // Export for testing
