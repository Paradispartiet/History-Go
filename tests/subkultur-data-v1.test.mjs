import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSubkulturData, buildSubkulturDataReport } from '../scripts/audit-subkultur-data-v1.mjs';

test('alle 68 steder og 70 People-poster har en eksplisitt redaksjonell beslutning', () => {
  const report = auditSubkulturData();
  assert.equal(report.totals.audited_places, 68);
  assert.equal(report.totals.audited_people, 70);
  assert.equal(report.totals.retained_places + report.totals.reclassified_places, 68);
  assert.equal(report.totals.retained_people + report.totals.reclassified_people, 70);
});

test('beholdte poster har gyldige emnekoblinger og omklassifiseringene er materialisert', () => {
  const report = buildSubkulturDataReport();
  assert.deepEqual(report.integrity, {
    duplicate_place_rows: [],
    duplicate_people_rows: [],
    retained_places_without_mapping: [],
    retained_people_without_mapping: [],
    invalid_emne_references: [],
    record_mismatches: []
  });
});

test('dataauditen forskutterer ikke casebevis', () => {
  const report = buildSubkulturDataReport();
  assert.equal(report.status, 'CLASSIFICATION_AND_MAPPING_COMPLETE_CASE_EVIDENCE_PENDING');
  assert.equal(report.next_gate, 'case_source_validation');
});
