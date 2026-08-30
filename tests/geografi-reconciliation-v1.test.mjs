import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-geografi-reconciliation-v1.mjs';

test('Geografi reconciliation låser eierskap, 12-domeneplan og fail-closed fremdrift', () => {
  const result = audit();
  assert.equal(result.status, 'pass');
  assert.equal(result.domains, 12);
  assert.equal(result.materialized, 11);
  assert.equal(result.sourceFirstReady, 12);
  assert.equal(result.strictCompletionProven, false);
  assert.equal(result.reuseWithExpansion, 4);
  assert.equal(result.newProductionRequired, 8);
  assert.equal(result.moveExisting, 0);
  assert.equal(result.nextDomain, 'naturfare_risiko_saarbarhet_planlegging_tilpasning');
  assert.ok(result.findings >= 10);
});
