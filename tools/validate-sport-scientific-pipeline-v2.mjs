#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (file) => JSON.parse(await readFile(path.resolve(root, file), "utf8"));
const p = {
  hooks: "data/fag/sport/theory_hooks_sport_canonical_v5.json",
  units: "data/fag/sport/theory_units_sport_canonical_v6.json",
  claims: "data/fag/sport/claims_sport_canonical_v1.json",
  classification: "data/fag/sport/hook_scientific_classification_sport_v1.json",
  questions: "data/fag/sport/research_questions_sport_v1.json",
  protocols: "data/fag/sport/review_protocols_sport_v1.json",
  studies: "data/fag/sport/study_registry_sport_v1.json",
  bias: "data/fag/sport/risk_of_bias_sport_v1.json",
  syntheses: "data/fag/sport/evidence_syntheses_sport_v1.json",
  certainty: "data/fag/sport/certainty_assessments_sport_v1.json",
  pipeline: "data/fag/sport/sport_scientific_pipeline_manifest_v2.json",
  evidence: "data/fag/sport/sport_scientific_evidence_manifest_v1.json",
  policy: "data/fag/sport/sport_scientific_method_policy_v1.json",
  quality: "data/fag/sport/sport_quality_manifest_v5.json",
  profile: "data/fag/sport/supersetQUIZMAL_sport.json",
  report: "reports/sport-scientific-pipeline-v2-validation.json"
};
const [hookFile, unitFile, claimFile, classFile, questionFile, protocolFile, studyFile, biasFile, synthesisFile, certaintyFile, pipeline, evidence, policy, quality, profile] = await Promise.all([
  readJson(p.hooks), readJson(p.units), readJson(p.claims), readJson(p.classification), readJson(p.questions),
  readJson(p.protocols), readJson(p.studies), readJson(p.bias), readJson(p.syntheses), readJson(p.certainty),
  readJson(p.pipeline), readJson(p.evidence), readJson(p.policy), readJson(p.quality), readJson(p.profile)
]);

const failures = [];
const check = (ok, message, details) => { if (!ok) failures.push(details === undefined ? { message } : { message, details }); };
const unique = (items, key, label) => {
  const values = items.map((item) => item?.[key]);
  check(values.every((value) => typeof value === "string" && value.length > 0), `${label}: mangler ${key}`);
  check(new Set(values).size === values.length, `${label}: dupliserte ${key}`);
  return new Set(values);
};
const refCheck = (items, key, known, label, idKey) => {
  for (const item of items) {
    const raw = item?.[key];
    for (const value of raw == null ? [] : (Array.isArray(raw) ? raw : [raw])) {
      check(known.has(value), `${label}: ukjent ${key}`, { item: item[idKey], value });
    }
  }
};

const hooks = hookFile.hooks || [];
const units = unitFile.theory_units || [];
const claims = claimFile.claims || [];
const tracks = classFile.tracks || [];
const classes = classFile.classifications || [];
const questions = questionFile.research_questions || [];
const protocols = protocolFile.protocols || [];
const studies = studyFile.studies || [];
const results = studyFile.results || [];
const tools = biasFile.tools || [];
const assessments = biasFile.assessments || [];
const syntheses = synthesisFile.syntheses || [];
const certainty = certaintyFile.assessments || [];

const hookIds = unique(hooks, "hook_id", "hooks");
const unitIds = unique(units, "theory_unit_id", "teorienheter");
const trackIds = unique(tracks, "track_id", "spor");
const classIds = unique(classes, "classification_id", "klassifiseringer");
const questionIds = unique(questions, "research_question_id", "forskningsspørsmål");
const protocolIds = unique(protocols, "protocol_id", "protokoller");
const toolIds = unique(tools, "tool_id", "vurderingsverktøy");
const studyIds = unique(studies, "study_id", "studier");
const resultIds = unique(results, "result_id", "resultater");
const assessmentIds = unique(assessments, "assessment_id", "vurderinger");

check(hooks.length === 56 && units.length === 56, "Sport skal ha 56 hooks og teorienheter");
check(classes.length === 56 && questions.length === 56 && protocols.length === 56 && syntheses.length === 56, "V2-kjeden dekker ikke alle 56 hooks");
check(tracks.length >= 12, "for få epistemiske spor", tracks.length);
check(tools.length >= 15, "for få vurderingsverktøy", tools.length);

refCheck(classes, "hook_id", hookIds, "klassifisering", "classification_id");
refCheck(classes, "theory_unit_id", unitIds, "klassifisering", "classification_id");
refCheck(classes, "epistemic_track", trackIds, "klassifisering", "classification_id");
refCheck(classes, "appraisal_tool_ids", toolIds, "klassifisering", "classification_id");
refCheck(questions, "classification_id", classIds, "forskningsspørsmål", "research_question_id");
refCheck(questions, "hook_id", hookIds, "forskningsspørsmål", "research_question_id");
refCheck(protocols, "research_question_id", questionIds, "protokoll", "protocol_id");
refCheck(protocols, "appraisal_tool_ids", toolIds, "protokoll", "protocol_id");
refCheck(syntheses, "research_question_id", questionIds, "syntese", "synthesis_id");
refCheck(syntheses, "protocol_id", protocolIds, "syntese", "synthesis_id");
refCheck(syntheses, "included_study_ids", studyIds, "syntese", "synthesis_id");
refCheck(syntheses, "result_ids", resultIds, "syntese", "synthesis_id");
refCheck(syntheses, "risk_of_bias_assessment_ids", assessmentIds, "syntese", "synthesis_id");

for (const question of questions) {
  check(question.status === "planned_not_answered" && question.publication_status === "blocked", "forskningsspørsmål fremstilles som besvart", question.research_question_id);
  check((question.outcomes || []).length >= 4 && (question.eligible_designs || []).length >= 4, "forskningsspørsmål mangler utfall eller design", question.research_question_id);
}
for (const protocol of protocols) {
  check(protocol.status === "planned_not_registered", "hovedprotokoll fremstilles som registrert", protocol.protocol_id);
  check(protocol.registration?.required_before_screening === true, "protokoll krever ikke forhåndsregistrering", protocol.protocol_id);
  check(protocol.search_plan?.search_status === "not_run", "hovedsøket fremstilles som gjennomført", protocol.protocol_id);
  check(protocol.screening?.independent_reviewers === 2 && protocol.extraction?.independent_reviewers === 2, "protokoll mangler dobbelt review", protocol.protocol_id);
  check(protocol.publication_status?.includes("blocked"), "protokoll mangler publiseringsblokk", protocol.protocol_id);
}

const resultTools = tools.filter((item) => item.result_level_required === true);
const reviewTools = tools.filter((item) => item.result_level_required === false);
check(resultTools.length >= 13, "for få resultatspesifikke vurderingsverktøy", resultTools.length);
check(reviewTools.length === 0 || reviewTools.length >= 2, "dokumentnivå er bare delvis implementert", reviewTools.length);
for (const tool of resultTools) {
  check(tool.independent_reviewers_required === 2 && (tool.domains || []).length >= 5, "resultatverktøy er for svakt", tool.tool_id);
}
for (const tool of reviewTools) {
  check(tool.independent_reviewers_required === 2 && (tool.domains || []).length >= 8, "review-/retningslinjeverktøy er for svakt", tool.tool_id);
}

check(studyFile.status === "schema_ready_no_studies_materialized", "studieregisteret overdriver fremdrift");
check(studies.length === 0 && results.length === 0 && assessments.length === 0 && certainty.length === 0, "uvurdert evidens er materialisert");
check(syntheses.every((item) => item.status === "not_started" && item.conclusion === null && (item.approved_claim_ids || []).length === 0), "syntese konkluderer for tidlig");
check(claims.every((item) => item.pipeline_v2?.status === "provisional_legacy_claim" && item.pipeline_v2?.publication_ready === false), "legacy-claim er ikke provisorisk");

const requiredGates = [
  "gate_sport_research_question_chain", "gate_sport_protocol_preregistration", "gate_sport_dual_review",
  "gate_sport_result_level_bias", "gate_sport_synthesis_before_claim", "gate_sport_certainty_before_publication",
  "gate_sport_living_update"
];
for (const gateId of requiredGates) check(policy.production_gates?.some((item) => item.gate_id === gateId && item.failure_action === "block"), "mangler blokkerende V2-port", gateId);
check(policy.version === "2.0" && policy.pipeline_v2?.publication_ready_requires_all_links === true, "metodepolicy håndhever ikke full kjede");
check(profile.scientific_pipeline_v2?.publication_ready_requires_complete_chain === true, "quizprofilen håndhever ikke full kjede");
check(quality.scientific_pipeline_v2?.manifest === "sport_scientific_pipeline_manifest_v2.json", "kvalitetsmanifestet mangler V2");
check(evidence.status === "canonical_scientific_evidence_layer_partial_coverage", "evidensmanifestet har feil hovedstatus");
check([
  "scientific_pipeline_infrastructure_ready_evidence_materialization_pending",
  "first_priority_protocol_registered_candidate_seed_ready_screening_pending"
].includes(evidence.pipeline_status), "ukjent pipelinestatus", evidence.pipeline_status);
check(evidence.coverage_status?.completed_syntheses === 0 && evidence.coverage_status?.publication_ready_claims === 0, "evidensmanifestet overdriver fullføring");

const counts = {
  classified_hooks: classes.length,
  research_questions: questions.length,
  planned_protocols: protocols.length,
  registered_protocols: protocols.filter((item) => item.status === "registered").length,
  studies: studies.length,
  results: results.length,
  risk_of_bias_assessments: assessments.length,
  planned_syntheses: syntheses.length,
  completed_syntheses: syntheses.filter((item) => item.status === "completed").length,
  certainty_assessments: certainty.length,
  publication_ready_claims: claims.filter((item) => item.pipeline_v2?.publication_ready).length,
  provisional_legacy_claims: claims.filter((item) => item.pipeline_v2?.status === "provisional_legacy_claim").length
};
for (const [key, value] of Object.entries(counts)) check(pipeline.counts?.[key] === value, "pipeline-manifest har feil opptelling", { key, expected: value, actual: pipeline.counts?.[key] });

const report = {
  status: failures.length ? "failed" : "passed",
  version: "2.1",
  subject_id: "sport",
  counts,
  appraisal_levels: { result_level_tools: resultTools.length, review_document_tools: reviewTools.length },
  gates: {
    all_hooks_classified: classes.length === hooks.length,
    one_question_protocol_and_synthesis_per_hook: questions.length === hooks.length && protocols.length === hooks.length && syntheses.length === hooks.length,
    result_level_bias_required: resultTools.every((item) => item.independent_reviewers_required === 2),
    review_document_appraisal_requires_dual_review: reviewTools.every((item) => item.independent_reviewers_required === 2),
    no_unreviewed_evidence_materialized: studies.length === 0 && results.length === 0 && assessments.length === 0 && certainty.length === 0,
    all_legacy_claims_provisional: claims.every((item) => item.pipeline_v2?.status === "provisional_legacy_claim" && item.pipeline_v2?.publication_ready === false),
    publication_chain_enforced: requiredGates.every((gateId) => policy.production_gates?.some((item) => item.gate_id === gateId && item.failure_action === "block")),
    all_references_resolve: !failures.some((item) => item.message?.includes("ukjent"))
  },
  failures
};

if (process.argv.includes("--write")) {
  await mkdir(path.dirname(path.resolve(root, p.report)), { recursive: true });
  await writeFile(path.resolve(root, p.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
