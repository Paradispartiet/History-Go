import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-juss-rettsvitenskap-family-child-inheritance-person-law-sources-v1.mjs';

test('Familie/barn/arv/personrett er 13/8/32 source-first og ikke materialisert', () => {
  const report = audit();
  assert.equal(report.status, 'pass_source_first_ready_not_materialized');
  assert.deepEqual(report.counts, { sources: 13, topics: 8, plannedClaims: 32, plannedAssessments: 8, decisionScenarios: 6 });
  assert.equal(report.gates.current_and_enacted_not_in_force_child_law_distinguished, true);
  assert.equal(report.gates.not_materialized, true);
});
