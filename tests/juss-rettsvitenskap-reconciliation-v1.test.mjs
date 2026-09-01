import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-juss-rettsvitenskap-reconciliation-v1.mjs';

test('Juss har felt 1-7 materialisert og felt 8 Avtaler/obligasjoner source-first', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.domains, 12);
  assert.equal(report.materialized, 7);
  assert.equal(report.sourceFirstReady, 8);
  assert.equal(report.strictCompletionProven, false);
  assert.equal(report.nextDomain, 'avtaler_obligasjoner_kontraktsrett');
});
