#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditRepository as auditGeneralRepository } from './audit-fagverk-general-engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = Object.freeze({
  manifest: 'data/fag/fag_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/musikk-subject-audit.json'
});

const absolute = (relativePath) => path.join(ROOT, relativePath);
const read = (relativePath) => fs.readFileSync(absolute(relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function resolveFagPointer(pointer) {
  assert(typeof pointer === 'string' && pointer.trim(), `Ugyldig fagfilpeker: ${JSON.stringify(pointer)}`);
  const resolved = path.posix.normalize(path.posix.join('data/fag', pointer));
  assert(resolved.startsWith('data/fag/'), `Fagfil peker utenfor data/fag: ${pointer}`);
  return resolved;
}

function resolveRelativePointer(baseFile, pointer) {
  assert(typeof pointer === 'string' && pointer.trim(), `${baseFile}: tom relativ peker`);
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(baseFile), pointer));
  assert(resolved.startsWith('data/fag/'), `${baseFile}: peker utenfor data/fag: ${pointer}`);
  return resolved;
}

function loadScientificPackage(manifestEntry) {
  const packagePath = resolveFagPointer(manifestEntry.scientificPackage);
  const scientificPackage = readJson(packagePath);
  const indexPath = resolveRelativePointer(packagePath, scientificPackage.active_scientific_package);
  const index = readJson(indexPath);
  const domainCatalogPath = resolveRelativePointer(indexPath, index.files.domain_catalog);
  const methodsPath = resolveRelativePointer(indexPath, index.files.method_protocols);
  const modulePaths = index.files.canonical_modules.map((pointer) => resolveRelativePointer(indexPath, pointer));
  return {
    packagePath,
    scientificPackage,
    indexPath,
    index,
    domainCatalogPath,
    domainCatalog: readJson(domainCatalogPath),
    methodsPath,
    methods: readJson(methodsPath),
    modulePaths,
    modules: modulePaths.map(readJson)
  };
}

function buildReport({ source, generalRow }) {
  const topics = source.modules.flatMap((module) => module.topics || []);
  const blueprints = source.modules.flatMap((module) => module.question_blueprints || []);
  const canonicalDomainOrder = source.domainCatalog.domains.map((domain) => domain.domain_id);
  return {
    schema: 'history_go_fagverk_musikk_subject_audit_v1',
    version: '1.0.0',
    status: 'phase_3_musikk_structure_ready',
    generatedFrom: {
      manifest: PATHS.manifest,
      portal: PATHS.portal,
      inventory: PATHS.inventory,
      status: PATHS.status,
      registry: PATHS.registry,
      scientificPackage: source.packagePath,
      scientificIndex: source.indexPath,
      domainCatalog: source.domainCatalogPath,
      methodProtocols: source.methodsPath,
      modules: source.modulePaths,
      report: PATHS.report
    },
    subject: {
      id: 'musikk',
      title: source.index.subject_title,
      schemaFamily: 'standard_canonical',
      adapter: generalRow.adapter,
      subjectPage: generalRow.subjectPage,
      assessmentStatus: generalRow.assessmentStatus,
      editorialStatus: generalRow.editorialStatus,
      scientificAuthority: source.index.legacy_compatibility.scientific_authority,
      sourceRevision: source.index.source_revision
    },
    summary: {
      domainCount: canonicalDomainOrder.length,
      emneCount: topics.length,
      methodCount: source.methods.protocols.length,
      questionBlueprintCount: blueprints.length,
      sourceDossierTopicCount: source.index.summary.source_dossier_topic_count,
      verifiedScholarlySourceRecordCount: source.index.summary.verified_scholarly_source_record_count,
      chapterCount: generalRow.chapterCount,
      placeCount: generalRow.placeCount
    },
    canonicalDomainOrder,
    authorityBoundary: {
      legacyRole: source.index.legacy_compatibility.role,
      legacyModuleRole: source.index.legacy_compatibility.module_inventory_role,
      scientificAuthority: source.index.legacy_compatibility.scientific_authority,
      scenekunstSeparateTopLevelSubject: source.index.discipline_boundary.scenekunst_is_separate_top_level_subject,
      performanceStudyInScope: source.index.discipline_boundary.music_performance_study_is_in_scope
    },
    gates: {
      manifestFirstScientificPackage: true,
      activeScientificIndexResolved: true,
      canonicalDomainsResolved: true,
      canonicalTopicsResolved: true,
      canonicalMethodsResolved: true,
      questionBlueprintsResolved: true,
      allTopicDomainRefsResolved: true,
      allTopicMethodRefsResolved: true,
      legacyNotScientificAuthority: true,
      scenekunstBoundaryPreserved: true,
      noGeneratedChapters: true,
      bibliographicBasisNotPromotedToFulltextEvidence: true
    }
  };
}

export function auditRepository({ writeReport = false, checkReport = true } = {}) {
  const manifest = readJson(PATHS.manifest);
  const portal = readJson(PATHS.portal);
  const inventory = readJson(PATHS.inventory);
  const status = readJson(PATHS.status);
  const registry = readJson(PATHS.registry);
  const manifestEntry = manifest.musikk;
  const portalEntry = portal.categories.find((item) => item.id === 'musikk');
  const inventoryEntry = inventory.subjects.find((item) => item.id === 'musikk');
  const statusEntry = status.subjects.find((item) => item.id === 'musikk');

  assert(manifestEntry && portalEntry && inventoryEntry && statusEntry, 'Musikk mangler manifest, portal, inventory eller status');
  assert(manifestEntry.scientificPackage === 'musikk/scientific_package.json', 'Musikk må peke manifest-first til scientific_package.json');
  assert(inventoryEntry.optionalManifestFields.includes('scientificPackage'), 'Musikk-inventaret må deklarere scientificPackage');
  assert(portalEntry.subjectStatus === 'materialized', 'Musikk må være materialized i portalen');
  assert(portalEntry.subjectPage === 'fagverk.html?subject=musikk', 'Musikk må bruke canonical subjectPage');
  assert(statusEntry.navigationStatus === 'materialized', 'Musikk navigationStatus må være materialized');
  assert(statusEntry.assessmentStatus === 'audited', 'Musikk assessmentStatus må være audited');
  assert(statusEntry.editorialStatus === 'structure_ready', 'Musikk skal være structure_ready før redigerte kapitler finnes');

  const source = loadScientificPackage(manifestEntry);
  assert(source.scientificPackage.subject_id === 'musikk', 'scientific_package.json har feil subject_id');
  assert(source.scientificPackage.status === 'canonical_scientific_subject', 'scientific_package.json er ikke canonical_scientific_subject');
  assert(source.index.subject_id === 'musikk', 'Aktiv musikkvitenskapelig indeks har feil subject_id');
  assert(source.index.status === 'canonical_scientific_subject', 'Aktiv musikkvitenskapelig indeks er ikke canonical');
  assert(source.index.legacy_compatibility.scientific_authority === 'this_package', 'Legacy kan ikke være vitenskapelig autoritet');
  assert(source.index.legacy_compatibility.module_inventory_role === 'legacy_source_inventory_not_active_scientific_authority', 'Legacy-moduler har feil autoritetsrolle');
  assert(source.index.discipline_boundary.scenekunst_is_separate_top_level_subject === true, 'Scenekunstgrensen må bevares');
  assert(source.index.discipline_boundary.music_performance_study_is_in_scope === true, 'Musikkframføringsstudier må være i Musikk');

  const domains = source.domainCatalog.domains || [];
  const domainIds = new Set(domains.map((domain) => domain.domain_id));
  const topics = source.modules.flatMap((module) => module.topics || []);
  const topicIds = topics.map((topic) => topic.emne_id);
  const topicIdSet = new Set(topicIds);
  const blueprints = source.modules.flatMap((module) => module.question_blueprints || []);
  const methodIds = new Set((source.methods.protocols || []).map((method) => method.method_id));

  assert(domains.length === 8, `Musikk: forventet 8 domener, fikk ${domains.length}`);
  assert(source.modules.length === 8, `Musikk: forventet 8 canonical modules_v2-filer, fikk ${source.modules.length}`);
  assert(topics.length === 48 && topicIdSet.size === 48, `Musikk: forventet 48 unike emner, fikk ${topics.length}/${topicIdSet.size}`);
  assert(blueprints.length === 48, `Musikk: forventet 48 spørsmålsplaner, fikk ${blueprints.length}`);
  assert(methodIds.size === 18, `Musikk: forventet 18 metodeprotokoller, fikk ${methodIds.size}`);
  assert(source.index.summary.source_dossier_topic_count === 48, 'Musikk: kildedossierene dekker ikke alle 48 temaer');
  assert(source.index.summary.verified_scholarly_source_record_count === 156, 'Musikk: forventet 156 verifiserte forskningskilder etter #4526');

  for (const module of source.modules) {
    assert(domainIds.has(module.domain?.domain_id), `${module.domain?.domain_id}: modules_v2-domene finnes ikke i domain_catalog_v2`);
    for (const topic of module.topics || []) {
      assert(domainIds.has(topic.domain_id), `${topic.emne_id}: ukjent domain_id ${topic.domain_id}`);
      for (const methodId of topic.method_protocol_ids || []) assert(methodIds.has(methodId), `${topic.emne_id}: ukjent metodeprotokoll ${methodId}`);
    }
  }
  for (const blueprint of blueprints) assert(topicIdSet.has(blueprint.emne_id), `${blueprint.blueprint_id}: ukjent emne ${blueprint.emne_id}`);

  const registryChapters = registry.subjects?.musikk?.chapters || [];
  assert(registryChapters.length === 0, 'Materialiseringsbatchen kan ikke generere Musikk-kapitler uten fulltekstbasert claim-evidens');

  const general = auditGeneralRepository({ writeReport: false, checkReport: false });
  const generalRow = general.materializedRows.find((row) => row.id === 'musikk');
  assert(generalRow, 'Generell Fagverksmotor materialiserer ikke Musikk');
  assert(generalRow.domainCount === 8, `Generell motor bruker feil Musikk-domener: ${generalRow.domainCount}`);
  assert(generalRow.emneCount === 48, `Generell motor bruker feil Musikk-emner: ${generalRow.emneCount}`);
  assert(generalRow.methodCount === 18, `Generell motor bruker feil Musikk-metoder: ${generalRow.methodCount}`);
  assert(generalRow.mappingCount === 48, `Generell motor bruker feil Musikk-mappings: ${generalRow.mappingCount}`);
  assert(generalRow.chapterCount === 0, 'Musikk skal ikke ha genererte kapitler i fase 3');

  const report = buildReport({ source, generalRow });
  if (writeReport) {
    fs.mkdirSync(path.dirname(absolute(PATHS.report)), { recursive: true });
    fs.writeFileSync(absolute(PATHS.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) {
    const committed = readJson(PATHS.report);
    assert(isDeepStrictEqual(committed, report), `${PATHS.report} er utdatert. Kjør node scripts/audit-fagverk-musikk.mjs --write-report`);
  }
  return { report, source, generalRow };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditRepository({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Fagverk Musikk OK: ${result.report.summary.domainCount} domener, ${result.report.summary.emneCount} emner og ${result.report.summary.methodCount} metoder fra aktiv vitenskapelig pakke.`);
  } catch (error) {
    console.error(`Fagverk Musikk FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
