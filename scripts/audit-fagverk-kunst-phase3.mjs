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
  badge: 'data/badges/kunst.json',
  explicitMappings: 'data/fag/kunst/emnemapping_kunst_canonical_v4_5.json',
  generator: 'data/fag/kunst/quiz_generator_rules_kunst_v5_1_source_priority_patch.json',
  badgePage: 'data/fag/kunst/merke_kunst (2).html',
  legacyArchive: 'data/fag/kunst/archive/merke_kunst_legacy_20260828.html',
  report: 'reports/fagverk/kunst-phase3-audit.json'
});
const DOMAIN_ORDER = [
  'felt_institusjon',
  'produksjon_praksis',
  'estetisk_sprak_form',
  'makt_legitimitet',
  'publikum_offentlighet',
  'tid_transformasjon'
];
const HANDVERK_EMNE = 'em_kunst_materialitet_teknikk_handverk';
const INTEGRATED_BADGE_ROUTE = 'fagverk.html?subject=kunst#fagverkIaProgresjon';
const RELATIVE_INTEGRATED_BADGE_ROUTE = '../../../fagverk.html?subject=kunst#fagverkIaProgresjon';
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
    emneStatusCounts: report.emneStatusCounts,
    gates: report.gates
  };
}

export function auditKunstPhase3({ writeReport = false, checkReport = true } = {}) {
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
  const portalEntry = portal.categories.find((row) => row.id === 'kunst');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'kunst');
  const statusEntry = status.subjects.find((row) => row.id === 'kunst');
  const manifestEntry = manifest.kunst;

  assert(categories.fagSubjects.includes('kunst'), 'Kunst mangler i canonical fagliste');
  assert(portalEntry?.subjectStatus === 'materialized', 'Kunst er ikke materialisert i portalen');
  assert(portalEntry?.subjectPage === 'fagverk.html?subject=kunst', 'Kunst har feil canonical fagsiderute');
  assert(portalEntry?.badgePage === INTEGRATED_BADGE_ROUTE, 'Kunst badgePage skal etter equivalence-migrering peke til integrert Progresjon');
  assert(inventoryEntry?.schemaFamily === 'standard_canonical', 'Kunst har feil schemafamilie');
  assert(inventoryEntry?.pilot === false, 'Kunst skal være et individuelt Fase 3-fag, ikke en Fase 2-pilot');
  assert(statusEntry?.assessmentStatus === 'audited', 'Kunst har feil auditstatus');
  assert(statusEntry?.editorialStatus === 'complete', 'Kunst må stå complete etter seks kapitler og separat helhetsaudit');
  assert(statusEntry?.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Kunst har feil vedlikeholdsport');
  assert(registry.placePage?.fallbackSubjectByCategory?.kunst === 'kunst', 'Kunst-steder mangler Kunst som fagverksfallback');
  assert(manifestEntry?.emneMappings === 'kunst/emnemapping_kunst_canonical_v4_5.json', 'Kunst-manifestet peker ikke til canonical mappingregister');

  const source = loadSource(CORE, manifestEntry);
  const model = CORE.normalizeSubject({
    subjectId: 'kunst',
    categoryLabel: categories.labels.kunst,
    categoryDescription: categories.decisions?.kunst,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge,
    source
  });

  assert(model.subject.title === 'Kunst & kultur', 'Kunst har feil fagtittel');
  assert(model.subject.description.length >= 220, 'Kunst mangler eksplisitt fagbeskrivelse');
  assert(model.subject.adapter === 'standard', 'Kunst går ikke gjennom standardadapteren');
  assert(model.subject.routes.badge === INTEGRATED_BADGE_ROUTE, 'Kunst-modellen projiserer ikke integrert Progresjon som badge-route');
  assert(model.subject.routes.badge !== model.subject.routes.subject, 'Merke- og fagside kan ikke være samme mål');
  assert(isDeepStrictEqual([...model.domains].map((domain) => domain.id), DOMAIN_ORDER), 'Kunst har feil canonical fagområderekkefølge');
  assert(model.domains.every((domain) => domain.sourceKind === 'pensum_domain'), 'Kunst opprettet kunstige fagområder');
  assert(model.summary.domainCount === 6, 'Kunst skal ha seks fagområder');
  assert(model.summary.emneCount === 21, 'Kunst skal ha 21 aktive emner');
  assert(model.summary.methodCount === 21, 'Kunst skal ha 21 canonicale metoder');
  assert(model.summary.mappingCount === 21, 'Kunst skal ha én normalisert primærmapping per emne');
  assert(model.summary.hookCount === 60, 'Kunst skal ha 60 canonicale hooks');
  assert(model.chapters.length === 6, 'Kunst skal ha nøyaktig seks registrerte kapitler ved fullføring');
  assert(model.chapters[0].primaryDomainId === 'felt_institusjon', 'Første Kunst-kapittel må eies av felt_institusjon');
  assert(model.chapters[1].primaryDomainId === 'produksjon_praksis', 'Andre Kunst-kapittel må eies av produksjon_praksis');
  assert(model.chapters[2].primaryDomainId === 'estetisk_sprak_form', 'Tredje Kunst-kapittel må eies av estetisk_sprak_form');
  assert(model.chapters[3].primaryDomainId === 'makt_legitimitet', 'Fjerde Kunst-kapittel må eies av makt_legitimitet');
  assert(model.chapters[4].primaryDomainId === 'publikum_offentlighet', 'Femte Kunst-kapittel må eies av publikum_offentlighet');
  assert(model.chapters[5].primaryDomainId === 'tid_transformasjon', 'Sjette Kunst-kapittel må eies av tid_transformasjon');
  assert(model.emners.every((emne) => emne.methodIds.length >= 1), 'Kunst-emne mangler løst metode-ID');
  assert(model.emners.flatMap((emne) => emne.methodLabels).every((label) => !label.startsWith('met_kunst_')), 'Kunst har uløst metode-ID i emnekatalogen');
  assert(model.emnersById.get(HANDVERK_EMNE)?.domainId === 'produksjon_praksis', 'Materialitet og håndverk er ikke koblet til Produksjon og praksis');

  const emneIds = new Set(source.emners.map((emne) => emne.emne_id));
  const pensumEmneIds = new Set(source.pensum.domains.flatMap((domain) => domain.emne_ids || []));
  const hooks = source.fagkart.categories.flatMap((domain) => domain.topic_hooks || []);
  const hookEmneIds = new Set(hooks.flatMap((hook) => hook.emne_ids || []));
  const mappingEmneIds = new Set(explicitMappings.map((mapping) => mapping.emne_id));
  for (const [label, ids] of [['pensum', pensumEmneIds], ['fagkart', hookEmneIds], ['mappingregister', mappingEmneIds]]) {
    assert(ids.size === emneIds.size, `${label} dekker ikke alle 21 Kunst-emner`);
    assert([...ids].every((id) => emneIds.has(id)), `${label} peker til ukjent Kunst-emne`);
  }
  const methodIds = new Set(source.methods.methods.map((method) => method.method_id));
  assert(source.methods.methods.every((method) => method.canonical_status === 'canonical'), 'Kunst har ikke-canonical metode i aktiv katalog');
  assert(hooks.flatMap((hook) => hook.recommended_method_ids || []).every((id) => methodIds.has(id)), 'Kunst-hook peker til ukjent metode');
  assert(source.pensum.summary.emne_count === source.emners.length, 'Pensumsammendraget har feil emnetall');
  assert(source.pensum.summary.mapping_count === explicitMappings.length, 'Pensumsammendraget har feil mappingtall');
  assert(source.fagkart.meta.valid_emne_ids_from_source_count === source.emners.length, 'Fagkartets kildeemnetall er utdatert');
  assert(generator.canonical_inputs.emne_count === source.emners.length, 'Generatoren har feil Kunst-emnetall');
  assert(generator.canonical_inputs.mapping_count === explicitMappings.length, 'Generatoren har feil Kunst-mappingtall');

  const handverkMapping = explicitMappings.find((mapping) => mapping.emne_id === HANDVERK_EMNE);
  assert(handverkMapping?.mappings?.length >= 3, 'Materialitet og håndverk mangler flerleddet canonical mapping');
  assert(handverkMapping.primary_hooks.includes('materialvalg_som_metode'), 'Materialitet og håndverk mangler materialvalg som primærhook');
  assert(handverkMapping.mappings.every((mapping) => methodIds.has(mapping.recommended_method_ids?.[0])), 'Materialitet og håndverk har uløst mappingmetode');

  const compatibilityPage = read(P.badgePage);
  assert(compatibilityPage.includes('location.replace'), 'Kunst compatibility-side mangler eksplisitt redirect');
  assert(compatibilityPage.includes(RELATIVE_INTEGRATED_BADGE_ROUTE), 'Kunst compatibility-side peker ikke til integrert Progresjon');
  assert(!compatibilityPage.includes('id="felt"') && !compatibilityPage.includes('id="offentlig-rom"'), 'Kunst compatibility-side inneholder fortsatt legacy-teori');

  const legacyArchive = read(P.legacyArchive);
  assert(legacyArchive.includes('../../../fagverk.html?subject=kunst'), 'Kunst legacy-arkivet mangler den opprinnelige separate fagsidelenken');
  assert(legacyArchive.includes('../../../fagverk-forside.html'), 'Kunst legacy-arkivet mangler den opprinnelige fagverkforsiden');
  assert(legacyArchive.includes('id="felt"') && legacyArchive.includes('id="offentlig-rom"'), 'Kunst legacy-arkivet mangler forventet faglig kildeinnhold');

  const emneStatusCounts = Object.fromEntries([...new Set(source.emners.map((emne) => emne.status))].sort().map((value) => [value, source.emners.filter((emne) => emne.status === value).length]));
  const report = {
    schema: 'history_go_fagverk_kunst_phase3_audit_v1',
    version: '1.0.0',
    status: 'kunst_phase_3_complete_structure',
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
      registeredChapterCount: model.chapters.length,
      explicitMappingRowCount: explicitMappings.length
    },
    canonicalDomainOrder: DOMAIN_ORDER,
    domainEmneCounts: Object.fromEntries(model.domains.map((domain) => [domain.id, domain.emneIds.length])),
    emneStatusCounts,
    gates: {
      phaseThreeIndividualMaterialization: true,
      manifestFirstSourcesResolved: true,
      allKunstEmnersIntegrated: true,
      noSyntheticKunstDomains: true,
      allMethodReferencesResolved: true,
      explicitMappingAndGeneratorCountsSynchronized: true,
      handverkEmneIntegratedInExistingDomainAndHooks: true,
      kunstPlaceFallbackCorrect: true,
      badgeAndSubjectRoutesDistinct: true,
      integratedBadgeRouteActive: true,
      legacyBadgeArchivePreserved: true,
      compatibilityRedirectClean: true,
      assessmentStatusAudited: true,
      editorialStatusComplete: true,
      chapterClaimsBackedByFullAudit: true
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
    const { report } = auditKunstPhase3({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Kunst Fase 3 OK: ${report.summary.domainCount} fagområder, ${report.summary.emneCount} emner, ${report.summary.methodCount} metoder og ${report.summary.hookCount} hooks.`);
  } catch (error) {
    console.error(`Kunst Fase 3 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
