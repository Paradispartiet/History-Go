import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sosiologi-antropologi-reconciliation-v1.mjs';

test('Sosiologi og antropologi er en underkategori med ærlig delvis fremdrift, ikke falsk ferdigstatus', () => {
  const result = audit();
  assert.equal(result.status, 'pass');
  assert.equal(result.domains, 12);
  assert.ok(result.materialized > 0 && result.materialized < result.domains);
  assert.equal(result.nextDomain, 'digitalisering_vitenskap_teknologi_samfunn');
  assert.equal(result.reuseWithExpansion, 3);
});
