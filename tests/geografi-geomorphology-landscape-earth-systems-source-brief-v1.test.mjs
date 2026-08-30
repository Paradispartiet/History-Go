import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-geografi-geomorphology-landscape-earth-systems-sources-v1.mjs';

test('Geografi felt 3 klargjøres source-first som kontrollert geomorfologi-gjenbruk med eget prosess- og metodebevis', () => {
  const report = audit();
  assert.equal(report.status, 'pass_source_first_ready_not_materialized');
  assert.equal(report.domain_id, 'geomorfologi_landskap_jordsystemer');
  assert.deepEqual(report.counts, {
    verifiedSources: 13,
    topicBriefs: 8,
    plannedClaims: 32,
    decisionScenarios: 6,
    plannedAssessments: 8,
    reusedOwnerChapters: 2
  });
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 30);
  assert.equal(report.next_gate, 'materialize_geomorphology_landscape_earth_systems_fulltext_and_reverify_all_32_claims');
});
