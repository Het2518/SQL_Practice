'use strict';

const Question = require('../models/Question');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * GET /api/questions
 * Returns all questions. Optionally filter by difficulty, schemaName, keyword search.
 */
async function getQuestions(req, res, next) {
  try {
    const { difficulty, schema, search, limit = 500, page = 1 } = req.query;

    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (schema) filter.schemaName = schema;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('companies', 'name slug logoUrl')
        .populate('topics', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Question.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: {
        questions,
        total,
        page: parseInt(page, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/questions/:id
 */
async function getQuestionById(req, res, next) {
  try {
    const question = await Question.findById(req.params.id)
      .populate('companies', 'name slug logoUrl')
      .populate('topics', 'name')
      .lean();

    if (!question) {
      return sendError(res, { statusCode: 404, message: 'Question not found.' });
    }

    return sendSuccess(res, { data: { question } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/questions/company/:companyId
 * Returns questions associated with a specific company.
 */
async function getQuestionsByCompany(req, res, next) {
  try {
    const questions = await Question.find({ companies: req.params.companyId })
      .select('title difficulty schemaName questionType estimatedTimeMinutes keywords')
      .sort({ difficulty: 1 })
      .lean();

    return sendSuccess(res, { data: { questions } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getQuestions, getQuestionById, getQuestionsByCompany };
