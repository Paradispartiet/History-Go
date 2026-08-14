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
  badge: 'data/badges/filosofi.json',
  badgePage: 'data/fag/filosofi/merke_filosofi.html',
  concepts: 'data/fag/filosofi/begreper_filosofi_canonical_v2.json',
  thinkers: 'data/fag/filosofi/teoretikere_filosofi_canonical_v2.json',
  report: 'reports/fagverk/filosofi-phase3-audit.json'
});
const DOMAIN_ORDER = [
  'argumentasjon_logikk',
  'erkjennelse_sannhet',
  'metafysikk_virkelighet',
  'sinn_bevissthet_identitet',
  'etikk_moralpsykologi',
  'politisk_filosofi_rettferdighet',
  'sosial_filosofi_makt',
  'estetikk_fortolkning',
  'vitenskapsfilosofi',
  'teknologi_ai',
  'eksistens_fenomenologi',
  'miljo_dyr_klima',
  'globale_tradisjoner'
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

export function auditFilosofiPhase3({ writeReport = false, checkReport = true } = {}) {
  const CORE = loadCore();
  const categories = json(P.categories);
  const manifest = json(P.manifest);
  const portal = json(P.portal);
  const inventory = json(P.inventory);
  const status = json(P.status);
  const registry = json(P.registry);
  const badge = json(P.badge);
  const concepts = json(P.concepts);
  const thinkers = json(P.thinkers);
  const portalEntry = portal.categories.find((row) => row.id === 'filosofi');
  const inventoryEntry = inventory.subjects.find((row) => row.id === 'filosofi');
  const statusEntry = status.subjects.find((row) => row.id === 'filosofi');
  const manifestEntry = manifest.filosofi;

  assert(categories.fagSubjects.includes('filosofi'), 'Filosofi mangler i canonical fagliste');
  assert(categories.runtimeCategories.includes('filosofi'), 'Filosofi mangler som runtime-kategori');
  assert(categories.labels?.filosofi === 'Filosofi', 'Filosofi har feil canonical etikett');
  assert(categories.aliases?.philosophy === 'filosofi', 'Philosophy-aliaset peker ikke til Filosofi');
  assert(portalEntry?.subjectStatus === 'materialized', 'Filosofi er ikke materialisert i portalen');
  assert(portalEntry?.subjectPage === 'fagverk.html?subject=filosofi', 'Filosofi har feil canonical fagsiderute');
  assert(inventoryEntry?.schemaFamily === 'foundation_v1', 'Filosofi har feil schemafamilie');
  assert(inventoryEntry?.pilot === false, 'Filosofi skal være individuelt Fase 3-fag, ikke pilot');
  assert(statusEntry?.assessmentStatus === 'audited', 'Filosofi har feil auditstatus');
  const registryChapterCount = (registry.subjects?.filosofi?.chapters || []).length;
  const completion = json('data/fagverk/filosofi/filosofi_completion_v1.json');
  const expectedEditorialStatus = completion.complete_ready ? 'complete' : registryChapterCount === 13 ? 'expanded_and_audited' : registryChapterCount > 0 ? 'chapters_in_progress' : 'structure_ready';
  const expectedNextGate = completion.complete_ready ? 'maintenance_source_refresh_and_place_case_expansion' : registryChapterCount === 13 ? 'university_depth_article_by_article_review' : 'chapter_production';
  assert(statusEntry?.editorialStatus === expectedEditorialStatus, `Filosofi har feil editorial status: ${statusEntry?.editorialStatus} != ${expectedEditorialStatus}`);
  assert(statusEntry?.nextGate === expectedNextGate, `Filosofi har feil neste port: ${statusEntry?.nextGate} != ${expectedNextGate}`);
  assert(registry.placePage?.fallbackSubjectByCategory?.filosofi === 'filosofi', 'Filosofi-steder mangler Filosofi som fagverksfallback');

  const source = {};
  for (const field of ['pensum', 'emner', 'fagkart', 'methods']) {
    const relativePath = CORE.resolveManifestPointer(manifestEntry[field]);
    assert(fs.existsSync(abs(relativePath)), `Filosofi mangler ${field}: ${relativePath}`);
    source[field === 'emner' ? 'emners' : field] = json(relativePath);
  }
  assert(source.fagkart.registries?.concepts === 'begreper_filosofi_canonical_v2.json', 'Fagkartet peker ikke til canonical begrepsregister');
  assert(source.fagkart.registries?.thinkers === 'teoretikere_filosofi_canonical_v2.json', 'Fagkartet peker ikke til canonical teoretikerregister');

  const model = CORE.normalizeSubject({
    subjectId: 'filosofi',
    categoryLabel: categories.labels.filosofi,
    categoryDescription: categories.decisions?.filosofi,
    schemaFamily: inventoryEntry.schemaFamily,
    manifestEntry,
    portalEntry,
    inventoryEntry,
    statusEntry,
    registry,
    badge,
    source
  });

  assert(model.subject.title === 'Filosofi', 'Filosofi har feil fagtittel');
  assert(model.subject.description.length >= 120, 'Filosofi mangler eksplisitt fagbeskrivelse');
  assert(model.subject.adapter === 'standard', 'Foundation-pakken skal gå gjennom standardadapteren');
  assert(model.subject.routes.badge === portalEntry.badgePage, 'Filosofi-merkesiden løses ikke gjennom portalen');
  assert(model.subject.routes.badge !== model.subject.routes.subject, 'Merke- og fagside kan ikke være samme mål');
  const modelDomainIds = new Set(model.domains.map((domain) => domain.id));
  assert(modelDomainIds.size === DOMAIN_ORDER.length && DOMAIN_ORDER.every((id) => modelDomainIds.has(id)), 'Filosofi har feil source-definert fagområdesett');
  assert(model.summary.domainCount === 13, 'Filosofi skal ha tretten fagområder');
  assert(model.summary.emneCount === 54, 'Filosofi skal ha 54 aktive emner');
  assert(model.summary.methodCount === 27, 'Filosofi skal ha 27 canonicale metoder');
  assert(model.summary.mappingCount === 54, 'Filosofi skal ha én normalisert mapping per emne');
  assert(model.summary.hookCount === 37, 'Filosofi skal ha 37 canonicale hooks');
  assert(model.chapters.length === registryChapterCount, 'Filosofi-modellen og registry er uenige om kapitteltall');
  assert(model.chapters.length <= 13, 'Filosofi kan ikke ha flere enn 13 canonicale kapitler');
  if (expectedEditorialStatus === 'complete') assert(model.chapters.length === 13, 'Complete Filosofi krever 13/13 kapitler');
  assert(model.domains.every((domain) => domain.sourceKind === 'fagkart_category'), 'Pensummoduler ble feilaktig renderer-fagområder');
  assert(source.pensum.modules.length === 13, 'Filosofi skal bevare tretten pensummoduler som progresjonslag');
  assert(source.emners.length === 54 && source.emners.every((emne) => emne.status === 'active'), 'Filosofi har feil aktiv emnekatalog');
  assert(source.methods.methods.length === 27 && source.methods.methods.every((method) => method.canonical_status === 'canonical'), 'Filosofi har feil canonical metodekatalog');
  assert(model.emners.every((emne) => model.domainsById.has(emne.domainId)), 'Filosofi har emne uten fagområde');
  assert(model.emners.every((emne) => emne.methodIds.every((id) => model.methodsById.has(id))), 'Filosofi har emne med ukjent metode');

  const sourceEmneIds = new Set(source.emners.map((row) => row.emne_id));
  const fagkartEmneIds = new Set(source.fagkart.categories.flatMap((domain) => domain.emne_ids || []));
  const courseEmneIds = new Set(source.pensum.modules.flatMap((module) => module.emner || []));
  assert(sourceEmneIds.size === 54, 'Filosofi har dupliserte eller manglende canonicale emner');
  assert(fagkartEmneIds.size === sourceEmneIds.size && [...sourceEmneIds].every((id) => fagkartEmneIds.has(id)), 'Fagkartet dekker ikke alle Filosofi-emner');
  assert(courseEmneIds.size === sourceEmneIds.size && [...sourceEmneIds].every((id) => courseEmneIds.has(id)), 'Pensummodulene dekker ikke alle Filosofi-emner');

  const hooks = source.fagkart.categories.flatMap((domain) => domain.topic_hooks || []);
  const hookIds = new Set(hooks.map((hook) => hook.id));
  const conceptIds = new Set(concepts.concepts.map((concept) => concept.id));
  const thinkerIds = new Set(thinkers.thinkers.map((thinker) => thinker.id));
  const methodIds = new Set(source.methods.methods.map((method) => method.method_id));
  assert(hookIds.size === 37, 'Filosofi har dupliserte eller manglende canonicale hooks');
  assert(concepts.counts?.total === 162 && concepts.concepts.length === 162, 'Filosofi-begrepsregisteret skal ha 162 canonicale begreper');
  assert(thinkers.counts?.total === 157 && thinkers.thinkers.length === 157, 'Filosofi-teoretikerregisteret skal ha 157 oppføringer');
  assert(thinkers.counts?.active === 149 && thinkers.counts?.contextual === 8, 'Filosofi-teoretikerstatusene er ute av synk');
  assert(source.pensum.modules.flatMap((module) => module.konsepter || []).every((id) => conceptIds.has(id)), 'Pensum refererer ukjent Filosofi-begrep');
  assert(source.emners.flatMap((emne) => emne.core_concepts || []).every((id) => conceptIds.has(id)), 'Emnekatalogen refererer ukjent Filosofi-begrep');
  assert(source.emners.flatMap((emne) => emne.theory_hook_ids || []).every((id) => hookIds.has(id)), 'Emnekatalogen refererer ukjent Filosofi-hook');
  assert(hooks.flatMap((hook) => hook.concept_ids || []).every((id) => conceptIds.has(id)), 'Fagkart-hook refererer ukjent Filosofi-begrep');
  assert(hooks.flatMap((hook) => hook.canon?.thinkers || []).every((row) => thinkerIds.has(row.id)), 'Fagkart-hook refererer ukjent teoretiker');
  assert(hooks.flatMap((hook) => hook.recommended_method_ids || []).every((id) => methodIds.has(id)), 'Fagkart-hook refererer ukjent metode');
  assert(thinkers.thinkers.flatMap((thinker) => thinker.concept_ids || []).every((id) => conceptIds.has(id)), 'Teoretikerregisteret refererer ukjent begrep');

  const principles = source.fagkart.principles || {};
  for (const key of ['argument_first', 'conceptual_precision', 'charitable_interpretation', 'global_canon_without_tokenism', 'historical_claims_require_sources', 'place_relevance_requires_documented_anchor', 'personal_opinion_is_not_scored_knowledge', 'theory_rotation_required']) {
    assert(principles[key] === true, `Filosofi mangler bindende prinsipp: ${key}`);
  }

  const badgePage = read(P.badgePage);
  assert(badgePage.includes('../../../fagverk.html?subject=filosofi'), 'Filosofi-merkesiden mangler separat fagsidelenke');
  assert(badgePage.includes('../../../fagverk-forside.html'), 'Filosofi-merkesiden mangler Fagverk-forsiden');

  const report = {
    schema: 'history_go_fagverk_filosofi_phase3_audit_v1',
    version: '1.0.0',
    status: expectedEditorialStatus === 'complete' ? 'filosofi_phase_3_complete' : expectedEditorialStatus === 'expanded_and_audited' ? 'filosofi_phase_3_expanded_and_audited' : expectedEditorialStatus === 'chapters_in_progress' ? 'filosofi_phase_3_chapters_in_progress' : 'filosofi_phase_3_structure_ready',
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
      courseModuleCount: source.pensum.modules.length,
      conceptCount: concepts.concepts.length,
      thinkerCount: thinkers.thinkers.length,
      activeThinkerCount: thinkers.counts.active,
      contextualThinkerCount: thinkers.counts.contextual,
      registeredChapterCount: model.chapters.length
    },
    canonicalDomainOrder: DOMAIN_ORDER,
    domainEmneCounts: Object.fromEntries(model.domains.map((domain) => [domain.id, domain.emneIds.length])),
    gates: {
      manifestFirstSourcesResolved: true,
      foundationAdapterExercised: true,
      fagkartOwnsRendererDomains: true,
      courseModulesRemainProgressionOnly: true,
      allActiveEmnersMapped: true,
      allCourseModulesCoverCanonicalEmners: true,
      allMethodReferencesResolved: true,
      allConceptReferencesResolved: true,
      allThinkerReferencesResolved: true,
      philosophyPrinciplesLocked: true,
      badgeAndSubjectRoutesDistinct: true,
      assessmentStatusAudited: true,
      editorialLifecycleConsistent: statusEntry.editorialStatus === expectedEditorialStatus,
      chapterClaimsNotOverstated: true
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
    const { report } = auditFilosofiPhase3({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Filosofi Fase 3 OK: ${report.summary.domainCount} fagområder, ${report.summary.emneCount} emner, ${report.summary.methodCount} metoder og ${report.summary.hookCount} hooks.`);
  } catch (error) {
    console.error(`Filosofi Fase 3 FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
