#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  categories: 'data/categories/category_contract.json',
  status: 'data/fagverk/subject_status.json',
  pensum: 'data/fag/vitenskap/vitenskappensum_canonical_v4_6.json',
  technologyIndex: 'data/fag/teknologi/teknologi_scientific_v2/index.json',
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  spec: 'data/fag/vitenskap/vitenskap_university_breadth_reconciliation_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  release: 'data/fagverk/fagverk_release.json',
  chapter: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json',
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
const EDITORIAL_BLOCKERS = [
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
const FIRST_UNIT_ID = 'vitenskap-fra-observasjon-til-etterprovbar-kunnskap';
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();

function projection(report) {
  return {
    schema: report.schema,
    version: report.version,
    status: report.status,
    generatedFrom: report.generatedFrom,
    subject: report.subject,
    inventory: report.inventory,
    benchmarks: report.benchmarks,
    coverageSummary: report.coverageSummary,
    structuralBlockingGaps: report.structuralBlockingGaps,
    editorialBlockers: report.editorialBlockers,
    neighborBoundaries: report.neighborBoundaries,
    firstProductionUnit: report.firstProductionUnit,
    registration: report.registration,
    gates: report.gates
  };
}

export function auditVitenskapUniversityReadiness({ writeReport = false, checkReport = true } = {}) {
  const categories = json(P.categories);
  const status = json(P.status);
  const pensum = json(P.pensum);
  const technologyIndex = json(P.technologyIndex);
  const readiness = json(P.readiness);
  const spec = json(P.spec);
  const registry = json(P.registry);
  const release = json(P.release);
  const chapter = json(P.chapter);
  const statusEntry = status.subjects.find((row) => row.id === 'vitenskap');
  const registrySubject = registry.subjects?.vitenskap;
  const releaseSubject = release.subjects?.vitenskap;

  assert(readiness.schema === 'history_go_fagverk_vitenskap_university_readiness_v1', 'Vitenskap readiness har feil schema');
  assert(readiness.version === '1.2.0', 'Vitenskap readiness har feil post-reconciliation-versjon');
  assert(readiness.subject_id === 'vitenskap', 'Vitenskap readiness har feil subject_id');
  assert(readiness.title === categories.labels.vitenskap, 'Vitenskap readiness har feil canonical tittel');
  assert(readiness.status === 'breadth_inventory_reconciled_chapter_production_in_progress', 'Vitenskap readiness har feil post-reconciliation-status');
  assert(readiness.complete_ready === false, 'Inventory-reconciliation kan ikke gjøre Vitenskap complete-ready');
  assert(readiness.canonical_scope?.no_fixed_completion_quota === true, 'Vitenskap må fortsatt forby tallkvote som ferdigbevis');
  assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'Vitenskap må forbli chapters_in_progress');
  assert(statusEntry?.nextGate === 'remaining_chapter_production_across_reconciled_university_breadth', 'Vitenskap har feil neste port');

  assert(isDeepStrictEqual(pensum.summary, {
    domain_count: 6,
    emne_count: 117,
    method_count: 84,
    mapping_count: 117,
    topic_hook_count: 64,
    all_emner_have_mapping: true,
    all_method_refs_valid: true
  }), 'Vitenskap v4.6-pensum har feil summary');
  assert(isDeepStrictEqual(readiness.current_inventory.vitenskap, {
    domain_count: 6,
    emne_count: 117,
    method_count: 84,
    mapping_count: 117,
    hook_count: 64,
    registered_chapter_count: 1
  }), 'Readiness har feil v4.6-inventar');
  assert(isDeepStrictEqual(readiness.current_inventory.teknologi, {
    canonical_parent_subject: 'vitenskap',
    top_level_subject: false,
    domain_count: 12,
    emne_count: 48,
    method_count: 35,
    mapping_count: 48,
    hook_count: 36,
    progression_module_count: 12
  }), 'Readiness har feil nested Teknologi-inventar');
  assert(technologyIndex.counts?.areas === 12 && technologyIndex.counts?.topics === 48 && technologyIndex.counts?.methods === 35 && technologyIndex.counts?.hooks === 36, 'Nested Teknologi-index har uventede kjernetall');

  assert(isDeepStrictEqual(sorted(readiness.benchmark_sources.map((row) => row.id)), sorted(BENCHMARK_IDS)), 'Readiness mangler benchmark-kilde');
  for (const source of readiness.benchmark_sources) {
    const url = new URL(source.url);
    assert(url.protocol === 'https:', `Benchmark ${source.id} må bruke HTTPS`);
    assert(ALLOWED_BENCHMARK_HOSTS.has(url.hostname), `Benchmark ${source.id} har ikke godkjent institusjonsdomene`);
    assert(source.verified_at === '2026-08-17', `Benchmark ${source.id} mangler låst verifikasjonsdato`);
    assert(source.relevance?.length >= 90, `Benchmark ${source.id} mangler faglig relevansforklaring`);
  }

  assert(isDeepStrictEqual(sorted(readiness.coverage_families.map((row) => row.id)), sorted(COVERAGE_IDS)), 'Readiness har feil coverage-familier');
  const allowedStatuses = new Set(['strong', 'inventory_reconciled', 'neighbor_bridge_required', 'nested_strong']);
  for (const family of readiness.coverage_families) {
    assert(allowedStatuses.has(family.status), `Coverage ${family.id} har ukjent status ${family.status}`);
    assert(family.reason?.length >= 120, `Coverage ${family.id} mangler substansiell begrunnelse`);
  }
  const statusCounts = Object.fromEntries([...allowedStatuses].map((name) => [name, readiness.coverage_families.filter((row) => row.status === name).length]));
  assert(isDeepStrictEqual(statusCounts, { strong: 4, inventory_reconciled: 4, neighbor_bridge_required: 2, nested_strong: 2 }), 'Readiness har feil post-reconciliation-statusfordeling');
  assert(Array.isArray(readiness.blocking_gaps) && readiness.blocking_gaps.length === 0, 'Strukturelle blocking gaps skal være reconcilet');
  assert(isDeepStrictEqual(sorted(readiness.editorial_blockers || []), sorted(EDITORIAL_BLOCKERS)), 'Fire breadth-familier skal fortsatt blokkere editorial completion');

  for (const id of EDITORIAL_BLOCKERS) {
    const family = readiness.coverage_families.find((row) => row.id === id);
    const specFamily = spec.families.find((row) => row.coverage_family_id === id);
    assert(family?.status === 'inventory_reconciled', `${id} er ikke inventory_reconciled`);
    assert(family?.requires_canonical_inventory_change === false, `${id} krever fortsatt canonical inventory-endring`);
    assert(isDeepStrictEqual(sorted(family?.reconciled_emne_ids || []), sorted(specFamily.topics.map((row) => row.id))), `${id} har feil reconcilet emnesett`);
    assert(family?.reconciled_hook_id === specFamily.hook.id, `${id} har feil reconcilet hook`);
  }

  assert(isDeepStrictEqual(sorted(readiness.neighbor_boundaries.map((row) => row.subject_id)), ['filosofi', 'natur', 'teknologi']), 'Vitenskap readiness har feil nabofaggrenser');
  const technologyBoundary = readiness.neighbor_boundaries.find((row) => row.subject_id === 'teknologi');
  assert(technologyBoundary?.relationship === 'nested_specialization', 'Teknologi må forbli nested_specialization');

  const firstUnit = readiness.first_production_unit;
  assert(firstUnit?.chapter_id === FIRST_UNIT_ID, 'Readiness har feil første produksjonsenhet');
  assert(firstUnit?.status === 'materialized_and_registered', 'Unit 1 er ikke materialisert og registrert');
  assert(isDeepStrictEqual(firstUnit?.emne_ids, FIRST_UNIT_EMNES), 'Unit 1 har feil emnesett');
  assert(chapter.chapter_id === FIRST_UNIT_ID && chapter.editorialStatus === 'chapter_ready', 'Unit 1-kapittelroot har feil state');
  assert(registrySubject?.chapters?.length === 1 && registrySubject.chapters[0].id === FIRST_UNIT_ID, 'Registry må bevare nøyaktig Unit 1');
  assert(releaseSubject?.chapter_status === 'materialized' && releaseSubject?.chapter_count === 1, 'Release må bevare materialisert Unit 1');
  assert(releaseSubject?.missing_chapter_files?.length === 0, 'Vitenskap release har manglende kapittelfiler');

  assert(readiness.quality_contract?.minimum_dimension_score === 4, 'Quality gate må fortsatt kreve minst 4/5 per dimensjon');
  assert(readiness.quality_contract?.minimum_total_score === 27, 'Quality gate må fortsatt kreve minst 27/30');
  assert(readiness.quality_contract?.article_or_chapter_requirements?.includes('no_generic_template_reuse'), 'Quality gate mangler vern mot generisk malgjenbruk');

  const report = {
    schema: 'history_go_fagverk_vitenskap_university_readiness_audit_v1',
    version: '1.2.0',
    status: 'breadth_inventory_reconciled_chapter_production_in_progress',
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
      structuralBlockingGapCount: readiness.blocking_gaps.length,
      editorialBlockerCount: readiness.editorial_blockers.length
    },
    structuralBlockingGaps: readiness.blocking_gaps,
    editorialBlockers: readiness.editorial_blockers,
    neighborBoundaries: readiness.neighbor_boundaries.map(({ subject_id, relationship }) => ({ subject_id, relationship })),
    firstProductionUnit: {
      chapterId: firstUnit.chapter_id,
      primaryDomainId: firstUnit.primary_domain_id,
      emneIds: firstUnit.emne_ids,
      status: firstUnit.status,
      materializedEvidence: firstUnit.materialized_evidence
    },
    registration: {
      registryChapterCount: registrySubject.chapters.length,
      releaseChapterStatus: releaseSubject.chapter_status,
      releaseChapterCount: releaseSubject.chapter_count,
      releaseMissingFileCount: releaseSubject.missing_chapter_files.length
    },
    gates: {
      canonicalV46InventoryLocked: true,
      officialBenchmarksInspectable: true,
      structuralBreadthGapsReconciled: true,
      editorialBreadthBlockersExplicit: true,
      neighborBoundariesExplicit: true,
      technologyRemainsNested: true,
      firstProductionUnitPreserved: true,
      registryAndReleaseAligned: true,
      prematureCompleteBlocked: true,
      qualityThresholdLocked: true
    }
  };

  const committed = projection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committed, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), committed), `${P.report} er utdatert`);
  return { report, readiness, pensum, technologyIndex, spec };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditVitenskapUniversityReadiness({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Vitenskap readiness OK: ${report.inventory.vitenskap.emne_count} emner, ${report.coverageSummary.editorialBlockerCount} editorial blockers, completeReady=${report.subject.completeReady}`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
