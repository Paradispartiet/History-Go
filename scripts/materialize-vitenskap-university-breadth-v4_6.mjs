#!/usr/bin/env node
import fs from 'node:fs';

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
  registry: 'data/fagverk/fagverk_registry.json'
});

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const writeJson = (p, value) => fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const clone = (value) => JSON.parse(JSON.stringify(value));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const unique = (values) => [...new Set(values)];

const spec = readJson(P.spec);
const emners = readJson(P.emners45);
const mappings = readJson(P.mappings45);
const fagkart = readJson(P.fagkart45);
const methods = readJson(P.methods45);
const pensum = readJson(P.pensum45);
const manifest = readJson(P.manifest);
const generator = readJson(P.generator);
const readiness = readJson(P.readiness);
const status = readJson(P.status);
const registry = readJson(P.registry);

assert(spec.subject_id === 'vitenskap', 'Breadth-spec har feil subject');
assert(spec.rules.preserve_domain_count === 6, 'Breadth-spec må bevare seks domener');
assert(spec.rules.add_emne_count === 24 && spec.rules.target_emne_count === 117, 'Breadth-spec har feil emnetall');
assert(spec.rules.add_hook_count === 4 && spec.rules.target_hook_count === 64, 'Breadth-spec har feil hooktall');
assert(spec.rules.target_mapping_count === 117, 'Breadth-spec har feil mappingmål');
assert(Array.isArray(emners) && emners.length === 93, `Forventet 93 v4.5-emner, fant ${emners.length}`);
assert(Array.isArray(mappings) && mappings.length === 93, `Forventet 93 v4.5-mappinger, fant ${mappings.length}`);
assert(pensum.summary?.domain_count === 6 && pensum.summary?.emne_count === 93 && pensum.summary?.topic_hook_count === 60, 'v4.5-pensum har uventet baseline');
assert(methods.methods?.length === 84, 'v4.5-metodekatalog har uventet baseline');
assert(readiness.complete_ready === false, 'Readiness kan ikke være complete før breadth-reconciliation');
assert(Array.isArray(readiness.blocking_gaps) && readiness.blocking_gaps.length === 4, 'Forventet fire blocking gaps før reconciliation');

const methodIds = new Set(methods.methods.map((row) => row.method_id));
const existingEmneIds = new Set(emners.map((row) => row.emne_id));
const existingHookIds = new Set(fagkart.categories.flatMap((category) => (category.topic_hooks || []).map((hook) => hook.id)));
const readinessFamilyById = new Map(readiness.coverage_families.map((row) => [row.id, row]));
const specFamilyById = new Map(spec.families.map((row) => [row.coverage_family_id, row]));
const newTopics = spec.families.flatMap((family) => family.topics.map((topic) => ({ topic, family })));
assert(newTopics.length === 24, 'Breadth-spec skal ha 24 topics');
assert(new Set(newTopics.map(({ topic }) => topic.id)).size === 24, 'Breadth-spec har dupliserte emne-ID-er');
assert(spec.families.length === 4, 'Breadth-spec skal ha fire familier');
for (const family of spec.families) {
  const readinessFamily = readinessFamilyById.get(family.coverage_family_id);
  assert(readinessFamily?.status === 'gap', `${family.coverage_family_id} er ikke readiness-gap`);
  assert(readinessFamily.requires_canonical_inventory_change === true, `${family.coverage_family_id} krever ikke inventory-endring`);
  assert(readinessFamily.existing_domain_ids.includes(family.target_domain_id), `${family.coverage_family_id} har target-domain uten readiness-anker`);
  assert(!existingHookIds.has(family.hook.id), `Hook ${family.hook.id} finnes allerede`);
  for (const id of family.hook.recommended_method_ids) assert(methodIds.has(id), `Ukjent hook-metode ${id}`);
  const readinessCandidates = new Set(readinessFamily.candidate_topics || []);
  assert(family.topics.length === readinessCandidates.size, `${family.coverage_family_id} har feil kandidattall`);
  for (const topic of family.topics) {
    assert(readinessCandidates.has(topic.candidate_key), `${topic.id} matcher ikke readiness candidate ${topic.candidate_key}`);
    assert(!existingEmneIds.has(topic.id), `${topic.id} finnes allerede i v4.5`);
    assert(topic.id.startsWith('em_vit_'), `${topic.id} har feil prefiks`);
    assert(topic.definition.length >= 170, `${topic.id} har for kort definisjon`);
    assert(topic.why_it_matters.length >= 140, `${topic.id} har for kort begrunnelse`);
    assert(topic.key_questions.length >= 3, `${topic.id} mangler spørsmål`);
    assert(topic.method_ids.length >= 3, `${topic.id} har for få metoder`);
    for (const id of topic.method_ids) assert(methodIds.has(id), `${topic.id} peker til ukjent metode ${id}`);
  }
}

const pensumDomainById = new Map(pensum.domains.map((row) => [row.domain_id, row]));
const fagkartCategoryById = new Map(fagkart.categories.map((row) => [row.id, row]));
for (const family of spec.families) {
  assert(pensumDomainById.has(family.target_domain_id), `Ukjent pensum-domain ${family.target_domain_id}`);
  assert(fagkartCategoryById.has(family.target_domain_id), `Ukjent fagkart-domain ${family.target_domain_id}`);
}

function relatedSubjectsForFamily(familyId) {
  if (familyId === 'mathematics_formal_sciences') return ['teknologi'];
  if (familyId === 'medicine_biomedicine_public_health') return ['natur'];
  return ['natur', 'teknologi'];
}

function defaultDimensions(familyId) {
  if (familyId === 'mathematics_formal_sciences') return ['formell_struktur', 'deduksjon', 'modell', 'beregning'];
  if (familyId === 'physics_astronomy') return ['måling', 'modell', 'eksperiment', 'skala'];
  if (familyId === 'chemistry_material_science') return ['struktur', 'måling', 'laboratorium', 'materiale'];
  return ['evidens', 'studiedesign', 'risiko', 'overførbarhet'];
}

function blindspotsForFamily(familyId) {
  if (familyId === 'mathematics_formal_sciences') return ['forveksle formell gyldighet med empirisk sannhet', 'skjule modellforutsetninger bak symbolbruk'];
  if (familyId === 'physics_astronomy') return ['behandle idealiserte modeller som direkte virkelighetskopier', 'utelate instrument- og målebegrensninger'];
  if (familyId === 'chemistry_material_science') return ['forveksle strukturmodell med direkte observasjon', 'utelate prøvepreparering, kalibrering eller interferenser'];
  return ['forveksle statistisk signifikans med klinisk betydning', 'overføre evidens mellom populasjoner uten begrunnelse'];
}

function buildEmne(topic, family) {
  const domain = pensumDomainById.get(family.target_domain_id);
  const template = emners.find((row) => row.domain === family.target_domain_id);
  assert(template, `Mangler emne-template for ${family.target_domain_id}`);
  const record = clone(template);
  const dimensions = defaultDimensions(family.coverage_family_id);
  record.emne_id = topic.id;
  record.subject_id = 'vitenskap';
  record.domain = family.target_domain_id;
  record.area_id = family.target_domain_id;
  record.area_label = domain.label;
  record.level = 3;
  record.title = topic.title;
  record.short_label = topic.short_label;
  record.status = 'active';
  record.definition = topic.definition;
  record.why_it_matters = topic.why_it_matters;
  record.keywords = unique([...(topic.keywords || []), family.label, domain.label]);
  record.dimensions = dimensions;
  record.axes = dimensions;
  record.key_concepts = topic.keywords || [];
  record.core_concepts = (topic.keywords || []).slice(0, 4);
  record.sub_concepts = (topic.keywords || []).slice(2);
  record.key_questions = topic.key_questions;
  record.conflicts = [];
  record.ideological_dimensions = [];
  record.methods = topic.method_ids;
  record.analysis_axes = dimensions;
  record.canonical_thinkers = [];
  record.canonical_thinker_ids = [];
  record.norwegian_thinkers = [];
  record.norwegian_thinker_ids = [];
  record.related_subjects = relatedSubjectsForFamily(family.coverage_family_id);
  record.related_subject_links = relatedSubjectsForFamily(family.coverage_family_id);
  record.best_place_types = domain.best_place_types || [];
  record.recommended_oslo_cases = family.hook.recommended_oslo_cases;
  record.quiz_angles = topic.key_questions;
  record.common_blindspots = blindspotsForFamily(family.coverage_family_id);
  record.logic_family = family.coverage_family_id;
  record.role = 'university_breadth_reconciliation';
  record.canonical_status = 'canonical';
  record.registry_version = 'vitenskappensum_v4_6';
  record.source_priority = domain.source_priority || record.source_priority || [];
  record.case_anchor_required = true;
  record.method_anchor_required = true;
  record.source_anchor_required = true;
  record.external_claim_basis_required = true;
  record.institution_method_model_instrument_or_discovery_anchor_required = true;
  record.breadth_reconciliation = {
    coverage_family_id: family.coverage_family_id,
    candidate_key: topic.candidate_key,
    hook_id: family.hook.id,
    spec_version: spec.version
  };
  return record;
}

function buildMapping(topic, family) {
  const domain = pensumDomainById.get(family.target_domain_id);
  const template = mappings.find((row) => (row.mappings || []).some((mapping) => mapping.fagkart_kategori === family.target_domain_id));
  assert(template, `Mangler mapping-template for ${family.target_domain_id}`);
  const record = clone(template);
  const sourceMapping = template.mappings.find((mapping) => mapping.fagkart_kategori === family.target_domain_id) || template.mappings[0];
  const primary = clone(sourceMapping);
  record.emne_id = topic.id;
  record.title = topic.title;
  primary.fagkart_kategori = family.target_domain_id;
  primary.fagkart_kategori_tittel = domain.label;
  primary.topic_hook = family.hook.id;
  primary.topic_hook_tittel = family.hook.title;
  primary.mapping_tier = 'primary';
  primary.priority_score = 10;
  primary.tenkere = [];
  primary.thinker_ids = [];
  primary.norwegian_thinker_ids = [];
  primary.norwegian_thinkers = [];
  primary.comparison_pairs = [];
  primary.recommended_oslo_cases = family.hook.recommended_oslo_cases;
  primary.recommended_method_ids = topic.method_ids;
  primary.generator_constraints = {
    ...(primary.generator_constraints || {}),
    require_concrete_institution_method_model_instrument_or_discovery: true,
    require_external_claim_basis: true,
    do_not_generate_from_hook_label_only: true,
    do_not_generate_from_emne_label_only: true,
    required_emne_prefix: 'em_vit_'
  };
  record.mappings = [primary];
  record.mapping_status = 'tiered+canonical';
  record.primary_hooks = [family.hook.id];
  record.secondary_hooks = [];
  record.reserve_hooks = [];
  record.canonical_thinkers = [];
  record.canonical_thinker_ids = [];
  record.norwegian_thinker_ids = [];
  record.norwegian_thinkers = [];
  record.theory_diversity_score = 0;
  record.has_norwegian_theory_path = false;
  record.recommended_oslo_cases = family.hook.recommended_oslo_cases;
  record.recommended_method_ids = topic.method_ids;
  record.canonical_status = 'canonical';
  record.registry_version = 'vitenskappensum_v4_6';
  record.case_gate_required = true;
  record.method_gate_required = true;
  record.source_anchor_required = true;
  record.external_claim_basis_required = true;
  record.institution_method_model_instrument_or_discovery_anchor_required = true;
  record.breadth_reconciliation = {
    coverage_family_id: family.coverage_family_id,
    hook_id: family.hook.id,
    spec_version: spec.version
  };
  return record;
}

function buildHook(family) {
  const category = fagkartCategoryById.get(family.target_domain_id);
  const template = clone(category.topic_hooks[0]);
  template.id = family.hook.id;
  template.title = family.hook.title;
  if ('label' in template) template.label = family.hook.title;
  if ('description' in template) template.description = `Canonical universitetsbredde-hook for ${family.label}, reconcilet inn i eksisterende Vitenskap-domain ${category.label}.`;
  template.emne_ids = family.topics.map((topic) => topic.id);
  template.recommended_method_ids = family.hook.recommended_method_ids;
  if ('method_ids' in template) template.method_ids = family.hook.recommended_method_ids;
  if ('canonical_thinker_ids' in template) template.canonical_thinker_ids = [];
  if ('canonical_thinkers' in template) template.canonical_thinkers = [];
  if ('norwegian_thinker_ids' in template) template.norwegian_thinker_ids = [];
  if ('norwegian_thinkers' in template) template.norwegian_thinkers = [];
  if ('recommended_oslo_cases' in template) template.recommended_oslo_cases = family.hook.recommended_oslo_cases;
  if ('place_fit' in template) template.place_fit = family.hook.recommended_oslo_cases;
  if ('related_subjects' in template) template.related_subjects = relatedSubjectsForFamily(family.coverage_family_id);
  template.canonical_status = 'canonical';
  template.registry_version = 'vitenskappensum_v4_6';
  template.coverage_family_id = family.coverage_family_id;
  template.university_breadth_reconciliation = true;
  return template;
}

const emners46 = [...emners, ...newTopics.map(({ topic, family }) => buildEmne(topic, family))];
const mappings46 = [...mappings, ...newTopics.map(({ topic, family }) => buildMapping(topic, family))];
assert(emners46.length === 117, 'v4.6-emner fikk feil antall');
assert(mappings46.length === 117, 'v4.6-mapping fikk feil antall');
assert(new Set(emners46.map((row) => row.emne_id)).size === 117, 'v4.6-emner har duplikater');
assert(new Set(mappings46.map((row) => row.emne_id)).size === 117, 'v4.6-mapping har duplikater');

const fagkart46 = clone(fagkart);
for (const family of spec.families) {
  const category = fagkart46.categories.find((row) => row.id === family.target_domain_id);
  category.topic_hooks.push(buildHook(family));
  if ('hook_count' in category) category.hook_count = category.topic_hooks.length;
  if ('emne_count' in category) category.emne_count = unique(category.topic_hooks.flatMap((hook) => hook.emne_ids || [])).length;
}
if ('version' in fagkart46) fagkart46.version = 'v4.6-canonical';
if ('registry_version' in fagkart46) fagkart46.registry_version = 'vitenskappensum_v4_6';
const allHooks46 = fagkart46.categories.flatMap((category) => category.topic_hooks || []);
assert(allHooks46.length === 64, `v4.6-fagkart fikk ${allHooks46.length} hooks`);
assert(new Set(allHooks46.map((hook) => hook.id)).size === 64, 'v4.6-fagkart har dupliserte hook-ID-er');
const hookEmneIds46 = new Set(allHooks46.flatMap((hook) => hook.emne_ids || []));
assert(hookEmneIds46.size === 117 && emners46.every((row) => hookEmneIds46.has(row.emne_id)), 'v4.6-hooks dekker ikke alle emner');

const methods46 = clone(methods);
if ('version' in methods46) methods46.version = 'v4.6-canonical';
if ('registry_version' in methods46) methods46.registry_version = 'vitenskappensum_v4_6';
for (const method of methods46.methods) if ('registry_version' in method) method.registry_version = 'vitenskappensum_v4_6';
assert(methods46.methods.length === 84, 'v4.6 skal ikke legge til metoder');

const pensum46 = clone(pensum);
pensum46.version = 'vitenskappensum_v4_6';
pensum46.updated_at = '2026-08-17';
pensum46.files = {
  ...(pensum46.files || {}),
  fagkart: P.fagkart46.split('/').pop(),
  methods: P.methods46.split('/').pop(),
  emner: P.emners46.split('/').pop(),
  emnemapping: P.mappings46.split('/').pop()
};
for (const family of spec.families) {
  const domain = pensum46.domains.find((row) => row.domain_id === family.target_domain_id);
  domain.emne_ids = unique([...domain.emne_ids, ...family.topics.map((topic) => topic.id)]);
  domain.hook_ids = unique([...domain.hook_ids, family.hook.id]);
  domain.emne_count = domain.emne_ids.length;
  domain.hook_count = domain.hook_ids.length;
}
pensum46.summary.domain_count = 6;
pensum46.summary.emne_count = 117;
pensum46.summary.method_count = 84;
pensum46.summary.mapping_count = 117;
pensum46.summary.topic_hook_count = 64;
pensum46.university_breadth_reconciliation = {
  status: 'canonical_inventory_reconciled',
  spec: P.spec,
  added_emnes: 24,
  added_hooks: 4,
  preserved_domains: 6,
  preserved_methods: 84
};
assert(pensum46.domains.length === 6, 'v4.6-pensum opprettet nye domener');
assert(pensum46.domains.reduce((sum, row) => sum + row.emne_ids.length, 0) === 117, 'v4.6-pensum har feil emnesum');
assert(pensum46.domains.reduce((sum, row) => sum + row.hook_ids.length, 0) === 64, 'v4.6-pensum har feil hooksum');

manifest.vitenskap.pensum = 'vitenskap/vitenskappensum_canonical_v4_6.json';
manifest.vitenskap.emner = 'vitenskap/emner_vitenskap_canonical_v4_6.json';
manifest.vitenskap.fagkart = 'vitenskap/fagkart_vitenskap_canonical_v4_6.json';
manifest.vitenskap.methods = 'vitenskap/methods_vitenskap_canonical_v4_6.json';
manifest.vitenskap.emneMappings = 'vitenskap/emnemapping_vitenskap_canonical_v4_6.json';
manifest.vitenskap.universityBreadthReconciliation = 'vitenskap/vitenskap_university_breadth_reconciliation_v1.json';
manifest.vitenskap.canonicalModelVersion = '4.6';

Object.assign(generator.canonical_inputs, {
  fagkart: 'fagkart_vitenskap_canonical_v4_6.json',
  methods: 'methods_vitenskap_canonical_v4_6.json',
  emner: 'emner_vitenskap_canonical_v4_6.json',
  emnemapping: 'emnemapping_vitenskap_canonical_v4_6.json',
  pensum: 'vitenskappensum_canonical_v4_6.json',
  domain_count: 6,
  emne_count: 117,
  method_count: 84,
  mapping_count: 117,
  topic_hook_count: 64
});

generator.university_breadth_reconciliation = {
  status: 'canonical_inventory_reconciled',
  spec: P.spec,
  coverage_family_count: 4,
  added_emne_count: 24,
  added_hook_count: 4,
  new_parallel_domains: 0
};

readiness.version = '1.2.0';
readiness.status = 'breadth_inventory_reconciled_chapter_production_in_progress';
Object.assign(readiness.current_inventory.vitenskap, {
  domain_count: 6,
  emne_count: 117,
  method_count: 84,
  mapping_count: 117,
  hook_count: 64,
  registered_chapter_count: 1
});
for (const family of readiness.coverage_families) {
  const specFamily = specFamilyById.get(family.id);
  if (!specFamily) continue;
  family.status = 'inventory_reconciled';
  family.requires_canonical_inventory_change = false;
  family.reconciled_emne_ids = specFamily.topics.map((topic) => topic.id);
  family.reconciled_hook_id = specFamily.hook.id;
  family.reconciliation_spec = P.spec;
  family.reason = `${family.reason} Gapet er nå reconcilet på canonical inventory-nivå gjennom ${specFamily.topics.length} eksplisitte emner i eksisterende domain ${specFamily.target_domain_id}. Full redaksjonell kapittelbehandling gjenstår og inventory-reconciliation er ikke completion.`;
}
readiness.blocking_gaps = [];
readiness.editorial_blockers = spec.families.map((family) => family.coverage_family_id);
readiness.breadth_reconciliation = {
  status: 'canonical_inventory_reconciled',
  spec: P.spec,
  source_inventory: 'v4.5',
  target_inventory: 'v4.6',
  added_emne_count: 24,
  added_hook_count: 4,
  preserved_domain_count: 6,
  preserved_method_count: 84,
  complete_ready: false
};
readiness.next_gate = 'remaining_chapter_production_across_reconciled_university_breadth';
readiness.complete_ready = false;

const statusScience = status.subjects.find((row) => row.id === 'vitenskap');
assert(statusScience?.editorialStatus === 'chapters_in_progress', 'Vitenskap har uventet editorial status');
status.version = '1.98.0';
status.updatedAt = '2026-08-17';
statusScience.nextGate = 'remaining_chapter_production_across_reconciled_university_breadth';
statusScience.note = 'Vitenskap har canonicalt reconcilet de fire tidligere universitetsbreddegapene inn i den eksisterende seksområdersmodellen: inventaret er nå 6 fagområder, 117 emner, 84 metoder, 117 mappinger og 64 hooks. De 24 nye emnene dekker matematikk/formelle fag, fysikk/astronomi, kjemi/materialvitenskap og medisin/biomedisin/folkehelse uten nye parallelle toppområder. Unit 1 forblir første registrerte fulltekstkapittel. Faget er fortsatt chapters_in_progress og complete_ready er false fordi de reconcilerte breddefamiliene og øvrige canonicale emner fortsatt trenger full redaksjonell kapittelbehandling. Teknologi forblir canonical nested spesialisering under Vitenskap.';

registry.version = '3.05.0';
registry.updatedAt = '2026-08-17';
registry.subjects.vitenskap.canonicalModel.note = 'Vitenskapsfagets seks fagområder eier toppstrukturen. Canonical inventory v4.6 har 117 emner, 84 metoder, 117 mappinger og 64 hooks etter reconciliation av matematikk/formelle fag, fysikk/astronomi, kjemi/materialvitenskap og medisin/biomedisin/folkehelse. Teknologi er fortsatt nested technology_scientific_v2_4-spesialisering under samme fag og badge, ikke et eget toppfag. Inventory-bredde er ikke lik redaksjonell completion; videre fulltekstkapittelproduksjon er fortsatt blocking før complete.';

writeJson(P.emners46, emners46);
writeJson(P.mappings46, mappings46);
writeJson(P.fagkart46, fagkart46);
writeJson(P.methods46, methods46);
writeJson(P.pensum46, pensum46);
writeJson(P.manifest, manifest);
writeJson(P.generator, generator);
writeJson(P.readiness, readiness);
writeJson(P.status, status);
writeJson(P.registry, registry);

console.log(JSON.stringify({
  status: 'materialized',
  canonicalModelVersion: '4.6',
  counts: { domains: 6, emnes: 117, methods: 84, mappings: 117, hooks: 64, chapters: 1 },
  breadthFamilies: spec.families.map((family) => ({ id: family.coverage_family_id, emnes: family.topics.length, hook: family.hook.id, domain: family.target_domain_id })),
  completeReady: readiness.complete_ready,
  editorialBlockers: readiness.editorial_blockers,
  technologyRemainsNested: manifest.vitenskap.specializations.teknologi.canonicalParentSubject === 'vitenskap'
}, null, 2));
