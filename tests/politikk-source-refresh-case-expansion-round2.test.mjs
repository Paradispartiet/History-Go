import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPolitikkSourceRefreshCaseExpansionRound2 } from '../scripts/audit-politikk-source-refresh-case-expansion-round2.mjs';

test('Politikk source refresh and case expansion round 2 passes the permanent maintenance contract', () => {
  const report = auditPolitikkSourceRefreshCaseExpansionRound2();
  assert.equal(report.status, 'passed');
  assert.equal(report.round, 2);
  assert.equal(report.source_refresh_count, 10);
  assert.ok(report.new_current_source_count >= 5);
  assert.equal(report.case_count, 5);
  assert.equal(report.chapter_count, 4);
  assert.ok(report.place_count >= 5);
  assert.equal(report.gates.source_health, true);
  assert.equal(report.gates.canonical_source_identity, true);
  assert.equal(report.gates.canonical_place_identity, true);
  assert.equal(report.gates.claim_provenance_preserved, true);
  assert.equal(report.gates.theory_integrity_scope_unchanged, true);
  assert.equal(report.gates.status_semantics_preserved, true);
  assert.equal(report.gates.round1_coverage_not_duplicated, true);
  assert.equal(report.gates.no_strict_subcategory, true);
  assert.equal(report.gates.no_civication, true);
});
