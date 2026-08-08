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
  badge: 'data/badges/vitenskap.json',
  explicitMappings: 'data/fag/vitenskap/emnemapping_vitenskap_canonical_v4_5.json',
  generator: 'data/fag/vitenskap/quiz_generator_rules_vitenskap_v5_1_source_priority_patch.json',
  technologyIndex: 'data/fag/teknologi/teknologi_scientific_v2/index.json',
  report: 'reports/fagverk/vitenskap-pilot-audit.json'
});
const DOMAIN_ORDER = [
  'institusjoner_laboratorier_kunnskapssteder',
  'metoder_maling_modeller',
  'paradigmer_teorier_sannhet',
  'teknologi_data_infrastruktur',
  'natur_medisin_miljo',
  'samfunn_makt_etikk'
];
const abs = (relativePath) => path.join(ROOT, relativePath);
const read = (relativePath) => fs.readFileSync(abs(relativePath), 'utf8');
const json = (relativePath) => JSON.parse(read(relativePath));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const unique = (values) => [...new Set(values)];

function loadCore() {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read(P.core), sandbox, { filename: P.core });
  assert(sandbox.HGFagverkSubjectCore, 'Fagverk-core ble ikke eksponert');
  return sandbox.HGFagverkSubjectCore;
}

function loadLegacySource(CORE, manifestEntry) {
  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const relativePath = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(abs(relativePath)), `Mangler ${field}: ${relativePath}`);
    source[field === 'emner' ? 'emners' : field] = json(relativePath);
  }
  return source;
}

function committedProjection(report) {
  return {
    schema: report.schema,
    version: report.version,
    status: report.status,
    generatedFrom: report.generatedFrom,
    subject: report.subject,
    specialization: report.specialization,
    summary: report.summary,
    canonicalDomainOrder: report.canonicalDomainOrder,
    domainEmneCounts: report.domainEmneCounts,
    emneStatusCounts: report.emneStatusCounts,
    gates: report.gates
  };
}

export function auditVitenskapPilot({ writeReport = false, checkReport = true } = {}) {
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
  const technologyIndex = json(P.technologyIndex);
  const portalEntry = portal.categories.find((row) => row.id === 'vitenskap');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'vitenskap');
  const statusEntry = status.subjects.find((row) => row.id === 'vitenskap');
  const manifestEntry = manifest.vitenskap;
  const specializationEntry = manifestEntry?.specializations?.teknologi;
  const specializationInventory = inventoryEntry?.specializations?.find((row) => row.id === 'teknologi');

  assert(categories.fagSubjects.includes('vitenskap'), 'Vitenskap mangler i canonical fagliste');
  assert(!categories.fagSubjects.includes('teknologi'), 'Teknologi kan ikke være canonicalt toppfag');
  for (const alias of ['technology', 'teknologi', 'tech', 'it', 'informasjonsteknologi']) {
    assert(categories.aliases?.[alias] === 'vitenskap', `Teknologialias ${alias} peker ikke til Vitenskap`);
  }
  assert(manifest.teknologi === undefined, 'Teknologi finnes feilaktig som toppnivåmanifest');
  assert(portalEntry?.subjectStatus === 'materialized', 'Vitenskap er ikke materialisert i portalen');
  assert(portalEntry?.subjectPage === 'fagverk.html?subject=vitenskap', 'Vitenskap har feil canonical fagsiderute');
  assert(inventoryEntry?.schemaFamily === 'standard_canonical', 'Vitenskap har feil schemafamilie');
  assert(inventoryEntry?.pilot === true, 'Vitenskap er ikke registrert som fase-2-pilot');
  assert(statusEntry?.assessmentStatus === 'audited', 'Vitenskap har feil auditstatus');
  assert(statusEntry?.editorialStatus === 'structure_ready', 'Vitenskap må stå structure_ready før kapittelproduksjon');
  assert(statusEntry?.nextGate === 'chapter_production', 'Vitenskap har feil neste port');
  assert(registry.placePage?.fallbackSubjectByCategory?.vitenskap === 'vitenskap', 'Vitenskap-steder mangler Vitenskap som fagverksfallback');
  assert(specializationEntry?.canonicalParentSubject === 'vitenskap', 'Teknologi har feil canonical forelder');
  assert(specializationEntry?.badgeId === 'vitenskap', 'Teknologi har feil badge-eier');
  assert(specializationEntry?.routeStatus === 'planned' && specializationEntry?.route === '', 'Teknologi skal ikke ha selvstendig topprute');
  assert(specializationInventory?.schemaFamily === 'technology_scientific_v2_4', 'Teknologi har feil schemafamilie');

  const source = loadLegacySource(CORE, manifestEntry);
  const model = CORE.normalizeSubject({
    subjectId: 'vitenskap',
    categoryLabel: categories.labels.vitenskap,
    categoryDescription: categories.decisions?.vitenskap,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge,
    source
  });

  assert(model.subject.title === 'Vitenskap & teknologi', 'Vitenskap har feil fagtittel');
  assert(model.subject.description.length >= 220, 'Vitenskap mangler eksplisitt fagbeskrivelse');
  assert(model.subject.adapter === 'standard', 'Vitenskap går ikke gjennom standardadapteren');
  assert(model.subject.routes.badge !== model.subject.routes.subject, 'Merke- og fagside kan ikke være samme mål');
  assert(isDeepStrictEqual([...model.domains].map((domain) => domain.id), DOMAIN_ORDER), 'Vitenskap har feil canonical fagområderekkefølge');
  assert(model.domains.every((domain) => domain.sourceKind === 'pensum_domain'), 'Vitenskap opprettet kunstige fagområder');
  assert(model.summary.domainCount === 6, 'Vitenskap skal ha seks fagområder');
  assert(model.summary.emneCount === 93, 'Vitenskap skal ha 93 emner');
  assert(model.summary.methodCount === 84, 'Vitenskap skal ha 84 canonicale metoder');
  assert(model.summary.mappingCount === 93, 'Vitenskap skal ha én normalisert primærmapping per emne');
  assert(model.summary.hookCount === 60, 'Vitenskap skal ha 60 canonicale hooks');
  assert(model.chapters.length === 0, 'Structure-ready kan ikke late som Vitenskap-kapitler finnes');
  assert(model.emners.every((emne) => emne.methodIds.length >= 2), 'Vitenskap-emne mangler minst to løste metoder');
  assert(model.emners.every((emne) => emne.methodLabels.length === 0), 'Vitenskap har uløst tekst/metode-ID i emnekatalogen');

  const emneIds = new Set(source.emners.map((emne) => emne.emne_id));
  const pensumEmneIds = new Set(source.pensum.domains.flatMap((domain) => domain.emne_ids || []));
  const hooks = source.fagkart.categories.flatMap((domain) => domain.topic_hooks || []);
  const hookEmneIds = new Set(hooks.flatMap((hook) => hook.emne_ids || []));
  const mappingEmneIds = new Set(explicitMappings.map((mapping) => mapping.emne_id));
  for (const [label, ids] of [['pensum', pensumEmneIds], ['fagkart', hookEmneIds], ['mappingregister', mappingEmneIds]]) {
    assert(ids.size === emneIds.size, `${label} dekker ikke alle 93 Vitenskap-emner`);
    assert([...ids].every((id) => emneIds.has(id)), `${label} peker til ukjent Vitenskap-emne`);
  }
  const methodIds = new Set(source.methods.methods.map((method) => method.method_id));
  assert(source.methods.methods.every((method) => method.canonical_status === 'canonical'), 'Vitenskap har ikke-canonical metode i aktiv katalog');
  assert(hooks.flatMap((hook) => hook.recommended_method_ids || []).every((id) => methodIds.has(id)), 'Vitenskap-hook peker til ukjent metode');
  assert(source.pensum.summary.emne_count === source.emners.length, 'Pensumsammendraget har feil emnetall');
  assert(source.pensum.summary.mapping_count === explicitMappings.length, 'Pensumsammendraget har feil mappingtall');
  assert(generator.canonical_inputs.emne_count === source.emners.length, 'Generatoren har feil Vitenskap-emnetall');
  assert(generator.canonical_inputs.mapping_count === explicitMappings.length, 'Generatoren har feil Vitenskap-mappingtall');

  const technologySource = loadLegacySource(CORE, specializationEntry);
  const technology = CORE.normalizeSubject({
    subjectId: 'teknologi',
    categoryLabel: 'Teknologi',
    schemaFamily: specializationInventory.schemaFamily,
    manifestEntry: specializationEntry,
    portalEntry,
    inventoryEntry: specializationInventory,
    statusEntry,
    registry,
    badge,
    source: technologySource
  });
  assert(technology.subject.adapter === 'technology', 'Teknologi går ikke gjennom teknologi-adapteren');
  assert(technology.domains.every((domain) => domain.sourceKind === 'fagkart_category'), 'Teknologi opprettet kunstige fagområder');
  assert(technology.summary.domainCount === 12, 'Teknologi skal ha tolv områder');
  assert(technology.summary.emneCount === 48, 'Teknologi skal ha 48 emner');
  assert(technology.summary.methodCount === 35, 'Teknologi skal ha 35 metoder');
  assert(technology.summary.mappingCount === 48, 'Teknologi skal ha 48 normaliserte mappinger');
  assert(technology.summary.hookCount === 36, 'Teknologi skal ha 36 hooks');
  assert(technologySource.pensum.modules.length === 12, 'Teknologi skal bevare tolv progresjonsmoduler');
  assert(technology.chapters.length === 0, 'Nested teknologiinnhold kan ikke overrapporteres som Vitenskap-kapitler');
  assert(isDeepStrictEqual(technologyIndex.counts, {
    areas: 12, topics: 48, methods: 35, hooks: 36, concepts: 72, thinkers: 60,
    theory_objects: 24, modules: 12, knowledge_objects_total: 48, concepts_total: 136,
    typed_relations: 172, sources: 37, technology_anchors: 24, assessment_tasks: 24,
    quiz_pathways: 12, quiz_questions: 60
  }), 'Teknologi scientific v2-indeksen har uventede tellinger');

  const emneStatusCounts = Object.fromEntries(unique(source.emners.map((emne) => emne.status)).sort().map((value) => [value, source.emners.filter((emne) => emne.status === value).length]));
  const report = {
    schema: 'history_go_fagverk_vitenskap_pilot_audit_v1',
    version: '1.0.0',
    status: 'vitenskap_with_nested_teknologi_pilot_structure_ready',
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
    specialization: {
      id: 'teknologi',
      canonicalParentSubject: specializationEntry.canonicalParentSubject,
      badgeId: specializationEntry.badgeId,
      schemaFamily: specializationInventory.schemaFamily,
      adapter: technology.subject.adapter,
      topLevelRoute: specializationEntry.route,
      scientificStatus: technologyIndex.status
    },
    summary: {
      domainCount: model.summary.domainCount,
      emneCount: model.summary.emneCount,
      methodCount: model.summary.methodCount,
      mappingCount: model.summary.mappingCount,
      hookCount: model.summary.hookCount,
      registeredChapterCount: model.chapters.length,
      technologyDomainCount: technology.summary.domainCount,
      technologyEmneCount: technology.summary.emneCount,
      technologyMethodCount: technology.summary.methodCount,
      technologyMappingCount: technology.summary.mappingCount,
      technologyHookCount: technology.summary.hookCount,
      technologyProgressionModuleCount: technologySource.pensum.modules.length
    },
    canonicalDomainOrder: DOMAIN_ORDER,
    domainEmneCounts: Object.fromEntries(model.domains.map((domain) => [domain.id, domain.emneIds.length])),
    emneStatusCounts,
    gates: {
      manifestFirstSourcesResolved: true,
      allVitenskapEmnersIntegrated: true,
      noSyntheticVitenskapDomains: true,
      allMethodReferencesResolved: true,
      explicitMappingAndGeneratorCountsSynchronized: true,
      technologyAdapterExercised: true,
      technologyRemainsNestedSpecialization: true,
      technologyHasNoTopLevelRouteOrBadge: true,
      vitenskapPlaceFallbackCorrect: true,
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
  return { report, model, technology };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditVitenskapPilot({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Vitenskap-pilot OK: ${report.summary.domainCount} fagområder og ${report.summary.emneCount} emner; Teknologi nested med ${report.summary.technologyDomainCount} områder og ${report.summary.technologyEmneCount} emner.`);
  } catch (error) {
    console.error(`Vitenskap-pilot FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
