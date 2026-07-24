#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readJson = async (relativePath) =>
  JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));

const paths = {
  manifest: "data/fag/sport/sport_scientific_evidence_manifest_v1.json",
  sources: "data/fag/sport/evidence_registry_sport_v1.json",
  claims: "data/fag/sport/claims_sport_canonical_v1.json",
  models: "data/fag/sport/models_sport_canonical_v1.json",
  rubric: "data/fag/sport/source_quality_rubric_sport_v1.json",
  measurements: "data/fag/sport/measurement_registry_sport_v1.json",
  policy: "data/fag/sport/sport_scientific_method_policy_v1.json",
  qualityManifest: "data/fag/sport/sport_quality_manifest_v5.json",
  profile: "data/fag/sport/supersetQUIZMAL_sport.json",
  report: "reports/sport-scientific-evidence-validation.json"
};

const [
  manifest,
  sourceFile,
  claimFile,
  modelFile,
  rubric,
  measurementFile,
  policy,
  qualityManifest,
  profile
] = await Promise.all([
  readJson(paths.manifest),
  readJson(paths.sources),
  readJson(paths.claims),
  readJson(paths.models),
  readJson(paths.rubric),
  readJson(paths.measurements),
  readJson(paths.policy),
  readJson(paths.qualityManifest),
  readJson(paths.profile)
]);

const failures = [];
const require = (condition, message, details = undefined) => {
  if (!condition) failures.push(details ? { message, details } : { message });
};
const hasText = (value, min = 1) => typeof value === "string" && value.trim().length >= min;
const uniqueIds = (items, key, label) => {
  const ids = items.map((item) => item?.[key]);
  require(ids.every((id) => hasText(id)), `${label}: mangler gyldig ${key}`);
  require(new Set(ids).size === ids.length, `${label}: dupliserte ${key}`);
  return new Set(ids);
};
const requireRefs = (items, key, known, label, idKeys) => {
  for (const item of items) {
    for (const ref of item?.[key] || []) {
      require(known.has(ref), `${label}: ukjent ${key}-referanse`, {
        item: idKeys.map((idKey) => item?.[idKey]).find(Boolean),
        ref
      });
    }
  }
};

const sources = sourceFile.sources || [];
const claims = claimFile.claims || [];
const models = modelFile.models || [];
const measurements = measurementFile.measurements || [];
const gates = policy.production_gates || [];

const sourceIds = uniqueIds(sources, "source_id", "kilder");
const claimIds = uniqueIds(claims, "claim_id", "påstander");
const modelIds = uniqueIds(models, "model_id", "modeller");
const measurementIds = uniqueIds(measurements, "measurement_id", "målinger");
uniqueIds(gates, "gate_id", "produksjonsporter");

require(sources.length >= 15, "for få kontrollerte kilder", sources.length);
require(claims.length >= 14, "for få kanoniske påstander", claims.length);
require(models.length >= 10, "for få vitenskapelige modeller", models.length);
require(measurements.length >= 12, "for få måleregistre", measurements.length);
require(gates.length >= 8, "for få produksjonsporter", gates.length);

for (const source of sources) {
  require(source.review_status === "reviewed", "kilde er ikke faglig kontrollert", source.source_id);
  require(hasText(source.title, 8), "kilde mangler tittel", source.source_id);
  require(Number.isInteger(source.year), "kilde mangler år", source.source_id);
  require(hasText(source.source_type), "kilde mangler kildetype", source.source_id);
  require(hasText(source.study_design), "kilde mangler studiedesign", source.source_id);
  require(hasText(source.identifier) || hasText(source.url), "kilde mangler identifikator", source.source_id);
  require(hasText(source.reviewed_at), "kilde mangler kontrolltidspunkt", source.source_id);
  require((source.strengths || []).length >= 1, "kilde mangler styrker", source.source_id);
  require((source.limitations || []).length >= 1, "kilde mangler begrensninger", source.source_id);
  if (source.source_type === "current_regulatory_standard") {
    require(hasText(source.valid_from), "regulatorisk kilde mangler virkningsdato", source.source_id);
    require(hasText(source.review_by), "regulatorisk kilde mangler kontrollfrist", source.source_id);
  }
}

const allowedGrades = new Set(["high", "moderate", "low", "very_low", "authoritative_current"]);
for (const claim of claims) {
  require(hasText(claim.statement, 70), "påstand er for svak eller kort", claim.claim_id);
  require(claim.status === "canonical", "påstand er ikke kanonisk", claim.claim_id);
  require(hasText(claim.claim_type), "påstand mangler type", claim.claim_id);
  require(allowedGrades.has(claim.evidence_grade), "påstand har ugyldig evidensgrad", claim.claim_id);
  require((claim.source_ids || []).length >= 1, "påstand mangler kilde", claim.claim_id);
  require(hasText(claim.population, 5), "påstand mangler populasjon", claim.claim_id);
  require((claim.contexts || []).length >= 1, "påstand mangler kontekst", claim.claim_id);
  require(hasText(claim.uncertainty_note, 35), "påstand mangler usikkerhetsnote", claim.claim_id);
  require(hasText(claim.external_validity_note, 35), "påstand mangler ekstern-validitetsnote", claim.claim_id);
  require(typeof claim.causal_language_allowed === "boolean", "påstand mangler kausalspråkstyring", claim.claim_id);
  require(hasText(claim.quiz_use, 20), "påstand mangler quizveiledning", claim.claim_id);
  if (claim.claim_type === "regulatory") {
    require(claim.evidence_grade === "authoritative_current", "regulatorisk påstand har feil evidensgrad", claim.claim_id);
  }
  if (claim.claim_type.includes("clinical")) {
    require(
      /diagnos|sikker|kvalifisert|behandling|retur/u.test(`${claim.statement} ${claim.quiz_use}`),
      "klinisk påstand mangler sikkerhetsgrense",
      claim.claim_id
    );
  }
}
requireRefs(claims, "source_ids", sourceIds, "påstand", ["claim_id"]);
requireRefs(claims, "model_ids", modelIds, "påstand", ["claim_id"]);
requireRefs(claims, "measurement_ids", measurementIds, "påstand", ["claim_id"]);

for (const model of models) {
  require(hasText(model.purpose, 40), "modell mangler presist formål", model.model_id);
  require((model.inputs || []).length >= 3, "modell har for få inputdefinisjoner", model.model_id);
  require((model.outputs || []).length >= 1, "modell mangler output", model.model_id);
  require((model.assumptions || []).length >= 2, "modell mangler antakelser", model.model_id);
  require((model.supported_use || []).length >= 1, "modell mangler støttet bruk", model.model_id);
  require((model.misuse || []).length >= 2, "modell mangler misbruksgrenser", model.model_id);
  require((model.source_ids || []).length >= 1, "modell mangler kilder", model.model_id);
  require((model.claim_ids || []).length >= 1, "modell mangler påstandskobling", model.model_id);
  require((model.minimum_metadata || []).length >= 4, "modell mangler minimumsmetadata", model.model_id);
}
requireRefs(models, "source_ids", sourceIds, "modell", ["model_id"]);
requireRefs(models, "claim_ids", claimIds, "modell", ["model_id"]);

for (const measurement of measurements) {
  require(hasText(measurement.construct, 20), "måling mangler konstrukt", measurement.measurement_id);
  require(hasText(measurement.unit), "måling mangler enhet", measurement.measurement_id);
  require((measurement.required_metadata || []).length >= 4, "måling mangler metadata", measurement.measurement_id);
  require((measurement.quality_properties || []).length >= 2, "måling mangler kvalitetsparametre", measurement.measurement_id);
  require(hasText(measurement.interpretation, 45), "måling mangler tolkning", measurement.measurement_id);
  require(hasText(measurement.minimum_change_rule, 30), "måling mangler endringsregel", measurement.measurement_id);
  require((measurement.known_limitations || []).length >= 2, "måling mangler begrensninger", measurement.measurement_id);
  require((measurement.source_ids || []).length >= 1, "måling mangler kilder", measurement.measurement_id);
  require((measurement.claim_ids || []).length >= 1, "måling mangler påstandskobling", measurement.measurement_id);
}
requireRefs(measurements, "source_ids", sourceIds, "måling", ["measurement_id"]);
requireRefs(measurements, "claim_ids", claimIds, "måling", ["measurement_id"]);

require(Object.keys(rubric.certainty_grades || {}).length >= 5, "evidensrubrikken mangler grader");
require((rubric.source_classes || []).length >= 9, "evidensrubrikken mangler kildetyper");
require((rubric.downgrade_domains || []).length >= 6, "evidensrubrikken mangler nedgraderingsdomener");
require((rubric.conflict_handling || []).length >= 4, "evidensrubrikken mangler konflikthåndtering");
require(hasText(rubric.reporting_vs_appraisal_rule, 50), "evidensrubrikken skiller ikke rapportering fra kvalitetsvurdering");

const requiredScientificFields = [
  "claim_id",
  "source_ids",
  "claim_type",
  "evidence_grade",
  "population",
  "context",
  "uncertainty_note",
  "external_validity_note"
];
for (const field of requiredScientificFields) {
  require(policy.required_scientific_metadata?.includes(field), "policy mangler obligatorisk evidensfelt", field);
  require(profile.scientific_evidence_metadata?.required_fields?.includes(field), "quizprofil mangler obligatorisk evidensfelt", field);
}
for (const requiredGate of [
  "gate_sport_traceable_claim",
  "gate_sport_source_chain",
  "gate_sport_measurement_context",
  "gate_sport_model_context",
  "gate_sport_medical_boundary",
  "gate_sport_current_regulation",
  "gate_sport_reproducible_data"
]) {
  require(gates.some((gate) => gate.gate_id === requiredGate && gate.failure_action.includes("block")),
    "policy mangler blokkerende produksjonsport",
    requiredGate
  );
}
require((policy.forbidden_inferences || []).some((value) => value.includes("kausal konklusjon")),
  "policy blokkerer ikke kausal overtolkning");
require((policy.forbidden_inferences || []).some((value) => value.includes("individuell diagnose")),
  "policy blokkerer ikke individuell diagnose");
require(policy.medical_safety?.clinical_sources_must_be_current === true,
  "policy krever ikke oppdaterte kliniske kilder");
require(profile.scientific_evidence_metadata?.block_when_missing === true,
  "quizprofil blokkerer ikke manglende evidensmetadata");

const expectedProfilePaths = {
  manifest: paths.manifest,
  sources: paths.sources,
  claims: paths.claims,
  models: paths.models,
  source_quality_rubric: paths.rubric,
  measurements: paths.measurements,
  scientific_method_policy: paths.policy
};
for (const [key, expected] of Object.entries(expectedProfilePaths)) {
  require(profile.evidence_layer?.[key] === expected, "quizprofil peker til feil evidensfil", {
    key,
    expected,
    actual: profile.evidence_layer?.[key]
  });
}

const expectedQualityPaths = {
  manifest: "sport_scientific_evidence_manifest_v1.json",
  sources: "evidence_registry_sport_v1.json",
  claims: "claims_sport_canonical_v1.json",
  models: "models_sport_canonical_v1.json",
  source_quality_rubric: "source_quality_rubric_sport_v1.json",
  measurements: "measurement_registry_sport_v1.json",
  scientific_method_policy: "sport_scientific_method_policy_v1.json"
};
for (const [key, expected] of Object.entries(expectedQualityPaths)) {
  require(qualityManifest.scientific_evidence_layer?.[key] === expected,
    "kvalitetsmanifest peker til feil evidensfil",
    { key, expected, actual: qualityManifest.scientific_evidence_layer?.[key] }
  );
}

const counts = {
  sources: sources.length,
  claims: claims.length,
  models: models.length,
  measurements: measurements.length,
  production_gates: gates.length
};
for (const [key, value] of Object.entries(counts)) {
  require(manifest.counts?.[key] === value, "evidensmanifestets opptelling er feil", {
    key,
    expected: value,
    actual: manifest.counts?.[key]
  });
}

const report = {
  status: failures.length ? "failed" : "passed",
  version: "1.0",
  subject_id: "sport",
  counts,
  gates: {
    all_ids_unique: !failures.some((failure) => failure.message?.includes("dupliserte")),
    all_references_resolve: !failures.some((failure) => failure.message?.includes("ukjent")),
    all_claims_traceable: claims.every((claim) => claim.source_ids?.length >= 1),
    uncertainty_required: claims.every((claim) => hasText(claim.uncertainty_note, 35)),
    external_validity_required: claims.every((claim) => hasText(claim.external_validity_note, 35)),
    measurement_context_required: measurements.every((measurement) => measurement.required_metadata?.length >= 4),
    model_assumptions_and_misuse_required: models.every((model) =>
      model.assumptions?.length >= 2 && model.misuse?.length >= 2
    ),
    medical_overreach_blocked: policy.forbidden_inferences?.some((value) => value.includes("individuell diagnose")) === true,
    causal_overreach_blocked: policy.forbidden_inferences?.some((value) => value.includes("kausal konklusjon")) === true,
    current_regulation_required: gates.some((gate) => gate.gate_id === "gate_sport_current_regulation"),
    quiz_profile_integrated: Object.entries(expectedProfilePaths).every(([key, expected]) =>
      profile.evidence_layer?.[key] === expected
    )
  },
  failures
};

if (process.argv.includes("--write")) {
  await mkdir(path.dirname(path.resolve(root, paths.report)), { recursive: true });
  await writeFile(path.resolve(root, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
