import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-geografi-cartography-gis-geodata-remote-sensing-sources-v1.mjs';

test('Kartografi, GIS, geodata og fjernmåling klargjøres source-first med standarder, sensorer og validering', () => {
  const report = audit();
  assert.equal(report.subject_id, 'natur');
  assert.equal(report.canonical_subcategory_id, 'geografi');
  assert.equal(report.domain_id, 'kartografi_gis_geodata_fjernmaling');
  assert.equal(report.status, 'pass_source_first_ready_not_materialized');
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.topicBriefs, 8);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.decisionScenarios, 6);
  assert.equal(report.counts.plannedAssessments, 8);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 30);
});
