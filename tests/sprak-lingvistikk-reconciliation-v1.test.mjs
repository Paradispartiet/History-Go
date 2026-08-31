import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sprak-lingvistikk-reconciliation-v1.mjs';

test('Språk & lingvistikk har felt 1-3 materialisert og felt 4 Morfologi source-first', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.domains, 12);
  assert.equal(report.materialized, 3);
  assert.equal(report.sourceFirstReady, 4);
  assert.equal(report.strictCompletionProven, false);
  assert.equal(report.reuseWithExpansion, 1);
  assert.equal(report.newProductionRequired, 11);
  assert.equal(report.moveExisting, 0);
  assert.equal(report.nextDomain, 'morfologi_ordstruktur_boyning_avledning');
});
