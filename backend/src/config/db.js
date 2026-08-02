'use strict';

const mongoose = require('mongoose');
const { env } = require('./env');

let isConnected = false;

/**
 * Connects to MongoDB Atlas with retry logic.
 * Uses a cached connection to avoid re-connecting on hot reloads.
 */
async function connectDB(retries = 3) {
  if (isConnected) return;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,        // Connection pool size
        minPoolSize: 2,
        connectTimeoutMS: 10000,
      });

      isConnected = true;
      console.log(JSON.stringify({
        level: 'info',
        event: 'db_connected',
        host: conn.connection.host,
        timestamp: new Date().toISOString(),
      }));

      mongoose.connection.on('disconnected', () => {
        console.warn(JSON.stringify({ level: 'warn', event: 'db_disconnected', timestamp: new Date().toISOString() }));
        isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log(JSON.stringify({ level: 'info', event: 'db_reconnected', timestamp: new Date().toISOString() }));
        isConnected = true;
      });

      mongoose.connection.on('error', (err) => {
        console.error(JSON.stringify({ level: 'error', event: 'db_error', error: err.message, timestamp: new Date().toISOString() }));
        isConnected = false;
      });

      return; // success
    } catch (err) {
      console.error(JSON.stringify({
        level: 'error',
        event: 'db_connection_failed',
        attempt,
        maxRetries: retries,
        error: err.message,
        timestamp: new Date().toISOString(),
      }));

      if (attempt === retries) {
        // Exit the process so the container/process manager restarts it
        process.exit(1);
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`[MongoDB] Retrying in ${delay / 1000}s...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

/**
 * Gracefully closes the database connection.
 * Called during process shutdown signals.
 */
async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.connection.close();
  isConnected = false;
  console.log(JSON.stringify({ level: 'info', event: 'db_disconnected_gracefully', timestamp: new Date().toISOString() }));
}

module.exports = { connectDB, disconnectDB };
