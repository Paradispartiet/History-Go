import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-geografi-settlement-urban-rural-urbanisation-sources-v1.mjs';

test('Geografi felt 8 source-first låser bosetting, urban-rural og funksjonelle geografier', () => {
  const result = audit();
  assert.equal(result.status, 'pass_source_first_ready_not_materialized');
  assert.equal(result.domain_id, 'bosetting_by_land_urbanisering');
  assert.equal(result.counts.verifiedSources, 13);
  assert.equal(result.counts.topicBriefs, 8);
  assert.equal(result.counts.plannedClaims, 32);
  assert.equal(result.counts.decisionScenarios, 6);
  assert.equal(result.counts.plannedAssessments, 8);
  assert.equal(result.six_part_quality_review.total, 30);
  assert.equal(result.next_gate, 'settlement_urban_rural_urbanisation_fulltext');
});
