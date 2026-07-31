'use strict';

const { Router } = require('express');
const { getCompanies, getCompanyBySlug } = require('../controllers/companyController');

const router = Router();

// All company routes are public (read-only)
router.get('/', getCompanies);
router.get('/:slug', getCompanyBySlug);

module.exports = router;
