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
  badge: 'data/badges/scenekunst.json',
  badgePage: 'data/fag/scenekunst/merke_scenekunst.html',
  report: 'reports/fagverk/scenekunst-phase3-audit.json'
});
const DOMAIN_ORDER = [
  'institusjon_repertoar',
  'verk_utover_form',
  'dans_hybrid_humor',
  'publikum_offentlighet'
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

function committedProjection(report) {
  return {
    schema: report.schema,
    version: report.version,
    status: report.status,
    generatedFrom: report.generatedFrom,
    subject: report.subject,
    summary: report.summary,
    canonicalDomainOrder: report.canonicalDomainOrder,
    domainEmneCounts: report.domainEmneCounts,
    gates: report.gates
  };
}

export function auditScenekunstPhase3({ writeReport = false, checkReport = true } = {}) {
  const CORE = loadCore();
  const categories = json(P.categories);
  const manifest = json(P.manifest);
  const portal = json(P.portal);
  const inventory = json(P.inventory);
  const status = json(P.status);
  const registry = json(P.registry);
  const badge = json(P.badge);
  const portalEntry = portal.categories.find((row) => row.id === 'scenekunst');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'scenekunst');
  const statusEntry = status.subjects.find((row) => row.id === 'scenekunst');
  const manifestEntry = manifest.scenekunst;

  assert(categories.fagSubjects.includes('scenekunst'), 'Scenekunst mangler i canonical fagliste');
  assert(categories.aliases?.teater === 'scenekunst', 'Teater-aliaset peker ikke til Scenekunst');
  assert(portalEntry?.subjectStatus === 'materialized', 'Scenekunst er ikke materialisert i portalen');
  assert(portalEntry?.subjectPage === 'fagverk.html?subject=scenekunst', 'Scenekunst har feil canonical fagsiderute');
  assert(inventoryEntry?.schemaFamily === 'foundation_v1', 'Scenekunst har feil schemafamilie');
  assert(inventoryEntry?.pilot === false, 'Scenekunst skal være et individuelt Fase 3-fag, ikke pilot');
  assert(statusEntry?.assessmentStatus === 'audited', 'Scenekunst har feil auditstatus');
  assert(statusEntry?.editorialStatus === 'structure_ready', 'Scenekunst må stå structure_ready før kapittelproduksjon');
  assert(statusEntry?.nextGate === 'chapter_production', 'Scenekunst har feil neste port');
  assert(registry.placePage?.fallbackSubjectByCategory?.scenekunst === 'scenekunst', 'Scenekunst-steder mangler Scenekunst som fagverksfallback');

  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const relativePath = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(abs(relativePath)), `Scenekunst mangler ${field}: ${relativePath}`);
    source[field === 'emner' ? 'emners' : field] = json(relativePath);
  }

  const model = CORE.normalizeSubject({
    subjectId: 'scenekunst',
    categoryLabel: categories.labels.scenekunst,
    categoryDescription: categories.decisions?.scenekunst,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge,
    source
  });

  assert(model.subject.title === 'Scenekunst', 'Scenekunst har feil fagtittel');
  assert(model.subject.description.length >= 160, 'Scenekunst mangler eksplisitt fagbeskrivelse');
  assert(model.subject.adapter === 'standard', 'Foundation-pakken skal gå gjennom standardadapteren');
  assert(model.subject.routes.badge === portalEntry.badgePage, 'Scenekunst-merkesiden løses ikke gjennom portalen');
  assert(model.subject.routes.badge !== model.subject.routes.subject, 'Merke- og fagside kan ikke være samme mål');
  assert(isDeepStrictEqual([...model.domains].map((domain) => domain.id), DOMAIN_ORDER), 'Scenekunst har feil source-definert fagområderekkefølge');
  assert(model.summary.domainCount === 4, 'Scenekunst skal ha fire fagområder');
  assert(model.summary.emneCount === 8, 'Scenekunst skal ha åtte aktive emner');
  assert(model.summary.methodCount === 9, 'Scenekunst skal ha ni canonicale metoder');
  assert(model.summary.mappingCount === 8, 'Scenekunst skal ha én mapping per emne');
  assert(model.summary.hookCount === 0, 'Scenekunst foundation v1 har ikke canonicale hooks');
  assert(model.chapters.length === 0, 'Structure-ready kan ikke late som Scenekunst-kapitler finnes');
  assert(model.domains.every((domain) => domain.sourceKind === 'fagkart_category'), 'Pensummoduler ble feilaktig renderer-fagområder');
  assert(source.pensum.modules.length === 3, 'Scenekunst skal bevare tre pensummoduler som progresjonslag');
  assert(source.emners.every((emne) => emne.status === 'active'), 'Scenekunst har inaktive emner i den materialiserte pakken');
  assert(source.methods.methods.every((method) => method.canonical_status === 'canonical'), 'Scenekunst har ikke-canonical metode i aktiv pakke');
  assert(model.emners.every((emne) => emne.methodIds.length === 2), 'Alle Scenekunst-emner skal ha to løste metodekoblinger');
  assert(model.emners.every((emne) => model.domainsById.has(emne.domainId)), 'Scenekunst har emne uten fagområde');
  assert(model.emners.every((emne) => emne.methodIds.every((id) => model.methodsById.has(id))), 'Scenekunst har emne med ukjent metode');

  const sourceEmneIds = new Set(source.emners.map((row) => row.emne_id));
  const fagkartEmneIds = new Set(source.fagkart.categories.flatMap((domain) => domain.emne_ids || []));
  const courseEmneIds = new Set(source.pensum.modules.flatMap((module) => module.emner || []));
  assert(sourceEmneIds.size === 8, 'Scenekunst har dupliserte eller manglende canonicale emner');
  assert(fagkartEmneIds.size === sourceEmneIds.size && [...sourceEmneIds].every((id) => fagkartEmneIds.has(id)), 'Fagkartet dekker ikke alle Scenekunst-emner');
  assert(courseEmneIds.size === sourceEmneIds.size && [...sourceEmneIds].every((id) => courseEmneIds.has(id)), 'Pensummodulene dekker ikke alle Scenekunst-emner');

  const principles = source.fagkart.principles || {};
  for (const key of ['source_first', 'forestilling_or_institution_anchor_required', 'live_performance_is_primary', 'cross_domain_links_use_secondary_badges']) {
    assert(principles[key] === true, `Scenekunst mangler bindende prinsipp: ${key}`);
  }

  const badgePage = read(P.badgePage);
  assert(badgePage.includes('../../../fagverk.html?subject=scenekunst'), 'Scenekunst-merkesiden mangler separat fagsidelenke');
  assert(badgePage.includes('../../../fagverk-forside.html'), 'Scenekunst-merkesiden mangler Fagverk-forsiden');

  const report = {
    schema: 'history_go_fagverk_scenekunst_phase3_audit_v1',
    version: '1.0.0',
    status: 'scenekunst_phase_3_structure_ready',
    generatedFrom: P,
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
      methodCount: model.summary.methodCount,
      mappingCount: model.summary.mappingCount,
      hookCount: model.summary.hookCount,
      courseModuleCount: source.pensum.modules.length,
      registeredChapterCount: model.chapters.length
    },
    canonicalDomainOrder: DOMAIN_ORDER,
    domainEmneCounts: Object.fromEntries(model.domains.map((domain) => [domain.id, domain.emneIds.length])),
    gates: {
      manifestFirstSourcesResolved: true,
      foundationAdapterExercised: true,
      fagkartOwnsRendererDomains: true,
      courseModulesRemainProgressionOnly: true,
      allActiveEmnersMapped: true,
      allCourseModulesCoverCanonicalEmners: true,
      allMethodReferencesResolved: true,
      livePerformancePrinciplesLocked: true,
      badgeAndSubjectRoutesDistinct: true,
      assessmentStatusAudited: true,
      editorialStatusStructureReady: true,
      chapterClaimsNotOverstated: true
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
    const { report } = auditScenekunstPhase3({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Scenekunst Fase 3 OK: ${report.summary.domainCount} fagområder, ${report.summary.emneCount} emner og ${report.summary.methodCount} metoder.`);
  } catch (error) {
    console.error(`Scenekunst Fase 3 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
