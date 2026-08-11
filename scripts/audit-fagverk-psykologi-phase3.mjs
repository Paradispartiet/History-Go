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
  badge: 'data/badges/psykologi.json',
  explicitMappings: 'data/fag/psykologi/emnemapping_psykologi_canonical_v4_5.json',
  generator: 'data/fag/psykologi/quiz_generator_rules_psykologi_v5_1_source_priority_patch.json',
  badgePage: 'data/fag/psykologi/merke_psykologi (1).html',
  report: 'reports/fagverk/psykologi-phase3-audit.json'
});

const DOMAIN_ORDER = [
  'psykisk_helse_institusjoner_behandling',
  'fagtradisjoner_teori_sinnet',
  'utvikling_oppvekst_laring',
  'kognisjon_folelser_atferd',
  'sosialpsykologi_normalitet_stigma',
  'traume_krise_resiliens_omsorg'
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

function assertEditorialProgress(statusEntry, registeredChapters) {
  const chapterCount = registeredChapters.length;
  assert(chapterCount >= 0 && chapterCount <= DOMAIN_ORDER.length, 'Psykologi har umulig kapitteltall');
  const primaryDomainIds = registeredChapters.map((chapter) => chapter.primary_domain_id).filter(Boolean);
  assert(new Set(primaryDomainIds).size === primaryDomainIds.length, 'Psykologi har flere kapitler med samme primærdomene');
  assert(primaryDomainIds.every((id) => DOMAIN_ORDER.includes(id)), 'Psykologi-kapittel peker til ukjent canonicalt domene');

  if (chapterCount === 0) {
    assert(statusEntry.editorialStatus === 'structure_ready', 'Psykologi uten kapitler skal stå structure_ready');
    assert(statusEntry.nextGate === 'chapter_production', 'Psykologi uten kapitler skal ha chapter_production som neste port');
    return;
  }

  if (chapterCount < DOMAIN_ORDER.length) {
    assert(statusEntry.editorialStatus === 'chapters_in_progress', 'Psykologi med delvis kapitteldekning skal stå chapters_in_progress');
    assert(statusEntry.nextGate === 'remaining_domain_chapter_production', 'Psykologi med delvis kapitteldekning skal peke til resterende kapittelproduksjon');
    return;
  }

  assert(['chapters_in_progress', 'complete', 'expanded_and_audited'].includes(statusEntry.editorialStatus), 'Psykologi med seks kapitler har ugyldig redaksjonell status');
  if (statusEntry.editorialStatus === 'chapters_in_progress') {
    assert(statusEntry.nextGate === 'full_subject_audit', 'Seks kapitler før complete skal peke til full_subject_audit');
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

export function auditPsykologiPhase3({ writeReport = false, checkReport = true } = {}) {
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
  const portalEntry = portal.categories.find((row) => row.id === 'psykologi');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'psykologi');
  const statusEntry = status.subjects.find((row) => row.id === 'psykologi');
  const manifestEntry = manifest.psykologi;
  const registrySubject = registry.subjects?.psykologi;
  const registeredChapters = registrySubject?.chapters || [];

  assert(categories.fagSubjects.includes('psykologi'), 'Psykologi mangler i canonical fagliste');
  assert(portalEntry?.subjectStatus === 'materialized', 'Psykologi er ikke materialisert i portalen');
  assert(portalEntry?.subjectPage === 'fagverk.html?subject=psykologi', 'Psykologi har feil canonical fagsiderute');
  assert(inventoryEntry?.schemaFamily === 'standard_canonical', 'Psykologi har feil schemafamilie');
  assert(inventoryEntry?.pilot === false, 'Psykologi skal være et individuelt Fase 3-fag');
  assert(inventoryEntry?.optionalManifestFields?.includes('emneMappings'), 'Psykologi-inventaret mangler emneMappings');
  assert(statusEntry?.navigationStatus === 'materialized', 'Psykologi har feil navigasjonsstatus');
  assert(statusEntry?.assessmentStatus === 'audited', 'Psykologi har feil auditstatus');
  assert(registry.placePage?.fallbackSubjectByCategory?.psykologi === 'psykologi', 'Psykologi-steder mangler Psykologi som fagverksfallback');
  assert(registrySubject, 'Psykologi mangler i fagverkregisteret');
  assert(manifestEntry?.emneMappings === 'psykologi/emnemapping_psykologi_canonical_v4_5.json', 'Psykologi-manifestet mangler canonical mappingregister');
  assertEditorialProgress(statusEntry, registeredChapters);

  const source = loadSource(CORE, manifestEntry);
  const model = CORE.normalizeSubject({
    subjectId: 'psykologi',
    categoryLabel: categories.labels.psykologi,
    categoryDescription: categories.decisions?.psykologi,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge,
    source
  });

  assert(model.subject.title === 'Psykologi', 'Psykologi har feil fagtittel');
  assert(model.subject.description.length >= 300, 'Psykologi mangler eksplisitt fagbeskrivelse');
  assert(model.subject.adapter === 'standard', 'Psykologi går ikke gjennom standardadapteren');
  assert(model.subject.routes.badge !== model.subject.routes.subject, 'Merke- og fagside kan ikke være samme mål');
  assert(isDeepStrictEqual([...model.domains].map((domain) => domain.id), DOMAIN_ORDER), 'Psykologi har feil canonical fagområderekkefølge');
  assert(model.domains.every((domain) => domain.sourceKind === 'pensum_domain'), 'Psykologi opprettet syntetiske fagområder');
  assert(model.summary.domainCount === 6, 'Psykologi skal ha seks fagområder');
  assert(model.summary.emneCount === 58, 'Psykologi skal ha 58 aktive emner');
  assert(model.summary.methodCount === 58, 'Psykologi skal ha 58 metoder');
  assert(model.summary.mappingCount === 58, 'Psykologi skal ha 58 normaliserte mappinger');
  assert(model.summary.hookCount === 60, 'Psykologi skal ha 60 hooks');
  assert(model.chapters.length === registeredChapters.length, 'Renderer og registry er uenige om Psykologi-kapitler');
  assert(model.emners.every((emne) => emne.methodIds.length >= 1), 'Psykologi-emne mangler løst metode-ID');

  const pensumIds = new Set(source.pensum.domains.flatMap((domain) => domain.emne_ids || []));
  const hooks = source.fagkart.categories.flatMap((domain) => domain.topic_hooks || []);
  const hookIds = new Set(hooks.flatMap((hook) => hook.emne_ids || []));
  const mappingIds = new Set(explicitMappings.map((row) => row.emne_id));
  assertExactCoverage('Psykologi', source.emners, ['pensum', pensumIds], ['fagkart', hookIds], ['mappingregister', mappingIds]);

  const methodIds = new Set(source.methods.methods.map((method) => method.method_id));
  assert(methodIds.size === 58, 'Psykologi har feil antall unike metode-ID-er');
  assert(source.methods.methods.every((method) => methodIds.has(method.method_id)), 'Psykologi har metode uten ID');
  assert(hooks.flatMap((hook) => hook.recommended_method_ids || []).every((id) => methodIds.has(id)), 'Psykologi-hook peker til ukjent metode');
  assert(explicitMappings.flatMap((row) => row.mappings || []).flatMap((mapping) => mapping.recommended_method_ids || []).every((id) => methodIds.has(id)), 'Psykologi-mapping peker til ukjent metode');
  assert(source.pensum.summary.domain_count === 6, 'Pensumsammendraget har feil domenetall');
  assert(source.pensum.summary.emne_count === 58, 'Pensumsammendraget har feil emnetall');
  assert(source.pensum.summary.method_count === 58, 'Pensumsammendraget har feil metodetall');
  assert(source.pensum.summary.mapping_count === 58, 'Pensumsammendraget har feil mappingtall');
  assert(source.pensum.summary.topic_hook_count === 60, 'Pensumsammendraget har feil hooktall');
  assert(generator.canonical_inputs.domain_count === 6, 'Generatoren har feil domenetall');
  assert(generator.canonical_inputs.emne_count === 58, 'Generatoren har feil emnetall');
  assert(generator.canonical_inputs.method_count === 58, 'Generatoren har feil metodetall');
  assert(generator.canonical_inputs.mapping_count === 58, 'Generatoren har feil mappingtall');
  assert(generator.canonical_inputs.topic_hook_count === 60, 'Generatoren har feil hooktall');
  assert(generator.hard_rules?.do_not_diagnose_people === true, 'Psykologi-generatoren mangler diagnosevernet');

  const badgePage = read(P.badgePage);
  assert(badgePage.includes('../../../fagverk.html?subject=psykologi'), 'Psykologi-merkesiden mangler separat fagsidelenke');
  assert(badgePage.includes('../../../fagverk-forside.html'), 'Psykologi-merkesiden mangler fagverkforsiden');

  const domainEmneCounts = Object.fromEntries(source.pensum.domains.map((domain) => [domain.domain_id, domain.emne_ids.length]));
  const report = {
    schema: 'history_go_fagverk_psykologi_phase3_audit_v1',
    version: '1.1.0',
    status: registeredChapters.length === 0 ? 'psykologi_phase_3_structure_ready' : 'psykologi_phase_3_structure_preserved_during_editorial_production',
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
    domainEmneCounts,
    gates: {
      allCanonicalEmnersInPensum: true,
      allCanonicalEmnersInFagkart: true,
      allCanonicalEmnersInMappingRegistry: true,
      allMethodReferencesResolved: true,
      generatorCountsSynchronized: true,
      badgeAndSubjectRoutesDistinct: true,
      doNotDiagnosePeopleGuardPresent: true,
      assessmentStatusAudited: true,
      editorialProgressConsistent: true,
      canonicalStructurePreservedDuringChapterProduction: true
    }
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committedProjection(report), null, 2)}\n`);
  }
  if (checkReport) {
    const committed = json(P.report);
    assert(isDeepStrictEqual(committed, committedProjection(report)), `${P.report} er utdatert. Kjør node scripts/audit-fagverk-psykologi-phase3.mjs --write-report`);
  }
  return { report: committedProjection(report), model };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditPsykologiPhase3({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') && !args.has('--write-report') });
    console.log(`Psykologi Fase 3 OK: ${result.report.summary.domainCount} fagområder, ${result.report.summary.emneCount} emner, ${result.report.summary.methodCount} metoder, ${result.report.summary.hookCount} hooks og ${result.report.summary.registeredChapterCount} registrerte kapitler.`);
  } catch (error) {
    console.error(`Psykologi Fase 3 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
