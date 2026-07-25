#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
const fagkart = read("data/fag/historie/fagkart_historie_canonical_v4_5.json");
const pensum = read("data/fag/historie/historiepensum_canonical_v4_5.json");
const emnerRaw = read("data/fag/historie/emner_historie_canonical_v4_5.json");
const mappingsRaw = read("data/fag/historie/emnemapping_historie_canonical_v4_5.json");
const methodsRaw = read("data/fag/historie/methods_historie_canonical_v4_5.json");
const generator = read("data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json");
const blueprints = read("reports/historie-canonical-migration/byhistorie-question-blueprints.json");

const emner = Array.isArray(emnerRaw) ? emnerRaw : emnerRaw.emner;
const mappings = Array.isArray(mappingsRaw) ? mappingsRaw : mappingsRaw.mappings;
const methods = Array.isArray(methodsRaw) ? methodsRaw : methodsRaw.methods;
const domainId = "his_byhistorie_stedsendring";
const category = fagkart.categories.find((item) => item.id === domainId);
const domain = pensum.domains.find((item) => item.domain_id === domainId);
const targetIds = domain?.emne_ids ?? [];
const newMethodIds = [
  "met_historisk_gis",
  "met_romlig_historie",
  "met_planhistorisk_analyse",
  "met_arealbruksendringsanalyse",
  "met_eiendoms_og_verdidynamikkanalyse"
];

let pass = 0;
let fail = 0;
function check(condition, label) {
  if (condition) {
    console.log(`PASS | ${label}`);
    pass += 1;
  } else {
    console.log(`FAIL | ${label}`);
    fail += 1;
  }
}

check(Boolean(category), "domain category exists");
check(Boolean(domain), "pensum domain exists");
check(domain?.status === "complete_revised", "domain complete_revised");
check(category?.topic_hooks?.length === 10, "10 hooks");
check(new Set((category?.topic_hooks ?? []).map((item) => item.id)).size === 10, "unique hooks");

for (const hook of category?.topic_hooks ?? []) {
  check(hook.canon?.thinkers?.length === 4, `${hook.id}: four thinkers`);
  check((hook.recommended_method_ids ?? []).length >= 2, `${hook.id}: methods`);
  check((hook.recommended_oslo_cases ?? []).length >= 4, `${hook.id}: cases`);
  check((hook.critical_distinctions ?? []).length >= 4, `${hook.id}: distinctions`);
  check(hook.generator_constraints?.require_defined_spatial_unit === true, `${hook.id}: spatial unit`);
  check(hook.generator_constraints?.require_before_after_state === true, `${hook.id}: before/after`);
  check(hook.generator_constraints?.require_intervention_or_driver === true, `${hook.id}: driver`);
  check(hook.generator_constraints?.require_physical_or_function_change === true, `${hook.id}: change`);
  check(hook.generator_constraints?.require_affected_group === true, `${hook.id}: affected group`);
  check(hook.generator_constraints?.require_source_limitation === true, `${hook.id}: limitation`);
}

check(domain?.emne_count === 10, "pensum emne count");
check(domain?.hook_count === 10, "pensum hook count");
check(domain?.method_count === 10, "pensum method count");
check(targetIds.length === 10 && new Set(targetIds).size === 10, "10 unique emners");
check(Array.isArray(domain?.domain_chain) && domain.domain_chain.length >= 10, "domain chain");
check(Object.keys(domain?.boundary_rules ?? {}).length >= 6, "boundary rules");

for (const emneId of targetIds) {
  const emne = emner.find((item) => item.emne_id === emneId);
  const mapping = mappings.find((item) => item.emne_id === emneId);
  check(Boolean(emne), `${emneId}: exists`);
  check(emne?.mapping_count === 2, `${emneId}: mapping count`);
  check(emne?.defined_spatial_unit_required === true, `${emneId}: spatial unit`);
  check(emne?.before_after_state_required === true, `${emneId}: before/after`);
  check(emne?.intervention_or_driver_required === true, `${emneId}: driver`);
  check(emne?.physical_or_function_change_required === true, `${emneId}: change`);
  check(emne?.affected_group_required === true, `${emneId}: affected group`);
  check(emne?.source_limitation_required === true, `${emneId}: limitation`);
  check(emne?.critical_distinction_required === true, `${emneId}: distinction`);
  check(mapping?.mappings?.length === 2, `${emneId}: two lanes`);
  check(mapping?.primary_hooks?.length === 1, `${emneId}: primary hook`);
  check(mapping?.secondary_hooks?.length === 1, `${emneId}: secondary hook`);
  for (const lane of mapping?.mappings ?? []) {
    check(lane.external_claim_basis_required === true, `${emneId}/${lane.topic_hook}: claim basis`);
    check(lane.defined_spatial_unit_required === true, `${emneId}/${lane.topic_hook}: spatial unit`);
    check(lane.before_after_state_required === true, `${emneId}/${lane.topic_hook}: before/after`);
    check(lane.intervention_or_driver_required === true, `${emneId}/${lane.topic_hook}: driver`);
    check(lane.physical_or_function_change_required === true, `${emneId}/${lane.topic_hook}: change`);
    check(lane.affected_group_required === true, `${emneId}/${lane.topic_hook}: affected group`);
    check(lane.limitation_required === true, `${emneId}/${lane.topic_hook}: limitation`);
    check(lane.critical_distinction_required === true, `${emneId}/${lane.topic_hook}: distinction`);
  }
}

for (const methodId of newMethodIds) {
  const method = methods.find((item) => item.method_id === methodId);
  check(Boolean(method), `${methodId}: exists`);
  check(method?.claim_basis_required === true, `${methodId}: claim basis`);
  check(method?.defined_spatial_unit_required === true, `${methodId}: spatial unit`);
  check(method?.before_after_state_required === true, `${methodId}: before/after`);
  check(method?.intervention_or_driver_required === true, `${methodId}: driver`);
  check(method?.physical_or_function_change_required === true, `${methodId}: change`);
  check(method?.affected_group_required === true, `${methodId}: affected group`);
  check(method?.source_limitation_required === true, `${methodId}: limitation`);
}

const opening = generator.normal_opening_contract;
check(opening?.sets?.["1"]?.question_count === 7, "set 1 has seven");
check(opening?.sets?.["2"]?.question_count === 7, "set 2 has seven");
check(opening?.sets?.["1"]?.surface === "normal_quiz", "set 1 normal quiz");
check(opening?.sets?.["2"]?.surface === "normal_quiz", "set 2 normal quiz");
check(opening?.analysis_begins_from_set === 3, "analysis starts set 3");
check(opening?.theory_begins_from_set === 4, "theory starts set 4");
check(opening?.sets?.["1"]?.theory_names_forbidden === true, "set 1 blocks theory");
check(opening?.sets?.["2"]?.method_names_forbidden === true, "set 2 blocks methods");

const profile = generator.domain_profiles?.[domainId];
check(profile?.status === "complete_revised", "generator profile active");
check(profile?.hook_ids?.length === 10, "generator 10 hooks");
check(profile?.emne_ids?.length === 10, "generator 10 emners");
check(profile?.method_ids?.length === 10, "generator 10 methods");
check(blueprints.length === 10, "10 blueprints");
check(generator.canonical_inputs?.emne_count === emner.length, "emne count synced");
check(generator.canonical_inputs?.method_count === methods.length, "method count synced");
check(generator.canonical_inputs?.mapping_count === mappings.length, "mapping count synced");
check(generator.canonical_inputs?.domain_count === pensum.domains.length, "domain count synced");

console.log(`RESULT | ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
