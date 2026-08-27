#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  brief: 'data/fag/TV_og_Film/film_tv_screen_public_sphere_community_society_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_screen_public_sphere_community_society_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_screen_public_sphere_community_society_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_screen_public_sphere_community_society_topic_claims_v1.json',
  report: 'reports/fagverk/film-tv-screen-public-sphere-community-society-source-brief-v1-audit.json'
});
const UNIT_ID = 'skjermoffentlighet-fellesskap-og-samfunn';
const INPUT_GATE = 'representation_position_counterimages_full_chapter_complete_next_unit_source_brief';
const OUTPUT_GATE = 'screen_public_sphere_community_society_full_chapter_complete_next_unit_source_brief';
const FILM_TV_POST_UNIT_EIGHT_GATE = /(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief|full_chapter_complete_completion_audit|maintenance_source_refresh_and_place_case_expansion)$/;
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

export function buildFilmTvScreenPublicSphereCommunitySocietySourceBriefReportV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Skjermoffentlighet, fellesskap og samfunn');

  const emners = read(P.emners);
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodsDoc = read(P.methods);
  const methods = Array.isArray(methodsDoc) ? methodsDoc : methodsDoc.methods;
  const methodIds = new Set(methods.map((row) => row.method_id || row.id));
  const registry = read(P.registry);
  const status = read(P.status);
  const currentGate = status.subjects.find((row) => row.id === 'film_tv')?.nextGate;
  const brief = read(P.brief);
  const sources = read(P.sources).sources;
  const cases = read(P.cases).cases;
  const topicBriefs = read(P.topicClaims).topic_briefs;
  const sourceIds = new Set(sources.map((row) => row.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const caseById = new Map(cases.map((row) => [row.id, row]));
  const plannedClaims = topicBriefs.flatMap((row) => row.planned_claims);
  const usedSourceIds = new Set([...topicBriefs.flatMap((row) => row.source_ids), ...cases.flatMap((row) => row.source_ids)]);
  const claimCounts = topicBriefs.map((row) => row.planned_claims.length);
  const moduleEmneIds = brief.proposed_module_order.flatMap((row) => row.emne_ids);
  const roles = sources.map((row) => `${row.type} ${row.evidence_role}`).join(' ').toLowerCase();
  const effectCase = cases.find((row) => row.id === 'case-day-after-tomorrow-impact');

  const gates = {
    eighth_learning_order_unit_selected: plan.production_sequence[7] === UNIT_ID,
    required_prerequisite_chapters_registered: unit.prerequisite_planned_unit_ids.every((id) => registry.subjects.film_tv.chapters.some((row) => row.id === id)),
    current_status_requests_eighth_unit_source_brief: currentGate === INPUT_GATE,
    exact_unit_emne_coverage: topicBriefs.length === unit.emne_count
      && new Set(topicBriefs.map((row) => row.emne_id)).size === unit.emne_count
      && unit.emne_ids.every((id) => topicBriefs.some((row) => row.emne_id === id)),
    all_emners_active_canonical: topicBriefs.every((row) => emneById.has(row.emne_id)),
    all_canonical_topics_have_methods: topicBriefs.every((row) => {
      const canonical = emneById.get(row.emne_id);
      return Array.isArray(canonical?.method_ids) && canonical.method_ids.length > 0 && canonical.method_ids.every((id) => methodIds.has(id));
    }),
    inspectable_https_sources: sources.every((row) => row.url.startsWith('https://') && row.source_location && row.retrieval_status === 'verified_2026-08-12'),
    scholarly_institutional_regulatory_object_and_empirical_roles_present: ['scholarly', 'institutional', 'regulatory', 'object', 'empirical'].every((needle) => roles.includes(needle)),
    every_source_used: sources.every((row) => usedSourceIds.has(row.id)),
    every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
    every_case_documented: cases.every((row) => row.source_ids.length > 0 && row.source_ids.every((id) => sourceIds.has(id)) && row.purpose),
    every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
    every_case_source_available_to_owning_topic: topicBriefs.every((topic) => topic.case_ids.every((id) => caseById.get(id).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))),
    claim_counts_follow_variable_problem_scope: new Set(claimCounts).size > 1 && Math.min(...claimCounts) >= 3,
    no_planned_claim_overstated_as_verified: plannedClaims.every((row) => row.status === 'planned_requires_fulltext_verification'),
    all_planned_claim_ids_unique: new Set(plannedClaims.map((row) => row.id)).size === plannedClaims.length,
    all_topics_have_sources_cases_and_claims: topicBriefs.every((row) => row.source_ids.length >= 3 && row.case_ids.length >= 3 && row.planned_claims.length >= 3 && row.learning_goal),
    module_order_covers_every_emne_once: moduleEmneIds.length === unit.emne_count
      && new Set(moduleEmneIds).size === unit.emne_count
      && unit.emne_ids.every((id) => moduleEmneIds.includes(id)),
    module_sizes_are_not_forced_equal: new Set(brief.proposed_module_order.map((row) => row.emne_ids.length)).size > 1,
    societal_effect_boundary_is_explicit: brief.source_policy.representation_institutional_intent_regulatory_assessment_documented_reception_and_societal_effect_are_distinct
      && brief.source_policy.societal_effect_requires_empirical_reception_or_impact_evidence
      && brief.production_requirements.every_societal_effect_claim_must_name_empirical_method_population_measure_and_limit,
    empirical_effect_case_is_present: effectCase?.source_ids.includes('ftvsp20-yale-day-after')
      && sources.some((row) => row.id === 'ftvsp20-yale-day-after' && row.evidence_role === 'empirical-documented-impact-study'),
    institutional_intent_and_regulatory_assessment_are_distinct: brief.source_policy.institutional_mission_is_not_proof_of_audience_use_reception_or_democratic_effect
      && brief.production_requirements.institutional_intent_regulatory_assessment_and_empirical_effect_must_be_labelled_separately,
    reception_and_audience_identity_work_remain_later: brief.source_policy.audience_identity_work_fandom_interview_ethnography_and_survey_methods_remain_in_later_reception_unit
      && brief.production_requirements.audience_reception_identity_work_and_fandom_remain_outside_scope,
    place_and_location_effects_remain_later: brief.source_policy.screen_geography_location_production_and_local_effect_remain_in_later_place_units
      && brief.production_requirements.location_production_and_local_effect_remain_outside_scope,
    identity_inference_safeguard_is_explicit: brief.source_policy.migration_diaspora_and_transnational_identity_do_not_authorize_identity_inference_from_name_accent_appearance_or_origin
      && brief.production_requirements.identity_claims_require_explicit_source_status_and_no_visual_name_accent_or_origin_inference,
    chapter_remains_unregistered: !registry.subjects.film_tv.chapters.some((row) => row.id === UNIT_ID),
    registration_waits_for_fulltext_claim_source_audit: !brief.runtime_registration.registered
      && !brief.runtime_registration.allowed_before_full_chapter_gate
      && brief.production_requirements.chapter_registration_only_after_fulltext_claim_and_evidence_audit
  };

  const report = {
    schema: 'history_go_film_tv_screen_public_sphere_community_society_source_brief_v1_audit',
    version: '1.0.0',
    updated_at: '2026-08-12',
    status: brief.status,
    subject_id: 'film_tv',
    summary: {
      emne_count: unit.emne_count,
      source_count: sources.length,
      case_count: cases.length,
      planned_claim_count: plannedClaims.length,
      planned_claim_counts_by_emne: claimCounts,
      proposed_module_count: brief.proposed_module_order.length,
      registered_chapter_count_delta: 0
    },
    coverage: topicBriefs.map((row) => ({
      emne_id: row.emne_id,
      source_count: row.source_ids.length,
      case_count: row.case_ids.length,
      planned_claim_count: row.planned_claims.length
    })),
    gates,
    next_gate: brief.next_gate
  };

  return { brief, sources, cases, report, registry, status, unit, topicBriefs, plannedClaims };
}

export function auditFilmTvScreenPublicSphereCommunitySocietySourceBriefV1({ writeFiles = false, checkFiles = true } = {}) {
  const status = read(P.status);
  const currentGate = status.subjects.find((row) => row.id === 'film_tv')?.nextGate;
  const brief = read(P.brief);

  if (brief.status === 'source_claim_brief_consumed_by_verified_chapter') {
    assert(FILM_TV_POST_UNIT_EIGHT_GATE.test(currentGate || ''), `Uventet Film & TV-port etter konsumert skjermoffentlighetsbrief: ${currentGate}`);
    const registry = read(P.registry);
    const report = read(P.report);
    const sources = read(P.sources).sources;
    const cases = read(P.cases).cases;
    const topicBriefs = read(P.topicClaims).topic_briefs;
    const plannedClaims = topicBriefs.flatMap((row) => row.planned_claims);
    const unit = read(P.plan).planned_units.find((row) => row.id === UNIT_ID);
    assert(brief.runtime_registration.registered === true && brief.runtime_registration.chapter_id === UNIT_ID, 'Skjermoffentlighetsbriefen mangler kapittelregistrering');
    assert(registry.subjects.film_tv.chapters.some((row) => row.id === UNIT_ID), 'Skjermoffentlighetskapitlet mangler i registry');
    assert(plannedClaims.every((row) => row.status === 'resolved_to_verified_claim' && row.final_claim_id === row.id), 'Alle skjermoffentlighetsclaimplaner skal være løst');
    assert(report.status === 'source_claim_brief_consumed_by_verified_chapter' && Object.values(report.gates).every(Boolean), 'Skjermoffentlighetsbriefens etteraudit er ikke grønn');
    return { brief, sources, cases, report, registry, status, unit, topicBriefs, plannedClaims };
  }

  assert(currentGate === INPUT_GATE, `Uventet Film & TV-port: ${currentGate}`);
  const built = buildFilmTvScreenPublicSphereCommunitySocietySourceBriefReportV1();
  if (writeFiles) write(P.report, built.report);
  if (checkFiles) assert(isDeepStrictEqual(read(P.report), built.report), `${P.report} er utdatert`);
  assert(Object.values(built.report.gates).every(Boolean), 'Minst én skjermoffentlighetsbrief-port feiler');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditFilmTvScreenPublicSphereCommunitySocietySourceBriefV1({ writeFiles: args.has('--write'), checkFiles: !args.has('--write') });
    console.log(`Film & TV skjermoffentlighetsbrief OK: ${result.topicBriefs.length} emner, ${result.sources.length} kilder, ${result.cases.length} case og ${result.plannedClaims.length} claimspor; status ${result.brief.status}.`);
  } catch (error) {
    console.error(`Film & TV skjermoffentlighetsbrief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
