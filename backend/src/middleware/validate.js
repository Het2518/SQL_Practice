'use strict';

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware: Reads express-validator results and sends a 422 if there are errors.
 * Use this AFTER your validation chain in a route.
 *
 * @example
 *   router.post('/register',
 *     [body('email').isEmail(), body('password').isLength({ min: 6 })],
 *     validate,
 *     authController.register
 *   );
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, {
      statusCode: 422,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { validate };
