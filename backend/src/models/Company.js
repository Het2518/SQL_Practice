'use strict';

const mongoose = require('mongoose');

const COMPANY_CATEGORIES = [
  'MNC',
  'Startup',
  'SaaS',
  'FinTech',
  'Cloud',
  'Data',
  'E-commerce',
  'Social',
  'Security',
  'HealthTech',
];

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logoUrl: String,
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: COMPANY_CATEGORIES,
        message: `Category must be one of: ${COMPANY_CATEGORIES.join(', ')}`,
      },
    },
    description: String,
    interviewStyle: String,
    topSqlTopics: {
      type: [String],
      default: [],
    },
    difficultyDistribution: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    avgRounds: {
      type: Number,
      default: 3,
    },
    websiteUrl: String,
    activeHiring: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name before saving
companySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

companySchema.index({ name: 'text' });
companySchema.index({ category: 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
