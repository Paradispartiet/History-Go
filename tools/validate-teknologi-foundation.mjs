#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const readJson = async (file) => JSON.parse(await readFile(path.resolve(root, file), "utf8"));
const arr = (value) => Array.isArray(value) ? value : [];
const failures = [];
const requireCondition = (condition, reason, details = {}) => {
  if (!condition) failures.push({ reason, ...details });
};
const uniqueIds = (items, key) => {
  const ids = items.map((item) => item?.[key]).filter(Boolean);
  return ids.length === new Set(ids).size;
};

const paths = {
  contract: "data/categories/category_contract.json",
  badge: "data/badges/vitenskap.json",
  manifest: "data/fag/fag_manifest.json",
  profile: "data/fag/teknologi/supersetQUIZMAL_teknologi.json",
  index: "data/fag/teknologi/teknologi_scientific_v2/index.json",
  report: "reports/teknologi-scientific-quality-validation.json"
};

const [contract, badge, manifest, profile, index] = await Promise.all([
  readJson(paths.contract),
  readJson(paths.badge),
  readJson(paths.manifest),
  readJson(paths.profile),
  readJson(paths.index)
]);
const docs = await Promise.all(arr(index.area_files).map(readJson));

const topics = docs.flatMap((doc) => arr(doc.topics));
const methods = docs.flatMap((doc) => arr(doc.methods));
const concepts = docs.flatMap((doc) => arr(doc.concepts));
const thinkers = docs.flatMap((doc) => arr(doc.thinkers));
const theories = docs.flatMap((doc) => arr(doc.theory_objects));
const hooks = docs.flatMap((doc) => arr(doc.hooks));
const modules = docs.map((doc) => doc.module).filter(Boolean);

const topicIds = new Set(topics.map((item) => item.id));
const methodIds = new Set(methods.map((item) => item.id));
const conceptIds = new Set(concepts.map((item) => item.id));
const thinkerIds = new Set(thinkers.map((item) => item.id));
const theoryIds = new Set(theories.map((item) => item.id));
const hookIds = new Set(hooks.map((item) => item.id));

requireCondition(!contract.runtimeCategories.includes("teknologi"), "teknologi skal ikke være egen runtimekategori");
requireCondition(!contract.fagSubjects.includes("teknologi"), "teknologi skal ikke være eget toppfag");
requireCondition(contract.aliases?.teknologi === "vitenskap", "teknologi-aliaset peker ikke til vitenskap");
requireCondition(contract.labels?.vitenskap === "Vitenskap & teknologi", "feil felleslabel");
requireCondition(badge.id === "vitenskap" && badge.name === "Vitenskap & teknologi", "fellesbadget har feil identitet");
requireCondition(arr(badge.tiers).length >= 10, "badge har for få nivåer");
requireCondition(manifest.vitenskap?.specializations?.teknologi?.status === "canonical_scientific_specialization", "manifestet markerer ikke Teknologi som vitenskapelig spesialisering");
requireCondition(manifest.vitenskap?.specializations?.teknologi?.scientificPackage === "teknologi/teknologi_scientific_v2/index.json", "spesialiseringen mangler scientificPackage");
requireCondition(profile.categoryId === "teknologi", "quizprofil har feil kategori");
requireCondition(profile.required_emne_prefix === "em_tek_", "quizprofil har feil emneprefix");
requireCondition(profile.scientificPackage === paths.index, "quizprofilen peker ikke til vitenskapelig pakke");
requireCondition(index.status === "canonical_scientific_subject", "indeksen er ikke kanonisk vitenskapelig fag");
requireCondition(typeof index.definition === "string" && index.definition.length >= 100, "fagdefinisjonen er for svak");
requireCondition(arr(index.object_of_study).length >= 5, "faget mangler eksplisitt studieobjekt");
requireCondition(arr(index.knowledge_forms).length >= 8, "faget mangler kunnskapsformer");
requireCondition(index.governance?.uncertainty_must_be_explicit === true, "usikkerhet er ikke eksplisitt krav");
requireCondition(index.governance?.comparison_requires_common_basis === true, "sammenligning mangler felles grunnlag");
requireCondition(index.governance?.avoid_name_guessing === true, "navnegjetting er ikke blokkert");
requireCondition(index.governance?.personal_opinion_is_not_scored_knowledge === true, "personlig mening kan vurderes som fagkunnskap");

const expectedCounts = {
  areas: docs.length,
  topics: topics.length,
  methods: methods.length,
  hooks: hooks.length,
  concepts: concepts.length,
  thinkers: thinkers.length,
  theory_objects: theories.length,
  modules: modules.length
};
for (const [key, actual] of Object.entries(expectedCounts)) {
  requireCondition(index.counts?.[key] === actual, "indekstelling avviker", {
    key,
    expected: index.counts?.[key],
    actual
  });
}
requireCondition(docs.length >= 12, "for få vitenskapelige fagområder");
requireCondition(topics.length >= 48, "for få emner");
requireCondition(methods.length >= 30, "for få metoder");
requireCondition(hooks.length >= 36, "for få teorihooks");
requireCondition(concepts.length >= 72, "for få begreper");
requireCondition(thinkers.length >= 60, "for få fagpersoner");
requireCondition(theories.length >= 24, "for få teoriobjekter");
requireCondition(modules.length >= 12, "for få pensummoduler");

requireCondition(uniqueIds(docs, "area_id"), "dupliserte område-ID-er");
requireCondition(uniqueIds(topics, "id"), "dupliserte emne-ID-er");
requireCondition(uniqueIds(methods, "id"), "dupliserte metode-ID-er");
requireCondition(uniqueIds(concepts, "id"), "dupliserte begreps-ID-er");
requireCondition(uniqueIds(thinkers, "id"), "dupliserte fagperson-ID-er");
requireCondition(uniqueIds(theories, "id"), "dupliserte teoriobjekt-ID-er");
requireCondition(uniqueIds(hooks, "id"), "dupliserte hook-ID-er");
requireCondition(uniqueIds(modules, "id"), "dupliserte modul-ID-er");

const allResolve = (ids, known, reason, owner) => {
  for (const id of arr(ids)) {
    requireCondition(known.has(id), reason, { owner, referenced_id: id });
  }
};

for (const doc of docs) {
  requireCondition(doc.schema === "teknologi_scientific_area_v2", "fagområde har feil schema", { area_id: doc.area_id });
  requireCondition(doc.subject_id === "teknologi", "fagområde har feil subject_id", { area_id: doc.area_id });
  requireCondition(typeof doc.definition === "string" && doc.definition.length >= 80, "fagområde har svak definisjon", { area_id: doc.area_id });
  requireCondition(arr(doc.research_questions).length >= 3, "fagområde mangler forskningsspørsmål", { area_id: doc.area_id });
  requireCondition(arr(doc.topics).length >= 4, "fagområde har for få emner", { area_id: doc.area_id });
  requireCondition(arr(doc.methods).length >= 2, "fagområde har for få metoder", { area_id: doc.area_id });
  requireCondition(arr(doc.concepts).length >= 6, "fagområde har for få begreper", { area_id: doc.area_id });
  requireCondition(arr(doc.thinkers).length >= 5, "fagområde har for få fagpersoner", { area_id: doc.area_id });
  requireCondition(arr(doc.theory_objects).length >= 2, "fagområde har for få teoriobjekter", { area_id: doc.area_id });
  requireCondition(arr(doc.hooks).length >= 3, "fagområde har for få teorihooks", { area_id: doc.area_id });
}

for (const topic of topics) {
  requireCondition(String(topic.id || "").startsWith("em_tek_"), "emne har feil prefix", { id: topic.id });
  requireCondition(typeof topic.definition === "string" && topic.definition.length >= 60, "emne har svak definisjon", { id: topic.id });
  requireCondition(arr(topic.concept_ids).length >= 3, "emne mangler begrepsbredde", { id: topic.id });
  requireCondition(arr(topic.method_ids).length >= 2, "emne mangler metodekobling", { id: topic.id });
  requireCondition(arr(topic.hook_ids).length >= 1, "emne mangler hook", { id: topic.id });
  requireCondition(arr(topic.theory_ids).length >= 1, "emne mangler teoriobjekt", { id: topic.id });
  allResolve(topic.concept_ids, conceptIds, "emne peker til ukjent begrep", topic.id);
  allResolve(topic.method_ids, methodIds, "emne peker til ukjent metode", topic.id);
  allResolve(topic.hook_ids, hookIds, "emne peker til ukjent hook", topic.id);
  allResolve(topic.theory_ids, theoryIds, "emne peker til ukjent teoriobjekt", topic.id);
}

for (const method of methods) {
  requireCondition(String(method.id || "").startsWith("met_tek_"), "metode har feil prefix", { id: method.id });
  requireCondition(typeof method.purpose === "string" && method.purpose.length >= 60, "metode har for svakt formål", { id: method.id });
}
for (const concept of concepts) {
  requireCondition(typeof concept.definition === "string" && concept.definition.length >= 45, "begrep har svak definisjon", { id: concept.id });
  requireCondition(typeof concept.distinction === "string" && concept.distinction.length >= 35, "begrep mangler avgrensning", { id: concept.id });
  requireCondition(arr(concept.related_ids).length >= 3, "begrep mangler relasjoner", { id: concept.id });
  allResolve(concept.related_ids, conceptIds, "begrep peker til ukjent begrep", concept.id);
}
for (const thinker of thinkers) {
  requireCondition(typeof thinker.role === "string" && thinker.role.length >= 15, "fagperson mangler faglig rolle", { id: thinker.id });
  requireCondition(typeof thinker.work === "string" && thinker.work.length >= 4, "fagperson mangler verk eller bidrag", { id: thinker.id });
}
for (const theory of theories) {
  requireCondition(String(theory.id || "").startsWith("teori_tek_"), "teoriobjekt har feil prefix", { id: theory.id });
  requireCondition(typeof theory.definition === "string" && theory.definition.length >= 70, "teoriobjekt har svak definisjon", { id: theory.id });
  requireCondition(arr(theory.concept_ids).length >= 4, "teoriobjekt mangler begreper", { id: theory.id });
  requireCondition(arr(theory.method_ids).length >= 2, "teoriobjekt mangler metoder", { id: theory.id });
  allResolve(theory.concept_ids, conceptIds, "teoriobjekt peker til ukjent begrep", theory.id);
  allResolve(theory.method_ids, methodIds, "teoriobjekt peker til ukjent metode", theory.id);
}
for (const hook of hooks) {
  requireCondition(typeof hook.problem === "string" && hook.problem.length >= 90, "hook mangler vitenskapelig problem", { id: hook.id });
  requireCondition(arr(hook.topic_ids).length >= 3, "hook mangler emner", { id: hook.id });
  requireCondition(arr(hook.method_ids).length >= 2, "hook mangler metoder", { id: hook.id });
  requireCondition(arr(hook.thinker_ids).length >= 4, "hook mangler fagpersoner", { id: hook.id });
  requireCondition(arr(hook.theory_ids).length >= 2, "hook mangler teoriobjekter", { id: hook.id });
  allResolve(hook.topic_ids, topicIds, "hook peker til ukjent emne", hook.id);
  allResolve(hook.concept_ids, conceptIds, "hook peker til ukjent begrep", hook.id);
  allResolve(hook.method_ids, methodIds, "hook peker til ukjent metode", hook.id);
  allResolve(hook.thinker_ids, thinkerIds, "hook peker til ukjent fagperson", hook.id);
  allResolve(hook.theory_ids, theoryIds, "hook peker til ukjent teoriobjekt", hook.id);
}
for (const module of modules) {
  requireCondition(arr(module.topic_ids).length >= 4, "modul mangler emner", { id: module.id });
  requireCondition(arr(module.method_ids).length >= 2, "modul mangler metoder", { id: module.id });
  requireCondition(arr(module.hook_ids).length >= 3, "modul mangler hooks", { id: module.id });
  requireCondition(arr(module.concept_ids).length >= 6, "modul mangler begreper", { id: module.id });
  requireCondition(arr(module.theory_ids).length >= 2, "modul mangler teoriobjekter", { id: module.id });
  allResolve(module.topic_ids, topicIds, "modul peker til ukjent emne", module.id);
  allResolve(module.method_ids, methodIds, "modul peker til ukjent metode", module.id);
  allResolve(module.hook_ids, hookIds, "modul peker til ukjent hook", module.id);
  allResolve(module.concept_ids, conceptIds, "modul peker til ukjent begrep", module.id);
  allResolve(module.theory_ids, theoryIds, "modul peker til ukjent teoriobjekt", module.id);
}

const report = {
  status: failures.length ? "failed" : "passed",
  version: "2.0",
  subject_id: "teknologi",
  counts: expectedCounts,
  gates: {
    nested_under_vitenskap: !contract.runtimeCategories.includes("teknologi") && manifest.vitenskap?.specializations?.teknologi?.canonicalParentSubject === "vitenskap",
    canonical_scientific_specialization: manifest.vitenskap?.specializations?.teknologi?.status === "canonical_scientific_specialization",
    explicit_object_of_study: arr(index.object_of_study).length >= 5,
    scientific_methods_and_theories: methods.length >= 30 && theories.length >= 24,
    uncertainty_and_comparison_governed:
      index.governance?.uncertainty_must_be_explicit === true &&
      index.governance?.comparison_requires_common_basis === true,
    all_references_resolve: failures.length === 0
  },
  failures
};

await mkdir(path.dirname(path.resolve(root, paths.report)), { recursive: true });
await writeFile(path.resolve(root, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
