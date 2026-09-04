import test from 'node:test';
import assert from 'node:assert/strict';
import { auditBySourceRefreshPlaceCaseExpansion } from '../scripts/audit-by-source-refresh-place-case-expansion.mjs';

test('By maintenance round 1 refreshes sources and expands canonical place cases without changing completion semantics', () => {
  const report = auditBySourceRefreshPlaceCaseExpansion();
  assert.equal(report.status, 'passed');
  assert.equal(report.round, 1);
  assert.equal(report.source_refresh_count, 11);
  assert.ok(report.publisher_count >= 5);
  assert.equal(report.case_count, 5);
  assert.equal(report.chapter_count, 5);
  assert.equal(report.baseline_unique_place_count, 20);
  assert.ok(report.new_unique_place_count >= 6);
  assert.ok(report.projected_unique_place_count >= 26);
  assert.equal(report.gates.source_health, true);
  assert.equal(report.gates.canonical_chapter_identity, true);
  assert.equal(report.gates.canonical_place_identity, true);
  assert.equal(report.gates.new_place_case_expansion, true);
  assert.equal(report.gates.case_source_trace, true);
  assert.equal(report.gates.claim_provenance_preserved, true);
  assert.equal(report.gates.theory_integrity_scope_unchanged, true);
  assert.equal(report.gates.subject_architecture_unchanged, true);
  assert.equal(report.gates.completion_status_preserved, true);
  assert.equal(report.gates.no_strict_subcategory, true);
  assert.equal(report.gates.no_place_production, true);
});
