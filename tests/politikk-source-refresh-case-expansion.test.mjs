import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPolitikkSourceRefreshCaseExpansion } from '../scripts/audit-politikk-source-refresh-case-expansion.mjs';

test('Politikk source refresh and case expansion round 1 passes the permanent maintenance contract', () => {
  const report = auditPolitikkSourceRefreshCaseExpansion();
  assert.equal(report.status, 'passed');
  assert.equal(report.source_refresh_count, 9);
  assert.ok(report.new_current_source_count >= 2);
  assert.equal(report.case_count, 5);
  assert.ok(report.chapter_count >= 4);
  assert.ok(report.place_count >= 4);
  assert.equal(report.gates.source_health, true);
  assert.equal(report.gates.canonical_source_identity, true);
  assert.equal(report.gates.canonical_place_identity, true);
  assert.equal(report.gates.claim_provenance_preserved, true);
  assert.equal(report.gates.theory_integrity_scope_unchanged, true);
  assert.equal(report.gates.no_strict_subcategory, true);
  assert.equal(report.gates.no_civication, true);
});
