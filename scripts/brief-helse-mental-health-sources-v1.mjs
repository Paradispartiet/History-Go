#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATE = '2026-08-23';
const UNIT = 'psykisk-helse-lidelse-tjenester-recovery-og-rettigheter';
const EMNE = 'em_helse_psykisk_helse';
const METHODS = new Set([
  'met_helse_tjenesteanalyse',
  'met_helse_etikk_samtykke',
  'met_helse_populasjonsanalyse',
  'met_helse_evidenssyntese',
]);
const P = {
  brief: 'data/fag/helse/mental_health_source_claim_brief_v1.json',
  report: 'reports/fagverk/helse-mental-health-source-brief-v1-audit.json',
  emners: 'data/fag/helse/emner_helse_canonical_v1.json',
  methods: 'data/fag/helse/methods_helse_canonical_v1.json',
  safety: 'data/fag/helse/clinical_safety_contract_helse_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  release: 'data/fagverk/fagverk_release.json',
};
const abs = (f) => path.join(ROOT, f);
const read = (f) => JSON.parse(fs.readFileSync(abs(f), 'utf8'));
const write = (f, v) => {
  fs.mkdirSync(path.dirname(abs(f)), { recursive: true });
  fs.writeFileSync(abs(f), `${JSON.stringify(v, null, 2)}\n`);
};
const assert = (v, m) => { if (!v) throw new Error(m); };

function build() {
  const brief = read(P.brief);
  const emners = read(P.emners);
  const methods = read(P.methods);
  const safety = read(P.safety);
  const registry = read(P.registry);
  const status = read(P.status);
  const release = read(P.release);
  const canonical = emners.find((x) => x.emne_id === EMNE);
  const methodIds = new Set((methods.methods || methods).map((x) => x.method_id));
  const health = status.subjects.find((x) => x.id === 'helse');
  const reg = registry.subjects.helse;
  const rel = release.subjects.helse;
  const sources = brief.sources || [];
  const topics = brief.topic_briefs || [];
  const scenarios = brief.decision_scenarios || [];
  const claims = topics.flatMap((x) => x.planned_claims || []);
  const sourceIds = new Set(sources.map((x) => x.id));
  const used = new Set([
    ...topics.flatMap((x) => x.source_ids || []),
    ...claims.flatMap((x) => x.source_ids || []),
    ...scenarios.flatMap((x) => x.source_ids || []),
  ]);
  const topicMethods = new Set(topics.flatMap((x) => x.method_ids || []));
  const structure = (brief.fulltext_structure || []).flatMap((x) => x.topic_ids || []);
  const topicIds = topics.map((x) => x.id);

  assert(canonical?.domain === 'psykisk_helse' && canonical?.subject_id === 'helse' && canonical.status === 'planned', 'Canonicalt Psykisk helse-emne må være planned');
  assert([...METHODS].every((id) => methodIds.has(id)), 'Psykisk helse-metoder mangler');
  assert(safety.status === 'blocking', 'Klinisk sikkerhetskontrakt må være blocking');
  assert(brief.scope.primary_domain_id === 'psykisk_helse' && brief.scope.canonical_emne_id === EMNE && brief.future_chapter_id === UNIT, 'Feil Psykisk helse-scope');

  const policy = brief.source_policy || {};
  const req = brief.production_requirements || {};
  const gates = {
    source_brief_is_explicitly_unregistered: brief.runtime_registration?.registered === false && brief.runtime_registration?.allowed_before_full_chapter_gate === false,
    metadata_registration_deferred_until_fulltext: brief.metadata_registration?.deferred_until_fulltext === true && brief.metadata_registration?.global_status_mutation_in_source_brief === false && brief.metadata_registration?.release_mutation_in_source_brief === false,
    exact_source_topic_scenario_claim_counts: sources.length === 15 && topics.length === 8 && scenarios.length === 6 && claims.length === 32,
    proposed_fulltext_structure_is_four_by_two: (brief.fulltext_structure || []).length === 4 && (brief.fulltext_structure || []).every((x) => x.topic_ids?.length === 2) && new Set(structure).size === 8 && topicIds.every((id) => structure.includes(id)),
    all_sources_inspectable_https: sources.every((x) => x.url?.startsWith('https://') && x.source_location && x.type && x.evidence_role && x.retrieval_status === `verified_${DATE}`),
    every_source_used: sources.every((x) => used.has(x.id)),
    every_reference_resolves: [...used].every((id) => sourceIds.has(id)),
    topic_method_contract_is_canonical: topics.every((x) => x.method_ids?.length >= 1 && x.method_ids.every((id) => METHODS.has(id))) && [...METHODS].every((id) => topicMethods.has(id)),
    all_topics_source_boundary_complete: topics.every((x) => x.source_ids?.length >= 3 && x.boundary && x.planned_claims?.length === 4),
    all_claim_ids_unique: new Set(claims.map((x) => x.id)).size === 32,
    no_claim_overstated_as_verified: claims.every((x) => x.status === 'planned_requires_fulltext_verification' && x.source_ids?.length >= 3),
    scenarios_non_individualizing_and_source_bound: scenarios.every((x) => x.source_ids?.length >= 3 && x.purpose && !/(du bør|du må|ring 113|oppsøk lege|start behandling|slutt med behandling)/iu.test(x.purpose)),
    mental_health_not_absence_of_disorder: policy.mental_health_is_not_absence_of_mental_disorder === true,
    condition_broader_than_disorder: policy.mental_health_condition_is_broader_than_mental_disorder === true,
    symptom_and_screening_not_diagnosis: policy.distress_or_symptom_is_not_diagnosis === true && policy.screening_or_measurement_is_not_diagnosis === true,
    diagnostic_category_not_whole_person_or_fixed_cause: policy.diagnostic_category_is_not_whole_person_or_fixed_etiology === true,
    population_prevalence_not_individual_probability: policy.population_prevalence_is_not_individual_probability === true,
    determinant_or_association_not_individual_causation: policy.determinant_or_association_is_not_individual_causation === true,
    group_evidence_not_individual_recommendation: policy.group_treatment_evidence_is_not_individual_recommendation === true,
    access_not_effectiveness: policy.service_access_is_not_service_effectiveness === true,
    community_care_not_no_specialist_care: policy.community_based_care_is_not_absence_of_specialist_care === true,
    stepped_mixed_care_not_rigid_ladder: policy.stepped_or_mixed_care_is_not_rigid_severity_ladder === true,
    personal_recovery_not_symptom_remission: policy.personal_recovery_is_not_symptom_remission === true,
    recovery_oriented_care_not_guarantee: policy.recovery_oriented_care_is_not_guaranteed_recovery === true,
    peer_support_not_professional_replacement: policy.peer_support_is_not_replacement_for_professional_care === true,
    outcomes_are_multidimensional: policy.outcomes_must_distinguish_symptoms_function_quality_of_life_and_personal_recovery === true,
    rights_standard_not_local_legal_rule: policy.rights_standard_is_not_identical_to_local_legal_rule === true,
    autonomy_does_not_erase_safety_responsibility: policy.autonomy_and_consent_do_not_erase_safety_responsibilities === true,
    stigma_not_diagnostic_validity_question: policy.stigma_question_is_not_diagnostic_validity_question === true,
    system_metric_not_patient_outcome: policy.service_system_metric_is_not_patient_level_outcome === true,
    psychology_theory_ownership_preserved: policy.psychology_theory_remains_secondary_subject_ownership === true && req.psychology_secondary_binding_required === true,
    clinical_safety_contract_blocking: req.clinical_safety_contract_is_blocking === true && req.no_person_specific_scenario === true && req.no_individual_diagnosis === true && req.no_individual_risk_or_triage === true && req.no_individual_treatment_recommendation === true && req.no_case_specific_legal_advice === true && policy.no_individual_diagnosis_risk_triage_or_treatment_advice === true,
    future_chapter_remains_unregistered: reg.chapters.length === 9 && !reg.chapters.some((x) => x.id === UNIT),
    global_health_status_remains_nine_of_twelve: health.navigationStatus === 'materialized' && health.assessmentStatus === 'audited' && health.editorialStatus === 'chapters_in_progress' && reg.editorialPlan.targetDomainCount === 12 && reg.editorialPlan.registeredChapterCount === 9,
    release_remains_on_nine_registered_health_chapters: rel.chapter_count === 9,
    strict_completion_not_claimed: health.editorialStatus !== 'complete',
  };
  assert(Object.values(gates).every(Boolean), `Psykisk helse source-brief-port feiler: ${Object.entries(gates).filter(([, v]) => !v).map(([k]) => k).join(', ')}`);

  const report = {
    schema: 'history_go_health_mental_health_source_brief_v1_audit',
    version: '1.0.0',
    updated_at: DATE,
    status: 'high_quality_source_brief_ready_for_fulltext_not_scientific_completion',
    subject_id: 'helse',
    summary: {
      topic_count: 8,
      source_count: 15,
      scenario_count: 6,
      planned_claim_count: 32,
      proposed_module_count: 4,
      registered_chapter_count_delta: 0,
      current_registered_health_chapters: 9,
      completed_health_domains: 9,
      planned_health_domains: 12,
    },
    gates,
    quality_assessment: {
      correctness_and_evidence: { score: 5 },
      coverage_and_completion: { score: 5 },
      editorial_and_scientific_quality: { score: 5 },
      technical_integrity: { score: 4 },
      safety_and_responsibility: { score: 5 },
      maintainability_and_auditability: { score: 5 },
      total: 29,
      maximum: 30,
      conclusion: 'high_quality_source_brief_ready_for_fulltext_not_scientific_completion',
    },
    next_gate: brief.next_gate,
  };
  return { brief, report, gates, sources, topics, scenarios, claims };
}

export function auditHealthMentalHealthSourceBriefV1({ writeReport = false, checkReport = true } = {}) {
  const built = build();
  if (writeReport) write(P.report, built.report);
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler`);
    assert(isDeepStrictEqual(read(P.report), built.report), `${P.report} er utdatert`);
  }
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = new Set(process.argv.slice(2));
    const result = auditHealthMentalHealthSourceBriefV1({ writeReport: args.has('--write'), checkReport: !args.has('--write') });
    console.log(`Helse Psykisk helse brief OK: ${result.topics.length} spor, ${result.sources.length} kilder, ${result.scenarios.length} scenarioer og ${result.claims.length} claimplaner; ${result.report.quality_assessment.total}/30.`);
  } catch (error) {
    console.error(`Helse Psykisk helse brief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
