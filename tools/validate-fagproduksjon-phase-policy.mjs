#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readText = async (file) => readFile(path.resolve(root, file), "utf8");
const readJson = async (file) => JSON.parse(await readText(file));

const files = {
  policy: "data/fag/FAGPRODUKSJON_CANONICAL.md",
  quizProduction: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
  pipeline: "data/fag/sport/sport_scientific_pipeline_manifest_v2.json",
  packages: "data/fag/sport/evidence_packages_sport_v1.json",
  evidence: "data/fag/sport/sport_scientific_evidence_manifest_v1.json",
  quality: "data/fag/sport/sport_quality_manifest_v5.json",
  method: "data/fag/sport/sport_scientific_method_policy_v1.json",
  profile: "data/fag/sport/supersetQUIZMAL_sport.json",
  studies: "data/fag/sport/study_registry_sport_v1.json",
  risk: "data/fag/sport/risk_of_bias_sport_v1.json",
  syntheses: "data/fag/sport/evidence_syntheses_sport_v1.json",
  certainty: "data/fag/sport/certainty_assessments_sport_v1.json",
  claims: "data/fag/sport/claims_sport_canonical_v1.json",
  report: "reports/fagproduksjon-phase-policy-validation.json"
};

const [policy, quizProduction, pipeline, packageFile, evidence, quality, method, profile, studies, risk, syntheses, certainty, claims] = await Promise.all([
  readText(files.policy), readText(files.quizProduction), readJson(files.pipeline), readJson(files.packages),
  readJson(files.evidence), readJson(files.quality), readJson(files.method), readJson(files.profile),
  readJson(files.studies), readJson(files.risk), readJson(files.syntheses), readJson(files.certainty), readJson(files.claims)
]);

const failures = [];
const require = (condition, message, details = undefined) => {
  if (!condition) failures.push(details === undefined ? { message } : { message, details });
};
const deferredStatus = "deferred_until_financially_sustainable_and_explicitly_reactivated";
const policyPathFromSport = "../FAGPRODUKSJON_CANONICAL.md";
const policyPathFromRoot = "data/fag/FAGPRODUKSJON_CANONICAL.md";

for (const phrase of [
  "Institusjonell evidenssyntese skal ikke fortrenge produktarbeid",
  "Ingen agent, utvikler eller automatisert jobb skal fortsette",
  "Appen har tilstrekkelig og forutsigbar økonomi",
  "Denne statusen betyr beredskap, ikke gjennomført evidenssyntese"
]) require(policy.includes(phrase), "fagproduksjonspolicyen mangler bindende beslutningstekst", phrase);

require(quizProduction.includes("**Versjon:** 3.2"), "quizproduksjonsdokumentet er ikke versjon 3.2");
require(quizProduction.includes(policyPathFromRoot), "quizproduksjonsdokumentet peker ikke til fagproduksjonspolicyen");
require(quizProduction.includes("systematisk evidenssyntese er en utsatt institusjonell forskningsfase"), "quizproduksjonsdokumentet mangler produktfaseregelen");

require(pipeline.files?.fagproduksjon_policy === policyPathFromSport, "pipeline-manifestet mangler fagproduksjonspolicy");
require(pipeline.execution_policy?.status === deferredStatus, "pipeline-manifestet mangler utsatt status");
require(pipeline.execution_policy?.explicit_reactivation_required === true, "pipeline kan reaktiveres uten eksplisitt beslutning");
require((pipeline.execution_policy?.reactivation_requirements || []).length >= 6, "pipeline har for svake reaktiveringskrav");

const evidencePackage = packageFile.packages?.find((item) => item.package_id === "evidence_package_sport_concussion_acute_safety_v1");
require(packageFile.execution_policy?.status === deferredStatus, "pakkeregisteret mangler utsatt status");
require(evidencePackage?.execution_paused === true, "hjernerystelsespakken er ikke pauset");
require(evidencePackage?.reactivation_policy === policyPathFromSport, "hjernerystelsespakken mangler reaktiveringspolicy");
require(evidencePackage?.completed_database_searches === 0, "databasesøk er feilaktig gjennomført");
require(evidencePackage?.assigned_human_reviewers === 0, "reviewere er feilaktig tildelt");
for (const key of ["study_ids", "result_ids", "risk_of_bias_assessment_ids", "synthesis_ids", "certainty_assessment_ids", "publication_ready_claim_ids"]) {
  require((evidencePackage?.[key] || []).length === 0, `pakken har for tidlige ${key}`);
}

require(evidence.future_research_policy?.status === deferredStatus, "evidensmanifestet mangler framtidspolicy");
require(evidence.future_research_policy?.policy_document === policyPathFromSport, "evidensmanifestet peker ikke til fagproduksjonspolicyen");
require(quality.fagproduksjon_documentation?.policy === policyPathFromSport, "kvalitetsmanifestet mangler fagproduksjonsdokumentasjon");
require(method.current_product_phase?.advanced_evidence_execution === "deferred", "metodepolicyen mangler utsatt evidensutførelse");
require(method.current_product_phase?.ordinary_quiz_production_continues === true, "metodepolicyen stopper feilaktig vanlig quizproduksjon");
require(profile.production_phase_policy?.document === policyPathFromRoot, "Sport-profilen mangler fagproduksjonspolicy");
require(profile.production_phase_policy?.advanced_evidence_execution === "deferred", "Sport-profilen mangler utsatt status");

require((studies.studies || []).length === 0 && (studies.results || []).length === 0, "studier eller resultater er materialisert");
require((risk.assessments || []).length === 0, "biasvurderinger er materialisert");
require(!(syntheses.syntheses || []).some((item) => item.status === "completed"), "syntese er fullført");
require((certainty.assessments || []).length === 0, "sikkerhetsvurderinger er materialisert");
require(!(claims.claims || []).some((item) => item.pipeline_v2?.publication_ready === true), "publication-ready claim finnes");

const report = {
  status: failures.length ? "failed" : "passed",
  version: "1.0",
  subject_id: "fagproduksjon",
  decision: {
    advanced_evidence_execution: "deferred",
    reactivation: "explicit_project_decision_after_financial_sustainability_and_staffing",
    ordinary_quiz_production: "continues_under_source_and_safety_rules"
  },
  gates: {
    canonical_policy_documented: failures.every((item) => !item.message.includes("beslutningstekst")),
    quiz_production_points_to_policy: quizProduction.includes(policyPathFromRoot),
    sport_pipeline_deferred: pipeline.execution_policy?.status === deferredStatus,
    first_package_paused: evidencePackage?.execution_paused === true,
    ordinary_production_continues: method.current_product_phase?.ordinary_quiz_production_continues === true,
    no_research_work_falsely_completed: (studies.studies || []).length === 0 && (risk.assessments || []).length === 0 && (certainty.assessments || []).length === 0,
    no_publication_ready_claims: !(claims.claims || []).some((item) => item.pipeline_v2?.publication_ready === true)
  },
  failures
};

if (process.argv.includes("--write")) {
  await mkdir(path.dirname(path.resolve(root, files.report)), { recursive: true });
  await writeFile(path.resolve(root, files.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
