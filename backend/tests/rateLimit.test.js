// backend/tests/rateLimit.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { rateLimit } from '../middleware/rateLimit.js';

function createReq(ip = '127.0.0.1', path = '/auth/login') {
  return { ip, path, headers: {}, header: () => undefined };
}

function createRes() {
  const res = { statusCode: 200, headers: {}, body: null };
  res.setHeader = (k, v) => { res.headers[k] = v; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (payload) => { res.body = payload; return res; };
  return res;
}

test('rateLimit allows within limit and blocks after', () => {
  const limiter = rateLimit({ windowMs: 1000, maxAttempts: 2, keyGenerator: (req) => `${req.ip}:${req.path}` });
  const req = createReq('1.2.3.4', '/auth/login');

  // Attempt 1
  let nextCalled = false;
  limiter(req, createRes(), () => { nextCalled = true; });
  assert.equal(nextCalled, true);

  // Attempt 2
  nextCalled = false;
  limiter(req, createRes(), () => { nextCalled = true; });
  assert.equal(nextCalled, true);

  // Attempt 3 -> should be blocked (no next, 429)
  const res3 = createRes();
  nextCalled = false;
  limiter(req, res3, () => { nextCalled = true; });
  assert.equal(nextCalled, false);
  assert.equal(res3.statusCode, 429);
  assert.equal(res3.body?.error?.code, 'RATE_LIMITED');
});

test('rateLimit resets after window', async () => {
  const limiter = rateLimit({ windowMs: 50, maxAttempts: 1, keyGenerator: (req) => `${req.ip}:${req.path}` });
  const req = createReq('5.6.7.8', '/auth/login');

  let nextCalled = false;
  limiter(req, createRes(), () => { nextCalled = true; }); // 1st ok
  assert.equal(nextCalled, true);

  const res2 = createRes();
  nextCalled = false;
  limiter(req, res2, () => { nextCalled = true; }); // 2nd blocked
  assert.equal(nextCalled, false);
  assert.equal(res2.statusCode, 429);

  await new Promise((r) => setTimeout(r, 60));

  nextCalled = false;
  limiter(req, createRes(), () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});
