#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readText = async (file) => readFile(path.resolve(root, file), "utf8");
const writeText = async (file, value) => writeFile(path.resolve(root, file), value, "utf8");
const readJson = async (file) => JSON.parse(await readText(file));
const writeJson = async (file, value) => writeText(file, `${JSON.stringify(value, null, 2)}\n`);

const policyRoot = "data/fag/FAGPRODUKSJON_CANONICAL.md";
const policySport = "../FAGPRODUKSJON_CANONICAL.md";
const deferred = "deferred_until_financially_sustainable_and_explicitly_reactivated";

const quizPath = "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md";
let quiz = await readText(quizPath);
quiz = quiz.replace("**Versjon:** 3.1", "**Versjon:** 3.2");
const marker = "## 6. Adaptiv quizprofil";
const section = `### 5.1 Produktfase og utsatt institusjonell evidenssyntese

\`data/fag/FAGPRODUKSJON_CANONICAL.md\` fastsetter gjeldende produktfase for fagproduksjon. Vanlig quizproduksjon skal fortsette med relevante, leste og sporbare kilder, presist språk og nødvendige sikkerhetsforbehold.

En egen systematisk evidenssyntese utført av History Go er ikke et generelt krav for hver vanlig fakta-, teori- eller metodepåstand. Påstandens styrke skal likevel aldri overstige det kontrollerte kildegrunnlaget.

Full systematisk evidenssyntese er en utsatt institusjonell forskningsfase. PRESS-review, betalte databasesøk, dobbelt screening, biasvurdering, syntese og sikkerhetsgradering kan ikke startes eller markeres som utført uten en eksplisitt prosjektbeslutning etter at appen har tilstrekkelig økonomi, databaseadgang og uavhengige menneskelige fagroller.

Forskningsinfrastruktur som allerede finnes skal bevares. Beredskap, schemas og låste søkestrategier er ikke det samme som gjennomført evidensarbeid eller publiseringsklare claims.

`;
if (!quiz.includes(section)) {
  if (!quiz.includes(marker)) throw new Error("Fant ikke innsettingspunkt i QUIZ_PRODUCTION_CANONICAL.md");
  quiz = quiz.replace(marker, `${section}${marker}`);
}
await writeText(quizPath, quiz);

const globalValidatorPath = "tools/validate-global-quiz-normal-opening-alignment.mjs";
let globalValidator = await readText(globalValidatorPath);
globalValidator = globalValidator
  .replace("standard.includes('**Versjon:** 3.1')", "standard.includes('**Versjon:** 3.2')")
  .replace("Produksjonsstandarden er versjon 3.1", "Produksjonsstandarden er versjon 3.2");
await writeText(globalValidatorPath, globalValidator);

const pipelinePath = "data/fag/sport/sport_scientific_pipeline_manifest_v2.json";
const pipeline = await readJson(pipelinePath);
pipeline.files.fagproduksjon_policy = policySport;
pipeline.execution_policy = {
  status: deferred,
  decision_date: "2026-07-25",
  policy_document: policySport,
  explicit_reactivation_required: true,
  rationale: "Institusjonell evidenssyntese krever finansiering, databaseadgang og uavhengige menneskelige fagroller. Produkt, lansering og økonomisk bærekraft prioriteres nå.",
  allowed_while_deferred: [
    "teknisk vedlikehold av eksisterende pipeline",
    "retting av schemas, validatorer og proveniensfeil",
    "vanlig fag- og quizproduksjon etter kilde- og sikkerhetsreglene"
  ],
  forbidden_while_deferred: [
    "markere databasesøk som utført",
    "tildele fiktive reviewerroller",
    "materialisere screeningbeslutninger, studier eller biasvurderinger",
    "fullføre synteser eller sikkerhetsvurderinger",
    "opprette publication-ready claims fra V2-pipelinen"
  ],
  reactivation_requirements: [
    "eksplisitt beslutning fra prosjektledelsen",
    "tilstrekkelig og forutsigbar prosjektøkonomi",
    "nødvendig databaseadgang",
    "navngitt uavhengig søkefaglig reviewer",
    "minst to navngitte uavhengige menneskelige screenere",
    "dokumenterte roller, interessekonflikter og adjudikasjon",
    "godkjent evidenspakke, tidsplan og budsjett"
  ]
};
pipeline.readiness.execution_phase = "deferred_by_product_phase_policy";
const pipelineInvariant = "Avansert evidensutførelse er utsatt til økonomisk bærekraft og en ny eksplisitt prosjektbeslutning.";
if (!pipeline.invariants.includes(pipelineInvariant)) pipeline.invariants.push(pipelineInvariant);
await writeJson(pipelinePath, pipeline);

const packagesPath = "data/fag/sport/evidence_packages_sport_v1.json";
const packages = await readJson(packagesPath);
packages.execution_policy = {
  status: deferred,
  decision_date: "2026-07-25",
  policy_document: policySport,
  ordinary_product_work_continues: true,
  research_execution_paused: true
};
for (const item of packages.packages || []) {
  if (item.package_id !== "evidence_package_sport_concussion_acute_safety_v1") continue;
  item.execution_paused = true;
  item.future_research_status = "search_readiness_preserved_execution_deferred";
  item.reactivation_policy = policySport;
  item.pause_reason = "Krever finansiering, databaseadgang og uavhengige menneskelige fagroller; gjenopptas kun etter eksplisitt prosjektbeslutning.";
}
await writeJson(packagesPath, packages);

const evidencePath = "data/fag/sport/sport_scientific_evidence_manifest_v1.json";
const evidence = await readJson(evidencePath);
evidence.files.fagproduksjon_policy = policySport;
evidence.future_research_policy = {
  status: deferred,
  policy_document: policySport,
  infrastructure_preserved: true,
  execution_paused: true,
  ordinary_quiz_production_continues: true,
  full_scientific_coverage_may_not_be_claimed: true
};
await writeJson(evidencePath, evidence);

const qualityPath = "data/fag/sport/sport_quality_manifest_v5.json";
const quality = await readJson(qualityPath);
quality.fagproduksjon_documentation = {
  policy: policySport,
  current_phase: "product_and_launch_priority",
  advanced_evidence_execution: "deferred",
  ordinary_fagproduksjon: "active"
};
quality.production_invariants = (quality.production_invariants || []).filter(
  (item) => !item.startsWith("Ny eller endret vitenskapelig Sport-tekst krever full V2-kjede")
);
for (const item of [
  "Publiseringsklare kliniske, kausale, risiko- og effektclaims krever full V2-kjede; vanlig fag- og quizproduksjon fortsetter etter FAGPRODUKSJON_CANONICAL.md.",
  "Avansert evidensutførelse er utsatt til økonomisk bærekraft og eksplisitt prosjektbeslutning."
]) if (!quality.production_invariants.includes(item)) quality.production_invariants.push(item);
await writeJson(qualityPath, quality);

const methodPath = "data/fag/sport/sport_scientific_method_policy_v1.json";
const method = await readJson(methodPath);
method.current_product_phase = {
  policy_document: policySport,
  ordinary_quiz_production_continues: true,
  advanced_evidence_execution: "deferred",
  publication_ready_v2_claims_remain_blocked: true,
  source_level_rule: "Vanlig pedagogisk innhold kan produseres fra relevante, leste og sporbare kilder når språk, usikkerhet og sikkerhetsgrenser er riktige.",
  reactivation_requires: "økonomisk bærekraft, eksplisitt prosjektbeslutning, databaseadgang og uavhengige menneskelige fagroller"
};
method.pipeline_v2 = method.pipeline_v2 || {};
method.pipeline_v2.execution_status = "infrastructure_preserved_execution_deferred";
await writeJson(methodPath, method);

const profilePath = "data/fag/sport/supersetQUIZMAL_sport.json";
const profile = await readJson(profilePath);
profile.production_phase_policy = {
  document: policyRoot,
  ordinary_quiz_production: "active",
  advanced_evidence_execution: "deferred",
  full_scientific_coverage_claim: "forbidden_until_pipeline_completed"
};
const profileRule = "Avansert systematisk evidenssyntese er utsatt etter FAGPRODUKSJON_CANONICAL.md; dette stopper ikke vanlig kildebelagt fag- og quizproduksjon.";
profile.category_rules = profile.category_rules || [];
if (!profile.category_rules.includes(profileRule)) profile.category_rules.push(profileRule);
await writeJson(profilePath, profile);

console.log("Fagproduksjon phase policy applied.");
