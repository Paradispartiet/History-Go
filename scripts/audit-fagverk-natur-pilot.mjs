#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = Object.freeze({
  core: 'js/fagverk-subject-core.js',
  categories: 'data/categories/category_contract.json',
  manifest: 'data/fag/fag_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  badge: 'data/badges/natur.json',
    mapping: 'data/fag/natur/emnemapping_natur_canonical_v4_5.json',
  badgePage: 'data/fag/natur/merke_natur (1).html',
  report: 'reports/fagverk/natur-pilot-audit.json'
});

const absolute = (relativePath) => path.join(ROOT, relativePath);
const read = (relativePath) => fs.readFileSync(absolute(relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function loadCore() {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read(PATHS.core), sandbox, { filename: PATHS.core });
  assert(sandbox.HGFagverkSubjectCore, 'Fagverk-core ble ikke eksponert');
  return sandbox.HGFagverkSubjectCore;
}

export function auditNaturePilot({ writeReport = false, checkReport = true } = {}) {
  const CORE = loadCore();
  const categories = readJson(PATHS.categories);
  const manifest = readJson(PATHS.manifest);
  const portal = readJson(PATHS.portal);
  const inventory = readJson(PATHS.inventory);
  const status = readJson(PATHS.status);
  const registry = readJson(PATHS.registry);
  const badge = readJson(PATHS.badge);
  const canonicalMappings = readJson(PATHS.mapping);
  const portalEntry = portal.categories.find((row) => row.id === 'natur');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'natur');
  const statusEntry = status.subjects.find((row) => row.id === 'natur');
  const manifestEntry = manifest.natur;

  assert(categories.fagSubjects.includes('natur'), 'Natur mangler i kategorikontrakten');
  assert(manifestEntry && portalEntry && inventoryEntry && statusEntry, 'Natur mangler i manifest, portal, inventar eller status');
  assert(portalEntry.subjectStatus === 'materialized', 'Natur er ikke materialized i portalen');
  assert(portalEntry.subjectPage === 'fagverk.html?subject=natur', 'Natur har feil canonical fagsiderute');
  assert(statusEntry.navigationStatus === 'materialized', 'Natur har usynkron navigasjonsstatus');
  assert(statusEntry.assessmentStatus === 'audited', 'Natur er ikke individuelt audited');
  assert(statusEntry.editorialStatus === 'structure_ready', 'Natur er ikke structure_ready');
  assert(inventoryEntry.schemaFamily === 'standard_canonical', 'Natur bruker feil schemafamilie');

  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const relativePath = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(absolute(relativePath)), `Natur mangler required source: ${field}`);
    source[field === 'emner' ? 'emners' : field] = readJson(relativePath);
  }

  const model = CORE.normalizeSubject({
    subjectId: 'natur',
    categoryLabel: categories.labels.natur,
    categoryDescription: categories.decisions?.natur,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge,
    source
  });

  const expectedDomainOrder = [
    'okosystem_mangfold_habitat',
    'vann_hydrologi_kretslop',
    'klima_energi_resiliens',
    'geologi_landskap_tid',
    'urban_okologi_gronnstruktur',
    'miljopavirkning_forvaltning_regenerasjon'
  ];
  const actualDomainOrder = [...model.domains].map((domain) => domain.id);
  assert(model.subject.id === 'natur', 'Normalisert subject-id er feil');
  assert(model.subject.title === 'Natur & miljø', `Uventet Natur-tittel: ${model.subject.title}`);
  assert(model.subject.adapter === 'standard', 'Natur bruker ikke standard-adapteren');
  assert(model.subject.routes.subject === portalEntry.subjectPage, 'Fagsideruten løses ikke gjennom portalregisteret');
  assert(model.subject.routes.badge === portalEntry.badgePage, 'Merkesideruten løses ikke gjennom portalregisteret');
  assert(isDeepStrictEqual(actualDomainOrder, expectedDomainOrder), 'Natur-fagområdene vises ikke i canonical rekkefølge');
  assert(model.summary.domainCount === 6, `Forventet 6 fagområder, fikk ${model.summary.domainCount}`);
  assert(model.summary.emneCount === 35, `Forventet 35 emner, fikk ${model.summary.emneCount}`);
  assert(model.summary.methodCount === 30, `Forventet 30 metoder, fikk ${model.summary.methodCount}`);
  assert(model.summary.mappingCount === 35, `Forventet 35 mappings, fikk ${model.summary.mappingCount}`);
  assert(model.summary.hookCount === 60, `Forventet 60 hooks, fikk ${model.summary.hookCount}`);
  assert(model.chapters.length === 0, 'Natur skal ikke få oppdiktede lærekapitler ved materialisering');
  const canonicalMappingIds = new Set(canonicalMappings.map((row) => row.emne_id));
  assert(canonicalMappings.length === model.emners.length, `Canonical mappingfil har ${canonicalMappings.length} rader for ${model.emners.length} emner`);
  for (const emne of model.emners) assert(canonicalMappingIds.has(emne.id), `Canonical mappingfil mangler ${emne.id}`);

  for (const domain of model.domains) {
    assert(domain.label && domain.definition, `Natur-fagområdet ${domain.id} mangler label eller definisjon`);
    for (const emneId of domain.emneIds) assert(model.emnersById.has(emneId), `Natur-fagområdet ${domain.id} peker til ukjent emne ${emneId}`);
    for (const methodId of domain.methodIds) assert(model.methodsById.has(methodId), `Natur-fagområdet ${domain.id} peker til ukjent metode ${methodId}`);
  }
  for (const emne of model.emners) {
    assert(emne.subjectId === 'natur', `Emnet ${emne.id} har feil subject-id`);
    assert(model.domainsById.has(emne.domainId), `Emnet ${emne.id} peker til ukjent fagområde`);
    assert(emne.title && emne.definition, `Emnet ${emne.id} mangler tittel eller definisjon`);
    for (const methodId of emne.methodIds) assert(model.methodsById.has(methodId), `Emnet ${emne.id} peker til ukjent metode ${methodId}`);
  }
  for (const method of model.methods) assert(method.title && method.description, `Metoden ${method.id} mangler navn eller forklaring`);

  const badgePage = read(PATHS.badgePage);
  assert(badgePage.includes('../../../fagverk.html?subject=natur'), 'Natur-merkesiden lenker ikke til fagsiden');
  assert(badgePage.includes('../../../fagverk-forside.html'), 'Natur-merkesiden lenker ikke til Fagverkforsiden');
  assert(!JSON.stringify(model.subject).toLocaleLowerCase('nb-NO').includes('politikk'), 'Natur-modellen inneholder politikkspesifikk resttekst');

  const report = {
    schema: 'history_go_fagverk_natur_pilot_audit_v1',
    version: '1.0.0',
    status: 'phase_2_natur_pilot_passed',
    generatedFrom: PATHS,
    subject: {
      id: model.subject.id,
      title: model.subject.title,
      schemaFamily: inventoryEntry.schemaFamily,
      adapter: model.subject.adapter,
      badgePage: model.subject.routes.badge,
      subjectPage: model.subject.routes.subject,
      assessmentStatus: statusEntry.assessmentStatus,
      editorialStatus: statusEntry.editorialStatus
    },
    summary: {
      domainCount: model.summary.domainCount,
      emneCount: model.summary.emneCount,
      methodCount: model.summary.methodCount,
      mappingCount: model.summary.mappingCount,
      hookCount: model.summary.hookCount,
      chapterCount: model.chapters.length,
      placeCount: model.places.length
    },
    canonicalDomainOrder: actualDomainOrder,
    gates: {
      manifestFirst: true,
      normalizedModel: true,
      canonicalDomainOrder: true,
      emneReferencesResolved: true,
      methodReferencesResolved: true,
      mappingsResolved: true,
      canonicalMappingFileComplete: true,
      badgeAndSubjectRoutes: true,
      noGeneratedChapters: true,
      politicsResiduals: 0
    }
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(absolute(PATHS.report)), { recursive: true });
    fs.writeFileSync(absolute(PATHS.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) {
    const committed = readJson(PATHS.report);
    assert(isDeepStrictEqual(committed, report), `${PATHS.report} er utdatert`);
  }
  return { report, model };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditNaturePilot({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Natur-pilot OK: ${result.report.summary.domainCount} fagområder, ${result.report.summary.emneCount} emner og ${result.report.summary.methodCount} metoder.`);
  } catch (error) {
    console.error(`Natur-pilot FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
