#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sportDir = "data/fag/sport";
const amendmentCommit = "3605f292cb1bb290c09acf99af394007e7690efa";
const amendmentPath = `${sportDir}/protocols/concussion_search_strategy_amendment_001.json`;
const paths = {
  amendment: amendmentPath,
  searchLog: `${sportDir}/concussion_search_log_sport_v1.json`,
  packages: `${sportDir}/evidence_packages_sport_v1.json`,
  pipeline: `${sportDir}/sport_scientific_pipeline_manifest_v2.json`,
  evidence: `${sportDir}/sport_scientific_evidence_manifest_v1.json`,
  policy: `${sportDir}/sport_scientific_method_policy_v1.json`,
  quality: `${sportDir}/sport_quality_manifest_v5.json`,
  profile: `${sportDir}/supersetQUIZMAL_sport.json`,
  studies: `${sportDir}/study_registry_sport_v1.json`,
  risk: `${sportDir}/risk_of_bias_sport_v1.json`,
  syntheses: `${sportDir}/evidence_syntheses_sport_v1.json`,
  certainty: `${sportDir}/certainty_assessments_sport_v1.json`,
  claims: `${sportDir}/claims_sport_canonical_v1.json`,
  strategyRegistry: `${sportDir}/concussion_search_strategy_sport_v2.json`,
  runRegistry: `${sportDir}/concussion_search_runs_sport_v1.json`,
  dedupProtocol: `${sportDir}/concussion_deduplication_protocol_sport_v1.json`,
  screeningSchema: `${sportDir}/concussion_screening_schema_sport_v1.json`,
  reviewerRoles: `${sportDir}/concussion_reviewer_roles_sport_v1.json`,
  reportJson: "reports/sport-concussion-search-readiness-v2-validation.json",
  reportMd: "reports/sport-concussion-search-readiness-v2.md"
};

const readJson = async (relativePath) => JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));
const writeJson = async (relativePath, value) => {
  await mkdir(path.dirname(path.resolve(root, relativePath)), { recursive: true });
  await writeFile(path.resolve(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");
const unique = (values) => [...new Set(values.filter(Boolean))];
const upsert = (items, key, item) => {
  const index = items.findIndex((entry) => entry?.[key] === item[key]);
  if (index >= 0) items[index] = item;
  else items.push(item);
};
const queryText = (strategy) => Array.isArray(strategy.lines) ? strategy.lines.join("\n") : strategy.query;

const [
  amendment,
  searchLog,
  packageFile,
  pipeline,
  evidence,
  policy,
  quality,
  profile,
  studyFile,
  riskFile,
  synthesisFile,
  certaintyFile,
  claimFile
] = await Promise.all([
  readJson(paths.amendment),
  readJson(paths.searchLog),
  readJson(paths.packages),
  readJson(paths.pipeline),
  readJson(paths.evidence),
  readJson(paths.policy),
  readJson(paths.quality),
  readJson(paths.profile),
  readJson(paths.studies),
  readJson(paths.risk),
  readJson(paths.syntheses),
  readJson(paths.certainty),
  readJson(paths.claims)
]);

if (amendment.status !== "locked_before_search_execution_peer_review_pending") {
  throw new Error("Søkestrategitillegget er ikke låst før kjøring");
}
if (amendment.database_strategies?.length !== 6) {
  throw new Error(`Forventet seks databasestrategier, fant ${amendment.database_strategies?.length ?? 0}`);
}
if (amendment.timing?.database_searches_completed !== 0 || amendment.timing?.records_screened !== 0) {
  throw new Error("Tillegget er ikke registrert før søk og screening");
}

const amendmentAnchor = {
  repository: "Paradispartiet/History-Go",
  commit_sha: amendmentCommit,
  path: amendmentPath,
  immutable_snapshot: true
};

const strategies = amendment.database_strategies.map((strategy) => ({
  ...strategy,
  query_sha256: sha256(queryText(strategy)),
  registered_amendment_id: amendment.amendment_id,
  registered_amendment_anchor: amendmentAnchor,
  execution_allowed: false,
  execution_block_reason: "PRESS-style peer review and named executor assignment are pending"
}));

const strategyRegistry = {
  version: "2.0",
  subject_id: "sport",
  package_id: amendment.package_id,
  type: "locked_database_search_strategy_registry",
  status: "six_strategies_locked_peer_review_and_execution_pending",
  updated_at: "2026-07-25",
  parent_protocol_anchor: amendment.parent_protocol_anchor,
  amendment_anchor: amendmentAnchor,
  scope: amendment.search_scope,
  concept_blocks: amendment.concept_blocks,
  database_strategies: strategies,
  search_peer_review: amendment.search_peer_review,
  execution_rule: amendment.execution_rule,
  publication_rule: amendment.publication_rule
};

const searchRuns = strategies.map((strategy) => ({
  search_run_id: `search_run_sport_concussion_${strategy.database_id}_v1`,
  package_id: amendment.package_id,
  database_id: strategy.database_id,
  database_name: strategy.database_name,
  platform: strategy.platform,
  strategy_version: strategy.strategy_version,
  query_sha256: strategy.query_sha256,
  strategy_registry_path: paths.strategyRegistry,
  status: "blocked_pending_PRESS_peer_review_and_database_access",
  peer_review_status: "pending",
  peer_review_decision_id: null,
  executor_role_id: "reviewer_role_sport_information_specialist_1",
  assigned_executor_person_id: null,
  executed_at: null,
  platform_session_or_saved_search_id: null,
  result_count: null,
  export: {
    status: "not_created",
    file_path: null,
    format: null,
    record_count: null,
    sha256: null,
    exported_at: null
  },
  deviations: [],
  notes: []
}));

const runRegistry = {
  version: "1.0",
  subject_id: "sport",
  package_id: amendment.package_id,
  type: "database_search_run_registry",
  status: "all_runs_blocked_pending_peer_review_assignment_and_execution",
  updated_at: "2026-07-25",
  amendment_anchor: amendmentAnchor,
  required_run_count: 6,
  completed_run_count: 0,
  runs: searchRuns,
  execution_invariants: [
    "En run kan ikke endres til completed uten dato, navngitt menneskelig utfører, treffantall og eksportfil med SHA-256.",
    "Den kjørte søketeksten skal ha samme query_sha256 som den låste strategien eller dokumenteres som et forhåndsgodkjent amendment.",
    "Database- og plattformversjon, filtre og alle avvik skal registreres.",
    "Et søketreff er en kandidatpost, ikke evidens."
  ]
};

const reviewerRoles = {
  version: "1.0",
  subject_id: "sport",
  package_id: amendment.package_id,
  type: "reviewer_role_and_independence_registry",
  status: "roles_defined_human_assignments_pending",
  updated_at: "2026-07-25",
  roles: [
    {
      role_id: "reviewer_role_sport_information_specialist_1",
      role: "search author and database executor",
      assigned_person_id: null,
      human_required: true,
      ai_may_assist: true,
      responsibilities: ["database translation", "search execution", "export and checksum", "search deviation log"]
    },
    {
      role_id: "reviewer_role_sport_information_specialist_2",
      role: "independent PRESS-style search peer reviewer",
      assigned_person_id: null,
      human_required: true,
      ai_may_assist: true,
      responsibilities: ["independent search review", "syntax and subject-heading check", "approve or request amendment"]
    },
    {
      role_id: "reviewer_role_sport_screening_1",
      role: "independent screening reviewer 1",
      assigned_person_id: null,
      human_required: true,
      ai_may_assist: true,
      responsibilities: ["title and abstract screening", "full-text screening", "critical data extraction"]
    },
    {
      role_id: "reviewer_role_sport_screening_2",
      role: "independent screening reviewer 2",
      assigned_person_id: null,
      human_required: true,
      ai_may_assist: true,
      responsibilities: ["title and abstract screening", "full-text screening", "critical data extraction"]
    },
    {
      role_id: "reviewer_role_sport_adjudicator",
      role: "conflict adjudicator",
      assigned_person_id: null,
      human_required: true,
      ai_may_assist: true,
      responsibilities: ["resolve documented conflicts", "record reason and final decision"]
    }
  ],
  independence_rules: [
    "PRESS reviewer and search author must be different people.",
    "Screening reviewer 1 and screening reviewer 2 must be different people.",
    "Review decisions are hidden from the other screener until both initial decisions are submitted.",
    "AI cannot occupy a reviewer or adjudicator role and cannot be the sole basis for a decision.",
    "Conflicts require a documented consensus or adjudicator decision."
  ],
  assignment_gate: {
    status: "blocked",
    required_before_search_execution: [
      "reviewer_role_sport_information_specialist_1",
      "reviewer_role_sport_information_specialist_2"
    ],
    required_before_screening: [
      "reviewer_role_sport_screening_1",
      "reviewer_role_sport_screening_2",
      "reviewer_role_sport_adjudicator"
    ]
  }
};

const dedupProtocol = {
  version: "1.0",
  subject_id: "sport",
  package_id: amendment.package_id,
  type: "deterministic_deduplication_protocol",
  status: "protocol_locked_execution_pending",
  updated_at: "2026-07-25",
  input_requirements: [
    "Alle rå databaseeksporter bevares uendret med filsti, format, record_count og SHA-256.",
    "Hver importert post beholder database, run_id og original record identifier.",
    "Ingen post slettes fysisk under deduplisering."
  ],
  normalization: {
    "doi": "lowercase; remove https://doi.org/, doi: and surrounding whitespace",
    "pmid": "digits only",
    "trial_registration": "uppercase registry prefix and normalized identifier",
    "title": "Unicode NFKD; lowercase; remove punctuation; collapse whitespace; preserve meaningful numbers",
    "first_author": "lowercase family name without punctuation",
    "year": "four-digit publication year; online-first and print year retained separately"
  },
  automatic_duplicate_rules_in_order: [
    {
      rule_id: "dedup_exact_doi",
      condition: "same normalized non-empty DOI",
      action: "merge_into_cluster"
    },
    {
      rule_id: "dedup_exact_pmid",
      condition: "same non-empty PMID",
      action: "merge_into_cluster"
    },
    {
      rule_id: "dedup_exact_trial_registration",
      condition: "same non-empty trial registration identifier",
      action: "merge_into_cluster"
    },
    {
      rule_id: "dedup_exact_title_author_year",
      condition: "same normalized title, same normalized first author and same publication year",
      action: "merge_into_cluster"
    }
  ],
  possible_duplicate_rule: {
    condition: "normalized title similarity >= 0.95 with same first author and year difference <= 1, or conflicting identifiers on otherwise matching records",
    action: "manual_dual_review_required",
    automatic_merge_forbidden: true
  },
  preferred_record_rule: [
    "record with DOI or PMID",
    "record with complete abstract",
    "record with most complete bibliographic metadata",
    "record from the database with the richest indexing",
    "stable deterministic tie-break by source priority and original record identifier"
  ],
  audit_output: {
    cluster_registry_required: true,
    source_record_ids_required: true,
    chosen_primary_record_required: true,
    merge_rule_id_required: true,
    manual_decision_required_for_possible_duplicates: true,
    before_count_required: true,
    after_count_required: true,
    output_sha256_required: true
  },
  execution: {
    status: "not_run",
    before_count: null,
    after_count: null,
    duplicate_clusters: null,
    output_file: null,
    output_sha256: null
  }
};

const exclusionReasons = [
  { code: "wrong_population", label: "Feil populasjon" },
  { code: "wrong_condition", label: "Ikke sportsrelatert hjernerystelse eller tilstanden kan ikke skilles ut" },
  { code: "wrong_setting", label: "Feil idretts- eller aktivitetskontekst" },
  { code: "wrong_intervention_or_exposure", label: "Feil tiltak, eksponering eller respons" },
  { code: "wrong_comparator", label: "Feil sammenligningsgrunnlag når komparator kreves" },
  { code: "wrong_outcome", label: "Ingen protokollrelevante utfall" },
  { code: "wrong_design", label: "Studiedesign utenfor protokollen" },
  { code: "not_systematic_or_original_evidence", label: "Kommentar, ekspertmening eller ikke-systematisk tekst uten tillatt rolle" },
  { code: "animal_or_in_vitro", label: "Dyre- eller laboratoriestudie uten mennesker" },
  { code: "duplicate", label: "Duplikat av annen inkludert kandidatpost" },
  { code: "outside_date_range", label: "Publisert utenfor forhåndsdefinert tidsrom" },
  { code: "retracted", label: "Tilbaketrukket publikasjon" },
  { code: "full_text_unavailable", label: "Fulltekst utilgjengelig etter dokumenterte forsøk" },
  { code: "language_translation_unresolved", label: "Fulltekst kunne ikke vurderes etter dokumentert oversettelsesforsøk" }
];

const screeningSchema = {
  version: "1.0",
  subject_id: "sport",
  package_id: amendment.package_id,
  type: "dual_screening_and_full_text_decision_schema",
  status: "schema_locked_assignments_and_screening_pending",
  updated_at: "2026-07-25",
  reviewer_role_registry: paths.reviewerRoles,
  stages: {
    title_abstract: {
      decisions: ["include", "exclude", "uncertain"],
      independent_reviewers_required: 2,
      blinded_until_both_submitted: true,
      exclusion_reason_required_when_exclude: true,
      note_required_when_uncertain: true
    },
    full_text: {
      decisions: ["include", "exclude"],
      independent_reviewers_required: 2,
      blinded_until_both_submitted: true,
      exclusion_reason_required_when_exclude: true,
      one_primary_exclusion_reason: true,
      secondary_reasons_allowed: true,
      page_or_section_locator_required: true
    }
  },
  exclusion_reasons: exclusionReasons,
  decision_record_schema: {
    required_fields: [
      "candidate_id",
      "stage",
      "reviewer_role_id",
      "reviewer_person_id",
      "decision",
      "decided_at",
      "protocol_version",
      "conflict_of_interest_declaration"
    ],
    conditional_fields: {
      exclude: ["exclusion_reason_code", "supporting_note"],
      uncertain: ["supporting_note"],
      full_text: ["full_text_file_sha256", "page_or_section_locator"]
    }
  },
  conflict_resolution: {
    conflict_created_when_decisions_differ: true,
    consensus_attempt_required: true,
    adjudicator_required_if_unresolved: true,
    final_reason_required: true,
    initial_decisions_preserved: true
  },
  execution: {
    status: "not_started",
    assigned_human_reviewers: 0,
    title_abstract_decisions: 0,
    full_text_decisions: 0,
    conflicts: 0,
    adjudications: 0
  },
  safety_boundary: "Screening avgjør dokumenters inklusjon i en forskningsoversikt. Det er ikke klinisk vurdering av en person og kan ikke brukes til diagnose eller returavgjørelse."
};

searchLog.version = "2.0";
searchLog.status = "search_strategy_locked_peer_review_assignment_and_execution_pending";
searchLog.updated_at = "2026-07-25";
searchLog.search_strategy_registry = paths.strategyRegistry;
searchLog.search_run_registry = paths.runRegistry;
searchLog.deduplication_protocol = paths.dedupProtocol;
searchLog.screening_schema = paths.screeningSchema;
searchLog.reviewer_role_registry = paths.reviewerRoles;
searchLog.search_amendment_anchor = amendmentAnchor;
searchLog.database_searches = searchRuns.map((run) => {
  const strategy = strategies.find((item) => item.database_id === run.database_id);
  return {
    database_id: run.database_id,
    database: run.database_name,
    platform: run.platform,
    status: "not_run",
    peer_review_status: "pending",
    query_sha256: run.query_sha256,
    exact_search_string: queryText(strategy),
    interface_filters: strategy.interface_filters,
    executed_at: null,
    result_count: null,
    export_file: null,
    export_sha256: null
  };
});
searchLog.deduplication = {
  status: "not_run",
  protocol_path: paths.dedupProtocol,
  before_count: null,
  after_count: null,
  output_sha256: null
};
searchLog.screening = {
  status: "not_started",
  schema_path: paths.screeningSchema,
  reviewer_roles_path: paths.reviewerRoles,
  independent_reviewers_required: 2,
  assigned_human_reviewers: 0,
  conflicts: [],
  adjudications: []
};

const evidencePackage = (packageFile.packages || []).find((item) => item.package_id === amendment.package_id);
if (!evidencePackage) throw new Error("Fant ikke hjernerystelsespakken");
evidencePackage.phase_status = "search_strategy_locked_peer_review_assignment_and_execution_pending";
evidencePackage.search_amendment_anchor = amendmentAnchor;
evidencePackage.search_strategy_registry = paths.strategyRegistry;
evidencePackage.search_run_registry = paths.runRegistry;
evidencePackage.deduplication_protocol = paths.dedupProtocol;
evidencePackage.screening_schema = paths.screeningSchema;
evidencePackage.reviewer_role_registry = paths.reviewerRoles;
evidencePackage.completed_database_searches = 0;
evidencePackage.assigned_human_reviewers = 0;
packageFile.status = "first_priority_package_search_strategy_locked_execution_pending";
packageFile.updated_at = "2026-07-25";

const newGates = [
  {
    gate_id: "gate_sport_search_peer_review",
    rule: "Databasesøk kan ikke kjøres før den låste strategien har dokumentert uavhengig PRESS-style peer review eller et forhåndsgodkjent begrunnet avvik.",
    failure_action: "block"
  },
  {
    gate_id: "gate_sport_search_run_provenance",
    rule: "Et databasesøk kan ikke markeres completed uten navngitt menneskelig utfører, kjøretid, treffantall, eksakt query_sha256 og eksportfil med SHA-256.",
    failure_action: "block"
  },
  {
    gate_id: "gate_sport_deduplication_reproducibility",
    rule: "Screening kan ikke starte før alle råeksporter er bevart, deterministisk deduplisering er kjørt og clusterlogg, før-/etterantall og output-SHA er dokumentert.",
    failure_action: "block"
  },
  {
    gate_id: "gate_sport_independent_screening_assignment",
    rule: "Screening kan ikke starte før to forskjellige menneskelige screenere og en adjudikator er navngitt, og beslutningsskjemaet er låst.",
    failure_action: "block"
  }
];
for (const gate of newGates) upsert(policy.production_gates, "gate_id", gate);
policy.updated_at = "2026-07-25";
policy.search_execution_policy = {
  amendment_path: amendmentPath,
  amendment_anchor: amendmentAnchor,
  strategy_registry: paths.strategyRegistry,
  run_registry: paths.runRegistry,
  deduplication_protocol: paths.dedupProtocol,
  screening_schema: paths.screeningSchema,
  reviewer_role_registry: paths.reviewerRoles,
  search_execution_allowed: false,
  screening_allowed: false,
  next_gate: "independent PRESS review and human role assignment"
};

pipeline.updated_at = "2026-07-25";
pipeline.files.first_priority_search_strategy = "concussion_search_strategy_sport_v2.json";
pipeline.files.first_priority_search_runs = "concussion_search_runs_sport_v1.json";
pipeline.files.first_priority_deduplication_protocol = "concussion_deduplication_protocol_sport_v1.json";
pipeline.files.first_priority_screening_schema = "concussion_screening_schema_sport_v1.json";
pipeline.files.first_priority_reviewer_roles = "concussion_reviewer_roles_sport_v1.json";
pipeline.files.first_priority_search_readiness_validator = "../../../tools/validate-sport-concussion-search-readiness-v2.mjs";
pipeline.counts.locked_database_strategies = 6;
pipeline.counts.completed_database_searches = 0;
pipeline.counts.defined_reviewer_roles = reviewerRoles.roles.length;
pipeline.counts.assigned_human_reviewers = 0;
pipeline.readiness.first_priority_package = "search_strategy_locked_peer_review_assignment_and_execution_pending";
pipeline.readiness.search_strategy = "six_database_translations_locked";
pipeline.readiness.search_peer_review = "pending";
pipeline.readiness.deduplication = "protocol_locked_not_run";
pipeline.readiness.screening = "schema_locked_human_assignments_pending";
pipeline.invariants = unique([
  ...(pipeline.invariants || []),
  "Alle seks databasestrenger er låst og hashfestet før kjøring.",
  "Ingen databasesøk regnes som kjørt uten eksportfil og SHA-256.",
  "Deduplisering bevarer råposter og full clusterproveniens.",
  "Screening krever to forskjellige mennesker; KI kan bare assistere."
]);

evidence.updated_at = "2026-07-25";
evidence.integration.first_priority_search_strategy = "concussion_search_strategy_sport_v2.json";
evidence.integration.first_priority_search_runs = "concussion_search_runs_sport_v1.json";
evidence.integration.first_priority_deduplication_protocol = "concussion_deduplication_protocol_sport_v1.json";
evidence.integration.first_priority_screening_schema = "concussion_screening_schema_sport_v1.json";
evidence.integration.first_priority_reviewer_roles = "concussion_reviewer_roles_sport_v1.json";
evidence.counts.production_gates = policy.production_gates.length;
evidence.counts.locked_database_strategies = 6;
evidence.counts.completed_database_searches = 0;
evidence.counts.assigned_human_reviewers = 0;
evidence.pipeline_status = "first_priority_search_strategy_locked_peer_review_and_execution_pending";
evidence.first_priority_package_status = "search_strategy_locked_peer_review_assignment_and_execution_pending";

quality.scientific_evidence_layer.first_priority_search_strategy = "concussion_search_strategy_sport_v2.json";
quality.scientific_evidence_layer.first_priority_search_runs = "concussion_search_runs_sport_v1.json";
quality.scientific_evidence_layer.first_priority_deduplication_protocol = "concussion_deduplication_protocol_sport_v1.json";
quality.scientific_evidence_layer.first_priority_screening_schema = "concussion_screening_schema_sport_v1.json";
quality.scientific_evidence_layer.first_priority_reviewer_roles = "concussion_reviewer_roles_sport_v1.json";
quality.counts.evidence_gates = policy.production_gates.length;

profile.evidence_layer.first_priority_search_strategy = paths.strategyRegistry;
profile.evidence_layer.first_priority_search_runs = paths.runRegistry;
profile.evidence_layer.first_priority_deduplication_protocol = paths.dedupProtocol;
profile.evidence_layer.first_priority_screening_schema = paths.screeningSchema;
profile.evidence_layer.first_priority_reviewer_roles = paths.reviewerRoles;
profile.category_rules = unique([
  ...(profile.category_rules || []),
  "Et låst søk eller en eksport er proveniens, ikke evidens; screening, biasvurdering, syntese og sikkerhetsvurdering kreves fortsatt."
]);

const noPrematureMaterialization =
  (studyFile.studies || []).length === 0 &&
  (studyFile.results || []).length === 0 &&
  (riskFile.assessments || []).length === 0 &&
  !(synthesisFile.syntheses || []).some((item) => item.status === "completed") &&
  (certaintyFile.assessments || []).length === 0 &&
  !(claimFile.claims || []).some((item) => item.publication_ready === true);

const report = {
  status: noPrematureMaterialization ? "passed" : "failed",
  version: "2.0",
  subject_id: "sport",
  package_id: amendment.package_id,
  counts: {
    locked_database_strategies: strategies.length,
    completed_database_searches: 0,
    search_exports: 0,
    defined_reviewer_roles: reviewerRoles.roles.length,
    assigned_human_reviewers: 0,
    deduplication_runs: 0,
    screening_decisions: 0,
    included_studies: studyFile.studies?.length || 0,
    publication_ready_claims: claimFile.claims?.filter((item) => item.publication_ready === true).length || 0
  },
  gates: {
    amendment_registered_before_execution: amendment.timing.database_searches_completed === 0,
    all_six_strategies_locked_and_hashed: strategies.length === 6 && strategies.every((item) => item.query_sha256 && item.status === "locked_not_run"),
    PRESS_peer_review_required: strategyRegistry.search_peer_review.required_before_execution === true,
    all_runs_blocked_until_review_and_assignment: searchRuns.every((item) => item.status.startsWith("blocked_")),
    export_checksum_required: runRegistry.execution_invariants.some((item) => item.includes("SHA-256")),
    deterministic_deduplication_locked: dedupProtocol.status === "protocol_locked_execution_pending",
    dual_screening_schema_locked: screeningSchema.stages.title_abstract.independent_reviewers_required === 2 && screeningSchema.stages.full_text.independent_reviewers_required === 2,
    human_roles_defined_but_unassigned: reviewerRoles.roles.every((item) => item.human_required === true && item.assigned_person_id === null),
    no_premature_materialization: noPrematureMaterialization
  },
  next_blocking_actions: [
    "Assign two different human information specialists and complete PRESS-style review.",
    "Run each database search and commit immutable exports with counts and SHA-256.",
    "Run deterministic deduplication and assign two human screeners plus adjudicator."
  ],
  failures: noPrematureMaterialization ? [] : [{ message: "Vitenskapelig innhold er materialisert før søk og screening" }]
};

const reportMd = `# Sport – hjernerystelse, søke- og screeningberedskap V2\n\nStatus: **${report.status === "passed" ? "validert" : "feilet"}**.\n\n- 6 komplette databasestrenger er låst og SHA-256-festet\n- 0 databasesøk er kjørt\n- 0 eksporter er opprettet\n- ${reviewerRoles.roles.length} menneskelige roller er definert, men 0 personer er tildelt\n- dedupliseringsprotokoll og dobbelt screeningskjema er låst\n- 0 screeningbeslutninger, studier, synteser eller publiseringsklare claims\n\nNeste port er uavhengig PRESS-style søkegjennomgang og navngitt menneskelig rollefordeling.\n`;

await Promise.all([
  writeJson(paths.strategyRegistry, strategyRegistry),
  writeJson(paths.runRegistry, runRegistry),
  writeJson(paths.reviewerRoles, reviewerRoles),
  writeJson(paths.dedupProtocol, dedupProtocol),
  writeJson(paths.screeningSchema, screeningSchema),
  writeJson(paths.searchLog, searchLog),
  writeJson(paths.packages, packageFile),
  writeJson(paths.policy, policy),
  writeJson(paths.pipeline, pipeline),
  writeJson(paths.evidence, evidence),
  writeJson(paths.quality, quality),
  writeJson(paths.profile, profile),
  writeJson(paths.reportJson, report)
]);
await mkdir(path.dirname(path.resolve(root, paths.reportMd)), { recursive: true });
await writeFile(path.resolve(root, paths.reportMd), reportMd, "utf8");

console.log(JSON.stringify(report, null, 2));
process.exitCode = report.status === "passed" ? 0 : 1;
