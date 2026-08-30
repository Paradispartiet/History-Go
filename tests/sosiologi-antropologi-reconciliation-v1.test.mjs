import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sosiologi-antropologi-reconciliation-v1.mjs';

test('Sosiologi og antropologi har sammenhengende 12/12-fremdrift og strict completion-proof', () => {
  const result = audit();
  assert.equal(result.status, 'pass');
  assert.equal(result.domains, 12);
  assert.equal(result.materialized, result.domains);
  assert.equal(result.strictCompletionProven, true);
  assert.equal(result.nextDomain, null);
  assert.equal(result.reuseWithExpansion, 3);
});
