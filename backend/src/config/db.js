'use strict';

const mongoose = require('mongoose');
const { env } = require('./env');

let isConnected = false;

/**
 * Connects to MongoDB Atlas.
 * Uses a cached connection to avoid re-connecting on hot reloads.
 */
async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database');
      isConnected = false;
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err.message);
      isConnected = false;
    });
  } catch (err) {
    console.error('[MongoDB] Initial connection failed:', err.message);
    // Exit the process so the server doesn't start without a DB
    process.exit(1);
  }
}

module.exports = { connectDB };
