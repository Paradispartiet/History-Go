#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const base = "data/fag/naeringsliv";
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const asArray = (value) => (Array.isArray(value) ? value : []);
const hasText = (value) => typeof value === "string" && value.trim().length > 0;
const unique = (values, label) => {
  assert(new Set(values).size === values.length, `${label} contains duplicate IDs`);
};
const sameSet = (a, b) =>
  JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());
const requireFields = (record, fields, label) => {
  for (const field of fields) {
    const value = record?.[field];
    const present = Array.isArray(value)
      ? value.length > 0
      : value && typeof value === "object"
        ? Object.keys(value).length > 0
        : value !== undefined && value !== null && value !== "";
    assert(present, `${label} is missing ${field}`);
  }
};

const framework = readJson(`${base}/universitetsramme_okonomi_og_naeringsliv_v1.json`);
const tracksDocument = readJson(`${base}/universitetsspor_okonomi_og_naeringsliv_v1.json`);
const mappingDocument = readJson(`${base}/universitetsmapping_okonomi_og_naeringsliv_v1.json`);
const quality = readJson(`${base}/universitetskvalitet_okonomi_og_naeringsliv_v2.json`);
const theoryDocument = readJson(`${base}/teorikort_okonomi_og_naeringsliv_v1.json`);
const methodDocument = readJson(`${base}/metodeprotokoller_okonomi_og_naeringsliv_v1.json`);
const modelDocument = readJson(`${base}/modellregister_okonomi_og_naeringsliv_v1.json`);
const measureDocument = readJson(`${base}/maleregister_okonomi_og_naeringsliv_v1.json`);
const extensionDocument = readJson(`${base}/emneutvidelser_okonomi_og_naeringsliv_v1.json`);
const assessmentDocument = readJson(`${base}/vurderingsmatrise_okonomi_og_naeringsliv_v1.json`);
const quizProfile = readJson(`${base}/supersetQUIZMAL_naeringsliv.json`);
const canonicalEmners = readJson(`${base}/emner_naeringsliv_canonical_v4_5.json`);

const tracks = tracksDocument.tracks || {};
const trackIds = Object.keys(tracks);
const mappings = asArray(mappingDocument.mapping);
const canonicalCoreIds = canonicalEmners
  .filter((row) => row?.emne_role !== "field_module" && row?.module_type !== "cross_domain_field_module")
  .map((row) => row.emne_id);
const mappedIds = mappings.map((row) => row.emne_id);

assert(quality.status === "canonical_university_quality", "Quality manifest is not canonical");
assert(quality.subject_id === "naeringsliv", "Quality manifest subject_id must remain naeringsliv");
assert(quality.display_name === "Økonomi og næringsliv", "Quality manifest display name is wrong");
assert(trackIds.length === 6, "Quality layer requires exactly six discipline tracks");
assert(mappedIds.length === 36 && sameSet(mappedIds, canonicalCoreIds), "Quality layer must use the canonical 36 emners");
assert(quizProfile.normal_opening_profile?.sets === 2 && quizProfile.normal_opening_profile?.questions_per_set === 7, "Normal quiz opening 2×7 was not preserved");

const theories = asArray(theoryDocument.cards);
const methods = asArray(methodDocument.protocols);
const models = asArray(modelDocument.models);
const measures = asArray(measureDocument.measures);
const extensions = asArray(extensionDocument.extensions);
const profiles = asArray(assessmentDocument.profiles);

assert(theories.length >= 24, "University quality requires at least 24 theory cards");
assert(methods.length >= 18, "University quality requires at least 18 method protocols");
assert(models.length >= 24, "University quality requires at least 24 models");
assert(measures.length >= 36, "University quality requires at least 36 measures");
assert(extensions.length === 36, "Every core emne must have one university extension");
assert(profiles.length === 18, "Assessment matrix must contain six tracks × three levels");

const theoryIds = theories.map((row) => row.theory_id);
const methodIds = methods.map((row) => row.method_id);
const modelIds = models.map((row) => row.model_id);
const measureIds = measures.map((row) => row.measure_id);
const extensionIds = extensions.map((row) => row.emne_id);
unique(theoryIds, "Theory registry");
unique(methodIds, "Method registry");
unique(modelIds, "Model registry");
unique(measureIds, "Measure registry");
unique(extensionIds, "Emne extensions");
assert(sameSet(extensionIds, canonicalCoreIds), "Emne extensions must match the canonical 36 emners exactly");

const theoryRequired = framework.theory_card_required_fields || [];
for (const card of theories) {
  requireFields(card, theoryRequired, `Theory ${card.theory_id || "without ID"}`);
  assert(asArray(card.track_ids).every((id) => tracks[id]), `${card.theory_id} references unknown track`);
  assert(asArray(card.central_works).length >= 1, `${card.theory_id} needs at least one central work`);
  assert(asArray(card.central_works).every((work) => hasText(work.title) && Number.isInteger(work.year)), `${card.theory_id} has incomplete work metadata`);
  assert(asArray(card.core_claims).length >= 2, `${card.theory_id} needs at least two core claims`);
  assert(asArray(card.key_concepts).length >= 3, `${card.theory_id} needs at least three concepts`);
  assert(hasText(card.mechanism) && card.mechanism.length >= 70, `${card.theory_id} mechanism is too thin`);
  assert(asArray(card.assumptions).length >= 2, `${card.theory_id} needs explicit assumptions`);
  assert(asArray(card.observable_implications).length >= 2, `${card.theory_id} needs observable implications`);
  assert(asArray(card.competing_theories).length >= 2, `${card.theory_id} needs competing theories`);
  assert(asArray(card.major_criticisms).length >= 2, `${card.theory_id} needs major criticisms`);
  assert(asArray(card.limits).length >= 1, `${card.theory_id} needs a stated limit`);
  assert(asArray(card.recommended_methods).every((id) => methodIds.includes(id)), `${card.theory_id} recommends unknown method`);
  assert(asArray(card.mapped_emne_ids).length >= 1, `${card.theory_id} is orphaned`);
  assert(asArray(card.mapped_emne_ids).every((id) => canonicalCoreIds.includes(id)), `${card.theory_id} maps to unknown emne`);
}

const methodRequired = framework.method_protocol_required_fields || [];
for (const protocol of methods) {
  requireFields(protocol, ["method_id", "title", "track_ids", ...methodRequired], `Method ${protocol.method_id || "without ID"}`);
  assert(asArray(protocol.track_ids).every((id) => tracks[id]), `${protocol.method_id} references unknown track`);
  assert(asArray(protocol.analysetrinn).length >= 5, `${protocol.method_id} needs at least five analysis steps`);
  assert(typeof protocol.operasjonalisering === "object" && asArray(protocol.operasjonalisering.variabler).length >= 3, `${protocol.method_id} has weak operationalisation`);
  assert(asArray(protocol.datakilder).length >= 3, `${protocol.method_id} needs at least three source types`);
  assert(asArray(protocol.alternative_forklaringer).length >= 3, `${protocol.method_id} needs alternative explanations`);
  assert(asArray(protocol.feilkilder_og_usikkerhet).length >= 3, `${protocol.method_id} needs uncertainty and error sources`);
  assert(hasText(protocol.konklusjonsgrense) && protocol.konklusjonsgrense.length >= 60, `${protocol.method_id} conclusion limit is too thin`);
  assert(asArray(protocol.mapped_emne_ids).length >= 1, `${protocol.method_id} is orphaned`);
}

const modelRequired = ["model_id", "title", "track_ids", "purpose", "formula_or_logic", "variables", "unit", "assumptions", "interpretation", "misuse_guards", "minimum_evidence", "progression", "mapped_emne_ids"];
for (const model of models) {
  requireFields(model, modelRequired, `Model ${model.model_id || "without ID"}`);
  assert(asArray(model.track_ids).every((id) => tracks[id]), `${model.model_id} references unknown track`);
  assert(asArray(model.variables).length >= 3, `${model.model_id} needs at least three variables`);
  assert(asArray(model.assumptions).length >= 2, `${model.model_id} needs explicit assumptions`);
  assert(asArray(model.misuse_guards).length >= 2, `${model.model_id} needs misuse guards`);
  assert(asArray(model.minimum_evidence).length >= 1, `${model.model_id} needs minimum evidence`);
  assert(asArray(model.progression).length >= 3, `${model.model_id} needs three-level progression`);
  assert(asArray(model.mapped_emne_ids).length >= 1, `${model.model_id} is orphaned`);
}

const measureRequired = ["measure_id", "title", "track_ids", "definition", "calculation", "unit", "interpretation", "limits", "preferred_sources", "mapped_emne_ids"];
for (const measure of measures) {
  requireFields(measure, measureRequired, `Measure ${measure.measure_id || "without ID"}`);
  assert(asArray(measure.track_ids).every((id) => tracks[id]), `${measure.measure_id} references unknown track`);
  assert(asArray(measure.limits).length >= 1, `${measure.measure_id} needs a limit`);
  assert(asArray(measure.preferred_sources).length >= 3, `${measure.measure_id} needs source guidance`);
  assert(asArray(measure.mapped_emne_ids).length >= 1, `${measure.measure_id} is orphaned`);
}

const theorySet = new Set(theoryIds);
const methodSet = new Set(methodIds);
const modelSet = new Set(modelIds);
const measureSet = new Set(measureIds);
const used = { theory: new Set(), method: new Set(), model: new Set(), measure: new Set() };
for (const ext of extensions) {
  assert(tracks[ext.primary_track_id], `${ext.emne_id} has unknown primary track`);
  assert(asArray(ext.secondary_track_ids).every((id) => tracks[id]), `${ext.emne_id} has unknown secondary track`);
  assert(hasText(ext.university_problem) && ext.university_problem.length >= 80, `${ext.emne_id} has a thin university problem`);
  assert(asArray(ext.theory_ids).length >= 2, `${ext.emne_id} needs at least two theories`);
  assert(asArray(ext.method_protocol_ids).length >= 2, `${ext.emne_id} needs at least two methods`);
  assert(asArray(ext.model_ids).length >= 2, `${ext.emne_id} needs at least two models`);
  assert(asArray(ext.measure_ids).length >= 3, `${ext.emne_id} needs at least three measures`);
  for (const id of ext.theory_ids) { assert(theorySet.has(id), `${ext.emne_id} references unknown theory ${id}`); used.theory.add(id); }
  for (const id of ext.method_protocol_ids) { assert(methodSet.has(id), `${ext.emne_id} references unknown method ${id}`); used.method.add(id); }
  for (const id of ext.model_ids) { assert(modelSet.has(id), `${ext.emne_id} references unknown model ${id}`); used.model.add(id); }
  for (const id of ext.measure_ids) { assert(measureSet.has(id), `${ext.emne_id} references unknown measure ${id}`); used.measure.add(id); }
  for (const level of ["introductory", "intermediate", "advanced"]) {
    assert(hasText(ext.learning_activities?.[level]), `${ext.emne_id} is missing ${level} learning activity`);
    assert(hasText(ext.assessment?.[`${level}_product`]), `${ext.emne_id} is missing ${level} assessment product`);
  }
  assert(asArray(ext.common_misconceptions).length >= 2, `${ext.emne_id} needs misconception guards`);
  assert(asArray(ext.evidence_requirements).length >= 3, `${ext.emne_id} needs evidence requirements`);
  assert(asArray(ext.quiz_targets?.bridge).length >= 2 && asArray(ext.quiz_targets?.final).length >= 2, `${ext.emne_id} has incomplete quiz targets`);
}
assert(used.theory.size === theoryIds.length, "At least one theory card is unused");
assert(used.method.size === methodIds.length, "At least one method protocol is unused");
assert(used.model.size === modelIds.length, "At least one model is unused");
assert(used.measure.size === measureIds.length, "At least one measure is unused");

for (const trackId of trackIds) {
  assert(theories.filter((row) => row.track_ids.includes(trackId)).length >= 3, `${trackId} has too few theory cards`);
  assert(methods.filter((row) => row.track_ids.includes(trackId)).length >= 3, `${trackId} has too few method protocols`);
  assert(models.filter((row) => row.track_ids.includes(trackId)).length >= 4, `${trackId} has too few models`);
  assert(measures.filter((row) => row.track_ids.includes(trackId)).length >= 6, `${trackId} has too few measures`);
}

const expectedProfileIds = trackIds.flatMap((trackId) =>
  ["introductory", "intermediate", "advanced"].map((level) => `${trackId}_${level}`)
);
assert(sameSet(profiles.map((row) => row.profile_id), expectedProfileIds), "Assessment profiles do not cover six tracks × three levels");
for (const profile of profiles) {
  requireFields(profile, ["profile_id", "track_id", "level", "required_verbs", "task_contract", "rubric", "automatic_failures"], `Assessment ${profile.profile_id || "without ID"}`);
  assert(tracks[profile.track_id], `${profile.profile_id} references unknown track`);
  assert(asArray(profile.rubric).length === 6, `${profile.profile_id} must use six rubric dimensions`);
  assert(profile.rubric.reduce((sum, row) => sum + row.weight, 0) === 100, `${profile.profile_id} rubric weights must total 100`);
  assert(asArray(profile.automatic_failures).length >= 4, `${profile.profile_id} needs automatic failure guards`);
}

const coverage = quality.coverage || {};
assert(coverage.discipline_tracks === trackIds.length, "Quality coverage track count is stale");
assert(coverage.core_emners === extensions.length, "Quality coverage emne count is stale");
assert(coverage.theory_cards === theories.length, "Quality coverage theory count is stale");
assert(coverage.method_protocols === methods.length, "Quality coverage method count is stale");
assert(coverage.models === models.length, "Quality coverage model count is stale");
assert(coverage.measures === measures.length, "Quality coverage measure count is stale");
assert(coverage.assessment_profiles === profiles.length && coverage.levels === 3, "Quality coverage assessment count is stale");
assert(Object.values(quality.anti_tokenism || {}).every((value) => value === false), "Anti-tokenism policy must reject every listed shortcut");
assert(Object.keys(quality.canonical_files || {}).length === 6, "Quality manifest must register six canonical artifact files");

console.log(
  `OK: Økonomi og næringsliv university quality validates (${extensions.length} emners, ${theories.length} theories, ${methods.length} methods, ${models.length} models, ${measures.length} measures, ${profiles.length} assessment profiles).`
);
