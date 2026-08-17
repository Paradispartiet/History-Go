#!/usr/bin/env node
import fs from 'node:fs';

const P = Object.freeze({
  spec: 'data/fag/vitenskap/vitenskap_university_breadth_reconciliation_v1.json',
  pensum: 'data/fag/vitenskap/vitenskappensum_canonical_v4_6.json',
  emners: 'data/fag/vitenskap/emner_vitenskap_canonical_v4_6.json',
  mappings: 'data/fag/vitenskap/emnemapping_vitenskap_canonical_v4_6.json',
  fagkart: 'data/fag/vitenskap/fagkart_vitenskap_canonical_v4_6.json',
  methods: 'data/fag/vitenskap/methods_vitenskap_canonical_v4_6.json',
  manifest: 'data/fag/fag_manifest.json',
  generator: 'data/fag/vitenskap/quiz_generator_rules_vitenskap_v5_1_source_priority_patch.json',
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json'
});

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, v) => fs.writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`, 'utf8');
const assert = (c, m) => { if (!c) throw new Error(m); };
const sorted = (xs) => [...xs].sort();

const spec = read(P.spec);
const pensum = read(P.pensum);
const emners = read(P.emners);
const mappings = read(P.mappings);
const fagkart = read(P.fagkart);
const methods = read(P.methods);
const manifest = read(P.manifest);
const generator = read(P.generator);
const readiness = read(P.readiness);
const status = read(P.status);
const registry = read(P.registry);

assert(spec.families?.length === 4, 'Breadth-spec skal ha fire familier');
assert(emners.length === 117, 'v4.6 skal ha 117 emner');
assert(mappings.length === 117, 'v4.6 skal ha 117 mappinger');
assert(fagkart.categories?.length === 6, 'v4.6 skal ha seks domener');
assert(methods.methods?.length === 84, 'v4.6 skal ha 84 metoder');

const methodIds = new Set(methods.methods.map((row) => row.method_id));
const emneById = new Map(emners.map((row) => [row.emne_id, row]));
const mappingById = new Map(mappings.map((row) => [row.emne_id, row]));
const categoryById = new Map(fagkart.categories.map((row) => [row.id, row]));
const specTopicIds = [];

pensum.version = 'vitenskappensum_v4_6';
pensum.canonical_registry_version = 'vitenskappensum_v4_6';
pensum.canonical_files = {
  ...(pensum.canonical_files || {}),
  fagkart: 'fagkart_vitenskap_canonical_v4_6.json',
  methods: 'methods_vitenskap_canonical_v4_6.json',
  emner: 'emner_vitenskap_canonical_v4_6.json',
  emnemapping: 'emnemapping_vitenskap_canonical_v4_6.json',
  pensum: 'vitenskappensum_canonical_v4_6.json'
};
delete pensum.files;
pensum.summary = {
  ...(pensum.summary || {}),
  domain_count: 6,
  emne_count: 117,
  method_count: 84,
  mapping_count: 117,
  topic_hook_count: 64,
  all_emner_have_mapping: true,
  all_method_refs_valid: true
};

for (const family of spec.families) {
  const category = categoryById.get(family.target_domain_id);
  assert(category, `Mangler domain ${family.target_domain_id}`);
  let hook = (category.topic_hooks || []).find((row) => row.id === family.hook.id);
  assert(hook, `Mangler breadth-hook ${family.hook.id}`);
  const familyIds = family.topics.map((topic) => topic.id);
  hook.emne_ids = familyIds;
  hook.id = family.hook.id;
  hook.title = family.hook.title;
  hook.canonical_status = 'canonical';
  hook.registry_version = 'vitenskappensum_v4_6';
  hook.coverage_family_id = family.coverage_family_id;
  hook.university_breadth_reconciliation = true;
  hook.recommended_method_ids = family.hook.recommended_method_ids;
  hook.recommended_oslo_cases = family.hook.recommended_oslo_cases;

  for (const topic of family.topics) {
    specTopicIds.push(topic.id);
    const emne = emneById.get(topic.id);
    const mapping = mappingById.get(topic.id);
    assert(emne, `Mangler breadth-emne ${topic.id}`);
    assert(mapping, `Mangler breadth-mapping ${topic.id}`);
    assert(topic.method_ids.every((id) => methodIds.has(id)), `${topic.id} har ukjent metode`);

    emne.domain = family.target_domain_id;
    emne.area_id = family.target_domain_id;
    emne.canonical_status = 'canonical';
    emne.registry_version = 'vitenskappensum_v4_6';
    emne.breadth_reconciliation = {
      coverage_family_id: family.coverage_family_id,
      candidate_key: topic.candidate_key,
      hook_id: family.hook.id,
      spec_version: spec.version
    };

    const currentPrimary = mapping.mappings?.[0] || {};
    mapping.title = topic.title;
    mapping.mappings = [{
      ...currentPrimary,
      fagkart_kategori: family.target_domain_id,
      fagkart_kategori_tittel: category.label,
      topic_hook: family.hook.id,
      topic_hook_tittel: family.hook.title,
      mapping_tier: 'primary',
      priority_score: 10,
      tenkere: [],
      thinker_ids: [],
      norwegian_thinker_ids: [],
      norwegian_thinkers: [],
      comparison_pairs: [],
      recommended_oslo_cases: family.hook.recommended_oslo_cases,
      recommended_method_ids: topic.method_ids,
      generator_constraints: {
        ...(currentPrimary.generator_constraints || {}),
        require_concrete_institution_method_model_instrument_or_discovery: true,
        require_external_claim_basis: true,
        do_not_generate_from_hook_label_only: true,
        do_not_generate_from_emne_label_only: true,
        required_emne_prefix: 'em_vit_'
      }
    }];
    mapping.mapping_status = 'tiered+canonical';
    mapping.primary_hooks = [family.hook.id];
    mapping.secondary_hooks = [];
    mapping.reserve_hooks = [];
    mapping.recommended_oslo_cases = family.hook.recommended_oslo_cases;
    mapping.recommended_method_ids = topic.method_ids;
    mapping.canonical_status = 'canonical';
    mapping.registry_version = 'vitenskappensum_v4_6';
    mapping.breadth_reconciliation = {
      coverage_family_id: family.coverage_family_id,
      hook_id: family.hook.id,
      spec_version: spec.version
    };
  }
}

assert(new Set(specTopicIds).size === 24, 'Spec skal eie 24 unike breadth-emner');
assert(fagkart.categories.flatMap((row) => row.topic_hooks || []).length === 64, 'v4.6 skal ha 64 hooks');

for (const method of methods.methods) {
  if ('registry_version' in method) method.registry_version = 'vitenskappensum_v4_6';
}
if ('version' in methods) methods.version = 'v4.6-canonical';
if ('registry_version' in methods) methods.registry_version = 'vitenskappensum_v4_6';
if ('version' in fagkart) fagkart.version = 'v4.6-canonical';
if ('registry_version' in fagkart) fagkart.registry_version = 'vitenskappensum_v4_6';

manifest.vitenskap.canonicalModelVersion = '4.6';
manifest.vitenskap.pensum = 'vitenskap/vitenskappensum_canonical_v4_6.json';
manifest.vitenskap.emner = 'vitenskap/emner_vitenskap_canonical_v4_6.json';
manifest.vitenskap.fagkart = 'vitenskap/fagkart_vitenskap_canonical_v4_6.json';
manifest.vitenskap.methods = 'vitenskap/methods_vitenskap_canonical_v4_6.json';
manifest.vitenskap.emneMappings = 'vitenskap/emnemapping_vitenskap_canonical_v4_6.json';
manifest.vitenskap.universityBreadthReconciliation = 'vitenskap/vitenskap_university_breadth_reconciliation_v1.json';
assert(manifest.vitenskap.specializations?.teknologi?.canonicalParentSubject === 'vitenskap', 'Teknologi har mistet canonical parent');

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

readiness.version = '1.2.0';
readiness.status = 'breadth_inventory_reconciled_chapter_production_in_progress';
readiness.complete_ready = false;
Object.assign(readiness.current_inventory.vitenskap, {
  domain_count: 6,
  emne_count: 117,
  method_count: 84,
  mapping_count: 117,
  hook_count: 64,
  registered_chapter_count: 1
});
readiness.blocking_gaps = [];
readiness.editorial_blockers = spec.families.map((family) => family.coverage_family_id);
readiness.next_gate = 'remaining_chapter_production_across_reconciled_university_breadth';
for (const familySpec of spec.families) {
  const family = readiness.coverage_families.find((row) => row.id === familySpec.coverage_family_id);
  assert(family, `Readiness mangler ${familySpec.coverage_family_id}`);
  family.status = 'inventory_reconciled';
  family.requires_canonical_inventory_change = false;
  family.reconciled_emne_ids = familySpec.topics.map((topic) => topic.id);
  family.reconciled_hook_id = familySpec.hook.id;
  family.reconciliation_spec = P.spec;
}

const statusEntry = status.subjects.find((row) => row.id === 'vitenskap');
assert(statusEntry, 'Subject status mangler Vitenskap');
statusEntry.editorialStatus = 'chapters_in_progress';
statusEntry.nextGate = 'remaining_chapter_production_across_reconciled_university_breadth';
assert(registry.subjects?.vitenskap?.chapters?.length === 1, 'Registry må bevare Unit 1');

write(P.pensum, pensum);
write(P.emners, emners);
write(P.mappings, mappings);
write(P.fagkart, fagkart);
write(P.methods, methods);
write(P.manifest, manifest);
write(P.generator, generator);
write(P.readiness, readiness);
write(P.status, status);
write(P.registry, registry);

console.log(JSON.stringify({
  status: 'normalized',
  counts: { domains: 6, emnes: 117, methods: 84, mappings: 117, hooks: 64 },
  breadthTopics: specTopicIds.length,
  structuralBlockingGaps: readiness.blocking_gaps.length,
  editorialBlockers: readiness.editorial_blockers.length,
  completeReady: readiness.complete_ready
}, null, 2));
