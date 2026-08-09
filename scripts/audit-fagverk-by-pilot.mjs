#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  core: 'js/fagverk-subject-core.js',
  categories: 'data/categories/category_contract.json',
  manifest: 'data/fag/fag_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  badge: 'data/badges/by.json',
  report: 'reports/fagverk/by-pilot-audit.json'
});
const DOMAIN_ORDER = [
  'byliv',
  'arkitektur',
  'bolig_og_nabolag',
  'administrasjon_og_plan',
  'urbanisme',
  'arbeid_og_naering',
  'historiske_lag',
  'makt_og_konflikt',
  'klima_og_helse',
  'data_og_styring',
  'regional_og_global',
  'boligpolitikk_og_velferd'
];
const abs = (relativePath) => path.join(ROOT, relativePath);
const read = (relativePath) => fs.readFileSync(abs(relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function loadCore() {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read(P.core), sandbox, { filename: P.core });
  assert(sandbox.HGFagverkSubjectCore, 'Fagverk-core ble ikke eksponert');
  return sandbox.HGFagverkSubjectCore;
}

function countBy(rows, field) {
  return Object.fromEntries([...new Set(rows.map((row) => row[field]))].sort().map((value) => [value, rows.filter((row) => row[field] === value).length]));
}

function committedProjection(report) {
  return {
    schema: report.schema,
    version: report.version,
    status: report.status,
    generatedFrom: report.generatedFrom,
    subject: report.subject,
    summary: report.summary,
    canonicalDomainOrder: report.canonicalDomainOrder,
    primaryDomainEmneCounts: report.primaryDomainEmneCounts,
    emneStatusCounts: report.emneStatusCounts,
    gates: report.gates
  };
}

export function auditByPilot({ writeReport = false, checkReport = true } = {}) {
  const CORE = loadCore();
  const categories = json(P.categories);
  const manifest = json(P.manifest);
  const portal = json(P.portal);
  const inventory = json(P.inventory);
  const status = json(P.status);
  const registry = json(P.registry);
  const badge = json(P.badge);
  const portalEntry = portal.categories.find((row) => row.id === 'by');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'by');
  const statusEntry = status.subjects.find((row) => row.id === 'by');
  const manifestEntry = manifest.by;

  assert(categories.fagSubjects.includes('by'), 'By mangler i canonical fagliste');
  assert(portalEntry?.subjectStatus === 'materialized', 'By er ikke materialisert i portalen');
  assert(portalEntry?.subjectPage === 'fagverk.html?subject=by', 'By har feil canonical fagsiderute');
  assert(inventoryEntry?.schemaFamily === 'by_compatibility', 'By har feil schemafamilie');
  assert(inventoryEntry?.pilot === true, 'By er ikke registrert som fase-2-pilot');
  assert(statusEntry?.assessmentStatus === 'audited', 'By har feil auditstatus');
  assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'By skal stå chapters_in_progress etter første redigerte kapittel');
  assert(statusEntry?.nextGate === 'chapter_production', 'By har feil neste port');
  assert(registry.placePage?.fallbackSubjectByCategory?.by === 'by', 'By-steder faller fortsatt tilbake til Politikk-faget');

  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const relativePath = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(abs(relativePath)), `By mangler ${field}: ${relativePath}`);
    source[field === 'emner' ? 'emners' : field] = json(relativePath);
  }
  const curriculumPath = CORE.resolveManifestPointer(manifestEntry.curriculumArchitecture);
  const qualityContractPath = CORE.resolveManifestPointer(manifestEntry.qualityContract);
  assert(fs.existsSync(abs(curriculumPath)), `By mangler curriculum-arkitektur: ${curriculumPath}`);
  assert(fs.existsSync(abs(qualityContractPath)), `By mangler kvalitetskontrakt: ${qualityContractPath}`);
  const curriculum = json(curriculumPath);
  const qualityContract = json(qualityContractPath);

  const model = CORE.normalizeSubject({
    subjectId: 'by',
    categoryLabel: categories.labels.by,
    categoryDescription: categories.decisions?.by,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge,
    source: { ...source, curriculum }
  });

  assert(model.subject.title === 'By & arkitektur', 'By har feil fagtittel');
  assert(model.subject.description.length >= 160, 'By mangler en eksplisitt fagbeskrivelse');
  assert(model.subject.adapter === 'by', 'By-pakken går ikke gjennom compatibility-adapteren');
  assert(model.subject.routes.badge === portalEntry.badgePage, 'By-merkesiden løses ikke gjennom portalen');
  assert(model.subject.routes.badge !== model.subject.routes.subject, 'Merke- og fagside kan ikke være samme mål');
  assert(isDeepStrictEqual([...model.domains].map((domain) => domain.id), DOMAIN_ORDER), 'By har feil canonical fagområderekkefølge');
  assert(model.domains.every((domain) => domain.sourceKind === 'fagkart_category'), 'By-adapteren opprettet kunstige compatibility-fagområder');
  assert(model.summary.domainCount === 12, 'By skal ha tolv canonicale fagområder');
  assert(model.summary.emneCount === 82, 'By skal bevare 82 source-definerte emner');
  assert(model.summary.methodCount === 14, 'By skal ha fjorten canonicale metoder');
  assert(model.summary.mappingCount === 82, 'By skal ha én normalisert primærmapping per emne');
  assert(model.summary.hookCount === 81, 'By skal ha 81 canonicale hooks');
  assert(model.chapters.length === 2 && model.chapters.some((chapter) => chapter.id === 'byliv-offentlige-rom') && model.chapters.some((chapter) => chapter.id === 'byliv-sosial-offentlighet'), 'By skal registrere begge Byliv-kapitlene i Fase 4');
  assert(source.pensum.modules.length === 7, 'By skal bevare sju pensummoduler som progresjonslag');
  assert(curriculum.modules.length === 8, 'By skal bevare åtte curriculum-moduler som progresjonslag');
  assert(qualityContract.status === 'canonical', 'By-kvalitetskontrakten er ikke canonical');

  const emneIds = new Set(source.emners.map((emne) => emne.emne_id));
  assert(emneIds.size === source.emners.length, 'By har dupliserte emne-ID-er');
  const hooks = source.fagkart.categories.flatMap((domain) => domain.topic_hooks || []);
  const hookedEmneIds = new Set(hooks.flatMap((hook) => hook.emne_ids || []));
  assert(hookedEmneIds.size === emneIds.size, 'By-fagkartet dekker ikke alle source-definerte emner');
  assert([...hookedEmneIds].every((id) => emneIds.has(id)), 'By-fagkartet peker til ukjent emne');
  assert(source.emners.filter((emne) => emne.status === 'active').every((emne) => hookedEmneIds.has(emne.emne_id)), 'By har aktivt emne uten fagkartkobling');

  const methodIds = new Set(source.methods.methods.map((method) => method.method_id));
  assert(methodIds.size === source.methods.methods.length, 'By har dupliserte metode-ID-er');
  assert(source.methods.methods.every((method) => method.canonical_status === 'canonical'), 'By har ikke-canonical metode i aktiv metodekatalog');
  assert(hooks.flatMap((hook) => hook.recommended_method_ids || []).every((id) => methodIds.has(id)), 'By-hook peker til ukjent metode');
  assert(source.methods.methods.every((method) => method.procedure?.length && method.minimum_data_requirements?.length && method.limitations?.length && method.ethics?.length && method.expected_outputs?.length), 'By-metode mangler prosedyre, datakrav, begrensning, etikk eller forventet resultat');
  assert(model.emners.every((emne) => model.domainsById.has(emne.domainId)), 'By har emne uten normalisert fagområde');
  assert(model.emners.every((emne) => emne.methodIds.every((id) => model.methodsById.has(id))), 'By har emne med ukjent metode-ID');

  const progressionRefs = [
    ...source.pensum.modules.flatMap((module) => module.emner || []),
    ...curriculum.modules.flatMap((module) => module.core_emne_ids || [])
  ];
  assert(progressionRefs.every((id) => emneIds.has(id)), 'By-progresjonen peker til ukjent emne');

  const primaryDomainEmneCounts = Object.fromEntries(DOMAIN_ORDER.map((id) => [id, model.emners.filter((emne) => emne.domainId === id).length]));
  const emneStatusCounts = countBy(source.emners, 'status');
  assert(isDeepStrictEqual(emneStatusCounts, { active: 74, core: 4, planned: 4 }), 'By har uventet emnestatusfordeling');

  const report = {
    schema: 'history_go_fagverk_by_pilot_audit_v1',
    version: '1.0.0',
    status: 'by_compatibility_pilot_chapters_in_progress',
    generatedFrom: { ...P, curriculum: curriculumPath, qualityContract: qualityContractPath },
    subject: {
      id: model.subject.id,
      title: model.subject.title,
      schemaFamily: model.subject.schemaFamily,
      adapter: model.subject.adapter,
      navigationStatus: model.subject.status.navigation,
      assessmentStatus: model.subject.status.assessment,
      editorialStatus: model.subject.status.editorial,
      nextGate: statusEntry.nextGate,
      subjectPage: model.subject.routes.subject,
      badgePage: model.subject.routes.badge
    },
    summary: {
      domainCount: model.summary.domainCount,
      emneCount: model.summary.emneCount,
      activeEmneCount: emneStatusCounts.active,
      methodCount: model.summary.methodCount,
      mappingCount: model.summary.mappingCount,
      hookCount: model.summary.hookCount,
      courseModuleCount: source.pensum.modules.length,
      curriculumModuleCount: curriculum.modules.length,
      registeredChapterCount: model.chapters.length
    },
    canonicalDomainOrder: DOMAIN_ORDER,
    primaryDomainEmneCounts,
    emneStatusCounts,
    gates: {
      manifestFirstSourcesResolved: true,
      byCompatibilityAdapterExercised: true,
      fagkartOwnsRendererDomains: true,
      noSyntheticCompatibilityDomains: true,
      allSourceEmnersMapped: true,
      allActiveEmnersMapped: true,
      allMethodReferencesResolved: true,
      courseAndCurriculumModulesRemainProgressionOnly: true,
      qualityContractResolved: true,
      byPlaceFallbackCorrected: true,
      badgeAndSubjectRoutesDistinct: true,
      assessmentStatusAudited: true,
      editorialStatusChaptersInProgress: true,
      chapterProductionStartedWithoutCompletenessOverclaim: true
    }
  };
  const committed = committedProjection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committed, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), committed), `${P.report} er utdatert`);
  return { report, model };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditByPilot({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`By-pilot OK: ${report.summary.domainCount} fagområder, ${report.summary.emneCount} emner, ${report.summary.methodCount} metoder og ${report.summary.hookCount} hooks.`);
  } catch (error) {
    console.error(`By-pilot FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
