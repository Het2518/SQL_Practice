const test = require('node:test');
const assert = require('node:assert/strict');

const { csrfProtection, setCsrfCookie } = require('../src/middleware/csrf');
const { sendSuccess, sendError } = require('../src/utils/apiResponse');

function createRes() {
  return {
    statusCode: 0,
    headers: {},
    cookieCalls: [],
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
    cookie(name, value, options) {
      this.cookieCalls.push({ name, value, options });
      return this;
    },
  };
}

test('csrfProtection allows safe methods', () => {
  let nextCalled = false;
  const req = { method: 'GET', cookies: {}, headers: {} };
  const res = createRes();

  csrfProtection(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.payload, null);
});

test('csrfProtection rejects missing token on mutating requests', () => {
  let nextCalled = false;
  const req = { method: 'POST', cookies: {}, headers: {} };
  const res = createRes();

  csrfProtection(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.payload, {
    success: false,
    message: 'Invalid or missing CSRF token',
  });
});

test('csrfProtection accepts matching token pair', () => {
  let nextCalled = false;
  const req = {
    method: 'PATCH',
    cookies: { csrfToken: 'abc123' },
    headers: { 'x-csrf-token': 'abc123' },
  };
  const res = createRes();

  csrfProtection(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.payload, null);
});

test('setCsrfCookie sets same-site cookie for local requests', () => {
  const res = createRes();
  const req = {
    headers: { origin: 'http://localhost:5173' },
    secure: false,
  };

  const token = setCsrfCookie(req, res);

  assert.equal(typeof token, 'string');
  assert.equal(token.length, 64);
  assert.equal(res.cookieCalls.length, 1);
  assert.deepEqual(res.cookieCalls[0].options.sameSite, 'lax');
  assert.deepEqual(res.cookieCalls[0].options.secure, false);
  assert.deepEqual(res.cookieCalls[0].options.httpOnly, false);
});

test('setCsrfCookie sets cross-site cookie attributes for remote origins', () => {
  const res = createRes();
  const req = {
    headers: { origin: 'https://example.com' },
    secure: false,
  };

  const token = setCsrfCookie(req, res);

  assert.equal(typeof token, 'string');
  assert.equal(token.length, 64);
  assert.equal(res.cookieCalls.length, 1);
  assert.deepEqual(res.cookieCalls[0].options.sameSite, 'none');
  assert.deepEqual(res.cookieCalls[0].options.secure, true);
});

test('sendSuccess writes a success payload', () => {
  const res = createRes();

  sendSuccess(res, { statusCode: 201, message: 'Created', data: { ok: true } });

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.payload, {
    success: true,
    message: 'Created',
    data: { ok: true },
  });
});

test('sendError writes a failure payload', () => {
  const res = createRes();

  sendError(res, { statusCode: 400, message: 'Bad Request', code: 'BAD_INPUT' });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.payload, {
    success: false,
    message: 'Bad Request',
    code: 'BAD_INPUT',
  });
});
