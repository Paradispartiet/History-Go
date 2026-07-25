#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const readJson = async (file) => JSON.parse(await readFile(path.resolve(root, file), "utf8"));
const failures = [];
const requireCondition = (condition, reason, details = {}) => {
  if (!condition) failures.push({ reason, ...details });
};

const paths = {
  contract: "data/categories/category_contract.json",
  badge: "data/badges/teknologi.json",
  manifest: "data/fag/fag_manifest.json",
  topics: "data/fag/teknologi/emner_teknologi_canonical_v1.json",
  methods: "data/fag/teknologi/methods_teknologi_canonical_v1.json",
  map: "data/fag/teknologi/fagkart_teknologi_canonical_v1.json",
  curriculum: "data/fag/teknologi/teknologipensum_canonical_v1.json",
  profile: "data/fag/teknologi/supersetQUIZMAL_teknologi.json",
  report: "reports/teknologi-foundation-validation.json"
};

const [contract, badge, manifest, topics, methodRegistry, map, curriculum, profile] =
  await Promise.all([
    readJson(paths.contract), readJson(paths.badge), readJson(paths.manifest),
    readJson(paths.topics), readJson(paths.methods), readJson(paths.map),
    readJson(paths.curriculum), readJson(paths.profile)
  ]);

const methods = Array.isArray(methodRegistry.methods) ? methodRegistry.methods : [];
const areas = Array.isArray(map.categories) ? map.categories : [];
const modules = Array.isArray(curriculum.modules) ? curriculum.modules : [];
const topicIds = new Set(topics.map((item) => item.emne_id));
const methodIds = new Set(methods.map((item) => item.method_id));

requireCondition(contract.runtimeCategories.includes("teknologi"), "teknologi mangler som runtimekategori");
requireCondition(contract.fagSubjects.includes("teknologi"), "teknologi mangler som fag");
requireCondition(contract.labels.teknologi === "Teknologi", "feil teknologilabel");
requireCondition(contract.labels.vitenskap === "Vitenskap", "vitenskap er ikke skilt ut");
requireCondition(manifest.teknologi, "teknologi mangler i fagmanifest");
requireCondition(badge.id === "teknologi" && badge.name === "Teknologi", "badge har feil identitet");
requireCondition(Array.isArray(badge.tiers) && badge.tiers.length >= 10, "badge har for få nivåer");
requireCondition(topics.length >= 14, "for få teknologi-emner");
requireCondition(methods.length >= 12, "for få teknologi-metoder");
requireCondition(areas.length >= 7, "for få teknologi-fagområder");
requireCondition(modules.length >= 7, "for få teknologi-moduler");
requireCondition(profile.categoryId === "teknologi", "quizprofil har feil kategori");
requireCondition(profile.required_emne_prefix === "em_tek_", "quizprofil har feil emneprefix");

for (const topic of topics) {
  requireCondition(topic.subject_id === "teknologi", "emne har feil subject_id", { id: topic.emne_id });
  requireCondition(String(topic.emne_id).startsWith("em_tek_"), "emne har feil prefix", { id: topic.emne_id });
  requireCondition(Array.isArray(topic.method_ids) && topic.method_ids.length >= 1, "emne mangler metoder", { id: topic.emne_id });
  for (const id of topic.method_ids || []) {
    requireCondition(methodIds.has(id), "emne peker til ukjent metode", { id: topic.emne_id, method_id: id });
  }
}

for (const area of areas) {
  requireCondition(Array.isArray(area.topic_hooks) && area.topic_hooks.length >= 3, "fagområde mangler hooks", { id: area.id });
  for (const id of area.focus || []) {
    requireCondition(topicIds.has(id), "fagområde peker til ukjent emne", { id: area.id, emne_id: id });
  }
}

for (const module of modules) {
  for (const id of module.emner || []) {
    requireCondition(topicIds.has(id), "modul peker til ukjent emne", { id: module.module_id, emne_id: id });
  }
  for (const id of module.metoder || []) {
    requireCondition(methodIds.has(id), "modul peker til ukjent metode", { id: module.module_id, method_id: id });
  }
}

const report = {
  status: failures.length ? "failed" : "passed",
  version: "1.0",
  subject_id: "teknologi",
  counts: {
    topics: topics.length,
    methods: methods.length,
    areas: areas.length,
    modules: modules.length,
    badge_tiers: badge.tiers.length
  },
  gates: {
    separate_runtime_category: contract.runtimeCategories.includes("teknologi"),
    separate_fag_subject: !!manifest.teknologi,
    science_label_restored: contract.labels.vitenskap === "Vitenskap",
    references_resolve: failures.length === 0
  },
  failures
};

await mkdir(path.dirname(path.resolve(root, paths.report)), { recursive: true });
await writeFile(path.resolve(root, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
