#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { composeNaturFinal } from './natur-final-phase-compose.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PATHS = Object.freeze({
  html: 'fagverk.html',
  core: 'js/fagverk-subject-core.js',
  model: 'js/fagverk-subject-model.js',
  page: 'js/fagverk.js',
  categories: 'data/categories/category_contract.json',
  manifest: 'data/fag/fag_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/general-engine-audit.json'
});

function absolute(relativePath) {
  return path.join(ROOT, relativePath);
}

function read(relativePath) {
  return fs.readFileSync(absolute(relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadCore() {
  const sandbox = { console };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read(PATHS.core), sandbox, { filename: PATHS.core });
  assert(sandbox.HGFagverkSubjectCore, 'fagverk-subject-core.js eksponerer ikke HGFagverkSubjectCore');
  return sandbox.HGFagverkSubjectCore;
}

function optionalJson(relativePath) {
  return fs.existsSync(absolute(relativePath)) ? readJson(relativePath) : null;
}

function resolveRelativeFagPointer(basePath, pointer) {
  assert(typeof pointer === 'string' && pointer.trim(), `${basePath}: tom vitenskapelig fagpeker`);
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(basePath), pointer));
  assert(resolved.startsWith('data/fag/'), `${basePath}: vitenskapelig fagpeker går utenfor data/fag: ${pointer}`);
  return resolved;
}

function buildScientificSource(CORE, { index, domainCatalog, modules, methodProtocols }) {
  const topics = modules.flatMap((module) => CORE.list(module?.topics));
  const topicByDomain = new Map();
  for (const topic of topics) {
    const domainId = CORE.text(topic?.domain_id);
    if (!topicByDomain.has(domainId)) topicByDomain.set(domainId, []);
    topicByDomain.get(domainId).push(topic);
  }

  const domains = CORE.list(domainCatalog?.domains).map((domain) => {
    const domainId = CORE.text(domain?.domain_id);
    const domainTopics = topicByDomain.get(domainId) || [];
    return {
      ...domain,
      emne_ids: domainTopics.map((topic) => topic.emne_id),
      method_ids: CORE.unique(domainTopics.flatMap((topic) => CORE.list(topic?.method_protocol_ids)))
    };
  });

  const emners = topics.map((topic) => ({
    ...topic,
    subject_id: index.subject_id,
    definition: topic.evidence_focus,
    why_it_matters: topic.research_question,
    key_questions: topic.research_question ? [topic.research_question] : [],
    method_ids: CORE.list(topic.method_protocol_ids),
    conflicts: topic.topic_specific_inference_limit ? [topic.topic_specific_inference_limit] : [],
    analysis_axes: CORE.list(topic.claim_type_ids),
    status: 'active'
  }));

  const methods = {
    methods: CORE.list(methodProtocols?.protocols).map((method) => ({
      ...method,
      title: method.label,
      data_forms: CORE.list(method.compatible_evidence),
      limitations: CORE.unique([
        ...CORE.list(method.validity_threats),
        method.forbidden_overreach
      ]),
      emne_ids: topics
        .filter((topic) => CORE.list(topic?.method_protocol_ids).includes(method.method_id))
        .map((topic) => topic.emne_id)
    }))
  };

  return {
    pensum: {
      subject_id: index.subject_id,
      subject_title: index.subject_title,
      scope: index.scope,
      purpose: 'Canonical vitenskapelig fagstruktur fra aktiv musikkvitenskapelig pakke.',
      domain_order: domains.map((domain) => domain.domain_id),
      domains
    },
    emners,
    fagkart: {
      subject_id: index.subject_id,
      subject_title: index.subject_title,
      status: index.status
    },
    methods
  };
}

function loadScientificSource(CORE, manifestEntry) {
  const packagePath = CORE.resolveManifestPointer(manifestEntry.scientificPackage);
  const scientificPackage = readJson(packagePath);
  const indexPath = resolveRelativeFagPointer(packagePath, scientificPackage.active_scientific_package);
  const index = readJson(indexPath);
  const domainCatalogPath = resolveRelativeFagPointer(indexPath, index?.files?.domain_catalog);
  const methodProtocolsPath = resolveRelativeFagPointer(indexPath, index?.files?.method_protocols);
  const modulePaths = CORE.list(index?.files?.canonical_modules).map((pointer) => resolveRelativeFagPointer(indexPath, pointer));
  assert(modulePaths.length > 0, `${indexPath}: mangler canonical_modules`);
  return buildScientificSource(CORE, {
    index,
    domainCatalog: readJson(domainCatalogPath),
    modules: modulePaths.map(readJson),
    methodProtocols: readJson(methodProtocolsPath)
  });
}

function loadSubjectSource(CORE, manifestEntry) {
  if (CORE.text(manifestEntry?.scientificPackage)) {
    const packagePath = CORE.resolveManifestPointer(manifestEntry.scientificPackage);
    const scientificPackage = readJson(packagePath);
    if (CORE.text(scientificPackage?.active_scientific_package)) return loadScientificSource(CORE, manifestEntry);
  }
  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const relativePath = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(absolute(relativePath)), `mangler ${field} ${relativePath}`);
    source[field === 'emner' ? 'emners' : field] = readJson(relativePath);
  }
  return source;
}

function validateRuntimeSurface({ html, coreSource, modelSource, pageSource }) {
  const orderedScripts = [PATHS.core, PATHS.model, PATHS.page];
  let previous = -1;
  for (const scriptPath of orderedScripts) {
    const token = `src="${scriptPath}"`;
    const index = html.indexOf(token);
    assert(index > previous, `${PATHS.html} må laste ${orderedScripts.join(' → ')} i riktig rekkefølge`);
    previous = index;
  }
  assert(!html.includes('js/politikk-fag-model.js'), 'Fagsiden laster fortsatt politikkspesifikk subject-modell');
  assert(!html.includes('js/fagverk-canonical-integration.js'), 'Fagsiden laster fortsatt politikkspesifikk canonical-integrasjon');
  assert(!html.includes('Politikkmerket'), 'Fagsiden har hardkodet politikkmerke i HTML');
  assert(!html.includes('Politikk og samfunn'), 'Fagsiden har hardkodet politikktittel i HTML');
  assert(!pageSource.includes("|| 'politikk'"), 'Fagsiden har politikkfallback i subject-resolveren');
  assert(!pageSource.includes('HGPolitikkFagModel'), 'Den generelle rendereren avhenger av HGPolitikkFagModel');
  assert(!modelSource.includes('politikk_runtime_manifest'), 'Den generelle loaderen peker til politikkmanifest');
  assert(modelSource.includes('scientificPackage'), 'Den generelle loaderen mangler manifestert scientificPackage-støtte');
  assert(modelSource.includes('canonical_modules'), 'Den generelle loaderen mangler canonical modules_v2-støtte');
  assert(coreSource.includes('resolveCanonicalSubjectId'), 'Core mangler streng canonical subject-resolver');
  assert(coreSource.includes('resolveManifestPointer'), 'Core mangler manifest-first filresolver');
  assert(coreSource.includes('normalizeSubject'), 'Core mangler normalisert fagmodell');
}

export function buildGeneralEngineReport({ materializedRows, inventory }) {
  return {
    schema: 'history_go_fagverk_general_engine_audit_v1',
    version: '1.0.0',
    status: 'phase_1_general_engine',
    generatedFrom: {
      categories: PATHS.categories,
      manifest: PATHS.manifest,
      portal: PATHS.portal,
      inventory: PATHS.inventory,
      status: PATHS.status,
      registry: PATHS.registry,
      html: PATHS.html,
      core: PATHS.core,
      model: PATHS.model,
      page: PATHS.page
    },
    summary: {
      materializedSubjectCount: materializedRows.length,
      materializedSubjects: materializedRows.map((row) => row.id),
      adapterFamiliesExercised: [...new Set(materializedRows.map((row) => row.schemaFamily))].sort(),
      politicsFallbacks: 0,
      subjectPageLegacyDependencies: 0
    },
    materializedSubjects: materializedRows,
    remainingPoliticsSpecificRuntimeFiles: inventory.migrationDebt?.politicsSpecificRuntimeFiles || []
  };
}

export function auditRepository({ writeReport = false, checkReport = true } = {}) {
  const html = read(PATHS.html);
  const coreSource = read(PATHS.core);
  const modelSource = read(PATHS.model);
  const pageSource = read(PATHS.page);
  validateRuntimeSurface({ html, coreSource, modelSource, pageSource });

  const CORE = loadCore();
  const categories = readJson(PATHS.categories);
  const manifest = readJson(PATHS.manifest);
  const portal = readJson(PATHS.portal);
  const inventory = readJson(PATHS.inventory);
  const status = readJson(PATHS.status);
  const registry = readJson(PATHS.registry);
  const portalById = new Map(portal.categories.map((item) => [item.id, item]));
  const inventoryById = new Map(inventory.subjects.map((item) => [item.id, item]));
  const statusById = new Map(status.subjects.map((item) => [item.id, item]));

  assert(!inventory.migrationDebt?.politicsSpecificRuntimeFiles?.includes(PATHS.page), 'js/fagverk.js kan ikke stå som politikkspesifikk migreringsgjeld etter generalisering');
  assert(!inventory.migrationDebt?.politicsSpecificRuntimeFiles?.includes(PATHS.html), 'fagverk.html kan ikke stå som politikkspesifikk migreringsgjeld etter generalisering');

  const materializedRows = [];
  for (const subjectId of categories.fagSubjects) {
    const portalEntry = portalById.get(subjectId);
    const inventoryEntry = inventoryById.get(subjectId);
    const baseStatusEntry = statusById.get(subjectId);
    assert(portalEntry && inventoryEntry && baseStatusEntry, `${subjectId}: mangler portal, inventory eller status`);
    assert(portalEntry.subjectStatus === baseStatusEntry.navigationStatus, `${subjectId}: status er usynkronisert`);

    if (portalEntry.subjectStatus !== 'materialized') {
      assert(baseStatusEntry.editorialStatus === 'not_started', `${subjectId}: planned fag kan ikke være structure_ready`);
      continue;
    }

    assert(baseStatusEntry.assessmentStatus === 'audited', `${subjectId}: materialized fag må være audited etter fase 1`);
    assert(['structure_ready', 'chapters_in_progress', 'complete', 'expanded_and_audited'].includes(baseStatusEntry.editorialStatus), `${subjectId}: materialized fag mangler strukturell ferdigstatus`);
    assert(portalEntry.subjectPage === `fagverk.html?subject=${subjectId}`, `${subjectId}: ugyldig canonical subjectPage`);
    assert(portalEntry.badgePage, `${subjectId}: mangler merkesidelenke`);

    const manifestEntry = manifest[subjectId];
    const source = loadSubjectSource(CORE, manifestEntry);
    let effectiveSource = source;
    let effectiveRegistry = registry;
    let effectiveStatusEntry = baseStatusEntry;
    if (subjectId === 'natur') {
      const composed = composeNaturFinal({
        pensum: source.pensum,
        emners: source.emners,
        methodsDoc: source.methods,
        fagkart: source.fagkart,
        registry,
        statusEntry: baseStatusEntry
      });
      effectiveSource = {
        pensum: composed.pensum,
        emners: composed.emners,
        fagkart: composed.fagkart,
        methods: composed.methodsDoc
      };
      effectiveRegistry = composed.registry;
      effectiveStatusEntry = composed.statusEntry;
    }
    const badge = optionalJson(`data/badges/${subjectId}.json`);
    const normalized = CORE.normalizeSubject({
      subjectId,
      categoryLabel: categories.labels?.[subjectId],
      categoryDescription: categories.decisions?.[subjectId],
      schemaFamily: inventoryEntry.schemaFamily,
      manifestEntry,
      portalEntry,
      inventoryEntry,
      statusEntry: effectiveStatusEntry,
      registry: effectiveRegistry,
      badge,
      source: effectiveSource
    });

    assert(normalized.subject.id === subjectId, `${subjectId}: normalisert subject-id er feil`);
    assert(normalized.subject.routes.badge === portalEntry.badgePage, `${subjectId}: merkesiden løses ikke gjennom portalregisteret`);
    assert(normalized.domains.length > 0, `${subjectId}: ingen normaliserte fagområder`);
    assert(normalized.emners.length > 0, `${subjectId}: ingen normaliserte emner`);
    assert(normalized.methods.length > 0, `${subjectId}: ingen normaliserte metoder`);
    for (const emne of normalized.emners) {
      assert(normalized.domainsById.has(emne.domainId), `${subjectId}/${emne.id}: ukjent fagområde ${emne.domainId}`);
      for (const methodId of emne.methodIds) assert(normalized.methodsById.has(methodId), `${subjectId}/${emne.id}: ukjent metode ${methodId}`);
    }
    for (const chapter of normalized.chapters) {
      if (chapter.primaryDomainId) assert(normalized.domainsById.has(chapter.primaryDomainId), `${subjectId}/${chapter.id}: ukjent primært fagområde ${chapter.primaryDomainId}`);
      for (const emneId of chapter.emneIds) assert(normalized.emnersById.has(emneId), `${subjectId}/${chapter.id}: ukjent emne ${emneId}`);
    }

    if (subjectId === 'natur') {
      assert(effectiveStatusEntry.assessmentStatus === 'audited', 'Natur v5.3 må være audited i general-engine');
      assert(effectiveStatusEntry.editorialStatus === 'complete', 'Natur v5.3 må være complete i general-engine');
      assert(normalized.summary.domainCount === 12, `Natur v5.3: forventet 12 fagområder, fikk ${normalized.summary.domainCount}`);
      assert(normalized.summary.emneCount === 77, `Natur v5.3: forventet 77 emner, fikk ${normalized.summary.emneCount}`);
      assert(normalized.summary.methodCount === 51, `Natur v5.3: forventet 51 metoder, fikk ${normalized.summary.methodCount}`);
      assert(normalized.summary.mappingCount === 77, `Natur v5.3: forventet 77 mappings, fikk ${normalized.summary.mappingCount}`);
      assert(normalized.summary.hookCount === 136, `Natur v5.3: forventet 136 hooks, fikk ${normalized.summary.hookCount}`);
      assert(normalized.chapters.length === 12, `Natur v5.3: forventet 12 kapitler, fikk ${normalized.chapters.length}`);
    }

    materializedRows.push({
      id: subjectId,
      schemaFamily: inventoryEntry.schemaFamily,
      adapter: normalized.subject.adapter,
      domainCount: normalized.summary.domainCount,
      emneCount: normalized.summary.emneCount,
      methodCount: normalized.summary.methodCount,
      mappingCount: normalized.summary.mappingCount,
      hookCount: normalized.summary.hookCount,
      chapterCount: normalized.chapters.length,
      placeCount: normalized.places.length,
      badgePage: normalized.subject.routes.badge,
      subjectPage: normalized.subject.routes.subject,
      assessmentStatus: effectiveStatusEntry.assessmentStatus,
      editorialStatus: effectiveStatusEntry.editorialStatus
    });
  }

  const politics = materializedRows.find((row) => row.id === 'politikk');
  assert(politics, 'Politikk må fortsatt være materialisert gjennom den generelle motoren');
  assert(politics.domainCount === 13, `Politikk: forventet 13 fagområder, fikk ${politics.domainCount}`);
  assert(politics.emneCount === 123, `Politikk: forventet 123 emner, fikk ${politics.emneCount}`);
  assert(politics.chapterCount >= 2, 'Politikk: ferdigskrevne kapitler falt ut under migrering');
  const politicsModel = (() => {
    const portalEntry = portalById.get('politikk');
    const inventoryEntry = inventoryById.get('politikk');
    const statusEntry = statusById.get('politikk');
    const manifestEntry = manifest.politikk;
    const source = loadSubjectSource(CORE, manifestEntry);
    return CORE.normalizeSubject({ subjectId: 'politikk', categoryLabel: categories.labels.politikk, categoryDescription: categories.decisions.politikk, schemaFamily: inventoryEntry.schemaFamily, manifestEntry, portalEntry, inventoryEntry, statusEntry, registry, badge: optionalJson('data/badges/politikk.json'), source });
  })();
  assert(politicsModel.chapters.every((chapter) => chapter.primaryDomainId), 'Politikk: alle materialiserte kapitler må ha eksplisitt primært fagområde i registeret');

  const report = buildGeneralEngineReport({ materializedRows, inventory });
  if (writeReport) {
    fs.mkdirSync(path.dirname(absolute(PATHS.report)), { recursive: true });
    fs.writeFileSync(absolute(PATHS.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) {
    const committed = readJson(PATHS.report);
    assert(isDeepStrictEqual(committed, report), `${PATHS.report} er utdatert. Kjør node scripts/audit-fagverk-general-engine.mjs --write-report`);
  }
  return { report, materializedRows };
}

function main() {
  const args = new Set(process.argv.slice(2));
  try {
    const result = auditRepository({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Fagverk fase 1 OK: ${result.materializedRows.length} materialiserte fag bruker generell motor uten politikkfallback.`);
  } catch (error) {
    console.error(`Fagverk fase 1 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
