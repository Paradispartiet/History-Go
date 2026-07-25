#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (file) => JSON.parse(await readFile(path.resolve(root, file), "utf8"));
const paths = {
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
  readJson(paths.hooks), readJson(paths.units), readJson(paths.claims), readJson(paths.classification),
  readJson(paths.questions), readJson(paths.protocols), readJson(paths.studies), readJson(paths.bias),
  readJson(paths.syntheses), readJson(paths.certainty), readJson(paths.pipeline), readJson(paths.evidence),
  readJson(paths.policy), readJson(paths.quality), readJson(paths.profile)
]);

const failures = [];
const check = (ok, message, details) => { if (!ok) failures.push(details === undefined ? { message } : { message, details }); };
const text = (value, min = 1) => typeof value === "string" && value.trim().length >= min;
const ids = (items, key, label) => {
  const values = items.map((item) => item?.[key]);
  check(values.every((value) => text(value)), `${label}: mangler ${key}`);
  check(new Set(values).size === values.length, `${label}: dupliserte ${key}`);
  return new Set(values);
};
const refs = (items, key, known, label, idKey) => {
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
const classifications = classFile.classifications || [];
const questions = questionFile.research_questions || [];
const protocols = protocolFile.protocols || [];
const studies = studyFile.studies || [];
const results = studyFile.results || [];
const tools = biasFile.tools || [];
const biasAssessments = biasFile.assessments || [];
const syntheses = synthesisFile.syntheses || [];
const frameworks = certaintyFile.frameworks || [];
const certaintyAssessments = certaintyFile.assessments || [];

const hookIds = ids(hooks, "hook_id", "hooks");
const unitIds = ids(units, "theory_unit_id", "teorienheter");
const trackIds = ids(tracks, "track_id", "spor");
const classIds = ids(classifications, "classification_id", "klassifiseringer");
const questionIds = ids(questions, "research_question_id", "forskningsspørsmål");
const protocolIds = ids(protocols, "protocol_id", "protokoller");
const studyIds = ids(studies, "study_id", "studier");
const resultIds = ids(results, "result_id", "resultater");
const toolIds = ids(tools, "tool_id", "vurderingsverktøy");
const biasIds = ids(biasAssessments, "assessment_id", "biasvurderinger");
const synthesisIds = ids(syntheses, "synthesis_id", "synteser");
const certaintyIds = ids(certaintyAssessments, "certainty_assessment_id", "sikkerhetsvurderinger");
const claimIds = ids(claims, "claim_id", "claims");

check(hooks.length === 56, "forventet 56 Sport-hooks", hooks.length);
check(units.length === 56, "forventet 56 teorienheter", units.length);
check(classifications.length === 56, "alle hooks er ikke klassifisert", classifications.length);
check(questions.length === 56, "alle hooks har ikke forskningsspørsmål", questions.length);
check(protocols.length === 56, "alle hooks har ikke protokoll", protocols.length);
check(syntheses.length === 56, "alle hooks har ikke synteseplan", syntheses.length);
check(tracks.length >= 12, "for få epistemiske spor", tracks.length);
check(tools.length >= 15, "for få vurderingsverktøy", tools.length);

refs(classifications, "hook_id", hookIds, "klassifisering", "classification_id");
refs(classifications, "theory_unit_id", unitIds, "klassifisering", "classification_id");
refs(classifications, "epistemic_track", trackIds, "klassifisering", "classification_id");
refs(classifications, "appraisal_tool_ids", toolIds, "klassifisering", "classification_id");
refs(questions, "classification_id", classIds, "forskningsspørsmål", "research_question_id");
refs(questions, "hook_id", hookIds, "forskningsspørsmål", "research_question_id");
refs(questions, "theory_unit_id", unitIds, "forskningsspørsmål", "research_question_id");
refs(protocols, "research_question_id", questionIds, "protokoll", "protocol_id");
refs(protocols, "appraisal_tool_ids", toolIds, "protokoll", "protocol_id");
refs(syntheses, "research_question_id", questionIds, "syntese", "synthesis_id");
refs(syntheses, "protocol_id", protocolIds, "syntese", "synthesis_id");
refs(syntheses, "included_study_ids", studyIds, "syntese", "synthesis_id");
refs(syntheses, "result_ids", resultIds, "syntese", "synthesis_id");
refs(syntheses, "risk_of_bias_assessment_ids", biasIds, "syntese", "synthesis_id");
refs(syntheses, "certainty_assessment_ids", certaintyIds, "syntese", "synthesis_id");
refs(syntheses, "approved_claim_ids", claimIds, "syntese", "synthesis_id");
refs(certaintyAssessments, "synthesis_id", synthesisIds, "sikkerhetsvurdering", "certainty_assessment_id");

const questionByHook = new Map(questions.map((item) => [item.hook_id, item]));
const protocolByQuestion = new Map(protocols.map((item) => [item.research_question_id, item]));
const synthesisByQuestion = new Map(syntheses.map((item) => [item.research_question_id, item]));
for (const hook of hooks) {
  const question = questionByHook.get(hook.hook_id);
  check(Boolean(question), "hook mangler forskningsspørsmål", hook.hook_id);
  check(Boolean(protocolByQuestion.get(question?.research_question_id)), "forskningsspørsmål mangler protokoll", question?.research_question_id);
  check(Boolean(synthesisByQuestion.get(question?.research_question_id)), "forskningsspørsmål mangler synteseplan", question?.research_question_id);
}

for (const question of questions) {
  check(question.status === "planned_not_answered", "spørsmål fremstilles som besvart", question.research_question_id);
  check(question.publication_status === "blocked", "spørsmål mangler publiseringsblokk", question.research_question_id);
  check(text(question.question_text, 30), "spørsmål er for svakt", question.research_question_id);
  check((question.outcomes || []).length >= 4, "spørsmål mangler utfall", question.research_question_id);
  check((question.eligible_designs || []).length >= 4, "spørsmål mangler studiedesign", question.research_question_id);
}
for (const protocol of protocols) {
  check(protocol.status === "planned_not_registered", "hovedprotokoll fremstilles som registrert", protocol.protocol_id);
  check(protocol.registration?.required_before_screening === true, "protokoll krever ikke registrering", protocol.protocol_id);
  check(protocol.search_plan?.search_status === "not_run", "hovedsøket fremstilles som gjennomført", protocol.protocol_id);
  check(protocol.screening?.independent_reviewers === 2 && protocol.extraction?.independent_reviewers === 2, "protokoll mangler dobbelt review", protocol.protocol_id);
  check(protocol.publication_status?.includes("blocked"), "protokoll mangler publiseringsblokk", protocol.protocol_id);
}

const reviewTools = tools.filter((item) => item.appraisal_level === "review_document");
const resultTools = tools.filter((item) => item.appraisal_level !== "review_document");
for (const tool of resultTools) {
  check(tool.result_level_required === true, "resultatverktøy er ikke resultatspesifikt", tool.tool_id);
  check(tool.independent_reviewers_required === 2, "resultatverktøy mangler to vurderere", tool.tool_id);
  check((tool.domains || []).length >= 5, "resultatverktøy mangler domener", tool.tool_id);
}
for (const tool of reviewTools) {
  check(tool.result_level_required === false, "reviewverktøy er feilaktig resultatspesifikt", tool.tool_id);
  check(tool.independent_reviewers_required === 2, "reviewverktøy mangler to vurderere", tool.tool_id);
  check((tool.domains || []).length >= 8, "reviewverktøy mangler domener", tool.tool_id);
}
check(reviewTools.length === 0 || reviewTools.length >= 2, "reviewnivå er bare delvis implementert", reviewTools.length);

check(studyFile.status === "schema_ready_no_studies_materialized", "studieregisteret overdriver fremdrift");
check(studies.length === 0 && results.length === 0, "studier eller resultater er materialisert uten review");
check(biasAssessments.length === 0, "biasvurderinger er materialisert uten resultater");
for (const synthesis of syntheses) {
  check(synthesis.status === "not_started", "syntese fremstilles som ferdig", synthesis.synthesis_id);
  check(synthesis.last_search_date === null, "syntese har udokumentert søkedato", synthesis.synthesis_id);
  check((synthesis.included_study_ids || []).length === 0 && (synthesis.result_ids || []).length === 0, "syntese har udokumentert materiale", synthesis.synthesis_id);
  check((synthesis.approved_claim_ids || []).length === 0 && synthesis.conclusion === null, "syntese konkluderer for tidlig", synthesis.synthesis_id);
  check(synthesis.publication_status === "blocked", "syntese mangler blokkering", synthesis.synthesis_id);
}
for (const framework of frameworks) {
  check(framework.outcome_or_conclusion_specific === true, "sikkerhetsrammeverk er ikke utfallsspesifikt", framework.framework_id);
  check(framework.independent_reviewers_required === 2, "sikkerhetsrammeverk mangler to vurderere", framework.framework_id);
}
check(certaintyAssessments.length === 0, "sikkerhetsvurderinger finnes før syntese");
for (const claim of claims) {
  check(claim.pipeline_v2?.status === "provisional_legacy_claim", "legacy-claim er ikke provisorisk", claim.claim_id);
  check(claim.pipeline_v2?.publication_ready === false, "legacy-claim er publication-ready", claim.claim_id);
  check((claim.pipeline_v2?.synthesis_ids || []).length === 0 && (claim.pipeline_v2?.certainty_assessment_ids || []).length === 0, "legacy-claim har udokumentert full kjede", claim.claim_id);
}

const requiredGates = [
  "gate_sport_research_question_chain", "gate_sport_protocol_preregistration", "gate_sport_dual_review",
  "gate_sport_result_level_bias", "gate_sport_synthesis_before_claim", "gate_sport_certainty_before_publication",
  "gate_sport_living_update"
];
for (const gateId of requiredGates) check(policy.production_gates?.some((item) => item.gate_id === gateId && item.failure_action === "block"), "mangler blokkerende V2-port", gateId);
check(policy.version === "2.0", "metodepolicy er ikke V2");
check(policy.pipeline_v2?.publication_ready_requires_all_links === true, "policy krever ikke full kjede");
check(profile.scientific_pipeline_v2?.publication_ready_requires_complete_chain === true, "quizprofil krever ikke full kjede");
check(quality.scientific_pipeline_v2?.manifest === "sport_scientific_pipeline_manifest_v2.json", "kvalitetsmanifest mangler V2");
check(evidence.status === "canonical_scientific_evidence_layer_partial_coverage", "evidensmanifestet har feil hovedstatus");
check([
  "scientific_pipeline_infrastructure_ready_evidence_materialization_pending",
  "first_priority_protocol_registered_candidate_seed_ready_screening_pending"
].includes(evidence.pipeline_status), "evidensmanifestet har ukjent pipelinestatus", evidence.pipeline_status);
check(evidence.coverage_status?.completed_syntheses === 0 && evidence.coverage_status?.publication_ready_claims === 0, "evidensmanifestet overdriver fullføring");

const counts = {
  classified_hooks: classifications.length,
  research_questions: questions.length,
  planned_protocols: protocols.length,
  registered_protocols: protocols.filter((item) => item.status === "registered").length,
  studies: studies.length,
  results: results.length,
  risk_of_bias_assessments: biasAssessments.length,
  planned_syntheses: syntheses.length,
  completed_syntheses: syntheses.filter((item) => item.status === "completed").length,
  certainty_assessments: certaintyAssessments.length,
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
    all_hooks_classified: classifications.length === hooks.length,
    one_question_protocol_and_synthesis_per_hook: questions.length === hooks.length && protocols.length === hooks.length && syntheses.length === hooks.length,
    result_level_bias_required: resultTools.every((item) => item.result_level_required && item.independent_reviewers_required === 2),
    review_document_appraisal_requires_dual_review: reviewTools.every((item) => item.result_level_required === false && item.independent_reviewers_required === 2),
    no_unreviewed_evidence_materialized: studies.length === 0 && results.length === 0 && biasAssessments.length === 0 && certaintyAssessments.length === 0,
    all_legacy_claims_provisional: claims.every((item) => item.pipeline_v2?.status === "provisional_legacy_claim" && item.pipeline_v2?.publication_ready === false),
    publication_chain_enforced: requiredGates.every((gateId) => policy.production_gates?.some((item) => item.gate_id === gateId && item.failure_action === "block")),
    all_references_resolve: !failures.some((item) => item.message?.includes("ukjent"))
  },
  failures
};

if (process.argv.includes("--write")) {
  await mkdir(path.dirname(path.resolve(root, paths.report)), { recursive: true });
  await writeFile(path.resolve(root, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
