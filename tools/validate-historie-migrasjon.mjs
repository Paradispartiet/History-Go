#!/usr/bin/env node
import fs from "node:fs";
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const pensum = read("data/fag/historie/historiepensum_canonical_v4_5.json");
const fagkart = read("data/fag/historie/fagkart_historie_canonical_v4_5.json");
const emners = read("data/fag/historie/emner_historie_canonical_v4_5.json");
const mappings = read("data/fag/historie/emnemapping_historie_canonical_v4_5.json");
const methods = read("data/fag/historie/methods_historie_canonical_v4_5.json");
const generator = read("data/fag/historie/quiz_generator_rules_historie_v5_1_source_priority_patch.json");
const blueprints = read("reports/historie-canonical-migration/migrasjon-question-blueprints.json");
const domainId = "his_migrasjon_minoritet_tilhorighet";
const hookIds = ["his_migrasjonsdrivere_flyttestrommer","his_ankomst_bosetting_bolig","his_arbeid_nettverk_naring","his_statsborgerskap_status_rettigheter","his_minoritetspolitikk_kategorisering_registrering","his_sprak_religion_institusjoner","his_familie_transnasjonale_band","his_diskriminering_rasisme_ekskludering","his_organisering_motstand_offentlighet","his_tilhorighet_identitet_minne"];
const emneIds = ["em_his_migrasjon_mangfold","em_his_minoritetshistorie","em_his_tilhorighet_ekskludering","em_his_ankomst_bosetting_bolig","em_his_arbeid_nettverk_naring","em_his_statsborgerskap_status_rettigheter","em_his_sprak_religion_institusjoner","em_his_familie_transnasjonale_band","em_his_diskriminering_rasisme_ekskludering","em_his_organisering_motstand_offentlighet"];
const methodIds = ["met_muntlig_historie","met_arkivlesning","met_sporlesning","met_minneanalyse","met_seriell_kildeanalyse","met_migrasjonsforlopsanalyse","met_bosettings_og_nettverksanalyse","met_rettighetsstatusanalyse","met_minoritetspolitisk_kategorianalyse","met_transnasjonal_husholdsanalyse"];
let pass = 0;
let fail = 0;
const lines = [];
function check(condition, label) {
  if (condition) { pass += 1; lines.push(`PASS | ${label}`); }
  else { fail += 1; lines.push(`FAIL | ${label}`); }
}
const category = fagkart.categories.find((entry) => entry.id === domainId);
const domain = pensum.domains.find((entry) => entry.domain_id === domainId);
check(Boolean(category), "domain category exists");
check(Boolean(domain), "pensum domain exists");
check(category?.status === "complete_revised", "domain complete_revised");
check(category?.topic_hooks?.length === 10, "10 hooks");
check(new Set(category?.topic_hooks?.map((entry) => entry.id)).size === 10, "unique hooks");
for (const hook of category?.topic_hooks || []) {
  check(hook.canon?.thinkers?.length >= 4, `${hook.id}: four thinkers`);
  check(hook.recommended_method_ids?.length >= 2, `${hook.id}: methods`);
  check(hook.recommended_oslo_cases?.length >= 4, `${hook.id}: cases`);
  check(hook.critical_distinctions?.length >= 4, `${hook.id}: distinctions`);
  for (const flag of ["require_migration_actor_or_group", "require_origin_arrival_or_status", "require_practice_or_network", "require_boundary_resource_or_exclusion", "require_individual_household_or_community_consequence", "require_source_limitation", "require_ethical_source_handling", "require_critical_distinction"]) {
    check(hook.generator_constraints?.[flag] === true, `${hook.id}: ${flag}`);
  }
}
check(domain?.emne_count === 10, "pensum emne count");
check(domain?.hook_count === 10, "pensum hook count");
check(domain?.method_count === 10, "pensum method count");
check(domain?.domain_chain?.length >= 10, "domain chain");
check(Object.keys(domain?.boundary_rules || {}).length >= 6, "boundary rules");
const domainEmners = emners.filter((entry) => emneIds.includes(entry.emne_id));
check(domainEmners.length === 10, "10 emners");
for (const emne of domainEmners) {
  check(emne.area_id === domainId, `${emne.emne_id}: area`);
  check(emne.mapping_count === 2, `${emne.emne_id}: mapping count`);
  check(emne.primary_theory_hooks?.length === 1, `${emne.emne_id}: primary hook`);
  check(emne.secondary_theory_hooks?.length === 1, `${emne.emne_id}: secondary hook`);
  check(emne.method_ids?.length >= 3, `${emne.emne_id}: methods`);
  check(emne.recommended_oslo_cases?.length >= 4, `${emne.emne_id}: cases`);
  check(emne.generator_constraints?.require_ethical_source_handling === true, `${emne.emne_id}: ethics`);
}
const domainMappings = mappings.filter((entry) => emneIds.includes(entry.emne_id));
check(domainMappings.length === 10, "10 mappings");
for (const mapping of domainMappings) {
  check(mapping.mappings?.length === 2, `${mapping.emne_id}: two lanes`);
  check(mapping.mappings?.some((entry) => entry.mapping_tier === "primary"), `${mapping.emne_id}: primary lane`);
  check(mapping.mappings?.some((entry) => entry.mapping_tier === "secondary"), `${mapping.emne_id}: secondary lane`);
  check(mapping.mapping_constraints?.require_migration_actor_or_group === true, `${mapping.emne_id}: actor/group`);
  check(mapping.mapping_constraints?.require_ethical_source_handling === true, `${mapping.emne_id}: ethical handling`);
}
for (const id of methodIds) {
  const method = methods.methods.find((entry) => entry.method_id === id);
  check(Boolean(method), `${id}: exists`);
  if (id.startsWith("met_migrasjons") || id.startsWith("met_bosettings") || id.startsWith("met_rettighets") || id.startsWith("met_minoritetspolitisk") || id.startsWith("met_transnasjonal")) {
    check(method?.migration_actor_or_group_required === true, `${id}: actor/group`);
    check(method?.source_limitation_required === true, `${id}: limitation`);
    check(method?.ethical_source_handling_required === true, `${id}: ethics`);
  }
}
const profile = generator.domain_profiles?.[domainId];
check(profile?.status === "complete_revised", "generator profile active");
check(profile?.hook_ids?.length === 10, "generator 10 hooks");
check(profile?.emne_ids?.length === 10, "generator 10 emners");
check(profile?.method_ids?.length === 10, "generator 10 methods");
check(blueprints.length === 10, "10 blueprints");
check(generator.normal_opening_contract != null, "normal opening contract exists");
check(JSON.stringify(generator.normal_opening_contract).includes("7"), "normal opening contract preserves seven");
check(emners.length === 85, "emne count synced");
check(methods.methods.length === 48, "method count synced");
check(mappings.length === 85, "mapping count synced");
check(pensum.domains.length === 12, "domain count synced");
lines.push(`RESULT | ${pass} PASS, ${fail} FAIL`);
console.log(lines.join("\n"));
if (fail) process.exit(1);
