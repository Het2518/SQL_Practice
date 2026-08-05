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
const crypto = require('crypto');

const { connectDB, disconnectDB } = require('./src/config/db');
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
// Trust first proxy (e.g., Vercel, Heroku, Nginx) for rate-limiting IP resolution.
// SECURITY NOTE: If the Node server is directly exposed to the internet (no reverse proxy),
// this must be disabled or configured with specific trusted IP ranges to prevent IP spoofing.
app.set('trust proxy', 1);

// ── Request ID Middleware (for distributed tracing) ─────────────────────────
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((u) => u.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const STATIC_ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
  'https://datadesk-sql.vercel.app',
  ...clientUrls,
]);

function isOriginAllowed(origin) {
  if (!origin) return true; // Allow non-browser requests (curl, server-to-server, health checks)
  const normalized = origin.trim().replace(/\/+$/, '');
  if (STATIC_ALLOWED_ORIGINS.has(normalized)) return true;

  try {
    const url = new URL(normalized);
    // Allow all Vercel deployments for datadesk
    if (url.hostname.endsWith('.vercel.app') && (url.hostname.startsWith('datadesk') || url.hostname === 'datadesk-sql.vercel.app')) {
      return true;
    }
    // Allow localhost on any port
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

// ── Security Headers ─────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://datadesk-sql.vercel.app', ...clientUrls].filter(Boolean),
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: env.isDev ? false : { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Request-ID',
      'Cache-Control',
      'Pragma',
    ],
    exposedHeaders: ['X-Request-ID', 'X-CSRF-Token'],
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // NoSQL injection prevention
app.use(csrfProtection);

// Access logging: pretty in dev, structured in production
if (env.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use('/api', apiLimiter);

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/interviews', interviewRoutes);


// ── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler (must be last middleware) ───────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
async function startServer() {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(JSON.stringify({
      level: 'info',
      event: 'server_started',
      port: env.port,
      env: env.nodeEnv,
      timestamp: new Date().toISOString(),
    }));
  });

  // ── Graceful Shutdown ─────────────────────────────────────────────────────
  // Gives in-flight requests time to complete before the process exits.
  // Required for zero-downtime deploys and container orchestration (K8s, Render).
  function gracefulShutdown(signal) {
    console.log(JSON.stringify({ level: 'info', event: 'shutdown_initiated', signal, timestamp: new Date().toISOString() }));

    server.close(async () => {
      console.log(JSON.stringify({ level: 'info', event: 'http_server_closed', timestamp: new Date().toISOString() }));
      await disconnectDB();
      process.exit(0);
    });

    // Force-kill if graceful shutdown takes too long (15s)
    setTimeout(() => {
      console.error(JSON.stringify({ level: 'error', event: 'forced_shutdown', timestamp: new Date().toISOString() }));
      process.exit(1);
    }, 15000);
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Crash protection — log and exit cleanly so the process manager restarts
  process.on('uncaughtException', (err) => {
    console.error(JSON.stringify({ level: 'fatal', event: 'uncaught_exception', error: err.message, stack: err.stack, timestamp: new Date().toISOString() }));
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error(JSON.stringify({ level: 'fatal', event: 'unhandled_rejection', error: String(reason), timestamp: new Date().toISOString() }));
    process.exit(1);
  });
}

startServer();

module.exports = app; // Export for testing
