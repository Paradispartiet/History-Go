#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const base = "data/fag/naeringsliv";
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const asArray = (value) => (Array.isArray(value) ? value : []);
const hasText = (value, min = 1) =>
  typeof value === "string" && value.trim().length >= min;
const unique = (values, label) =>
  assert(new Set(values).size === values.length, `${label} contains duplicates`);
const sameSet = (a, b) =>
  JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());
const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const manifestPath = `${base}/handelshogskolefordypning_manifest_v1.json`;
const modulePath = `${base}/handelshogskolemoduler_okonomi_og_naeringsliv_v1.json`;
const frameworkPath = `${base}/handelshogskoleramme_okonomi_og_naeringsliv_v1.json`;
const qualityPath = `${base}/universitetskvalitet_okonomi_og_naeringsliv_v2.json`;
const quizPath = `${base}/supersetQUIZMAL_naeringsliv.json`;

const manifest = readJson(manifestPath);
const moduleDocument = readJson(modulePath);
const framework = readJson(frameworkPath);
const quality = readJson(qualityPath);
const quiz = readJson(quizPath);

assert(
  manifest.status === "canonical_professional_depth_manifest",
  "Professional depth manifest is not canonical"
);
assert(manifest.subject_id === "naeringsliv", "Professional depth subject must remain naeringsliv");
assert(manifest.module_count === 25 && manifest.track_count === 5, "Professional depth counts must be 25 modules across 5 tracks");
assert(manifest.depth_contract?.money_locale === "nb-NO" && manifest.depth_contract?.money_currency === "NOK", "Depth cases must use nb-NO and NOK");
assert(asArray(manifest.track_files).length === 5, "Depth manifest must register five track files");

const modules = asArray(moduleDocument.modules);
const moduleIds = modules.map((row) => row.module_id);
const moduleById = new Map(modules.map((row) => [row.module_id, row]));
assert(modules.length === 25, "Canonical professional module file must contain 25 modules");
unique(moduleIds, "Canonical professional modules");

const trackDocs = manifest.track_files.map((entry) => {
  const document = readJson(`${base}/${entry.file}`);
  assert(document.status === "canonical_individual_professional_depth", `${entry.file} has wrong status`);
  assert(document.track_id === entry.track_id, `${entry.file} track_id mismatch`);
  assert(document.profile_count === 5, `${entry.file} must contain five profiles`);
  return document;
});
const profiles = trackDocs.flatMap((document) => asArray(document.profiles));
const profileIds = profiles.map((row) => row.module_id);
assert(profiles.length === 25, "Depth layer must contain exactly 25 profiles");
unique(profileIds, "Professional depth profiles");
assert(sameSet(profileIds, moduleIds), "Depth profiles must match the canonical 25 modules exactly");

const bannedGeneric = [
  "kontrollert caseark",
  "komparativ analyse med metodevedlegg",
  "profesjonsmemorandum med beslutningsalternativer",
  "bruk begge metodeprotokollene",
  "test modulens faglige hovedmodell",
  "velg riktig dokumentasjon eller beregning"
].map(normalize);

const allActivities = [];
const allDeliverables = [];
const allCaseTitles = [];
const allResearchQuestions = [];

for (const profile of profiles) {
  const module = moduleById.get(profile.module_id);
  assert(module, `${profile.module_id} has no canonical module`);
  assert(profile.title === module.title, `${profile.module_id} title does not match canonical module`);
  assert(profile.track_id === module.track_id, `${profile.module_id} track does not match canonical module`);
  assert(profile.depth_status === "canonical_individually_curated_depth", `${profile.module_id} is not individually curated`);

  assert(asArray(profile.disciplinary_scope).length >= 5, `${profile.module_id} has thin disciplinary scope`);
  const works = asArray(profile.canonical_works);
  assert(works.length >= 4, `${profile.module_id} needs at least four canonical works`);
  unique(works.map((row) => `${row.author}::${row.title}::${row.year}`), `${profile.module_id} canonical works`);
  assert(
    works.every((row) => hasText(row.author) && hasText(row.title) && Number.isInteger(row.year) && hasText(row.role)),
    `${profile.module_id} has incomplete work metadata`
  );
  assert(works.some((row) => row.year >= 2000 || /standard|current/.test(row.role)), `${profile.module_id} lacks a contemporary work or standard`);
  assert(asArray(profile.authority_basis).length >= 3, `${profile.module_id} needs at least three authority/data bases`);

  const questions = asArray(profile.research_questions);
  assert(questions.length >= 3, `${profile.module_id} needs three research questions`);
  unique(questions.map(normalize), `${profile.module_id} research questions`);
  questions.forEach((question) => assert(hasText(question, 45) && question.endsWith("?"), `${profile.module_id} has a thin research question`));
  allResearchQuestions.push(...questions.map(normalize));

  const steps = asArray(profile.analytical_sequence);
  assert(steps.length >= 6, `${profile.module_id} needs at least six analysis steps`);
  unique(steps.map(normalize), `${profile.module_id} analysis steps`);
  steps.forEach((step) => assert(hasText(step, 35), `${profile.module_id} has a thin analysis step`));

  const worked = profile.worked_case || {};
  assert(hasText(worked.case_title, 12), `${profile.module_id} lacks worked case title`);
  allCaseTitles.push(normalize(worked.case_title));
  assert(asArray(worked.input_facts).length >= 5, `${profile.module_id} worked case needs five inputs`);
  assert(asArray(worked.input_facts).some((value) => String(value).includes("NOK")), `${profile.module_id} worked case must use NOK`);
  assert(asArray(worked.required_operations).length >= 4, `${profile.module_id} worked case needs four operations`);
  assert(asArray(worked.required_outputs).length >= 4, `${profile.module_id} worked case needs four outputs`);
  assert(asArray(worked.validation_checks).length >= 3, `${profile.module_id} worked case needs three validation checks`);

  const levels = ["introductory", "intermediate", "advanced"];
  for (const level of levels) {
    const row = profile.progression?.[level];
    assert(row, `${profile.module_id} is missing ${level} progression`);
    assert(hasText(row.activity, 80), `${profile.module_id} ${level} activity is too thin`);
    assert(hasText(row.deliverable, 25), `${profile.module_id} ${level} deliverable is too thin`);
    assert(asArray(row.pass_criteria).length >= 4, `${profile.module_id} ${level} needs four pass criteria`);
    const text = normalize(`${row.activity} ${row.deliverable}`);
    for (const banned of bannedGeneric) {
      assert(!text.includes(banned), `${profile.module_id} ${level} retains generic template language: ${banned}`);
    }
    allActivities.push(normalize(row.activity));
    allDeliverables.push(normalize(row.deliverable));
  }

  assert(asArray(profile.advanced_techniques).length >= 3, `${profile.module_id} needs three advanced techniques`);
  assert(asArray(profile.failure_modes).length >= 4, `${profile.module_id} needs four failure modes`);
  assert(asArray(profile.cross_module_integration).length >= 2, `${profile.module_id} needs cross-module integration`);
  assert(
    asArray(profile.cross_module_integration).every((id) => moduleIds.includes(id) || String(id).startsWith("em_naering_")),
    `${profile.module_id} references unknown integration target`
  );
  assert(asArray(profile.professional_ethics).length >= 2, `${profile.module_id} needs professional ethics guards`);
  assert(profile.source_refresh?.reviewed_at === "2026-07-27", `${profile.module_id} source review date is stale`);
  assert(hasText(profile.source_refresh?.trigger, 30), `${profile.module_id} needs source refresh trigger`);

  if (profile.track_id === "kvantitative_metoder_business_analytics") {
    assert(profile.computational_artifact, `${profile.module_id} needs a computational artifact`);
    assert(hasText(profile.computational_artifact.required, 25), `${profile.module_id} computational artifact is thin`);
    assert(asArray(profile.computational_artifact.tests).length >= 4, `${profile.module_id} needs four computational tests`);
  }

  if (profile.track_id === "forretningsjus_skatt_regulering") {
    assert(profile.legal_authority_guard, `${profile.module_id} needs a legal authority guard`);
    assert(asArray(profile.legal_authority_guard.required_primary_sources).length >= 4, `${profile.module_id} needs four primary legal source types`);
    assert(hasText(profile.legal_authority_guard.prohibition, 50), `${profile.module_id} legal prohibition is too thin`);
    assert(profile.source_refresh.frequency === "before_each_production_batch", `${profile.module_id} legal sources must refresh before each batch`);
  }
}

unique(allCaseTitles, "Worked case titles");
unique(allResearchQuestions, "Research questions across profiles");
unique(allActivities, "Progression activities across profiles");
unique(allDeliverables, "Progression deliverables across profiles");

const trackCounts = Object.fromEntries(
  manifest.track_files.map((entry) => [
    entry.track_id,
    profiles.filter((profile) => profile.track_id === entry.track_id).length
  ])
);
assert(Object.values(trackCounts).every((count) => count === 5), "Every professional track must have five deep profiles");

assert(
  framework.professional_depth?.manifest ===
    "handelshogskolefordypning_manifest_v1.json",
  "Business-school framework does not register the professional depth manifest"
);
assert(
  framework.professional_depth?.individually_curated_profiles === 25 &&
    framework.professional_depth?.generic_progression_is_sufficient === false,
  "Business-school framework does not require individual depth"
);
assert(
  quality.coverage?.professional_depth_profiles === 25,
  "University quality coverage does not declare 25 professional depth profiles"
);
assert(
  quality.quality_gates?.every_professional_module_has_individual_depth === true &&
    quality.quality_gates?.professional_depth_requires_works_cases_and_unique_progression === true,
  "University quality manifest does not enforce professional depth"
);
assert(
  quality.professional_extension?.professional_depth_manifest ===
    "handelshogskolefordypning_manifest_v1.json",
  "University quality manifest does not register the professional depth manifest"
);
assert(
  quiz.normal_opening_profile?.sets === 2 &&
    quiz.normal_opening_profile?.questions_per_set === 7,
  "Professional deepening changed the normal 2×7 quiz opening"
);

console.log(
  `OK: Økonomi og næringsliv professional depth validates (${profiles.length} individually curated modules, ${profiles.reduce((sum, row) => sum + row.canonical_works.length, 0)} canonical works, ${profiles.length} worked cases).`
);
