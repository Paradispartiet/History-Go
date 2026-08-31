import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sprak-lingvistikk-reconciliation-v1.mjs';

test('Språk & lingvistikk starter fail-closed med 12 felt og felt 1 source-first', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.domains, 12);
  assert.equal(report.materialized, 0);
  assert.equal(report.sourceFirstReady, 1);
  assert.equal(report.strictCompletionProven, false);
  assert.equal(report.reuseWithExpansion, 1);
  assert.equal(report.newProductionRequired, 11);
  assert.equal(report.moveExisting, 0);
  assert.equal(report.nextDomain, 'lingvistisk_tenkning_sprak_data_analyse_evidens');
});
