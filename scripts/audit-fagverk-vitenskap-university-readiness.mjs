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
const BREADTH_FAMILIES = [
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
    materializedBreadthFamilies: report.materializedBreadthFamilies,
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
  assert(['1.2.0', '1.3.0', '1.4.0'].includes(readiness.version), 'Vitenskap readiness har ukjent post-reconciliation-versjon');
  assert(readiness.subject_id === 'vitenskap', 'Vitenskap readiness har feil subject_id');
  assert(readiness.title === categories.labels.vitenskap, 'Vitenskap readiness har feil canonical tittel');
  assert(['breadth_inventory_reconciled_chapter_production_in_progress','breadth_chapters_materialized_final_audit_pending','university_breadth_complete'].includes(readiness.status), 'Vitenskap readiness har feil chapter-production-status');
  assert(readiness.complete_ready === (readiness.status === 'university_breadth_complete'), 'Vitenskap complete_ready må følge eksplisitt university_breadth_complete-status');
  assert(readiness.canonical_scope?.no_fixed_completion_quota === true, 'Vitenskap må fortsatt forby tallkvote som ferdigbevis');
  assert(statusEntry?.editorialStatus === (readiness.complete_ready ? 'complete' : 'chapters_in_progress'), 'Vitenskap editorialStatus matcher ikke readiness completion state');
  assert(['remaining_chapter_production_across_reconciled_university_breadth','final_holistic_university_breadth_completion_audit','maintenance_source_refresh_and_place_case_expansion'].includes(statusEntry?.nextGate), 'Vitenskap har feil neste port');

  assert(isDeepStrictEqual(pensum.summary, {
    domain_count: 6,
    emne_count: 117,
    method_count: 84,
    mapping_count: 117,
    topic_hook_count: 64,
    all_emner_have_mapping: true,
    all_method_refs_valid: true
  }), 'Vitenskap v4.6-pensum har feil summary');
  assert(readiness.current_inventory?.vitenskap?.domain_count === 6, 'Readiness har feil domain count');
  assert(readiness.current_inventory?.vitenskap?.emne_count === 117, 'Readiness har feil emne count');
  assert(readiness.current_inventory?.vitenskap?.method_count === 84, 'Readiness har feil method count');
  assert(readiness.current_inventory?.vitenskap?.mapping_count === 117, 'Readiness har feil mapping count');
  assert(readiness.current_inventory?.vitenskap?.hook_count === 64, 'Readiness har feil hook count');
  assert(readiness.current_inventory?.vitenskap?.registered_chapter_count === registrySubject?.chapters?.length, 'Readiness chapter count og registry er ikke aligned');
  assert(readiness.current_inventory.vitenskap.registered_chapter_count >= 1, 'Unit 1 må forbli registrert');
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
  const allowedStatuses = new Set(['strong', 'inventory_reconciled', 'chapter_materialized', 'neighbor_bridge_required', 'nested_strong']);
  for (const family of readiness.coverage_families) {
    assert(allowedStatuses.has(family.status), `Coverage ${family.id} har ukjent status ${family.status}`);
    assert(family.reason?.length >= 120, `Coverage ${family.id} mangler substansiell begrunnelse`);
  }
  const statusCounts = Object.fromEntries([...allowedStatuses].map((name) => [name, readiness.coverage_families.filter((row) => row.status === name).length]));
  assert(Array.isArray(readiness.blocking_gaps) && readiness.blocking_gaps.length === 0, 'Strukturelle blocking gaps skal være reconcilet');
  const editorialBlockers = readiness.editorial_blockers || [];
  assert(editorialBlockers.length <= BREADTH_FAMILIES.length, 'Readiness har for mange breadth editorial blockers');
  const expectedProgressGate = readiness.complete_ready ? 'maintenance_source_refresh_and_place_case_expansion' : editorialBlockers.length === 0 ? 'final_holistic_university_breadth_completion_audit' : 'remaining_chapter_production_across_reconciled_university_breadth';
  assert(readiness.next_gate === expectedProgressGate, 'Readiness next_gate matcher ikke breadth-fremdriften');
  assert(statusEntry.nextGate === expectedProgressGate, 'Subject status nextGate matcher ikke breadth-fremdriften');
  assert(editorialBlockers.every((id) => BREADTH_FAMILIES.includes(id)), 'Readiness har ukjent breadth editorial blocker');

  const materializedBreadthFamilies = [];
  for (const id of BREADTH_FAMILIES) {
    const family = readiness.coverage_families.find((row) => row.id === id);
    const specFamily = spec.families.find((row) => row.coverage_family_id === id);
    assert(family?.requires_canonical_inventory_change === false, `${id} krever fortsatt canonical inventory-endring`);
    assert(isDeepStrictEqual(sorted(family?.reconciled_emne_ids || []), sorted(specFamily.topics.map((row) => row.id))), `${id} har feil reconcilet emnesett`);
    assert(family?.reconciled_hook_id === specFamily.hook.id, `${id} har feil reconcilet hook`);
    if (editorialBlockers.includes(id)) {
      assert(family.status === 'inventory_reconciled', `${id} må være inventory_reconciled mens den blokkerer editorial completion`);
    } else {
      assert(family.status === 'chapter_materialized', `${id} kan bare fjernes som blocker etter materialisert kapittel`);
      assert(typeof family.materialized_chapter_id === 'string' && family.materialized_chapter_id.length > 0, `${id} mangler materialized_chapter_id`);
      const registered = registrySubject.chapters.find((row) => row.id === family.materialized_chapter_id);
      assert(registered, `${id} peker til et kapittel som ikke finnes i registry`);
      assert(fs.existsSync(abs(registered.file)), `${id} peker til manglende kapittelroot ${registered.file}`);
      materializedBreadthFamilies.push({ id, chapterId: family.materialized_chapter_id });
    }
  }
  assert(materializedBreadthFamilies.length + editorialBlockers.length === BREADTH_FAMILIES.length, 'Breadth progression har mistet en familie');

  assert(isDeepStrictEqual(sorted(readiness.neighbor_boundaries.map((row) => row.subject_id)), ['filosofi', 'natur', 'teknologi']), 'Vitenskap readiness har feil nabofaggrenser');
  const technologyBoundary = readiness.neighbor_boundaries.find((row) => row.subject_id === 'teknologi');
  assert(technologyBoundary?.relationship === 'nested_specialization', 'Teknologi må forbli nested_specialization');

  const firstUnit = readiness.first_production_unit;
  assert(firstUnit?.chapter_id === FIRST_UNIT_ID, 'Readiness har feil første produksjonsenhet');
  assert(firstUnit?.status === 'materialized_and_registered', 'Unit 1 er ikke materialisert og registrert');
  assert(isDeepStrictEqual(firstUnit?.emne_ids, FIRST_UNIT_EMNES), 'Unit 1 har feil emnesett');
  assert(chapter.chapter_id === FIRST_UNIT_ID && chapter.editorialStatus === 'chapter_ready', 'Unit 1-kapittelroot har feil state');
  assert(registrySubject?.chapters?.some((row) => row.id === FIRST_UNIT_ID), 'Registry må bevare Unit 1');
  assert(releaseSubject?.chapter_status === 'materialized', 'Vitenskap release må være materialized');
  assert(releaseSubject?.chapter_count === registrySubject.chapters.length, 'Release chapter count og registry er ikke aligned');
  assert(releaseSubject?.chapter_count === readiness.current_inventory.vitenskap.registered_chapter_count, 'Release chapter count og readiness er ikke aligned');
  assert(releaseSubject?.missing_chapter_files?.length === 0, 'Vitenskap release har manglende kapittelfiler');

  assert(readiness.quality_contract?.minimum_dimension_score === 4, 'Quality gate må fortsatt kreve minst 4/5 per dimensjon');
  assert(readiness.quality_contract?.minimum_total_score === 27, 'Quality gate må fortsatt kreve minst 27/30');
  assert(readiness.quality_contract?.article_or_chapter_requirements?.includes('no_generic_template_reuse'), 'Quality gate mangler vern mot generisk malgjenbruk');

  const report = {
    schema: 'history_go_fagverk_vitenskap_university_readiness_audit_v1',
    version: '1.4.0',
    status: readiness.status,
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
      editorialBlockerCount: editorialBlockers.length,
      materializedBreadthFamilyCount: materializedBreadthFamilies.length
    },
    structuralBlockingGaps: readiness.blocking_gaps,
    editorialBlockers,
    materializedBreadthFamilies,
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
      breadthProgressionMonotone: true,
      editorialBreadthBlockersExplicit: true,
      materializedBreadthChaptersRegistered: true,
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
    console.log(`Vitenskap readiness OK: ${report.inventory.vitenskap.emne_count} emner, ${report.registration.registryChapterCount} kapitler, ${report.coverageSummary.editorialBlockerCount} editorial blockers, completeReady=${report.subject.completeReady}`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
