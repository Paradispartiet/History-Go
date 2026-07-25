#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (relativePath) => JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));
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
  pipelineManifest: "data/fag/sport/sport_scientific_pipeline_manifest_v2.json",
  evidenceManifest: "data/fag/sport/sport_scientific_evidence_manifest_v1.json",
  methodPolicy: "data/fag/sport/sport_scientific_method_policy_v1.json",
  qualityManifest: "data/fag/sport/sport_quality_manifest_v5.json",
  quizProfile: "data/fag/sport/supersetQUIZMAL_sport.json",
  report: "reports/sport-scientific-pipeline-v2-validation.json"
};

const [hookFile, unitFile, claimFile, classificationFile, questionFile, protocolFile, studyFile, biasFile, synthesisFile, certaintyFile, pipelineManifest, evidenceManifest, methodPolicy, qualityManifest, quizProfile] = await Promise.all([
  readJson(paths.hooks), readJson(paths.units), readJson(paths.claims), readJson(paths.classification), readJson(paths.questions),
  readJson(paths.protocols), readJson(paths.studies), readJson(paths.bias), readJson(paths.syntheses), readJson(paths.certainty),
  readJson(paths.pipelineManifest), readJson(paths.evidenceManifest), readJson(paths.methodPolicy), readJson(paths.qualityManifest), readJson(paths.quizProfile)
]);

const failures = [];
const require = (condition, message, details = undefined) => {
  if (!condition) failures.push(details === undefined ? { message } : { message, details });
};
const hasText = (value, min = 1) => typeof value === "string" && value.trim().length >= min;
const uniqueIds = (items, key, label) => {
  const ids = items.map((item) => item?.[key]);
  require(ids.every((id) => hasText(id)), `${label}: mangler gyldig ${key}`);
  require(new Set(ids).size === ids.length, `${label}: dupliserte ${key}`);
  return new Set(ids);
};
const refs = (items, key, known, label, idKey) => {
  for (const item of items) {
    const raw = item?.[key];
    const values = raw == null ? [] : (Array.isArray(raw) ? raw : [raw]);
    for (const value of values) require(known.has(value), `${label}: ukjent ${key}`, { item: item[idKey], value });
  }
};

const hooks = hookFile.hooks || [];
const units = unitFile.theory_units || [];
const claims = claimFile.claims || [];
const tracks = classificationFile.tracks || [];
const classifications = classificationFile.classifications || [];
const questions = questionFile.research_questions || [];
const protocols = protocolFile.protocols || [];
const studies = studyFile.studies || [];
const results = studyFile.results || [];
const tools = biasFile.tools || [];
const biasAssessments = biasFile.assessments || [];
const syntheses = synthesisFile.syntheses || [];
const frameworks = certaintyFile.frameworks || [];
const certaintyAssessments = certaintyFile.assessments || [];

const hookIds = uniqueIds(hooks, "hook_id", "hooks");
const unitIds = uniqueIds(units, "theory_unit_id", "teorienheter");
const claimIds = uniqueIds(claims, "claim_id", "claims");
const trackIds = uniqueIds(tracks, "track_id", "vitenskapelige spor");
const classificationIds = uniqueIds(classifications, "classification_id", "hookklassifiseringer");
const questionIds = uniqueIds(questions, "research_question_id", "forskningsspørsmål");
const protocolIds = uniqueIds(protocols, "protocol_id", "protokoller");
const studyIds = uniqueIds(studies, "study_id", "studier");
const resultIds = uniqueIds(results, "result_id", "resultater");
const toolIds = uniqueIds(tools, "tool_id", "biasverktøy");
const biasIds = uniqueIds(biasAssessments, "assessment_id", "biasvurderinger");
const synthesisIds = uniqueIds(syntheses, "synthesis_id", "synteser");
const frameworkIds = uniqueIds(frameworks, "framework_id", "sikkerhetsrammeverk");
const certaintyIds = uniqueIds(certaintyAssessments, "certainty_assessment_id", "sikkerhetsvurderinger");

require(hooks.length === 56, "forventet 56 Sport-hooks", hooks.length);
require(units.length === hooks.length, "teorienheter og hooks har ulikt antall", { hooks: hooks.length, units: units.length });
require(classifications.length === hooks.length, "ikke alle hooks er klassifisert", { hooks: hooks.length, classifications: classifications.length });
require(questions.length === hooks.length, "ikke ett forskningsspørsmål per hook", { hooks: hooks.length, questions: questions.length });
require(protocols.length === hooks.length, "ikke én protokoll per hook", { hooks: hooks.length, protocols: protocols.length });
require(syntheses.length === hooks.length, "ikke én synteseplan per hook", { hooks: hooks.length, syntheses: syntheses.length });
require(tracks.length >= 12, "for få vitenskapelige spørsmålsspor", tracks.length);
require(tools.length >= 15, "for få resultatspesifikke vurderingsverktøy", tools.length);

refs(classifications, "hook_id", hookIds, "klassifisering", "classification_id");
refs(classifications, "theory_unit_id", unitIds, "klassifisering", "classification_id");
refs(classifications, "epistemic_track", trackIds, "klassifisering", "classification_id");
refs(classifications, "appraisal_tool_ids", toolIds, "klassifisering", "classification_id");
refs(questions, "classification_id", classificationIds, "forskningsspørsmål", "research_question_id");
refs(questions, "hook_id", hookIds, "forskningsspørsmål", "research_question_id");
refs(questions, "theory_unit_id", unitIds, "forskningsspørsmål", "research_question_id");
refs(protocols, "research_question_id", questionIds, "protokoll", "protocol_id");
refs(protocols, "classification_id", classificationIds, "protokoll", "protocol_id");
refs(protocols, "hook_id", hookIds, "protokoll", "protocol_id");
refs(protocols, "appraisal_tool_ids", toolIds, "protokoll", "protocol_id");
refs(syntheses, "research_question_id", questionIds, "syntese", "synthesis_id");
refs(syntheses, "protocol_id", protocolIds, "syntese", "synthesis_id");
refs(syntheses, "classification_id", classificationIds, "syntese", "synthesis_id");
refs(syntheses, "hook_id", hookIds, "syntese", "synthesis_id");
refs(syntheses, "included_study_ids", studyIds, "syntese", "synthesis_id");
refs(syntheses, "result_ids", resultIds, "syntese", "synthesis_id");
refs(syntheses, "risk_of_bias_assessment_ids", biasIds, "syntese", "synthesis_id");
refs(syntheses, "certainty_assessment_ids", certaintyIds, "syntese", "synthesis_id");
refs(syntheses, "approved_claim_ids", claimIds, "syntese", "synthesis_id");
refs(certaintyAssessments, "synthesis_id", synthesisIds, "sikkerhetsvurdering", "certainty_assessment_id");
refs(certaintyAssessments, "framework_id", frameworkIds, "sikkerhetsvurdering", "certainty_assessment_id");

const classificationByHook = new Map(classifications.map((item) => [item.hook_id, item]));
const questionByHook = new Map(questions.map((item) => [item.hook_id, item]));
const protocolByQuestion = new Map(protocols.map((item) => [item.research_question_id, item]));
const synthesisByQuestion = new Map(syntheses.map((item) => [item.research_question_id, item]));

for (const hook of hooks) {
  const classification = classificationByHook.get(hook.hook_id);
  const question = questionByHook.get(hook.hook_id);
  require(Boolean(classification), "hook mangler klassifisering", hook.hook_id);
  require(Boolean(question), "hook mangler forskningsspørsmål", hook.hook_id);
  if (!classification || !question) continue;
  const protocol = protocolByQuestion.get(question.research_question_id);
  const synthesis = synthesisByQuestion.get(question.research_question_id);
  require(Boolean(protocol), "forskningsspørsmål mangler protokoll", question.research_question_id);
  require(Boolean(synthesis), "forskningsspørsmål mangler synteseplan", question.research_question_id);
  require(classification.publication_status === "blocked_until_completed_synthesis", "klassifisering publiseres før syntese", classification.classification_id);
  require(question.status === "planned_not_answered", "planlagt spørsmål fremstilles som besvart", question.research_question_id);
  require(question.publication_status === "blocked", "forskningsspørsmål mangler blokkering", question.research_question_id);
}

for (const track of tracks) {
  require(hasText(track.label, 10), "vitenskapelig spor mangler etikett", track.track_id);
  require(hasText(track.question_framework, 8), "vitenskapelig spor mangler spørsmålsramme", track.track_id);
  require(hasText(track.review_type, 8), "vitenskapelig spor mangler review-type", track.track_id);
  require((track.eligible_designs || []).length >= 4, "vitenskapelig spor har for få tillatte design", track.track_id);
  require((track.appraisal_tool_ids || []).length >= 1, "vitenskapelig spor mangler vurderingsverktøy", track.track_id);
  require((track.search_sources || []).length >= 3, "vitenskapelig spor mangler søkekilder", track.track_id);
  require((track.default_outcomes || []).length >= 4, "vitenskapelig spor mangler utfall", track.track_id);
}

for (const classification of classifications) {
  require(classification.classification_status === "canonical_pipeline_v2", "klassifisering har feil status", classification.classification_id);
  require(["legacy_claims_require_pipeline_migration", "evidence_gap"].includes(classification.evidence_readiness), "klassifisering har ugyldig evidensstatus", classification.classification_id);
  require((classification.eligible_designs || []).length >= 4, "klassifisering mangler studiedesign", classification.classification_id);
}

for (const question of questions) {
  require(hasText(question.question_text, 30), "forskningsspørsmål er for svakt", question.research_question_id);
  require(hasText(question.population_or_unit, 20), "forskningsspørsmål mangler analyseenhet", question.research_question_id);
  require(hasText(question.focal_exposure_intervention_or_argument, 8), "forskningsspørsmål mangler hovedfokus", question.research_question_id);
  require(hasText(question.comparison_or_alternative, 8), "forskningsspørsmål mangler alternativ", question.research_question_id);
  require((question.outcomes || []).length >= 4, "forskningsspørsmål mangler utfall eller konklusjonsmål", question.research_question_id);
  require((question.eligible_designs || []).length >= 4, "forskningsspørsmål mangler design", question.research_question_id);
  require(question.protocol_required === true, "forskningsspørsmål tillater arbeid uten protokoll", question.research_question_id);
}

for (const protocol of protocols) {
  require(protocol.status === "planned_not_registered", "protokoll fremstilles som registrert", protocol.protocol_id);
  require(protocol.registration?.required_before_screening === true, "protokoll krever ikke registrering før screening", protocol.protocol_id);
  require(protocol.registration?.registration_id === null, "uregistrert protokoll har registrerings-ID", protocol.protocol_id);
  require(protocol.search_plan?.search_status === "not_run", "søket fremstilles som gjennomført", protocol.protocol_id);
  require((protocol.search_plan?.full_search_strings || []).length === 0, "planlagt protokoll har udokumentert søkestreng", protocol.protocol_id);
  require(protocol.screening?.independent_reviewers === 2, "protokoll mangler to screenere", protocol.protocol_id);
  require(protocol.screening?.title_abstract_dual_screening === true, "protokoll mangler dobbel førstescreening", protocol.protocol_id);
  require(protocol.screening?.full_text_dual_screening === true, "protokoll mangler dobbel fulltekstscreening", protocol.protocol_id);
  require(protocol.screening?.exclusion_reason_required === true, "protokoll krever ikke eksklusjonsgrunn", protocol.protocol_id);
  require(protocol.screening?.adjudication_required === true, "protokoll mangler avgjørelse ved uenighet", protocol.protocol_id);
  require(protocol.extraction?.independent_reviewers === 2, "protokoll mangler to datauttrekkere", protocol.protocol_id);
  require(protocol.extraction?.critical_fields_dual_extraction === true, "kritiske felt dobbeltuttrekkes ikke", protocol.protocol_id);
  require((protocol.appraisal_tool_ids || []).length >= 1, "protokoll mangler biasverktøy", protocol.protocol_id);
  require(protocol.synthesis_plan?.outcome_specific === true, "synteseplan er ikke utfallsspesifikk", protocol.protocol_id);
  require(protocol.synthesis_plan?.conflicting_evidence_required === true, "synteseplan kan skjule motstridende evidens", protocol.protocol_id);
  require(protocol.synthesis_plan?.null_findings_required === true, "synteseplan kan utelate nullfunn", protocol.protocol_id);
  require(protocol.publication_status.includes("blocked"), "protokoll mangler publiseringsblokk", protocol.protocol_id);
}

require(studyFile.status === "schema_ready_no_studies_materialized", "studieregisteret overdriver materialisering");
require(studies.length === 0, "studier ble materialisert uten reviewarbeid", studies.length);
require(results.length === 0, "resultater ble materialisert uten reviewarbeid", results.length);
require((studyFile.required_study_fields || []).length >= 10, "studieregisteret har for få obligatoriske studiefelt");
require((studyFile.required_result_fields || []).length >= 10, "studieregisteret har for få obligatoriske resultatfelt");

for (const tool of tools) {
  require((tool.domains || []).length >= 5, "biasverktøy har for få domener", tool.tool_id);
  require(tool.result_level_required === true, "biasverktøy er ikke resultatspesifikt", tool.tool_id);
  require(tool.independent_reviewers_required === 2, "biasverktøy mangler to vurderere", tool.tool_id);
  require(tool.adjudication_required_on_disagreement === true, "biasverktøy mangler avgjørelse ved uenighet", tool.tool_id);
}
require(biasFile.principles?.result_specific === true, "biasregisteret er ikke resultatspesifikt");
require(biasFile.principles?.independent_reviewers_required === 2, "biasregisteret mangler to vurderere");
require(biasAssessments.length === 0, "biasvurderinger ble opprettet uten studieresultater", biasAssessments.length);

for (const synthesis of syntheses) {
  require(synthesis.status === "not_started", "syntese fremstilles som gjennomført", synthesis.synthesis_id);
  require(synthesis.last_search_date === null, "syntese har udokumentert søkedato", synthesis.synthesis_id);
  require((synthesis.included_study_ids || []).length === 0, "syntese har udokumenterte studier", synthesis.synthesis_id);
  require((synthesis.result_ids || []).length === 0, "syntese har udokumenterte resultater", synthesis.synthesis_id);
  require((synthesis.risk_of_bias_assessment_ids || []).length === 0, "syntese har udokumenterte biasvurderinger", synthesis.synthesis_id);
  require((synthesis.certainty_assessment_ids || []).length === 0, "syntese har udokumenterte sikkerhetsvurderinger", synthesis.synthesis_id);
  require((synthesis.approved_claim_ids || []).length === 0, "syntese godkjenner claims før ferdigstillelse", synthesis.synthesis_id);
  require(synthesis.conclusion === null, "syntese har konklusjon før review", synthesis.synthesis_id);
  require(synthesis.publication_status === "blocked", "syntese mangler publiseringsblokk", synthesis.synthesis_id);
}

for (const framework of frameworks) {
  require(framework.outcome_or_conclusion_specific === true, "sikkerhetsrammeverk er ikke utfallsspesifikt", framework.framework_id);
  require(framework.independent_reviewers_required === 2, "sikkerhetsrammeverk mangler to vurderere", framework.framework_id);
  require(framework.adjudication_required === true, "sikkerhetsrammeverk mangler avgjørelse ved uenighet", framework.framework_id);
  require((framework.required_domains || []).length >= 5, "sikkerhetsrammeverk mangler domener", framework.framework_id);
}
require(certaintyAssessments.length === 0, "sikkerhetsvurderinger ble opprettet uten synteser", certaintyAssessments.length);

for (const claim of claims) {
  require(claim.pipeline_v2?.status === "provisional_legacy_claim", "eksisterende claim er ikke provisorisk", claim.claim_id);
  require(claim.pipeline_v2?.publication_ready === false, "legacy-claim er feilaktig publication-ready", claim.claim_id);
  require((claim.pipeline_v2?.research_question_ids || []).length === 0, "legacy-claim har udokumentert forskningsspørsmål", claim.claim_id);
  require((claim.pipeline_v2?.synthesis_ids || []).length === 0, "legacy-claim har udokumentert syntese", claim.claim_id);
  require((claim.pipeline_v2?.certainty_assessment_ids || []).length === 0, "legacy-claim har udokumentert sikkerhetsvurdering", claim.claim_id);
}

const requiredGates = [
  "gate_sport_research_question_chain",
  "gate_sport_protocol_preregistration",
  "gate_sport_dual_review",
  "gate_sport_result_level_bias",
  "gate_sport_synthesis_before_claim",
  "gate_sport_certainty_before_publication",
  "gate_sport_living_update"
];
for (const gateId of requiredGates) {
  const gate = (methodPolicy.production_gates || []).find((item) => item.gate_id === gateId);
  require(gate?.failure_action === "block", "mangler blokkerende V2-port", gateId);
}
require(methodPolicy.version === "2.0", "metodepolicy er ikke V2");
require(methodPolicy.pipeline_v2?.publication_ready_requires_all_links === true, "policy krever ikke full kjede");
for (const field of ["research_question_id", "synthesis_id", "certainty_assessment_id"]) {
  require(methodPolicy.required_scientific_metadata?.includes(field), "policy mangler V2-metadata", field);
  require(quizProfile.scientific_evidence_metadata?.required_fields?.includes(field), "quizprofil mangler V2-metadata", field);
}
require(quizProfile.scientific_pipeline_v2?.publication_ready_requires_complete_chain === true, "quizprofil krever ikke full kjede");
require(quizProfile.scientific_pipeline_v2?.legacy_claims_are_provisional === true, "quizprofil overdriver legacy-claims");
require(qualityManifest.scientific_pipeline_v2?.manifest === "sport_scientific_pipeline_manifest_v2.json", "kvalitetsmanifest mangler V2-pipeline");
require(evidenceManifest.status === "scientific_pipeline_infrastructure_ready_partial_evidence", "evidensmanifestet overdriver status");
require(evidenceManifest.coverage_status?.completed_syntheses === 0, "evidensmanifestet hevder fullførte synteser");
require(evidenceManifest.coverage_status?.publication_ready_claims === 0, "evidensmanifestet hevder publication-ready claims");

const expectedBenchmarks = {
  hook_sport_indre_goder_praksis: "normative_conceptual",
  hook_sport_sportivisering_standardisering: "historical_historiographic",
  hook_sport_anlegg_byutvikling: "spatial_mixed_methods",
  hook_sport_press_kompakthet: "tactical_performance",
  hook_sport_begrensningsstyrt_laring: "skill_acquisition",
  hook_sport_belastning_tilpasning: "training_physiology",
  hook_sport_prestasjonsdata_validitet: "measurement_properties",
  hook_sport_skade_risiko_epidemiologi: "risk_epidemiology",
  hook_sport_motivasjon_selvbestemmelse: "psychology_behaviour",
  hook_sport_tidlig_spesialisering_frafall: "developmental_pedagogy",
  hook_sport_safeguarding_barnets_rettigheter: "safeguarding_policy",
  hook_sport_konkurransebalanse_finans: "organisation_economics",
  hook_sport_medialisering_kommersialisering: "culture_media",
  hook_sport_paraidrett_tilgjengelighet: "inequality_access",
  hook_sport_doping_enhancement: "ethics_regulation_technology",
  hook_sport_natur_klima_baerekraft: "public_health_environment"
};
for (const [hookId, trackId] of Object.entries(expectedBenchmarks)) {
  require(classificationByHook.get(hookId)?.epistemic_track === trackId, "faglig benchmark har feil spørsmålsspor", { hookId, expected: trackId, actual: classificationByHook.get(hookId)?.epistemic_track });
}

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
for (const [key, value] of Object.entries(counts)) require(pipelineManifest.counts?.[key] === value, "pipeline-manifest har feil opptelling", { key, expected: value, actual: pipelineManifest.counts?.[key] });

const report = {
  status: failures.length ? "failed" : "passed",
  version: "2.0",
  subject_id: "sport",
  counts,
  gates: {
    all_hooks_classified: classifications.length === hooks.length,
    one_question_protocol_and_synthesis_per_hook: questions.length === hooks.length && protocols.length === hooks.length && syntheses.length === hooks.length,
    epistemic_benchmarks_pass: Object.entries(expectedBenchmarks).every(([hookId, trackId]) => classificationByHook.get(hookId)?.epistemic_track === trackId),
    protocols_require_registration_and_dual_review: protocols.every((item) => item.registration?.required_before_screening && item.screening?.independent_reviewers === 2 && item.extraction?.independent_reviewers === 2),
    result_level_bias_required: tools.every((item) => item.result_level_required && item.independent_reviewers_required === 2),
    no_unreviewed_evidence_materialized: studies.length === 0 && results.length === 0 && biasAssessments.length === 0 && certaintyAssessments.length === 0,
    no_synthesis_claims_prematurely_approved: syntheses.every((item) => item.status === "not_started" && item.approved_claim_ids?.length === 0),
    all_legacy_claims_provisional: claims.every((item) => item.pipeline_v2?.status === "provisional_legacy_claim" && item.pipeline_v2?.publication_ready === false),
    publication_chain_enforced: requiredGates.every((gateId) => methodPolicy.production_gates?.some((item) => item.gate_id === gateId && item.failure_action === "block")),
    all_references_resolve: !failures.some((failure) => failure.message?.includes("ukjent"))
  },
  failures
};

if (process.argv.includes("--write")) {
  await mkdir(path.dirname(path.resolve(root, paths.report)), { recursive: true });
  await writeFile(path.resolve(root, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
