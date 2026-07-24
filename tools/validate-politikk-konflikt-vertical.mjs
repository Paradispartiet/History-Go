#!/usr/bin/env node
import fs from "node:fs";

const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
const domainId = "konflikt_makt_sivilsamfunn";
const revision = "politikk-konflikt-vertical-2026-07-24";
const fag = read("data/fag/politikk/fagkart_politikk_canonical_v4_5.json");
const emner = read("data/fag/politikk/emner_politikk_canonical_v4_5.json");
const methods = read("data/fag/politikk/methods_politikk_canonical_v4_5.json");
const maps = read("data/fag/politikk/emnemapping_politikk_canonical_v4_5.json");
const pensum = read("data/fag/politikk/politikkpensum_canonical_v4_5.json");
const gen = read("data/fag/politikk/quiz_generator_rules_politikk_v5_1_source_priority_patch.json");
const blueprints = read("reports/politikk-canonical-migration/konflikt-makt-question-blueprints.json");

let pass = 0;
let fail = 0;
function check(ok, label) {
  if (ok) { console.log(`PASS | ${label}`); pass++; }
  else { console.error(`FAIL | ${label}`); fail++; }
}
const category = fag.categories.find(x => x.id === domainId);
check(Boolean(category), "Domenet finnes");
check(category?.quality_revision === revision, "Domenet har ny revisjon");
check(category?.topic_hooks?.length === 10, "Domenet har 10 hooks");
for (const hook of category.topic_hooks) {
  check(hook.quality_revision === revision, `Hook ${hook.id} har ny revisjon`);
  check(Boolean(hook.definition && hook.core_problem), `Hook ${hook.id} har definisjon og kjerneproblem`);
  check(hook.mechanisms?.length >= 5, `Hook ${hook.id} har mekanismer`);
  check(hook.critical_distinctions?.length >= 4, `Hook ${hook.id} har distinksjoner`);
  check(hook.theory_lenses?.length === 3, `Hook ${hook.id} har tre teorispor`);
  check(hook.recommended_method_ids?.length >= 3, `Hook ${hook.id} har målrettede metoder`);
  check(hook.generator_constraints?.ban_theorist_name_as_answer_without_concept === true, `Hook ${hook.id} forbyr løsrevet teoretikernavn`);
}
const directEmnes = new Set(["em_pol_makt_interesser", "em_pol_demonstrasjoner_protest", "em_pol_interessegrupper_organisasjoner", "em_pol_arbeidsliv_kollektiv_kamp", "em_pol_miljopolitikk_samfunn", "em_pol_minnesteder_politisk_kamp", "em_pol_normer_doxa", "em_pol_polarisering_tillit"]);
for (const e of emner.filter(x => directEmnes.has(x.emne_id))) {
  check(e.quality_revision === revision, `Emne ${e.emne_id} har ny revisjon`);
  check(e.mechanisms?.length >= 5, `Emne ${e.emne_id} har mekanismer`);
  check(e.key_questions?.length === 3, `Emne ${e.emne_id} har tre nøkkelspørsmål`);
  check(e.canonical_thinker_ids?.length === 3, `Emne ${e.emne_id} har tre målrettede teorispor`);
  check(e.method_ids?.length >= 3, `Emne ${e.emne_id} har målrettede metoder`);
}
const directMethods = new Set(["met_pol_konfliktanalyse", "met_pol_makt_og_interesseanalyse"]);
const domainMethods = new Set(["met_pol_konfliktanalyse", "met_pol_fordelingsanalyse", "met_pol_protest_og_bevegelsesanalyse", "met_pol_offentlighetsanalyse", "met_pol_romlig_maktanalyse", "met_pol_parti_og_bevegelsesanalyse", "met_pol_ideologianalyse", "met_pol_makt_og_interesseanalyse", "met_pol_diskursanalyse", "met_pol_sivilsamfunnsanalyse", "met_pol_symbolanalyse", "met_pol_politisk_historisk_analyse", "met_pol_legitimitetsanalyse"]);
for (const m of methods.methods.filter(x => domainMethods.has(x.method_id))) {
  check(m.domain_profiles?.[domainId]?.quality_revision === revision, `Metode ${m.method_id} har domenprofil`);
  check(m.domain_profiles?.[domainId]?.mechanism_focus?.length >= 5, `Metode ${m.method_id} har mekanismefokus`);
  check(m.domain_profiles?.[domainId]?.critical_distinctions?.length >= 4, `Metode ${m.method_id} har distinksjoner`);
  if (directMethods.has(m.method_id)) check(m.quality_revision === revision, `Direktemetode ${m.method_id} er revidert`);
}
let targetMappings = [];
for (const record of maps) {
  for (const mapping of record.mappings || []) {
    if (mapping.fagkart_kategori === domainId) targetMappings.push(mapping);
  }
}
check(targetMappings.length === 20, "Domenet har 20 mappinger");
for (const m of targetMappings) {
  check(m.quality_revision === revision, `Mapping ${m.topic_hook} har ny revisjon`);
  check(m.mechanism_options?.length >= 5, `Mapping ${m.topic_hook} har mekanismer`);
  check(m.critical_distinction_options?.length >= 4, `Mapping ${m.topic_hook} har distinksjoner`);
  check(m.theory_lenses?.length === 3, `Mapping ${m.topic_hook} har tre teorispor`);
  check(m.recommended_method_ids?.length >= 3, `Mapping ${m.topic_hook} peker til gyldige metoder`);
  check(m.generator_constraints?.ban_theorist_name_as_answer_without_concept === true, `Mapping ${m.topic_hook} forbyr løsrevet teoretikernavn`);
  const targeted = new Set(m.thinker_ids || []);
  check((m.norwegian_thinker_ids || []).every(x => targeted.has(x)), `Mapping ${m.topic_hook} har ingen gamle norske teorispor`);
}
const pd = pensum.domains.find(x => x.domain_id === domainId);
check(pd?.status === "complete_revised", "Pensum markerer domenet complete_revised");
check(pd?.vertical_chain_status?.mappings_revised === 20, "Pensum dokumenterer 20 mappinger");
const profile = gen.domain_quality_profiles?.[domainId];
check(profile?.status === "complete_revised", "Generatorprofilen er aktiv og komplett revidert");
check(profile?.required_method_ids?.length === 13, "Generatorprofilen peker til 13 metoder");
check(profile?.hard_requirements?.mechanism_explanation_required === true, "Generatoren krever mekanisme");
check(profile?.hard_requirements?.critical_distinction_required === true, "Generatoren krever distinksjon");
check(profile?.hard_requirements?.ban_theorist_name_as_answer_without_concept === true, "Generatoren forbyr løsrevet teoretikernavn");
check(blueprints.length === 10, "Det finnes 10 representative spørsmålsplaner");
for (const b of blueprints) {
  check(Boolean(b.source_requirement && b.emne_id && b.method_id && b.mechanism && b.critical_distinction), "Spørsmålsplan har kilde, emne, metode, mekanisme og distinksjon");
}
check(!fs.existsSync("data/fag/politikk/kvalitetslag_v1"), "Ingen kvalitetslag-overlay finnes");
console.log(`PASS: ${pass}`);
if (fail) {
  console.error(`FAIL: ${fail}`);
  process.exit(1);
}
console.log("RESULTAT: PASS");
