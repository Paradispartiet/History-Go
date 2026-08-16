#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNIT_ID = 'industri-regulering-og-distribusjon';
const INPUT_GATE = 'creative_work_technology_responsibility_full_chapter_complete_next_unit_source_brief';
const OUTPUT_GATE = 'industry_regulation_distribution_source_brief_complete_full_chapter_production';
const UNIT15_SOURCE_GATE = 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production';

const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  brief: 'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_industry_regulation_distribution_topic_claims_v1.json',
  report: 'reports/fagverk/film-tv-industry-regulation-distribution-source-brief-v1-audit.json'
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

export function buildFilmTvIndustryRegulationDistributionSourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Industri, regulering og distribusjon');

  const emners = read(P.emners);
  const emneById = new Map(emners.map((row) => [row.emne_id, row]));
  const methodsDocument = read(P.methods);
  const methods = Array.isArray(methodsDocument) ? methodsDocument : methodsDocument.methods;
  const methodIds = new Set(methods.map((row) => row.method_id || row.id));

  const registry = structuredClone(read(P.registry));
  const status = structuredClone(read(P.status));
  const currentGate = status.subjects.find((row) => row.id === 'film_tv')?.nextGate;
  const laterGateAlreadyActive = currentGate === UNIT15_SOURCE_GATE;
  const brief = read(P.brief);
  const sourceManifest = read(P.sources);
  const caseManifest = read(P.cases);
  const topicClaimsManifest = read(P.topicClaims);
  const sources = sourceManifest.source_files.flatMap((file) => read(file).sources);
  const cases = caseManifest.case_files.flatMap((file) => read(file).cases);
  const topicBriefs = topicClaimsManifest.topic_claim_files.flatMap((file) => read(file).topic_briefs);

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

  registry.version = maxDottedVersion(registry.version, '2.92.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-14');
  if (!laterGateAlreadyActive) registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Kilde- og claimbriefen for Industri, regulering og distribusjon er ferdig med 12 canonicale emner, 4 variable moduler, 52 planlagte claims, 34 inspectable kilder og 34 dokumenterte system-, regel-, markeds- og rettighetscase. Markeds- og maktpåstander må navngi tid, territorium, aktør, metode og evidensrolle. Kapitlet er ikke registrert før fulltekst-, claim- og evidensporten er bestått.';
  registry.subjects.film_tv.canonicalModel.tenthSourceClaimBrief = P.brief;

  status.version = maxDottedVersion(status.version, '1.85.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-14');
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  assert(filmStatus, 'Mangler Film & TV-status');
  if (!laterGateAlreadyActive) {
    filmStatus.editorialStatus = 'chapters_in_progress';
    filmStatus.nextGate = OUTPUT_GATE;
    filmStatus.note = 'Kilde- og claimbriefen for Industri, regulering og distribusjon er ferdig: 12/12 canonicale emner, 4 variable moduler, 52 planlagte claims, 34 inspectable kilder og 34 case. Eierskap, finansiering, markeder, plattformer, publikumsmåling, rettigheter, klassifisering, sensur, formathandel og uformell distribusjon har separate evidensspor med eksplisitt tid og territorium. Neste port er fulltekstproduksjon og claimspesifikk evidensmapping.';
  }

  const evidenceSourceTypesPresent = {
    regulation: /regulation|regulatory|statute|jurisprudence/.test(evidenceInventory),
    industryData: /industry-data|measurement-methodology|infringement-data/.test(evidenceInventory),
    independentResearch: /independent-.*research|independent-industry/.test(evidenceInventory),
    agreementOrRightsFramework: /copyright|rights|self-regulation|dispute-resolution/.test(evidenceInventory)
  };

  const gates = {
    tenth_learning_order_unit_selected: unit.sequence === 10 && plan.production_sequence[9] === UNIT_ID,
    exact_prerequisite_contract: isDeepStrictEqual(
      unit.prerequisite_planned_unit_ids,
      ['skapende-arbeid-teknologi-og-ansvar', 'fjernsyn-plattformer-og-deltakerhistorier']
    ) && isDeepStrictEqual(unit.prerequisite_existing_chapter_ids, ['produksjon-studio-og-filmarbeid']),
    planned_prerequisites_registered: unit.prerequisite_planned_unit_ids.every((id) =>
      registry.subjects.film_tv.chapters.some((row) => row.id === id)
    ),
    existing_prerequisites_registered: unit.prerequisite_existing_chapter_ids.every((id) =>
      registry.subjects.film_tv.chapters.some((row) => row.id === id)
    ),
    current_status_is_input_or_output_gate: [INPUT_GATE, OUTPUT_GATE, UNIT15_SOURCE_GATE].includes(currentGate),
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
    inspectable_https_sources: sources.length === 34 && sources.every((row) =>
      row.url.startsWith('https://')
      && row.source_location
      && row.territory
      && row.retrieval_status === 'verified_2026-08-14'
    ),
    regulation_industry_data_research_and_rights_sources_present: Object.values(evidenceSourceTypesPresent).every(Boolean),
    every_source_used: sources.every((row) => usedSourceIds.has(row.id)),
    every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
    every_case_used: cases.length === 34 && cases.every((row) => usedCaseIds.has(row.id)),
    every_case_documented: cases.every((row) =>
      row.source_ids.length > 0
      && row.source_ids.every((id) => sourceIds.has(id))
      && row.purpose
      && row.territory
      && row.years
    ),
    every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
    every_case_source_available_to_owning_topic: topicBriefs.every((topic) =>
      topic.case_ids.every((id) => caseById.get(id).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))
    ),
    fifty_two_variable_planned_claims: plannedClaims.length === 52
      && new Set(plannedClaims.map((row) => row.id)).size === 52
      && new Set(claimCounts).size > 1
      && Math.min(...claimCounts) >= 4,
    no_planned_claim_overstated_as_verified: plannedClaims.every((row) =>
      row.status === 'planned_requires_fulltext_verification'
    ),
    all_topics_have_sources_cases_claims_and_goal: topicBriefs.every((row) =>
      row.source_ids.length >= 3
      && row.case_ids.length >= 3
      && row.planned_claims.length >= 4
      && row.learning_goal
    ),
    four_variable_modules_cover_every_emne_once: brief.proposed_module_order.length === 4
      && moduleEmneIds.length === unit.emne_count
      && new Set(moduleEmneIds).size === unit.emne_count
      && unit.emne_ids.every((id) => moduleEmneIds.includes(id))
      && new Set(brief.proposed_module_order.map((row) => row.emne_ids.length)).size > 1,
    norwegian_classification_and_expression_anchors_present: sources.some((row) =>
      row.id === 'ir01-medietilsynet-age-ratings'
    ) && sources.some((row) => row.id === 'ir04-echr-article10-guide'),
    festival_selection_and_market_are_separate: brief.source_policy.festival_selection_market_screening_accreditation_sale_and_release_are_distinct
      && topicBriefs.some((row) =>
        row.emne_id === 'em_film_tv_festivaler_priser_markeder_og_portvakt'
        && row.case_ids.includes('case-cannes-selection-market')
        && row.case_ids.includes('case-cannes-accreditation')
      ),
    platform_regulation_preserves_procedural_boundaries: brief.source_policy.platform_hosting_ranking_recommendation_prominence_and_removal_are_distinct_functions
      && brief.source_policy.regulatory_inquiry_is_not_a_finding_of_violation
      && brief.source_policy.gatekeeper_status_is_not_proof_of_specific_bias_or_harm,
    audience_measurement_scope_is_explicit: brief.source_policy.audience_measurement_must_name_universe_method_device_metric_period_and_territory
      && topicBriefs.some((row) =>
        row.emne_id === 'em_film_tv_publikum_som_marked'
        && row.case_ids.includes('case-barb-method')
        && row.case_ids.includes('case-barb-youtube-tv-set')
      ),
    rights_windows_and_availability_are_separate: brief.source_policy.authorship_ownership_license_territory_exclusivity_and_window_are_distinct
      && brief.source_policy.availability_and_release_window_are_not_proof_of_demand,
    classification_censorship_and_moderation_are_separate: brief.source_policy.classification_minor_protection_censorship_moderation_and_legal_prohibition_are_distinct
      && brief.source_policy.restriction_analysis_requires_authority_legal_basis_purpose_process_and_review,
    format_registration_and_law_are_separate: brief.source_policy.format_idea_documentation_registration_license_and_local_version_are_distinct
      && brief.source_policy.industry_self_regulation_is_not_law_or_proof_of_compliance,
    piracy_access_and_motive_are_separate: brief.source_policy.piracy_measurement_is_not_proof_of_user_motive_or_welfare_effect
      && brief.source_policy.access_context_does_not_itself_determine_legality,
    concrete_reception_remains_next_unit: brief.source_policy.concrete_audience_use_and_reception_remain_in_next_unit
      && brief.production_requirements.concrete_audience_use_interpretation_identity_and_reception_remain_outside_scope,
    tenth_source_brief_registered_without_chapter: registry.subjects.film_tv.canonicalModel.tenthSourceClaimBrief === P.brief
      && !registry.subjects.film_tv.chapters.some((row) => row.id === UNIT_ID),
    status_advances_to_fulltext_gate: filmStatus.editorialStatus === 'chapters_in_progress'
      && [OUTPUT_GATE, UNIT15_SOURCE_GATE].includes(filmStatus.nextGate),
    registration_waits_for_fulltext_claim_source_audit: !brief.runtime_registration.registered
      && !brief.runtime_registration.allowed_before_full_chapter_gate
      && brief.production_requirements.chapter_registration_only_after_fulltext_claim_and_evidence_audit
  };

  const report = {
    schema: 'history_go_film_tv_industry_regulation_distribution_source_brief_v1_audit',
    version: '1.0.0',
    updated_at: '2026-08-14',
    status: brief.status,
    subject_id: 'film_tv',
    planned_unit_id: UNIT_ID,
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
    gates,
    next_gate: brief.next_gate
  };

  return {
    brief,
    sources,
    cases,
    topicBriefs,
    plannedClaims,
    report,
    registry,
    status,
    unit
  };
}

export function auditFilmTvIndustryRegulationDistributionSourceBriefV1({
  writeFiles = false,
  checkFiles = true
} = {}) {
  const built = buildFilmTvIndustryRegulationDistributionSourceBriefV1();

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

  assert(
    Object.values(built.report.gates).every(Boolean),
    `Minst én port for Industri, regulering og distribusjon feiler: ${
      Object.entries(built.report.gates).filter(([, value]) => !value).map(([key]) => key).join(', ')
    }`
  );

  return built;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditFilmTvIndustryRegulationDistributionSourceBriefV1({
      writeFiles: args.has('--write'),
      checkFiles: !args.has('--write')
    });
    console.log(
      `Film & TV-brief for Industri, regulering og distribusjon OK: `
      + `${result.topicBriefs.length} emner, ${result.sources.length} kilder, `
      + `${result.cases.length} case og ${result.plannedClaims.length} claimspor; status ${result.brief.status}.`
    );
  } catch (error) {
    console.error(`Film & TV-brief for Industri, regulering og distribusjon FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
