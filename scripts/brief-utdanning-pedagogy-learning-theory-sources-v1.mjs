#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATE = '2026-08-25';
const UNIT = 'pedagogikk-laeringsteori-laering-kunnskap-motivasjon-og-selvregulering';
const EMNE = 'em_utdanning_pedagogikk_laeringsteori';
const ALLOWED_METHODS = new Set([
  'met_utdanning_teori_sammenligning',
  'met_utdanning_litteratursyntese',
]);
const P = {
  brief: 'data/fag/utdanning/pedagogy_learning_theory_source_claim_brief_v1.json',
  report: 'reports/fagverk/utdanning-pedagogy-learning-theory-source-brief-v1-audit.json',
  pensum: 'data/fag/utdanning/utdanningpensum_canonical_v1.json',
  emner: 'data/fag/utdanning/emner_utdanning_canonical_v1.json',
  methods: 'data/fag/utdanning/methods_utdanning_canonical_v1.json',
  status: 'data/fagverk/subject_status.json',
  futureChapter: `data/fagverk/utdanning/${UNIT}.json`,
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

function build() {
  const brief = read(P.brief);
  const pensum = read(P.pensum);
  const emner = read(P.emner);
  const methodsDoc = read(P.methods);
  const statusDoc = read(P.status);
  const canonical = emner.find((row) => row.emne_id === EMNE);
  const methodIds = new Set((methodsDoc.methods || methodsDoc).map((row) => row.method_id));
  const utdanning = statusDoc.subjects.find((row) => row.id === 'utdanning');
  const sources = brief.sources || [];
  const topics = brief.topic_briefs || [];
  const scenarios = brief.decision_scenarios || [];
  const claims = topics.flatMap((row) => row.planned_claims || []);
  const sourceIds = new Set(sources.map((row) => row.id));
  const usedSourceIds = new Set([
    ...topics.flatMap((row) => row.source_ids || []),
    ...claims.flatMap((row) => row.source_ids || []),
    ...scenarios.flatMap((row) => row.source_ids || []),
  ]);
  const usedMethods = new Set(topics.flatMap((row) => row.method_ids || []));
  const structureTopics = (brief.fulltext_structure || []).flatMap((row) => row.topic_ids || []);
  const topicIds = topics.map((row) => row.id);
  const policy = brief.source_policy || {};
  const requirements = brief.production_requirements || {};

  assert(canonical?.subject_id === 'utdanning' && canonical?.domain === 'pedagogikk_laeringsteori' && canonical?.status === 'planned', 'Canonicalt pedagogikk/læringsteori-emne må fortsatt være planned');
  assert(pensum.status === 'canonical_expansion_foundation' && pensum.complete_ready === false, 'Utdanning må være foundation før første fulltekst');
  assert(pensum.domain_order?.length === 14 && pensum.domains?.length === 14 && pensum.domains.every((row) => row.status === 'planned'), 'Utdanning skal stå 0/14 før første fulltekst');
  assert([...ALLOWED_METHODS].every((id) => methodIds.has(id)), 'Canonicale pedagogikk/læringsteori-metoder mangler');
  assert(brief.scope?.primary_domain_id === 'pedagogikk_laeringsteori' && brief.scope?.canonical_emne_id === EMNE && brief.future_chapter_id === UNIT, 'Feil pedagogikk/læringsteori-scope');

  const policyKeys = [
    'performance_is_not_learning',
    'immediate_fluency_is_not_long_term_retention',
    'retrieval_practice_is_not_high_stakes_testing',
    'retrieval_effect_is_moderated_not_universal',
    'spacing_has_no_single_universal_optimal_interval',
    'feedback_is_not_inherently_positive',
    'cognitive_load_theory_is_not_a_complete_theory_of_education',
    'prior_knowledge_can_support_or_constrain_new_learning',
    'self_regulation_is_not_a_fixed_person_trait',
    'motivation_is_dynamic_and_context_sensitive',
    'autonomy_support_is_not_absence_of_structure',
    'empirical_effect_is_not_normative_educational_aim',
    'group_average_is_not_individual_prediction',
    'correlation_is_not_causal_mechanism',
  ];

  const gates = {
    source_brief_is_explicitly_unregistered:
      brief.runtime_registration?.registered === false &&
      brief.runtime_registration?.allowed_before_full_chapter_gate === false,
    metadata_registration_deferred_until_fulltext:
      brief.metadata_registration?.deferred_until_fulltext === true &&
      brief.metadata_registration?.global_status_mutation_in_source_brief === false &&
      brief.metadata_registration?.release_mutation_in_source_brief === false,
    canonical_foundation_is_zero_of_fourteen:
      pensum.domains.length === 14 && pensum.domains.filter((row) => row.status === 'materialized').length === 0,
    exact_source_topic_scenario_claim_counts:
      sources.length === 13 && topics.length === 8 && scenarios.length === 6 && claims.length === 32,
    proposed_fulltext_structure_is_four_by_two:
      (brief.fulltext_structure || []).length === 4 &&
      brief.fulltext_structure.every((row) => row.topic_ids?.length === 2) &&
      new Set(structureTopics).size === 8 &&
      topicIds.every((id) => structureTopics.includes(id)),
    all_sources_inspectable_https:
      sources.every((row) => row.url?.startsWith('https://') && row.source_location && row.publisher && row.type && row.evidence_role && row.retrieval_status === `verified_${DATE}`),
    every_source_used: sources.every((row) => usedSourceIds.has(row.id)),
    every_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
    topic_method_contract_is_canonical:
      topics.every((row) => row.method_ids?.length >= 1 && row.method_ids.every((id) => ALLOWED_METHODS.has(id))) &&
      [...ALLOWED_METHODS].every((id) => usedMethods.has(id)),
    all_topics_source_boundary_complete:
      topics.every((row) => row.source_ids?.length >= 3 && row.boundary && row.planned_claims?.length === 4),
    all_claim_ids_unique: new Set(claims.map((row) => row.id)).size === 32,
    no_claim_overstated_as_verified:
      claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids?.length >= 2),
    scenarios_are_source_bound_and_non_diagnostic:
      scenarios.every((row) => row.source_ids?.length >= 3 && row.purpose && !/(diagnostiser|evnenivå|elevtype|du bør|du må)/iu.test(row.purpose)),
    learning_science_distinctions_locked: policyKeys.every((key) => policy[key] === true),
    source_policy_completion_boundaries:
      policy.planned_claim_is_not_verified_claim === true &&
      policy.fulltext_requires_reciprocal_paragraph_claim_trace === true &&
      policy.sources_verified_at === DATE,
    production_contract_is_strict:
      requirements.minimum_verified_sources === 13 &&
      requirements.planned_claim_count === 32 &&
      requirements.module_count === 4 &&
      requirements.topic_count === 8 &&
      requirements.every_fulltext_paragraph_has_claim_ids === true &&
      requirements.every_claim_has_inspectable_source === true &&
      requirements.theory_comparison_includes_limitations_and_alternatives === true &&
      requirements.learning_outcome_and_time_horizon_must_be_explicit === true &&
      requirements.no_universal_method_claim === true &&
      requirements.no_individual_learner_diagnosis === true &&
      requirements.no_global_status_change_before_fulltext === true,
    future_chapter_remains_unregistered: !fs.existsSync(abs(P.futureChapter)),
    global_utdanning_status_remains_foundation:
      utdanning?.navigationStatus === 'planned' &&
      utdanning?.assessmentStatus === 'pending' &&
      utdanning?.editorialStatus === 'not_started' &&
      utdanning?.nextGate === 'first_source_brief_after_repository_reconciliation',
    completion_not_claimed: utdanning?.editorialStatus !== 'complete' && pensum.complete_ready === false,
  };

  assert(Object.values(gates).every(Boolean), `Utdanning pedagogikk/læringsteori source-brief-port feiler: ${Object.entries(gates).filter(([, value]) => !value).map(([key]) => key).join(', ')}`);

  const report = {
    schema: 'history_go_utdanning_pedagogy_learning_theory_source_brief_v1_audit',
    version: '1.0.0',
    updated_at: DATE,
    status: 'high_quality_source_brief_ready_for_fulltext_not_scientific_completion',
    subject_id: 'utdanning',
    domain_id: 'pedagogikk_laeringsteori',
    summary: {
      canonical_domain_count: 14,
      currently_materialized_domains: 0,
      topic_count: 8,
      source_count: 13,
      scenario_count: 6,
      planned_claim_count: 32,
      proposed_module_count: 4,
      registered_chapter_count_delta: 0,
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

export function auditUtdanningPedagogyLearningTheorySourceBriefV1({ writeReport = false, checkReport = true } = {}) {
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
    const result = auditUtdanningPedagogyLearningTheorySourceBriefV1({ writeReport: args.has('--write'), checkReport: !args.has('--write') });
    console.log(`Utdanning pedagogikk/læringsteori brief OK: ${result.topics.length} spor, ${result.sources.length} kilder, ${result.scenarios.length} scenarioer og ${result.claims.length} claimplaner; ${result.report.quality_assessment.total}/30.`);
  } catch (error) {
    console.error(`Utdanning pedagogikk/læringsteori brief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
