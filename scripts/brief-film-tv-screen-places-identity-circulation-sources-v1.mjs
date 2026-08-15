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
const UNIT13_SOURCE_BRIEF_GATE = 'location_production_place_ethics_source_brief_complete_full_chapter_production';
const UNIT13_FULLTEXT_GATE = 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief';
const ARCHIVE_PRESERVATION_SOURCE_GATE = 'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production';
const ARCHIVE_PRESERVATION_FULLTEXT_GATE = 'archive_preservation_access_authenticity_full_chapter_complete_next_unit_source_brief';
const UNIT15_SOURCE_GATE = 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production';
const UNIT_TWELVE_OR_LATER_GATES = new Set([OUTPUT_GATE, FULLTEXT_GATE, UNIT13_SOURCE_BRIEF_GATE, UNIT13_FULLTEXT_GATE, ARCHIVE_PRESERVATION_SOURCE_GATE, ARCHIVE_PRESERVATION_FULLTEXT_GATE, UNIT15_SOURCE_GATE]);
const UNIT_TWELVE_POST_BRIEF_GATES = new Set([FULLTEXT_GATE, UNIT13_SOURCE_BRIEF_GATE, UNIT13_FULLTEXT_GATE, ARCHIVE_PRESERVATION_SOURCE_GATE, ARCHIVE_PRESERVATION_FULLTEXT_GATE, UNIT15_SOURCE_GATE]);

export const isFilmTvUnitTwelveOrLaterGate = (gate) => UNIT_TWELVE_OR_LATER_GATES.has(gate);

const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  release: 'data/fagverk/fagverk_release.json',
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
const rowsFromManifest = (manifestPath, filesKey, rowsKey) =>
  read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);
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
  const laterGateAlreadyActive = UNIT_TWELVE_POST_BRIEF_GATES.has(currentGate);

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
  const normalizedLearningGoals = topicBriefs.map((row) => normalizeEditorialText(row.learning_goal));
  const normalizedClaimFocuses = plannedClaims.map((row) => normalizeEditorialText(row.claim_focus));
  const placeholderPattern = /\b(?:todo|tbd|placeholder|lorem ipsum|sett inn|kommer senere)\b/i;
  const engineSource = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const forbiddenScmTokens = ['child_' + 'process', 'execFile' + 'Sync', 'spawn' + 'Sync'];
  const forbiddenGitCommand = new RegExp(`git\\s+(?:${['fetch', 'merge', 'push'].join('|')})`);

  registry.version = maxDottedVersion(registry.version, '2.96.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-14');
  registry.subjects.film_tv.canonicalModel.twelfthSourceClaimBrief = P.brief;
  if (!laterGateAlreadyActive) {
    registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Kilde- og claimbriefen for Skjermsteder, identitet og sirkulasjon er ferdig med 11 canonicale emner, 4 variable moduler, 52 planlagte claims, 36 inspectable kilder og 33 dokumenterte verk-, sted-, kart-, interiør-, landskaps-, mobilitets-, myte- og minnecase. Vist sted, faktisk opptakssted, fiktivt eller sammensatt rom og dokumentert lokal virkning holdes eksplisitt adskilt. Kapitlet er ikke registrert før fulltekst-, claim- og evidensporten er bestått.';
  }

  status.version = maxDottedVersion(status.version, '1.89.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-14');
  if (!laterGateAlreadyActive) {
    filmStatus.editorialStatus = 'chapters_in_progress';
    filmStatus.nextGate = OUTPUT_GATE;
    filmStatus.note = 'Kilde- og claimbriefen for Skjermsteder, identitet og sirkulasjon er ferdig: 11/11 canonicale emner, 4 variable moduler, 52 planlagte claims, 36 inspectable kilder og 33 case. Stedsrepresentasjon, opptakssted, fiktivt rom, kartdata, identitet, ikonisering, mytedannelse og minne har separate evidensroller. Produksjonsinngrep, samtykke, bilderett, filmturisme og dokumentert lokal virkning forblir i enhet 13. Neste port er fulltekstproduksjon og claimspesifikk evidensmapping.';
  }

  const sourceFamiliesPresent = {
    cityAndUrbanForm: ['sp01-mennel-cities-cinema', 'sp02-alsayyad-cinematic-urbanism', 'sp05-jacobs-city-symphony'].every((id) => sourceIds.has(id)),
    cartographyAndFilmGeography: ['sp06-conley-cartographic-cinema', 'sp07-castro-mapping-impulse', 'sp08-roberts-film-mobility-urban-space'].every((id) => sourceIds.has(id)),
    domesticAndInterior: ['sp13-colomina-privacy-publicity', 'sp14-spigel-make-room-tv', 'sp15-wojcik-apartment-plot', 'sp16-wojcik-apartment-complex'].every((id) => sourceIds.has(id)),
    landscapeEcologyAndArctic: ['sp18-lefebvre-landscape-film', 'sp19-kaapa-nordic-ecology', 'sp20-mackenzie-stenport-films-ice', 'sp21-rust-monani-cubitt-ecocinema'].every((id) => sourceIds.has(id)),
    mobilityExileAndDiaspora: ['sp22-naficy-accented-cinema', 'sp23-marks-skin-film', 'sp24-groening-cinema-beyond-territory'].every((id) => sourceIds.has(id)),
    identityMythMemoryAndArchive: ['sp11-tuan-space-place', 'sp12-cresswell-in-place-out-place', 'sp25-landsberg-prosthetic-memory', 'sp26-kuhn-everyday-magic', 'sp29-torlasco-heretical-archive'].every((id) => sourceIds.has(id)),
    inspectableFilmInstitutionCases: ['sp31-bfi-britain-film-map', 'sp32-bfi-man-movie-camera', 'sp33-bfi-metropolis', 'sp34-criterion-do-right-thing', 'sp35-criterion-rebecca-house', 'sp36-isuma-atanarjuat'].every((id) => sourceIds.has(id))
  };

  const gates = {
    exact_unit_twelve_problem_set_and_sequence: unit.sequence === 12
      && plan.production_sequence[11] === UNIT_ID
      && unit.emne_count === 11,
    exact_prerequisite_contract: isDeepStrictEqual(
      unit.prerequisite_planned_unit_ids,
      ['skjermoffentlighet-fellesskap-og-samfunn', 'resepsjon-deltakelse-og-publikumsmetoder']
    ) && isDeepStrictEqual(unit.prerequisite_existing_chapter_ids, []),
    planned_prerequisites_registered: unit.prerequisite_planned_unit_ids.every((id) =>
      registry.subjects.film_tv.chapters.some((row) => row.id === id)
    ),
    current_status_is_input_output_or_known_later_gate: currentGate === INPUT_GATE || isFilmTvUnitTwelveOrLaterGate(currentGate),
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
    evidence_source_families_present: Object.values(sourceFamiliesPresent).every(Boolean),
    every_source_used: sources.every((row) => usedSourceIds.has(row.id)),
    every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
    thirty_three_documented_cases_used: cases.length === 33
      && cases.every((row) => usedCaseIds.has(row.id))
      && cases.every((row) => row.source_ids.length > 0 && row.purpose && row.territory && row.years),
    every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
    every_case_source_available_to_owning_topic: topicBriefs.every((topic) =>
      topic.case_ids.every((id) => caseById.get(id).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))
    ),
    fifty_two_variable_planned_claims: plannedClaims.length === 52
      && new Set(plannedClaims.map((row) => row.id)).size === 52
      && isDeepStrictEqual(claimCounts, [5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 4])
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
    editorial_specificity_checked_across_entire_brief: normalizedLearningGoals.length === 11
      && new Set(normalizedLearningGoals).size === 11
      && normalizedLearningGoals.every((value) => value.length >= 60 && !placeholderPattern.test(value))
      && normalizedClaimFocuses.length === 52
      && new Set(normalizedClaimFocuses).size === 52
      && normalizedClaimFocuses.every((value) => value.length >= 60 && !placeholderPattern.test(value))
      && plannedClaims.every((row) => typeof row.claim_type === 'string' && row.claim_type.length >= 8),
    topic_source_case_combinations_are_distinct: new Set(topicBriefs.map((row) =>
      JSON.stringify({ source_ids: row.source_ids, case_ids: row.case_ids })
    )).size === topicBriefs.length,
    four_variable_modules_cover_every_emne_once: brief.proposed_module_order.length === 4
      && isDeepStrictEqual(brief.proposed_module_order.map((row) => row.emne_ids.length), [3, 2, 3, 3])
      && moduleEmneIds.length === unit.emne_count
      && new Set(moduleEmneIds).size === unit.emne_count
      && unit.emne_ids.every((id) => moduleEmneIds.includes(id)),
    versioned_manifest_contracts: sourceManifest.schema === 'history_go_film_tv_screen_places_identity_circulation_sources_manifest_v1'
      && sourceManifest.version === '1.0.0'
      && sourceManifest.source_files.length === 2
      && caseManifest.schema === 'history_go_film_tv_screen_places_identity_circulation_cases_manifest_v1'
      && caseManifest.version === '1.0.0'
      && caseManifest.case_files.length === 2
      && topicClaimManifest.schema === 'history_go_film_tv_screen_places_identity_circulation_topic_claims_manifest_v1'
      && topicClaimManifest.version === '1.0.0'
      && topicClaimManifest.topic_claim_files.length === 2,
    brief_engine_contains_no_scm_sync_or_push: forbiddenScmTokens.every((token) => !engineSource.includes(token))
      && !forbiddenGitCommand.test(engineSource),
    four_place_layers_are_permanent: brief.source_policy.shown_place_actual_shooting_location_fictional_space_and_documented_local_effect_are_distinct
      && brief.source_policy.shooting_location_is_not_identical_to_the_place_named_or_shown_in_the_work
      && brief.source_policy.fictional_and_composite_geographies_must_be_labelled,
    maps_and_icons_keep_evidence_boundaries: brief.source_policy.maps_routes_geocoding_and_databases_document_spatial_relations_not_meaning_or_reception_alone
      && brief.source_policy.iconicity_requires_documented_repetition_circulation_intertext_or_recognition
      && brief.source_policy.landmark_visibility_is_not_proof_of_local_social_or_economic_effect,
    interior_landscape_and_environment_layers_are_separate: brief.source_policy.interior_representation_actual_building_studio_set_and_digital_space_are_distinct
      && brief.source_policy.landscape_atmosphere_is_an_audiovisual_construction_not_measured_audience_affect
      && brief.source_policy.screened_nature_is_not_evidence_of_actual_environmental_condition,
    rural_arctic_indigenous_and_exile_scope_is_explicit: brief.source_policy.rural_peripheral_and_arctic_geographies_are_not_homogeneous_or_empty
      && brief.source_policy.indigenous_cases_require_authorship_language_territory_knowledge_position_and_source_control
      && brief.source_policy.exile_diaspora_mobility_and_multilingualism_must_not_be_essentialised,
    identity_myth_memory_and_archive_layers_are_separate: brief.source_policy.place_identity_requires_named_actors_period_context_and_evidence_position
      && brief.source_policy.actual_identity_work_or_belonging_requires_person_or_community_evidence_not_representation_alone
      && brief.source_policy.place_myth_is_a_historical_pattern_of_representation_not_a_synonym_for_falsehood
      && brief.source_policy.personal_popular_public_archival_and_institutional_memory_are_distinct
      && brief.source_policy.archive_absence_claims_require_collection_search_metadata_digitisation_and_gap_reporting
      && brief.source_policy.memory_effect_theories_are_not_universal_measured_audience_outcomes,
    unit_thirteen_boundary_is_explicit: brief.source_policy.production_intervention_consent_image_rights_film_tourism_and_local_effects_are_deferred_to_unit_13
      && /enhet 13/i.test(brief.scope.overlap_boundary),
    twelfth_source_brief_registration_matches_production_stage: registry.subjects.film_tv.canonicalModel.twelfthSourceClaimBrief === P.brief
      && (laterGateAlreadyActive
        ? registry.subjects.film_tv.chapters.some((row) => row.id === UNIT_ID
          && row.file === `data/fagverk/film_tv/${UNIT_ID}.json`
          && row.claimsFile === `data/fagverk/film_tv/${UNIT_ID}/claims.json`
          && row.briefFile === `data/fagverk/film_tv/${UNIT_ID}/brief.json`)
        : !registry.subjects.film_tv.chapters.some((row) => row.id === UNIT_ID)),
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
        'every_case_source_available_to_owning_topic',
        'four_place_layers_are_permanent'
      ],
      evidence: '36/36 inspectable HTTPS-kilder er brukt, alle kilde- og casereferanser er resolvable, og vist sted, opptakssted, fiktivt rom og dokumentert lokal virkning beholder egne evidenskrav.'
    },
    coverage_and_completion: {
      score: 5,
      evidence_gate_ids: [
        'exact_unit_emne_coverage',
        'thirty_three_documented_cases_used',
        'fifty_two_variable_planned_claims',
        'four_variable_modules_cover_every_emne_once'
      ],
      evidence: 'Briefen dekker 11/11 canonicale emner i fire variable moduler med 52 problemavledede claimplaner, 36 kilder og 33 dokumenterte case uten emnehull eller dobbelte eiere.'
    },
    editorial_quality: {
      score: 4,
      evidence_gate_ids: [
        'editorial_specificity_checked_across_entire_brief',
        'topic_source_case_combinations_are_distinct',
        'no_planned_claim_overstated_as_verified',
        'identity_myth_memory_and_archive_layers_are_separate'
      ],
      evidence: 'Alle 11 læringsmål og 52 claimfokus er unike, substansielle og plassholderfrie; stedsidentitet, myte og minne har distinkte kilde- og casekonstellasjoner. Fulltekstprosa er ennå ikke vurdert.'
    },
    technical_integrity: {
      score: 5,
      evidence_gate_ids: [
        'current_status_is_input_output_or_known_later_gate',
        'twelfth_source_brief_registration_matches_production_stage',
        'status_advances_or_preserves_later_gate',
        'registration_waits_for_fulltext_claim_source_audit'
      ],
      evidence: 'Registry- og statusprogresjonen er monoton: briefen registreres som produksjonsgrunnlag, mens kapittelet ikke blir runtime-registrert før fulltekst-, claim- og evidensporten er bestått.'
    },
    safety_and_responsibility: {
      score: 5,
      evidence_gate_ids: [
        'rural_arctic_indigenous_and_exile_scope_is_explicit',
        'interior_landscape_and_environment_layers_are_separate',
        'unit_thirteen_boundary_is_explicit'
      ],
      evidence: 'Rurale, perifere, arktiske, urfolks-, eksil- og diasporacase har eksplisitte språk-, territoriums-, opphavs- og kunnskapsgrenser; produksjonsinngrep og lokal virkning utsettes til riktig metodeport.'
    },
    maintainability_and_reproducibility: {
      score: 5,
      evidence_gate_ids: [
        'versioned_manifest_contracts',
        'brief_engine_contains_no_scm_sync_or_push',
        'all_canonical_topics_have_methods',
        'planned_prerequisites_registered'
      ],
      evidence: 'Versjonerte manifest, canonicale metodekoblinger og eksplisitte prerequisite-porter gjør briefen reproducerbar; briefmotoren inneholder ingen SCM-synk eller GitHub-push.'
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
    assessment_scope: 'film_tv_unit_12_source_and_claim_brief',
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
    evidence_source_families_present: sourceFamiliesPresent,
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

export function auditFilmTvScreenPlacesIdentityCirculationSourceBriefV1({
  writeFiles = false,
  checkFiles = true
} = {}) {
  const built = buildFilmTvScreenPlacesIdentityCirculationSourceBriefV1();
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
    const built = auditFilmTvScreenPlacesIdentityCirculationSourceBriefV1({
      writeFiles: args.has('--write'),
      checkFiles: !args.has('--write')
    });
    console.log(`Film & TV enhet 12 kildebrief OK: ${built.report.summary.planned_claim_count} claims, ${built.report.summary.source_count} kilder og ${built.report.summary.case_count} case.`);
  } catch (error) {
    console.error(`Film & TV enhet 12 kildebrief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
