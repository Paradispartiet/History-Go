import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvCurriculumCompletenessV1 } from '../scripts/audit-film-tv-curriculum-completeness-v1.mjs';

test('Film & TV stopper kvotestyrt kapittelproduksjon og går til heldekningsrefaktor', () => {
  const report = auditFilmTvCurriculumCompletenessV1();
  assert.equal(report.status, 'quota_shaped_inventory_confirmed_refactor_required');
  assert.deepEqual(report.legacy_inventory.domain_emne_counts, [20, 20, 20, 20, 20, 20]);
  assert.deepEqual(report.legacy_inventory.domain_hook_counts, [10, 10, 10, 10, 10, 10]);
  assert.deepEqual(report.legacy_inventory.hook_emne_counts_unique, [2]);
  assert.equal(report.legacy_inventory.normalized_definition_template_count, 1);
  assert.equal(report.legacy_inventory.why_it_matters_template_count, 6);
  assert.equal(report.legacy_inventory.overlap_resolution_template_count, 1);
  assert.equal(report.legacy_inventory.materialized_chapter_count, 2);
  assert.equal(report.proposed_domain_candidates.some((row) => row.id === 'film_tv_historie_historiografi'), true);
  assert.equal(report.cross_cutting_completeness_gates.includes('film_and_television_both_explicit_across_the_curriculum'), true);
  assert.equal(report.gates.newChapterProductionBlockedUntilRefactor, true);
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});

test('den nye arkitekturen er faglig begrunnet og ikke nummerlåst', () => {
  const report = auditFilmTvCurriculumCompletenessV1();
  assert.ok(report.evidence.length >= 4);
  assert.ok(report.proposed_domain_candidates.every((row) => row.id && row.title && row.rationale.length >= 80));
  assert.ok(report.required_migration_sequence.includes('classify_every_legacy_emne_as_keep_merge_move_split_or_retire'));
  assert.ok(report.required_migration_sequence.includes('run_full_gap_overlap_filler_and_exclusion_audit_before_complete'));
  assert.equal(JSON.stringify(report).includes('target_emne_count'), false);
  assert.equal(JSON.stringify(report).includes('target_chapter_count'), false);
});
