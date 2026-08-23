// scripts/design-audit/__tests__/safe-redirect.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

// ponytail: inline mirror of src/lib/safeRedirect.ts — node:test cannot import TS directly
function safeRedirectPath(input, fallback = '/') {
  if (!input || typeof input !== 'string') return fallback;
  if (!input.startsWith('/') || input.startsWith('//')) return fallback;
  if (input.includes('\\') || input.includes('://')) return fallback;
  return input;
}

test('safeRedirectPath allows internal paths', () => {
  assert.equal(safeRedirectPath('/portfolio'), '/portfolio');
  assert.equal(safeRedirectPath('/watchlists?tab=1'), '/watchlists?tab=1');
});

test('safeRedirectPath rejects external URLs', () => {
  assert.equal(safeRedirectPath('https://evil.com'), '/');
  assert.equal(safeRedirectPath('//evil.com'), '/');
});

test('safeRedirectPath rejects backslash and protocol-relative paths', () => {
  assert.equal(safeRedirectPath('/\\evil.com'), '/');
  assert.equal(safeRedirectPath('http://evil.com'), '/');
});

test('safeRedirectPath uses custom fallback', () => {
  assert.equal(safeRedirectPath(null, '/login'), '/login');
  assert.equal(safeRedirectPath(undefined, '/login'), '/login');
});
