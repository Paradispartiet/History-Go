#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const base = "data/fag/naeringsliv";
const readText = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(readText(relativePath));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const asArray = (value) => (Array.isArray(value) ? value : []);
const hasText = (value, minimum = 1) => typeof value === "string" && value.trim().length >= minimum;
const sameSet = (a, b) => JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());
const unique = (values, label) => assert(new Set(values).size === values.length, `${label} contains duplicate IDs`);
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

const frameworkPath = `${base}/handelshogskoleramme_okonomi_og_naeringsliv_v1.json`;
const tracksPath = `${base}/handelshogskolespor_okonomi_og_naeringsliv_v1.json`;
const modulesPath = `${base}/handelshogskolemoduler_okonomi_og_naeringsliv_v1.json`;
const theoriesPath = `${base}/handelshogskoleteori_okonomi_og_naeringsliv_v1.json`;
const methodsPath = `${base}/handelshogskolemetoder_okonomi_og_naeringsliv_v1.json`;
const modelsPath = `${base}/handelshogskolemodeller_okonomi_og_naeringsliv_v1.json`;
const measuresPath = `${base}/handelshogskolemal_okonomi_og_naeringsliv_v1.json`;
const datasetsPath = `${base}/handelshogskolekilder_okonomi_og_naeringsliv_v1.json`;
const assessmentPath = `${base}/handelshogskolevurdering_okonomi_og_naeringsliv_v1.json`;

const framework = readJson(frameworkPath);
const trackDocument = readJson(tracksPath);
const moduleDocument = readJson(modulesPath);
const theoryDocument = readJson(theoriesPath);
const methodDocument = readJson(methodsPath);
const modelDocument = readJson(modelsPath);
const measureDocument = readJson(measuresPath);
const datasetDocument = readJson(datasetsPath);
const assessmentDocument = readJson(assessmentPath);
const universityFramework = readJson(`${base}/universitetsramme_okonomi_og_naeringsliv_v1.json`);
const quality = readJson(`${base}/universitetskvalitet_okonomi_og_naeringsliv_v2.json`);
const canonicalEmners = readJson(`${base}/emner_naeringsliv_canonical_v4_5.json`);
const subjectManifest = readJson("data/fag/fag_manifest.json");
const quizProfile = readJson(`${base}/supersetQUIZMAL_naeringsliv.json`);
const auditSource = readText("scripts/audit-category-governance.mjs");

const expectedTracks = [
  "regnskap_revisjon_okonomistyring",
  "markedsforing_og_strategi",
  "kvantitative_metoder_business_analytics",
  "forretningsjus_skatt_regulering",
  "internasjonal_virksomhet_operations_prosjekt"
];
const expectedModulesByTrack = {
  regnskap_revisjon_okonomistyring: [
    "mod_naering_bokforing_regnskapskretslop",
    "mod_naering_finansregnskap_rapportering",
    "mod_naering_regnskapsanalyse_verdsettelse",
    "mod_naering_kostnad_kalkulasjon_budsjett",
    "mod_naering_internkontroll_revisjon_prestasjon"
  ],
  markedsforing_og_strategi: [
    "mod_naering_markedsinnsikt_segmentering",
    "mod_naering_markedsmiks_kanaler",
    "mod_naering_merkevare_kunderelasjon",
    "mod_naering_konkurransestrategi_ressurser",
    "mod_naering_konsernstrategi_implementering"
  ],
  kvantitative_metoder_business_analytics: [
    "mod_naering_matematikk_for_okonomi",
    "mod_naering_sannsynlighet_inferens",
    "mod_naering_regresjon_kausalitet",
    "mod_naering_programmering_databehandling",
    "mod_naering_prognose_optimering_beslutning"
  ],
  forretningsjus_skatt_regulering: [
    "mod_naering_avtalerett_kjopsrett",
    "mod_naering_selskapsrett_eieransvar",
    "mod_naering_arbeidsrett_personvern",
    "mod_naering_skatt_avgift",
    "mod_naering_konkurranserett_compliance_baerekraft"
  ],
  internasjonal_virksomhet_operations_prosjekt: [
    "mod_naering_internasjonal_handel_valuta",
    "mod_naering_multinasjonale_globale_verdikjeder",
    "mod_naering_operations_kapasitet",
    "mod_naering_innkjop_kvalitet_forsyningsrisiko",
    "mod_naering_prosjektledelse_prosjektokonomi"
  ]
};
const expectedModules = Object.values(expectedModulesByTrack).flat();

assert(framework.status === "canonical_business_school_extension", "Business-school framework is not canonical");
assert(framework.subject_id === "naeringsliv", "Business-school framework subject_id must remain naeringsliv");
assert(framework.relationship_to_university_core?.academic_tracks === 6, "Academic six-track foundation must remain intact");
assert(framework.relationship_to_university_core?.academic_core_emners === 36, "Academic 36-emne foundation must remain intact");
assert(framework.relationship_to_university_core?.professional_tracks === 5, "Framework must declare five professional tracks");
assert(framework.relationship_to_university_core?.professional_modules === 25, "Framework must declare 25 professional modules");
assert(framework.relationship_to_university_core?.total_tracks === 11, "Combined framework must declare 11 tracks");
assert(framework.relationship_to_university_core?.total_learning_units === 61, "Combined framework must declare 61 learning units");
assert(sameSet(framework.required_tracks || [], expectedTracks), "Framework required track set is incomplete");
assert(framework.non_degree_guard?.is_accredited_degree === false, "History Go must not claim an accredited degree");
assert(framework.non_degree_guard?.awards_credits === false, "History Go must not claim study credits");
assert(framework.non_degree_guard?.claims_professional_authorization === false, "History Go must not claim professional authorisation");
assert(framework.quiz_integration?.normal_opening_questions_preserved === 14, "Professional layer must preserve the normal first 14 questions");
assert(sameSet(Object.values(framework.canonical_files || {}), [
  "handelshogskolespor_okonomi_og_naeringsliv_v1.json",
  "handelshogskolemoduler_okonomi_og_naeringsliv_v1.json",
  "handelshogskoleteori_okonomi_og_naeringsliv_v1.json",
  "handelshogskolemetoder_okonomi_og_naeringsliv_v1.json",
  "handelshogskolemodeller_okonomi_og_naeringsliv_v1.json",
  "handelshogskolemal_okonomi_og_naeringsliv_v1.json",
  "handelshogskolekilder_okonomi_og_naeringsliv_v1.json",
  "handelshogskolevurdering_okonomi_og_naeringsliv_v1.json"
]), "Framework canonical files are incomplete");

const tracks = trackDocument.tracks || {};
const trackIds = Object.keys(tracks);
assert(trackDocument.track_count === 5 && sameSet(trackIds, expectedTracks), "Professional track document must contain the exact five tracks");
for (const trackId of expectedTracks) {
  const track = tracks[trackId];
  requireFields(track, ["title", "purpose", "concepts", "capabilities", "bridges", "module_ids", "theory_requirements", "method_requirements", "model_requirements", "measure_requirements", "dataset_requirements", "progression"], `Track ${trackId}`);
  assert(asArray(track.concepts).length >= 10, `${trackId} has too few concepts`);
  assert(asArray(track.capabilities).length >= 5, `${trackId} has too few professional capabilities`);
  assert(sameSet(track.module_ids, expectedModulesByTrack[trackId]), `${trackId} does not contain its exact five modules`);
  assert(asArray(track.theory_requirements).length === 10, `${trackId} must have ten theory cards`);
  assert(asArray(track.method_requirements).length === 10, `${trackId} must have ten method protocols`);
  assert(asArray(track.model_requirements).length === 10, `${trackId} must have ten models`);
  assert(asArray(track.measure_requirements).length === 20, `${trackId} must have twenty measures`);
  assert(asArray(track.dataset_requirements).length >= 3, `${trackId} needs explicit dataset coverage`);
  assert(sameSet(track.progression, ["introductory", "intermediate", "advanced"]), `${trackId} lacks the full progression ladder`);
}

const modules = asArray(moduleDocument.modules);
const moduleIds = modules.map((row) => row.module_id);
const moduleById = new Map(modules.map((row) => [row.module_id, row]));
assert(moduleDocument.module_count === 25 && modules.length === 25, "Professional module document must contain 25 modules");
unique(moduleIds, "Professional module registry");
assert(sameSet(moduleIds, expectedModules), "Professional modules do not match the exact 25-module contract");
assert(moduleIds.every((id) => id.startsWith("mod_naering_")), "Every professional module must use the mod_naering_ prefix");

const canonicalCoreIds = canonicalEmners
  .filter((row) => row?.emne_role !== "field_module" && row?.module_type !== "cross_domain_field_module")
  .map((row) => row.emne_id);
assert(canonicalCoreIds.length === 36, "Canonical academic core must remain 36 emners");

const humanFields = {
  titles: modules.map((row) => row.title),
  problems: modules.map((row) => row.professional_problem),
  units: modules.map((row) => row.empirical_unit),
  calculations: modules.map((row) => row.calculation_exercise),
  conflicts: modules.map((row) => row.professional_conflict)
};
for (const [label, values] of Object.entries(humanFields)) {
  assert(values.every((value) => hasText(value, 40) || label === "titles"), `Professional ${label} contains thin text`);
  assert(new Set(values).size === 25, `Professional ${label} must be individually written for all 25 modules`);
}

const theories = asArray(theoryDocument.cards);
const methods = asArray(methodDocument.protocols);
const models = asArray(modelDocument.models);
const measures = asArray(measureDocument.measures);
const datasets = asArray(datasetDocument.datasets);
const assessments = asArray(assessmentDocument.profiles);
const theoryIds = theories.map((row) => row.theory_id);
const methodIds = methods.map((row) => row.method_id);
const modelIds = models.map((row) => row.model_id);
const measureIds = measures.map((row) => row.measure_id);
const datasetIds = datasets.map((row) => row.dataset_id);
unique(theoryIds, "Professional theory registry");
unique(methodIds, "Professional method registry");
unique(modelIds, "Professional model registry");
unique(measureIds, "Professional measure registry");
unique(datasetIds, "Professional dataset registry");
assert(theoryDocument.theory_count === 50 && theories.length === 50, "Professional layer must contain 50 theory cards");
assert(methodDocument.method_count === 50 && methods.length === 50, "Professional layer must contain 50 methods");
assert(modelDocument.model_count === 50 && models.length === 50, "Professional layer must contain 50 models");
assert(measureDocument.measure_count === 100 && measures.length === 100, "Professional layer must contain 100 measures");
assert(datasetDocument.dataset_count === datasets.length && datasets.length >= 25, "Professional layer needs a broad deduplicated dataset registry");

const registries = [
  { name: "theory", rows: theories, id: "theory_id", moduleField: "theory_ids", expectedPerModule: 2 },
  { name: "method", rows: methods, id: "method_id", moduleField: "method_protocol_ids", expectedPerModule: 2 },
  { name: "model", rows: models, id: "model_id", moduleField: "model_ids", expectedPerModule: 2 },
  { name: "measure", rows: measures, id: "measure_id", moduleField: "measure_ids", expectedPerModule: 4 },
  { name: "dataset", rows: datasets, id: "dataset_id", moduleField: "dataset_ids", expectedPerModule: 3 }
];

for (const module of modules) {
  requireFields(module, ["module_id", "track_id", "sequence", "title", "purpose", "professional_problem", "empirical_unit", "calculation_exercise", "professional_conflict", "core_concepts", "university_prerequisite_emne_ids", "theory_ids", "method_protocol_ids", "model_ids", "measure_ids", "dataset_ids", "level_ladder", "evidence_requirements", "misconception_guards", "quiz_targets", "quiz_phase_guard"], `Module ${module.module_id}`);
  assert(tracks[module.track_id], `${module.module_id} references unknown track`);
  assert(expectedModulesByTrack[module.track_id].includes(module.module_id), `${module.module_id} is assigned to the wrong track`);
  assert(Number.isInteger(module.sequence) && module.sequence >= 1 && module.sequence <= 5, `${module.module_id} has invalid sequence`);
  assert(asArray(module.university_prerequisite_emne_ids).length >= 1, `${module.module_id} needs academic bridges`);
  assert(asArray(module.university_prerequisite_emne_ids).every((id) => canonicalCoreIds.includes(id)), `${module.module_id} references an unknown academic emne`);
  assert(asArray(module.core_concepts).length >= 5, `${module.module_id} has too few core concepts`);
  assert(asArray(module.evidence_requirements).length >= 4, `${module.module_id} has weak evidence requirements`);
  assert(asArray(module.misconception_guards).length >= 3, `${module.module_id} has weak misconception guards`);
  assert(asArray(module.quiz_targets?.bridge).length >= 2 && asArray(module.quiz_targets?.final).length >= 2, `${module.module_id} has incomplete quiz targets`);
  assert(module.quiz_phase_guard.includes("2x7"), `${module.module_id} does not preserve the first 2x7 questions`);
  for (const level of ["introductory", "intermediate", "advanced"]) {
    assert(hasText(module.level_ladder?.[level]?.activity, 100), `${module.module_id} has thin ${level} activity`);
    assert(hasText(module.level_ladder?.[level]?.assessment_product, 80), `${module.module_id} has thin ${level} assessment product`);
    const humanText = `${module.level_ladder[level].activity} ${module.level_ladder[level].assessment_product}`;
    assert(!humanText.includes("em_naering_"), `${module.module_id} leaks a technical academic ID into human-facing learning content`);
    assert(!humanText.includes("mod_naering_"), `${module.module_id} leaks a technical module ID into human-facing learning content`);
  }
  for (const registry of registries) {
    const references = asArray(module[registry.moduleField]);
    assert(references.length === registry.expectedPerModule, `${module.module_id} must reference exactly ${registry.expectedPerModule} ${registry.name} entries`);
    assert(references.every((id) => registry.rows.some((row) => row[registry.id] === id)), `${module.module_id} references unknown ${registry.name}`);
  }
}
for (const trackId of expectedTracks) {
  const sequences = modules.filter((row) => row.track_id === trackId).map((row) => row.sequence);
  assert(sameSet(sequences, [1, 2, 3, 4, 5]), `${trackId} must use sequence 1–5 exactly once`);
}

for (const card of theories) {
  requireFields(card, ["theory_id", "title", "track_ids", "tradition_or_origin", "core_claims", "key_concepts", "mechanism", "assumptions", "observable_implications", "best_fit_cases", "competing_theories", "major_criticisms", "limits", "mapped_module_ids"], `Theory ${card.theory_id}`);
  assert(asArray(card.track_ids).length === 1 && tracks[card.track_ids[0]], `${card.theory_id} must reference one professional track`);
  assert(asArray(card.core_claims).length >= 2 && asArray(card.key_concepts).length >= 3, `${card.theory_id} is academically thin`);
  assert(hasText(card.mechanism, 120), `${card.theory_id} has a thin mechanism`);
  assert(asArray(card.assumptions).length >= 2 && asArray(card.observable_implications).length >= 2, `${card.theory_id} lacks assumptions or implications`);
  assert(asArray(card.competing_theories).length >= 2 && asArray(card.major_criticisms).length >= 2, `${card.theory_id} lacks competition or criticism`);
}
for (const protocol of methods) {
  requireFields(protocol, ["method_id", "title", "track_ids", "problemstilling", "enhet_og_avgrensning", "begrepsdefinisjoner", "operasjonalisering", "datakilder", "utvalg_eller_sammenligningsgrunnlag", "analysetrinn", "beregninger_eller_koding", "alternative_forklaringer", "feilkilder_og_usikkerhet", "gyldighetsomraade", "konklusjonsgrense", "mapped_module_ids"], `Method ${protocol.method_id}`);
  assert(asArray(protocol.analysetrinn).length >= 6, `${protocol.method_id} needs six analysis steps`);
  assert(asArray(protocol.operasjonalisering?.variabler).length >= 3, `${protocol.method_id} has weak operationalisation`);
  assert(asArray(protocol.datakilder).length >= 3, `${protocol.method_id} needs three source types`);
  assert(asArray(protocol.alternative_forklaringer).length >= 3 && asArray(protocol.feilkilder_og_usikkerhet).length >= 3, `${protocol.method_id} lacks robustness controls`);
  assert(hasText(protocol.konklusjonsgrense, 100), `${protocol.method_id} has a thin conclusion limit`);
}
for (const model of models) {
  requireFields(model, ["model_id", "title", "track_ids", "purpose", "formula_or_logic", "variables", "unit", "assumptions", "interpretation", "misuse_guards", "minimum_evidence", "progression", "mapped_module_ids"], `Model ${model.model_id}`);
  assert(asArray(model.variables).length >= 5, `${model.model_id} needs at least five variables`);
  assert(asArray(model.assumptions).length >= 2 && asArray(model.misuse_guards).length >= 2, `${model.model_id} lacks guards`);
  assert(asArray(model.minimum_evidence).length >= 3, `${model.model_id} needs three evidence sources`);
  assert(asArray(model.progression).length === 3, `${model.model_id} needs three-level progression`);
}
for (const measure of measures) {
  requireFields(measure, ["measure_id", "title", "track_ids", "definition", "calculation", "unit", "interpretation", "limits", "preferred_sources", "mapped_module_ids"], `Measure ${measure.measure_id}`);
  assert(asArray(measure.limits).length >= 2, `${measure.measure_id} needs two limits`);
  assert(asArray(measure.preferred_sources).length >= 3, `${measure.measure_id} needs three preferred sources`);
}
for (const dataset of datasets) {
  requireFields(dataset, ["dataset_id", "title", "owner_or_source", "use", "minimum_metadata", "access_and_ethics", "fact_source", "mapped_module_ids"], `Dataset ${dataset.dataset_id}`);
  assert(dataset.fact_source === true, `${dataset.dataset_id} must be usable as a fact source`);
  assert(asArray(dataset.minimum_metadata).length >= 5, `${dataset.dataset_id} has weak metadata requirements`);
  assert(asArray(dataset.access_and_ethics).length >= 3, `${dataset.dataset_id} lacks access and ethics requirements`);
}

for (const registry of registries) {
  const reverse = new Map(registry.rows.map((row) => [row[registry.id], asArray(row.mapped_module_ids)]));
  for (const [id, mapped] of reverse) {
    assert(mapped.length >= 1, `${registry.name} ${id} is orphaned`);
    assert(mapped.every((moduleId) => moduleById.has(moduleId)), `${registry.name} ${id} maps to unknown module`);
    const expected = modules.filter((module) => asArray(module[registry.moduleField]).includes(id)).map((module) => module.module_id);
    assert(sameSet(mapped, expected), `${registry.name} ${id} has stale two-way module mapping`);
  }
  const used = new Set(modules.flatMap((module) => asArray(module[registry.moduleField])));
  assert(used.size === registry.rows.length, `At least one professional ${registry.name} entry is unused`);
}

assert(assessmentDocument.profile_count === 15 && assessments.length === 15, "Assessment matrix must contain five tracks × three levels");
const expectedProfileIds = expectedTracks.flatMap((trackId) => ["introductory", "intermediate", "advanced"].map((level) => `${trackId}_${level}`));
assert(sameSet(assessments.map((row) => row.profile_id), expectedProfileIds), "Assessment profiles do not cover five tracks × three levels");
for (const profile of assessments) {
  requireFields(profile, ["profile_id", "track_id", "level", "required_verbs", "task_contract", "rubric", "automatic_failures"], `Assessment ${profile.profile_id}`);
  assert(tracks[profile.track_id], `${profile.profile_id} references unknown track`);
  assert(asArray(profile.rubric).length === 6, `${profile.profile_id} must have six rubric dimensions`);
  assert(profile.rubric.reduce((sum, row) => sum + row.weight, 0) === 100, `${profile.profile_id} rubric weights must total 100`);
  assert(asArray(profile.automatic_failures).length >= 6, `${profile.profile_id} needs strong automatic-failure guards`);
}

assert(universityFramework.academic_scope?.professional_track_count === 5, "University framework does not register five professional tracks");
assert(universityFramework.academic_scope?.professional_module_count === 25, "University framework does not register 25 professional modules");
assert(universityFramework.academic_scope?.total_track_count === 11, "University framework combined track count is stale");
assert(universityFramework.academic_scope?.total_learning_unit_count === 61, "University framework combined learning-unit count is stale");
assert(universityFramework.canonical_files?.professional_framework === "handelshogskoleramme_okonomi_og_naeringsliv_v1.json", "University framework does not register professional framework");
assert(quality.professional_extension?.professional_tracks === 5 && quality.professional_extension?.professional_modules === 25, "Quality manifest professional coverage is stale");
assert(quality.coverage?.professional_tracks === 5 && quality.coverage?.professional_modules === 25 && quality.coverage?.total_tracks === 11 && quality.coverage?.total_learning_units === 61, "Quality manifest combined coverage is stale");

const businessManifest = subjectManifest.naeringsliv?.businessSchoolExtension;
assert(businessManifest?.status === "canonical_professional_extension", "Subject manifest does not register canonical professional extension");
const expectedManifestValues = {
  framework: "naeringsliv/handelshogskoleramme_okonomi_og_naeringsliv_v1.json",
  tracks: "naeringsliv/handelshogskolespor_okonomi_og_naeringsliv_v1.json",
  modules: "naeringsliv/handelshogskolemoduler_okonomi_og_naeringsliv_v1.json",
  theories: "naeringsliv/handelshogskoleteori_okonomi_og_naeringsliv_v1.json",
  methods: "naeringsliv/handelshogskolemetoder_okonomi_og_naeringsliv_v1.json",
  models: "naeringsliv/handelshogskolemodeller_okonomi_og_naeringsliv_v1.json",
  measures: "naeringsliv/handelshogskolemal_okonomi_og_naeringsliv_v1.json",
  datasets: "naeringsliv/handelshogskolekilder_okonomi_og_naeringsliv_v1.json",
  assessment: "naeringsliv/handelshogskolevurdering_okonomi_og_naeringsliv_v1.json"
};
for (const [key, expected] of Object.entries(expectedManifestValues)) {
  assert(businessManifest?.[key] === expected, `Subject manifest has wrong professional ${key} path`);
}
assert(quizProfile.normal_opening_profile?.sets === 2 && quizProfile.normal_opening_profile?.questions_per_set === 7, "Quiz profile no longer preserves first 2×7 normal questions");
assert(quizProfile.governance?.business_school_framework === frameworkPath, "Quiz profile does not register business-school framework");
assert(asArray(quizProfile.category_rules).some((rule) => rule.includes("bro- og sluttfasen") && rule.includes("første to settene")), "Quiz profile lacks professional phase guard");
assert(auditSource.includes("validate-okonomi-naeringsliv-handelshogskole.mjs"), "Category governance audit does not import professional validator");

const coverageText = modules.map((row) => `${row.module_id} ${row.title} ${row.core_concepts.join(" ")}`).join("\n").toLowerCase();
for (const required of [
  "bokføring", "finansregnskap", "verdsettelse", "budsjettering", "revisjon",
  "segmentering", "produkt", "merkevare", "konkurransestrategi", "implementering",
  "matematikk", "sannsynlighet", "regresjon", "programmering", "optimering",
  "avtalerett", "selskapsrett", "arbeidsrett", "skatt", "konkurranserett",
  "internasjonal handel", "multinasjonale", "operations", "innkjøp", "prosjektledelse"
]) {
  assert(coverageText.includes(required.toLowerCase()), `Professional coverage is missing required area: ${required}`);
}

console.log(
  `OK: Økonomi og næringsliv business-school coverage validates (${trackIds.length} tracks, ${modules.length} modules, ${theories.length} theories, ${methods.length} methods, ${models.length} models, ${measures.length} measures, ${datasets.length} datasets, ${assessments.length} assessment profiles).`
);
