import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvHolisticCompletionV1 } from '../scripts/audit-film-tv-holistic-completion-v1.mjs';

test('Film & TV completion is exactly 192 = 38 anchors + 154 planned-unit emner', () => {
  const { report, registry, status } = auditFilmTvHolisticCompletionV1();
  assert.equal(report.summary.canonical_emne_count, 192);
  assert.equal(report.summary.anchor_chapter_count, 2);
  assert.equal(report.summary.anchor_emne_count, 38);
  assert.equal(report.summary.planned_unit_count, 15);
  assert.equal(report.summary.planned_unit_emne_count, 154);
  assert.equal(report.summary.registered_chapter_count, 17);
  assert.deepEqual(report.discrepancies, {
    missing_emne_ids: [],
    extra_emne_ids: [],
    duplicate_emne_ids: [],
    anchor_unit_overlap_ids: []
  });
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.ok(report.units.every((unit) => unit.all_claims_verified_as_planned));
  assert.ok(report.units.every((unit) => unit.no_planned_only_claims));
  assert.ok(report.units.every((unit) => unit.every_claim_uses_registered_source));
  assert.ok(report.units.every((unit) => unit.all_sources_inspectable));
  assert.equal(status.subjects.find((row) => row.id === 'film_tv').editorialStatus, 'complete');
  assert.equal(status.subjects.find((row) => row.id === 'film_tv').nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(registry.subjects.film_tv.editorialPlan.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
});
