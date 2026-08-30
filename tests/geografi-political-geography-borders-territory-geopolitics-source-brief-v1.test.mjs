import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-geografi-political-geography-borders-territory-geopolitics-sources-v1.mjs';

test('Geografi felt 10 låser source-first political geography kontrakt', () => {
  const result = audit();
  assert.equal(result.status, 'pass_source_first_ready_not_materialized');
  assert.deepEqual(result.counts, { verifiedSources: 13, topicBriefs: 8, plannedClaims: 32, decisionScenarios: 6, plannedAssessments: 8 });
  assert.equal(result.gates.sovereignty_jurisdiction_control_boundary, true);
  assert.equal(result.gates.maritime_zone_boundary, true);
  assert.equal(result.gates.conflict_event_status_boundary, true);
  assert.equal(result.gates.disputed_boundary_metadata, true);
  assert.equal(result.gates.multi_source_trace, true);
});
