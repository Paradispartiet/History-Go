import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sosiologi-antropologi-reconciliation-v1.mjs';

test('Sosiologi og antropologi er en underkategori med source-first, ikke falsk ferdigstatus', () => {
  const result = audit();
  assert.equal(result.status, 'pass');
  assert.equal(result.domains, 12);
  assert.equal(result.materialized, 0);
  assert.equal(result.reuseWithExpansion, 3);
});
