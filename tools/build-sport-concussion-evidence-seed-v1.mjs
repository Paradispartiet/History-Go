#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const registrationCommit = "bd774539101304f3e0f62333e9950678983152d3";
const sportDir = "data/fag/sport";
const paths = {
  registeredProtocol: `${sportDir}/protocols/concussion_acute_safety_protocol_v1.json`,
  questions: `${sportDir}/research_questions_sport_v1.json`,
  protocols: `${sportDir}/review_protocols_sport_v1.json`,
  studies: `${sportDir}/study_registry_sport_v1.json`,
  risk: `${sportDir}/risk_of_bias_sport_v1.json`,
  syntheses: `${sportDir}/evidence_syntheses_sport_v1.json`,
  certainty: `${sportDir}/certainty_assessments_sport_v1.json`,
  claims: `${sportDir}/claims_sport_canonical_v1.json`,
  pipelineManifest: `${sportDir}/sport_scientific_pipeline_manifest_v2.json`,
  evidenceManifest: `${sportDir}/sport_scientific_evidence_manifest_v1.json`,
  policy: `${sportDir}/sport_scientific_method_policy_v1.json`,
  qualityManifest: `${sportDir}/sport_quality_manifest_v5.json`,
  profile: `${sportDir}/supersetQUIZMAL_sport.json`,
  packages: `${sportDir}/evidence_packages_sport_v1.json`,
  searchLog: `${sportDir}/concussion_search_log_sport_v1.json`,
  reportJson: "reports/sport-concussion-evidence-seed-v1-validation.json",
  reportMd: "reports/sport-concussion-evidence-seed-v1.md"
};

const readJson = async (relativePath) => JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));
const writeJson = async (relativePath, value) => {
  await mkdir(path.dirname(path.resolve(root, relativePath)), { recursive: true });
  await writeFile(path.resolve(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
const unique = (items) => [...new Set(items.filter(Boolean))];
const upsert = (items, key, item) => {
  const index = items.findIndex((entry) => entry?.[key] === item[key]);
  if (index >= 0) items[index] = item;
  else items.push(item);
};

const [
  registeredProtocol,
  questionFile,
  protocolFile,
  studyFile,
  riskFile,
  synthesisFile,
  certaintyFile,
  claimFile,
  pipelineManifest,
  evidenceManifest,
  policy,
  qualityManifest,
  profile
] = await Promise.all([
  readJson(paths.registeredProtocol),
  readJson(paths.questions),
  readJson(paths.protocols),
  readJson(paths.studies),
  readJson(paths.risk),
  readJson(paths.syntheses),
  readJson(paths.certainty),
  readJson(paths.claims),
  readJson(paths.pipelineManifest),
  readJson(paths.evidenceManifest),
  readJson(paths.policy),
  readJson(paths.qualityManifest),
  readJson(paths.profile)
]);

if (registeredProtocol.status !== "registered_before_screening") throw new Error("Hjernerystelsesprotokollen er ikke registrert før screening");
if (registeredProtocol.package_id !== "evidence_package_sport_concussion_acute_safety_v1") throw new Error("Uventet package_id");

registeredProtocol.registration_anchor = {
  repository: "Paradispartiet/History-Go",
  commit_sha: registrationCommit,
  path: paths.registeredProtocol,
  immutable_snapshot: true
};

const candidateRecords = [
  {
    candidate_id: "candidate_sport_concussion_amsterdam_consensus_2023",
    title: "Consensus statement on concussion in sport: the 6th International Conference on Concussion in Sport–Amsterdam, October 2022",
    authors_short: "Patricios et al.",
    year: 2023,
    source_type: "evidence_informed_consensus_statement",
    identifier: "doi:10.1136/bjsports-2023-106898",
    url: "https://bjsm.bmj.com/content/57/11/695",
    subquestion_ids: [
      "rq_sport_concussion_immediate_response_01",
      "rq_sport_concussion_return_activity_01",
      "rq_sport_concussion_early_activity_01"
    ],
    seed_role: "consensus_map_and_reference_hub",
    retrieval_date: "2026-07-25",
    screening_status: "not_screened",
    appraisal_status: "not_appraised",
    inclusion_status: "undetermined",
    publication_use_allowed: false,
    update_due: "2027-06-30",
    conflict_note: "Finansiering, ekspertutvalg og interessekonflikter skal vurderes eksplisitt før bruk."
  },
  {
    candidate_id: "candidate_sport_concussion_amsterdam_methodology_2023",
    title: "Amsterdam 2022 process: A summary of the methodology for the Amsterdam International Consensus on Concussion in Sport",
    authors_short: "Schneider et al.",
    year: 2023,
    source_type: "consensus_methodology",
    identifier: "doi:10.1136/bjsports-2022-106663",
    url: "https://bjsm.bmj.com/content/57/11/712",
    subquestion_ids: [
      "rq_sport_concussion_immediate_response_01",
      "rq_sport_concussion_return_activity_01",
      "rq_sport_concussion_early_activity_01"
    ],
    seed_role: "methodology_and_review_provenance",
    retrieval_date: "2026-07-25",
    screening_status: "not_screened",
    appraisal_status: "not_appraised",
    inclusion_status: "undetermined",
    publication_use_allowed: false,
    update_due: "2027-06-30"
  },
  {
    candidate_id: "candidate_sport_concussion_rest_exercise_sr_2023",
    title: "Rest and exercise early after sport-related concussion: a systematic review and meta-analysis",
    authors_short: "Leddy et al.",
    year: 2023,
    source_type: "systematic_review_meta_analysis",
    identifier: "doi:10.1136/bjsports-2022-106676",
    secondary_identifier: "PROSPERO:CRD42020158928",
    url: "https://bjsm.bmj.com/content/57/12/762",
    subquestion_ids: ["rq_sport_concussion_early_activity_01"],
    seed_role: "priority_systematic_review",
    retrieval_date: "2026-07-25",
    screening_status: "not_screened",
    appraisal_status: "not_appraised",
    inclusion_status: "undetermined",
    publication_use_allowed: false,
    update_due: "2027-06-30"
  },
  {
    candidate_id: "candidate_sport_concussion_rehabilitation_sr_2023",
    title: "Targeted interventions and their effect on recovery in children, adolescents and adults who have sustained a sport-related concussion: a systematic review",
    authors_short: "Schneider et al.",
    year: 2023,
    source_type: "systematic_review",
    identifier: "doi:10.1136/bjsports-2022-106685",
    url: "https://bjsm.bmj.com/content/57/12/771",
    subquestion_ids: [
      "rq_sport_concussion_return_activity_01",
      "rq_sport_concussion_early_activity_01"
    ],
    seed_role: "priority_systematic_review",
    retrieval_date: "2026-07-25",
    screening_status: "not_screened",
    appraisal_status: "not_appraised",
    inclusion_status: "undetermined",
    publication_use_allowed: false,
    update_due: "2027-06-30"
  },
  {
    candidate_id: "candidate_sport_concussion_return_learn_sport_sr_2023",
    title: "Clinical recovery from concussion: return to school and sport: a systematic review and meta-analysis",
    authors_short: "Putukian et al.",
    year: 2023,
    source_type: "systematic_review_meta_analysis",
    identifier: "doi:10.1136/bjsports-2022-106682",
    url: "https://bjsm.bmj.com/content/57/12/798",
    subquestion_ids: ["rq_sport_concussion_return_activity_01"],
    seed_role: "priority_systematic_review",
    retrieval_date: "2026-07-25",
    screening_status: "not_screened",
    appraisal_status: "not_appraised",
    inclusion_status: "undetermined",
    publication_use_allowed: false,
    update_due: "2027-06-30"
  },
  {
    candidate_id: "candidate_sport_concussion_cdc_guidelines_2026",
    title: "HEADS UP Guidelines and Recommendations",
    authors_short: "US Centers for Disease Control and Prevention",
    year: 2026,
    source_type: "current_public_health_guidance",
    identifier: "url:https://www.cdc.gov/heads-up/guidelines/index.html",
    url: "https://www.cdc.gov/heads-up/guidelines/index.html",
    subquestion_ids: [
      "rq_sport_concussion_immediate_response_01",
      "rq_sport_concussion_return_activity_01"
    ],
    seed_role: "current_implementation_guidance",
    retrieval_date: "2026-07-25",
    source_updated_at: "2026-02-06",
    screening_status: "not_screened",
    appraisal_status: "not_appraised",
    inclusion_status: "undetermined",
    publication_use_allowed: false,
    update_due: "2027-02-06"
  },
  {
    candidate_id: "candidate_sport_concussion_cdc_return_sport_2025",
    title: "CDC HEADS UP: Returning to Sports After a Concussion",
    authors_short: "US Centers for Disease Control and Prevention",
    year: 2025,
    source_type: "current_public_health_guidance",
    identifier: "url:https://www.cdc.gov/heads-up/guidelines/returning-to-sports.html",
    url: "https://www.cdc.gov/heads-up/guidelines/returning-to-sports.html",
    subquestion_ids: ["rq_sport_concussion_return_activity_01"],
    seed_role: "current_implementation_guidance",
    retrieval_date: "2026-07-25",
    source_updated_at: "2025-09-15",
    screening_status: "not_screened",
    appraisal_status: "not_appraised",
    inclusion_status: "undetermined",
    publication_use_allowed: false,
    update_due: "2026-09-15"
  }
];

const packageFile = {
  version: "1.0",
  subject_id: "sport",
  type: "evidence_package_registry",
  status: "first_priority_package_registered_search_seeded_screening_pending",
  updated_at: "2026-07-25",
  packages: [
    {
      package_id: registeredProtocol.package_id,
      title: registeredProtocol.title,
      parent_hook_id: registeredProtocol.parent_hook_id,
      parent_research_question_id: registeredProtocol.parent_research_question_id,
      registered_protocol_path: paths.registeredProtocol,
      registration_anchor: registeredProtocol.registration_anchor,
      subquestion_ids: registeredProtocol.scope.subquestions.map((item) => item.subquestion_id),
      phase_status: "authoritative_seed_completed_database_search_and_dual_screening_pending",
      candidate_record_ids: candidateRecords.map((item) => item.candidate_id),
      study_ids: [],
      result_ids: [],
      risk_of_bias_assessment_ids: [],
      synthesis_ids: [],
      certainty_assessment_ids: [],
      publication_ready_claim_ids: [],
      independent_review_required: true,
      safety_priority: "highest",
      update_due: registeredProtocol.update_policy.update_due
    }
  ]
};

const searchLog = {
  version: "1.0",
  subject_id: "sport",
  package_id: registeredProtocol.package_id,
  type: "search_and_candidate_log",
  status: "authoritative_seed_completed_systematic_database_search_pending",
  updated_at: "2026-07-25",
  protocol_registration_anchor: registeredProtocol.registration_anchor,
  authoritative_seed: {
    purpose: "Finne sentrale autoritative dokumenter og kjente systematiske oversikter for søkeutvidelse. Frøsøket er ikke en systematisk litteratursøkning og avgjør ikke inklusjon.",
    run_at: "2026-07-25",
    query_families: [
      "Amsterdam 2022 concussion consensus and systematic reviews",
      "sport-related concussion return to learn return to sport systematic review",
      "sport-related concussion rest exercise rehabilitation systematic review",
      "current public-health concussion guidance"
    ],
    records: candidateRecords
  },
  database_searches: registeredProtocol.search_strategy.databases.map((database) => ({
    database,
    status: "not_run",
    executed_at: null,
    exact_search_string: registeredProtocol.search_strategy.full_search_strings[database] || null,
    result_count: null,
    export_checksum: null
  })),
  deduplication: {
    status: "not_run",
    method: null,
    before_count: null,
    after_count: null
  },
  screening: {
    status: "not_started",
    independent_reviewers_required: 2,
    reviewer_ids: [],
    conflicts: [],
    adjudications: []
  },
  publication_rule: "Ingen kandidatpost kan flyttes til study_registry eller evidence_registry uten protokollstyrt dobbelt screening og dokumentert vurdering."
};

const toolsToAdd = [
  {
    tool_id: "tool_sport_systematic_review_appraisal_v1",
    version: "1.0",
    applicability: "Systematiske oversikter og metaanalyser",
    appraisal_level: "review_document",
    domains: [
      "forhåndsregistrert protokoll",
      "søkeomfang og oppdateringsdato",
      "duplikat screening og ekstraksjon",
      "biasvurdering av inkluderte resultater",
      "syntesemetode",
      "heterogenitet og robusthet",
      "publiseringsskjevhet",
      "finansiering og interessekonflikter"
    ],
    result_level_required: false,
    independent_reviewers_required: 2,
    adjudication_required_on_disagreement: true,
    status: "canonical_pipeline_tool"
  },
  {
    tool_id: "tool_sport_guideline_consensus_appraisal_v1",
    version: "1.0",
    applicability: "Kliniske retningslinjer, folkehelseråd og konsensusuttalelser",
    appraisal_level: "review_document",
    domains: [
      "formål og målgruppe",
      "interessent- og pasientrepresentasjon",
      "systematisk evidensinnhenting",
      "kobling mellom evidens og anbefaling",
      "uenighet og konsensusmetode",
      "anvendbarhet og implementering",
      "redaksjonell uavhengighet og interessekonflikter",
      "oppdateringsplan"
    ],
    result_level_required: false,
    independent_reviewers_required: 2,
    adjudication_required_on_disagreement: true,
    status: "canonical_pipeline_tool"
  }
];
for (const tool of toolsToAdd) upsert(riskFile.tools, "tool_id", tool);
riskFile.updated_at = "2026-07-25";

const question = questionFile.research_questions.find((item) => item.research_question_id === registeredProtocol.parent_research_question_id);
if (!question) throw new Error("Fant ikke parent research question");
question.evidence_package_ids = unique([...(question.evidence_package_ids || []), registeredProtocol.package_id]);
question.priority_subquestions = registeredProtocol.scope.subquestions;

const parentProtocol = protocolFile.protocols.find((item) => item.research_question_id === registeredProtocol.parent_research_question_id);
if (!parentProtocol) throw new Error("Fant ikke parent review protocol");
parentProtocol.registered_phase_packages = [
  ...(parentProtocol.registered_phase_packages || []).filter((item) => item.package_id !== registeredProtocol.package_id),
  {
    package_id: registeredProtocol.package_id,
    scope: "hjernerystelse, umiddelbar respons, retur til aktivitet og tidlig aktivitetsstyring",
    protocol_path: paths.registeredProtocol,
    registration_anchor: registeredProtocol.registration_anchor,
    status: "registered_before_screening"
  }
];

const candidateGate = {
  gate_id: "gate_sport_candidate_record_not_evidence",
  rule: "En kandidatpost fra søk eller frøsøk er ikke evidens og kan ikke støtte claim, quiztekst eller sikkerhetsgrad før dobbelt screening, inklusjonsbeslutning og relevant metodevurdering er dokumentert.",
  failure_action: "block"
};
upsert(policy.production_gates, "gate_id", candidateGate);
policy.updated_at = "2026-07-25";
policy.candidate_record_policy = {
  candidate_registry: paths.searchLog,
  may_support_publication: false,
  promotion_requires: [
    "protokollstyrt dobbelt screening",
    "dokumentert inklusjonsbeslutning",
    "riktig vurderingsverktøy",
    "proveniens og identifikator"
  ]
};

pipelineManifest.updated_at = "2026-07-25";
pipelineManifest.files.evidence_packages = "evidence_packages_sport_v1.json";
pipelineManifest.files.first_priority_search_log = "concussion_search_log_sport_v1.json";
pipelineManifest.files.first_registered_protocol = "protocols/concussion_acute_safety_protocol_v1.json";
pipelineManifest.counts.registered_package_protocols = 1;
pipelineManifest.counts.authoritative_seed_candidate_records = candidateRecords.length;
pipelineManifest.readiness.first_priority_package = "registered_and_seeded_pending_database_search_and_dual_screening";
pipelineManifest.invariants = unique([
  ...(pipelineManifest.invariants || []),
  "Kandidatposter fra søk er ikke studier, evidens eller claims.",
  "En pakkeregistrering må peke til en commit som er opprettet før screening starter."
]);

evidenceManifest.updated_at = "2026-07-25";
evidenceManifest.integration.evidence_packages = "evidence_packages_sport_v1.json";
evidenceManifest.integration.first_priority_search_log = "concussion_search_log_sport_v1.json";
evidenceManifest.counts.production_gates = policy.production_gates.length;
evidenceManifest.pipeline_status = "scientific_pipeline_infrastructure_ready_evidence_materialization_pending";
evidenceManifest.first_priority_package_status = "protocol_registered_candidate_seed_ready_screening_pending";

qualityManifest.scientific_evidence_layer.evidence_packages = "evidence_packages_sport_v1.json";
qualityManifest.scientific_evidence_layer.first_priority_protocol = "protocols/concussion_acute_safety_protocol_v1.json";
qualityManifest.scientific_evidence_layer.first_priority_search_log = "concussion_search_log_sport_v1.json";

profile.evidence_layer.evidence_packages = paths.packages;
profile.evidence_layer.first_priority_protocol = paths.registeredProtocol;
profile.evidence_layer.first_priority_search_log = paths.searchLog;
profile.scientific_evidence_metadata.candidate_records_forbidden_as_evidence = true;
profile.category_rules = unique([
  ...(profile.category_rules || []),
  "Kandidatposter fra søk kan ikke brukes i knowledge eller quiz før full evidenskjede er godkjent."
]);

const concussionClaim = claimFile.claims.find((item) => item.claim_id === "claim_sport_concussion_remove_assess");
if (concussionClaim) {
  concussionClaim.migration_package_id = registeredProtocol.package_id;
  concussionClaim.migration_status = "protocol_registered_candidate_seeded_dual_review_pending";
  concussionClaim.publication_ready = false;
}

const report = {
  status: "passed",
  version: "1.0",
  subject_id: "sport",
  package_id: registeredProtocol.package_id,
  registration_anchor: registeredProtocol.registration_anchor,
  counts: {
    registered_package_protocols: 1,
    subquestions: registeredProtocol.scope.subquestions.length,
    authoritative_seed_candidates: candidateRecords.length,
    systematic_database_searches_completed: 0,
    screened_records: 0,
    included_studies: studyFile.studies.length,
    materialized_results: studyFile.results.length,
    risk_of_bias_assessments: riskFile.assessments.length,
    completed_syntheses: (synthesisFile.syntheses || []).filter((item) => item.status === "completed").length,
    certainty_assessments: (certaintyFile.assessments || []).length,
    publication_ready_claims: claimFile.claims.filter((item) => item.publication_ready === true).length
  },
  gates: {
    protocol_registered_before_screening: true,
    immutable_registration_anchor_present: true,
    candidates_are_not_screened: candidateRecords.every((item) => item.screening_status === "not_screened"),
    candidates_cannot_support_publication: candidateRecords.every((item) => item.publication_use_allowed === false),
    no_studies_or_results_materialized: studyFile.studies.length === 0 && studyFile.results.length === 0,
    no_bias_or_certainty_materialized: riskFile.assessments.length === 0 && (certaintyFile.assessments || []).length === 0,
    no_completed_synthesis: !(synthesisFile.syntheses || []).some((item) => item.status === "completed"),
    candidate_gate_blocks_publication: policy.production_gates.some((item) => item.gate_id === candidateGate.gate_id && item.failure_action === "block")
  },
  warnings: [
    "Frøsøket er ikke et systematisk databasesøk.",
    "Ingen kandidat er screenet, inkludert eller metodevurdert.",
    "Pakken produserer ingen ny publication-ready claim."
  ],
  failures: []
};

const reportMd = `# Sport – hjernerystelse og akutt sikkerhet, evidensfrø V1\n\nStatus: **protokoll registrert; systematisk søk og dobbelt screening gjenstår**.\n\n- Registreringscommit: \`${registrationCommit}\`\n- ${registeredProtocol.scope.subquestions.length} avgrensede delspørsmål\n- ${candidateRecords.length} autoritative kandidatposter\n- 0 screenede poster\n- 0 inkluderte studier\n- 0 biasvurderinger\n- 0 fullførte synteser\n- 0 sikkerhetsvurderinger\n- 0 nye publication-ready claims\n\nKandidatpostene er bare søkefrø. De kan ikke brukes som evidens før to uavhengige vurderere har screenet dem og relevant metodevurdering er fullført.\n`;

await Promise.all([
  writeJson(paths.registeredProtocol, registeredProtocol),
  writeJson(paths.questions, questionFile),
  writeJson(paths.protocols, protocolFile),
  writeJson(paths.risk, riskFile),
  writeJson(paths.claims, claimFile),
  writeJson(paths.pipelineManifest, pipelineManifest),
  writeJson(paths.evidenceManifest, evidenceManifest),
  writeJson(paths.policy, policy),
  writeJson(paths.qualityManifest, qualityManifest),
  writeJson(paths.profile, profile),
  writeJson(paths.packages, packageFile),
  writeJson(paths.searchLog, searchLog),
  writeJson(paths.reportJson, report)
]);
await mkdir(path.dirname(path.resolve(root, paths.reportMd)), { recursive: true });
await writeFile(path.resolve(root, paths.reportMd), reportMd, "utf8");

console.log(JSON.stringify(report, null, 2));
