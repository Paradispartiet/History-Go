import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-juss-rettsvitenskap-reconciliation-v1.mjs';

test('Juss har felt 1-9 materialisert og felt 10 Familie/barn/arv/personrett source-first', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.domains, 12);
  assert.equal(report.materialized, 9);
  assert.equal(report.sourceFirstReady, 10);
  assert.equal(report.strictCompletionProven, false);
  assert.equal(report.nextDomain, 'familie_barn_arv_personrett');
});
