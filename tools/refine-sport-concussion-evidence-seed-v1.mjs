#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sportDir = "data/fag/sport";
const readJson = async (relativePath) => JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));
const writeJson = async (relativePath, value) => writeFile(path.resolve(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const paths = {
  risk: `${sportDir}/risk_of_bias_sport_v1.json`,
  reviewTools: `${sportDir}/review_appraisal_tools_sport_v1.json`,
  protocol: `${sportDir}/protocols/concussion_acute_safety_protocol_v1.json`,
  pipeline: `${sportDir}/sport_scientific_pipeline_manifest_v2.json`,
  evidence: `${sportDir}/sport_scientific_evidence_manifest_v1.json`,
  quality: `${sportDir}/sport_quality_manifest_v5.json`,
  profile: `${sportDir}/supersetQUIZMAL_sport.json`
};

const [riskFile, protocol, pipeline, evidence, quality, profile] = await Promise.all([
  readJson(paths.risk), readJson(paths.protocol), readJson(paths.pipeline),
  readJson(paths.evidence), readJson(paths.quality), readJson(paths.profile)
]);

const reviewToolIds = new Set([
  "tool_sport_systematic_review_appraisal_v1",
  "tool_sport_guideline_consensus_appraisal_v1"
]);
const reviewTools = (riskFile.tools || [])
  .filter((tool) => reviewToolIds.has(tool.tool_id))
  .map((tool) => ({ ...tool, appraisal_level: "review_document" }));
if (reviewTools.length !== reviewToolIds.size) {
  throw new Error(`Forventet ${reviewToolIds.size} reviewverktøy, fant ${reviewTools.length}`);
}
riskFile.tools = (riskFile.tools || []).filter((tool) => !reviewToolIds.has(tool.tool_id));
riskFile.updated_at = "2026-07-25";

const reviewRegistry = {
  version: "1.0",
  subject_id: "sport",
  type: "review_and_guideline_appraisal_tool_registry",
  status: "canonical_pipeline_tools",
  updated_at: "2026-07-25",
  scope: "Dokumentnivåvurdering av systematiske oversikter, kliniske retningslinjer, folkehelseråd og konsensusuttalelser. Resultatspesifikk risiko for bias for primærstudier forblir i risk_of_bias_sport_v1.json.",
  principles: {
    independent_reviewers_required: 2,
    adjudication_required_on_disagreement: true,
    reporting_quality_is_not_evidence_certainty: true,
    document_appraisal_does_not_replace_result_level_bias: true
  },
  tools: reviewTools
};

protocol.appraisal_plan.review_appraisal_registry = "../review_appraisal_tools_sport_v1.json";
protocol.appraisal_plan.result_level_bias_registry = "../risk_of_bias_sport_v1.json";

pipeline.files.review_appraisal_tools = "review_appraisal_tools_sport_v1.json";
pipeline.readiness.first_priority_review_tools = "canonical_and_dual_review_required";
pipeline.invariants = [...new Set([
  ...(pipeline.invariants || []),
  "Review- og retningslinjeverktøy lagres separat fra resultatspesifikke biasverktøy.",
  "Dokumentvurdering kan ikke erstatte resultatspesifikk risiko-for-bias-vurdering av primærstudier."
])];

evidence.integration.review_appraisal_tools = "review_appraisal_tools_sport_v1.json";
evidence.pipeline_status = "scientific_pipeline_infrastructure_ready_evidence_materialization_pending";
evidence.first_priority_package_status = "protocol_registered_candidate_seed_ready_screening_pending";
evidence.review_appraisal_status = "registry_ready_no_appraisals_completed";

quality.scientific_evidence_layer.review_appraisal_tools = "review_appraisal_tools_sport_v1.json";
profile.evidence_layer.review_appraisal_tools = `${sportDir}/review_appraisal_tools_sport_v1.json`;

await Promise.all([
  writeJson(paths.risk, riskFile),
  writeJson(paths.reviewTools, reviewRegistry),
  writeJson(paths.protocol, protocol),
  writeJson(paths.pipeline, pipeline),
  writeJson(paths.evidence, evidence),
  writeJson(paths.quality, quality),
  writeJson(paths.profile, profile)
]);

console.log(JSON.stringify({
  status: "passed",
  result_level_tools: riskFile.tools.length,
  review_document_tools: reviewTools.length,
  review_registry: paths.reviewTools
}, null, 2));
