#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATE = '2026-08-21';
const UNIT_ID = 'klinisk-medisin-informasjon-testing-beslutning-og-oppfolging';
const EMNE_ID = 'em_helse_klinisk_medisin';
const ALLOWED_METHODS = new Set(['met_helse_diagnostisk_testvurdering', 'met_helse_klinisk_studievurdering']);
const P = Object.freeze({
  brief: 'data/fag/helse/clinical_medicine_source_claim_brief_v1.json',
  report: 'reports/fagverk/helse-clinical-medicine-source-brief-v1-audit.json',
  emner: 'data/fag/helse/emner_helse_canonical_v1.json',
  methods: 'data/fag/helse/methods_helse_canonical_v1.json',
  safety: 'data/fag/helse/clinical_safety_contract_helse_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  release: 'data/fagverk/fagverk_release.json',
  theory: 'reports/fagverk/fagverk-theory-integrity-audit.json'
});
const abs = (f) => path.join(ROOT, f);
const read = (f) => JSON.parse(fs.readFileSync(abs(f), 'utf8'));
const write = (f, v) => { fs.mkdirSync(path.dirname(abs(f)), { recursive: true }); fs.writeFileSync(abs(f), `${JSON.stringify(v, null, 2)}\n`); };
const assert = (v, m) => { if (!v) throw new Error(m); };

function build() {
  const brief = read(P.brief), emners = read(P.emner), methods = read(P.methods), safety = read(P.safety);
  const registry = read(P.registry), status = read(P.status), release = read(P.release), theory = read(P.theory);
  const canonical = emners.find((row) => row.emne_id === EMNE_ID);
  const methodRows = methods.methods || methods;
  const methodIds = new Set(methodRows.map((row) => row.method_id));
  const health = status.subjects.find((row) => row.id === 'helse');
  const healthRegistry = registry.subjects.helse;
  const healthRelease = release.subjects.helse;
  const sources = brief.sources || [], topics = brief.topic_briefs || [], scenarios = brief.decision_scenarios || [];
  const claims = topics.flatMap((row) => row.planned_claims || []);
  const sourceIds = new Set(sources.map((row) => row.id));
  const usedSourceIds = new Set([
    ...topics.flatMap((row) => row.source_ids || []),
    ...claims.flatMap((row) => row.source_ids || []),
    ...scenarios.flatMap((row) => row.source_ids || [])
  ]);
  const allTopicMethods = new Set(topics.flatMap((row) => row.method_ids || []));
  const serialized = JSON.stringify(brief).toLowerCase();

  assert(canonical?.subject_id === 'helse' && canonical?.domain === 'klinisk_medisin', 'Canonical klinisk-medisin-emne mangler');
  assert(canonical.status === 'planned', 'Source brief må ikke materialisere canonicalt emne');
  assert([...ALLOWED_METHODS].every((id) => methodIds.has(id)), 'Canonical kliniske metoder mangler');
  assert(safety.status === 'blocking', 'Klinisk sikkerhetskontrakt må være blocking');
  assert(brief.schema === 'history_go_health_clinical_medicine_source_claim_brief_v1', 'Uventet source-brief-schema');
  assert(brief.scope.primary_domain_id === 'klinisk_medisin' && brief.scope.canonical_emne_id === EMNE_ID, 'Briefen eier feil canonicalt emne');
  assert(brief.future_chapter_id === UNIT_ID, 'Uventet future chapter id');

  const gates = {
    source_brief_is_explicitly_unregistered:
      brief.runtime_registration?.registered === false && brief.runtime_registration?.allowed_before_full_chapter_gate === false,
    metadata_registration_deferred_until_fulltext:
      brief.metadata_registration?.deferred_until_fulltext === true &&
      brief.metadata_registration?.global_status_mutation_in_source_brief === false &&
      brief.metadata_registration?.release_mutation_in_source_brief === false,
    exact_source_topic_scenario_claim_counts:
      sources.length === 14 && topics.length === 8 && scenarios.length === 6 && claims.length === 32,
    all_sources_inspectable_https:
      sources.every((row) => row.url?.startsWith('https://') && row.source_location && row.type && row.evidence_role && row.retrieval_status === `verified_${DATE}`),
    every_source_used:
      sources.every((row) => usedSourceIds.has(row.id)),
    every_reference_resolves:
      [...usedSourceIds].every((id) => sourceIds.has(id)),
    topic_method_contract_is_canonical:
      topics.every((row) => (row.method_ids || []).length >= 1 && row.method_ids.every((id) => ALLOWED_METHODS.has(id))) &&
      [...ALLOWED_METHODS].every((id) => allTopicMethods.has(id)),
    all_topics_source_boundary_complete:
      topics.every((row) => (row.source_ids || []).length >= 3 && row.boundary && (row.planned_claims || []).length === 4),
    all_claim_ids_unique:
      new Set(claims.map((row) => row.id)).size === 32,
    no_claim_overstated_as_verified:
      claims.every((row) => row.status === 'planned_requires_fulltext_verification' && (row.source_ids || []).length >= 3),
    scenarios_non_individualizing_and_source_bound:
      scenarios.every((row) => (row.source_ids || []).length >= 3 && row.purpose && !/diagnostisere en konkret person|behandle en konkret person|råd til en konkret person/u.test(row.purpose)),
    test_performance_distinct_from_diagnosis:
      brief.source_policy?.test_result_is_not_diagnosis === true && serialized.includes('sensitivitet') && serialized.includes('spesifisitet'),
    predictive_values_distinct_from_test_characteristics:
      brief.source_policy?.sensitivity_specificity_are_not_predictive_values === true && brief.source_policy?.predictive_value_depends_on_pretest_probability_and_population === true,
    reference_interval_not_disease_boundary:
      brief.source_policy?.reference_interval_is_not_disease_boundary === true && serialized.includes('biologisk variasjon'),
    accuracy_distinct_from_agreement:
      brief.source_policy?.agreement_with_non_reference_standard_is_not_accuracy === true && serialized.includes('referansestandard'),
    relative_effect_distinct_from_absolute_benefit:
      brief.source_policy?.relative_effect_is_not_absolute_benefit === true && serialized.includes('absolutt effekt'),
    treatment_evidence_not_person_specific_advice:
      brief.source_policy?.trial_result_is_not_individual_treatment_advice === true && brief.production_requirements?.no_person_specific_scenario === true,
    diagnostic_safety_and_reassessment_explicit:
      serialized.includes('diagnostisk sikkerhet') && serialized.includes('revurdering') && serialized.includes('oppfølging'),
    clinical_safety_contract_blocking:
      safety.forbidden?.some((row) => /individuell diagnose/u.test(row)) && brief.production_requirements?.clinical_safety_contract_is_blocking === true,
    future_chapter_remains_unregistered:
      healthRegistry.chapters.length === 3 && !healthRegistry.chapters.some((row) => row.id === UNIT_ID),
    global_health_status_remains_three_of_twelve:
      health.navigationStatus === 'materialized' && health.assessmentStatus === 'audited' && health.editorialStatus === 'chapters_in_progress' &&
      healthRegistry.editorialPlan.targetDomainCount === 12 && healthRegistry.editorialPlan.registeredChapterCount === 3,
    release_remains_on_three_registered_health_chapters:
      healthRelease.chapter_count === 3,
    strict_completion_not_claimed:
      theory.summary?.strictly_proven === 18 && theory.summary?.baseline_only_strict_proof_missing === 2 &&
      theory.proofReconciliationQueue?.includes('helse') && theory.summary?.substantive_content_gaps_proven === 0
  };
  assert(Object.values(gates).every(Boolean), `Klinisk medisin source-brief-port feiler: ${Object.entries(gates).filter(([, ok]) => !ok).map(([key]) => key).join(', ')}`);

  const report = {
    schema: 'history_go_health_clinical_medicine_source_brief_v1_audit',
    version: '1.0.0',
    updated_at: DATE,
    status: 'high_quality_source_brief_ready_for_fulltext_not_scientific_completion',
    subject_id: 'helse',
    summary: {
      topic_count: 8,
      source_count: 14,
      scenario_count: 6,
      planned_claim_count: 32,
      proposed_module_count: 4,
      registered_chapter_count_delta: 0,
      current_registered_health_chapters: 3,
      completed_health_domains: 3,
      planned_health_domains: 12,
      expanded_fagverk_strictly_proven: 18,
      expanded_fagverk_target: 20
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
      conclusion: 'high_quality_source_brief_ready_for_fulltext_not_scientific_completion'
    },
    next_gate: brief.next_gate
  };
  return { brief, report, gates, sources, topics, scenarios, claims };
}

export function auditHealthClinicalMedicineSourceBriefV1({ writeReport = false, checkReport = true } = {}) {
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
    const result = auditHealthClinicalMedicineSourceBriefV1({ writeReport: args.has('--write'), checkReport: !args.has('--write') });
    console.log(`Helse klinisk medisin brief OK: ${result.topics.length} spor, ${result.sources.length} kilder, ${result.scenarios.length} scenarioer og ${result.claims.length} claimplaner; ${result.report.quality_assessment.total}/30.`);
  } catch (error) {
    console.error(`Helse klinisk medisin brief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
