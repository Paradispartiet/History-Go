import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const fagkart = read("data/fag/historie/fagkart_historie_canonical_v4_5.json");
const pensum = read("data/fag/historie/historiepensum_canonical_v4_5.json");
const emnerRaw = read("data/fag/historie/emner_historie_canonical_v4_5.json");
const mappingRaw = read("data/fag/historie/emnemapping_historie_canonical_v4_5.json");
const methods = read("data/fag/historie/methods_historie_canonical_v4_5.json");
const generator = read("data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json");
const blueprints = read("reports/historie-canonical-migration/makt-stat-institusjoner-question-blueprints.json");

const emner = Array.isArray(emnerRaw) ? emnerRaw : emnerRaw.emner || [];
const mappings = Array.isArray(mappingRaw) ? mappingRaw : mappingRaw.mappings || [];
const domainId = "his_makt_stat_institusjoner";
const category = fagkart.categories.find((item) => item.id === domainId);
const domain = pensum.domains.find((item) => item.domain_id === domainId);
const emneIds = domain?.emne_ids || [];
const newMethodIds = [
  "met_beslutningskjedeanalyse",
  "met_forvaltningshistorisk_saksanalyse",
  "met_rettshistorisk_analyse",
  "met_kontrollregimeanalyse",
  "met_statskapasitetsanalyse"
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

check(domain?.status === "complete_revised", "domain complete_revised");
check(category?.topic_hooks?.length === 10, "10 hooks");
check(new Set(category?.topic_hooks?.map((item) => item.id)).size === 10, "unique hooks");
for (const hook of category?.topic_hooks || []) {
  check(hook.canon?.thinkers?.length === 4, `${hook.id}: four thinkers`);
  check(hook.recommended_method_ids?.length >= 3, `${hook.id}: methods`);
  check(hook.recommended_oslo_cases?.length >= 4, `${hook.id}: cases`);
  check(hook.critical_distinctions?.length >= 4, `${hook.id}: distinctions`);
  check(hook.generator_constraints?.require_institutional_chain === true, `${hook.id}: institutional chain`);
  check(hook.generator_constraints?.require_authority_or_rule_basis === true, `${hook.id}: authority/rule`);
  check(hook.generator_constraints?.require_implementation_or_consequence === true, `${hook.id}: implementation/consequence`);
}
check(domain?.emne_count === 10, "pensum emne count");
check(domain?.hook_count === 10, "pensum hook count");
check(domain?.method_count === 10, "pensum method count");
check(emneIds.length === 10 && new Set(emneIds).size === 10, "10 unique emner");
for (const emneId of emneIds) {
  const emne = emner.find((item) => item.emne_id === emneId);
  const mapping = mappings.find((item) => item.emne_id === emneId);
  check(Boolean(emne), `${emneId}: exists`);
  check(emne?.mapping_count === 2, `${emneId}: mapping count`);
  check(emne?.institutional_chain_required === true, `${emneId}: institutional profile`);
  check(mapping?.mappings?.length === 2, `${emneId}: two lanes`);
  check(mapping?.primary_hooks?.length === 1 && mapping?.secondary_hooks?.length === 1, `${emneId}: primary and secondary`);
  check(mapping?.mapping_constraints?.require_institutional_chain === true, `${emneId}: mapping chain`);
  check(mapping?.mapping_constraints?.require_authority_or_rule_basis === true, `${emneId}: mapping authority`);
  check(mapping?.mapping_constraints?.require_implementation_or_consequence === true, `${emneId}: mapping consequence`);
  for (const lane of mapping?.mappings || []) {
    check(lane.institutional_chain_required === true, `${emneId}/${lane.topic_hook}: chain`);
    check(lane.authority_or_rule_basis_required === true, `${emneId}/${lane.topic_hook}: authority`);
    check(lane.implementation_or_consequence_required === true, `${emneId}/${lane.topic_hook}: consequence`);
    check(lane.critical_distinction_required === true, `${emneId}/${lane.topic_hook}: distinction`);
  }
}
for (const methodId of newMethodIds) {
  const method = methods.methods.find((item) => item.method_id === methodId);
  check(Boolean(method), `${methodId}: exists`);
  check(method?.source_object_required === true, `${methodId}: source object`);
  check(method?.claim_basis_required === true, `${methodId}: claim basis`);
  check(method?.institutional_chain_required === true, `${methodId}: chain`);
  check(method?.authority_or_rule_basis_required === true, `${methodId}: authority`);
  check(method?.implementation_or_consequence_required === true, `${methodId}: consequence`);
}
check(generator.normal_opening_contract?.sets?.["1"]?.question_count === 7, "set 1 has seven");
check(generator.normal_opening_contract?.sets?.["2"]?.question_count === 7, "set 2 has seven");
check(generator.normal_opening_contract?.sets?.["1"]?.theory_names_forbidden === true, "set 1 blocks theory");
check(generator.normal_opening_contract?.sets?.["2"]?.method_names_forbidden === true, "set 2 blocks methods");
check(generator.domain_profiles?.[domainId]?.status === "complete_revised", "generator profile active");
check(generator.domain_profiles?.[domainId]?.hook_ids?.length === 10, "generator hook count");
check(generator.domain_profiles?.[domainId]?.emne_ids?.length === 10, "generator emne count");
check(blueprints.blueprint_count === 10 && blueprints.blueprints?.length === 10, "10 blueprints");
check(generator.canonical_inputs?.emne_count === emner.length, "emne count synced");
check(generator.canonical_inputs?.method_count === methods.methods.length, "method count synced");
check(generator.canonical_inputs?.mapping_count === mappings.length, "mapping count synced");

console.log(`RESULT | ${pass} PASS, ${fail} FAIL`);
if (fail > 0) process.exit(1);
