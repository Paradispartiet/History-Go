import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-juss-rettsvitenskap-reconciliation-v1.mjs';

test('Juss har felt 1-8 materialisert og felt 9 Erstatning/tingsrett source-first', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.domains, 12);
  assert.equal(report.materialized, 8);
  assert.equal(report.sourceFirstReady, 9);
  assert.equal(report.strictCompletionProven, false);
  assert.equal(report.nextDomain, 'erstatning_tingsrett_formuesrett_rettsvern');
});
