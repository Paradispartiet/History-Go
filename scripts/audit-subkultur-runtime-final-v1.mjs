#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = 'reports/fagverk/subkultur-runtime-final-audit.json';
const PATHS = Object.freeze({
  runtime: 'data/fag/subkultur/subkultur_runtime_manifest.json',
  manifest: 'data/fag/fag_manifest.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  portal: 'data/fagverk/fagverk_portal.json',
  registry: 'data/fagverk/fagverk_registry.json',
  chapters: 'data/fagverk/subkultur/manifest.json',
  contract: 'data/fag/subkultur/subkultur_fagverk_contract_v1.json',
  quizManifest: 'data/quiz/manifest.json',
  knowledgeManifest: 'data/knowledge/knowledge_manifest.json'
});

const abs = (relative) => path.join(ROOT, relative);
const exists = (relative) => fs.existsSync(abs(relative));
const readJson = (relative) => JSON.parse(fs.readFileSync(abs(relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const cleanRoute = (value) => String(value ?? '').replace(/\{[^}]+\}/g, 'example').split('?')[0].split('#')[0];
function assert(condition, message) { if (!condition) throw new Error(message); }

export function buildSubkulturRuntimeFinalReport() {
  const runtime = readJson(PATHS.runtime);
  const manifest = readJson(PATHS.manifest);
  const inventory = readJson(PATHS.inventory);
  const status = readJson(PATHS.status);
  const portal = readJson(PATHS.portal);
  const registry = readJson(PATHS.registry);
  const chapterManifest = readJson(PATHS.chapters);
  const contract = readJson(PATHS.contract);
  const quizManifest = readJson(PATHS.quizManifest);
  const knowledgeManifest = readJson(PATHS.knowledgeManifest);
  const statusEntry = list(status.subjects).find((item) => item.id === 'subkultur');
  const portalEntry = list(portal.categories).find((item) => item.id === 'subkultur');
  const inventoryEntry = list(inventory.subjects).find((item) => item.id === 'subkultur');
  const registryEntry = registry.subjects?.subkultur;
  const chapters = list(registryEntry?.chapters);
  const sourceFiles = Object.values(runtime.sourceOfTruth || {});
  const routeFiles = Object.values(runtime.routes || {}).map(cleanRoute);
  const chapterFiles = chapters.flatMap((chapter) => [chapter.file, chapter.briefFile, ...list(chapter.moduleFiles)]).filter(Boolean);
  const emneBindings = chapters.flatMap((chapter) => list(chapter.emne_ids));
  const chapterDomainIds = chapters.map((chapter) => chapter.primary_domain_id);
  const runtimeDomainIds = Object.keys(runtime.chapterByDomain || {});
  const runtimeEmneIds = Object.keys(runtime.chapterByEmne || {});
  const subjectQuiz = list(quizManifest.subjectPackages).find((item) => item.subjectId === 'subkultur');
  const knowledgeRegistries = runtime.knowledgeRegistries || {};
  const knowledgeFiles = Object.values(knowledgeRegistries).map((relative) => `data/knowledge/${relative}`);

  const failures = [];
  const check = (condition, message) => { if (!condition) failures.push(message); };
  check(runtime.schema === 'history_go_subkultur_runtime_manifest_v1', 'runtime_schema');
  check(runtime.subjectId === 'subkultur', 'runtime_subject');
  check(sourceFiles.every(exists), 'runtime_source_files');
  check(routeFiles.every(exists), 'runtime_routes');
  check(chapterFiles.every(exists), 'chapter_files');
  check(knowledgeFiles.length === 4 && knowledgeFiles.every(exists), 'knowledge_registries');
  check(chapters.length === 8, 'chapter_count');
  check(new Set(chapterDomainIds).size === 8 && runtimeDomainIds.length === 8, 'domain_chapter_bijection');
  check(emneBindings.length === 80 && new Set(emneBindings).size === 80 && runtimeEmneIds.length === 80, 'emne_chapter_bijection');
  check(chapters.every((chapter) => chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true), 'chapter_readiness');
  check(chapters.every((chapter) => list(chapter.moduleFiles).length === 3), 'chapter_module_count');
  check(manifest.subkultur?.runtimeManifest === 'subkultur/subkultur_runtime_manifest.json', 'fag_manifest_runtime');
  check(list(inventoryEntry?.optionalManifestFields).includes('runtimeManifest'), 'inventory_runtime_field');
  check(portalEntry?.subjectStatus === 'materialized' && portalEntry?.subjectPage === 'fagverk.html?subject=subkultur', 'portal_materialized');
  check(statusEntry?.navigationStatus === 'materialized', 'status_navigation');
  check(statusEntry?.assessmentStatus === 'audited', 'status_assessment');
  check(statusEntry?.editorialStatus === 'complete', 'status_editorial');
  check(statusEntry?.nextGate === 'maintenance_and_source_refresh', 'status_next_gate');
  check(registryEntry?.canonicalModel?.runtimeManifest === PATHS.runtime, 'registry_runtime');
  check(chapterManifest.status === 'complete_runtime_materialized', 'chapter_manifest_status');
  check(chapterManifest.next_gate === 'maintenance_and_source_refresh', 'chapter_manifest_next_gate');
  check(subjectQuiz?.status === 'active' && subjectQuiz?.file === 'data/quiz/subkultur/subkultur_subject_pathways_v1.json', 'assessment_runtime');
  check(!list(quizManifest.files).includes('data/quiz/quiz_subkultur.json'), 'legacy_quiz_in_runtime');
  check(knowledgeManifest.runtime?.subjectCanonicalRegistries?.subkultur != null, 'knowledge_manifest_runtime');
  check(contract.completion_gate?.required_navigation_status === statusEntry?.navigationStatus, 'contract_navigation');
  check(contract.completion_gate?.required_assessment_status === statusEntry?.assessmentStatus, 'contract_assessment');
  check(contract.completion_gate?.required_editorial_status === statusEntry?.editorialStatus, 'contract_editorial');
  check(contract.completion_gate?.required_next_gate === statusEntry?.nextGate, 'contract_next_gate');

  const expectedSummary = {
    domainCount: 8,
    hookCount: 80,
    emneCount: 80,
    methodCount: 43,
    mappingCount: 80,
    theoryObjectCount: 80,
    chapterCount: 8,
    validatedCaseCount: 42,
    rejectedCaseCount: 8,
    pathwayCount: 8,
    assessmentQuestionCount: 40,
    knowledgeUnitCount: 79,
    legacyQuestionAuditCount: 83,
    activeLegacyQuestionCount: 0
  };
  check(JSON.stringify(runtime.canonicalSummary) === JSON.stringify(expectedSummary), 'canonical_summary');

  return {
    schema: 'history_go_subkultur_runtime_final_audit_v1',
    version: '1.0.0',
    subject_id: 'subkultur',
    audited_at: '2026-08-25',
    status: failures.length ? 'FAIL' : 'COMPLETE',
    summary: expectedSummary,
    runtime: {
      manifest: PATHS.runtime,
      source_files: sourceFiles.length,
      route_files: routeFiles.length,
      chapter_files: chapterFiles.length,
      knowledge_registries: knowledgeFiles.length
    },
    completion: {
      navigationStatus: statusEntry?.navigationStatus,
      assessmentStatus: statusEntry?.assessmentStatus,
      editorialStatus: statusEntry?.editorialStatus,
      nextGate: statusEntry?.nextGate
    },
    failures
  };
}

export function auditSubkulturRuntimeFinal({ writeReport = false, checkReport = true } = {}) {
  assert(exists(PATHS.runtime), 'Runtime-manifestet mangler');
  const report = buildSubkulturRuntimeFinalReport();
  assert(report.failures.length === 0, report.failures.join(', '));
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(REPORT)), { recursive: true });
    fs.writeFileSync(abs(REPORT), serialized, 'utf8');
  }
  if (checkReport) {
    assert(exists(REPORT), `${REPORT} mangler. Kjør --write-report`);
    assert(fs.readFileSync(abs(REPORT), 'utf8') === serialized, `${REPORT} er utdatert`);
  }
  return report;
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditSubkulturRuntimeFinal({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--no-check-report') || args.has('--check-report')
    });
    console.log(`Subkultur sluttport OK: ${report.summary.domainCount} fagområder, ${report.summary.emneCount} emner, ${report.summary.chapterCount} kapitler, ${report.summary.validatedCaseCount} cases og ${report.summary.assessmentQuestionCount} spørsmål; status ${report.status}.`);
  } catch (error) {
    console.error(`Subkultur sluttport FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
