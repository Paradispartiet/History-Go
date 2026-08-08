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
  badge: 'data/badges/media.json',
  explicitMappings: 'data/fag/media/emnemapping_media_canonical_v4_5.json',
  generator: 'data/fag/media/quiz_generator_rules_media_v5_1_source_priority_patch.json',
  badgePage: 'data/fag/media/merke_media.html',
  supplementPensum: 'data/fag/media/populaerkultur_som_mediefelt/populaerkulturpensum_canonical_v4_5.json',
  supplementEmners: 'data/fag/media/emner_media_populaerkultur_canonical_v4_5.json',
  supplementFagkart: 'data/fag/media/populaerkultur_som_mediefelt/fagkart_populaerkultur_canonical_v4_5.json',
  supplementMappings: 'data/fag/media/populaerkultur_som_mediefelt/emnemapping_populaerkultur_canonical_v4_5.json',
  report: 'reports/fagverk/media-phase3-audit.json'
});
const DOMAIN_ORDER = [
  'presse_redaksjoner_avishus',
  'offentlighet_ytringsfrihet_etikk',
  'kilder_kritikk_sannhet',
  'plattformer_algoritmer_distribusjon',
  'propaganda_pavirkning_informasjonskrig',
  'medieokonomi_eierskap_arbeid'
];
const SUPPLEMENT_DOMAIN_ORDER = [
  'massemedier_formater_distribusjon',
  'ikoner_kjendiser_karakterer',
  'fandom_identitet_tilhorighet',
  'internett_memer_plattformer',
  'representasjon_normer_fantasi',
  'steder_objekter_kommers_oppmerksomhet'
];
const INTEGRATED_EMNERS = Object.freeze({
  em_media_av_og_tv_produksjon: { domainId: 'presse_redaksjoner_avishus', hookId: 'redaksjon_og_desk' },
  em_media_kritikk_kommentar: { domainId: 'offentlighet_ytringsfrihet_etikk', hookId: 'pressekritikk' }
});
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
    nestedSupplement: report.nestedSupplement,
    gates: report.gates
  };
}

export function auditMediaPhase3({ writeReport = false, checkReport = true } = {}) {
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
  const portalEntry = portal.categories.find((row) => row.id === 'media');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'media');
  const statusEntry = status.subjects.find((row) => row.id === 'media');
  const manifestEntry = manifest.media;

  assert(categories.fagSubjects.includes('media'), 'Media mangler i canonical fagliste');
  assert(!categories.fagSubjects.includes('popkultur'), 'Populærkultur kan ikke være canonicalt toppfag');
  assert(portalEntry?.subjectStatus === 'materialized', 'Media er ikke materialisert i portalen');
  assert(portalEntry?.subjectPage === 'fagverk.html?subject=media', 'Media har feil canonical fagsiderute');
  assert(!portal.categories.some((row) => row.id === 'popkultur'), 'Populærkultur fikk konkurrerende portalpost');
  assert(inventoryEntry?.schemaFamily === 'standard_canonical', 'Media har feil schemafamilie');
  assert(inventoryEntry?.pilot === false, 'Media skal være et individuelt Fase 3-fag');
  assert(statusEntry?.assessmentStatus === 'audited', 'Media har feil auditstatus');
  assert(statusEntry?.editorialStatus === 'structure_ready', 'Media må stå structure_ready før kapittelproduksjon');
  assert(statusEntry?.nextGate === 'chapter_production', 'Media har feil neste port');
  assert(registry.placePage?.fallbackSubjectByCategory?.media === 'media', 'Media-steder mangler Media som fagverksfallback');
  assert(manifestEntry?.emners !== 'media/emner_media_populaerkultur_canonical_v4_5.json', 'Hovedmanifestet peker fortsatt til Populærkultur-katalogen');
  assert(manifestEntry?.emner === 'media/emner_media_canonical_v4_5.json', 'Hovedmanifestet peker ikke til canonical Media-emner');
  assert(manifestEntry?.emneMappings === 'media/emnemapping_media_canonical_v4_5.json', 'Media-manifestet mangler canonical mappingregister');
  assert(manifestEntry?.supplements?.populaerkultur_som_mediefelt?.status === 'migrated_subfield', 'Populærkultur er ikke deklarert som nested mediefelt');

  const source = loadSource(CORE, manifestEntry);
  const model = CORE.normalizeSubject({
    subjectId: 'media',
    categoryLabel: categories.labels.media,
    categoryDescription: categories.decisions?.media,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge,
    source
  });

  assert(model.subject.title === 'Media', 'Media har feil fagtittel');
  assert(model.subject.description.length >= 300, 'Media mangler eksplisitt fagbeskrivelse');
  assert(model.subject.adapter === 'standard', 'Media går ikke gjennom standardadapteren');
  assert(model.subject.routes.badge !== model.subject.routes.subject, 'Merke- og fagside kan ikke være samme mål');
  assert(isDeepStrictEqual([...model.domains].map((domain) => domain.id), DOMAIN_ORDER), 'Media har feil canonical fagområderekkefølge');
  assert(model.domains.every((domain) => domain.sourceKind === 'pensum_domain'), 'Media opprettet kunstige fagområder');
  assert(model.summary.domainCount === 6, 'Media skal ha seks hovedområder');
  assert(model.summary.emneCount === 120, 'Media skal ha 120 aktive hovedemner');
  assert(model.summary.methodCount === 163, 'Samlet Media-metodekatalog skal ha 163 metoder');
  assert(model.summary.mappingCount === 120, 'Media skal ha 120 normaliserte hovedmappinger');
  assert(model.summary.hookCount === 60, 'Media skal ha 60 hovedhooks');
  assert(model.chapters.length === 0, 'Structure-ready kan ikke late som Media-kapitler finnes');
  assert(model.emners.every((emne) => emne.methodIds.length >= 1), 'Media-emne mangler løst metode-ID');
  assert(model.emners.flatMap((emne) => emne.methodLabels).every((label) => !label.startsWith('met_media_')), 'Media har uløst metode-ID');

  const mainEmneIds = new Set(source.emners.map((row) => row.emne_id));
  const pensumIds = new Set(source.pensum.domains.flatMap((domain) => domain.emne_ids || []));
  const hooks = source.fagkart.categories.flatMap((domain) => domain.topic_hooks || []);
  const hookIds = new Set(hooks.flatMap((hook) => hook.emne_ids || []));
  const mappingIds = new Set(explicitMappings.map((row) => row.emne_id));
  assertExactCoverage('Media', source.emners, ['pensum', pensumIds], ['fagkart', hookIds], ['mappingregister', mappingIds]);
  const methodIds = new Set(source.methods.methods.map((method) => method.method_id));
  assert(methodIds.size === source.methods.methods.length, 'Media har dupliserte metode-ID-er');
  assert(source.methods.methods.every((method) => method.canonical_status === 'canonical'), 'Media har ikke-canonical metode i aktiv katalog');
  assert(hooks.flatMap((hook) => hook.recommended_method_ids || []).every((id) => methodIds.has(id)), 'Media-hook peker til ukjent metode');
  assert(explicitMappings.flatMap((row) => row.mappings || []).flatMap((mapping) => mapping.recommended_method_ids || []).every((id) => methodIds.has(id)), 'Media-mapping peker til ukjent metode');
  assert(source.pensum.domains.every((domain) => domain.method_count === new Set(domain.method_ids || []).size), 'Media-pensum har usynkronisert metodetall per område');
  const hooksById = new Map(hooks.map((hook) => [hook.id, hook]));
  assert(explicitMappings.flatMap((row) => row.mappings || []).every((mapping) => {
    const supported = new Set(hooksById.get(mapping.topic_hook)?.recommended_method_ids || []);
    return (mapping.recommended_method_ids || []).every((id) => supported.has(id));
  }), 'Media-mapping bruker metode som ikke støttes av valgt hook');
  assert(source.pensum.summary.emne_count === mainEmneIds.size, 'Pensumsammendraget har feil Media-emnetall');
  assert(source.pensum.summary.mapping_count === explicitMappings.length, 'Pensumsammendraget har feil Media-mappingtall');
  assert(generator.canonical_inputs.emne_count === source.emners.length, 'Generatoren har feil Media-emnetall');
  assert(generator.canonical_inputs.mapping_count === explicitMappings.length, 'Generatoren har feil Media-mappingtall');

  for (const [emneId, expected] of Object.entries(INTEGRATED_EMNERS)) {
    assert(model.emnersById.get(emneId)?.domainId === expected.domainId, `${emneId} har feil fagområde`);
    const mapping = explicitMappings.find((row) => row.emne_id === emneId);
    assert(mapping?.primary_hooks?.includes(expected.hookId), `${emneId} mangler forventet primærhook`);
    assert(hooks.find((hook) => hook.id === expected.hookId)?.emne_ids?.includes(emneId), `${emneId} mangler i fagkart-hook`);
  }

  const supplementPensum = json(P.supplementPensum);
  const supplementEmners = json(P.supplementEmners);
  const supplementFagkart = json(P.supplementFagkart);
  const supplementMappings = json(P.supplementMappings);
  const supplementMethods = source.methods.methods.filter((method) => method.registry_version === 'mediapensum_v4_5_populaerkultur');
  const supplementModel = CORE.normalizeSubject({
    subjectId: 'media',
    categoryLabel: 'Populærkultur som mediefelt',
    schemaFamily: 'standard_canonical',
    portalEntry,
    statusEntry,
    registry: { subjects: {}, placeLinks: {} },
    source: { pensum: supplementPensum, emners: supplementEmners, fagkart: supplementFagkart, methods: { methods: supplementMethods } }
  });
  const supplementPensumIds = new Set(supplementPensum.domains.flatMap((domain) => domain.emne_ids || []));
  const supplementHooks = supplementFagkart.categories.flatMap((domain) => domain.topic_hooks || []);
  const supplementHookIds = new Set(supplementHooks.flatMap((hook) => hook.emne_ids || []));
  const supplementMappingIds = new Set(supplementMappings.map((row) => row.emne_id));
  assertExactCoverage('Populærkultur', supplementEmners, ['pensum', supplementPensumIds], ['fagkart', supplementHookIds], ['mappingregister', supplementMappingIds]);
  assert(isDeepStrictEqual([...supplementModel.domains].map((domain) => domain.id), SUPPLEMENT_DOMAIN_ORDER), 'Populærkultur har feil nested områderekkefølge');
  assert(supplementModel.domains.every((domain) => domain.sourceKind === 'pensum_domain'), 'Populærkultur opprettet kunstige nested områder');
  assert(supplementModel.summary.domainCount === 6, 'Populærkultur skal ha seks nested områder');
  assert(supplementModel.summary.emneCount === 56, 'Populærkultur skal ha 56 nested emner');
  assert(supplementModel.summary.methodCount === 48, 'Populærkultur skal ha 48 nested metoder');
  assert(supplementModel.summary.mappingCount === 56, 'Populærkultur skal ha 56 nested mappinger');
  assert(supplementModel.summary.hookCount === 60, 'Populærkultur skal ha 60 nested hooks');
  assert(supplementModel.emners.every((emne) => emne.methodIds.length >= 1 && emne.methodLabels.length === 0), 'Populærkultur har uløst nested metodekobling');

  const badgePage = read(P.badgePage);
  assert(badgePage.includes('../../../fagverk.html?subject=media'), 'Media-merkesiden mangler separat fagsidelenke');
  assert(badgePage.includes('../../../fagverk-forside.html'), 'Media-merkesiden mangler fagverkforsiden');

  const report = {
    schema: 'history_go_fagverk_media_phase3_audit_v1',
    version: '1.0.0',
    status: 'media_phase_3_structure_ready',
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
      primaryMethodCount: source.methods.methods.filter((method) => method.registry_version === 'mediapensum_v4_5').length,
      mappingCount: model.summary.mappingCount,
      hookCount: model.summary.hookCount,
      registeredChapterCount: model.chapters.length,
      explicitMappingRowCount: explicitMappings.length
    },
    canonicalDomainOrder: DOMAIN_ORDER,
    domainEmneCounts: Object.fromEntries(model.domains.map((domain) => [domain.id, domain.emneIds.length])),
    nestedSupplement: {
      id: 'populaerkultur_som_mediefelt',
      status: manifestEntry.supplements.populaerkultur_som_mediefelt.status,
      topLevelSubject: false,
      canonicalDomainOrder: SUPPLEMENT_DOMAIN_ORDER,
      domainCount: supplementModel.summary.domainCount,
      emneCount: supplementModel.summary.emneCount,
      methodCount: supplementModel.summary.methodCount,
      mappingCount: supplementModel.summary.mappingCount,
      hookCount: supplementModel.summary.hookCount,
      domainEmneCounts: Object.fromEntries(supplementModel.domains.map((domain) => [domain.id, domain.emneIds.length]))
    },
    gates: {
      phaseThreeIndividualMaterialization: true,
      manifestPointsToMainMediaCatalog: true,
      allMainMediaEmnersIntegrated: true,
      noSyntheticMainMediaDomains: true,
      allMainMethodReferencesResolved: true,
      explicitMappingAndGeneratorCountsSynchronized: true,
      twoLateMediaEmnersIntegratedInExistingDomainsAndHooks: true,
      popularCulturePreservedAsCompleteNestedField: true,
      noCompetingPopularCultureTopSubject: true,
      mediaPlaceFallbackCorrect: true,
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
  return { report, model, supplementModel };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditMediaPhase3({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Media Fase 3 OK: ${report.summary.domainCount} hovedområder, ${report.summary.emneCount} hovedemner og ${report.nestedSupplement.emneCount} nested Populærkultur-emner.`);
  } catch (error) {
    console.error(`Media Fase 3 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
