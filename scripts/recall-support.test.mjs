import assert from 'node:assert/strict';
import { test } from 'node:test';
import { usableRecallEmail, usableRecallPhone } from '../src/lib/recall-support.ts';

test('never displays known demo contact channels as working support', () => {
  for (const value of ['demo-support@example.invalid', 'recall@example.com', 'recall@example.org', undefined, '']) {
    assert.equal(usableRecallEmail(value), '');
  }
  for (const value of ['1-800-555-SAFE', '(555) 010-2042', '800-555-0123', '123', undefined]) {
    assert.equal(usableRecallPhone(value), '');
  }
});

test('preserves configured contact channels and permits ordinary numbers containing 555', () => {
  assert.equal(usableRecallEmail(' recall@koiimprtinc.com '), 'recall@koiimprtinc.com');
  assert.equal(usableRecallPhone(' +1 800 234 5556 '), '+1 800 234 5556');
});
