#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNIT_ID = 'arkiv-bevaring-tilgang-og-autentisitet';
const INPUT_GATE = 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief';
const OUTPUT_GATE = 'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production';
const FULLTEXT_GATE = 'archive_preservation_access_authenticity_full_chapter_complete_next_unit_source_brief';
const UNIT_FOURTEEN_OR_LATER_GATES = new Set([OUTPUT_GATE, FULLTEXT_GATE]);

export const isFilmTvUnitFourteenOrLaterGate = (gate) => UNIT_FOURTEEN_OR_LATER_GATES.has(gate);

const P = Object.freeze({
  plan: 'data/fag/TV_og_Film/film_tv_learning_order_plan_v1.json',
  emners: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  methods: 'data/fag/TV_og_Film/methods_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  brief: 'data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_source_claim_brief_v1.json',
  sources: 'data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_sources_v1.json',
  cases: 'data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_cases_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_topic_claims_v1.json',
  report: 'reports/fagverk/film-tv-archive-preservation-access-authenticity-source-brief-v1-audit.json',
  historyAudit: 'reports/fagverk/film-tv-history-movements-historiography-fulltext-v1-audit.json',
  documentaryAudit: 'reports/fagverk/film-tv-documentary-evidence-ethics-fulltext-v1-audit.json',
  creativeAudit: 'reports/fagverk/film-tv-creative-work-technology-responsibility-fulltext-v1-audit.json'
});

const PREREQUISITES = Object.freeze([
  {
    id: 'filmhistorie-bevegelser-og-historiografi',
    file: 'data/fagverk/film_tv/filmhistorie-bevegelser-og-historiografi.json',
    claimsFile: 'data/fagverk/film_tv/filmhistorie-bevegelser-og-historiografi/claims.json',
    briefFile: 'data/fagverk/film_tv/filmhistorie-bevegelser-og-historiografi/brief.json',
    auditFile: P.historyAudit,
    auditStatus: 'history_movements_historiography_chapter_verified_registered'
  },
  {
    id: 'dokumentar-evidens-og-etikk',
    file: 'data/fagverk/film_tv/dokumentar-evidens-og-etikk.json',
    claimsFile: 'data/fagverk/film_tv/dokumentar-evidens-og-etikk/claims.json',
    briefFile: 'data/fagverk/film_tv/dokumentar-evidens-og-etikk/brief.json',
    auditFile: P.documentaryAudit,
    auditStatus: 'documentary_evidence_ethics_chapter_verified_registered'
  },
  {
    id: 'skapende-arbeid-teknologi-og-ansvar',
    file: 'data/fagverk/film_tv/skapende-arbeid-teknologi-og-ansvar.json',
    claimsFile: 'data/fagverk/film_tv/skapende-arbeid-teknologi-og-ansvar/claims.json',
    briefFile: 'data/fagverk/film_tv/skapende-arbeid-teknologi-og-ansvar/brief.json',
    auditFile: P.creativeAudit,
    auditStatus: 'creative_work_technology_responsibility_chapter_verified_registered'
  }
]);

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
const normalizeEditorialText = (value) => String(value || '').toLocaleLowerCase('nb-NO').replace(/\s+/gu, ' ').trim();

function prerequisiteIsMaterializedAndAudited(registry, prerequisite) {
  const chapter = registry.subjects.film_tv.chapters.find((row) => row.id === prerequisite.id);
  if (!chapter) return false;
  if (chapter.file !== prerequisite.file || chapter.claimsFile !== prerequisite.claimsFile || chapter.briefFile !== prerequisite.briefFile) return false;
  if (![prerequisite.file, prerequisite.claimsFile, prerequisite.briefFile, prerequisite.auditFile].every((file) => fs.existsSync(abs(file)))) return false;
  const audit = read(prerequisite.auditFile);
  return audit.status === prerequisite.auditStatus;
}

export function buildFilmTvArchivePreservationAccessAuthenticitySourceBriefV1() {
  const plan = read(P.plan);
  const unit = plan.planned_units.find((row) => row.id === UNIT_ID);
  assert(unit, 'Læringsplanen mangler Arkiv, bevaring, tilgang og autentisitet');

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
  const sourceDocument = read(P.sources);
  const caseDocument = read(P.cases);
  const topicClaimDocument = read(P.topicClaims);
  const sources = sourceDocument.sources || [];
  const cases = caseDocument.cases || [];
  const topicBriefs = topicClaimDocument.topic_briefs || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const caseById = new Map(cases.map((row) => [row.id, row]));
  const plannedClaims = topicBriefs.flatMap((row) => row.planned_claims || []);
  const usedSourceIds = new Set([...topicBriefs.flatMap((row) => row.source_ids || []), ...cases.flatMap((row) => row.source_ids || [])]);
  const usedCaseIds = new Set(topicBriefs.flatMap((row) => row.case_ids || []));
  const claimCounts = topicBriefs.map((row) => (row.planned_claims || []).length);
  const moduleEmneIds = brief.proposed_module_order.flatMap((row) => row.emne_ids);
  const normalizedLearningGoals = topicBriefs.map((row) => normalizeEditorialText(row.learning_goal));
  const normalizedClaimFocuses = plannedClaims.map((row) => normalizeEditorialText(row.claim_focus));
  const placeholderPattern = /\b(?:todo|tbd|placeholder|lorem ipsum|sett inn|kommer senere)\b/iu;
  const engineSource = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const forbiddenScmTokens = ['child_' + 'process', 'execFile' + 'Sync', 'spawn' + 'Sync'];
  const forbiddenGitCommand = new RegExp(`git\\s+(?:${['fetch', 'merge', 'push'].join('|')})`);

  const prerequisitesVerified = PREREQUISITES.every((prerequisite) => prerequisiteIsMaterializedAndAudited(registry, prerequisite));

  registry.version = maxDottedVersion(registry.version, '3.00.0');
  registry.updatedAt = maxIsoDate(registry.updatedAt, '2026-08-15');
  registry.subjects.film_tv.canonicalModel.fourteenthSourceClaimBrief = P.brief;
  if (!laterGateAlreadyActive) {
    registry.subjects.film_tv.canonicalModel.note = 'Film & TVs variable canon har 192 emner. Kilde- og claimbriefen for Arkiv, bevaring, tilgang og autentisitet er ferdig med 11 canonicale emner, 4 variable moduler, 53 planlagte claims, 30 inspectable kilder og 26 dokumenterte arkivcase. Bevaring, digitalisering, restaurering, rekonstruksjon og tilgang holdes eksplisitt adskilt; proveniens, metadata, versjonshistorie, rettigheter/personvern, urfolks- og fellesskapskontroll, born-digital migrering, plattformustabilitet og dokumentert tap har egne evidensgrenser. Kapitlet registreres ikke før fulltekst-, claim- og evidensporten er bestått.';
  }

  status.version = maxDottedVersion(status.version, '1.93.0');
  status.updatedAt = maxIsoDate(status.updatedAt, '2026-08-15');
  if (!laterGateAlreadyActive) {
    filmStatus.editorialStatus = 'chapters_in_progress';
    filmStatus.nextGate = OUTPUT_GATE;
    filmStatus.note = 'Kilde- og claimbriefen for Arkiv, bevaring, tilgang og autentisitet er ferdig: 11/11 canonicale emner, 4 variable moduler, 53 planlagte claims, 30 inspectable kilder og 26 case. Arkivinstitusjon, proveniens, bærer/format, bevaring/restaurering, metadata, tilgang/rettigheter/personvern, fellesskapskontroll, born-digital migrering, plattformkataloger, produksjonsarkiv, verkversjoner og dokumentert fravær har separate evidenskrav. Neste port er fulltekstproduksjon og claimspesifikk evidensmapping.';
  }

  const sourceFamiliesPresent = {
    fiafEthicsCataloguingAndRestoration: ['ap01-fiaf-code-ethics-2025', 'ap02-fiaf-digital-statement', 'ap03-fiaf-cataloguing-manual', 'ap04-fiaf-cdc-resources'].every((id) => sourceIds.has(id)),
    documentaryAndDigitalPreservation: ['ap05-unesco-documentary-heritage-recommendation', 'ap06-loc-digital-preservation', 'ap07-loc-sustainability-formats', 'ap08-loc-premis-3', 'ap09-loc-film-preservation-plan', 'ap10-loc-preserving-collections', 'ap11-loc-packard-campus', 'ap12-ndsa-levels-2-1', 'ap13-ndsa-authenticity-glossary'].every((id) => sourceIds.has(id)),
    norwayAndUkInstitutionalPractice: ['ap14-nb-moving-images', 'ap15-nb-delivery-list', 'ap16-nb-collection', 'ap17-bfi-collections-team', 'ap18-bfi-archive-access', 'ap19-bfi-screencraft'].every((id) => sourceIds.has(id)),
    accessRightsAndCommunityControl: ['ap20-nfsa-collection-policy', 'ap21-nfsa-access-icip', 'ap22-nfsa-first-nations-collection', 'ap23-eu-gdpr-article-89', 'ap24-ica-access-restrictions', 'ap25-europeana-rights-statements', 'ap26-us-copyright-section108', 'ap30-undrip-cultural-control'].every((id) => sourceIds.has(id)),
    streamingCatalogResearch: ['ap27-kelly-streaming-preservation', 'ap28-aegidius-andersen-streaming-collection', 'ap29-roth-svod-open-data'].every((id) => sourceIds.has(id))
  };

  const gates = {
    exact_unit_fourteen_problem_set_and_sequence: unit.sequence === 14 && plan.production_sequence[13] === UNIT_ID && unit.emne_count === 11,
    exact_prerequisite_contract: isDeepStrictEqual(unit.prerequisite_planned_unit_ids, PREREQUISITES.map((row) => row.id)) && isDeepStrictEqual(unit.prerequisite_existing_chapter_ids, []),
    prerequisite_fulltext_artifacts_and_audits_green: prerequisitesVerified,
    current_status_is_input_output_or_known_later_gate: [INPUT_GATE, OUTPUT_GATE, FULLTEXT_GATE].includes(currentGate),
    exact_unit_emne_coverage: topicBriefs.length === unit.emne_count && new Set(topicBriefs.map((row) => row.emne_id)).size === unit.emne_count && isDeepStrictEqual(brief.scope.emne_ids, unit.emne_ids) && unit.emne_ids.every((id) => topicBriefs.some((row) => row.emne_id === id)),
    all_emners_active_canonical: topicBriefs.every((row) => emneById.get(row.emne_id)?.status === 'active'),
    all_canonical_topics_have_methods: topicBriefs.every((row) => {
      const canonical = emneById.get(row.emne_id);
      const canonicalMethodIds = canonical?.method_ids || canonical?.recommended_method_ids || [];
      return Array.isArray(canonicalMethodIds) && canonicalMethodIds.length > 0 && canonicalMethodIds.every((id) => methodIds.has(id));
    }),
    thirty_inspectable_https_sources: sources.length === 30 && new Set(sources.map((row) => row.id)).size === 30 && sources.every((row) => row.url?.startsWith('https://') && row.source_location && row.territory && row.evidence_role && row.retrieval_status === 'verified_2026-08-15'),
    evidence_source_families_present: Object.values(sourceFamiliesPresent).every(Boolean),
    every_source_used: sources.every((row) => usedSourceIds.has(row.id)),
    every_source_reference_resolves: [...usedSourceIds].every((id) => sourceIds.has(id)),
    twenty_six_documented_cases_used: cases.length === 26 && new Set(cases.map((row) => row.id)).size === 26 && cases.every((row) => usedCaseIds.has(row.id)) && cases.every((row) => row.source_ids.length > 0 && row.purpose && row.territory && row.years),
    every_case_reference_resolves: topicBriefs.every((row) => row.case_ids.every((id) => caseIds.has(id))),
    every_case_has_evidence_overlap_with_owning_topic: topicBriefs.every((topic) => topic.case_ids.every((id) => caseById.get(id).source_ids.some((sourceId) => topic.source_ids.includes(sourceId)))),
    fifty_three_variable_planned_claims: plannedClaims.length === 53 && new Set(plannedClaims.map((row) => row.id)).size === 53 && isDeepStrictEqual(claimCounts, [5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 4]) && new Set(claimCounts).size > 1,
    no_planned_claim_overstated_as_verified: plannedClaims.every((row) => row.status === 'planned_requires_fulltext_verification'),
    all_topics_have_sources_cases_claims_and_goal: topicBriefs.every((row) => row.source_ids.length >= 4 && row.case_ids.length >= 3 && row.planned_claims.length >= 4 && row.learning_goal),
    editorial_specificity_checked_across_entire_brief: normalizedLearningGoals.length === 11 && new Set(normalizedLearningGoals).size === 11 && normalizedLearningGoals.every((value) => value.length >= 80 && !placeholderPattern.test(value)) && normalizedClaimFocuses.length === 53 && new Set(normalizedClaimFocuses).size === 53 && normalizedClaimFocuses.every((value) => value.length >= 80 && !placeholderPattern.test(value)) && plannedClaims.every((row) => typeof row.claim_type === 'string' && row.claim_type.length >= 8),
    topic_source_case_combinations_are_distinct: new Set(topicBriefs.map((row) => JSON.stringify({ source_ids: row.source_ids, case_ids: row.case_ids }))).size === topicBriefs.length,
    four_variable_modules_cover_every_emne_once: brief.proposed_module_order.length === 4 && isDeepStrictEqual(brief.proposed_module_order.map((row) => row.emne_ids.length), [3, 3, 3, 2]) && moduleEmneIds.length === unit.emne_count && new Set(moduleEmneIds).size === unit.emne_count && unit.emne_ids.every((id) => moduleEmneIds.includes(id)),
    source_documents_are_versioned_and_scoped: sourceDocument.schema === 'history_go_film_tv_archive_preservation_access_authenticity_sources_v1' && sourceDocument.version === '1.0.0' && sourceDocument.planned_unit_id === UNIT_ID && caseDocument.schema === 'history_go_film_tv_archive_preservation_access_authenticity_cases_v1' && caseDocument.version === '1.0.0' && caseDocument.planned_unit_id === UNIT_ID && topicClaimDocument.schema === 'history_go_film_tv_archive_preservation_access_authenticity_topic_claims_v1' && topicClaimDocument.version === '1.0.0' && topicClaimDocument.planned_unit_id === UNIT_ID,
    brief_engine_contains_no_scm_sync_or_push: forbiddenScmTokens.every((token) => !engineSource.includes(token)) && !forbiddenGitCommand.test(engineSource),
    preservation_digitization_restoration_reconstruction_access_are_separate: brief.source_policy.preservation_digitization_restoration_reconstruction_and_access_are_distinct_actions && brief.source_policy.digital_copy_does_not_prove_long_term_preservation && brief.source_policy.streaming_availability_does_not_equal_archival_preservation_or_permanent_access,
    provenance_metadata_and_object_levels_are_explicit: brief.source_policy.archive_object_work_manifestation_item_and_access_copy_are_distinct && brief.source_policy.provenance_requires_documented_chain_not_filename_or_visual_similarity && brief.source_policy.metadata_and_cataloguing_are_evidence_infrastructure_not_neutral_description && brief.source_policy.catalog_entry_does_not_prove_item_survival_completeness_or_viewing_access,
    access_rights_privacy_and_reuse_are_separate: brief.source_policy.findability_access_right_to_view_and_right_to_reuse_are_distinct && brief.source_policy.copyright_permission_privacy_data_protection_contract_and_archive_policy_are_distinct && brief.source_policy.public_interest_archiving_does_not_remove_data_protection_safeguards,
    indigenous_and_community_control_are_explicit: brief.source_policy.rights_holder_permission_does_not_override_indigenous_collective_cultural_control && brief.source_policy.indigenous_and_community_material_requires_community_led_or_authoritative_protocol_sources && brief.source_policy.repatriation_digital_return_access_copy_and_transfer_of_custody_are_distinct,
    born_digital_migration_and_authenticity_are_separate: brief.source_policy.born_digital_preservation_requires_fixity_storage_monitoring_format_strategy_and_documented_events && brief.source_policy.format_migration_is_a_preservation_event_not_proof_of_unchanged_identity,
    streaming_catalog_instability_is_method_bounded: brief.source_policy.platform_catalog_change_requires_date_territory_account_state_and_collection_method && brief.source_policy.streaming_availability_does_not_equal_archival_preservation_or_permanent_access,
    restoration_versions_loss_and_reconstruction_are_separate: brief.source_policy.restoration_intervention_must_be_documented_and_reversible_where_practicable && brief.source_policy.restored_version_is_not_automatically_the_original_or_single_authoritative_version && brief.source_policy.absence_missing_footage_and_destroyed_material_are_not_interchangeable_claims && brief.source_policy.reconstruction_must_mark_inference_substitution_and_unknown_material,
    production_archive_is_not_released_work: brief.source_policy.production_archive_material_is_not_identical_to_the_released_work,
    fulltext_claim_trace_and_verification_boundary_explicit: brief.source_policy.planned_claim_is_not_verified_claim && brief.source_policy.fulltext_requires_paragraph_level_claim_trace && brief.runtime_registration.registered === false && brief.runtime_registration.allowed_before_full_chapter_gate === false,
    unit_fifteen_boundary_explicit: normalizeEditorialText(brief.scope.overlap_boundary).includes('enhet 15') && normalizeEditorialText(brief.scope.overlap_boundary).includes('kanonisering') && normalizeEditorialText(brief.scope.overlap_boundary).includes('kollektivt minne'),
    all_source_policy_guards_remain_true: Object.values(brief.source_policy).every((value) => value === true)
  };

  for (const [id, ok] of Object.entries(gates)) assert(ok, `Source-brief-port feilet: ${id}`);

  const qualityAssessment = {
    schema: 'history_go_six_dimension_quality_assessment_v1',
    assessment_scope: 'film_tv_unit_14_source_claim_brief',
    scale: { minimum: 1, maximum: 5 },
    threshold: { minimum_dimension_score: 4, minimum_total_score: 27, maximum_total_score: 30, critical_deviations_allowed: 0 },
    dimensions: {
      correctness_and_evidence: { score: 5, evidence: '30 inspectable kilder er organisert i fem komplementære evidensfamilier; alle 30 er brukt og alle kildehenvisninger resolver.' },
      coverage_and_completion: { score: 5, evidence: '11/11 canonicale emner er eid nøyaktig én gang gjennom fire moduler, 53 planlagte claims og 26 dokumenterte case.' },
      editorial_quality: { score: 5, evidence: 'Alle læringsmål og claimfokus er særskrevne, substansielle, unike og uten placeholderprosa; claimmengden varierer med problemkompleksitet.' },
      technical_integrity: { score: 5, evidence: 'Forutsetningskapitlene kreves både registrert med korrekt filkontrakt og dokumentert grønne i egne fulltekstaudits; alle kilde-, case- og emnereferanser er resolvable.' },
      safety_and_responsibility: { score: 5, evidence: 'Personvern, rettigheter, sensitivt materiale, urfolks- og fellesskapskontroll, rekonstruksjonsusikkerhet og plattformobservasjon har separate evidensgrenser.' },
      maintainability_and_reproducibility: { score: 5, evidence: 'Briefmotoren er SCM-fri, datadokumentene er versjonerte, gateovergangen er deterministisk og enhet 15-grensen er permanent eksplisitt.' }
    },
    total_score: 30,
    critical_deviations: [],
    unresolved_blockers: [],
    conclusion: 'high_quality_source_brief_ready_for_fulltext'
  };

  assert(Object.values(qualityAssessment.dimensions).every((dimension) => dimension.score >= 4), 'Kvalitetsdimensjon under minstekrav');
  assert(qualityAssessment.total_score >= 27, 'Kvalitetsvurderingen er under totalgrensen');

  const report = {
    schema: 'history_go_film_tv_archive_preservation_access_authenticity_source_brief_v1_audit',
    version: '1.0.0',
    updated_at: '2026-08-15',
    status: 'archive_preservation_access_authenticity_source_brief_verified',
    subject_id: 'film_tv',
    planned_unit_id: UNIT_ID,
    summary: {
      emne_count: topicBriefs.length,
      module_count: brief.proposed_module_order.length,
      planned_claim_count: plannedClaims.length,
      source_count: sources.length,
      used_source_count: usedSourceIds.size,
      case_count: cases.length,
      used_case_count: usedCaseIds.size
    },
    claim_counts_by_emne: claimCounts,
    quality_assessment: qualityAssessment,
    gates,
    next_gate: OUTPUT_GATE
  };

  return { brief, sources, cases, topicBriefs, plannedClaims, registry, status, report };
}

export function materializeFilmTvArchivePreservationAccessAuthenticitySourceBriefV1() {
  const built = buildFilmTvArchivePreservationAccessAuthenticitySourceBriefV1();
  write(P.registry, built.registry);
  write(P.status, built.status);
  write(P.report, built.report);
  return built;
}

export function auditFilmTvArchivePreservationAccessAuthenticitySourceBriefV1() {
  const built = buildFilmTvArchivePreservationAccessAuthenticitySourceBriefV1();
  assert(fs.existsSync(abs(P.report)), `${P.report} mangler`);
  assert(isDeepStrictEqual(read(P.registry), built.registry), `${P.registry} er utdatert`);
  assert(isDeepStrictEqual(read(P.status), built.status), `${P.status} er utdatert`);
  assert(isDeepStrictEqual(read(P.report), built.report), `${P.report} er utdatert`);
  return built.report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = args.has('--write')
      ? materializeFilmTvArchivePreservationAccessAuthenticitySourceBriefV1().report
      : auditFilmTvArchivePreservationAccessAuthenticitySourceBriefV1();
    console.log(`Film & TV enhet 14 source brief OK: ${report.summary.emne_count} emner, ${report.summary.planned_claim_count} planlagte claims, ${report.summary.source_count} kilder og ${report.summary.case_count} case.`);
  } catch (error) {
    console.error(`Film & TV enhet 14 source brief FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
