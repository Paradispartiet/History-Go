import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPolitikkSourceRefreshCaseExpansionRound3 } from '../scripts/audit-politikk-source-refresh-case-expansion-round3.mjs';

test('Politikk vedlikeholdsrunde 3 fullfører 13/13 kapitteldekning uten statusdegradering', () => {
  const report = auditPolitikkSourceRefreshCaseExpansionRound3();
  assert.equal(report.status, 'passed');
  assert.equal(report.round, 3);
  assert.equal(report.source_refresh_count, 10);
  assert.equal(report.case_count, 5);
  assert.equal(report.chapter_count, 5);
  assert.ok(report.place_count >= 5);
  assert.equal(report.total_round_count, 3);
  assert.equal(report.total_case_count, 15);
  assert.equal(report.total_canonical_chapter_coverage, 13);
  assert.equal(report.gates.source_health, true);
  assert.equal(report.gates.canonical_chapter_identity, true);
  assert.equal(report.gates.canonical_place_identity, true);
  assert.equal(report.gates.case_source_trace, true);
  assert.equal(report.gates.claim_provenance_preserved, true);
  assert.equal(report.gates.theory_integrity_scope_unchanged, true);
  assert.equal(report.gates.subject_architecture_unchanged, true);
  assert.equal(report.gates.status_semantics_preserved, true);
  assert.equal(report.gates.prior_round_coverage_not_duplicated, true);
  assert.equal(report.gates.all_13_canonical_chapters_covered, true);
  assert.equal(report.gates.no_strict_subcategory, true);
  assert.equal(report.gates.no_civication, true);
});
