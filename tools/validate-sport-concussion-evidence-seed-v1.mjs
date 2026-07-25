#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (file) => JSON.parse(await readFile(path.resolve(root, file), "utf8"));
const p = {
  protocol: "data/fag/sport/protocols/concussion_acute_safety_protocol_v1.json",
  packages: "data/fag/sport/evidence_packages_sport_v1.json",
  search: "data/fag/sport/concussion_search_log_sport_v1.json",
  studies: "data/fag/sport/study_registry_sport_v1.json",
  risk: "data/fag/sport/risk_of_bias_sport_v1.json",
  reviewTools: "data/fag/sport/review_appraisal_tools_sport_v1.json",
  syntheses: "data/fag/sport/evidence_syntheses_sport_v1.json",
  certainty: "data/fag/sport/certainty_assessments_sport_v1.json",
  claims: "data/fag/sport/claims_sport_canonical_v1.json",
  policy: "data/fag/sport/sport_scientific_method_policy_v1.json",
  questions: "data/fag/sport/research_questions_sport_v1.json",
  protocols: "data/fag/sport/review_protocols_sport_v1.json",
  pipeline: "data/fag/sport/sport_scientific_pipeline_manifest_v2.json",
  evidence: "data/fag/sport/sport_scientific_evidence_manifest_v1.json",
  profile: "data/fag/sport/supersetQUIZMAL_sport.json",
  report: "reports/sport-concussion-evidence-seed-v1-validation.json"
};
const [protocol, packageFile, searchLog, studyFile, riskFile, reviewFile, synthesisFile, certaintyFile, claimFile, policy, questionFile, protocolFile, pipeline, evidence, profile] = await Promise.all([
  readJson(p.protocol), readJson(p.packages), readJson(p.search), readJson(p.studies), readJson(p.risk),
  readJson(p.reviewTools), readJson(p.syntheses), readJson(p.certainty), readJson(p.claims), readJson(p.policy),
  readJson(p.questions), readJson(p.protocols), readJson(p.pipeline), readJson(p.evidence), readJson(p.profile)
]);

const failures = [];
const check = (ok, message, details) => { if (!ok) failures.push(details === undefined ? { message } : { message, details }); };
const text = (value, min = 1) => typeof value === "string" && value.trim().length >= min;
const packageId = "evidence_package_sport_concussion_acute_safety_v1";
const registrationSha = "bd774539101304f3e0f62333e9950678983152d3";
const evidencePackage = (packageFile.packages || []).find((item) => item.package_id === packageId);
const candidates = searchLog.authoritative_seed?.records || [];
const allowedPackagePhases = new Set([
  "authoritative_seed_completed_database_search_and_dual_screening_pending",
  "search_strategy_locked_peer_review_assignment_and_execution_pending"
]);

check(protocol.status === "registered_before_screening", "protokollen er ikke registrert før screening");
check(protocol.registration_anchor?.commit_sha === registrationSha, "protokollen bruker feil registreringscommit");
check(protocol.registration_anchor?.immutable_snapshot === true, "registreringsankeret er ikke uforanderlig");
check((protocol.scope?.subquestions || []).length === 3, "protokollen mangler de tre delspørsmålene");
check(protocol.screening_and_extraction?.independent_reviewers === 2, "protokollen krever ikke to vurderere");
check(protocol.screening_and_extraction?.full_text_dual_screening === true, "dobbel fulltekstscreening mangler");
check(protocol.screening_and_extraction?.critical_fields_dual_extraction === true, "dobbelt datauttrekk mangler");
check(protocol.screening_and_extraction?.ai_may_assist_but_not_be_sole_reviewer === true, "KI er ikke blokkert som eneste vurderer");
check((protocol.search_strategy?.databases || []).length >= 6, "protokollen har for få databaser");
check(Object.keys(protocol.search_strategy?.full_search_strings || {}).length >= 3, "låste søkestrenger mangler");
check(protocol.publication_status?.startsWith("blocked_"), "protokollen blokkerer ikke publisering");
check(protocol.appraisal_plan?.review_appraisal_registry === "../review_appraisal_tools_sport_v1.json", "protokollen peker ikke til reviewregisteret");
check(protocol.appraisal_plan?.result_level_bias_registry === "../risk_of_bias_sport_v1.json", "protokollen peker ikke til resultatbiasregisteret");

check(Boolean(evidencePackage), "evidenspakken mangler");
check(evidencePackage?.registration_anchor?.commit_sha === registrationSha, "pakken bruker feil registreringsanker");
check(allowedPackagePhases.has(evidencePackage?.phase_status), "pakken overdriver eller har ukjent fremdrift", evidencePackage?.phase_status);
check((evidencePackage?.candidate_record_ids || []).length === 7, "pakken har feil kandidatopptelling");
for (const key of ["study_ids", "result_ids", "risk_of_bias_assessment_ids", "synthesis_ids", "certainty_assessment_ids", "publication_ready_claim_ids"]) {
  check((evidencePackage?.[key] || []).length === 0, `pakken har for tidlige ${key}`);
}

check(candidates.length === 7, "søkeloggen har feil kandidatopptelling");
check(new Set(candidates.map((item) => item.candidate_id)).size === candidates.length, "kandidat-ID-er er ikke unike");
for (const candidate of candidates) {
  check(text(candidate.title, 10), "kandidat mangler offisiell tittel", candidate.candidate_id);
  check(text(candidate.authors_short, 3), "kandidat mangler forfatter eller institusjon", candidate.candidate_id);
  check(Number.isInteger(candidate.year), "kandidat mangler år", candidate.candidate_id);
  check(text(candidate.identifier), "kandidat mangler stabil identifikator", candidate.candidate_id);
  check(/^https:\/\//.test(candidate.url || ""), "kandidat mangler HTTPS-URL", candidate.candidate_id);
  check((candidate.subquestion_ids || []).length > 0, "kandidat mangler delspørsmål", candidate.candidate_id);
  check(text(candidate.retrieval_date) && text(candidate.update_due), "kandidat mangler dato eller kontrollfrist", candidate.candidate_id);
  check(candidate.screening_status === "not_screened", "kandidat er feilaktig screenet", candidate.candidate_id);
  check(candidate.appraisal_status === "not_appraised", "kandidat er feilaktig metodevurdert", candidate.candidate_id);
  check(candidate.inclusion_status === "undetermined", "kandidat har inklusjonsbeslutning for tidlig", candidate.candidate_id);
  check(candidate.publication_use_allowed === false, "kandidat kan feilaktig brukes til publisering", candidate.candidate_id);
}
check((searchLog.database_searches || []).every((item) => item.status === "not_run"), "databasesøk er feilaktig markert utført");
check(searchLog.screening?.status === "not_started" && searchLog.screening?.independent_reviewers_required === 2, "screeningstatus eller vurdererkrav er feil");
check(searchLog.deduplication?.status === "not_run", "deduplisering er feilaktig markert utført");
check(/ingen kandidatpost kan flyttes/i.test(searchLog.publication_rule || "") && /uten protokollstyrt dobbelt screening/i.test(searchLog.publication_rule || ""), "søkeloggen mangler screeningblokkering");

const reviewTools = reviewFile.tools || [];
check(reviewFile.principles?.document_appraisal_does_not_replace_result_level_bias === true, "reviewregisteret blander dokument- og resultatnivå");
check(reviewTools.length === 2, "reviewregisteret skal ha to verktøy", reviewTools.length);
for (const tool of reviewTools) {
  check(tool.appraisal_level === "review_document", "reviewverktøy har feil nivå", tool.tool_id);
  check(tool.result_level_required === false, "reviewverktøy er feilaktig resultatspesifikt", tool.tool_id);
  check(tool.independent_reviewers_required === 2 && (tool.domains || []).length >= 8, "reviewverktøy er for svakt", tool.tool_id);
}
check(!(riskFile.tools || []).some((tool) => reviewTools.some((reviewTool) => reviewTool.tool_id === tool.tool_id)), "reviewverktøy ligger fortsatt i resultatbiasregisteret");
check((riskFile.tools || []).every((tool) => tool.result_level_required === true), "resultatbiasregisteret inneholder ikke-resultatspesifikt verktøy");

const question = (questionFile.research_questions || []).find((item) => item.research_question_id === protocol.parent_research_question_id);
check(question?.evidence_package_ids?.includes(packageId), "forskningsspørsmålet peker ikke til pakken");
const parentProtocol = (protocolFile.protocols || []).find((item) => item.research_question_id === protocol.parent_research_question_id);
check(parentProtocol?.registered_phase_packages?.some((item) => item.package_id === packageId && item.registration_anchor?.commit_sha === registrationSha), "parent-protokollen mangler registrert fasepakke");
const gate = (policy.production_gates || []).find((item) => item.gate_id === "gate_sport_candidate_record_not_evidence");
check(gate?.failure_action === "block", "kandidatporten blokkerer ikke");
check(profile.scientific_evidence_metadata?.candidate_records_forbidden_as_evidence === true, "quizprofilen tillater kandidatposter som evidens");
check(pipeline.files?.review_appraisal_tools === "review_appraisal_tools_sport_v1.json", "pipeline-manifestet mangler reviewregisteret");
check(evidence.integration?.review_appraisal_tools === "review_appraisal_tools_sport_v1.json", "evidensmanifestet mangler reviewregisteret");

check((studyFile.studies || []).length === 0 && (studyFile.results || []).length === 0, "studier eller resultater er materialisert før screening");
check((riskFile.assessments || []).length === 0, "biasvurderinger er materialisert før dobbelt review");
check(!(synthesisFile.syntheses || []).some((item) => item.status === "completed"), "syntese er fullført for tidlig");
check((certaintyFile.assessments || []).length === 0, "sikkerhetsvurdering er materialisert for tidlig");
check(!(claimFile.claims || []).some((item) => item.publication_ready === true), "publication-ready claim finnes før full kjede");

const report = {
  status: failures.length ? "failed" : "passed",
  version: "1.1",
  subject_id: "sport",
  package_id: packageId,
  counts: {
    registered_package_protocols: (packageFile.packages || []).length,
    subquestions: protocol.scope?.subquestions?.length || 0,
    authoritative_seed_candidates: candidates.length,
    database_searches_completed: (searchLog.database_searches || []).filter((item) => item.status === "completed").length,
    screened_records: candidates.filter((item) => item.screening_status !== "not_screened").length,
    included_studies: studyFile.studies?.length || 0,
    results: studyFile.results?.length || 0,
    bias_assessments: riskFile.assessments?.length || 0,
    completed_syntheses: (synthesisFile.syntheses || []).filter((item) => item.status === "completed").length,
    certainty_assessments: certaintyFile.assessments?.length || 0,
    publication_ready_claims: (claimFile.claims || []).filter((item) => item.publication_ready === true).length,
    result_level_tools: riskFile.tools?.length || 0,
    review_document_tools: reviewTools.length
  },
  gates: {
    protocol_registered_before_screening: protocol.status === "registered_before_screening",
    candidate_records_separate_from_evidence: candidates.every((item) => item.publication_use_allowed === false),
    document_and_result_appraisal_separated: reviewTools.every((item) => item.result_level_required === false) && (riskFile.tools || []).every((item) => item.result_level_required === true),
    dual_review_required: protocol.screening_and_extraction?.independent_reviewers === 2,
    no_premature_materialization: (studyFile.studies || []).length === 0 && (riskFile.assessments || []).length === 0 && (certaintyFile.assessments || []).length === 0,
    candidate_gate_blocks_publication: gate?.failure_action === "block",
    all_references_resolve: !failures.some((item) => /peker ikke|mangler registrert/.test(item.message || ""))
  },
  failures
};

if (process.argv.includes("--write")) {
  await mkdir(path.dirname(path.resolve(root, p.report)), { recursive: true });
  await writeFile(path.resolve(root, p.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
