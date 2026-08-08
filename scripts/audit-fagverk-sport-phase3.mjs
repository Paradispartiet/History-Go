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
  badge: 'data/badges/sport.json',
  explicitMappings: 'data/fag/sport/emnemapping_sport_canonical_v4_5.json',
  generator: 'data/fag/sport/quiz_generator_rules_sport_v5_1_source_priority_patch.json',
  badgePage: 'data/fag/sport/merke_sport.html',
  report: 'reports/fagverk/sport-phase3-audit.json'
});
const DOMAIN_ORDER = [
  'arenaer_steder_groundhopper',
  'regler_spill_konkurranse',
  'kropp_trening_prestasjon',
  'klubber_lag_frivillighet',
  'supportere_publikum_kultur',
  'inkludering_helse_lek_samfunn'
];
const abs = (p) => path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const json = (p) => JSON.parse(read(p));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function loadCore() {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read(P.core), sandbox, { filename: P.core });
  assert(sandbox.HGFagverkSubjectCore, 'Fagverk-core ble ikke eksponert');
  return sandbox.HGFagverkSubjectCore;
}

function loadSource(CORE, manifestEntry) {
  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const relativePath = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(abs(relativePath)), `Mangler ${field}: ${relativePath}`);
    source[field === 'emner' ? 'emners' : field] = json(relativePath);
  }
  return source;
}

function assertExactCoverage(label, expectedRows, ...idSets) {
  const expected = new Set(expectedRows.map((row) => row.emne_id));
  assert(expected.size === expectedRows.length, `${label}: dupliserte emne-ID-er`);
  for (const [sourceLabel, ids] of idSets) {
    assert(ids.size === expected.size, `${label}: ${sourceLabel} har feil emnetall`);
    assert([...expected].every((id) => ids.has(id)), `${label}: ${sourceLabel} mangler canonicalt emne`);
    assert([...ids].every((id) => expected.has(id)), `${label}: ${sourceLabel} peker til ukjent emne`);
  }
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

export function auditSportPhase3({ writeReport = false, checkReport = true } = {}) {
  const CORE = loadCore();
  const categories = json(P.categories);
  const manifest = json(P.manifest);
  const portal = json(P.portal);
  const inventory = json(P.inventory);
  const status = json(P.status);
  const registry = json(P.registry);
  const badge = json(P.badge);
  const explicitMappings = json(P.explicitMappings);
  const generator = json(P.generator);
  const portalEntry = portal.categories.find((row) => row.id === 'sport');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'sport');
  const statusEntry = status.subjects.find((row) => row.id === 'sport');
  const manifestEntry = manifest.sport;

  assert(categories.fagSubjects.includes('sport'), 'Sport mangler i canonical fagliste');
  assert(portalEntry?.subjectStatus === 'materialized', 'Sport er ikke materialisert i portalen');
  assert(portalEntry?.subjectPage === 'fagverk.html?subject=sport', 'Sport har feil canonical fagsiderute');
  assert(inventoryEntry?.schemaFamily === 'standard_canonical', 'Sport har feil schemafamilie');
  assert(inventoryEntry?.pilot === false, 'Sport skal være et individuelt Fase 3-fag');
  assert(inventoryEntry?.optionalManifestFields?.includes('emneMappings'), 'Sport-inventaret mangler emneMappings');
  assert(statusEntry?.navigationStatus === 'materialized', 'Sport har feil navigasjonsstatus');
  assert(statusEntry?.assessmentStatus === 'audited', 'Sport har feil auditstatus');
  assert(statusEntry?.editorialStatus === 'structure_ready', 'Sport må stå structure_ready før kapittelproduksjon');
  assert(statusEntry?.nextGate === 'chapter_production', 'Sport har feil neste port');
  assert(registry.placePage?.fallbackSubjectByCategory?.sport === 'sport', 'Sport-steder mangler Sport som fagverksfallback');
  assert(registry.subjects?.sport, 'Sport mangler i fagverkregisteret');
  assert(manifestEntry?.emneMappings === 'sport/emnemapping_sport_canonical_v4_5.json', 'Sport-manifestet mangler canonical mappingregister');
  assert(manifestEntry?.knowledgePolicy && manifestEntry?.knowledgeUnitSchema && manifestEntry?.knowledgeArchitecture, 'Sport må bevare Knowledge-kontraktene');

  const source = loadSource(CORE, manifestEntry);
  const model = CORE.normalizeSubject({
    subjectId: 'sport',
    categoryLabel: categories.labels.sport,
    categoryDescription: categories.decisions?.sport,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge,
    source
  });

  assert(['Sport', 'Sport & lek'].includes(model.subject.title), 'Sport har feil fagtittel');
  assert(model.subject.description.length >= 250, 'Sport mangler eksplisitt fagbeskrivelse');
  assert(model.subject.adapter === 'standard', 'Sport går ikke gjennom standardadapteren');
  assert(model.subject.routes.badge !== model.subject.routes.subject, 'Merke- og fagside kan ikke være samme mål');
  assert(isDeepStrictEqual([...model.domains].map((d) => d.id), DOMAIN_ORDER), 'Sport har feil canonical fagområderekkefølge');
  assert(model.domains.every((d) => d.sourceKind === 'pensum_domain'), 'Sport opprettet syntetiske fagområder');
  assert(model.summary.domainCount === 6, 'Sport skal ha seks fagområder');
  assert(model.summary.emneCount === 116, 'Sport skal ha 116 aktive emner');
  assert(model.summary.methodCount === 109, 'Sport skal ha 109 metoder');
  assert(model.summary.mappingCount === 116, 'Sport skal ha 116 normaliserte mappinger');
  assert(model.summary.hookCount === 60, 'Sport skal ha 60 hooks');
  assert(model.chapters.length === 0, 'Structure-ready kan ikke late som Sport-kapitler finnes');
  assert(model.emners.every((emne) => emne.methodIds.length >= 1), 'Sport-emne mangler løst metode-ID');

  const pensumIds = new Set(source.pensum.domains.flatMap((d) => d.emne_ids || []));
  const hooks = source.fagkart.categories.flatMap((d) => d.topic_hooks || []);
  const hookIds = new Set(hooks.flatMap((h) => h.emne_ids || []));
  const mappingIds = new Set(explicitMappings.map((row) => row.emne_id));
  assertExactCoverage('Sport', source.emners, ['pensum', pensumIds], ['fagkart', hookIds], ['mappingregister', mappingIds]);

  const methodIds = new Set(source.methods.methods.map((method) => method.method_id));
  assert(methodIds.size === 109, 'Sport har feil antall unike metode-ID-er');
  assert(source.methods.methods.every((method) => method.canonical_status === 'canonical'), 'Sport har ikke-canonical metode i aktiv katalog');
  assert(hooks.flatMap((hook) => hook.recommended_method_ids || []).every((id) => methodIds.has(id)), 'Sport-hook peker til ukjent metode');
  assert(explicitMappings.flatMap((row) => row.mappings || []).flatMap((mapping) => mapping.recommended_method_ids || []).every((id) => methodIds.has(id)), 'Sport-mapping peker til ukjent metode');

  const expected = { domain_count: 6, emne_count: 116, method_count: 109, mapping_count: 116, topic_hook_count: 60 };
  for (const [key, value] of Object.entries(expected)) {
    assert(source.pensum.summary?.[key] === value, `Pensumsammendraget har feil ${key}`);
    assert(generator.canonical_inputs?.[key] === value, `Generatoren har feil ${key}`);
  }
  assert(generator.hard_rules?.external_sport_source_first_all_sets === true, 'Sport-generatoren mangler source-first-port');
  assert(generator.hard_rules?.required_emne_prefix === 'em_sport_', 'Sport-generatoren mangler canonical emneprefix');
  assert(DOMAIN_ORDER.some((id) => id === 'arenaer_steder_groundhopper'), 'Groundhopper-domenet mangler');
  assert(source.pensum.domains.find((d) => d.domain_id === 'arenaer_steder_groundhopper')?.groundhopper_relevant_when_place_based === true, 'Groundhopper-stedsrelevans er ikke låst');

  const badgePage = read(P.badgePage);
  assert(badgePage.includes('../../../fagverk.html?subject=sport'), 'Sport-merkesiden mangler separat fagsidelenke');
  assert(badgePage.includes('../../../fagverk-forside.html'), 'Sport-merkesiden mangler Fagverk-forsiden');

  const report = {
    schema: 'history_go_fagverk_sport_phase3_audit_v1',
    version: '1.0.0',
    status: 'sport_phase_3_structure_ready',
    generatedFrom: P,
    subject: {
      id: model.subject.id,
      title: model.subject.title,
      schemaFamily: inventoryEntry.schemaFamily,
      adapter: model.subject.adapter,
      navigationStatus: statusEntry.navigationStatus,
      assessmentStatus: statusEntry.assessmentStatus,
      editorialStatus: statusEntry.editorialStatus,
      nextGate: statusEntry.nextGate,
      subjectPage: portalEntry.subjectPage,
      badgePage: portalEntry.badgePage
    },
    summary: {
      domainCount: model.summary.domainCount,
      emneCount: model.summary.emneCount,
      methodCount: model.summary.methodCount,
      mappingCount: model.summary.mappingCount,
      hookCount: model.summary.hookCount,
      registeredChapterCount: model.chapters.length,
      explicitMappingRowCount: explicitMappings.length
    },
    canonicalDomainOrder: DOMAIN_ORDER,
    domainEmneCounts: Object.fromEntries(source.pensum.domains.map((d) => [d.domain_id, d.emne_ids.length])),
    gates: {
      allCanonicalEmnersInPensum: true,
      allCanonicalEmnersInFagkart: true,
      allCanonicalEmnersInMappingRegistry: true,
      allMethodReferencesResolved: true,
      generatorCountsSynchronized: true,
      knowledgeContractsPreserved: true,
      sourceFirstGenerationLocked: true,
      groundhopperPlaceLogicPreserved: true,
      badgeAndSubjectRoutesDistinct: true,
      assessmentStatusAudited: true,
      editorialStatusStructureReady: true,
      chapterClaimsNotOverstated: true
    }
  };

  const projection = committedProjection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(projection, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), projection), `${P.report} er utdatert`);
  return { report: projection, model };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditSportPhase3({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Sport Fase 3 OK: ${report.summary.domainCount} fagområder, ${report.summary.emneCount} emner, ${report.summary.methodCount} metoder og ${report.summary.hookCount} hooks.`);
  } catch (error) {
    console.error(`Sport Fase 3 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
