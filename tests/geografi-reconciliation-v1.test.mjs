import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-geografi-reconciliation-v1.mjs';

test('Geografi reconciliation låser eierskap, 12-domeneplan og fail-closed fremdrift', () => {
  const result = audit();
  assert.equal(result.status, 'pass');
  assert.equal(result.domains, 12);
  assert.equal(result.materialized, 0);
  assert.equal(result.sourceFirstReady, 1);
  assert.equal(result.strictCompletionProven, false);
  assert.equal(result.reuseWithExpansion, 4);
  assert.equal(result.newProductionRequired, 8);
  assert.equal(result.moveExisting, 0);
  assert.equal(result.nextDomain, 'geografisk_tenkning_sted_rom_skala_region');
  assert.ok(result.findings >= 10);
});
