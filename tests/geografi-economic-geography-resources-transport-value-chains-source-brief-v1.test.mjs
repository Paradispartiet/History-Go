import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-geografi-economic-geography-resources-transport-value-chains-sources-v1.mjs';

test('Geografi felt 9 source-first låser økonomisk geografi, logistikk og verdikjeder', () => {
  const result = audit();
  assert.equal(result.status, 'pass_source_first_ready_not_materialized');
  assert.equal(result.domain_id, 'okonomisk_geografi_ressurser_transport_verdikjeder');
  assert.equal(result.counts.verifiedSources, 13);
  assert.equal(result.counts.topicBriefs, 8);
  assert.equal(result.counts.plannedClaims, 32);
  assert.equal(result.counts.decisionScenarios, 6);
  assert.equal(result.counts.plannedAssessments, 8);
  assert.equal(result.six_part_quality_review.total, 30);
  assert.equal(result.next_gate, 'economic_geography_resources_transport_value_chains_fulltext');
});
