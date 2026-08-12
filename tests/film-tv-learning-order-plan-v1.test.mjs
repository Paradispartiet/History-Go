import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvLearningOrderPlanV1, buildFilmTvLearningOrderPlanV1 } from '../scripts/plan-film-tv-learning-order-v1.mjs';

test('alle canonicale Film & TV-emner har én eksisterende eller planlagt eier', () => {
  const result = auditFilmTvLearningOrderPlanV1();
  assert.deepEqual(buildFilmTvLearningOrderPlanV1().report, result.report);
  assert.equal(result.canonicalIds.size, 192);
  assert.equal(result.existingIds.length, 38);
  assert.equal(result.plannedIds.length, 154);
  assert.equal(new Set(result.plannedIds).size, 154);
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('læringsrekkefølgen er faglig avhengig og ikke en lik tallkvote', () => {
  const result = auditFilmTvLearningOrderPlanV1();
  assert.equal(result.plan.phases.length, 6);
  assert.equal(result.units.length, 15);
  assert.ok(new Set(result.units.map((unit) => unit.emne_count)).size > 1);
  assert.ok(result.units.every((unit, index) => unit.prerequisite_planned_unit_ids.every((id) => result.units.findIndex((candidate) => candidate.id === id) < index)));
  assert.equal(result.plan.policy.chapter_count_is_derived_not_target, true);
  assert.equal(result.plan.policy.later_evidence_may_add_merge_move_or_split_units, true);
});

test('første produksjonskandidat krever kilde- og claimbrief før registrering', () => {
  const result = auditFilmTvLearningOrderPlanV1();
  assert.equal(result.plan.first_production_candidate.planned_unit_id, 'audiovisuell-form-og-sansing');
  assert.equal(result.plan.first_production_candidate.required_next_artifact, 'source_and_claim_brief');
  assert.match(result.plan.first_production_candidate.registration_status, /^not_registered/);
  assert.ok(['learning_order_plan_complete_first_chapter_source_brief', 'audiovisual_form_source_brief_complete_full_chapter_production', 'audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production', 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief', 'film_history_movements_historiography_source_brief_complete_full_chapter_production', 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief', 'television_platforms_participation_source_brief_complete_full_chapter_production', 'television_platforms_participation_full_chapter_complete_next_unit_source_brief', 'documentary_evidence_ethics_source_brief_complete_full_chapter_production', 'documentary_evidence_ethics_full_chapter_complete_next_unit_source_brief', 'representation_position_counterimages_source_brief_complete_full_chapter_production'].includes(result.status.subjects.find((row) => row.id === 'film_tv').nextGate));
  assert.equal(result.registry.subjects.film_tv.canonicalModel.learningOrderPlan, 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json');
});
