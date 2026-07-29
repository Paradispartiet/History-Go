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
  badgePage: 'data/fag/historie/merke_historie (1).html',
  universalCoverage: 'reports/historie-universal-coverage/historie-universal-coverage.json',
  report: 'reports/fagverk/historie-subject-audit.json'
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

function optionalJson(relativePath) {
  return fs.existsSync(absolute(relativePath)) ? readJson(relativePath) : null;
}

export function auditHistorySubject({ writeReport = false, checkReport = true } = {}) {
  const CORE = loadCore();
  const categories = readJson(PATHS.categories);
  const manifest = readJson(PATHS.manifest);
  const portal = readJson(PATHS.portal);
  const inventory = readJson(PATHS.inventory);
  const status = readJson(PATHS.status);
  const registry = readJson(PATHS.registry);
  const universalCoverage = readJson(PATHS.universalCoverage);
  const portalEntry = portal.categories.find((row) => row.id === 'historie');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'historie');
  const statusEntry = status.subjects.find((row) => row.id === 'historie');
  const manifestEntry = manifest.historie;

  assert(categories.fagSubjects.includes('historie'), 'Historie mangler i kategorikontrakten');
  assert(manifestEntry && portalEntry && inventoryEntry && statusEntry, 'Historie mangler i manifest, portal, inventar eller status');
  assert(portalEntry.subjectStatus === 'materialized', 'Historie er ikke materialized i portalen');
  assert(portalEntry.subjectPage === 'fagverk.html?subject=historie', 'Historie har feil canonical fagsiderute');
  assert(portalEntry.badgePage === PATHS.badgePage, 'Historie har feil canonical merkesiderute');
  assert(fs.existsSync(absolute(portalEntry.badgePage)), 'Historie-merkesiden finnes ikke');
  assert(statusEntry.navigationStatus === 'materialized', 'Historie har usynkron navigasjonsstatus');
  assert(statusEntry.assessmentStatus === 'audited', 'Historie er ikke individuelt audited');
  assert(statusEntry.editorialStatus === 'structure_ready', 'Historie er ikke structure_ready');
  assert(inventoryEntry.schemaFamily === 'standard_canonical', 'Historie bruker feil schemafamilie');

  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const relativePath = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(absolute(relativePath)), `Historie mangler required source: ${field}`);
    source[field === 'emner' ? 'emners' : field] = readJson(relativePath);
  }
  for (const field of ['coverageContract', 'qualityContract', 'caseRequirements', 'claims', 'sources', 'placeEvidence', 'profilesManifest']) {
    const relativePath = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(absolute(relativePath)), `Historie mangler manifesttillegget ${field}: ${relativePath}`);
  }

  const model = CORE.normalizeSubject({
    subjectId: 'historie',
    categoryLabel: categories.labels.historie,
    categoryDescription: categories.decisions?.historie,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge: optionalJson('data/badges/historie.json'),
    source
  });

  const expectedDomainOrder = [
    'his_tid_periodisering',
    'his_kilder_arkiv_spor',
    'his_makt_stat_institusjoner',
    'his_middelalder_kirke_kongemakt',
    'his_1814_statsdannelse',
    'his_industri_arbeid_sosialhistorie',
    'his_krig_okkupasjon_motstand',
    'his_velferd_rett_hverdagsliv',
    'his_migrasjon_minoritet_tilhorighet',
    'his_minne_kulturarv_historiebruk',
    'his_byhistorie_stedsendring',
    'his_katastrofer_brudd_ulykker',
    'his_kjonn_familie_livslop',
    'his_okonomi_handel_materielle_systemer',
    'his_religion_reformasjon_livssyn',
    'his_samisk_urfolkshistorie',
    'his_miljo_klima_landskap',
    'his_vitenskap_teknologi_kunnskap',
    'his_global_kolonial_transnasjonal',
    'his_offentlighet_mobilisering_bevegelser',
    'his_forhistorie_arkeologi',
    'his_forste_verdenskrig_mellomkrig',
    'his_kald_krig_etterkrig'
  ];
  const actualDomainOrder = model.domains.map((domain) => domain.id);

  assert(model.subject.id === 'historie', 'Normalisert subject-id er feil');
  assert(model.subject.title === 'Historie', `Uventet Historie-tittel: ${model.subject.title}`);
  assert(model.subject.adapter === 'standard', 'Historie bruker ikke standard-adapteren');
  assert(model.subject.routes.subject === portalEntry.subjectPage, 'Fagsideruten løses ikke gjennom portalregisteret');
  assert(model.subject.routes.badge === portalEntry.badgePage, 'Merkesideruten løses ikke gjennom portalregisteret');
  assert(isDeepStrictEqual(actualDomainOrder, expectedDomainOrder), 'Historie-fagområdene vises ikke i canonical rekkefølge');
  assert(model.summary.domainCount === 23, `Forventet 23 fagområder, fikk ${model.summary.domainCount}`);
  assert(model.summary.emneCount === 230, `Forventet 230 emner, fikk ${model.summary.emneCount}`);
  assert(model.summary.methodCount === 105, `Forventet 105 metoder, fikk ${model.summary.methodCount}`);
  assert(model.summary.mappingCount === 230, `Forventet 230 mappings, fikk ${model.summary.mappingCount}`);
  assert(model.summary.hookCount === 230, `Forventet 230 hooks, fikk ${model.summary.hookCount}`);
  assert(model.chapters.length === 0, 'Historie skal ikke få oppdiktede lærekapitler ved strukturell materialisering');

  for (const domain of model.domains) {
    assert(domain.label && domain.definition, `Historie-fagområdet ${domain.id} mangler label eller definisjon`);
    assert(domain.emneIds.length === 10, `Historie-fagområdet ${domain.id} skal ha 10 emner, fikk ${domain.emneIds.length}`);
    assert(domain.hookIds.length === 10, `Historie-fagområdet ${domain.id} skal ha 10 hooks, fikk ${domain.hookIds.length}`);
    for (const emneId of domain.emneIds) assert(model.emnersById.has(emneId), `Historie-fagområdet ${domain.id} peker til ukjent emne ${emneId}`);
    for (const methodId of domain.methodIds) assert(model.methodsById.has(methodId), `Historie-fagområdet ${domain.id} peker til ukjent metode ${methodId}`);
  }
  for (const emne of model.emners) {
    assert(emne.subjectId === 'historie', `Emnet ${emne.id} har feil subject-id`);
    assert(model.domainsById.has(emne.domainId), `Emnet ${emne.id} peker til ukjent fagområde`);
    assert(emne.title && emne.definition && emne.whyItMatters, `Emnet ${emne.id} mangler tittel, definisjon eller betydning`);
    assert(emne.concepts.length > 0, `Emnet ${emne.id} mangler canonicale begreper`);
    assert(emne.keyQuestions.length > 0, `Emnet ${emne.id} mangler nøkkelspørsmål`);
    for (const methodId of emne.methodIds) assert(model.methodsById.has(methodId), `Emnet ${emne.id} peker til ukjent metode ${methodId}`);
  }
  for (const method of model.methods) assert(method.title && method.description, `Metoden ${method.id} mangler navn eller forklaring`);

  assert(universalCoverage.subject_id === 'historie', 'Heldedekningsrapporten gjelder ikke Historie');
  assert(universalCoverage.inventory?.domains === model.summary.domainCount, 'Heldedekningsrapportens fagområder er usynkronisert');
  assert(universalCoverage.inventory?.emner === model.summary.emneCount, 'Heldedekningsrapportens emner er usynkronisert');
  assert(universalCoverage.inventory?.methods === model.summary.methodCount, 'Heldedekningsrapportens metoder er usynkronisert');
  if (universalCoverage.status !== 'COMPLETE') {
    assert(statusEntry.editorialStatus !== 'complete', 'Historie kan ikke settes complete mens universell heldekning er ufullstendig');
  }

  const theoryEvidence = universalCoverage.production?.checks?.find((check) => check.id === 'theory_evidence_readiness');
  assert(theoryEvidence, 'Heldedekningsrapporten mangler theory_evidence_readiness');
  assert(!JSON.stringify(model.subject).toLocaleLowerCase('nb-NO').includes('politikk'), 'Historie-modellen inneholder politikkspesifikk resttekst');

  const report = {
    schema: 'history_go_fagverk_historie_subject_audit_v1',
    version: '1.0.0',
    status: 'phase_3_historie_structure_ready',
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
    universalCoverage: {
      status: universalCoverage.status,
      coveredCells: universalCoverage.summary?.covered_cells ?? null,
      totalCells: universalCoverage.summary?.total_cells ?? null,
      productionGaps: universalCoverage.summary?.production_gaps ?? null,
      theoryEvidenceQualifying: theoryEvidence.measured?.qualifying ?? null,
      theoryEvidenceTotal: theoryEvidence.measured?.total ?? null,
      theoryEvidenceRatio: theoryEvidence.measured?.ratio ?? null
    },
    canonicalDomainOrder: actualDomainOrder,
    gates: {
      manifestFirst: true,
      normalizedModel: true,
      canonicalDomainOrder: true,
      emneReferencesResolved: true,
      methodReferencesResolved: true,
      mappingsResolved: true,
      historyExtensionPointersResolved: true,
      badgeAndSubjectRoutes: true,
      noGeneratedChapters: true,
      honestUniversalCoverageBoundary: true,
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
    const result = auditHistorySubject({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Historie-fagverk OK: ${result.report.summary.domainCount} fagområder, ${result.report.summary.emneCount} emner og ${result.report.summary.methodCount} metoder.`);
  } catch (error) {
    console.error(`Historie-fagverk FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
