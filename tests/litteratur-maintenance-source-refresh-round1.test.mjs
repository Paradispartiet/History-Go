import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturMaintenanceSourceRefreshRound1 } from '../scripts/audit-litteratur-maintenance-source-refresh-round1.mjs';

test('Litteratur maintenance round 1 refreshes all twelve research-practice sources without unsafe replacements', () => {
  const report = auditLitteraturMaintenanceSourceRefreshRound1();
  assert.equal(report.status, 'passed');
  assert.equal(report.round, 1);
  assert.equal(report.area_id, 'faggrunnlag_metode_forskningspraksis');
  assert.equal(report.canonical_pathway_source_count, 384);
  assert.equal(report.canonical_area_count, 28);
  assert.equal(report.canonical_topic_count, 168);
  assert.equal(report.area_source_count, 12);
  assert.equal(report.verified_live, 9);
  assert.equal(report.crawler_access_restricted_403, 2);
  assert.equal(report.fetch_indeterminate_no_replacement, 1);
  assert.equal(report.canonical_url_replacements, 0);
  assert.equal(report.gates.complete_status_preserved, true);
  assert.equal(report.gates.maintenance_gate_preserved, true);
  assert.equal(report.gates.canonical_source_identity_preserved, true);
  assert.equal(report.gates.canonical_source_urls_preserved, true);
  assert.equal(report.gates.uncertain_sources_fail_closed, true);
  assert.equal(report.gates.claim_provenance_scope_unchanged, true);
  assert.equal(report.gates.theory_integrity_scope_unchanged, true);
  assert.equal(report.gates.subject_architecture_unchanged, true);
  assert.equal(report.gates.no_strict_subcategory, true);
  assert.equal(report.gates.no_place_production, true);
});
