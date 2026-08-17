#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  spec: 'data/fag/vitenskap/vitenskap_university_breadth_reconciliation_v1.json',
  emners45: 'data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json',
  mappings45: 'data/fag/vitenskap/emnemapping_vitenskap_canonical_v4_5.json',
  fagkart45: 'data/fag/vitenskap/fagkart_vitenskap_canonical_v4_5.json',
  methods45: 'data/fag/vitenskap/methods_vitenskap_canonical_v4_5.json',
  pensum45: 'data/fag/vitenskap/vitenskappensum_canonical_v4_5.json',
  emners46: 'data/fag/vitenskap/emner_vitenskap_canonical_v4_6.json',
  mappings46: 'data/fag/vitenskap/emnemapping_vitenskap_canonical_v4_6.json',
  fagkart46: 'data/fag/vitenskap/fagkart_vitenskap_canonical_v4_6.json',
  methods46: 'data/fag/vitenskap/methods_vitenskap_canonical_v4_6.json',
  pensum46: 'data/fag/vitenskap/vitenskappensum_canonical_v4_6.json',
  manifest: 'data/fag/fag_manifest.json',
  generator: 'data/fag/vitenskap/quiz_generator_rules_vitenskap_v5_1_source_priority_patch.json',
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/vitenskap-breadth-reconciliation-audit.json'
});

const EXPECTED_FAMILIES = [
  'mathematics_formal_sciences',
  'physics_astronomy',
  'chemistry_material_science',
  'medicine_biomedicine_public_health'
];
const EXPECTED_HOOKS = [
  'matematikk_formelle_fag',
  'fysikk_astronomi',
  'kjemi_materialvitenskap',
  'medisin_biomedisin_folkehelse'
];
const EXPECTED_COUNTS_45 = { domains: 6, emnes: 93, methods: 84, mappings: 93, hooks: 60 };
const EXPECTED_COUNTS_46 = { domains: 6, emnes: 117, methods: 84, mappings: 117, hooks: 64 };
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();
const unique = (values) => new Set(values).size === values.length;

function counts(pensum) {
  return {
    domains: pensum.summary.domain_count,
    emnes: pensum.summary.emne_count,
    methods: pensum.summary.method_count,
    mappings: pensum.summary.mapping_count,
    hooks: pensum.summary.topic_hook_count
  };
}

function committedProjection(report) {
  return {
    schema: report.schema,
    version: report.version,
    status: report.status,
    generatedFrom: report.generatedFrom,
    subject: report.subject,
    baseline: report.baseline,
    reconciled: report.reconciled,
    delta: report.delta,
    families: report.families,
    editorialState: report.editorialState,
    gates: report.gates
  };
}

export function auditVitenskapBreadthReconciliation({ writeReport = false, checkReport = true } = {}) {
  const spec = json(P.spec);
  const e45 = json(P.emners45);
  const m45 = json(P.mappings45);
  const f45 = json(P.fagkart45);
  const methods45 = json(P.methods45);
  const p45 = json(P.pensum45);
  const e46 = json(P.emners46);
  const m46 = json(P.mappings46);
  const f46 = json(P.fagkart46);
  const methods46 = json(P.methods46);
  const p46 = json(P.pensum46);
  const manifest = json(P.manifest);
  const generator = json(P.generator);
  const readiness = json(P.readiness);
  const status = json(P.status);
  const registry = json(P.registry);

  assert(spec.schema === 'history_go_vitenskap_university_breadth_reconciliation_v1', 'Breadth-spec har feil schema');
  assert(spec.subject_id === 'vitenskap', 'Breadth-spec har feil subject');
  assert(spec.source_inventory_version === 'vitenskappensum_v4_5', 'Breadth-spec har feil source inventory');
  assert(spec.target_inventory_version === 'vitenskappensum_v4_6', 'Breadth-spec har feil target inventory');
  assert(spec.rules.preserve_domain_count === 6 && spec.rules.preserve_method_count === 84, 'Breadth-spec må bevare domener og metoder');
  assert(spec.rules.add_emne_count === 24 && spec.rules.add_mapping_count === 24 && spec.rules.add_hook_count === 4, 'Breadth-spec har feil eksplisitt delta');
  assert(spec.rules.inventory_reconciliation_is_not_editorial_completion === true, 'Breadth-spec må skille inventory fra completion');
  assert(spec.rules.complete_ready_after_reconciliation === false, 'Breadth-spec kan ikke tillate complete etter inventory-reconciliation');
  assert(spec.rules.technology_remains_nested === true, 'Breadth-spec må bevare nested Teknologi');

  assert(isDeepStrictEqual(counts(p45), EXPECTED_COUNTS_45), 'v4.5-baseline har uventede tellinger');
  assert(e45.length === 93 && m45.length === 93 && methods45.methods.length === 84, 'v4.5-filer matcher ikke baseline');
  assert(f45.categories.length === 6 && f45.categories.flatMap((row) => row.topic_hooks || []).length === 60, 'v4.5-fagkart matcher ikke baseline');
  assert(isDeepStrictEqual(counts(p46), EXPECTED_COUNTS_46), 'v4.6 har feil canonical tellinger');
  assert(e46.length === 117 && m46.length === 117 && methods46.methods.length === 84, 'v4.6-filer matcher ikke target');
  assert(f46.categories.length === 6 && f46.categories.flatMap((row) => row.topic_hooks || []).length === 64, 'v4.6-fagkart matcher ikke target');

  assert(p46.version === 'vitenskappensum_v4_6', 'v4.6-pensum har feil version');
  assert(p46.canonical_registry_version === 'vitenskappensum_v4_6', 'v4.6-pensum har stale canonical_registry_version');
  const canonicalFiles = p46.canonical_files || {};
  assert(canonicalFiles.fagkart === 'fagkart_vitenskap_canonical_v4_6.json', 'v4.6-pensum peker til stale fagkart');
  assert(canonicalFiles.methods === 'methods_vitenskap_canonical_v4_6.json', 'v4.6-pensum peker til stale methods');
  assert(canonicalFiles.emner === 'emner_vitenskap_canonical_v4_6.json', 'v4.6-pensum peker til stale emner');
  assert(canonicalFiles.emnemapping === 'emnemapping_vitenskap_canonical_v4_6.json', 'v4.6-pensum peker til stale mapping');
  assert(canonicalFiles.pensum === 'vitenskappensum_canonical_v4_6.json', 'v4.6-pensum peker til stale pensum');

  const ids45 = e45.map((row) => row.emne_id);
  const ids46 = e46.map((row) => row.emne_id);
  const mapIds45 = m45.map((row) => row.emne_id);
  const mapIds46 = m46.map((row) => row.emne_id);
  assert(unique(ids45) && unique(ids46) && unique(mapIds46), 'Canonical emne/mapping-ID-er må være unike');
  assert(ids45.every((id) => ids46.includes(id)), 'v4.6 har mistet et v4.5-emne');
  assert(mapIds45.every((id) => mapIds46.includes(id)), 'v4.6 har mistet en v4.5-mapping');

  const specTopics = spec.families.flatMap((family) => family.topics.map((topic) => ({ family, topic })));
  const newIds = ids46.filter((id) => !ids45.includes(id));
  const specIds = specTopics.map(({ topic }) => topic.id);
  assert(newIds.length === 24 && specIds.length === 24, 'Breadth-reconciliation skal ha nøyaktig 24 nye emner');
  assert(isDeepStrictEqual(sorted(newIds), sorted(specIds)), 'v4.6-delta matcher ikke breadth-spec');
  assert(unique(specIds), 'Breadth-spec har dupliserte emne-ID-er');

  const titleSet = new Set();
  const definitionSet = new Set();
  const methodIds = new Set(methods46.methods.map((row) => row.method_id));
  const mappingById = new Map(m46.map((row) => [row.emne_id, row]));
  const emneById = new Map(e46.map((row) => [row.emne_id, row]));
  const allHooks = f46.categories.flatMap((category) => (category.topic_hooks || []).map((hook) => ({ category, hook })));
  const hookById = new Map(allHooks.map(({ category, hook }) => [hook.id, { category, hook }]));

  for (const { family, topic } of specTopics) {
    const emne = emneById.get(topic.id);
    const mapping = mappingById.get(topic.id);
    const hookEntry = hookById.get(family.hook.id);
    assert(emne, `Mangler v4.6-emne ${topic.id}`);
    assert(mapping, `Mangler v4.6-mapping ${topic.id}`);
    assert(hookEntry, `Mangler v4.6-hook ${family.hook.id}`);
    assert(emne.domain === family.target_domain_id && emne.area_id === family.target_domain_id, `${topic.id} har feil domain`);
    assert(emne.canonical_status === 'canonical', `${topic.id} er ikke canonical`);
    assert(emne.registry_version === 'vitenskappensum_v4_6', `${topic.id} har feil registry_version`);
    assert(emne.definition?.length >= 170 && emne.why_it_matters?.length >= 140, `${topic.id} mangler substansiell selvstendig tekst`);
    assert(emne.key_questions?.length >= 3, `${topic.id} mangler nøkkelspørsmål`);
    assert(emne.methods?.length >= 3 && emne.methods.every((id) => methodIds.has(id)), `${topic.id} har ugyldig metodekobling`);
    assert(!titleSet.has(emne.title), `${topic.id} har duplisert tittel`);
    assert(!definitionSet.has(emne.definition), `${topic.id} har duplisert definisjon`);
    titleSet.add(emne.title);
    definitionSet.add(emne.definition);
    assert(mapping.mappings?.length === 1, `${topic.id} skal ha én primary breadth-mapping`);
    const primary = mapping.mappings[0];
    assert(primary.mapping_tier === 'primary', `${topic.id} mangler primary mapping tier`);
    assert(primary.fagkart_kategori === family.target_domain_id, `${topic.id} mapping har feil domain`);
    assert(primary.topic_hook === family.hook.id, `${topic.id} mapping har feil breadth-hook`);
    assert(mapping.primary_hooks?.length === 1 && mapping.primary_hooks[0] === family.hook.id, `${topic.id} har inkonsistent primary_hooks`);
    assert(primary.recommended_method_ids?.length >= 3 && primary.recommended_method_ids.every((id) => methodIds.has(id)), `${topic.id} mapping har ugyldige metoder`);
    assert(hookEntry.category.id === family.target_domain_id, `${family.hook.id} ligger i feil domain`);
    assert(isDeepStrictEqual(sorted(hookEntry.hook.emne_ids || []), sorted(family.topics.map((row) => row.id))), `${family.hook.id} eier feil emnesett`);
  }

  const newHookIds = allHooks.map(({ hook }) => hook.id).filter((id) => !f45.categories.flatMap((category) => (category.topic_hooks || []).map((hook) => hook.id)).includes(id));
  assert(isDeepStrictEqual(sorted(newHookIds), sorted(EXPECTED_HOOKS)), 'v4.6 har feil hook-delta');
  assert(isDeepStrictEqual(sorted(spec.families.map((row) => row.coverage_family_id)), sorted(EXPECTED_FAMILIES)), 'Breadth-spec har feil familier');

  assert(manifest.vitenskap?.canonicalModelVersion === '4.6', 'Manifest peker ikke til canonical model v4.6');
  assert(manifest.vitenskap?.pensum === 'vitenskap/vitenskappensum_canonical_v4_6.json', 'Manifest peker til stale pensum');
  assert(manifest.vitenskap?.emner === 'vitenskap/emner_vitenskap_canonical_v4_6.json', 'Manifest peker til stale emner');
  assert(manifest.vitenskap?.fagkart === 'vitenskap/fagkart_vitenskap_canonical_v4_6.json', 'Manifest peker til stale fagkart');
  assert(manifest.vitenskap?.methods === 'vitenskap/methods_vitenskap_canonical_v4_6.json', 'Manifest peker til stale methods');
  assert(manifest.vitenskap?.emneMappings === 'vitenskap/emnemapping_vitenskap_canonical_v4_6.json', 'Manifest peker til stale mappings');
  assert(manifest.vitenskap?.specializations?.teknologi?.canonicalParentSubject === 'vitenskap', 'Teknologi har mistet canonical parent');

  const inputs = generator.canonical_inputs || {};
  assert(inputs.fagkart === 'fagkart_vitenskap_canonical_v4_6.json', 'Generator peker til stale fagkart');
  assert(inputs.methods === 'methods_vitenskap_canonical_v4_6.json', 'Generator peker til stale methods');
  assert(inputs.emner === 'emner_vitenskap_canonical_v4_6.json', 'Generator peker til stale emner');
  assert(inputs.emnemapping === 'emnemapping_vitenskap_canonical_v4_6.json', 'Generator peker til stale mappings');
  assert(inputs.pensum === 'vitenskappensum_canonical_v4_6.json', 'Generator peker til stale pensum');
  assert(inputs.domain_count === 6 && inputs.emne_count === 117 && inputs.method_count === 84 && inputs.mapping_count === 117 && inputs.topic_hook_count === 64, 'Generator har feil v4.6-tellinger');

  assert(readiness.version === '1.2.0', 'Readiness har feil post-reconciliation-versjon');
  assert(readiness.status === 'breadth_inventory_reconciled_chapter_production_in_progress', 'Readiness har feil post-reconciliation-status');
  assert(readiness.complete_ready === false, 'Inventory-reconciliation kan ikke gjøre Vitenskap complete-ready');
  assert(isDeepStrictEqual(readiness.current_inventory.vitenskap, {
    domain_count: 6,
    emne_count: 117,
    method_count: 84,
    mapping_count: 117,
    hook_count: 64,
    registered_chapter_count: 1
  }), 'Readiness har feil v4.6-inventar');
  assert(Array.isArray(readiness.blocking_gaps) && readiness.blocking_gaps.length === 0, 'Strukturelle blocking gaps skal være reconcilet');
  assert(isDeepStrictEqual(sorted(readiness.editorial_blockers || []), sorted(EXPECTED_FAMILIES)), 'Fire breadth-familier skal forbli editorial blockers');
  for (const id of EXPECTED_FAMILIES) {
    const family = readiness.coverage_families.find((row) => row.id === id);
    const specFamily = spec.families.find((row) => row.coverage_family_id === id);
    assert(family?.status === 'inventory_reconciled', `${id} er ikke inventory_reconciled`);
    assert(family?.requires_canonical_inventory_change === false, `${id} krever fortsatt inventory-endring`);
    assert(isDeepStrictEqual(sorted(family?.reconciled_emne_ids || []), sorted(specFamily.topics.map((row) => row.id))), `${id} har feil reconcilet emnesett`);
    assert(family?.reconciled_hook_id === specFamily.hook.id, `${id} har feil reconcilet hook`);
  }
  assert(readiness.first_production_unit?.status === 'materialized_and_registered', 'Unit 1 må forbli registrert');
  assert(readiness.next_gate === 'remaining_chapter_production_across_reconciled_university_breadth', 'Readiness har feil neste port');

  const statusEntry = status.subjects?.find((row) => row.id === 'vitenskap');
  assert(statusEntry?.editorialStatus === 'chapters_in_progress', 'Vitenskap kan ikke forlate chapters_in_progress');
  assert(statusEntry?.nextGate === 'remaining_chapter_production_across_reconciled_university_breadth', 'Subject status har feil neste port');
  assert(registry.subjects?.vitenskap?.chapters?.length === 1, 'Registry må beholde nøyaktig Unit 1 som registrert kapittel');
  assert(registry.subjects.vitenskap.chapters[0].id === 'vitenskap-fra-observasjon-til-etterprovbar-kunnskap', 'Registry har feil Vitenskap-kapittel');

  const report = {
    schema: 'history_go_fagverk_vitenskap_breadth_reconciliation_audit_v1',
    version: '1.0.0',
    status: 'canonical_inventory_reconciled_editorial_work_open',
    generatedFrom: P,
    subject: {
      id: 'vitenskap',
      editorialStatus: statusEntry.editorialStatus,
      completeReady: readiness.complete_ready,
      nextGate: readiness.next_gate
    },
    baseline: EXPECTED_COUNTS_45,
    reconciled: EXPECTED_COUNTS_46,
    delta: { domains: 0, emnes: 24, methods: 0, mappings: 24, hooks: 4 },
    families: spec.families.map((family) => ({
      id: family.coverage_family_id,
      domainId: family.target_domain_id,
      hookId: family.hook.id,
      emneCount: family.topics.length,
      emneIds: family.topics.map((row) => row.id)
    })),
    editorialState: {
      structuralBlockingGapCount: readiness.blocking_gaps.length,
      editorialBlockerCount: readiness.editorial_blockers.length,
      registeredChapterCount: readiness.current_inventory.vitenskap.registered_chapter_count
    },
    gates: {
      exactV45BaselineLocked: true,
      exactV46TargetLocked: true,
      oldInventoryPreserved: true,
      exactTwentyFourTopicDelta: true,
      exactFourHookDelta: true,
      noNewDomains: true,
      noNewMethods: true,
      canonicalInternalVersionConsistency: true,
      mappingSchemaCanonical: true,
      allNewMethodsResolve: true,
      newTopicTextIndependentAndSubstantial: true,
      manifestAndGeneratorUseV46: true,
      structuralGapsReconciled: true,
      editorialBlockersRemainOpen: true,
      prematureCompleteBlocked: true,
      technologyRemainsNested: true,
      unit1RegistrationPreserved: true
    }
  };

  const committed = committedProjection(report);
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(committed, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), committed), `${P.report} er utdatert`);
  return { report, spec, readiness, p45, p46 };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const { report } = auditVitenskapBreadthReconciliation({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Vitenskap breadth reconciliation OK: ${report.baseline.emnes} -> ${report.reconciled.emnes} emner, ${report.delta.hooks} nye hooks, completeReady=${report.subject.completeReady}`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
