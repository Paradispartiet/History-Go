import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sprak-lingvistikk-reconciliation-v1.mjs';

test('Språk & lingvistikk har felt 1-8 materialisert og felt 9 Historisk lingvistikk source-first', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.domains, 12);
  assert.equal(report.materialized, 8);
  assert.equal(report.sourceFirstReady, 9);
  assert.equal(report.strictCompletionProven, false);
  assert.equal(report.reuseWithExpansion, 1);
  assert.equal(report.newProductionRequired, 11);
  assert.equal(report.moveExisting, 0);
  assert.equal(report.nextDomain, 'historisk_lingvistikk_sprakendring_slektskap_kontakt');
});
