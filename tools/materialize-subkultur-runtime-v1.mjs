#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
if (!WRITE && !CHECK) throw new Error('Bruk --write eller --check');

const UPDATED_AT = '2026-08-04';
const PATHS = Object.freeze({
  runtime: 'data/fag/subkultur/subkultur_runtime_manifest.json',
  badge: 'data/badges/subkultur.json',
  pensum: 'data/fag/subkultur/subkulturpensum_canonical_v4_5.json',
  fagkart: 'data/fag/subkultur/fagkart_subkultur_canonical_v4_5.json',
  emner: 'data/fag/subkultur/emner_subkultur_canonical_v4_5.json',
  methods: 'data/fag/subkultur/methods_subkultur_canonical_v4_5.json',
  mapping: 'data/fag/subkultur/emnemapping_subkultur_canonical_v4_5.json',
  contract: 'data/fag/subkultur/subkultur_fagverk_contract_v1.json',
  theory: 'data/fag/subkultur/theory_objects_subkultur_canonical_v1.json',
  evidence: 'data/fag/subkultur/theory_evidence_subkultur_canonical_v1.json',
  claims: 'data/fag/subkultur/claims_subkultur_canonical_v1.json',
  sources: 'data/fag/subkultur/sources_subkultur_canonical_v1.json',
  caseValidation: 'data/fag/subkultur/case_validation_subkultur_v1.json',
  caseProfile: 'data/fag/profiles/subkultur/manifest.json',
  pathways: 'data/quiz/subkultur/subkultur_subject_pathways_v1.json',
  legacyAudit: 'data/quiz/subkultur/subkultur_legacy_quiz_audit_v1.json',
  knowledgeManifest: 'data/knowledge/knowledge_manifest.json',
  chapterManifest: 'data/fagverk/subkultur/manifest.json',
  fagManifest: 'data/fag/fag_manifest.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  portal: 'data/fagverk/fagverk_portal.json',
  registry: 'data/fagverk/fagverk_registry.json'
});

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const list = (value) => Array.isArray(value) ? value : [];
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const changed = [];

function expected(relative, value) {
  const next = jsonText(value);
  let current = '';
  try { current = fs.readFileSync(path.join(ROOT, relative), 'utf8'); } catch {}
  if (current === next) return;
  changed.push(relative);
  if (WRITE) {
    fs.mkdirSync(path.dirname(path.join(ROOT, relative)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, relative), next, 'utf8');
  }
}

const pensum = readJson(PATHS.pensum);
const fagkart = readJson(PATHS.fagkart);
const emner = readJson(PATHS.emner);
const methods = list(readJson(PATHS.methods).methods);
const mapping = readJson(PATHS.mapping);
const chapterManifest = readJson(PATHS.chapterManifest);
const caseValidation = readJson(PATHS.caseValidation);
const pathways = readJson(PATHS.pathways);
const legacyAudit = readJson(PATHS.legacyAudit);
const knowledgeManifest = readJson(PATHS.knowledgeManifest);

const chapters = list(chapterManifest.chapters).map((entry) => {
  const chapter = readJson(entry.file);
  const brief = readJson(entry.brief);
  return {
    id: entry.id,
    title: entry.title,
    subtitle: chapter.subtitle,
    file: entry.file,
    primary_domain_id: entry.primary_domain_id,
    emne_ids: list(entry.emne_ids),
    method_ids: list(brief.requiredMethodIds),
    moduleFiles: list(chapter.moduleFiles),
    briefFile: entry.brief,
    editorialStatus: 'chapter_ready',
    claimTraceRequired: true
  };
});

const chapterByDomain = Object.fromEntries(chapters.map((chapter) => [chapter.primary_domain_id, chapter.id]));
const chapterByEmne = Object.fromEntries(chapters.flatMap((chapter) => chapter.emne_ids.map((id) => [id, chapter.id])));
const pathwayQuestions = list(pathways.sets).flatMap((set) => list(set.questions));
const knowledgeRegistry = knowledgeManifest.runtime?.subjectCanonicalRegistries?.subkultur;
if (!knowledgeRegistry?.knowledge_units) throw new Error('Knowledge-manifestet mangler Subkultur units-register');
const knowledgeUnitCount = list(readJson(`data/knowledge/${knowledgeRegistry.knowledge_units}`).units).length;

const runtime = {
  schema: 'history_go_subkultur_runtime_manifest_v1',
  version: '1.0.0',
  updatedAt: UPDATED_AT,
  subjectId: 'subkultur',
  displayName: 'Subkultur',
  sourceOfTruth: {
    badge: PATHS.badge,
    pensum: PATHS.pensum,
    fagkart: PATHS.fagkart,
    emner: PATHS.emner,
    methods: PATHS.methods,
    emnemapping: PATHS.mapping,
    contract: PATHS.contract,
    theoryObjects: PATHS.theory,
    theoryEvidence: PATHS.evidence,
    claims: PATHS.claims,
    sources: PATHS.sources,
    caseValidation: PATHS.caseValidation,
    caseProfile: PATHS.caseProfile,
    assessment: PATHS.pathways,
    legacyAssessmentAudit: PATHS.legacyAudit,
    knowledgeManifest: PATHS.knowledgeManifest,
    fagverkRegistry: PATHS.registry
  },
  routes: {
    subjectHome: 'data/fag/subkultur/merke_subkultur.html',
    textbook: 'fagverk.html?subject=subkultur',
    progress: 'emner.html',
    placePage: 'fagverk-sted.html?place={placeId}'
  },
  canonicalSummary: {
    domainCount: list(fagkart.categories).length,
    hookCount: list(fagkart.categories).flatMap((domain) => list(domain.topic_hooks)).length,
    emneCount: emner.length,
    methodCount: methods.length,
    mappingCount: mapping.length,
    theoryObjectCount: readJson(PATHS.theory).length,
    chapterCount: chapters.length,
    validatedCaseCount: caseValidation.totals.validated_cases,
    rejectedCaseCount: caseValidation.totals.rejected_cases,
    pathwayCount: list(pathways.sets).length,
    assessmentQuestionCount: pathwayQuestions.length,
    knowledgeUnitCount,
    legacyQuestionAuditCount: legacyAudit.summary.reviewed,
    activeLegacyQuestionCount: legacyAudit.summary.retained_active
  },
  chapterByDomain,
  chapterByEmne,
  chapterProductionOrder: list(pensum.domain_order),
  knowledgeRegistries: knowledgeRegistry,
  completion: {
    navigationStatus: 'materialized',
    assessmentStatus: 'audited',
    editorialStatus: 'complete',
    nextGate: 'maintenance_and_source_refresh',
    evidenceBoundary: 'Teori forklarer begreper og mekanismer; konkrete steder og mennesker krever selvstendig caseevidens.'
  }
};
expected(PATHS.runtime, runtime);

const fagManifest = readJson(PATHS.fagManifest);
fagManifest.subkultur.runtimeManifest = 'subkultur/subkultur_runtime_manifest.json';
expected(PATHS.fagManifest, fagManifest);

const inventory = readJson(PATHS.inventory);
const inventoryEntry = list(inventory.subjects).find((item) => item.id === 'subkultur');
if (!inventoryEntry) throw new Error('subject_inventory mangler subkultur');
inventoryEntry.optionalManifestFields = [...new Set([...list(inventoryEntry.optionalManifestFields), 'runtimeManifest'])];
inventory.version = '1.5.0';
inventory.updatedAt = UPDATED_AT;
expected(PATHS.inventory, inventory);

const status = readJson(PATHS.status);
const statusEntry = list(status.subjects).find((item) => item.id === 'subkultur');
if (!statusEntry) throw new Error('subject_status mangler subkultur');
Object.assign(statusEntry, {
  navigationStatus: 'materialized',
  assessmentStatus: 'audited',
  editorialStatus: 'complete',
  nextGate: 'maintenance_and_source_refresh',
  note: 'Åtte canonicale fagområder og kapitler, 80 emner og teoriobjekter, 42 validerte cases, 8 pathways og 40 kildebelagte vurderingsspørsmål.'
});
expected(PATHS.status, status);

const portal = readJson(PATHS.portal);
const portalEntry = list(portal.categories).find((item) => item.id === 'subkultur');
if (!portalEntry) throw new Error('fagverk_portal mangler subkultur');
portalEntry.subjectPage = 'fagverk.html?subject=subkultur';
portalEntry.subjectStatus = 'materialized';
expected(PATHS.portal, portal);

const registry = readJson(PATHS.registry);
registry.subjects.subkultur = {
  title: 'Subkultur',
  description: 'Et sammenhengende læreverk om subkulturelle miljøer, scener, stil, rom, motstand, medier, omsorg, kontroll, kommersialisering og minne.',
  canonicalModel: {
    runtimeManifest: PATHS.runtime,
    sourceOfTruth: true,
    note: 'Canonical Subkulturdata eier emner, fagområder, metoder, teori og evidens. Registryet eier åtte redigerte lærekapitler; stedspåstander krever separat validert caseevidens.'
  },
  chapters
};
registry.version ||= '2.19.0';
registry.updatedAt ||= UPDATED_AT;
expected(PATHS.registry, registry);

chapterManifest.status = 'complete_runtime_materialized';
chapterManifest.next_gate = 'maintenance_and_source_refresh';
chapterManifest.runtime = {
  manifest: PATHS.runtime,
  registry: PATHS.registry,
  portal: PATHS.portal,
  navigation_status: 'materialized',
  assessment_status: 'audited',
  editorial_status: 'complete'
};
expected(PATHS.chapterManifest, chapterManifest);

if (CHECK && changed.length) {
  console.error('Subkultur-runtime er utdatert:');
  changed.forEach((file) => console.error(`- ${file}`));
  process.exitCode = 1;
} else {
  console.log(`Subkultur-runtime ${WRITE ? 'skrevet' : 'OK'}: ${chapters.length} kapitler, ${emner.length} emner, ${caseValidation.totals.validated_cases} validerte cases og ${pathwayQuestions.length} spørsmål; ${changed.length} avvik.`);
}
