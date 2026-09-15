import test from 'node:test';
import assert from 'node:assert/strict';
import { audit, REQUIRED_WORK_IDS } from '../scripts/audit-sosiologi-antropologi-advanced-theory-reading-canon-v1.mjs';

test('Sosiologi og antropologi har et eksplisitt avansert teorikanon uten å late som fulltekst er materialisert', () => {
  const report = audit();
  assert.equal(report.subject_id, 'politikk');
  assert.equal(report.canonical_subcategory_id, 'sosiologi_antropologi');
  assert.equal(report.status, 'canonical_source_and_theory_mapping_complete_fulltext_materialization_pending');
  assert.equal(report.counts.works, 20);
  assert.equal(report.counts.allowedDomains, 12);
  assert.equal(report.counts.allowedCrossSubjects, 13);
  assert.equal(report.counts.theoryUnits, 60);
  assert.equal(REQUIRED_WORK_IDS.length, 20);
  assert.equal(report.counts.existingOrExtendingCoverage, 2);
  assert.equal(report.counts.gaps, 18);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.passed, true);
});
