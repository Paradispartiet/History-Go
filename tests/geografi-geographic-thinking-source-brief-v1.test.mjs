import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-geografi-geographic-thinking-sources-v1.mjs';

test('Geografisk tenkning klargjøres source-first med rom, skala, GIS og ansvarlig representasjon', () => {
  const report = audit();
  assert.equal(report.subject_id, 'natur');
  assert.equal(report.canonical_subcategory_id, 'geografi');
  assert.equal(report.domain_id, 'geografisk_tenkning_sted_rom_skala_region');
  assert.equal(report.status, 'pass_source_first_ready_not_materialized');
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.topicBriefs, 8);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.decisionScenarios, 6);
  assert.equal(report.counts.plannedAssessments, 8);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 30);
});
