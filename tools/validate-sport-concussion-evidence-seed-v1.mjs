#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (relativePath) => JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));
const paths = {
  protocol: "data/fag/sport/protocols/concussion_acute_safety_protocol_v1.json",
  questions: "data/fag/sport/research_questions_sport_v1.json",
  protocols: "data/fag/sport/review_protocols_sport_v1.json",
  packages: "data/fag/sport/evidence_packages_sport_v1.json",
  searchLog: "data/fag/sport/concussion_search_log_sport_v1.json",
  studies: "data/fag/sport/study_registry_sport_v1.json",
  risk: "data/fag/sport/risk_of_bias_sport_v1.json",
  syntheses: "data/fag/sport/evidence_syntheses_sport_v1.json",
  certainty: "data/fag/sport/certainty_assessments_sport_v1.json",
  claims: "data/fag/sport/claims_sport_canonical_v1.json",
  pipelineManifest: "data/fag/sport/sport_scientific_pipeline_manifest_v2.json",
  evidenceManifest: "data/fag/sport/sport_scientific_evidence_manifest_v1.json",
  policy: "data/fag/sport/sport_scientific_method_policy_v1.json",
  profile: "data/fag/sport/supersetQUIZMAL_sport.json",
  report: "reports/sport-concussion-evidence-seed-v1-validation.json"
};

const [protocol, questionFile, protocolFile, packageFile, searchLog, studyFile, riskFile, synthesisFile, certaintyFile, claimFile, pipelineManifest, evidenceManifest, policy, profile] = await Promise.all([
  readJson(paths.protocol), readJson(paths.questions), readJson(paths.protocols), readJson(paths.packages),
  readJson(paths.searchLog), readJson(paths.studies), readJson(paths.risk), readJson(paths.syntheses),
  readJson(paths.certainty), readJson(paths.claims), readJson(paths.pipelineManifest),
  readJson(paths.evidenceManifest), readJson(paths.policy), readJson(paths.profile)
]);

const failures = [];
const require = (condition, message, details = undefined) => {
  if (!condition) failures.push(details === undefined ? { message } : { message, details });
};
const hasText = (value, min = 1) => typeof value === "string" && value.trim().length >= min;
const packageId = "evidence_package_sport_concussion_acute_safety_v1";

require(protocol.package_id === packageId, "protokollen har feil package_id");
require(protocol.status === "registered_before_screening", "protokollen er ikke registrert før screening");
require(protocol.registration_method === "immutable_repository_commit_before_screening", "protokollen mangler riktig registreringsmetode");
require(/^[0-9a-f]{40}$/.test(protocol.registration_anchor?.commit_sha || ""), "protokollen mangler gyldig commit-anker");
require(protocol.registration_anchor?.path === paths.protocol, "registreringsankeret peker til feil fil");
require(protocol.registration_anchor?.immutable_snapshot === true, "registreringsankeret er ikke markert uforanderlig");
require((protocol.scope?.subquestions || []).length === 3, "protokollen skal ha tre avgrensede delspørsmål");
require(protocol.screening_and_extraction?.independent_reviewers === 2, "protokollen krever ikke to vurderere");
require(protocol.screening_and_extraction?.ai_may_assist_but_not_be_sole_reviewer === true, "protokollen blokkerer ikke KI som eneste vurderer");
require((protocol.search_strategy?.databases || []).length >= 6, "protokollen har for få databaser");
require(Object.keys(protocol.search_strategy?.full_search_strings || {}).length >= 3, "protokollen mangler låste søkestrenger");
require(hasText(protocol.update_policy?.update_due), "protokollen mangler oppdateringsfrist");

const packages = packageFile.packages || [];
require(packages.length === 1, "pakkeregisteret skal foreløpig ha én pakke", packages.length);
const evidencePackage = packages.find((item) => item.package_id === packageId);
require(Boolean(evidencePackage), "hjernerystelsespakken mangler");
require(evidencePackage?.phase_status === "authoritative_seed_completed_database_search_and_dual_screening_pending", "pakken har feil fase-status");
require(evidencePackage?.registration_anchor?.commit_sha === protocol.registration_anchor?.commit_sha, "pakken bruker feil registreringsanker");
require((evidencePackage?.candidate_record_ids || []).length >= 7, "pakken har for få autoritative kandidatposter");
require((evidencePackage?.study_ids || []).length === 0, "pakken påstår at studier er inkludert");
require((evidencePackage?.publication_ready_claim_ids || []).length === 0, "pakken har publication-ready claims for tidlig");

const candidateRecords = searchLog.authoritative_seed?.records || [];
require(searchLog.status === "authoritative_seed_completed_systematic_database_search_pending", "søkeloggen overdriver søkestatus");
require(candidateRecords.length === evidencePackage?.candidate_record_ids?.length, "kandidatopptellingen er inkonsistent");
require(new Set(candidateRecords.map((item) => item.candidate_id)).size === candidateRecords.length, "kandidat-ID-er er ikke unike");
for (const candidate of candidateRecords) {
  require(hasText(candidate.candidate_id), "kandidat mangler ID");
  require(hasText(candidate.title, 20), "kandidat mangler presis tittel", candidate.candidate_id);
  require(Number.isInteger(candidate.year), "kandidat mangler år", candidate.candidate_id);
  require(hasText(candidate.identifier), "kandidat mangler identifikator", candidate.candidate_id);
  require(hasText(candidate.url), "kandidat mangler URL", candidate.candidate_id);
  require((candidate.subquestion_ids || []).length >= 1, "kandidat mangler delspørsmål", candidate.candidate_id);
  require(candidate.screening_status === "not_screened", "kandidat er feilaktig screenet", candidate.candidate_id);
  require(candidate.appraisal_status === "not_appraised", "kandidat er feilaktig metodevurdert", candidate.candidate_id);
  require(candidate.inclusion_status === "undetermined", "kandidat har inklusjonsbeslutning før screening", candidate.candidate_id);
  require(candidate.publication_use_allowed === false, "kandidat kan feilaktig brukes til publisering", candidate.candidate_id);
  require(hasText(candidate.retrieval_date), "kandidat mangler hentet dato", candidate.candidate_id);
}
require((searchLog.database_searches || []).every((item) => item.status === "not_run"), "systematisk databasesøk er feilaktig markert kjørt");
require(searchLog.screening?.status === "not_started", "screening er feilaktig markert startet");
require(searchLog.screening?.independent_reviewers_required === 2, "søkeloggen krever ikke to screenere");
require(searchLog.deduplication?.status === "not_run", "deduplisering er feilaktig markert kjørt");

const question = questionFile.research_questions.find((item) => item.research_question_id === protocol.parent_research_question_id);
require(question?.evidence_package_ids?.includes(packageId), "forskningsspørsmålet peker ikke til pakken");
require((question?.priority_subquestions || []).length === 3, "forskningsspørsmålet mangler delspørsmålene");
const parentProtocol = protocolFile.protocols.find((item) => item.research_question_id === protocol.parent_research_question_id);
const phasePackage = parentProtocol?.registered_phase_packages?.find((item) => item.package_id === packageId);
require(Boolean(phasePackage), "parent-protokollen mangler registrert fasepakke");
require(phasePackage?.registration_anchor?.commit_sha === protocol.registration_anchor?.commit_sha, "parent-protokollen bruker feil registreringsanker");

for (const requiredTool of ["tool_sport_systematic_review_appraisal_v1", "tool_sport_guideline_consensus_appraisal_v1"]) {
  const tool = riskFile.tools?.find((item) => item.tool_id === requiredTool);
  require(Boolean(tool), "mangler vurderingsverktøy", requiredTool);
  require(tool?.independent_reviewers_required === 2, "vurderingsverktøy krever ikke to vurderere", requiredTool);
  require((tool?.domains || []).length >= 8, "vurderingsverktøy har for få domener", requiredTool);
}

const candidateGate = policy.production_gates?.find((item) => item.gate_id === "gate_sport_candidate_record_not_evidence");
require(candidateGate?.failure_action === "block", "policy blokkerer ikke kandidatposter som evidens");
require(policy.candidate_record_policy?.may_support_publication === false, "candidate policy tillater publisering");
require(profile.scientific_evidence_metadata?.candidate_records_forbidden_as_evidence === true, "quizprofilen blokkerer ikke kandidatposter");
require(profile.evidence_layer?.evidence_packages === paths.packages, "quizprofilen peker til feil pakkeregister");
require(pipelineManifest.files?.evidence_packages === "evidence_packages_sport_v1.json", "pipeline-manifestet mangler pakkeregister");
require(pipelineManifest.counts?.registered_package_protocols === 1, "pipeline-manifestet har feil protokollopptelling");
require(pipelineManifest.counts?.authoritative_seed_candidate_records === candidateRecords.length, "pipeline-manifestet har feil kandidatopptelling");
require(evidenceManifest.counts?.production_gates === policy.production_gates?.length, "evidensmanifestet har feil portopptelling");

require((studyFile.studies || []).length === 0, "studier er materialisert før screening");
require((studyFile.results || []).length === 0, "resultater er materialisert før screening");
require((riskFile.assessments || []).length === 0, "biasvurderinger er materialisert uten to vurderere");
require(!(synthesisFile.syntheses || []).some((item) => item.status === "completed"), "syntese er fullført for tidlig");
require((certaintyFile.assessments || []).length === 0, "sikkerhetsvurdering er materialisert for tidlig");
require(!claimFile.claims.some((item) => item.publication_ready === true), "publication-ready claim finnes før full kjede");
const concussionClaim = claimFile.claims.find((item) => item.claim_id === "claim_sport_concussion_remove_assess");
if (concussionClaim) {
  require(concussionClaim.migration_package_id === packageId, "hjernerystelsesclaim peker ikke til migreringspakken");
  require(concussionClaim.publication_ready === false, "hjernerystelsesclaim er feilaktig publication-ready");
}

const report = {
  status: failures.length ? "failed" : "passed",
  version: "1.0",
  subject_id: "sport",
  package_id: packageId,
  counts: {
    registered_package_protocols: packages.length,
    subquestions: protocol.scope?.subquestions?.length || 0,
    authoritative_seed_candidates: candidateRecords.length,
    database_searches_completed: (searchLog.database_searches || []).filter((item) => item.status === "completed").length,
    screened_records: candidateRecords.filter((item) => item.screening_status !== "not_screened").length,
    included_studies: studyFile.studies?.length || 0,
    results: studyFile.results?.length || 0,
    bias_assessments: riskFile.assessments?.length || 0,
    completed_syntheses: (synthesisFile.syntheses || []).filter((item) => item.status === "completed").length,
    certainty_assessments: certaintyFile.assessments?.length || 0,
    publication_ready_claims: claimFile.claims.filter((item) => item.publication_ready === true).length
  },
  gates: {
    protocol_registered_before_screening: protocol.status === "registered_before_screening",
    immutable_commit_anchor_present: /^[0-9a-f]{40}$/.test(protocol.registration_anchor?.commit_sha || ""),
    candidate_records_separate_from_evidence: candidateRecords.every((item) => item.publication_use_allowed === false),
    dual_review_required: protocol.screening_and_extraction?.independent_reviewers === 2,
    no_premature_studies_or_results: (studyFile.studies || []).length === 0 && (studyFile.results || []).length === 0,
    no_premature_appraisal_or_synthesis: (riskFile.assessments || []).length === 0 && !(synthesisFile.syntheses || []).some((item) => item.status === "completed"),
    no_premature_claim_publication: !claimFile.claims.some((item) => item.publication_ready === true),
    candidate_gate_blocks_publication: candidateGate?.failure_action === "block",
    all_references_resolve: !failures.some((item) => item.message?.includes("peker ikke") || item.message?.includes("mangler registrert"))
  },
  failures
};

if (process.argv.includes("--write")) {
  await mkdir(path.dirname(path.resolve(root, paths.report)), { recursive: true });
  await writeFile(path.resolve(root, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
