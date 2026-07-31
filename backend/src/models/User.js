'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Never return password in queries by default
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name cannot exceed 50 characters'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    resetPasswordCode: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// ── Pre-save Hook: Hash password before saving ─────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if the password field was modified (or is new)
  if (!this.isModified('password')) return next();
  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// ── Instance Method: Compare plain password with hashed password ───────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Virtual: derived display name fallback ─────────────────────────────────
userSchema.virtual('name').get(function () {
  return this.displayName || this.email.split('@')[0];
});

const User = mongoose.model('User', userSchema);

module.exports = User;
