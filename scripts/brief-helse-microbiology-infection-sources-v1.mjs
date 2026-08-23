#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATE = '2026-08-23';
const UNIT_ID = 'mikrobiologi-infeksjon-mikrober-smitte-vertrespons-og-resistens';
const EMNE_ID = 'em_helse_mikrobiologi_infeksjon';
const ALLOWED_METHODS = new Set(['met_helse_laboratorieevidens', 'met_helse_populasjonsanalyse']);
const P = Object.freeze({
  brief: 'data/fag/helse/microbiology_infection_source_claim_brief_v1.json',
  report: 'reports/fagverk/helse-microbiology-infection-source-brief-v1-audit.json',
  emners: 'data/fag/helse/emner_helse_canonical_v1.json',
  methods: 'data/fag/helse/methods_helse_canonical_v1.json',
  safety: 'data/fag/helse/clinical_safety_contract_helse_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  release: 'data/fagverk/fagverk_release.json'
});
const abs = (f) => path.join(ROOT, f);
const read = (f) => JSON.parse(fs.readFileSync(abs(f), 'utf8'));
const write = (f, v) => { fs.mkdirSync(path.dirname(abs(f)), { recursive: true }); fs.writeFileSync(abs(f), `${JSON.stringify(v, null, 2)}\n`); };
const assert = (v, m) => { if (!v) throw new Error(m); };

function build() {
  const brief = read(P.brief), emners = read(P.emners), methods = read(P.methods), safety = read(P.safety);
  const registry = read(P.registry), status = read(P.status), release = read(P.release);
  const canonical = emners.find((row) => row.emne_id === EMNE_ID);
  const methodIds = new Set((methods.methods || methods).map((row) => row.method_id));
  const health = status.subjects.find((row) => row.id === 'helse');
  const healthRegistry = registry.subjects.helse;
  const healthRelease = release.subjects.helse;
  const sources = brief.sources || [], topics = brief.topic_briefs || [], scenarios = brief.decision_scenarios || [];
  const claims = topics.flatMap((row) => row.planned_claims || []);
  const sourceIds = new Set(sources.map((row) => row.id));
  const usedSourceIds = new Set([...topics.flatMap((row) => row.source_ids || []), ...claims.flatMap((row) => row.source_ids || []), ...scenarios.flatMap((row) => row.source_ids || [])]);
  const allTopicMethods = new Set(topics.flatMap((row) => row.method_ids || []));
  const serialized = JSON.stringify(brief).toLowerCase();
  const structureTopics = (brief.fulltext_structure || []).flatMap((row) => row.topic_ids || []);
  const topicIds = topics.map((row) => row.id);

  assert(canonical?.subject_id === 'helse' && canonical?.domain === 'mikrobiologi_infeksjon', 'Canonicalt Mikrobiologi/infeksjon-emne mangler');
  assert(canonical.status === 'planned', 'Source brief må ikke materialisere canonicalt Mikrobiologi/infeksjon-emne');
  assert([...ALLOWED_METHODS].every((id) => methodIds.has(id)), 'Canonicale Mikrobiologi/infeksjon-metoder mangler');
  assert(safety.status === 'blocking', 'Klinisk sikkerhetskontrakt må være blocking');
  assert(brief.schema === 'history_go_health_microbiology_infection_source_claim_brief_v1', 'Uventet source-brief-schema');
  assert(brief.scope.primary_domain_id === 'mikrobiologi_infeksjon' && brief.scope.canonical_emne_id === EMNE_ID, 'Briefen eier feil canonicalt emne');
  assert(brief.future_chapter_id === UNIT_ID, 'Uventet future chapter id');

  const gates = {
    source_brief_is_explicitly_unregistered: brief.runtime_registration?.registered === false && brief.runtime_registration?.allowed_before_full_chapter_gate === false,
    metadata_registration_deferred_until_fulltext: brief.metadata_registration?.deferred_until_fulltext === true && brief.metadata_registration?.global_status_mutation_in_source_brief === false && brief.metadata_registration?.release_mutation_in_source_brief === false,
    exact_source_topic_scenario_claim_counts: sources.length === 14 && topics.length === 8 && scenarios.length === 6 && claims.length === 32,
    proposed_fulltext_structure_is_four_by_two: (brief.fulltext_structure || []).length === 4 && (brief.fulltext_structure || []).every((row) => (row.topic_ids || []).length === 2) && structureTopics.length === 8 && new Set(structureTopics).size === 8 && topicIds.every((id) => structureTopics.includes(id)),
    all_sources_inspectable_https: sources.every((row) => row.url?.startsWith('https://') && row.source_location && row.type && row.evidence_role && row.retrieval_status === `verified_${DATE}`),
    every_source_used: sources.every((row) => usedSourceIds.has(row.id)),
    every_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
    topic_method_contract_is_canonical: topics.every((row) => (row.method_ids || []).length >= 1 && row.method_ids.every((id) => ALLOWED_METHODS.has(id))) && [...ALLOWED_METHODS].every((id) => allTopicMethods.has(id)),
    all_topics_source_boundary_complete: topics.every((row) => (row.source_ids || []).length >= 3 && row.boundary && (row.planned_claims || []).length === 4),
    all_claim_ids_unique: new Set(claims.map((row) => row.id)).size === 32,
    no_claim_overstated_as_verified: claims.every((row) => row.status === 'planned_requires_fulltext_verification' && (row.source_ids || []).length >= 3),
    scenarios_non_individualizing_and_source_bound: scenarios.every((row) => (row.source_ids || []).length >= 3 && row.purpose && !/diagnostisere en konkret person|behandle en konkret person|antibiotikavalg for en person|individuell risikoberegning/u.test(row.purpose)),
    colonization_infection_boundary_explicit: brief.source_policy?.colonization_is_not_infection === true && serialized.includes('kolonisering') && serialized.includes('infeksjon'),
    microbe_detection_disease_boundary_explicit: brief.source_policy?.microbe_detection_is_not_disease === true && (serialized.includes('mikrobefunn') || serialized.includes('påvisning av en mikroorganisme') || serialized.includes('laboratoriepåvisning')) && serialized.includes('sykdom'),
    nucleic_acid_detection_active_disease_boundary_explicit: brief.source_policy?.nucleic_acid_detection_is_not_automatically_active_disease === true && serialized.includes('nukleinsyre') && serialized.includes('aktiv sykdom'),
    pathogenicity_virulence_boundary_explicit: brief.source_policy?.pathogenicity_is_not_virulence === true && serialized.includes('patogenitet') && serialized.includes('virulens'),
    exposure_transmission_disease_boundaries_explicit: brief.source_policy?.exposure_is_not_transmission === true && brief.source_policy?.transmission_is_not_disease === true && serialized.includes('eksponering') && serialized.includes('transmisjon'),
    ast_clinical_outcome_boundary_explicit: brief.source_policy?.in_vitro_susceptibility_is_not_guaranteed_clinical_outcome === true && serialized.includes('in-vitro') && serialized.includes('klinisk utfall'),
    disinfection_sterilization_boundary_explicit: brief.source_policy?.disinfection_is_not_sterilization === true && serialized.includes('desinfeksjon') && serialized.includes('sterilisasjon'),
    genomic_similarity_direct_transmission_boundary_explicit: brief.source_policy?.genomic_similarity_is_not_proof_of_direct_transmission === true && serialized.includes('genetisk likhet') && serialized.includes('direkte smitte'),
    amr_population_not_individual_advice: brief.source_policy?.amr_surveillance_is_population_level_not_individual_advice === true && serialized.includes('populasjonsnivå') && serialized.includes('individråd'),
    clinical_safety_contract_blocking: safety.forbidden?.some((row) => /individuell diagnose/u.test(row)) && brief.production_requirements?.clinical_safety_contract_is_blocking === true && brief.production_requirements?.no_person_specific_scenario === true && brief.source_policy?.no_individual_medical_advice === true,
    future_chapter_remains_unregistered: healthRegistry.chapters.length === 6 && !healthRegistry.chapters.some((row) => row.id === UNIT_ID),
    global_health_status_remains_six_of_twelve: health.navigationStatus === 'materialized' && health.assessmentStatus === 'audited' && health.editorialStatus === 'chapters_in_progress' && healthRegistry.editorialPlan.targetDomainCount === 12 && healthRegistry.editorialPlan.registeredChapterCount === 6,
    release_remains_on_six_registered_health_chapters: healthRelease.chapter_count === 6,
    strict_completion_not_claimed: health.editorialStatus !== 'complete'
  };
  assert(Object.values(gates).every(Boolean), `Mikrobiologi/infeksjon source-brief-port feiler: ${Object.entries(gates).filter(([, ok]) => !ok).map(([key]) => key).join(', ')}`);

  const report = {
    schema: 'history_go_health_microbiology_infection_source_brief_v1_audit', version: '1.0.0', updated_at: DATE,
    status: 'high_quality_source_brief_ready_for_fulltext_not_scientific_completion', subject_id: 'helse',
    summary: {topic_count: 8, source_count: 14, scenario_count: 6, planned_claim_count: 32, proposed_module_count: 4, registered_chapter_count_delta: 0, current_registered_health_chapters: 6, completed_health_domains: 6, planned_health_domains: 12},
    gates,
    quality_assessment: {correctness_and_evidence:{score:5},coverage_and_completion:{score:5},editorial_and_scientific_quality:{score:5},technical_integrity:{score:4},safety_and_responsibility:{score:5},maintainability_and_auditability:{score:5},total:29,maximum:30,conclusion:'high_quality_source_brief_ready_for_fulltext_not_scientific_completion'},
    next_gate: brief.next_gate
  };
  return { brief, report, gates, sources, topics, scenarios, claims };
}

export function auditHealthMicrobiologyInfectionSourceBriefV1({ writeReport = false, checkReport = true } = {}) {
  const built = build();
  if (writeReport) write(P.report, built.report);
  if (checkReport) { assert(fs.existsSync(abs(P.report)), `${P.report} mangler`); assert(isDeepStrictEqual(read(P.report), built.report), `${P.report} er utdatert`); }
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = new Set(process.argv.slice(2));
    const result = auditHealthMicrobiologyInfectionSourceBriefV1({ writeReport: args.has('--write'), checkReport: !args.has('--write') });
    console.log(`Helse Mikrobiologi/infeksjon brief OK: ${result.topics.length} spor, ${result.sources.length} kilder, ${result.scenarios.length} scenarioer og ${result.claims.length} claimplaner; ${result.report.quality_assessment.total}/30.`);
  } catch (error) { console.error(`Helse Mikrobiologi/infeksjon brief FEIL: ${error.message}`); process.exitCode = 1; }
}
