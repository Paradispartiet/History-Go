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
  badge: 'data/badges/religion.json',
  report: 'reports/fagverk/religion-pilot-audit.json'
});
const DOMAIN_ORDER = ['hellige_rom', 'praksis_ritual', 'tradisjoner_historie', 'religion_samfunn'];
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

export function auditReligionPilot({ writeReport = false, checkReport = true } = {}) {
  const CORE = loadCore();
  const categories = json(P.categories);
  const manifest = json(P.manifest);
  const portal = json(P.portal);
  const inventory = json(P.inventory);
  const status = json(P.status);
  const registry = json(P.registry);
  const badge = json(P.badge);
  const portalEntry = portal.categories.find((row) => row.id === 'religion');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'religion');
  const statusEntry = status.subjects.find((row) => row.id === 'religion');
  const manifestEntry = manifest.religion;

  assert(categories.fagSubjects.includes('religion'), 'Religion mangler i canonical fagliste');
  assert(portalEntry?.subjectStatus === 'materialized', 'Religion er ikke materialisert i portalen');
  assert(portalEntry?.subjectPage === 'fagverk.html?subject=religion', 'Religion har feil canonical fagsiderute');
  assert(inventoryEntry?.schemaFamily === 'foundation_v1', 'Religion har feil schemafamilie');
  assert(inventoryEntry?.pilot === true, 'Religion er ikke registrert som fase-2-pilot');
  assert(statusEntry?.assessmentStatus === 'audited', 'Religion har feil auditstatus');
  assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'Religion skal stå chapters_in_progress etter første universitetsområde');
  assert(statusEntry?.nextGate === 'remaining_religion_area_article_production', 'Religion har feil neste port');

  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const relativePath = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(abs(relativePath)), `Religion mangler ${field}: ${relativePath}`);
    source[field === 'emner' ? 'emners' : field] = json(relativePath);
  }

  const model = CORE.normalizeSubject({
    subjectId: 'religion',
    categoryLabel: categories.labels.religion,
    categoryDescription: categories.decisions?.religion,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge,
    source
  });

  assert(model.subject.title === 'Religion', 'Religion har feil fagtittel');
  assert(model.subject.description.length >= 120, 'Religion mangler en eksplisitt fagbeskrivelse');
  assert(model.subject.adapter === 'standard', 'Foundation-pakken skal gå gjennom standardadapteren');
  assert(model.subject.routes.badge === portalEntry.badgePage, 'Religion-merkesiden løses ikke gjennom portalen');
  assert(model.subject.routes.badge !== model.subject.routes.subject, 'Merke- og fagside kan ikke være samme mål');
  assert(isDeepStrictEqual([...model.domains].map((domain) => domain.id), DOMAIN_ORDER), 'Religion har feil source-definert fagområderekkefølge');
  assert(model.summary.domainCount === 4, 'Religion skal ha fire fagområder');
  assert(model.summary.emneCount === 8, 'Religion skal ha åtte aktive emner');
  assert(model.summary.methodCount === 16, 'Religion skal ha åtte foundation-metoder og åtte materialiserte universitetsmetoder');
  assert(model.summary.mappingCount === 8, 'Religion skal ha én mapping per emne');
  assert(model.summary.hookCount === 0, 'Religion foundation v1 har ikke canonicale hooks');
  assert(model.chapters.length === 0, 'Structure-ready kan ikke late som Religion-kapitler finnes');
  assert(model.domains.every((domain) => domain.sourceKind === 'fagkart_category'), 'Kursmoduler ble feilaktig renderer-fagområder');
  assert(source.pensum.modules.length === 3, 'Religion skal bevare tre pensummoduler som progresjonslag');
  assert(source.emners.every((emne) => emne.status === 'active'), 'Religion har inaktive emner i den materialiserte piloten');
  assert(source.methods.methods.every((method) => method.canonical_status === 'canonical'), 'Religion har ikke-canonical metode i aktiv pakke');
  assert(model.emners.every((emne) => emne.methodIds.length === 2), 'Alle Religion-emner skal ha to løste metodekoblinger');
  assert(model.emners.every((emne) => model.domainsById.has(emne.domainId)), 'Religion har emne uten fagområde');
  assert(model.emners.every((emne) => emne.methodIds.every((id) => model.methodsById.has(id))), 'Religion har emne med ukjent metode');

  const principles = source.fagkart.principles || {};
  for (const key of ['source_first', 'respectful_representation', 'no_name_based_classification', 'present_primary_function_controls_place_category']) {
    assert(principles[key] === true, `Religion mangler bindende representasjonsprinsipp: ${key}`);
  }

  const report = {
    schema: 'history_go_fagverk_religion_pilot_audit_v1',
    version: '1.0.0',
    status: 'religion_foundation_pilot_with_university_production',
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
      foundationMethodCount: source.methods.methods.filter((method) => !method.university_matrix_status).length,
      universityMethodCount: source.methods.methods.filter((method) => method.university_matrix_status === 'materialized').length,
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
      allMethodReferencesResolved: true,
      respectfulRepresentationPrinciplesLocked: true,
      badgeAndSubjectRoutesDistinct: true,
      assessmentStatusAudited: true,
      editorialStatusChaptersInProgress: true,
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
    const { report } = auditReligionPilot({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Religion-pilot OK: ${report.summary.domainCount} fagområder, ${report.summary.emneCount} emner og ${report.summary.methodCount} metoder.`);
  } catch (error) {
    console.error(`Religion-pilot FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
