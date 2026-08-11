import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvLegacyEmneClassificationV1 } from '../scripts/audit-film-tv-legacy-emne-classification-v1.mjs';

test('alle 120 Film & TV-legacyemner har én eksplisitt og sporbar migreringsbeslutning', () => {
  const report = auditFilmTvLegacyEmneClassificationV1();
  assert.equal(report.status, 'all_legacy_emner_classified_gap_design_next');
  assert.equal(report.summary.legacy_emne_count, 120);
  assert.equal(report.summary.classified_emne_count, 120);
  assert.equal(new Set(report.classifications.map((row) => row.emne_id)).size, 120);
  assert.deepEqual(Object.keys(report.summary.action_counts), ['keep', 'merge', 'move', 'split', 'retire']);
  assert.ok(Object.values(report.summary.action_counts).every((count) => count > 0));
  assert.ok(report.classifications.every((row) => row.alias_required && row.rationale.length >= 70 && row.boundary_note.length > row.rationale.length));
});

test('klassifikasjonen åpner gapdesign uten å innføre en ny tallkvote', () => {
  const report = auditFilmTvLegacyEmneClassificationV1();
  assert.equal(report.policy.classification_is_migration_input_not_final_canonical_inventory, true);
  assert.equal(report.policy.no_fixed_target_domain_or_emne_count, true);
  assert.equal(report.policy.chapter_production_remains_blocked, true);
  assert.equal(report.summary.next_gate, 'identify_missing_relevant_emner_and_design_variable_inventory');
  assert.ok(Object.values(report.summary.target_domain_reference_counts).every((count) => count > 0));
  assert.equal(JSON.stringify(report).includes('target_emne_count'), false);
  assert.equal(JSON.stringify(report).includes('target_chapter_count'), false);
});
