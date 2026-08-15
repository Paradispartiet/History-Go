#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNIT_ID = 'location-produksjon-og-stedsetikk';
const INPUT_GATE = 'screen_places_identity_circulation_full_chapter_complete_next_unit_source_brief';
const OUTPUT_GATE = 'location_production_place_ethics_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief';
const ARCHIVE_PRESERVATION_SOURCE_GATE = 'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production';
const ARCHIVE_PRESERVATION_FULLTEXT_GATE = 'archive_preservation_access_authenticity_full_chapter_complete_next_unit_source_brief';
const UNIT15_SOURCE_GATE = 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production';
const UNIT_THIRTEEN_OR_LATER_GATES = new Set([OUTPUT_GATE, FULLTEXT_GATE, ARCHIVE_PRESERVATION_SOURCE_GATE, ARCHIVE_PRESERVATION_FULLTEXT_GATE, UNIT15_SOURCE_GATE]);

export const isFilmTvUnitThirteenOrLaterGate = (gate) => UNIT_THIRTEEN_OR_LATER_GATES.has(gate);

const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  brief: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_topic_claims_v1.json',
  report: 'reports/fagverk/film-tv-location-production-place-ethics-source-brief-v1-audit.json'
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

export function buildFilmTvLocationProductionPlaceEthicsSourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Location, produksjon og stedsetikk');

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
  const laterGateAlreadyActive = UNIT_THIRTEEN_OR_LATER_GATES.has(currentGate);

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

  registry.version = maxDottedVersion(registry.version, '2.98.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-15');
  registry.subjects.film_tv.canonicalModel.thirteenthSourceClaimBrief = P.brief;
  if (!laterGateAlreadyActive) {
    registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Kilde- og claimbriefen for Location, produksjon og stedsetikk er ferdig med 8 canonicale emner, 4 variable moduler, 39 planlagte claims, 26 inspectable kilder og 24 dokumenterte location-, offentlig-rom-, økologi-, samtykke-, urfolks-, virtuelt-rom- og filmturismecase. Locationtillatelse, personsamtykke, lokalsamfunnskonsultasjon, kulturell protokoll, karbonregnskap, stedsspesifikk miljøvirkning og turistvirkning holdes eksplisitt adskilt. Kapitlet er ikke registrert før fulltekst-, claim- og evidensporten er bestått.';
  }

  status.version = maxDottedVersion(status.version, '1.91.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-15');
  if (!laterGateAlreadyActive) {
    filmStatus.editorialStatus = 'chapters_in_progress';
    filmStatus.nextGate = OUTPUT_GATE;
    filmStatus.note = 'Kilde- og claimbriefen for Location, produksjon og stedsetikk er ferdig: 8/8 canonicale emner, 4 variable moduler, 39 planlagte claims, 26 inspectable kilder og 24 case. Produksjonssted, offentlig rom, fysiske spor, locationøkologi, lokalsamfunn/samtykke, urfolkslandskap/bilderett, virtuelt rom/stedserstatning og filmturisme har separate evidenskrav. Neste port er fulltekstproduksjon og claimspesifikk evidensmapping.';
  }

  const sourceFamiliesPresent = {
    locationLaborAndChoice: ['lp01-celik-rappas-filming-european-cities', 'lp02-celik-rappas-finding-locations', 'lp03-hollywood-on-location'].every((id) => sourceIds.has(id)),
    publicSpacePermissionAndPeople: ['lp04-film-london-code', 'lp05-film-london-permission', 'lp06-film-london-people', 'lp07-film-london-partnership'].every((id) => sourceIds.has(id)),
    indigenousProtocolsAndRights: ['lp11-isfi-ofelas', 'lp12-screen-australia-pathways', 'lp13-screen-australia-documentary-consent', 'lp14-screen-australia-icip'].every((id) => sourceIds.has(id)),
    sustainabilityBiodiversityAndSensitiveSites: ['lp09-bfi-sustainability', 'lp10-bfi-screen-new-deal', 'lp15-nordic-ecological-standard', 'lp16-npws-wildlife-filming', 'lp17-exmoor-filming'].every((id) => sourceIds.has(id)),
    filmTourismAndMeasurement: ['lp18-visitscotland-screen-tourism', 'lp19-visitscotland-outlander', 'lp20-mbie-screen-tourism-effects', 'lp21-beeton-film-induced-tourism', 'lp22-riley-baker-van-doren', 'lp23-busby-klug-measurement'].every((id) => sourceIds.has(id)),
    virtualProductionAndDigitalSubstitution: ['lp08-film-london-digital-recreation', 'lp24-swords-willment-virtual-production', 'lp25-ilm-mandalorian', 'lp26-ilm-stagecraft'].every((id) => sourceIds.has(id))
  };

  const gates = {
    exact_unit_thirteen_problem_set_and_sequence: unit.sequence === 13
      && plan.production_sequence[12] === UNIT_ID
      && unit.emne_count === 8,
    exact_prerequisite_contract: isDeepStrictEqual(
      unit.prerequisite_planned_unit_ids,
      ['skjermsteder-identitet-og-sirkulasjon', 'skapende-arbeid-teknologi-og-ansvar']
    ) && isDeepStrictEqual(unit.prerequisite_existing_chapter_ids, []),
    planned_prerequisites_registered: unit.prerequisite_planned_unit_ids.every((id) =>
      registry.subjects.film_tv.chapters.some((row) => row.id === id)
    ),
    current_status_is_input_output_or_known_later_gate: currentGate === INPUT_GATE || isFilmTvUnitThirteenOrLaterGate(currentGate),
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
    twenty_six_inspectable_https_sources: sources.length === 26 && sources.every((row) =>
      row.url.startsWith('https://')
      && row.source_location
      && row.territory
      && row.retrieval_status === 'verified_2026-08-15'
    ),
    evidence_source_families_present: Object.values(sourceFamiliesPresent).every(Boolean),
    every_source_used: sources.every((row) => usedSourceIds.has(row.id)),
    every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
    twenty_four_documented_cases_used: cases.length === 24
      && cases.every((row) => usedCaseIds.has(row.id))
      && cases.every((row) => row.source_ids.length > 0 && row.purpose && row.territory && row.years),
    every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
    every_case_source_available_to_owning_topic: topicBriefs.every((topic) =>
      topic.case_ids.every((id) => caseById.get(id).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))
    ),
    thirty_nine_variable_planned_claims: plannedClaims.length === 39
      && new Set(plannedClaims.map((row) => row.id)).size === 39
      && isDeepStrictEqual(claimCounts, [5, 5, 4, 5, 5, 5, 5, 5])
      && new Set(claimCounts).size > 1,
    no_planned_claim_overstated_as_verified: plannedClaims.every((row) =>
      row.status === 'planned_requires_fulltext_verification'
    ),
    all_topics_have_sources_cases_claims_and_goal: topicBriefs.every((row) =>
      row.source_ids.length >= 4
      && row.case_ids.length >= 3
      && row.planned_claims.length >= 4
      && row.learning_goal
    ),
    editorial_specificity_checked_across_entire_brief: normalizedLearningGoals.length === 8
      && new Set(normalizedLearningGoals).size === 8
      && normalizedLearningGoals.every((value) => value.length >= 60 && !placeholderPattern.test(value))
      && normalizedClaimFocuses.length === 39
      && new Set(normalizedClaimFocuses).size === 39
      && normalizedClaimFocuses.every((value) => value.length >= 60 && !placeholderPattern.test(value))
      && plannedClaims.every((row) => typeof row.claim_type === 'string' && row.claim_type.length >= 8),
    topic_source_case_combinations_are_distinct: new Set(topicBriefs.map((row) =>
      JSON.stringify({ source_ids: row.source_ids, case_ids: row.case_ids })
    )).size === topicBriefs.length,
    four_variable_modules_cover_every_emne_once: brief.proposed_module_order.length === 4
      && isDeepStrictEqual(brief.proposed_module_order.map((row) => row.emne_ids.length), [2, 2, 2, 2])
      && moduleEmneIds.length === unit.emne_count
      && new Set(moduleEmneIds).size === unit.emne_count
      && unit.emne_ids.every((id) => moduleEmneIds.includes(id)),
    versioned_manifest_contracts: sourceManifest.schema === 'history_go_film_tv_location_production_place_ethics_sources_manifest_v1'
      && sourceManifest.version === '1.0.0'
      && sourceManifest.source_files.length === 2
      && caseManifest.schema === 'history_go_film_tv_location_production_place_ethics_cases_manifest_v1'
      && caseManifest.version === '1.0.0'
      && caseManifest.case_files.length === 2
      && topicClaimManifest.schema === 'history_go_film_tv_location_production_place_ethics_topic_claims_manifest_v1'
      && topicClaimManifest.version === '1.0.0'
      && topicClaimManifest.topic_claim_files.length === 2,
    brief_engine_contains_no_scm_sync_or_push: forbiddenScmTokens.every((token) => !engineSource.includes(token))
      && !forbiddenGitCommand.test(engineSource),
    permissions_consent_and_community_power_are_separate:
      brief.source_policy.public_access_does_not_equal_single_owner_or_unrestricted_production_control
      && brief.source_policy.location_permission_person_consent_community_consultation_and_cultural_protocol_are_distinct
      && brief.source_policy.absence_of_documented_objection_is_not_community_consent
      && brief.source_policy.community_is_not_a_single_actor_and_claims_must_name_who_was_consulted,
    indigenous_land_knowledge_and_collective_rights_are_explicit:
      brief.source_policy.individual_release_does_not_clear_collective_indigenous_cultural_or_intellectual_property
      && brief.source_policy.indigenous_land_and_knowledge_claims_prioritise_indigenous_led_sources,
    carbon_site_ecology_and_restoration_are_separate:
      brief.source_policy.environmental_standard_or_permit_is_not_proof_of_zero_environmental_impact
      && brief.source_policy.carbon_accounting_and_site_specific_ecological_impact_are_distinct
      && brief.source_policy.protected_or_sensitive_location_claims_require_site_species_season_activity_and_permission_scope
      && brief.source_policy.physical_site_change_restoration_and_no_harm_are_separate_claims,
    physical_virtual_and_digital_substitution_layers_are_separate:
      brief.source_policy.studio_backlot_physical_set_led_volume_digital_asset_and_fictional_place_are_distinct
      && brief.source_policy.virtual_production_may_shift_travel_or_location_pressure_but_does_not_automatically_reduce_total_impact
      && brief.source_policy.digital_recreation_rights_are_jurisdiction_and_contract_specific,
    tourism_visitation_spend_and_local_effect_are_separate:
      brief.source_policy.screen_tourism_inspiration_visitation_attributed_spend_and_causal_local_effect_are_distinct
      && brief.source_policy.tourism_claims_require_population_period_method_baseline_and_attribution_limit
      && brief.source_policy.local_economic_benefit_does_not_alone_establish_social_legitimacy_or_consent,
    thirteenth_source_brief_registration_matches_production_stage:
      registry.subjects.film_tv.canonicalModel.thirteenthSourceClaimBrief === P.brief
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
        'twenty_six_inspectable_https_sources',
        'every_source_used',
        'every_source_reference_resolves',
        'every_case_source_available_to_owning_topic'
      ],
      evidence: '26/26 inspectable HTTPS-kilder er brukt, alle kilde- og casereferanser er resolvable, og casenes kilder er tilgjengelige innenfor hvert emnes avgrensede evidensgrunnlag.'
    },
    coverage_and_completion: {
      score: 5,
      evidence_gate_ids: [
        'exact_unit_emne_coverage',
        'twenty_four_documented_cases_used',
        'thirty_nine_variable_planned_claims',
        'four_variable_modules_cover_every_emne_once'
      ],
      evidence: 'Briefen dekker 8/8 canonicale emner i fire variable moduler med 39 problemavledede claimplaner, 26 kilder og 24 dokumenterte case uten emnehull eller dobbelte eiere.'
    },
    editorial_quality: {
      score: 4,
      evidence_gate_ids: [
        'editorial_specificity_checked_across_entire_brief',
        'topic_source_case_combinations_are_distinct',
        'no_planned_claim_overstated_as_verified'
      ],
      evidence: 'Alle åtte læringsmål og 39 claimfokus er unike, substansielle og plassholderfrie; claimplanene skiller beslutning, tillatelse, virkning og metode før fulltekstprosa vurderes.'
    },
    technical_integrity: {
      score: 5,
      evidence_gate_ids: [
        'current_status_is_input_output_or_known_later_gate',
        'thirteenth_source_brief_registration_matches_production_stage',
        'status_advances_or_preserves_later_gate',
        'registration_waits_for_fulltext_claim_source_audit'
      ],
      evidence: 'Registry- og statusprogresjonen er monoton: briefen registreres som produksjonsgrunnlag, mens selve kapittelet ikke blir runtime-registrert før fulltekst-, claim- og evidensporten er bestått.'
    },
    safety_and_responsibility: {
      score: 5,
      evidence_gate_ids: [
        'permissions_consent_and_community_power_are_separate',
        'indigenous_land_knowledge_and_collective_rights_are_explicit',
        'carbon_site_ecology_and_restoration_are_separate',
        'tourism_visitation_spend_and_local_effect_are_separate'
      ],
      evidence: 'Personsamtykke, lokalsamfunnskonsultasjon, urfolksstyrte protokoller, kollektiv kulturkunnskap, stedlig økologi og lokal turistvirkning har egne evidenskrav og kan ikke erstattes av generelle tillatelser eller økonomiske gevinster.'
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
    assessment_scope: 'film_tv_unit_13_source_and_claim_brief',
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
      'Automatiske porter kan kontrollere dekning, unikhet, referanser, evidensgrenser og kontrakter, men kan ikke alene bevise kvaliteten på prosa som ennå ikke er skrevet.'
    ],
    conclusion: qualityPasses ? 'high_quality_source_claim_brief' : 'quality_gate_failed'
  };
  gates.six_dimension_quality_assessment_passes = qualityPasses
    && qualityAssessment.critical_deviations.length === 0
    && qualityAssessment.unresolved_blockers.length === 0
    && qualityAssessment.conclusion === 'high_quality_source_claim_brief';

  const report = {
    schema: 'history_go_film_tv_location_production_place_ethics_source_brief_v1_audit',
    version: '1.0.0',
    updated_at: '2026-08-15',
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

export function auditFilmTvLocationProductionPlaceEthicsSourceBriefV1({
  writeFiles = false,
  checkFiles = true
} = {}) {
  const built = buildFilmTvLocationProductionPlaceEthicsSourceBriefV1();
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
    const built = auditFilmTvLocationProductionPlaceEthicsSourceBriefV1({
      writeFiles: args.has('--write'),
      checkFiles: !args.has('--write')
    });
    console.log(`Film & TV enhet 13 kildebrief OK: ${built.report.summary.planned_claim_count} claims, ${built.report.summary.source_count} kilder og ${built.report.summary.case_count} case.`);
  } catch (error) {
    console.error(`Film & TV enhet 13 kildebrief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
