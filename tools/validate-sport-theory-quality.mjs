#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));

const paths = {
  manifest: "data/fag/sport/sport_quality_manifest_v5.json",
  hooks: "data/fag/sport/theory_hooks_sport_canonical_v5.json",
  thinkers: "data/fag/sport/teoretikere_sport_canonical_v5.json",
  concepts: "data/fag/sport/begreper_sport_canonical_v5.json",
  methods: "data/fag/sport/methods_sport_quality_v5.json",
  curriculum: "data/fag/sport/sportpensum_extension_canonical_v5.json",
  profile: "data/fag/sport/supersetQUIZMAL_sport.json",
  report: "reports/sport-theory-quality-validation.json"
};

const [manifest, hookFile, thinkerFile, conceptFile, methodFile, curriculum, profile] =
  await Promise.all([
    readJson(paths.manifest),
    readJson(paths.hooks),
    readJson(paths.thinkers),
    readJson(paths.concepts),
    readJson(paths.methods),
    readJson(paths.curriculum),
    readJson(paths.profile)
  ]);

const failures = [];
const require = (condition, message, details = undefined) => {
  if (!condition) failures.push(details ? { message, details } : { message });
};
const uniqueIds = (items, key, label) => {
  const ids = items.map((item) => item?.[key]);
  require(ids.every((id) => typeof id === "string" && id.trim()), `${label}: mangler gyldig ${key}`);
  require(new Set(ids).size === ids.length, `${label}: dupliserte ${key}`);
  return new Set(ids);
};
const allRefsExist = (items, refKey, known, label) => {
  for (const item of items) {
    for (const ref of item?.[refKey] || []) {
      require(known.has(ref), `${label}: ukjent referanse`, {
        item: item.hook_id || item.thinker_id || item.concept_id || item.method_id || item.module_id,
        refKey,
        ref
      });
    }
  }
};

const areas = hookFile.areas || [];
const hooks = hookFile.hooks || [];
const thinkers = thinkerFile.thinkers || [];
const concepts = conceptFile.concepts || [];
const methods = methodFile.methods || [];
const modules = curriculum.modules || [];

const areaIds = uniqueIds(areas, "area_id", "fagområder");
const hookIds = uniqueIds(hooks, "hook_id", "teorihooks");
const thinkerIds = uniqueIds(thinkers, "thinker_id", "teoretikere");
const conceptIds = uniqueIds(concepts, "concept_id", "begreper");
const methodIds = uniqueIds(methods, "method_id", "metoder");
uniqueIds(modules, "module_id", "moduler");

require(areas.length >= 12, "for få fagområder", areas.length);
require(hooks.length >= 48, "for få teorihooks", hooks.length);
require(methods.length >= 32, "for få metoder", methods.length);
require(modules.length >= 14, "for få pensummoduler", modules.length);
require(thinkers.length >= 120, "for få teoretikere og praksisfigurer", thinkers.length);
require(thinkers.filter((item) => item.status === "active").length >= 110, "for få aktive teoretikere");
require(concepts.length >= 120, "for få definerte begreper", concepts.length);

for (const area of areas) {
  require((area.hook_ids || []).length === 4, "hvert fagområde skal ha fire teorihooks", area.area_id);
  require((area.method_ids || []).length >= 2, "fagområde mangler metodebredde", area.area_id);
  allRefsExist([area], "hook_ids", hookIds, "fagområde");
  allRefsExist([area], "method_ids", methodIds, "fagområde");
}

for (const hook of hooks) {
  require(areaIds.has(hook.area_id), "hook viser til ukjent fagområde", hook.hook_id);
  require((hook.thinker_ids || []).length >= 4, "hook har færre enn fire relevante teoretikere", hook.hook_id);
  require((hook.concept_ids || []).length >= 5, "hook har for få begreper", hook.hook_id);
  require((hook.method_ids || []).length >= 2, "hook har for få metoder", hook.hook_id);
  require((hook.source_types || []).length >= 3, "hook har for få kildetyper", hook.hook_id);
  require((hook.question_moves || []).length >= 3, "hook mangler spørsmålsveiledning", hook.hook_id);
}
allRefsExist(hooks, "thinker_ids", thinkerIds, "hook");
allRefsExist(hooks, "concept_ids", conceptIds, "hook");
allRefsExist(hooks, "method_ids", methodIds, "hook");

for (const thinker of thinkers) {
  require(typeof thinker.key_contribution === "string" && thinker.key_contribution.length >= 40,
    "teoretiker mangler presist bidrag", thinker.thinker_id);
  require((thinker.hook_ids || []).length >= 1, "teoretiker mangler hook", thinker.thinker_id);
  require(thinker.direct_name_question_allowed === false, "navnegjetting må være blokkert", thinker.thinker_id);
}
allRefsExist(thinkers, "hook_ids", hookIds, "teoretiker");
allRefsExist(thinkers, "concept_ids", conceptIds, "teoretiker");

for (const concept of concepts) {
  require(typeof concept.definition === "string" && concept.definition.length >= 45,
    "begrep har for svak definisjon", concept.concept_id);
  require(typeof concept.distinguishes_from === "string" && concept.distinguishes_from.length >= 3,
    "begrep mangler avgrensning", concept.concept_id);
  require(typeof concept.common_misconception === "string" && concept.common_misconception.length >= 20,
    "begrep mangler typisk misforståelse", concept.concept_id);
  require((concept.hook_ids || []).length >= 1, "begrep mangler hook", concept.concept_id);
  require(typeof concept.quiz_guidance === "string" && concept.quiz_guidance.length >= 40,
    "begrep mangler quizveiledning", concept.concept_id);
}
allRefsExist(concepts, "hook_ids", hookIds, "begrep");
allRefsExist(concepts, "related_concept_ids", conceptIds, "begrep");

for (const method of methods) {
  require((method.area_ids || []).length >= 1, "metode mangler fagområde", method.method_id);
  require((method.data_forms || []).length >= 2, "metode mangler datagrunnlag", method.method_id);
  require(typeof method.limitations === "string" && method.limitations.length >= 35,
    "metode mangler begrensning", method.method_id);
}
allRefsExist(methods, "area_ids", areaIds, "metode");

for (const module of modules) {
  require((module.hook_ids || []).length >= 4, "modul mangler teoribredde", module.module_id);
  require((module.method_ids || []).length >= 2, "modul mangler metoder", module.module_id);
  require((module.concept_ids || []).length >= 6, "modul mangler begreper", module.module_id);
  require((module.learning_objectives || []).length >= 3, "modul mangler læringsmål", module.module_id);
}
allRefsExist(modules, "area_ids", areaIds, "modul");
allRefsExist(modules, "hook_ids", hookIds, "modul");
allRefsExist(modules, "method_ids", methodIds, "modul");
allRefsExist(modules, "concept_ids", conceptIds, "modul");

const expectedQualityPaths = {
  manifest: paths.manifest,
  theory_hooks: paths.hooks,
  thinkers: paths.thinkers,
  concepts: paths.concepts,
  methods: paths.methods,
  curriculum: paths.curriculum
};
for (const [key, expected] of Object.entries(expectedQualityPaths)) {
  require(profile.quality_layer?.[key] === expected, "quizprofil peker til feil quality-fil", {
    key,
    expected,
    actual: profile.quality_layer?.[key]
  });
}
require(profile.version === "3.0", "sportprofilen skal være versjon 3.0");
require(profile.status === "canonical_category_profile", "sportprofilen har feil status");
require(profile.categoryId === "sport", "sportprofilen har feil kategori");
require(profile.required_emne_prefix === "em_sport_", "sportprofilen har feil emneprefiks");
require((profile.content_priorities || []).length >= 10, "sportprofilen har for smal innholdsbalanse");
require((profile.essential_concepts || []).length >= 20, "sportprofilen har for få kjernebegreper");
require((profile.question_quality?.forbidden || []).some((value) => value.includes("Hvem er best")),
  "sportprofilen blokkerer ikke best-spørsmål");
require((profile.question_quality?.forbidden || []).some((value) => value.includes("medisinsk diagnose")),
  "sportprofilen blokkerer ikke medisinsk overtramp");
require((profile.category_rules || []).some((value) => value.includes("emne_id")),
  "sportprofilen bevarer ikke legacy emne-ID-kompatibilitet");

const targetSum = Object.values(profile.coverage_targets || {}).reduce((sum, value) => sum + Number(value || 0), 0);
require(Math.abs(targetSum - 1) < 1e-9, "dekningsmål summerer ikke til 1", targetSum);

const counts = {
  areas: areas.length,
  hooks: hooks.length,
  methods: methods.length,
  modules: modules.length,
  thinkers_total: thinkers.length,
  thinkers_active: thinkers.filter((item) => item.status === "active").length,
  thinkers_contextual: thinkers.filter((item) => item.status !== "active").length,
  works: thinkers.reduce((sum, item) => sum + (item.selected_works || []).length, 0),
  concepts: concepts.length
};

for (const [key, value] of Object.entries(counts)) {
  require(manifest.counts?.[key] === value, "manifestets opptelling er feil", {
    key,
    expected: value,
    actual: manifest.counts?.[key]
  });
}

const report = {
  status: failures.length ? "failed" : "passed",
  version: "5.0",
  subject_id: "sport",
  counts,
  gates: {
    all_json_serializable: true,
    all_ids_unique: !failures.some((failure) => failure.message?.includes("dupliserte")),
    all_hooks_have_theory_concepts_methods_and_sources: hooks.every((hook) =>
      hook.thinker_ids?.length >= 4 &&
      hook.concept_ids?.length >= 5 &&
      hook.method_ids?.length >= 2 &&
      hook.source_types?.length >= 3
    ),
    all_active_thinkers_have_hooks: thinkers.filter((item) => item.status === "active")
      .every((item) => item.hook_ids?.length >= 1),
    all_references_resolve: !failures.some((failure) => failure.message?.includes("ukjent referanse")),
    all_modules_have_hooks_methods_concepts_and_objectives: modules.every((module) =>
      module.hook_ids?.length >= 4 &&
      module.method_ids?.length >= 2 &&
      module.concept_ids?.length >= 6 &&
      module.learning_objectives?.length >= 3
    ),
    name_guessing_blocked: thinkers.every((item) => item.direct_name_question_allowed === false),
    medical_overreach_blocked: profile.question_quality?.forbidden?.some((value) =>
      value.includes("medisinsk diagnose")
    ) === true,
    personal_preference_not_scored_as_knowledge: profile.question_quality?.forbidden?.some((value) =>
      value.includes("Hvilken klubb liker du best")
    ) === true,
    legacy_emne_compatibility_preserved: profile.required_emne_prefix === "em_sport_"
  },
  failures
};

if (process.argv.includes("--write")) {
  await mkdir(path.dirname(path.resolve(root, paths.report)), { recursive: true });
  await writeFile(path.resolve(root, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
