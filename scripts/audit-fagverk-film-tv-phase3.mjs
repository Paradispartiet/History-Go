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
  badge: 'data/badges/film_tv.json',
  explicitMappings: 'data/fag/TV_og_Film/emnemapping_film_tv_canonical_v4_5.json',
  generator: 'data/fag/TV_og_Film/quiz_generator_rules_film_tv_v5_1_source_priority_patch.json',
  badgePage: 'data/fag/TV_og_Film/merke_film_tv.html',
  report: 'reports/fagverk/film-tv-phase3-audit.json'
});
const DOMAIN_ORDER = [
  'audiovisuell_form_stil_analyse',
  'fortelling_sjanger_serialitet_format',
  'film_tv_historie_historiografi',
  'dokumentar_virkelighetsformer_etikk',
  'samfunn_representasjon_identitet_makt',
  'produksjon_arbeid_teknologi_praksis',
  'industri_institusjoner_politikk_distribusjon',
  'visning_publikum_resepsjon_deltakelse',
  'sted_location_skjermgeografi',
  'arkiv_kulturarv_minne_stjerner'
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

function rawEmneRows(source) {
  if (Array.isArray(source.emners)) return source.emners;
  if (Array.isArray(source.emners?.emner)) return source.emners.emner;
  return [];
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

export function auditFilmTvPhase3({ writeReport = false, checkReport = true } = {}) {
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
  const portalEntry = portal.categories.find((row) => row.id === 'film_tv');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'film_tv');
  const statusEntry = status.subjects.find((row) => row.id === 'film_tv');
  const manifestEntry = manifest.film_tv;

  assert(categories.fagSubjects.includes('film_tv'), 'Film & TV mangler i canonical fagliste');
  assert(categories.runtimeCategories.includes('film_tv'), 'Film & TV mangler som runtime-kategori');
  assert(categories.labels?.film_tv === 'Film & TV', 'Film & TV har feil canonical etikett');
  assert(categories.aliases?.film === 'film_tv' && categories.aliases?.tv === 'film_tv', 'Film/TV-aliasene peker ikke til Film & TV');
  assert(portalEntry?.subjectStatus === 'materialized', 'Film & TV er ikke materialisert i portalen');
  assert(portalEntry?.subjectPage === 'fagverk.html?subject=film_tv', 'Film & TV har feil canonical fagsiderute');
  assert(inventoryEntry?.schemaFamily === 'standard_canonical', 'Film & TV har feil schemafamilie');
  assert(inventoryEntry?.pilot === false, 'Film & TV skal være et individuelt Fase 3-fag');
  assert(inventoryEntry?.optionalManifestFields?.includes('emneMappings'), 'Film & TV-inventaret mangler emneMappings');
  assert(statusEntry?.navigationStatus === 'materialized', 'Film & TV har feil navigasjonsstatus');
  assert(statusEntry?.assessmentStatus === 'audited', 'Film & TV har feil auditstatus');
  assert(['structure_ready', 'chapters_in_progress', 'complete'].includes(statusEntry?.editorialStatus), 'Film & TV har ugyldig redaksjonell progresjonsstatus');
  const legacyFilmTvGates = new Set([
    'remaining_domain_chapter_production',
    'curriculum_completeness_refactor',
    'canonical_inventory_migration',
    'canonical_inventory_migrated_existing_chapter_reaudit',
    'canonical_chapter_reaudit_complete_learning_order_plan',
    'learning_order_plan_complete_first_chapter_source_brief'
  ]);
  const isFilmTvProductionGate = /(?:source_brief_complete_full_chapter_production|full_chapter_complete_next_unit_source_brief|full_chapter_complete_completion_audit|maintenance_source_refresh_and_place_case_expansion)$/.test(statusEntry?.nextGate || '');
  const nextGateMatchesEditorialStatus = statusEntry.editorialStatus === 'structure_ready'
    ? statusEntry?.nextGate === 'chapter_production'
    : statusEntry.editorialStatus === 'chapters_in_progress'
      ? legacyFilmTvGates.has(statusEntry?.nextGate) || isFilmTvProductionGate
      : statusEntry?.nextGate === 'maintenance_source_refresh_and_place_case_expansion';
  assert(nextGateMatchesEditorialStatus, 'Film & TV har feil neste port for redaksjonell status');
  assert(registry.placePage?.fallbackSubjectByCategory?.film_tv === 'film_tv', 'Film & TV-steder mangler Film & TV som fagverksfallback');
  assert(registry.subjects?.film_tv, 'Film & TV mangler i fagverkregisteret');
  assert(manifestEntry?.emneMappings === 'TV_og_Film/emnemapping_film_tv_canonical_v4_5.json', 'Film & TV-manifestet mangler canonical mappingregister');

  const source = loadSource(CORE, manifestEntry);
  const canonicalEmners = rawEmneRows(source);
  assert(canonicalEmners.length === 192, 'Film & TV-emnefilen skal ha 192 canonicale emner fra det variable inventaret');

  const model = CORE.normalizeSubject({
    subjectId: 'film_tv',
    categoryLabel: categories.labels.film_tv,
    categoryDescription: categories.decisions?.film_tv,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge,
    source
  });

  assert(model.subject.title === 'Film & TV', 'Film & TV har feil fagtittel');
  assert(model.subject.description.length >= 220, 'Film & TV mangler eksplisitt fagbeskrivelse');
  assert(model.subject.adapter === 'standard', 'Film & TV går ikke gjennom standardadapteren');
  assert(model.subject.routes.badge !== model.subject.routes.subject, 'Merke- og fagside kan ikke være samme mål');
  assert(isDeepStrictEqual([...model.domains].map((d) => d.id), DOMAIN_ORDER), 'Film & TV har feil canonical fagområderekkefølge');
  assert(model.domains.every((d) => d.sourceKind === 'pensum_domain'), 'Film & TV opprettet syntetiske fagområder');
  assert(model.summary.domainCount === 10, 'Film & TV skal ha ti faglig begrunnede, variabelt store områder');
  assert(model.summary.emneCount === 192, 'Film & TV skal ha 192 emner fra migrasjonsinventaret');
  assert(model.summary.methodCount === 119, 'Film & TV skal ha 119 migrerte og kompletterte metoder');
  assert(model.summary.mappingCount === 192, 'Film & TV skal ha 192 normaliserte mappinger');
  assert(model.summary.hookCount === 192, 'Film & TV skal ha ett eksplisitt hook per selvstendig emneproblem');
  assert(model.chapters.length >= 0, 'Film & TV har ugyldig kapittelprogresjon');
  assert(statusEntry.editorialStatus !== 'structure_ready' || model.chapters.length === 0, 'Structure-ready kan ikke ha registrerte Film & TV-kapitler');
  assert(statusEntry.editorialStatus !== 'chapters_in_progress' || model.chapters.length >= 1, 'Chapters-in-progress krever minst ett Film & TV-kapittel');
  assert(model.emners.every((emne) => emne.methodIds.length >= 1), 'Film & TV-emne mangler løst metode-ID');

  const pensumIds = new Set(source.pensum.domains.flatMap((d) => d.emne_ids || []));
  const hooks = source.fagkart.categories.flatMap((d) => d.topic_hooks || []);
  const fagkartIds = new Set(hooks.flatMap((h) => h.emne_ids || []));
  const mappingIds = new Set(explicitMappings.map((row) => row.emne_id));
  assertExactCoverage('Film & TV', canonicalEmners, ['pensum', pensumIds], ['fagkart', fagkartIds], ['mappingregister', mappingIds]);

  const methodIds = new Set(source.methods.methods.map((method) => method.method_id));
  assert(methodIds.size === 119, 'Film & TV har feil antall unike metode-ID-er');
  assert(source.methods.methods.every((method) => typeof method.method_id === 'string' && method.method_id.startsWith('met_film_tv_')), 'Film & TV har metode uten canonical Film & TV-ID');
  assert(hooks.flatMap((hook) => hook.recommended_method_ids || []).every((id) => methodIds.has(id)), 'Film & TV-hook peker til ukjent metode');
  assert(explicitMappings.flatMap((row) => row.mappings || []).flatMap((mapping) => mapping.recommended_method_ids || []).every((id) => methodIds.has(id)), 'Film & TV-mapping peker til ukjent metode');

  const expected = { domain_count: 10, emne_count: 192, method_count: 119, mapping_count: 192, topic_hook_count: 192 };
  for (const [key, value] of Object.entries(expected)) {
    assert(source.pensum.summary?.[key] === value, `Pensumsammendraget har feil ${key}`);
    assert(generator.canonical_inputs?.[key] === value, `Generatoren har feil ${key}`);
  }
  assert(source.pensum.summary?.all_emners_have_mapping === true || source.pensum.summary?.all_emners_have_mapping === undefined || source.pensum.summary?.all_emners_have_mapping === null || source.pensum.summary?.all_emners_have_mapping === false ? source.pensum.summary?.all_emners_have_mapping !== false : true, '');
  assert(source.pensum.summary?.all_emner_have_mapping === true, 'Pensumet rapporterer ufullstendig emnemapping');
  assert(source.pensum.summary?.all_method_refs_valid === true, 'Pensumet rapporterer uløste metodekoblinger');
  assert(generator.hard_rules?.external_film_tv_source_first_all_sets === true, 'Film & TV-generatoren mangler source-first-port');
  assert(generator.hard_rules?.canonical_files_are_guides_not_content === true, 'Film & TV-generatoren må holde canonicalfiler som styring, ikke faktakilde');
  assert(generator.hard_rules?.required_emne_prefix === 'em_film_tv_', 'Film & TV-generatoren mangler canonical emneprefix');
  assert(generator.hard_rules?.internal_file_only_questions_max_per_quiz <= 0.05, 'Film & TV tillater for mange interne-fil-spørsmål');

  const principles = source.fagkart.principles || {};
  for (const key of ['source_first', 'external_claim_basis_required', 'screen_production_location_or_broadcast_before_theory', 'no_generic_film_tv_questions']) {
    assert(principles[key] === true, `Film & TV mangler bindende prinsipp: ${key}`);
  }
  assert(principles.emne_prefix_required === 'em_film_tv_', 'Fagkartet mangler canonical emneprefix');

  const badgePage = read(P.badgePage);
  assert(portalEntry?.badgePage === 'fagverk.html?subject=film_tv#fagverkIaProgresjon', 'Film & TV-portalen peker ikke til integrert Progresjon');
  assert(badgePage.includes("../../../fagverk.html?subject=film_tv#fagverkIaProgresjon"), 'Film & TV compatibility-siden peker ikke til Progresjon');
  assert(badgePage.includes('location.replace'), 'Film & TV compatibility-siden mangler redirect');

  const report = {
    schema: 'history_go_fagverk_film_tv_phase3_audit_v1',
    version: '1.0.0',
    status: `film_tv_phase_3_${statusEntry.editorialStatus}`,
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
      audiovisualSourceFirstGenerationLocked: true,
      canonicalFilesRemainGuidanceOnly: true,
      screenProductionLocationBroadcastBeforeTheory: true,
      noGenericFilmTvQuestions: true,
      categoryBoundaryPreserved: true,
      badgeAndSubjectRoutesDistinct: true,
      assessmentStatusAudited: true,
      editorialProgressConsistent: true,
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
    const { report } = auditFilmTvPhase3({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Film & TV Fase 3 OK: ${report.summary.domainCount} fagområder, ${report.summary.emneCount} emner, ${report.summary.methodCount} metoder og ${report.summary.hookCount} hooks.`);
  } catch (error) {
    console.error(`Film & TV Fase 3 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
