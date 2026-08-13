import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvCreativeWorkTechnologyResponsibilitySourceBriefV1 } from '../scripts/brief-film-tv-creative-work-technology-responsibility-sources-v1.mjs';

test('niende planenhet har komplett og deterministisk kilde- og claimbrief', () => {
  const result = auditFilmTvCreativeWorkTechnologyResponsibilitySourceBriefV1();
  assert.deepEqual(result.report.summary, {
    emne_count: 11,
    source_count: 29,
    case_count: 23,
    planned_claim_count: 48,
    planned_claim_counts_by_emne: [4, 4, 6, 4, 5, 4, 4, 4, 4, 4, 5],
    proposed_module_count: 4,
    registered_chapter_count_delta: 0
  });
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('claim- og modulomfanget følger problemgrensene fremfor en kvote', () => {
  const result = auditFilmTvCreativeWorkTechnologyResponsibilitySourceBriefV1();
  assert.deepEqual([...new Set(result.topicBriefs.map((topic) => topic.planned_claims.length))], [4, 6, 5]);
  assert.deepEqual(result.brief.proposed_module_order.map((module) => module.emne_ids.length), [4, 2, 2, 3]);
  assert.ok(result.topicBriefs.every((topic) => topic.source_ids.length >= 3 && topic.case_ids.length >= 3 && topic.planned_claims.length >= 4));
});

test('arbeidsflyt og teknisk kapasitet holdes adskilt fra markedsførte effekter', () => {
  const { brief } = auditFilmTvCreativeWorkTechnologyResponsibilitySourceBriefV1();
  assert.equal(brief.source_policy.technical_capability_is_not_proof_of_quality_cost_time_labour_or_environmental_effect, true);
  assert.equal(brief.source_policy.vendor_documentation_requires_independent_boundary_for_impact_claims, true);
  assert.equal(brief.source_policy.workflow_description_is_not_universal_best_practice_without_scope, true);
  assert.equal(brief.production_requirements.every_workflow_claim_must_name_role_input_decision_handoff_and_output, true);
  assert.equal(brief.production_requirements.every_technology_claim_must_name_documented_capability_version_context_and_limit, true);
});

test('utøverarbeid, samtykke, HMS, arbeid og kreditering har egne evidensgrenser', () => {
  const { brief, topicBriefs, cases } = auditFilmTvCreativeWorkTechnologyResponsibilitySourceBriefV1();
  assert.equal(brief.source_policy.casting_does_not_authorize_identity_inference_from_name_body_voice_disability_gender_or_origin, true);
  assert.equal(brief.source_policy.intimacy_coordination_supports_but_never_substitutes_for_performer_consent, true);
  assert.equal(brief.source_policy.hms_requires_activity_specific_risk_assessment_worker_participation_and_controls, true);
  assert.equal(brief.source_policy.contract_union_guidance_regulation_and_workplace_practice_are_not_interchangeable, true);
  assert.equal(brief.source_policy.screen_credit_does_not_by_itself_prove_complete_work_contribution_or_employment_terms, true);
  const actingTopic = topicBriefs.find((row) => row.emne_id === 'em_film_tv_casting_skuespillerarbeid_og_intimitetskoordinering');
  assert.ok(actingTopic.source_ids.includes('ftc28-screenskills-actor'));
  assert.ok(actingTopic.planned_claims.some((row) => row.id === 'cw-casting-6' && row.claim_type === 'performance-workflow'));
  assert.deepEqual(cases.find((row) => row.id === 'case-actor-performance-workflow').source_ids, ['ftc05-screenskills-director', 'ftc28-screenskills-actor']);
});

test('et navngitt audiovisuelle verk forankrer den virtuelle produksjonsanalysen', () => {
  const { topicBriefs, cases } = auditFilmTvCreativeWorkTechnologyResponsibilitySourceBriefV1();
  const production = cases.find((row) => row.id === 'case-mandalorian-stagecraft-season-one');
  assert.equal(production.work, 'The Mandalorian Season One StageCraft production');
  assert.deepEqual(production.source_ids, ['ftc22-epic-icvfx', 'ftc29-ilm-mandalorian-stagecraft']);
  const vfxTopic = topicBriefs.find((row) => row.emne_id === 'em_film_tv_vfx_virtuell_produksjon_og_sanntidsarbeidsflyt');
  assert.ok(vfxTopic.case_ids.includes(production.id));
});

test('klima og tilgjengelighet krever målbare grenser, brukerbehov og testing', () => {
  const { brief } = auditFilmTvCreativeWorkTechnologyResponsibilitySourceBriefV1();
  assert.equal(brief.source_policy.carbon_accounting_must_name_activity_data_factor_boundary_uncertainty_and_comparison, true);
  assert.equal(brief.source_policy.standard_or_certification_is_not_automatic_evidence_of_emission_reduction, true);
  assert.equal(brief.source_policy.accessibility_features_are_distinct_production_components_tied_to_user_requirements, true);
  assert.equal(brief.source_policy.availability_of_access_service_is_not_proof_of_complete_user_access_or_use, true);
  assert.equal(brief.production_requirements.every_accessibility_claim_must_name_user_need_media_information_component_and_test, true);
});

test('KI-claims skiller kapasitet, bruk, beslutning, rettigheter, arbeid og effekt', () => {
  const { brief, cases } = auditFilmTvCreativeWorkTechnologyResponsibilitySourceBriefV1();
  assert.equal(brief.source_policy.ai_analysis_must_separate_model_function_concrete_use_human_decision_rights_labour_and_effect, true);
  assert.equal(brief.source_policy.digital_replica_requires_specific_use_consent_and_compensation_analysis, true);
  assert.equal(brief.source_policy.ai_job_quality_and_productivity_claims_require_empirical_or_contractual_evidence, true);
  assert.deepEqual(cases.find((row) => row.id === 'case-performer-digital-replica').source_ids, ['ftc25-sag-digital-replicas', 'ftc26-usco-ai']);
});

test('neste enhets økonomi- og reguleringsområde blir ikke overtatt', () => {
  const result = auditFilmTvCreativeWorkTechnologyResponsibilitySourceBriefV1();
  assert.equal(result.brief.source_policy.financing_market_ownership_regulation_and_distribution_remain_in_next_unit, true);
  assert.equal(result.brief.production_requirements.financing_market_ownership_regulation_and_distribution_remain_outside_scope, true);
  assert.ok(result.plannedClaims.every((claim) => claim.status === 'planned_requires_fulltext_verification'));
  assert.equal(result.brief.runtime_registration.registered, false);
  assert.equal(result.registry.subjects.film_tv.chapters.some((chapter) => chapter.id === 'skapende-arbeid-teknologi-og-ansvar'), false);
  assert.equal(result.status.subjects.find((row) => row.id === 'film_tv').nextGate, 'screen_public_sphere_community_society_full_chapter_complete_next_unit_source_brief');
});
