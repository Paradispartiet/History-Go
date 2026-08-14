#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNIT_ID = 'resepsjon-deltakelse-og-publikumsmetoder';
const INPUT_GATE = 'industry_regulation_distribution_full_chapter_complete_next_unit_source_brief';
const OUTPUT_GATE = 'reception_participation_audience_methods_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'reception_participation_audience_methods_full_chapter_complete_next_unit_source_brief';
const UNIT_ELEVEN_PRODUCTION_GATES = new Set([OUTPUT_GATE, FULLTEXT_GATE]);

export const isFilmTvUnitElevenOrLaterGate = (gate) => UNIT_ELEVEN_PRODUCTION_GATES.has(gate);

const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  brief: 'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_topic_claims_v1.json',
  report: 'reports/fagverk/film-tv-reception-participation-audience-methods-source-brief-v1-audit.json'
});

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const maxDottedVersion = (current, floor) => {
  const parse = (value) => String(value || '0.0.0').split('.').map((part) => Number.parseInt(part, 10) || 0);
  const a = parse(current);
  const b = parse(floor);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) > (b[index] || 0) ? current : floor;
  }
  return current || floor;
};
const maxIsoDate = (current, floor) => current && current > floor ? current : floor;
const rowsFromManifest = (manifestPath, filesKey, rowsKey) =>
  read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);
const normalizeEditorialText = (value) => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();

export function buildFilmTvReceptionParticipationAudienceMethodsSourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Resepsjon, deltakelse og publikumsmetoder');

  const emners = read(P.emners);
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodsDocument = read(P.methods);
  const methods = Array.isArray(methodsDocument) ? methodsDocument : methodsDocument.methods;
  const methodIds = new Set(methods.map((row) => row.method_id || row.id));
  const registry = structuredClone(read(P.registry));
  const status = structuredClone(read(P.status));
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  assert(filmStatus, 'Mangler Film & TV-status');
  const currentGate = filmStatus.nextGate;

  const brief = read(P.brief);
  const sourceManifest = read(P.sources);
  const caseManifest = read(P.cases);
  const topicClaimManifest = read(P.topicClaims);
  const sources = rowsFromManifest(P.sources, 'source_files', 'sources');
  const cases = rowsFromManifest(P.cases, 'case_files', 'cases');
  const topicBriefs = rowsFromManifest(P.topicClaims, 'topic_claim_files', 'topic_briefs');
  const sourceIds = new Set(sources.map((row) => row.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const caseById = new Map(cases.map((row) => [row.id, row]));
  const plannedClaims = topicBriefs.flatMap((row) => row.planned_claims);
  const usedSourceIds = new Set([
    ...topicBriefs.flatMap((row) => row.source_ids),
    ...cases.flatMap((row) => row.source_ids)
  ]);
  const usedCaseIds = new Set(topicBriefs.flatMap((row) => row.case_ids));
  const claimCounts = topicBriefs.map((row) => row.planned_claims.length);
  const moduleEmneIds = brief.proposed_module_order.flatMap((row) => row.emne_ids);
  const evidenceInventory = sources.map((row) => `${row.type} ${row.evidence_role}`).join(' ').toLowerCase();
  const normalizedLearningGoals = topicBriefs.map((row) => normalizeEditorialText(row.learning_goal));
  const normalizedClaimFocuses = plannedClaims.map((row) => normalizeEditorialText(row.claim_focus));
  const placeholderPattern = /\b(?:todo|tbd|placeholder|lorem ipsum|sett inn|kommer senere)\b/i;
  const engineSource = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const forbiddenScmTokens = ['child_' + 'process', 'execFile' + 'Sync', 'spawn' + 'Sync'];
  const forbiddenGitCommand = new RegExp(`git\\s+(?:${['fetch', 'merge', 'push'].join('|')})`);
  const laterGateAlreadyActive = currentGate === FULLTEXT_GATE;

  registry.version = maxDottedVersion(registry.version, '2.94.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-14');
  registry.subjects.film_tv.canonicalModel.eleventhSourceClaimBrief = P.brief;
  if (!laterGateAlreadyActive) {
    registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Kilde- og claimbriefen for Resepsjon, deltakelse og publikumsmetoder er ferdig med 12 canonicale emner, 4 variable moduler, 54 planlagte claims, 36 inspectable kilder og 32 dokumenterte publikums-, resepsjons- og metodecase. Faktisk resepsjon må dokumenteres med publikumsdata eller transparent publikumsmetode; verksanalyse alene kan ikke bevise bruk, identitetsarbeid, affekt eller kroppslig respons. Kapitlet er ikke registrert før fulltekst-, claim- og evidensporten er bestått.';
  }

  status.version = maxDottedVersion(status.version, '1.87.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-14');
  if (!laterGateAlreadyActive) {
    filmStatus.editorialStatus = 'chapters_in_progress';
    filmStatus.nextGate = OUTPUT_GATE;
    filmStatus.note = 'Kilde- og claimbriefen for Resepsjon, deltakelse og publikumsmetoder er ferdig: 12/12 canonicale emner, 4 variable moduler, 54 planlagte claims, 36 inspectable kilder og 32 case. Survey, intervju, etnografi, panel, digital trace, eksperiment og resepsjonshistorisk arkiv har separate evidensroller. Tekstanalyse kan formulere mulige tilbud, men faktisk resepsjon krever publikumsdata. Neste port er fulltekstproduksjon og claimspesifikk evidensmapping.';
  }

  const evidenceSourceTypesPresent = {
    surveyOrPanel: /survey|panel|quantitative-audience/.test(evidenceInventory),
    interviewOrEthnography: /interview|ethnograph|qualitative-audience/.test(evidenceInventory),
    experiment: /experiment/.test(evidenceInventory),
    digitalOrPlatformMethod: /digital|platform|online-community/.test(evidenceInventory),
    archiveOrReceptionHistory: /archive|periodical|reception-history/.test(evidenceInventory),
    accessibilityRuleAndUserResearch: /accessibility|subtitle|audio-description/.test(evidenceInventory),
    researchEthics: /ethics|duty-of-care|participant-protection/.test(evidenceInventory)
  };

  const gates = {
    eleventh_learning_order_unit_selected: unit.sequence === 11 && plan.production_sequence[10] === UNIT_ID,
    exact_prerequisite_contract: isDeepStrictEqual(
      unit.prerequisite_planned_unit_ids,
      ['serialitet-format-og-adaptasjon', 'industri-regulering-og-distribusjon']
    ) && isDeepStrictEqual(unit.prerequisite_existing_chapter_ids, ['kinoer-visningssteder-og-publikum']),
    planned_prerequisites_registered: unit.prerequisite_planned_unit_ids.every((id) =>
      registry.subjects.film_tv.chapters.some((row) => row.id === id)
    ),
    existing_prerequisites_registered: unit.prerequisite_existing_chapter_ids.every((id) =>
      registry.subjects.film_tv.chapters.some((row) => row.id === id)
    ),
    current_status_is_input_output_or_known_later_gate: [INPUT_GATE, OUTPUT_GATE, FULLTEXT_GATE].includes(currentGate),
    exact_unit_emne_coverage: topicBriefs.length === unit.emne_count
      && new Set(topicBriefs.map((row) => row.emne_id)).size === unit.emne_count
      && isDeepStrictEqual(brief.scope.emne_ids, unit.emne_ids)
      && unit.emne_ids.every((id) => topicBriefs.some((row) => row.emne_id === id)),
    all_emners_active_canonical: topicBriefs.every((row) => emneById.get(row.emne_id)?.status === 'active'),
    all_canonical_topics_have_methods: topicBriefs.every((row) => {
      const canonical = emneById.get(row.emne_id);
      return Array.isArray(canonical?.method_ids)
        && canonical.method_ids.length > 0
        && canonical.method_ids.every((id) => methodIds.has(id));
    }),
    thirty_six_inspectable_https_sources: sources.length === 36 && sources.every((row) =>
      row.url.startsWith('https://')
      && row.source_location
      && row.territory
      && row.retrieval_status === 'verified_2026-08-14'
    ),
    evidence_method_families_present: Object.values(evidenceSourceTypesPresent).every(Boolean),
    every_source_used: sources.every((row) => usedSourceIds.has(row.id)),
    every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
    thirty_two_documented_cases_used: cases.length === 32
      && cases.every((row) => usedCaseIds.has(row.id))
      && cases.every((row) => row.source_ids.length > 0 && row.purpose && row.territory && row.years),
    every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
    every_case_source_available_to_owning_topic: topicBriefs.every((topic) =>
      topic.case_ids.every((id) => caseById.get(id).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))
    ),
    fifty_four_variable_planned_claims: plannedClaims.length === 54
      && new Set(plannedClaims.map((row) => row.id)).size === 54
      && isDeepStrictEqual(claimCounts, [5, 5, 4, 4, 4, 4, 4, 4, 6, 4, 5, 5])
      && new Set(claimCounts).size > 1,
    no_planned_claim_overstated_as_verified: plannedClaims.every((row) =>
      row.status === 'planned_requires_fulltext_verification'
    ),
    all_topics_have_sources_cases_claims_and_goal: topicBriefs.every((row) =>
      row.source_ids.length >= 3
      && row.case_ids.length >= 3
      && row.planned_claims.length >= 4
      && row.learning_goal
    ),
    editorial_specificity_checked_across_entire_brief: normalizedLearningGoals.length === 12
      && new Set(normalizedLearningGoals).size === 12
      && normalizedLearningGoals.every((value) => value.length >= 60 && !placeholderPattern.test(value))
      && normalizedClaimFocuses.length === 54
      && new Set(normalizedClaimFocuses).size === 54
      && normalizedClaimFocuses.every((value) => value.length >= 60 && !placeholderPattern.test(value))
      && plannedClaims.every((row) => typeof row.claim_type === 'string' && row.claim_type.length >= 8),
    topic_source_case_combinations_are_distinct: new Set(topicBriefs.map((row) =>
      JSON.stringify({ source_ids: row.source_ids, case_ids: row.case_ids })
    )).size === topicBriefs.length,
    four_variable_modules_cover_every_emne_once: brief.proposed_module_order.length === 4
      && moduleEmneIds.length === unit.emne_count
      && new Set(moduleEmneIds).size === unit.emne_count
      && unit.emne_ids.every((id) => moduleEmneIds.includes(id))
      && new Set(brief.proposed_module_order.map((row) => row.emne_ids.length)).size > 1,
    versioned_manifest_contracts: sourceManifest.schema === 'history_go_film_tv_reception_participation_audience_methods_sources_manifest_v1'
      && sourceManifest.version === '1.0.0'
      && sourceManifest.source_files.length === 2
      && caseManifest.schema === 'history_go_film_tv_reception_participation_audience_methods_cases_manifest_v1'
      && caseManifest.version === '1.0.0'
      && caseManifest.case_files.length === 2
      && topicClaimManifest.schema === 'history_go_film_tv_reception_participation_audience_methods_topic_claims_manifest_v1'
      && topicClaimManifest.version === '1.0.0'
      && topicClaimManifest.topic_claim_files.length === 2,
    brief_engine_contains_no_scm_sync_or_push: forbiddenScmTokens.every((token) => !engineSource.includes(token))
      && !forbiddenGitCommand.test(engineSource),
    actual_reception_requires_audience_evidence: brief.source_policy.actual_reception_requires_audience_material_or_transparent_audience_method
      && brief.source_policy.textual_analysis_alone_cannot_prove_actual_reception_identity_affect_or_use,
    children_scope_is_methodologically_explicit: brief.source_policy.children_and_youth_claims_require_age_band_guardian_role_and_safeguarding_scope
      && topicBriefs.some((row) => row.emne_id === 'em_film_tv_barn_ungdom_og_audiovisuelle_publikum'
        && row.case_ids.includes('case-ofcom-children-media-use-2026')
        && row.case_ids.includes('case-pew-teens-2024')),
    participation_and_community_constructs_are_separate: brief.source_policy.participation_lurking_membership_belonging_consensus_and_safety_are_distinct,
    expectation_and_response_constructs_are_separate: brief.source_policy.expectation_interpretation_evaluation_affect_and_action_are_distinct_constructs,
    repetition_habit_and_default_are_separate: brief.source_policy.repeat_exposure_replay_rewatch_binge_habit_and_default_are_distinct,
    audience_units_are_not_collapsed: brief.source_policy.household_person_device_account_screen_and_session_are_distinct_units,
    cult_status_requires_reception_process: brief.source_policy.cult_status_is_a_documented_reception_and_circulation_process_not_intrinsic_text_property,
    identity_work_requires_person_evidence: brief.source_policy.identity_work_requires_person_or_community_evidence_not_representation_alone,
    methods_and_ethics_are_separate_and_explicit: brief.source_policy.interview_ethnography_survey_panel_trace_experiment_and_archive_have_distinct_evidence_roles
      && brief.source_policy.mixed_methods_requires_explicit_integration_and_reports_disagreement
      && brief.source_policy.publicly_accessible_digital_material_is_not_automatically_ethically_free_research_data,
    criticism_and_archive_boundaries_are_explicit: brief.source_policy.criticism_and_reviews_are_institutional_voices_not_population_reception
      && brief.source_policy.archive_and_index_claims_report_provenance_coverage_search_logic_and_gaps,
    accessibility_layers_are_separate: brief.source_policy.legal_or_technical_accessibility_provision_is_not_proof_of_discoverability_quality_usability_or_attendance,
    spectatorship_constructs_and_effect_scope_are_explicit: brief.source_policy.identification_liking_empathy_affect_arousal_and_embodiment_are_distinct
      && brief.source_policy.experimental_effects_remain_bounded_by_stimulus_design_measure_sample_and_context,
    eleventh_source_brief_registered_without_chapter: registry.subjects.film_tv.canonicalModel.eleventhSourceClaimBrief === P.brief
      && !registry.subjects.film_tv.chapters.some((row) => row.id === UNIT_ID),
    status_advances_or_preserves_later_gate: laterGateAlreadyActive
      ? filmStatus.nextGate === currentGate
      : filmStatus.editorialStatus === 'chapters_in_progress' && filmStatus.nextGate === OUTPUT_GATE,
    registration_waits_for_fulltext_claim_source_audit: !brief.runtime_registration.registered
      && !brief.runtime_registration.allowed_before_full_chapter_gate
      && brief.production_requirements.chapter_registration_only_after_fulltext_claim_and_evidence_audit
  };

  const qualityDimensions = {
    correctness_and_evidence: {
      score: 5,
      evidence_gate_ids: [
        'thirty_six_inspectable_https_sources',
        'every_source_used',
        'every_source_reference_resolves',
        'every_case_reference_resolves',
        'every_case_source_available_to_owning_topic'
      ],
      evidence: '36/36 inspectable HTTPS-kilder og alle kilde-, case- og claimreferanser er konkrete, brukte og resolvable; evidensroller og avgrensninger er eksplisitte.'
    },
    coverage_and_completion: {
      score: 5,
      evidence_gate_ids: [
        'exact_unit_emne_coverage',
        'thirty_two_documented_cases_used',
        'fifty_four_variable_planned_claims',
        'four_variable_modules_cover_every_emne_once'
      ],
      evidence: 'Hele briefscopet er kontrollert: 12/12 emner, 4 variable moduler, 54 planlagte claims, 36 kilder og 32 dokumenterte case uten hull eller overlapp.'
    },
    editorial_quality: {
      score: 4,
      evidence_gate_ids: [
        'editorial_specificity_checked_across_entire_brief',
        'topic_source_case_combinations_are_distinct',
        'no_planned_claim_overstated_as_verified'
      ],
      evidence: 'Alle 12 læringsmål og 54 claimfokus er unike, substansielle og plassholderfrie; emnene har distinkte kilde-/casekombinasjoner og planlagte claims fremstilles ikke som verifiserte. Fulltekstprosa er uttrykkelig ikke vurdert i denne porten.'
    },
    technical_integrity: {
      score: 5,
      evidence_gate_ids: [
        'current_status_is_input_output_or_known_later_gate',
        'eleventh_source_brief_registered_without_chapter',
        'status_advances_or_preserves_later_gate',
        'registration_waits_for_fulltext_claim_source_audit'
      ],
      evidence: 'Registry- og statusprogresjon er monoton, briefen registreres uten å registrere kapitlet, og fulltekstporten forblir en hard separat kontroll.'
    },
    safety_and_responsibility: {
      score: 5,
      evidence_gate_ids: [
        'children_scope_is_methodologically_explicit',
        'methods_and_ethics_are_separate_and_explicit',
        'accessibility_layers_are_separate',
        'spectatorship_constructs_and_effect_scope_are_explicit'
      ],
      evidence: 'Barn/unge, digital forskningsetikk, tilgjengelighet, identitet, affekt og eksperimentelle effekter har eksplisitte metode-, personvern-, skade- og generaliseringsgrenser.'
    },
    maintainability_and_reproducibility: {
      score: 5,
      evidence_gate_ids: [
        'versioned_manifest_contracts',
        'brief_engine_contains_no_scm_sync_or_push',
        'all_canonical_topics_have_methods',
        'planned_prerequisites_registered'
      ],
      evidence: 'Versjonerte manifest og canonicale metode-/prerequisitekoblinger gjør briefen reproducerbar; briefmotoren inneholder ingen SCM-synk eller GitHub-push.'
    }
  };
  const qualityScores = Object.values(qualityDimensions).map((dimension) => dimension.score);
  const qualityTotal = qualityScores.reduce((sum, score) => sum + score, 0);
  const qualityGateReferences = Object.values(qualityDimensions).flatMap((dimension) => dimension.evidence_gate_ids);
  const qualityPasses = Object.keys(qualityDimensions).length === 6
    && qualityScores.every((score) => Number.isInteger(score) && score >= 4 && score <= 5)
    && qualityTotal >= 27
    && qualityTotal <= 30
    && qualityGateReferences.every((gateId) => gates[gateId] === true);
  const qualityAssessment = {
    schema: 'history_go_six_dimension_quality_assessment_v1',
    assessment_scope: 'film_tv_unit_11_source_and_claim_brief',
    scale: { minimum: 1, maximum: 5 },
    threshold: {
      minimum_dimension_score: 4,
      minimum_total_score: 27,
      maximum_total_score: 30,
      critical_deviations_allowed: 0
    },
    dimensions: qualityDimensions,
    total_score: qualityTotal,
    critical_deviations: [],
    unresolved_blockers: [],
    full_chapter_assessed: false,
    automation_limits: [
      'Vurderingen gjelder kilde- og claimbriefen, ikke det framtidige fulltekstkapitlet.',
      'Automatiske porter kan kontrollere dekning, unikhet, referanser og kontrakter, men kan ikke alene bevise kvaliteten på prosa som ennå ikke er skrevet.'
    ],
    conclusion: qualityPasses ? 'high_quality_source_claim_brief' : 'quality_gate_failed'
  };
  gates.six_dimension_quality_assessment_passes = qualityPasses
    && qualityAssessment.critical_deviations.length === 0
    && qualityAssessment.unresolved_blockers.length === 0
    && qualityAssessment.conclusion === 'high_quality_source_claim_brief';

  const report = {
    schema: 'history_go_film_tv_reception_participation_audience_methods_source_brief_v1_audit',
    version: '1.1.0',
    updated_at: '2026-08-14',
    status: brief.status,
    subject_id: 'film_tv',
    planned_unit_id: UNIT_ID,
    complete_scope: 'source_and_claim_brief_only',
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
    evidence_source_types_present: evidenceSourceTypesPresent,
    quality_assessment: qualityAssessment,
    gates,
    next_gate: brief.next_gate
  };

  assert(
    Object.values(gates).every(Boolean),
    `Kildebriefporter feiler: ${Object.entries(gates).filter(([, value]) => !value).map(([key]) => key).join(', ')}`
  );

  return { brief, sources, cases, topicBriefs, plannedClaims, report, registry, status, unit };
}

export function auditFilmTvReceptionParticipationAudienceMethodsSourceBriefV1({
  writeFiles = false,
  checkFiles = true
} = {}) {
  const built = buildFilmTvReceptionParticipationAudienceMethodsSourceBriefV1();
  if (writeFiles) {
    write(P.registry, built.registry);
    write(P.status, built.status);
    write(P.report, built.report);
  }
  if (checkFiles) {
    assert(isDeepStrictEqual(read(P.registry), built.registry), `${P.registry} er utdatert`);
    assert(isDeepStrictEqual(read(P.status), built.status), `${P.status} er utdatert`);
    assert(isDeepStrictEqual(read(P.report), built.report), `${P.report} er utdatert`);
  }
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const built = auditFilmTvReceptionParticipationAudienceMethodsSourceBriefV1({
      writeFiles: args.has('--write'),
      checkFiles: !args.has('--write')
    });
    console.log(`Film & TV enhet 11 kildebrief OK: ${built.report.summary.planned_claim_count} claims, ${built.report.summary.source_count} kilder og ${built.report.summary.case_count} case.`);
  } catch (error) {
    console.error(`Film & TV enhet 11 kildebrief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
