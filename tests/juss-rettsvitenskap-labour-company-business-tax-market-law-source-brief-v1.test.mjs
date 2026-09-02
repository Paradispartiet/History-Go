import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-juss-rettsvitenskap-labour-company-business-tax-market-law-sources-v1.mjs';

test('Juss felt 11 source-first er 13/8/32 med 2025-foretaksregisterlov og eksplisitt ikke materialisert', () => {
  const report = audit();
  assert.equal(report.status, 'pass_source_first_ready_not_materialized');
  assert.deepEqual(report.counts, { sources: 13, topics: 8, plannedClaims: 32, plannedAssessments: 8, decisionScenarios: 6 });
  assert.equal(report.gates.foretaksregister_2025_transition, true);
  assert.equal(report.gates.repealed_1985_register_law_excluded, true);
  assert.equal(report.gates.not_materialized, true);
});
