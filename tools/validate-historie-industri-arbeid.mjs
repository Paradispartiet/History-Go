#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const fagkart = read("data/fag/historie/fagkart_historie_canonical_v4_5.json");
const pensum = read("data/fag/historie/historiepensum_canonical_v4_5.json");
const emnerRaw = read("data/fag/historie/emner_historie_canonical_v4_5.json");
const mappingRaw = read("data/fag/historie/emnemapping_historie_canonical_v4_5.json");
const methodsDoc = read("data/fag/historie/methods_historie_canonical_v4_5.json");
const generator = read("data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json");
const blueprints = read("reports/historie-canonical-migration/industri-arbeid-question-blueprints.json");

const emner = Array.isArray(emnerRaw) ? emnerRaw : emnerRaw.emner || [];
const mappings = Array.isArray(mappingRaw) ? mappingRaw : mappingRaw.mappings || [];
const methods = methodsDoc.methods || [];
const domainId = "his_industri_arbeid_sosialhistorie";
const category = fagkart.categories.find((item) => item.id === domainId);
const domain = pensum.domains.find((item) => item.domain_id === domainId);
const targetIds = domain?.emne_ids || [];
const newMethodIds = [
  "met_industriell_stedsanalyse",
  "met_arbeidsprosessanalyse",
  "met_livsvilkarsanalyse",
  "met_arbeidskonfliktanalyse",
  "met_arbeidsmiljohistorisk_analyse"
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
check(new Set((category?.topic_hooks || []).map((h) => h.id)).size === 10, "unique hooks");

for (const hook of category?.topic_hooks || []) {
  check(hook.canon?.thinkers?.length === 4, `${hook.id}: four thinkers`);
  check((hook.recommended_method_ids || []).length >= 2, `${hook.id}: methods`);
  check((hook.recommended_oslo_cases || []).length >= 4, `${hook.id}: cases`);
  check((hook.critical_distinctions || []).length >= 4, `${hook.id}: distinctions`);
  check(hook.generator_constraints?.require_industrial_or_work_unit === true, `${hook.id}: work unit`);
  check(hook.generator_constraints?.require_labor_relation_or_process === true, `${hook.id}: labor relation`);
  check(hook.generator_constraints?.require_worker_or_household_consequence === true, `${hook.id}: consequence`);
  check(hook.generator_constraints?.require_source_limitation === true, `${hook.id}: limitation`);
}

check(domain?.emne_count === 10, "pensum emne count");
check(domain?.hook_count === 10, "pensum hook count");
check(domain?.method_count === 10, "pensum method count");
check(targetIds.length === 10 && new Set(targetIds).size === 10, "10 unique emners");

for (const emneId of targetIds) {
  const emne = emner.find((item) => item.emne_id === emneId);
  const mapping = mappings.find((item) => item.emne_id === emneId);
  check(Boolean(emne), `${emneId}: exists`);
  check(emne?.mapping_count === 2, `${emneId}: mapping count`);
  check(emne?.industrial_or_work_unit_required === true, `${emneId}: work unit`);
  check(emne?.labor_relation_or_process_required === true, `${emneId}: labor relation`);
  check(emne?.worker_or_household_consequence_required === true, `${emneId}: consequence`);
  check(emne?.source_limitation_required === true, `${emneId}: limitation`);
  check(emne?.critical_distinction_required === true, `${emneId}: distinction`);
  check(mapping?.mappings?.length === 2, `${emneId}: two lanes`);
  check(mapping?.primary_hooks?.length === 1, `${emneId}: primary hook`);
  check(mapping?.secondary_hooks?.length === 1, `${emneId}: secondary hook`);
  for (const lane of mapping?.mappings || []) {
    check(lane.external_claim_basis_required === true, `${emneId}/${lane.topic_hook}: claim basis`);
    check(lane.industrial_or_work_unit_required === true, `${emneId}/${lane.topic_hook}: work unit`);
    check(lane.labor_relation_or_process_required === true, `${emneId}/${lane.topic_hook}: labor relation`);
    check(lane.worker_or_household_consequence_required === true, `${emneId}/${lane.topic_hook}: consequence`);
    check(lane.limitation_required === true, `${emneId}/${lane.topic_hook}: limitation`);
    check(lane.critical_distinction_required === true, `${emneId}/${lane.topic_hook}: distinction`);
  }
}

for (const methodId of newMethodIds) {
  const method = methods.find((item) => item.method_id === methodId);
  check(Boolean(method), `${methodId}: exists`);
  check(method?.claim_basis_required === true, `${methodId}: claim basis`);
  check(method?.industrial_or_work_unit_required === true, `${methodId}: work unit`);
  check(method?.labor_relation_or_process_required === true, `${methodId}: labor relation`);
  check(method?.worker_or_household_consequence_required === true, `${methodId}: consequence`);
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
