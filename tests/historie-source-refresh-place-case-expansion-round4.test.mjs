import test from 'node:test';
import assert from 'node:assert/strict';
import { auditHistorieSourceRefreshPlaceCaseExpansionRound4 } from '../scripts/audit-historie-source-refresh-place-case-expansion-round4.mjs';

test('Historie maintenance round 4 expands five more chapters and leaves only the final three', () => {
  const report = auditHistorieSourceRefreshPlaceCaseExpansionRound4();
  assert.equal(report.status, 'passed');
  assert.equal(report.round, 4);
  assert.equal(report.source_refresh_count, 10);
  assert.equal(report.case_count, 5);
  assert.equal(report.chapter_count, 5);
  assert.equal(report.combined_maintenance_chapter_count, 20);
  assert.equal(report.remaining_maintenance_chapter_count, 3);
  assert.deepEqual(report.remaining_maintenance_chapters, [
    'kald_krig_etterkrig',
    'offentlighet_mobilisering_bevegelser',
    'samisk_urfolkshistorie'
  ]);
  assert.equal(report.canonical_chapter_count, 23);
  assert.equal(report.baseline_editorial_case_anchor_count, 54);
  assert.equal(report.round1_new_place_count, 5);
  assert.equal(report.round2_new_place_count, 5);
  assert.equal(report.round3_new_place_count, 5);
  assert.equal(report.round4_new_place_count, 5);
  assert.equal(report.projected_case_anchor_count, 74);
  assert.equal(report.projected_unique_place_count, 60);
  assert.equal(report.gates.source_health, true);
  assert.equal(report.gates.canonical_chapter_identity, true);
  assert.equal(report.gates.canonical_place_identity, true);
  assert.equal(report.gates.chapter_non_overlap_previous_rounds, true);
  assert.equal(report.gates.place_non_overlap_editorial_and_previous_rounds, true);
  assert.equal(report.gates.case_source_trace, true);
  assert.equal(report.gates.claim_provenance_preserved, true);
  assert.equal(report.gates.historiography_and_theory_integrity_scope_unchanged, true);
  assert.equal(report.gates.subject_architecture_unchanged, true);
  assert.equal(report.gates.completion_status_preserved, true);
  assert.equal(report.gates.archaeology_bounded, true);
  assert.equal(report.gates.state_formation_not_localized_to_palace, true);
  assert.equal(report.gates.memorial_retrojection_bounded, true);
  assert.equal(report.gates.fire_response_anchor_bounded, true);
  assert.equal(report.gates.statue_evidence_bounded, true);
  assert.equal(report.gates.no_strict_subcategory, true);
  assert.equal(report.gates.no_place_production, true);
});
