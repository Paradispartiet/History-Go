#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (relativePath) => JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));
const p = {
  amendment: "data/fag/sport/protocols/concussion_search_strategy_amendment_001.json",
  strategy: "data/fag/sport/concussion_search_strategy_sport_v2.json",
  runs: "data/fag/sport/concussion_search_runs_sport_v1.json",
  dedup: "data/fag/sport/concussion_deduplication_protocol_sport_v1.json",
  screening: "data/fag/sport/concussion_screening_schema_sport_v1.json",
  roles: "data/fag/sport/concussion_reviewer_roles_sport_v1.json",
  searchLog: "data/fag/sport/concussion_search_log_sport_v1.json",
  packages: "data/fag/sport/evidence_packages_sport_v1.json",
  policy: "data/fag/sport/sport_scientific_method_policy_v1.json",
  pipeline: "data/fag/sport/sport_scientific_pipeline_manifest_v2.json",
  evidence: "data/fag/sport/sport_scientific_evidence_manifest_v1.json",
  quality: "data/fag/sport/sport_quality_manifest_v5.json",
  profile: "data/fag/sport/supersetQUIZMAL_sport.json",
  studies: "data/fag/sport/study_registry_sport_v1.json",
  risk: "data/fag/sport/risk_of_bias_sport_v1.json",
  syntheses: "data/fag/sport/evidence_syntheses_sport_v1.json",
  certainty: "data/fag/sport/certainty_assessments_sport_v1.json",
  claims: "data/fag/sport/claims_sport_canonical_v1.json",
  report: "reports/sport-concussion-search-readiness-v2-validation.json"
};

const [
  amendment,
  strategyFile,
  runFile,
  dedup,
  screening,
  rolesFile,
  searchLog,
  packageFile,
  policy,
  pipeline,
  evidence,
  quality,
  profile,
  studyFile,
  riskFile,
  synthesisFile,
  certaintyFile,
  claimFile
] = await Promise.all(Object.values(p).filter((value) => value !== p.report).map(readJson));

const failures = [];
const check = (condition, message, details = undefined) => {
  if (!condition) failures.push(details === undefined ? { message } : { message, details });
};
const text = (value, min = 1) => typeof value === "string" && value.trim().length >= min;
const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const queryText = (strategy) => Array.isArray(strategy.lines) ? strategy.lines.join("\n") : strategy.query;
const uniqueIds = (items, key, label) => {
  const ids = items.map((item) => item?.[key]);
  check(ids.every((id) => text(id)), `${label}: ugyldig ${key}`);
  check(new Set(ids).size === ids.length, `${label}: dupliserte ${key}`);
  return new Set(ids);
};

const packageId = "evidence_package_sport_concussion_acute_safety_v1";
const amendmentCommit = "3605f292cb1bb290c09acf99af394007e7690efa";
const expectedDatabaseIds = new Set([
  "medline_ovid",
  "embase_com",
  "sportdiscus_ebscohost",
  "scopus",
  "web_of_science_core_collection",
  "cochrane_central"
]);

check(amendment.package_id === packageId, "amendment bruker feil pakke");
check(amendment.status === "locked_before_search_execution_peer_review_pending", "amendment er ikke låst før kjøring");
check(amendment.timing?.database_searches_completed === 0, "amendment er registrert etter databasesøk");
check(amendment.timing?.records_screened === 0, "amendment er registrert etter screening");
check(amendment.timing?.post_hoc_change === false, "amendment er feilaktig post hoc");
check(amendment.search_peer_review?.required_before_execution === true, "PRESS-review er ikke obligatorisk før kjøring");
check(amendment.search_peer_review?.status === "pending", "PRESS-review er feilaktig markert ferdig");

const strategies = strategyFile.database_strategies || [];
const strategyIds = uniqueIds(strategies, "database_id", "databasestrategier");
check(strategies.length === 6, "det finnes ikke seks låste databasestrategier", strategies.length);
for (const id of expectedDatabaseIds) check(strategyIds.has(id), "mangler forventet databasestrategi", id);
check(strategyFile.amendment_anchor?.commit_sha === amendmentCommit, "strategiregisteret bruker feil amendment-commit");
check(strategyFile.amendment_anchor?.immutable_snapshot === true, "amendment-ankeret er ikke uforanderlig");
check(strategyFile.search_peer_review?.status === "pending", "strategiregisteret overdriver peer-review-status");
check(strategyFile.search_peer_review?.required_before_execution === true, "strategiregisteret tillater kjøring uten peer review");

for (const strategy of strategies) {
  const query = queryText(strategy);
  check(text(query, 120), "databasestrategi er for kort eller mangler", strategy.database_id);
  check(strategy.status === "locked_not_run", "databasestrategi er ikke locked_not_run", strategy.database_id);
  check(strategy.execution_status === "not_run", "databasestrategi er feilaktig kjørt", strategy.database_id);
  check(strategy.peer_review_status === "pending_PRESS", "databasestrategi har feil peer-review-status", strategy.database_id);
  check(strategy.execution_allowed === false, "databasestrategi tillater kjøring for tidlig", strategy.database_id);
  check(strategy.query_sha256 === sha256(query), "databasestrategi har feil query_sha256", strategy.database_id);
  check(strategy.result_count === null && strategy.export_sha256 === null, "databasestrategi har for tidlige resultater", strategy.database_id);
  check(strategy.registered_amendment_anchor?.commit_sha === amendmentCommit, "databasestrategi mangler amendment-anker", strategy.database_id);
  check(Object.keys(strategy.interface_filters || {}).length >= 2, "databasestrategi mangler eksplisitte filtre", strategy.database_id);
}

const medline = strategies.find((item) => item.database_id === "medline_ovid");
const embase = strategies.find((item) => item.database_id === "embase_com");
const sportdiscus = strategies.find((item) => item.database_id === "sportdiscus_ebscohost");
const scopus = strategies.find((item) => item.database_id === "scopus");
const webOfScience = strategies.find((item) => item.database_id === "web_of_science_core_collection");
const central = strategies.find((item) => item.database_id === "cochrane_central");
check((medline?.lines || []).length >= 9 && medline?.final_set === "9", "MEDLINE-strategien er ikke komplett");
check(/'brain concussion'\/exp/.test(embase?.query || "") && /:ti,ab,kw/.test(embase?.query || ""), "Embase-strategien mangler Emtree eller feltkoder");
check(/MH \"Brain Concussion\+\"/.test(sportdiscus?.query || "") && /TI \(/.test(sportdiscus?.query || ""), "SPORTDiscus-strategien mangler emneord eller feltkoder");
check(/^TITLE-ABS-KEY\(/.test(scopus?.query || "") && /PUBYEAR > 2000/.test(scopus?.query || ""), "Scopus-strategien mangler felt eller tidsavgrensning");
check(/^TS=\(/.test(webOfScience?.query || "") && webOfScience?.interface_filters?.timespan_from === 2001, "Web of Science-strategien er ikke komplett");
check((central?.lines || []).length >= 9 && central?.final_set === "#9", "CENTRAL-strategien er ikke komplett");

const runs = runFile.runs || [];
const runIds = uniqueIds(runs, "search_run_id", "søkekjøringer");
check(runs.length === 6, "run-registeret har feil antall kjøringer", runs.length);
check(runFile.completed_run_count === 0, "run-registeret overdriver antall kjøringer");
for (const run of runs) {
  check(strategyIds.has(run.database_id), "run peker til ukjent database", run.search_run_id);
  check(run.status === "blocked_pending_PRESS_peer_review_and_database_access", "run er ikke blokkert", run.search_run_id);
  check(run.peer_review_status === "pending", "run overdriver peer review", run.search_run_id);
  check(run.assigned_executor_person_id === null, "run har uregistrert utfører", run.search_run_id);
  check(run.executed_at === null && run.result_count === null, "run har for tidlige kjøringsdata", run.search_run_id);
  check(run.export?.status === "not_created" && run.export?.sha256 === null, "run har for tidlig eksport", run.search_run_id);
  const strategy = strategies.find((item) => item.database_id === run.database_id);
  check(run.query_sha256 === strategy?.query_sha256, "run og strategi har ulik hash", run.search_run_id);
}
check(runIds.size === expectedDatabaseIds.size, "run-ID-er er ikke entydige");

const roles = rolesFile.roles || [];
const roleIds = uniqueIds(roles, "role_id", "reviewerroller");
check(roles.length === 5, "reviewerregisteret skal ha fem roller", roles.length);
check(roles.every((role) => role.human_required === true), "en reviewerrolle tillater ikke-menneskelig innehaver");
check(roles.every((role) => role.assigned_person_id === null), "menneskelige vurderere er feilaktig markert tildelt");
for (const expectedRole of [
  "reviewer_role_sport_information_specialist_1",
  "reviewer_role_sport_information_specialist_2",
  "reviewer_role_sport_screening_1",
  "reviewer_role_sport_screening_2",
  "reviewer_role_sport_adjudicator"
]) check(roleIds.has(expectedRole), "mangler reviewerrolle", expectedRole);
check(rolesFile.assignment_gate?.status === "blocked", "rolleporten er ikke blokkert");
check((rolesFile.independence_rules || []).some((rule) => /AI cannot occupy/.test(rule)), "AI er ikke blokkert som reviewer");
check((rolesFile.independence_rules || []).some((rule) => /different people/.test(rule)), "uavhengighet mellom screenere er ikke eksplisitt");

check(dedup.status === "protocol_locked_execution_pending", "dedupliseringsprotokollen er ikke låst");
check((dedup.automatic_duplicate_rules_in_order || []).length >= 4, "dedupliseringsprotokollen har for få eksakte regler");
check(dedup.possible_duplicate_rule?.automatic_merge_forbidden === true, "fuzzy duplikater kan feilaktig auto-merges");
check(dedup.audit_output?.cluster_registry_required === true, "clusterproveniens er ikke obligatorisk");
check(dedup.audit_output?.output_sha256_required === true, "deduplisert output krever ikke SHA-256");
check(dedup.execution?.status === "not_run", "deduplisering er feilaktig kjørt");
check(dedup.execution?.before_count === null && dedup.execution?.after_count === null, "deduplisering har for tidlige tellinger");

check(screening.status === "schema_locked_assignments_and_screening_pending", "screeningskjemaet har feil status");
check(screening.reviewer_role_registry === p.roles, "screeningskjemaet peker til feil reviewerregister");
check(screening.stages?.title_abstract?.independent_reviewers_required === 2, "tittel/abstract krever ikke to reviewere");
check(screening.stages?.full_text?.independent_reviewers_required === 2, "fulltekst krever ikke to reviewere");
check(screening.stages?.title_abstract?.blinded_until_both_submitted === true, "tittel/abstract er ikke uavhengig blindet");
check(screening.stages?.full_text?.blinded_until_both_submitted === true, "fulltekst er ikke uavhengig blindet");
check((screening.exclusion_reasons || []).length >= 12, "screeningskjemaet har for få eksklusjonsgrunner");
check(new Set((screening.exclusion_reasons || []).map((item) => item.code)).size === (screening.exclusion_reasons || []).length, "eksklusjonskoder er ikke unike");
check(screening.conflict_resolution?.initial_decisions_preserved === true, "opprinnelige screeningbeslutninger bevares ikke");
check(screening.execution?.status === "not_started" && screening.execution?.assigned_human_reviewers === 0, "screening er feilaktig startet");

check(searchLog.version === "2.0", "søkeloggen er ikke oppgradert til V2");
check(searchLog.status === "search_strategy_locked_peer_review_assignment_and_execution_pending", "søkeloggen overdriver fremdrift");
check(searchLog.search_strategy_registry === p.strategy, "søkeloggen peker til feil strategiregister");
check(searchLog.search_run_registry === p.runs, "søkeloggen peker til feil run-register");
check(searchLog.deduplication_protocol === p.dedup, "søkeloggen peker til feil dedupliseringsprotokoll");
check(searchLog.screening_schema === p.screening, "søkeloggen peker til feil screeningskjema");
check(searchLog.reviewer_role_registry === p.roles, "søkeloggen peker til feil reviewerregister");
check((searchLog.database_searches || []).length === 6, "søkeloggen har ikke seks databaser");
check((searchLog.database_searches || []).every((item) => item.status === "not_run" && item.peer_review_status === "pending"), "søkeloggen markerer søk som kjørt");
check(searchLog.deduplication?.status === "not_run", "søkeloggen markerer deduplisering som kjørt");
check(searchLog.screening?.status === "not_started" && searchLog.screening?.assigned_human_reviewers === 0, "søkeloggen markerer screening som startet");

const evidencePackage = (packageFile.packages || []).find((item) => item.package_id === packageId);
check(Boolean(evidencePackage), "hjernerystelsespakken mangler");
check(evidencePackage?.phase_status === "search_strategy_locked_peer_review_assignment_and_execution_pending", "pakken overdriver fremdrift");
check(evidencePackage?.search_amendment_anchor?.commit_sha === amendmentCommit, "pakken mangler search-amendment-anker");
check(evidencePackage?.completed_database_searches === 0, "pakken overdriver ferdige søk");
check(evidencePackage?.assigned_human_reviewers === 0, "pakken overdriver reviewerbemanning");
for (const key of ["study_ids", "result_ids", "risk_of_bias_assessment_ids", "synthesis_ids", "certainty_assessment_ids", "publication_ready_claim_ids"]) {
  check((evidencePackage?.[key] || []).length === 0, `pakken har for tidlige ${key}`);
}

for (const gateId of [
  "gate_sport_search_peer_review",
  "gate_sport_search_run_provenance",
  "gate_sport_deduplication_reproducibility",
  "gate_sport_independent_screening_assignment"
]) {
  const gate = (policy.production_gates || []).find((item) => item.gate_id === gateId);
  check(gate?.failure_action === "block", "mangler blokkerende søke- eller screeningport", gateId);
}
check(policy.search_execution_policy?.search_execution_allowed === false, "policy tillater søk for tidlig");
check(policy.search_execution_policy?.screening_allowed === false, "policy tillater screening for tidlig");
check(pipeline.counts?.locked_database_strategies === 6, "pipeline-manifestet har feil strategiantall");
check(pipeline.counts?.completed_database_searches === 0, "pipeline-manifestet overdriver søk");
check(pipeline.counts?.assigned_human_reviewers === 0, "pipeline-manifestet overdriver reviewere");
check(pipeline.readiness?.search_peer_review === "pending", "pipeline-manifestet overdriver peer review");
check(evidence.counts?.production_gates === (policy.production_gates || []).length, "evidensmanifestets porttall er feil");
check(evidence.integration?.first_priority_search_strategy === "concussion_search_strategy_sport_v2.json", "evidensmanifestet mangler strategiregister");
check(quality.scientific_evidence_layer?.first_priority_screening_schema === "concussion_screening_schema_sport_v1.json", "kvalitetsmanifestet mangler screeningskjema");
check(profile.evidence_layer?.first_priority_search_strategy === p.strategy, "quizprofilen mangler strategiregister");

const candidates = searchLog.authoritative_seed?.records || [];
check(candidates.length === 7, "de sju seed-kandidatene er ikke bevart");
check(candidates.every((item) => item.screening_status === "not_screened" && item.publication_use_allowed === false), "seed-kandidat er feilaktig screenet eller publiserbar");
check((studyFile.studies || []).length === 0 && (studyFile.results || []).length === 0, "studier eller resultater er materialisert for tidlig");
check((riskFile.assessments || []).length === 0, "biasvurderinger er materialisert for tidlig");
check(!(synthesisFile.syntheses || []).some((item) => item.status === "completed"), "syntese er fullført for tidlig");
check((certaintyFile.assessments || []).length === 0, "sikkerhetsvurdering er materialisert for tidlig");
check(!(claimFile.claims || []).some((item) => item.publication_ready === true), "publication-ready claim finnes for tidlig");

const report = {
  status: failures.length ? "failed" : "passed",
  version: "2.0",
  subject_id: "sport",
  package_id: packageId,
  counts: {
    locked_database_strategies: strategies.length,
    completed_database_searches: runs.filter((item) => item.status === "completed").length,
    search_exports: runs.filter((item) => item.export?.status === "created").length,
    defined_reviewer_roles: roles.length,
    assigned_human_reviewers: roles.filter((item) => item.assigned_person_id).length,
    deduplication_runs: dedup.execution?.status === "completed" ? 1 : 0,
    screening_decisions: (screening.execution?.title_abstract_decisions || 0) + (screening.execution?.full_text_decisions || 0),
    included_studies: studyFile.studies?.length || 0,
    publication_ready_claims: claimFile.claims?.filter((item) => item.publication_ready === true).length || 0
  },
  gates: {
    amendment_registered_before_execution: amendment.timing?.database_searches_completed === 0,
    all_six_strategies_locked_and_hashed: strategies.length === 6 && strategies.every((item) => item.query_sha256 === sha256(queryText(item))),
    PRESS_peer_review_required: strategyFile.search_peer_review?.required_before_execution === true,
    all_runs_blocked_until_review_and_assignment: runs.every((item) => item.status.startsWith("blocked_")),
    export_checksum_required: (runFile.execution_invariants || []).some((item) => item.includes("SHA-256")),
    deterministic_deduplication_locked: dedup.status === "protocol_locked_execution_pending",
    dual_screening_schema_locked: screening.stages?.title_abstract?.independent_reviewers_required === 2 && screening.stages?.full_text?.independent_reviewers_required === 2,
    human_roles_defined_but_unassigned: roles.every((item) => item.human_required === true && item.assigned_person_id === null),
    no_premature_materialization: (studyFile.studies || []).length === 0 && (riskFile.assessments || []).length === 0 && (certaintyFile.assessments || []).length === 0,
    all_references_resolve: !failures.some((failure) => /peker til feil|mangler .*register|ukjent/.test(failure.message || ""))
  },
  failures
};

if (process.argv.includes("--write")) {
  await mkdir(path.dirname(path.resolve(root, p.report)), { recursive: true });
  await writeFile(path.resolve(root, p.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
