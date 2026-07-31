'use strict';

const Company = require('../models/Company');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * GET /api/companies
 * Returns all companies. Optionally filter by category.
 */
async function getCompanies(req, res, next) {
  try {
    const { category, search } = req.query;

    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.$text = { $search: search };

    const companies = await Company.find(filter)
      .sort({ name: 1 })
      .lean();

    return sendSuccess(res, { data: { companies } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/companies/:slug
 * Returns a single company by its slug.
 */
async function getCompanyBySlug(req, res, next) {
  try {
    const company = await Company.findOne({ slug: req.params.slug }).lean();

    if (!company) {
      return sendError(res, { statusCode: 404, message: 'Company not found.' });
    }

    return sendSuccess(res, { data: { company } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCompanies, getCompanyBySlug };
