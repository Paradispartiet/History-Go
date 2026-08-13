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
  brief: 'data/fag/TV_og_Film/film_tv_creative_work_technology_responsibility_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_creative_work_technology_responsibility_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_creative_work_technology_responsibility_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_creative_work_technology_responsibility_topic_claims_v1.json',
  report: 'reports/fagverk/film-tv-creative-work-technology-responsibility-source-brief-v1-audit.json'
});
const UNIT_ID = 'skapende-arbeid-teknologi-og-ansvar';
const INPUT_GATE = 'screen_public_sphere_community_society_full_chapter_complete_next_unit_source_brief';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (ok, message) => { if (!ok) throw new Error(message); };

export function buildFilmTvCreativeWorkTechnologyResponsibilitySourceBriefReportV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Skapende arbeid, teknologi og ansvar');

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
  const usedCaseIds = new Set(topicBriefs.flatMap((row) => row.case_ids));
  const claimCounts = topicBriefs.map((row) => row.planned_claims.length);
  const moduleEmneIds = brief.proposed_module_order.flatMap((row) => row.emne_ids);
  const evidenceInventory = sources.map((row) => `${row.type} ${row.evidence_role}`).join(' ').toLowerCase();
  const concreteProduction = cases.find((row) => row.id === 'case-mandalorian-stagecraft-season-one');
  const actingTopic = topicBriefs.find((row) => row.emne_id === 'em_film_tv_casting_skuespillerarbeid_og_intimitetskoordinering');

  const gates = {
    ninth_learning_order_unit_selected: plan.production_sequence[8] === UNIT_ID,
    planned_prerequisites_registered: unit.prerequisite_planned_unit_ids.every((id) => registry.subjects.film_tv.chapters.some((row) => row.id === id)),
    existing_prerequisites_registered: unit.prerequisite_existing_chapter_ids.every((id) => registry.subjects.film_tv.chapters.some((row) => row.id === id)),
    current_status_requests_ninth_unit_source_brief: currentGate === INPUT_GATE,
    exact_unit_emne_coverage: topicBriefs.length === unit.emne_count
      && new Set(topicBriefs.map((row) => row.emne_id)).size === unit.emne_count
      && unit.emne_ids.every((id) => topicBriefs.some((row) => row.emne_id === id)),
    all_emners_active_canonical: topicBriefs.every((row) => emneById.has(row.emne_id)),
    all_canonical_topics_have_methods: topicBriefs.every((row) => {
      const canonical = emneById.get(row.emne_id);
      return Array.isArray(canonical?.method_ids) && canonical.method_ids.length > 0 && canonical.method_ids.every((id) => methodIds.has(id));
    }),
    inspectable_https_sources: sources.every((row) => row.url.startsWith('https://') && row.source_location && row.retrieval_status === 'verified_2026-08-13'),
    official_standard_union_worker_and_vendor_roles_present: ['authority', 'standard', 'union', 'worker', 'vendor'].every((needle) => evidenceInventory.includes(needle)),
    every_source_used: sources.every((row) => usedSourceIds.has(row.id)),
    every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
    every_case_used: cases.every((row) => usedCaseIds.has(row.id)),
    every_case_documented: cases.every((row) => row.source_ids.length > 0 && row.source_ids.every((id) => sourceIds.has(id)) && row.purpose),
    every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
    every_case_source_available_to_owning_topic: topicBriefs.every((topic) => topic.case_ids.every((id) => caseById.get(id).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))),
    named_audiovisual_production_anchor_is_inspectable: concreteProduction?.work === 'The Mandalorian Season One StageCraft production'
      && concreteProduction.source_ids.includes('ftc29-ilm-mandalorian-stagecraft')
      && sources.some((row) => row.id === 'ftc29-ilm-mandalorian-stagecraft' && row.evidence_role === 'concrete-audiovisual-virtual-production-case')
      && topicBriefs.some((row) => row.case_ids.includes(concreteProduction.id)),
    acting_work_has_claim_source_and_case: actingTopic?.source_ids.includes('ftc28-screenskills-actor')
      && actingTopic.case_ids.includes('case-actor-performance-workflow')
      && actingTopic.planned_claims.some((row) => row.id === 'cw-casting-6' && row.claim_type === 'performance-workflow'),
    claim_counts_follow_variable_problem_scope: new Set(claimCounts).size > 1 && Math.min(...claimCounts) >= 4,
    no_planned_claim_overstated_as_verified: plannedClaims.every((row) => row.status === 'planned_requires_fulltext_verification'),
    all_planned_claim_ids_unique: new Set(plannedClaims.map((row) => row.id)).size === plannedClaims.length,
    all_topics_have_sources_cases_and_claims: topicBriefs.every((row) => row.source_ids.length >= 3 && row.case_ids.length >= 3 && row.planned_claims.length >= 4 && row.learning_goal),
    module_order_covers_every_emne_once: moduleEmneIds.length === unit.emne_count
      && new Set(moduleEmneIds).size === unit.emne_count
      && unit.emne_ids.every((id) => moduleEmneIds.includes(id)),
    module_sizes_are_not_forced_equal: new Set(brief.proposed_module_order.map((row) => row.emne_ids.length)).size > 1,
    workflow_and_technology_effect_boundaries_are_explicit: brief.source_policy.technical_capability_is_not_proof_of_quality_cost_time_labour_or_environmental_effect
      && brief.source_policy.vendor_documentation_requires_independent_boundary_for_impact_claims
      && brief.production_requirements.every_workflow_claim_must_name_role_input_decision_handoff_and_output
      && brief.production_requirements.every_technology_claim_must_name_documented_capability_version_context_and_limit,
    labour_safety_consent_and_credit_boundaries_are_explicit: brief.source_policy.intimacy_coordination_supports_but_never_substitutes_for_performer_consent
      && brief.source_policy.hms_requires_activity_specific_risk_assessment_worker_participation_and_controls
      && brief.source_policy.contract_union_guidance_regulation_and_workplace_practice_are_not_interchangeable
      && brief.source_policy.screen_credit_does_not_by_itself_prove_complete_work_contribution_or_employment_terms
      && brief.production_requirements.every_consent_claim_must_preserve_specific_informed_continuing_performer_control,
    carbon_and_accessibility_boundaries_are_explicit: brief.source_policy.carbon_accounting_must_name_activity_data_factor_boundary_uncertainty_and_comparison
      && brief.source_policy.standard_or_certification_is_not_automatic_evidence_of_emission_reduction
      && brief.source_policy.accessibility_features_are_distinct_production_components_tied_to_user_requirements
      && brief.source_policy.availability_of_access_service_is_not_proof_of_complete_user_access_or_use,
    ai_rights_labour_and_effect_boundaries_are_explicit: brief.source_policy.ai_analysis_must_separate_model_function_concrete_use_human_decision_rights_labour_and_effect
      && brief.source_policy.digital_replica_requires_specific_use_consent_and_compensation_analysis
      && brief.source_policy.ai_job_quality_and_productivity_claims_require_empirical_or_contractual_evidence
      && brief.production_requirements.every_ai_claim_must_separate_capability_use_human_decision_rights_labour_and_measured_effect,
    financing_market_regulation_and_distribution_remain_next: brief.source_policy.financing_market_ownership_regulation_and_distribution_remain_in_next_unit
      && brief.production_requirements.financing_market_ownership_regulation_and_distribution_remain_outside_scope,
    chapter_remains_unregistered: !registry.subjects.film_tv.chapters.some((row) => row.id === UNIT_ID),
    registration_waits_for_fulltext_claim_source_audit: !brief.runtime_registration.registered
      && !brief.runtime_registration.allowed_before_full_chapter_gate
      && brief.production_requirements.chapter_registration_only_after_fulltext_claim_and_evidence_audit
  };

  const report = {
    schema: 'history_go_film_tv_creative_work_technology_responsibility_source_brief_v1_audit',
    version: '1.0.0',
    updated_at: '2026-08-13',
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

export function auditFilmTvCreativeWorkTechnologyResponsibilitySourceBriefV1({ writeFiles = false, checkFiles = true } = {}) {
  const built = buildFilmTvCreativeWorkTechnologyResponsibilitySourceBriefReportV1();
  if (writeFiles) write(P.report, built.report);
  if (checkFiles) assert(isDeepStrictEqual(read(P.report), built.report), `${P.report} er utdatert`);
  assert(Object.values(built.report.gates).every(Boolean), 'Minst én port for briefen om skapende arbeid, teknologi og ansvar feiler');
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditFilmTvCreativeWorkTechnologyResponsibilitySourceBriefV1({ writeFiles: args.has('--write'), checkFiles: !args.has('--write') });
    console.log(`Film & TV-brief for skapende arbeid, teknologi og ansvar OK: ${result.topicBriefs.length} emner, ${result.sources.length} kilder, ${result.cases.length} case og ${result.plannedClaims.length} claimspor; status ${result.brief.status}.`);
  } catch (error) {
    console.error(`Film & TV-brief for skapende arbeid, teknologi og ansvar FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
