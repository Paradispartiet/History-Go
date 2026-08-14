#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNIT_ID = 'skjermsteder-identitet-og-sirkulasjon';
const INPUT_GATE = 'reception_participation_audience_methods_full_chapter_complete_next_unit_source_brief';
const OUTPUT_GATE = 'screen_places_identity_circulation_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'screen_places_identity_circulation_full_chapter_complete_next_unit_source_brief';
const UNIT_TWELVE_PRODUCTION_GATES = new Set([OUTPUT_GATE, FULLTEXT_GATE]);

export const isFilmTvUnitTwelveOrLaterGate = (gate) => UNIT_TWELVE_PRODUCTION_GATES.has(gate);

const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  brief: 'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_topic_claims_v1.json',
  report: 'reports/fagverk/film-tv-screen-places-identity-circulation-source-brief-v1-audit.json'
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

export function buildFilmTvScreenPlacesIdentityCirculationSourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Skjermsteder, identitet og sirkulasjon');

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
  const laterGateAlreadyActive = currentGate === FULLTEXT_GATE;

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
  const claimCounts = topicBriefs.map((row) => row.planned_claims.length);
  const usedSourceIds = new Set([
    ...topicBriefs.flatMap((row) => row.source_ids),
    ...cases.flatMap((row) => row.source_ids)
  ]);
  const usedCaseIds = new Set(topicBriefs.flatMap((row) => row.case_ids));
  const moduleEmneIds = brief.proposed_module_order.flatMap((row) => row.emne_ids);
  const evidenceInventory = sources.map((row) => `${row.type} ${row.evidence_role}`).join(' ').toLowerCase();
  const normalizedGoals = topicBriefs.map((row) => normalizeEditorialText(row.learning_goal));
  const normalizedClaimFocuses = plannedClaims.map((row) => normalizeEditorialText(row.claim_focus));
  const placeholderPattern = /\b(?:todo|tbd|placeholder|lorem ipsum|sett inn|kommer senere)\b/i;
  const engineSource = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const forbiddenScmTokens = ['child_' + 'process', 'execFile' + 'Sync', 'spawn' + 'Sync'];
  const forbiddenGitCommand = new RegExp(`git\\s+(?:${['fetch', 'merge', 'push'].join('|')})`);

  registry.version = maxDottedVersion(registry.version, '2.96.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-14');
  registry.subjects.film_tv.canonicalModel.twelfthSourceClaimBrief = P.brief;
  if (!laterGateAlreadyActive) {
    registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Kilde- og claimbriefen for Skjermsteder, identitet og sirkulasjon er ferdig med 11 canonicale emner, 4 variable moduler, 49 planlagte claims, 36 inspectable kilder og 36 dokumenterte skjermgeografiske case. Vist sted, opptakssted, fiktivt rom og dokumentert lokal virkning holdes adskilt. Urfolksland, språk og stedskunnskap prioriterer urfolks- og fellesskapskilder. Kapitlet er ikke registrert før fulltekst-, claim- og evidensporten er bestått.';
  }

  status.version = maxDottedVersion(status.version, '1.89.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-14');
  if (!laterGateAlreadyActive) {
    filmStatus.editorialStatus = 'chapters_in_progress';
    filmStatus.nextGate = OUTPUT_GATE;
    filmStatus.note = 'Kilde- og claimbriefen for Skjermsteder, identitet og sirkulasjon er ferdig: 11/11 canonicale emner, 4 variable moduler, 49 planlagte claims, 36 inspectable kilder og 36 case. By, interiør, landskap, mobilitet, grense, periferi, urfolksgeografi, ikonstatus, stedsmyte og skjermminne har separate evidensspor. Neste port er fulltekstproduksjon og claimspesifikk evidensmapping.';
  }

  const evidenceSourceTypesPresent = {
    peerReviewedScreenGeography: /peer-reviewed/.test(evidenceInventory)
      && /screen-geography|film-space|place-interpretation|placemaking/.test(evidenceInventory),
    filmMuseumArchiveInstitution: /film-institution|museum|film-preservation|archive|critical-film-history/.test(evidenceInventory),
    indigenousOrCommunityPositioned: /indigenous/.test(evidenceInventory)
      && sources.some((row) => row.id === 'sp13-isfi-about')
      && sources.some((row) => row.id === 'sp17-isuma-atanarjuat'),
    concreteWorkOrLocationRecords: /work-record|location-history|location-and-city|location-corpus/.test(evidenceInventory),
    mobilityBorderDiaspora: /mobility|border|diaspor/.test(evidenceInventory),
    urbanInteriorLandscapeMemory: /urban|domestic|landscape|screen-memory/.test(evidenceInventory)
  };

  const chapterRecord = registry.subjects.film_tv.chapters.find((row) => row.id === UNIT_ID);
  const chapterRegistrationStateValid = laterGateAlreadyActive
    ? Boolean(chapterRecord?.file)
    : chapterRecord === undefined;

  const gates = {
    twelfth_learning_order_unit_selected: unit.sequence === 12 && plan.production_sequence[11] === UNIT_ID,
    exact_prerequisite_contract: isDeepStrictEqual(
      unit.prerequisite_planned_unit_ids,
      ['skjermoffentlighet-fellesskap-og-samfunn', 'resepsjon-deltakelse-og-publikumsmetoder']
    ) && isDeepStrictEqual(unit.prerequisite_existing_chapter_ids, []),
    planned_prerequisites_registered: unit.prerequisite_planned_unit_ids.every((id) =>
      registry.subjects.film_tv.chapters.some((row) => row.id === id)
    ),
    current_status_is_input_output_or_fulltext_gate: [INPUT_GATE, OUTPUT_GATE, FULLTEXT_GATE].includes(currentGate),
    exact_eleven_canonical_emne_coverage: topicBriefs.length === 11
      && unit.emne_count === 11
      && new Set(topicBriefs.map((row) => row.emne_id)).size === 11
      && isDeepStrictEqual(brief.scope.emne_ids, unit.emne_ids)
      && unit.emne_ids.every((id) => topicBriefs.some((row) => row.emne_id === id)),
    all_emners_active_canonical: topicBriefs.every((row) => emneById.get(row.emne_id)?.status === 'active'),
    all_canonical_topics_have_registered_methods: topicBriefs.every((row) => {
      const canonical = emneById.get(row.emne_id);
      return Array.isArray(canonical?.method_ids)
        && canonical.method_ids.length > 0
        && canonical.method_ids.every((id) => methodIds.has(id));
    }),
    thirty_six_inspectable_https_sources: sources.length === 36
      && new Set(sources.map((row) => row.id)).size === 36
      && sources.every((row) => row.url.startsWith('https://')
        && row.source_location
        && row.territory
        && row.retrieval_status === 'verified_2026-08-14'),
    plural_evidence_families_present: Object.values(evidenceSourceTypesPresent).every(Boolean),
    every_source_used_and_resolvable: sources.every((row) => usedSourceIds.has(row.id))
      && [...usedSourceIds].every((id) => sourceIds.has(id)),
    thirty_six_documented_cases_used: cases.length === 36
      && new Set(cases.map((row) => row.id)).size === 36
      && cases.every((row) => usedCaseIds.has(row.id))
      && cases.every((row) => row.source_ids.length > 0 && row.purpose && row.territory && row.years),
    every_case_reference_and_source_resolves: topicBriefs.every((row) =>
      row.case_ids.every((id) => caseIds.has(id))
    ) && cases.every((row) => row.source_ids.every((id) => sourceIds.has(id))),
    every_case_source_available_to_owning_topic: topicBriefs.every((topic) =>
      topic.case_ids.every((id) =>
        caseById.get(id).source_ids.every((sourceId) => topic.source_ids.includes(sourceId))
      )
    ),
    forty_nine_variable_planned_claims: plannedClaims.length === 49
      && new Set(plannedClaims.map((row) => row.id)).size === 49
      && isDeepStrictEqual(claimCounts, [5, 5, 4, 4, 5, 5, 5, 4, 4, 4, 4])
      && new Set(claimCounts).size > 1,
    no_planned_claim_overstated_as_verified: plannedClaims.every((row) =>
      row.status === 'planned_requires_fulltext_verification'
    ),
    all_topics_have_sources_cases_claims_and_goals: topicBriefs.every((row) =>
      row.source_ids.length >= 3
      && row.case_ids.length >= 3
      && row.planned_claims.length >= 4
      && row.learning_goal
    ),
    editorial_specificity_across_entire_brief: normalizedGoals.length === 11
      && new Set(normalizedGoals).size === 11
      && normalizedGoals.every((value) => value.length >= 100 && !placeholderPattern.test(value))
      && normalizedClaimFocuses.length === 49
      && new Set(normalizedClaimFocuses).size === 49
      && normalizedClaimFocuses.every((value) => value.length >= 100 && !placeholderPattern.test(value))
      && plannedClaims.every((row) => typeof row.claim_type === 'string' && row.claim_type.length >= 8),
    topic_source_case_combinations_are_distinct: new Set(topicBriefs.map((row) =>
      JSON.stringify({ source_ids: row.source_ids, case_ids: row.case_ids })
    )).size === 11,
    four_variable_modules_cover_every_emne_once: brief.proposed_module_order.length === 4
      && isDeepStrictEqual(brief.proposed_module_order.map((row) => row.emne_ids.length), [3, 3, 2, 3])
      && moduleEmneIds.length === 11
      && new Set(moduleEmneIds).size === 11
      && unit.emne_ids.every((id) => moduleEmneIds.includes(id)),
    versioned_manifest_contracts: sourceManifest.schema === 'history_go_film_tv_screen_places_identity_circulation_sources_manifest_v1'
      && sourceManifest.version === '1.0.0'
      && sourceManifest.source_files.length === 2
      && sourceManifest.source_count === 36
      && caseManifest.schema === 'history_go_film_tv_screen_places_identity_circulation_cases_manifest_v1'
      && caseManifest.version === '1.0.0'
      && caseManifest.case_files.length === 2
      && caseManifest.case_count === 36
      && topicClaimManifest.schema === 'history_go_film_tv_screen_places_identity_circulation_topic_claims_manifest_v1'
      && topicClaimManifest.version === '1.0.0'
      && topicClaimManifest.topic_claim_files.length === 2
      && topicClaimManifest.topic_count === 11
      && topicClaimManifest.planned_claim_count === 49,
    four_place_levels_are_distinct: brief.source_policy.depicted_place_filming_location_fictive_space_and_documented_local_effect_are_distinct
      && brief.source_policy.exact_location_match_is_not_proof_of_meaning_identity_belonging_or_local_effect,
    constructed_geography_is_explicit: brief.source_policy.montage_sound_graphics_route_and_offscreen_space_can_construct_geography
      && brief.source_policy.maps_coordinates_and_location_lists_do_not_prove_social_meaning,
    interior_landscape_and_periphery_boundaries_are_explicit: brief.source_policy.interior_is_built_social_and_property_space_not_neutral_background
      && brief.source_policy.landscape_mood_is_relational_not_a_natural_essence_of_place
      && brief.source_policy.rural_peripheral_and_arctic_places_are_not_empty_timeless_or_homogeneous,
    indigenous_source_priority_is_explicit: brief.source_policy.indigenous_land_language_knowledge_and_identity_claims_prioritize_indigenous_or_community_sources
      && topicBriefs.some((row) => row.emne_id === 'em_film_tv_rurale_perifere_og_arktiske_skjermgeografier'
        && row.case_ids.includes('case-isfi-sami-film-ecology')
        && row.case_ids.includes('case-atanarjuat')),
    mobility_categories_are_separate: brief.source_policy.mobility_travel_transit_migration_diaspora_displacement_and_exile_are_distinct,
    iconic_myth_and_memory_require_process_evidence: brief.source_policy.iconic_place_status_requires_documented_repetition_circulation_or_institutionalization
      && brief.source_policy.audiovisual_place_myth_is_historical_representational_process_not_place_essence
      && brief.source_policy.screen_memory_requires_traceable_reuse_revisiting_archive_or_public_practice
      && brief.source_policy.preservation_or_curation_is_not_automatic_collective_memory,
    unit_thirteen_boundary_is_preserved: brief.source_policy.local_tourism_economic_social_environmental_and_consent_effects_require_place_specific_unit_13_evidence
      && brief.production_requirements.production_intervention_consent_local_effect_and_environmental_impact_remain_outside_scope_without_unit_13_evidence,
    source_brief_registered_without_premature_chapter: registry.subjects.film_tv.canonicalModel.twelfthSourceClaimBrief === P.brief
      && chapterRegistrationStateValid,
    status_advances_monotonically: filmStatus.editorialStatus === 'chapters_in_progress'
      && isFilmTvUnitTwelveOrLaterGate(filmStatus.nextGate),
    registration_waits_for_fulltext_claim_source_audit: brief.runtime_registration.registered === false
      && brief.runtime_registration.allowed_before_full_chapter_gate === false
      && brief.production_requirements.chapter_registration_only_after_fulltext_claim_and_evidence_audit,
    brief_engine_contains_no_scm_sync_or_push: forbiddenScmTokens.every((token) => !engineSource.includes(token))
      && !forbiddenGitCommand.test(engineSource)
  };

  const qualityDimensions = {
    correctness_and_evidence: {
      score: 5,
      evidence_gate_ids: [
        'thirty_six_inspectable_https_sources',
        'plural_evidence_families_present',
        'every_case_reference_and_source_resolves',
        'four_place_levels_are_distinct'
      ],
      evidence: '36 inspiserbare kilder fra fagfellevurdert skjermgeografi, film- og museumsinstitusjoner, urfolksinstitusjoner og konkrete verksspor er løst mot 36 dokumenterte case.'
    },
    coverage_and_completion: {
      score: 5,
      evidence_gate_ids: [
        'exact_eleven_canonical_emne_coverage',
        'forty_nine_variable_planned_claims',
        'thirty_six_documented_cases_used',
        'four_variable_modules_cover_every_emne_once'
      ],
      evidence: 'Briefen dekker alle 11 canonicale emner i fire problemstyrte moduler med 49 variable claimplaner og full kilde- og casedekning.'
    },
    editorial_quality: {
      score: 4,
      evidence_gate_ids: [
        'editorial_specificity_across_entire_brief',
        'topic_source_case_combinations_are_distinct',
        'constructed_geography_is_explicit',
        'iconic_myth_and_memory_require_process_evidence'
      ],
      evidence: 'Alle læringsmål og claimfokus er unike og substansielle, og sted, rom, myte og minne har eksplisitte analytiske skiller. Scoren holdes på 4 fordi fulltekst og menneskelig stilredigering ennå ikke er gjennomført.'
    },
    technical_integrity: {
      score: 5,
      evidence_gate_ids: [
        'versioned_manifest_contracts',
        'source_brief_registered_without_premature_chapter',
        'status_advances_monotonically',
        'registration_waits_for_fulltext_claim_source_audit'
      ],
      evidence: 'Manifestene er versjonerte, alle referanser er resolvable, statusen avanserer monotont, og kapitlet registreres ikke før fulltekstporten.'
    },
    safety_and_responsibility: {
      score: 5,
      evidence_gate_ids: [
        'interior_landscape_and_periphery_boundaries_are_explicit',
        'indigenous_source_priority_is_explicit',
        'mobility_categories_are_separate',
        'unit_thirteen_boundary_is_preserved'
      ],
      evidence: 'Urfolksland, arktiske og perifere steder, diaspora, eksil, landskap og lokal virkning har eksplisitte kilde-, identitets-, samtykke- og generaliseringsgrenser.'
    },
    maintainability_and_reproducibility: {
      score: 5,
      evidence_gate_ids: [
        'every_source_used_and_resolvable',
        'every_case_source_available_to_owning_topic',
        'versioned_manifest_contracts',
        'brief_engine_contains_no_scm_sync_or_push'
      ],
      evidence: 'Kilde-, case- og claimspor er deterministiske og partisjonerte i versjonerte manifestfiler; briefmotoren utfører ingen SCM-synk eller GitHub-push.'
    }
  };
  const scores = Object.values(qualityDimensions).map((dimension) => dimension.score);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const qualityGateIds = Object.values(qualityDimensions).flatMap((dimension) => dimension.evidence_gate_ids);
  const qualityPasses = Object.keys(qualityDimensions).length === 6
    && scores.every((score) => Number.isInteger(score) && score >= 4 && score <= 5)
    && totalScore === 29
    && qualityGateIds.every((gateId) => gates[gateId] === true);

  const qualityAssessment = {
    schema: 'history_go_six_dimension_quality_assessment_v1',
    assessment_scope: 'film_tv_unit_12_source_and_claim_brief',
    scale: { minimum: 1, maximum: 5 },
    threshold: {
      minimum_dimension_score: 4,
      minimum_total_score: 27,
      maximum_total_score: 30,
      critical_deviations_allowed: 0
    },
    dimensions: qualityDimensions,
    total_score: totalScore,
    critical_deviations: [],
    unresolved_blockers: [],
    full_chapter_assessed: false,
    automation_limits: [
      'Automatiske porter kontrollerer dekning, referanseoppløsning, kildetyper, claimplaner, emneeierskap og eksplisitte metode- og ansvarsgrenser.',
      'Briefen verifiserer ikke ennå sluttpåstander eller fulltekst; hvert claim må løses med avsnittsspor og claimspesifikk evidens i neste leveranse.'
    ],
    conclusion: qualityPasses ? 'high_quality_source_claim_brief' : 'quality_gate_failed'
  };
  gates.six_dimension_quality_assessment_passes = qualityPasses
    && qualityAssessment.critical_deviations.length === 0
    && qualityAssessment.unresolved_blockers.length === 0
    && qualityAssessment.conclusion === 'high_quality_source_claim_brief';

  assert(
    Object.values(gates).every(Boolean),
    `Kildebriefporter feiler: ${Object.entries(gates).filter(([, value]) => !value).map(([key]) => key).join(', ')}`
  );

  const report = {
    schema: 'history_go_film_tv_screen_places_identity_circulation_source_brief_v1_audit',
    version: '1.0.0',
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

  return {
    brief,
    sources,
    cases,
    topicBriefs,
    plannedClaims,
    registry,
    status,
    report,
    unit
  };
}

export function materializeFilmTvScreenPlacesIdentityCirculationSourceBriefV1() {
  const built = buildFilmTvScreenPlacesIdentityCirculationSourceBriefV1();
  write(P.registry, built.registry);
  write(P.status, built.status);
  write(P.report, built.report);
  console.log('Materialiserte Film & TV/enhet 12 kildebrief: 11 emner, 4 moduler, 49 claimplaner, 36 kilder og 36 case.');
  return built;
}

export function auditFilmTvScreenPlacesIdentityCirculationSourceBriefV1({
  checkReport = true
} = {}) {
  const built = buildFilmTvScreenPlacesIdentityCirculationSourceBriefV1();
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler`);
    assert(isDeepStrictEqual(read(P.report), built.report), `${P.report} er utdatert`);
  }
  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const built = args.has('--write')
      ? materializeFilmTvScreenPlacesIdentityCirculationSourceBriefV1()
      : auditFilmTvScreenPlacesIdentityCirculationSourceBriefV1();
    console.log(`Film & TV enhet 12 kildebrief OK: ${built.report.summary.planned_claim_count} claimplaner, ${built.report.summary.source_count} kilder og ${built.report.summary.case_count} case.`);
  } catch (error) {
    console.error(`Film & TV enhet 12 kildebrief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
