const test = require('node:test');
const assert = require('node:assert/strict');

const ENV_PATH = '../src/config/env';

function loadEnvModule() {
  delete require.cache[require.resolve(ENV_PATH)];
  return require(ENV_PATH);
}

function withEnv(overrides, fn) {
  const originalEnv = { ...process.env };
  process.env = { ...originalEnv, ...overrides };
  try {
    return fn();
  } finally {
    process.env = originalEnv;
    delete require.cache[require.resolve(ENV_PATH)];
  }
}

test('validateEnv throws when required variables are missing', () => {
  withEnv(
    {
      MONGO_URI: '',
      JWT_SECRET: '',
    },
    () => {
      const { validateEnv } = loadEnvModule();

      assert.throws(
        () => validateEnv(),
        /Missing required environment variables: MONGO_URI, JWT_SECRET/
      );
    }
  );
});

test('validateEnv throws when JWT secret is too short', () => {
  withEnv(
    {
      MONGO_URI: 'mongodb://localhost:27017/test',
      JWT_SECRET: 'short-secret',
    },
    () => {
      const { validateEnv } = loadEnvModule();

      assert.throws(() => validateEnv(), /JWT_SECRET must be at least 32 characters long/);
    }
  );
});

test('validateEnv warns on missing recommended variables without throwing', () => {
  withEnv(
    {
      MONGO_URI: 'mongodb://localhost:27017/test',
      JWT_SECRET: 'x'.repeat(32),
      EMAIL_USER: '',
      EMAIL_PASS: '',
      CLIENT_URL: '',
    },
    () => {
      const { validateEnv } = loadEnvModule();
      const warnMessages = [];
      const originalWarn = console.warn;
      console.warn = (message) => warnMessages.push(message);

      try {
        assert.doesNotThrow(() => validateEnv());
        assert.equal(warnMessages.length, 1);
        assert.match(
          warnMessages[0],
          /Recommended env vars not set: EMAIL_USER, EMAIL_PASS, CLIENT_URL/
        );
      } finally {
        console.warn = originalWarn;
      }
    }
  );
});

test('env export reflects current environment values', () => {
  withEnv(
    {
      NODE_ENV: 'production',
      PORT: '8080',
      MONGO_URI: 'mongodb://localhost:27017/test',
      JWT_SECRET: 'y'.repeat(32),
      JWT_EXPIRES_IN: '30m',
      CLIENT_URL: 'https://example.com',
      EMAIL_HOST: 'smtp.example.com',
      EMAIL_PORT: '2525',
      EMAIL_USER: 'user@example.com',
      EMAIL_PASS: 'secret',
    },
    () => {
      const { env } = loadEnvModule();

      assert.equal(env.nodeEnv, 'production');
      assert.equal(env.port, 8080);
      assert.equal(env.mongoUri, 'mongodb://localhost:27017/test');
      assert.equal(env.jwtSecret, 'y'.repeat(32));
      assert.equal(env.jwtExpiresIn, '30m');
      assert.equal(env.clientUrl, 'https://example.com');
      assert.equal(env.isDev, false);
      assert.equal(env.emailHost, 'smtp.example.com');
      assert.equal(env.emailPort, 2525);
      assert.equal(env.emailUser, 'user@example.com');
      assert.equal(env.emailPass, 'secret');
    }
  );
});