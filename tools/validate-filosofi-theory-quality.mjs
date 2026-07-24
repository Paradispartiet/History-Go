#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const readJson = async (file) => JSON.parse(await readFile(path.resolve(root, file), "utf8"));
const asArray = (value) => Array.isArray(value) ? value : [];
const unique = (values) => new Set(values).size === values.length;
const failures = [];

const paths = {
  fagkart: "data/fag/filosofi/fagkart_filosofi_canonical_v1.json",
  emner: "data/fag/filosofi/emner_filosofi_canonical_v1.json",
  pensum: "data/fag/filosofi/filosofipensum_canonical_v1.json",
  methods: "data/fag/filosofi/methods_filosofi_canonical_v1.json",
  profile: "data/fag/filosofi/supersetQUIZMAL_filosofi.json",
  thinkers: "data/fag/filosofi/teoretikere_filosofi_canonical_v2.json",
  concepts: "data/fag/filosofi/begreper_filosofi_canonical_v2.json",
  report: "reports/filosofi-theory-quality-validation.json"
};

const [fagkart, emner, pensum, methods, profile, thinkerRegistry, conceptRegistry] =
  await Promise.all([
    readJson(paths.fagkart), readJson(paths.emner), readJson(paths.pensum),
    readJson(paths.methods), readJson(paths.profile), readJson(paths.thinkers),
    readJson(paths.concepts)
  ]);

const topicIds = new Set(asArray(emner).map((item) => item.emne_id));
const methodIds = new Set(asArray(methods.methods).map((item) => item.method_id));
const thinkerIds = new Set(asArray(thinkerRegistry.thinkers).map((item) => item.id));
const conceptIds = new Set(asArray(conceptRegistry.concepts).map((item) => item.id));
const hooks = asArray(fagkart.categories).flatMap((category) =>
  asArray(category.topic_hooks).map((hook) => ({ ...hook, category_id: category.id }))
);
const hookIds = new Set(hooks.map((item) => item.id));

const requireCondition = (condition, reason, details = {}) => {
  if (!condition) failures.push({ reason, ...details });
};

requireCondition(asArray(fagkart.categories).length >= 12, "for få fagområder");
requireCondition(asArray(emner).length >= 50, "for få emner");
requireCondition(hooks.length >= 35, "for få teorihooks");
requireCondition(asArray(methods.methods).length >= 20, "for få metoder");
requireCondition(asArray(pensum.modules).length >= 12, "for få pensummoduler");
requireCondition(asArray(thinkerRegistry.thinkers).length >= 120, "for få teoretikere");
requireCondition(asArray(conceptRegistry.concepts).length >= 150, "for få begreper");

requireCondition(unique([...topicIds]), "dupliserte emne-ID-er");
requireCondition(unique([...methodIds]), "dupliserte metode-ID-er");
requireCondition(unique([...thinkerIds]), "dupliserte teoretiker-ID-er");
requireCondition(unique([...conceptIds]), "dupliserte begreps-ID-er");
requireCondition(unique([...hookIds]), "dupliserte teorihook-ID-er");

for (const topic of asArray(emner)) {
  requireCondition(topic.subject_id === "filosofi", "emne har feil subject_id", { id: topic.emne_id });
  requireCondition(String(topic.emne_id || "").startsWith("em_filosofi_"), "ugyldig emne-ID", { id: topic.emne_id });
  requireCondition(asArray(topic.core_concepts).length >= 3, "emne mangler begrepsbredde", { id: topic.emne_id });
  requireCondition(asArray(topic.method_ids).length >= 2, "emne mangler metodekobling", { id: topic.emne_id });
  requireCondition(asArray(topic.theory_hook_ids).length >= 1, "emne mangler teorihook", { id: topic.emne_id });
  for (const id of asArray(topic.core_concepts)) {
    requireCondition(conceptIds.has(id), "emne peker til ukjent begrep", { id: topic.emne_id, concept_id: id });
  }
  for (const id of asArray(topic.method_ids)) {
    requireCondition(methodIds.has(id), "emne peker til ukjent metode", { id: topic.emne_id, method_id: id });
  }
  for (const id of asArray(topic.theory_hook_ids)) {
    requireCondition(hookIds.has(id), "emne peker til ukjent teorihook", { id: topic.emne_id, topic_hook_id: id });
  }
}

for (const hook of hooks) {
  const thinkers = asArray(hook.canon?.thinkers);
  requireCondition(thinkers.length >= 4, "teorihook har færre enn fire teoretikere", { id: hook.id });
  requireCondition(asArray(hook.emne_ids).length >= 1, "teorihook mangler emner", { id: hook.id });
  requireCondition(asArray(hook.recommended_method_ids).length >= 2, "teorihook mangler metoder", { id: hook.id });
  requireCondition(hook.generator_constraints?.avoid_name_guessing === true, "navnegjetting er ikke blokkert", { id: hook.id });
  for (const thinker of thinkers) {
    requireCondition(thinkerIds.has(thinker.id), "teorihook peker til ukjent teoretiker", { id: hook.id, thinker_id: thinker.id });
    requireCondition(asArray(thinker.works).length >= 1, "teoretiker i hook mangler verk", { id: hook.id, thinker_id: thinker.id });
  }
  for (const id of asArray(hook.emne_ids)) {
    requireCondition(topicIds.has(id), "teorihook peker til ukjent emne", { id: hook.id, emne_id: id });
  }
  for (const id of asArray(hook.concept_ids)) {
    requireCondition(conceptIds.has(id), "teorihook peker til ukjent begrep", { id: hook.id, concept_id: id });
  }
}

for (const thinker of asArray(thinkerRegistry.thinkers)) {
  requireCondition(asArray(thinker.works).length >= 1, "teoretiker mangler verk", { id: thinker.id });
  requireCondition(asArray(thinker.concept_ids).length >= 2, "teoretiker mangler begrepskoblinger", { id: thinker.id });
  if (thinker.status === "active") {
    requireCondition(asArray(thinker.topic_hook_ids).length >= 1, "aktiv teoretiker mangler hook", { id: thinker.id });
  }
  for (const id of asArray(thinker.topic_hook_ids)) {
    requireCondition(hookIds.has(id), "teoretiker peker til ukjent hook", { id: thinker.id, topic_hook_id: id });
  }
  for (const id of asArray(thinker.concept_ids)) {
    requireCondition(conceptIds.has(id), "teoretiker peker til ukjent begrep", { id: thinker.id, concept_id: id });
  }
}

for (const concept of asArray(conceptRegistry.concepts)) {
  requireCondition(typeof concept.definition === "string" && concept.definition.length >= 35, "begrep har for svak definisjon", { id: concept.id });
  requireCondition(typeof concept.distinction === "string" && concept.distinction.length >= 35, "begrep mangler avgrensning", { id: concept.id });
  requireCondition(asArray(concept.related_ids).length >= 2, "begrep mangler relasjoner", { id: concept.id });
  requireCondition(typeof concept.quiz_guidance === "string" && concept.quiz_guidance.length >= 30, "begrep mangler quizveiledning", { id: concept.id });
  for (const id of asArray(concept.emne_ids)) {
    requireCondition(topicIds.has(id), "begrep peker til ukjent emne", { id: concept.id, emne_id: id });
  }
}

for (const module of asArray(pensum.modules)) {
  requireCondition(asArray(module.emner).length >= 2, "pensummodul mangler emner", { id: module.module_id });
  requireCondition(asArray(module.topic_hooks).length >= 2, "pensummodul mangler teorihooks", { id: module.module_id });
  requireCondition(asArray(module.metoder).length >= 3, "pensummodul mangler metoder", { id: module.module_id });
  for (const id of asArray(module.emner)) requireCondition(topicIds.has(id), "modul peker til ukjent emne", { id: module.module_id, emne_id: id });
  for (const id of asArray(module.topic_hooks)) requireCondition(hookIds.has(id), "modul peker til ukjent hook", { id: module.module_id, topic_hook_id: id });
  for (const id of asArray(module.metoder)) requireCondition(methodIds.has(id), "modul peker til ukjent metode", { id: module.module_id, method_id: id });
}

requireCondition(profile.status === "canonical_category_profile", "quizprofil har feil status");
requireCondition(profile.categoryId === "filosofi", "quizprofil har feil kategori");
requireCondition(profile.governance?.may_override_global_rules === false, "quizprofil kan overstyre globale regler");
requireCondition(asArray(profile.content_priorities).length >= 10, "quizprofilen er for smal");
requireCondition(asArray(profile.question_design?.blocked_moves).some((item) => /navnegjetting/u.test(item)), "quizprofil blokkerer ikke navnegjetting");

const counts = {
  areas: asArray(fagkart.categories).length,
  topics: asArray(emner).length,
  topic_hooks: hooks.length,
  methods: asArray(methods.methods).length,
  modules: asArray(pensum.modules).length,
  thinkers_total: asArray(thinkerRegistry.thinkers).length,
  thinkers_active: asArray(thinkerRegistry.thinkers).filter((item) => item.status === "active").length,
  thinkers_contextual: asArray(thinkerRegistry.thinkers).filter((item) => item.status === "contextual").length,
  works: asArray(thinkerRegistry.thinkers).reduce((sum, item) => sum + asArray(item.works).length, 0),
  concepts: asArray(conceptRegistry.concepts).length
};

const report = {
  status: failures.length ? "failed" : "passed",
  version: "2.0",
  subject_id: "filosofi",
  counts,
  gates: {
    all_json_serializable: true,
    all_topics_have_hooks: asArray(emner).every((item) => asArray(item.theory_hook_ids).length > 0),
    all_active_thinkers_have_hooks: asArray(thinkerRegistry.thinkers).filter((item) => item.status === "active").every((item) => asArray(item.topic_hook_ids).length > 0),
    all_hooks_have_at_least_four_thinkers: hooks.every((item) => asArray(item.canon?.thinkers).length >= 4),
    all_references_resolve: failures.length === 0,
    all_modules_have_topics_methods_and_hooks: asArray(pensum.modules).every((item) => asArray(item.emner).length && asArray(item.metoder).length && asArray(item.topic_hooks).length),
    name_guessing_blocked: true,
    personal_opinion_not_scored_as_knowledge: fagkart.principles?.personal_opinion_is_not_scored_knowledge === true
  },
  failures
};

await mkdir(path.dirname(path.resolve(root, paths.report)), { recursive: true });
await writeFile(path.resolve(root, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
