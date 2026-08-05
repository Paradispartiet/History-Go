import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const by = (...parts) => path.join(root, "data", "fag", "by", ...parts);
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const fail = [];
const pass = [];
const check = (ok, msg) => (ok ? pass : fail).push(msg);
const unique = (values) => new Set(values).size === values.length;

const emner = read(by("emner_by.json"));
const canonicalEmner = read(by("emner_by_canonical_v4_5.json"));
const mapping = read(by("emnemapping.json"));
const methods = read(by("methods_by.json"));
const fagkart = read(by("fagkart_by.json"));
const matrix = read(by("bypensum_matrix.json"));
const curriculum = read(by("curriculum_architecture_by_v1.json"));
const quality = read(by("quality_contract_by_v1.json"));
const sources = read(by("source_registry_by_v1.json"));
const rules = read(by("quiz_generator_rules_by_v5_1_source_priority_patch.json"));

const ids = new Set(emner.map((e) => e.emne_id));
const methodIds = new Set(methods.methods.map((m) => m.method_id));
const hookIds = new Set(fagkart.categories.flatMap((category) => (category.topic_hooks ?? []).map((hook) => hook.id)));
const moduleIds = new Set(curriculum.modules.map((module) => module.module_id));

check(ids.size === emner.length, "emne_ids are unique");
check(unique(methods.methods.map((m) => m.method_id)), "method_ids are unique");
check(unique([...hookIds]), "topic hook ids are unique");
check(moduleIds.size === curriculum.modules.length, "curriculum module ids are unique");
check(JSON.stringify(emner) === JSON.stringify(canonicalEmner), "active and canonical emne files are identical");

const barrier = emner.find((e) => e.emne_id === "em_by_barrierer_forbindelser");
const repaired = new Set(quality.emne_integrity.corruption_targets_repaired);
const copiedFields = quality.emne_integrity.forbid_cross_emne_template_copy;
check(Boolean(barrier), "barrier reference emne exists");
for (const target of repaired) check(ids.has(target), `repair target exists: ${target}`);
for (const e of emner.filter((x) => repaired.has(x.emne_id))) {
  for (const field of copiedFields) {
    check(JSON.stringify(e[field]) !== JSON.stringify(barrier[field]), `${e.emne_id}.${field} is distinct from barrier template`);
  }
}

const stages = new Set(emner.map((e) => e.progression_stage));
for (const stage of ["grunnnivå", "mellomnivå", "avansert"]) check(stages.has(stage), `progression includes ${stage}`);
for (const e of emner) {
  check(["grunnnivå", "mellomnivå", "avansert"].includes(e.progression_stage), `${e.emne_id} has valid progression_stage`);
  if (e.parent_emne_id) check(ids.has(e.parent_emne_id), `${e.emne_id} parent exists: ${e.parent_emne_id}`);
  for (const related of e.related_emner ?? []) check(ids.has(related), `${e.emne_id} related emne exists: ${related}`);
  for (const methodId of e.method_ids ?? []) check(methodIds.has(methodId), `${e.emne_id} method exists: ${methodId}`);
  for (const methodId of e.recommended_methods ?? []) check(methodIds.has(methodId), `${e.emne_id} recommended method exists: ${methodId}`);
  for (const hookId of [...(e.primary_theory_hooks ?? []), ...(e.secondary_theory_hooks ?? []), ...(e.reserve_theory_hooks ?? [])]) check(hookIds.has(hookId), `${e.emne_id} theory hook exists: ${hookId}`);
}

for (const m of methods.methods) {
  for (const field of methods.editorial_contract.required_fields) check(Array.isArray(m[field]) && m[field].length > 0, `${m.method_id}.${field} is operationalized`);
  for (const hookId of m.hook_affinities ?? []) check(hookIds.has(hookId), `${m.method_id} hook affinity exists: ${hookId}`);
}

check(mapping.length === emner.length, "mapping covers every emne exactly once");
check(unique(mapping.map((entry) => entry.emne_id)), "mapping emne_ids are unique");
for (const entry of mapping) {
  check(ids.has(entry.emne_id), `mapping references existing emne: ${entry.emne_id}`);
  for (const methodId of entry.recommended_method_ids ?? []) check(methodIds.has(methodId), `${entry.emne_id} mapping method exists: ${methodId}`);
  for (const hookId of [...(entry.primary_hooks ?? []), ...(entry.secondary_hooks ?? []), ...(entry.reserve_hooks ?? [])]) check(hookIds.has(hookId), `${entry.emne_id} mapping hook exists: ${hookId}`);
  for (const mapped of entry.mappings ?? []) {
    check(hookIds.has(mapped.topic_hook), `${entry.emne_id} mapped hook exists: ${mapped.topic_hook}`);
    for (const methodId of mapped.recommended_method_ids ?? []) check(methodIds.has(methodId), `${entry.emne_id}/${mapped.topic_hook} method exists: ${methodId}`);
  }
}

for (const mod of curriculum.modules) {
  check(Array.isArray(mod.core_emne_ids) && mod.core_emne_ids.length >= 4, `${mod.module_id} has a substantive core`);
  for (const id of mod.core_emne_ids) check(ids.has(id), `${mod.module_id} references existing ${id}`);
  for (const methodId of mod.method_ids ?? []) check(methodIds.has(methodId), `${mod.module_id} method exists: ${methodId}`);
  for (const prerequisite of mod.prerequisite_module_ids ?? []) check(moduleIds.has(prerequisite), `${mod.module_id} prerequisite exists: ${prerequisite}`);
}
check(curriculum.modules.length === 8, "curriculum defines eight editorial modules");
check(fagkart.editorial_architecture?.modules?.length === 8, "fagkart exposes eight editorial modules");

const statuses = new Set(matrix.domains.map((d) => d.status));
check(statuses.size > 1, "coverage matrix no longer marks every domain identically strong");
check(statuses.has("developing"), "coverage matrix exposes a developing domain");
for (const domain of matrix.domains) {
  for (const id of domain.emne_ids ?? []) check(ids.has(id), `${domain.domain_id} emne exists: ${id}`);
  for (const hookId of domain.hook_ids ?? []) check(hookIds.has(hookId), `${domain.domain_id} hook exists: ${hookId}`);
  for (const methodId of domain.method_ids ?? []) check(methodIds.has(methodId), `${domain.domain_id} method exists: ${methodId}`);
  check(domain.emne_count === (domain.emne_ids ?? []).length, `${domain.domain_id} emne_count matches`);
  check(domain.hook_count === (domain.hook_ids ?? []).length, `${domain.domain_id} hook_count matches`);
  check(domain.method_count === (domain.method_ids ?? []).length, `${domain.domain_id} method_count matches`);
}

check(unique(sources.places.map((p) => p.place_id)), "source registry place_ids are unique");
check(sources.places.every((p) => Array.isArray(p.source_refs)), "source registry has explicit source arrays");
for (const place of sources.places) {
  if (place.source_refs.length === 0) {
    check(place.source_status === "needs_external_source_review", `${place.place_id} empty source list is explicitly blocked`);
    check(place.allowed_generation === "on_site_observation_only_when_protocol_logged", `${place.place_id} empty source list allows observation protocol only`);
  }
}
check(rules.generation_metadata_additions.required_per_question_fields.includes("source_refs"), "generator requires source_refs");
check(rules.hard_rules.empty_source_array_forbidden_for_publishable_questions === true, "empty publishable source arrays are forbidden");
check(rules.hard_rules.canonical_files_are_guides_not_content === true, "canonical files remain guidance, not visible content sources");

console.log(`BY editorial integrity: ${pass.length} PASS / ${fail.length} FAIL`);
if (fail.length) {
  for (const item of fail) console.error(`FAIL: ${item}`);
  process.exit(1);
}
