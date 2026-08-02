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
const interviewRoutes = require('./src/routes/interviewRoutes');

const app = express();
app.set('trust proxy', 1);

// ── Request ID Middleware (for distributed tracing) ────────────────────────
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || require('crypto').randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// ── Security & Utility Middleware ──────────────────────────────────────────
app.use(helmet()); // Sets secure HTTP headers
// Explicit CORS allowlist — substring matching (e.g. .includes('vercel.app')) is a
// security vulnerability: any attacker deploying evil-app.vercel.app could bypass it.
const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  env.clientUrl,
].filter(Boolean));

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' })); // Parse JSON, limit payload size
app.use(cookieParser()); // Parse cookies
app.use(mongoSanitize()); // Sanitize request data against NoSQL injection
app.use(csrfProtection); // Protect against Cross-Site Request Forgery
// Log in dev with pretty format; log in production as JSON for log aggregators
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
app.use('/api', apiLimiter); // Rate limit all API routes

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/interviews', interviewRoutes);

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
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
