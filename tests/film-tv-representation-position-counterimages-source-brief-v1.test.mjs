import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvRepresentationPositionCounterimagesSourceBriefV1 } from '../scripts/brief-film-tv-representation-position-counterimages-sources-v1.mjs';

test('sjuende planenhet har komplett og deterministisk kilde- og claimbrief', () => {
  const result = auditFilmTvRepresentationPositionCounterimagesSourceBriefV1();
  assert.deepEqual(result.report.summary, {
    emne_count: 10,
    source_count: 25,
    case_count: 21,
    planned_claim_count: 38,
    planned_claim_counts_by_emne: [4, 4, 4, 3, 4, 4, 4, 4, 3, 4],
    proposed_module_count: 4,
    registered_chapter_count_delta: 1,
    resolved_claim_count: 38
  });
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('claim- og modulomfanget følger problemgrensene', () => {
  const result = auditFilmTvRepresentationPositionCounterimagesSourceBriefV1();
  assert.equal(new Set(result.topicBriefs.map((topic) => topic.planned_claims.length)).size, 2);
  assert.equal(new Set(result.brief.proposed_module_order.map((module) => module.emne_ids.length)).size, 2);
  assert.ok(result.topicBriefs.every((topic) => topic.source_ids.length >= 3 && topic.case_ids.length >= 3 && topic.method_ids.length >= 1 && topic.canonical_boundary));
});

test('representasjonsanalysen skiller nærvær, posisjon, form og institusjonsmakt', () => {
  const result = auditFilmTvRepresentationPositionCounterimagesSourceBriefV1();
  assert.equal(result.brief.source_policy.visibility_count_perspective_agency_form_authorship_and_distribution_power_are_distinct, true);
  assert.equal(result.brief.production_requirements.representation_analysis_must_cover_presence_perspective_agency_form_authorship_and_distribution_power, true);
  const focus = result.plannedClaims.map((claim) => claim.claim_focus).join(' ');
  for (const needle of ['synsvinkel', 'agens', 'form', 'makt bak kameraet']) assert.match(focus, new RegExp(needle, 'i'));
});

test('identitet blir ikke inferert fra bilde, navn eller nasjonal opprinnelse', () => {
  const result = auditFilmTvRepresentationPositionCounterimagesSourceBriefV1();
  assert.equal(result.brief.source_policy.identity_is_never_inferred_from_appearance_name_or_national_origin_alone, true);
  assert.equal(result.brief.source_policy.self_identification_historical_category_character_role_and_analytic_racialization_are_distinct, true);
  assert.equal(result.brief.production_requirements.identity_claims_require_explicit_source_status_and_no_visual_inference, true);
});

test('interseksjonalitet og synlighet har eksplisitte metodegrenser', () => {
  const result = auditFilmTvRepresentationPositionCounterimagesSourceBriefV1();
  assert.equal(result.brief.source_policy.intersectionality_requires_interacting_structures_not_category_accumulation, true);
  assert.equal(result.brief.production_requirements.quantitative_visibility_requires_defined_corpus_unit_category_unknowns_and_limits, true);
  assert.equal(result.brief.production_requirements.intersectional_analysis_must_name_supported_axes_and_interacting_structures, true);
});

test('samisk skjermsuverenitet har protokoll, institusjon, form og verksevidens', () => {
  const result = auditFilmTvRepresentationPositionCounterimagesSourceBriefV1();
  const sami = result.topicBriefs.find((topic) => topic.emne_id === 'em_film_tv_urfolk_samisk_skjermkultur_og_suverenitet');
  assert.deepEqual(sami.case_ids, ['case-ofelas', 'case-isfi-selfdetermination', 'case-arran', 'case-la-elva', 'case-kanehsatake']);
  for (const sourceId of ['ftvrp20-isfi-ofelas', 'ftvrp21-isfi-selfdetermination', 'ftvrp22-isfi-arran', 'ftvrp23-nb-la-elva', 'ftvrp24-nfb-kanehsatake']) assert.ok(sami.source_ids.includes(sourceId));
  assert.equal(result.brief.production_requirements.sami_and_indigenous_cases_must_audit_narrative_self_determination_consultation_credit_language_and_control, true);
});

test('kapitlet ble registrert først etter fulltekst- og evidensaudit', () => {
  const result = auditFilmTvRepresentationPositionCounterimagesSourceBriefV1();
  assert.ok(result.plannedClaims.every((claim) => claim.status === 'resolved_to_verified_claim' && claim.final_claim_id === claim.id));
  assert.equal(result.brief.runtime_registration.registered, true);
  assert.equal(result.brief.runtime_registration.registration_after_full_chapter_gate, true);
  assert.equal(result.registry.subjects.film_tv.chapters.some((chapter) => chapter.id === 'representasjon-posisjon-og-motbilder'), true);
  assert.equal(result.registry.subjects.film_tv.canonicalModel.seventhSourceClaimBrief, 'data/fag/TV_og_Film/film_tv_representation_position_counterimages_source_claim_brief_v1.json');
  assert.equal(result.status.subjects.find((row) => row.id === 'film_tv').nextGate, 'representation_position_counterimages_full_chapter_complete_next_unit_source_brief');
});

test('naboområdene forblir eksplisitt utenfor enheten', () => {
  const result = auditFilmTvRepresentationPositionCounterimagesSourceBriefV1();
  assert.equal(result.brief.source_policy.national_imaginaries_public_sphere_migration_religion_age_city_and_climate_remain_in_next_unit, true);
  assert.equal(result.brief.source_policy.production_labour_conditions_and_operational_accessibility_remain_in_later_production_and_audience_units, true);
  assert.equal(result.brief.source_policy.reception_effect_and_audience_identity_work_remain_outside_this_unit, true);
});
