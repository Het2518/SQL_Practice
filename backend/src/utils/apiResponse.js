'use strict';

/**
 * Sends a standardized success response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=200]
 * @param {string} [options.message='Success']
 * @param {*} [options.data]
 */
function sendSuccess(res, { statusCode = 200, message = 'Success', data } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
}

/**
 * Sends a standardized error response.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {number} [options.statusCode=500]
 * @param {string} [options.message='Internal Server Error']
 * @param {*} [options.errors]
 */
function sendError(res, { statusCode = 500, message = 'Internal Server Error', errors } = {}) {
  const payload = {
    success: false,
    message,
  };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
}

module.exports = { sendSuccess, sendError };
