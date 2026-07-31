'use strict';

const { Router } = require('express');
const { getQuestions, getQuestionById, getQuestionsByCompany } = require('../controllers/questionController');

const router = Router();

// All question routes are public (read-only)
router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.get('/company/:companyId', getQuestionsByCompany);

module.exports = router;
