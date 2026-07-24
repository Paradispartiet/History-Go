import fs from "node:fs";

const R = "politikk-konflikt-vertical-2026-07-24";
const DOMAIN = "konflikt_makt_sivilsamfunn";
const base = "data/fag/politikk";
const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const fagkart = read(`${base}/fagkart_politikk_canonical_v4_5.json`);
const emner = read(`${base}/emner_politikk_canonical_v4_5.json`);
const methods = read(`${base}/methods_politikk_canonical_v4_5.json`);
const mapping = read(`${base}/emnemapping_politikk_canonical_v4_5.json`);
const pensum = read(`${base}/politikkpensum_canonical_v4_5.json`);
const generator = read(`${base}/quiz_generator_rules_politikk_v5_1_source_priority_patch.json`);
const blueprints = read("reports/politikk-canonical-migration/konflikt-makt-question-blueprints.json");

let pass = 0;
const ok = (value, message) => {
  if (!value) throw new Error(`FAIL | ${message}`);
  console.log(`PASS | ${message}`);
  pass += 1;
};

const domain = fagkart.categories.find((item) => item.id === DOMAIN);
ok(domain?.quality_revision === R, "Fagkartdomenet har ny revisjon");
ok(domain?.topic_hooks?.length === 10, "Domenet har 10 hooks");
for (const hook of domain.topic_hooks) {
  ok(hook.quality_revision === R, `Hook ${hook.id} har ny revisjon`);
  ok(hook.mechanisms?.length >= 5, `Hook ${hook.id} har mekanismer`);
  ok(hook.critical_distinctions?.length >= 3, `Hook ${hook.id} har distinksjoner`);
  ok(hook.theory_lenses?.length === 3, `Hook ${hook.id} har tre teorispor`);
  ok(hook.case_anchors?.length >= 2, `Hook ${hook.id} har caseankre`);
  ok(hook.recommended_method_ids?.length >= 2, `Hook ${hook.id} har målrettede metoder`);
  ok(hook.generator_constraints?.require_actor_and_claim_identification === true, `Hook ${hook.id} krever aktør og krav`);
  ok(hook.generator_constraints?.require_mechanism_explanation === true, `Hook ${hook.id} krever mekanisme`);
  ok(hook.generator_constraints?.require_critical_distinction === true, `Hook ${hook.id} krever distinksjon`);
  ok(hook.generator_constraints?.ban_theorist_name_as_answer_without_concept === true, `Hook ${hook.id} forbyr løsrevet teoretikernavn`);
}

const revisedEmnes = emner.filter((item) => item.quality_revision === R);
ok(revisedEmnes.length === 8, "Åtte konflikt-emner er direkte revidert");
for (const emne of revisedEmnes) {
  ok(emne.mechanisms?.length >= 5, `Emne ${emne.emne_id} har mekanismer`);
  ok(emne.distinguish_from?.length >= 3, `Emne ${emne.emne_id} har distinksjoner`);
  ok(emne.recommended_method_ids?.length >= 2, `Emne ${emne.emne_id} har målrettede metoder`);
  ok(emne.canonical_thinker_ids?.length === 3, `Emne ${emne.emne_id} har tre teorispor`);
  ok(emne.generator_constraints?.require_actor_and_claim_identification === true, `Emne ${emne.emne_id} krever aktør og krav`);
  ok(emne.generator_constraints?.ban_theorist_name_as_answer_without_concept === true, `Emne ${emne.emne_id} forbyr løsrevet teoretikernavn`);
}

const methodIds = new Set(methods.methods.map((method) => method.method_id));
const profiled = methods.methods.filter((method) => method.domain_profiles?.[DOMAIN]?.quality_revision === R);
ok(profiled.length === 13, "Tretten metoder har konfliktprofil");
for (const method of profiled) {
  const profile = method.domain_profiles[DOMAIN];
  ok(profile.mechanism_focus?.length >= 3, `Metode ${method.method_id} har mekanismeprofil`);
  ok(profile.critical_distinctions?.length >= 3, `Metode ${method.method_id} har distinksjoner`);
  ok(profile.source_requirements?.length >= 3, `Metode ${method.method_id} har kildekrav`);
}

const mappings = [];
for (const item of mapping) {
  for (const candidate of item.mappings || []) {
    if (candidate.fagkart_kategori === DOMAIN) mappings.push(candidate);
  }
}
ok(mappings.length === 20, "Tjue mappinger finnes for domenet");
for (const item of mappings) {
  ok(item.quality_revision === R, `Mapping ${item.topic_hook} har ny revisjon`);
  ok(item.claim_basis_required === true, `Mapping ${item.topic_hook} krever claim basis`);
  ok(item.actor_and_claim_required === true, `Mapping ${item.topic_hook} krever aktør og krav`);
  ok(item.mechanism_options?.length >= 5, `Mapping ${item.topic_hook} har mekanismer`);
  ok(item.critical_distinction_options?.length >= 3, `Mapping ${item.topic_hook} har distinksjoner`);
  ok(item.theory_lenses?.length === 3, `Mapping ${item.topic_hook} har tre teorispor`);
  ok(item.recommended_method_ids?.length >= 2, `Mapping ${item.topic_hook} har målrettede metoder`);
  ok(item.recommended_method_ids.every((id) => methodIds.has(id)), `Mapping ${item.topic_hook} peker til gyldige metoder`);
  ok(item.generator_constraints?.require_actor_and_claim_identification === true, `Mapping ${item.topic_hook} krever aktør og krav`);
  ok(item.generator_constraints?.require_mechanism_explanation === true, `Mapping ${item.topic_hook} krever mekanisme`);
  ok(item.generator_constraints?.require_critical_distinction === true, `Mapping ${item.topic_hook} krever distinksjon`);
  ok(item.generator_constraints?.ban_theorist_name_as_answer_without_concept === true, `Mapping ${item.topic_hook} forbyr løsrevet teoretikernavn`);
}

const pensumDomain = pensum.domains.find((item) => item.domain_id === DOMAIN);
ok(pensumDomain?.status === "complete_revised", "Pensum markerer domenet complete_revised");
ok(pensumDomain?.quality_revision === R, "Pensum har ny kvalitetsrevisjon");
ok(pensumDomain?.generator_profile === DOMAIN, "Pensum dokumenterer aktiv generatorprofil");
ok(pensumDomain?.revised_method_ids?.length === 13, "Pensum peker til 13 reviderte metodeprofiler");
ok(pensumDomain?.vertical_chain_status?.mappings_revised === 20, "Pensum dokumenterer 20 reviderte mappinger");

const profile = generator.domain_quality_profiles?.[DOMAIN];
ok(profile?.status === "complete_revised" && profile?.quality_revision === R, "Generatorprofilen er aktiv og komplett revidert");
ok(profile?.revised_hook_ids?.length === 10, "Generatorprofilen peker til 10 hooks");
ok(profile?.revised_emne_ids?.length === 8, "Generatorprofilen peker til 8 emner");
ok(profile?.revised_method_ids?.length === 13, "Generatorprofilen peker til 13 metoder");
ok(profile?.generator_constraints?.require_actor_and_claim_identification === true, "Generatorprofilen krever aktør og krav");
ok(profile?.generator_constraints?.ban_theorist_name_as_answer_without_concept === true, "Generatorprofilen forbyr løsrevet teoretikernavn");

ok(blueprints.length === 10, "Det finnes 10 representative spørsmålsplaner");
for (const blueprint of blueprints) {
  ok(Boolean(blueprint.source_anchor), `Spørsmålsplan ${blueprint.blueprint_id} har kildeanker`);
  ok(Boolean(blueprint.claim_basis), `Spørsmålsplan ${blueprint.blueprint_id} har claim basis`);
  ok(Boolean(blueprint.emne_id), `Spørsmålsplan ${blueprint.blueprint_id} har emne`);
  ok(methodIds.has(blueprint.method_id), `Spørsmålsplan ${blueprint.blueprint_id} har gyldig metode`);
  ok(Boolean(blueprint.mechanism), `Spørsmålsplan ${blueprint.blueprint_id} har mekanisme`);
  ok(Boolean(blueprint.critical_distinction), `Spørsmålsplan ${blueprint.blueprint_id} har distinksjon`);
  ok(Boolean(blueprint.theory_lens?.concept), `Spørsmålsplan ${blueprint.blueprint_id} bruker teoribegrep`);
}

ok(!fs.existsSync("data/fag/politikk/kvalitetslag_v1"), "Ingen kvalitetslag-overlay finnes");
console.log(`PASS: ${pass}`);
console.log("RESULTAT: PASS");
