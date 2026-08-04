import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHistoryCanonicalEmneIdentityAudit } from '../tools/audit-historie-canonical-emner.mjs';

test('230 Historie-emner har unik brukeridentitet og stabil semantisk kobling', () => {
  const report = buildHistoryCanonicalEmneIdentityAudit();
  assert.equal(report.status, 'passed_with_legacy_ids_documented');
  assert.equal(report.summary.emne_count, 230);
  assert.equal(report.summary.unique_emne_ids, 230);
  assert.equal(report.summary.unique_titles, 230);
  assert.equal(report.summary.unique_definitions, 230);
  assert.equal(report.summary.unique_semantic_keys, 230);
  assert.equal(report.summary.unresolved_blockers, 0);
  assert.ok(report.summary.legacy_id_title_drift_count > 0);
  assert.deepEqual(report.summary.active_period_module_unit_counts, [8, 7, 6]);
  assert.ok(report.policy.emne_ids_are_stable_opaque_compatibility_keys);
  assert.ok(report.policy.fixed_emne_quota_is_not_editorial_target);
  assert.ok(report.legacy_id_title_drift.every((row) => row.semantic_key && row.identity_resolution.includes('semantic_key')));
});
