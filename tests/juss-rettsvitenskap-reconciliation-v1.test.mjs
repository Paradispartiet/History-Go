import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-juss-rettsvitenskap-reconciliation-v1.mjs';

test('Juss har felt 1-10 materialisert og felt 11 arbeids/selskaps/nærings/skatt/marked source-first', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.domains, 12);
  assert.equal(report.materialized, 10);
  assert.equal(report.sourceFirstReady, 11);
  assert.equal(report.strictCompletionProven, false);
  assert.equal(report.nextDomain, 'arbeids_selskaps_naerings_skatt_markedsrett');
});
