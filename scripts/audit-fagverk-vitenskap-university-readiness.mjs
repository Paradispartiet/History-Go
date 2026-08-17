#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  categories: 'data/categories/category_contract.json',
  status: 'data/fagverk/subject_status.json',
  pensum: 'data/fag/vitenskap/vitenskappensum_canonical_v4_5.json',
  technologyIndex: 'data/fag/teknologi/teknologi_scientific_v2/index.json',
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  report: 'reports/fagverk/vitenskap-university-readiness-audit.json'
});

const COVERAGE_IDS = [
  'scientific_practice_institutions',
  'methods_measurement_statistics_models',
  'science_history_philosophy_sts',
  'mathematics_formal_sciences',
  'physics_astronomy',
  'chemistry_material_science',
  'biology_life_sciences',
  'earth_climate_ocean_space',
  'medicine_biomedicine_public_health',
  'computing_data_ai',
  'engineering_technology_systems',
  'ethics_governance_research_integrity'
];
const BLOCKING_GAPS = [
  'mathematics_formal_sciences',
  'physics_astronomy',
  'chemistry_material_science',
  'medicine_biomedicine_public_health'
];
const BENCHMARK_IDS = [
  'benchmark_hkdir_realfag_2026',
  'benchmark_ntnu_naturvitenskap_studier_2026',
  'benchmark_uib_nt_2026',
  'benchmark_uit_nt_studier_2026',
  'benchmark_uhr_mnt_engineering'
];
const ALLOWED_BENCHMARK_HOSTS = new Set(['hkdir.no', 'www.ntnu.no', 'www.uib.no', 'uit.no', 'www.uhr.no']);
const FIRST_UNIT_EMNES = [
  'em_vit_universitet_kunnskapsproduksjon',
  'em_vit_laboratorium_praksis',
  'em_vit_instrumenter_maling',
  'em_vit_forskningsinfrastruktur',
  'em_vit_fagmiljo_standarder',
  'em_vit_fagfellevurdering',
  'em_vit_reproduserbarhet',
  'em_vit_institusjonell_tillit'
];

const abs = (relativePath) => path.join(ROOT, relativePath);
const json = (relativePath) => JSON.parse(fs.readFileSync(abs(relativePath), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();

function committedProjection(report) {
  return {
    schema: report.schema,
    version: report.version,
    status: report.status,
    generatedFrom: report.generatedFrom,
    subject: report.subject,
    inventory: report.inventory,
    benchmarks: report.benchmarks,
    coverageSummary: report.coverageSummary,
    blockingGaps: report.blockingGaps,
    neighborBoundaries: report.neighborBoundaries,
    firstProductionUnit: report.firstProductionUnit,
    gates: report.gates
  };
}

export function auditVitenskapUniversityReadiness({ writeReport = false, checkReport = true } = {}) {
  const categories = json(P.categories);
  const status = json(P.status);
  const pensum = json(P.pensum);
  const technologyIndex = json(P.technologyIndex);
  const readiness = json(P.readiness);
  const statusEntry = status.subjects.find((row) => row.id === 'vitenskap');

  assert(readiness.schema === 'history_go_fagverk_vitenskap_university_readiness_v1', 'Vitenskap readiness har feil schema');
  assert(readiness.version === '1.0.0', 'Vitenskap readiness har uventet versjon');
  assert(readiness.subject_id === 'vitenskap', 'Vitenskap readiness har feil subject_id');
  assert(readiness.title === categories.labels.vitenskap, 'Vitenskap readiness har feil canonical tittel');
  assert(readiness.status === 'readiness_locked_gaps_open', 'Vitenskap readiness kan ikke skjule åpne dekningsgap');
  assert(readiness.complete_ready === false, 'Vitenskap kan ikke være complete-ready med åpne dekningsgap');
  assert(readiness.canonical_scope?.no_fixed_completion_quota === true, 'Vitenskap readiness må forby tallkvote som ferdigbevis');
  for (const phrase of ['naturvitenskap', 'medisin', 'matematikk', 'teknologi']) {
    assert(categories.decisions?.vitenskap?.includes(phrase), `Canonical Vitenskap-scope mangler ${phrase}`);
  }
  assert(categories.fagSubjects.includes('vitenskap'), 'Vitenskap mangler som canonicalt toppfag');
  assert(!categories.fagSubjects.includes('teknologi'), 'Teknologi kan ikke være eget canonicalt toppfag');
  assert(statusEntry?.navigationStatus === 'materialized', 'Vitenskap skal være teknisk materialisert');
  assert(statusEntry?.assessmentStatus === 'audited', 'Vitenskap skal være strukturelt auditert');
  assert(statusEntry?.editorialStatus === 'structure_ready', 'Readiness-PR skal ikke late som kapitler er produsert');
  assert(statusEntry?.nextGate === 'chapter_production', 'Vitenskap skal fortsatt ha chapter_production som neste produksjonsport');

  assert(pensum.subject_id === 'vitenskap', 'Vitenskap-pensum har feil subject_id');
  assert(pensum.summary.domain_count === 6, 'Vitenskap readiness forventer seks eksisterende områder');
  assert(pensum.summary.emne_count === 93, 'Vitenskap readiness forventer 93 eksisterende emner');
  assert(pensum.summary.method_count === 84, 'Vitenskap readiness forventer 84 eksisterende metoder');
  assert(pensum.summary.mapping_count === 93, 'Vitenskap readiness forventer 93 eksisterende mappinger');
  assert(pensum.summary.topic_hook_count === 60, 'Vitenskap readiness forventer 60 eksisterende hooks');
  assert(isDeepStrictEqual(readiness.current_inventory.vitenskap, {
    domain_count: 6,
    emne_count: 93,
    method_count: 84,
    mapping_count: 93,
    hook_count: 60,
    registered_chapter_count: 0
  }), 'Vitenskap readiness har feil eksisterende inventar');

  assert(isDeepStrictEqual(technologyIndex.counts, {
    areas: 12,
    topics: 48,
    methods: 35,
    hooks: 36,
    concepts: 72,
    thinkers: 60,
    theory_objects: 24,
    modules: 12,
    knowledge_objects_total: 48,
    concepts_total: 136,
    typed_relations: 172,
    sources: 37,
    technology_anchors: 24,
    assessment_tasks: 24,
    quiz_pathways: 12,
    quiz_questions: 60
  }), 'Nested Teknologi scientific index har uventet inventar');
  assert(isDeepStrictEqual(readiness.current_inventory.teknologi, {
    canonical_parent_subject: 'vitenskap',
    top_level_subject: false,
    domain_count: 12,
    emne_count: 48,
    method_count: 35,
    mapping_count: 48,
    hook_count: 36,
    progression_module_count: 12
  }), 'Vitenskap readiness har feil Teknologi-inventar');

  assert(isDeepStrictEqual(sorted(readiness.benchmark_sources.map((row) => row.id)), sorted(BENCHMARK_IDS)), 'Vitenskap readiness mangler benchmark-kilde');
  for (const source of readiness.benchmark_sources) {
    const url = new URL(source.url);
    assert(url.protocol === 'https:', `Benchmark ${source.id} må bruke HTTPS`);
    assert(ALLOWED_BENCHMARK_HOSTS.has(url.hostname), `Benchmark ${source.id} har ikke godkjent institusjonsdomene`);
    assert(source.verified_at === '2026-08-17', `Benchmark ${source.id} mangler låst verifikasjonsdato`);
    assert(source.relevance?.length >= 90, `Benchmark ${source.id} mangler faglig relevansforklaring`);
  }

  const coverageIds = readiness.coverage_families.map((row) => row.id);
  assert(isDeepStrictEqual(sorted(coverageIds), sorted(COVERAGE_IDS)), 'Vitenskap readiness har feil coverage-familier');
  assert(new Set(coverageIds).size === coverageIds.length, 'Vitenskap readiness har dupliserte coverage-familier');
  const allowedStatuses = new Set(['strong', 'gap', 'neighbor_bridge_required', 'nested_strong']);
  for (const family of readiness.coverage_families) {
    assert(allowedStatuses.has(family.status), `Coverage ${family.id} har ukjent status`);
    assert(family.label?.length >= 12, `Coverage ${family.id} mangler label`);
    assert(family.reason?.length >= 120, `Coverage ${family.id} mangler substansiell begrunnelse`);
    assert(Array.isArray(family.existing_domain_ids) && family.existing_domain_ids.length >= 1, `Coverage ${family.id} mangler eksisterende domeneanker`);
  }
  const statusCounts = Object.fromEntries([...allowedStatuses].map((statusName) => [statusName, readiness.coverage_families.filter((row) => row.status === statusName).length]));
  assert(isDeepStrictEqual(statusCounts, { strong: 4, gap: 4, neighbor_bridge_required: 2, nested_strong: 2 }), 'Vitenskap readiness har uventet coverage-statusfordeling');
  assert(isDeepStrictEqual(readiness.blocking_gaps, BLOCKING_GAPS), 'Vitenskap readiness har feil blokkerende gapliste');
  for (const gapId of BLOCKING_GAPS) {
    const family = readiness.coverage_families.find((row) => row.id === gapId);
    assert(family?.status === 'gap', `Blocking gap ${gapId} er ikke merket gap`);
    assert(family.requires_canonical_inventory_change === true, `Blocking gap ${gapId} må kreve canonical inventory-endring`);
    assert(Array.isArray(family.candidate_topics) && family.candidate_topics.length >= 5, `Blocking gap ${gapId} mangler konkrete kandidatemner`);
  }

  assert(isDeepStrictEqual(sorted(readiness.neighbor_boundaries.map((row) => row.subject_id)), ['filosofi', 'natur', 'teknologi']), 'Vitenskap readiness har feil nabofaggrenser');
  for (const boundary of readiness.neighbor_boundaries) assert(boundary.rule?.length >= 130, `Nabofag ${boundary.subject_id} mangler eksplisitt grense`);
  const technologyBoundary = readiness.neighbor_boundaries.find((row) => row.subject_id === 'teknologi');
  assert(technologyBoundary?.relationship === 'nested_specialization', 'Teknologi må være nested_specialization');

  const firstUnit = readiness.first_production_unit;
  assert(firstUnit.chapter_id === 'vitenskap-fra-observasjon-til-etterprovbar-kunnskap', 'Vitenskap readiness har feil første produksjonsenhet');
  assert(firstUnit.primary_domain_id === 'institusjoner_laboratorier_kunnskapssteder', 'Første produksjonsenhet har feil primærdomene');
  assert(firstUnit.status === 'ready_for_chapter_brief', 'Første produksjonsenhet er ikke brief-ready');
  assert(isDeepStrictEqual(firstUnit.emne_ids, FIRST_UNIT_EMNES), 'Første produksjonsenhet har feil emneutvalg');
  const primaryDomain = pensum.domains.find((row) => row.domain_id === firstUnit.primary_domain_id);
  assert(primaryDomain, 'Første produksjonsenhet peker til ukjent Vitenskap-domene');
  assert(firstUnit.emne_ids.every((id) => primaryDomain.emne_ids.includes(id)), 'Første produksjonsenhet bruker emne utenfor primærdomene');

  assert(readiness.completion_requirements.length >= 9, 'Vitenskap readiness har for svak completion-kontrakt');
  assert(readiness.quality_contract?.minimum_dimension_score === 4, 'Vitenskap quality gate må kreve minst 4/5 per dimensjon');
  assert(readiness.quality_contract?.minimum_total_score === 27, 'Vitenskap quality gate må kreve minst 27/30');
  assert(readiness.quality_contract?.article_or_chapter_requirements?.includes('no_generic_template_reuse'), 'Vitenskap quality gate mangler vern mot generisk malgjenbruk');

  const report = {
    schema: 'history_go_fagverk_vitenskap_university_readiness_audit_v1',
    version: '1.0.0',
    status: 'readiness_locked_gaps_open',
    generatedFrom: P,
    subject: {
      id: 'vitenskap',
      title: readiness.title,
      editorialStatus: statusEntry.editorialStatus,
      nextGate: statusEntry.nextGate,
      completeReady: readiness.complete_ready
    },
    inventory: readiness.current_inventory,
    benchmarks: readiness.benchmark_sources.map(({ id, publisher, url, verified_at }) => ({ id, publisher, url, verified_at })),
    coverageSummary: {
      familyCount: readiness.coverage_families.length,
      statusCounts,
      blockingGapCount: readiness.blocking_gaps.length
    },
    blockingGaps: readiness.blocking_gaps,
    neighborBoundaries: readiness.neighbor_boundaries.map(({ subject_id, relationship }) => ({ subject_id, relationship })),
    firstProductionUnit: {
      chapterId: firstUnit.chapter_id,
      primaryDomainId: firstUnit.primary_domain_id,
      emneIds: firstUnit.emne_ids,
      status: firstUnit.status
    },
    gates: {
      canonicalScopeMatchesCategoryContract: true,
      fixedCompletionQuotaForbidden: true,
      existingVitenskapInventoryLocked: true,
      nestedTechnologyInventoryLocked: true,
      officialBenchmarksInspectable: true,
      coverageFamiliesExplicit: true,
      blockingGapsExplicit: true,
      neighborBoundariesExplicit: true,
      firstProductionUnitUsesOnlyCanonicalEmners: true,
      prematureCompleteBlocked: true,
      qualityThresholdLocked: true
    }
  };

  const committed = committedProjection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committed, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), committed), `${P.report} er utdatert`);
  return { report, readiness, pensum, technologyIndex };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditVitenskapUniversityReadiness({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Vitenskap university readiness OK: ${report.coverageSummary.familyCount} coverage-familier, ${report.coverageSummary.blockingGapCount} blokkerende gap, completeReady=${report.subject.completeReady}`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
