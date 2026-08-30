import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-geografi-development-geography-inequality-sustainability-sources-v1.mjs';

test('Geografi felt 11 låser source-first development geography kontrakt', () => {
  const result = audit();
  assert.equal(result.status, 'pass_source_first_ready_not_materialized');
  assert.deepEqual(result.counts, { verifiedSources: 13, topicBriefs: 8, plannedClaims: 32, decisionScenarios: 6, plannedAssessments: 8 });
  assert.equal(result.gates.income_human_development_boundary, true);
  assert.equal(result.gates.survey_sae_boundary, true);
  assert.equal(result.gates.survey_geoprivacy_boundary, true);
  assert.equal(result.gates.sdg_causality_boundary, true);
  assert.equal(result.gates.multi_source_trace, true);
});
