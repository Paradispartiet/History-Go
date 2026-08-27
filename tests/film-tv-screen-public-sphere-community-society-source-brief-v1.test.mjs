import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvScreenPublicSphereCommunitySocietySourceBriefV1 } from '../scripts/brief-film-tv-screen-public-sphere-community-society-sources-v1.mjs';

const isConsumed = (result) => result.brief.status === 'source_claim_brief_consumed_by_verified_chapter';
const FILM_TV_POST_UNIT_EIGHT_GATE = /(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief|full_chapter_complete_completion_audit|maintenance_source_refresh_and_place_case_expansion)$/;

test('åttende planenhet har komplett og deterministisk kilde- og claimbrief', () => {
  const result = auditFilmTvScreenPublicSphereCommunitySocietySourceBriefV1();
  const expected = {
    emne_count: 9,
    source_count: 28,
    case_count: 30,
    planned_claim_count: 36,
    planned_claim_counts_by_emne: [4, 4, 5, 5, 4, 4, 3, 3, 4],
    proposed_module_count: 4,
    registered_chapter_count_delta: isConsumed(result) ? 1 : 0
  };
  if (isConsumed(result)) expected.resolved_claim_count = 36;
  assert.deepEqual(result.report.summary, expected);
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('claim- og modulomfanget følger problemgrensene fremfor en kvote', () => {
  const result = auditFilmTvScreenPublicSphereCommunitySocietySourceBriefV1();
  assert.equal(new Set(result.topicBriefs.map((topic) => topic.planned_claims.length)).size, 3);
  assert.equal(new Set(result.brief.proposed_module_order.map((module) => module.emne_ids.length)).size, 2);
  assert.ok(result.topicBriefs.every((topic) => topic.source_ids.length >= 3 && topic.case_ids.length >= 3 && topic.planned_claims.length >= 3));
});

test('samfunnseffekt holdes adskilt fra representasjon, hensikt, tilsyn og mottakelse', () => {
  const result = auditFilmTvScreenPublicSphereCommunitySocietySourceBriefV1();
  assert.equal(result.brief.source_policy.representation_institutional_intent_regulatory_assessment_documented_reception_and_societal_effect_are_distinct, true);
  assert.equal(result.brief.source_policy.societal_effect_requires_empirical_reception_or_impact_evidence, true);
  assert.equal(result.brief.production_requirements.institutional_intent_regulatory_assessment_and_empirical_effect_must_be_labelled_separately, true);
  const impact = result.cases.find((row) => row.id === 'case-day-after-tomorrow-impact');
  assert.deepEqual(impact.source_ids, ['ftvsp20-yale-day-after']);
});

test('offentlighet og demokratisk deltakelse krever eksplisitt evidensstatus', () => {
  const result = auditFilmTvScreenPublicSphereCommunitySocietySourceBriefV1();
  assert.equal(result.brief.source_policy.public_sphere_claims_must_identify_arena_actor_access_format_institution_and_evidence, true);
  assert.equal(result.brief.source_policy.broadcast_reach_or_simultaneity_is_not_automatically_shared_interpretation, true);
  assert.equal(result.brief.production_requirements.every_societal_effect_claim_must_name_empirical_method_population_measure_and_limit, true);
});

test('alder, by, klima, migrasjon, nasjon og religion har eksplisitte sikkerhetsgrenser', () => {
  const result = auditFilmTvScreenPublicSphereCommunitySocietySourceBriefV1();
  assert.equal(result.brief.source_policy.age_child_youth_life_course_distinguishes_representation_target_audience_institutional_remit_and_actual_audience, true);
  assert.equal(result.brief.source_policy.urban_representation_distinguishes_shown_place_social_structure_shooting_location_and_local_effect, true);
  assert.equal(result.brief.source_policy.ecocritical_representation_is_separate_from_production_footprint_and_public_behavior, true);
  assert.equal(result.brief.source_policy.migration_diaspora_and_transnational_identity_do_not_authorize_identity_inference_from_name_accent_appearance_or_origin, true);
  assert.equal(result.brief.source_policy.nation_and_imagined_community_are_analytic_frames_not_population_homogeneity_claims, true);
  assert.equal(result.brief.source_policy.religion_worldview_representation_distinguishes_textual_signs_institutional_mandate_creator_position_practice_and_audience_reading, true);
});

test('senere publikums- og stedsområder blir ikke overtatt', () => {
  const result = auditFilmTvScreenPublicSphereCommunitySocietySourceBriefV1();
  assert.equal(result.brief.source_policy.audience_identity_work_fandom_interview_ethnography_and_survey_methods_remain_in_later_reception_unit, true);
  assert.equal(result.brief.source_policy.screen_geography_location_production_and_local_effect_remain_in_later_place_units, true);
  assert.equal(result.brief.production_requirements.audience_reception_identity_work_and_fandom_remain_outside_scope, true);
  assert.equal(result.brief.production_requirements.location_production_and_local_effect_remain_outside_scope, true);
});

test('registrering skjer monotont først etter fulltekst-, claim- og evidensaudit', () => {
  const result = auditFilmTvScreenPublicSphereCommunitySocietySourceBriefV1();
  const hasChapter = result.registry.subjects.film_tv.chapters.some((chapter) => chapter.id === 'skjermoffentlighet-fellesskap-og-samfunn');
  if (isConsumed(result)) {
    assert.ok(result.plannedClaims.every((claim) => claim.status === 'resolved_to_verified_claim' && claim.final_claim_id === claim.id));
    assert.equal(result.brief.runtime_registration.registered, true);
    assert.equal(result.brief.runtime_registration.registration_after_full_chapter_gate, true);
    assert.equal(hasChapter, true);
    assert.match(result.status.subjects.find((row) => row.id === 'film_tv').nextGate, FILM_TV_POST_UNIT_EIGHT_GATE);
  } else {
    assert.ok(result.plannedClaims.every((claim) => claim.status === 'planned_requires_fulltext_verification'));
    assert.equal(result.brief.runtime_registration.registered, false);
    assert.equal(result.brief.runtime_registration.allowed_before_full_chapter_gate, false);
    assert.equal(hasChapter, false);
    assert.equal(result.status.subjects.find((row) => row.id === 'film_tv').nextGate, 'representation_position_counterimages_full_chapter_complete_next_unit_source_brief');
  }
});
