#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const base = "data/fag/naeringsliv";
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, base, name), "utf8"));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const array = (value) => Array.isArray(value) ? value : [];
const text = (value) => typeof value === "string" && value.trim().length > 0;
const sameSet = (a, b) => JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());
const unique = (values, label) => assert(new Set(values).size === values.length, `${label} must be unique`);

const canonical = read("emner_naeringsliv_canonical_v4_5.json")
  .filter((row) => row?.emne_role !== "field_module" && row?.module_type !== "cross_domain_field_module");
const extensions = read("emneutvidelser_okonomi_og_naeringsliv_v1.json").extensions;
const theories = read("teorikort_okonomi_og_naeringsliv_v1.json").cards;
const methods = read("metodeprotokoller_okonomi_og_naeringsliv_v1.json").protocols;
const models = read("modellregister_okonomi_og_naeringsliv_v1.json").models;
const measures = read("maleregister_okonomi_og_naeringsliv_v1.json").measures;
const datasets = read("datasettregister_okonomi_og_naeringsliv_v1.json");
const quality = read("universitetskvalitet_okonomi_og_naeringsliv_v2.json");

const canonicalIds = canonical.map((row) => row.emne_id);
const extensionIds = extensions.map((row) => row.emne_id);
assert(canonicalIds.length === 36, `Expected 36 canonical emners, got ${canonicalIds.length}`);
assert(extensions.length === 36 && sameSet(extensionIds, canonicalIds), "Individual extensions must match all 36 canonical emners");
assert(theories.length >= 29, `Expected at least 29 theories after individual revision, got ${theories.length}`);
assert(methods.length >= 23, `Expected at least 23 methods after individual revision, got ${methods.length}`);
assert(models.length >= 29, `Expected at least 29 models after individual revision, got ${models.length}`);
assert(measures.length >= 45, `Expected at least 45 measures after individual revision, got ${measures.length}`);
assert(datasets.dataset_count === datasets.datasets.length && datasets.datasets.length >= 20, "Dataset registry is incomplete");
assert(quality.individual_revision?.status === "complete", "Quality manifest does not mark the individual revision complete");

const datasetIds = datasets.datasets.map((row) => row.dataset_id);
unique(datasetIds, "Dataset IDs");
for (const dataset of datasets.datasets) {
  assert(text(dataset.title) && text(dataset.owner_or_source) && text(dataset.use), `${dataset.dataset_id} has incomplete dataset metadata`);
  assert(dataset.fact_source === true, `${dataset.dataset_id} must be a factual source, not a governance file`);
  assert(array(dataset.minimum_metadata).length >= 4, `${dataset.dataset_id} lacks minimum metadata requirements`);
}

const theoryIds = theories.map((row) => row.theory_id);
const methodIds = methods.map((row) => row.method_id);
const modelIds = models.map((row) => row.model_id);
const measureIds = measures.map((row) => row.measure_id);
const theorySet = new Set(theoryIds);
const methodSet = new Set(methodIds);
const modelSet = new Set(modelIds);
const measureSet = new Set(measureIds);
const datasetSet = new Set(datasetIds);
unique(theoryIds, "Theory IDs");
unique(methodIds, "Method IDs");
unique(modelIds, "Model IDs");
unique(measureIds, "Measure IDs");

const byId = new Map(extensions.map((row) => [row.emne_id, row]));
const forbiddenGeneric = [
  "Forklar problemet i em_naering_",
  "Sammenlign to perioder, steder eller virksomheter for em_naering_",
  "Bygg en selvstendig analyse av em_naering_",
];
const humanFields = [];
for (const ext of extensions) {
  assert(text(ext.empirical_unit) && ext.empirical_unit.length >= 45, `${ext.emne_id} lacks a specific empirical unit`);
  assert(text(ext.calculation_exercise) && ext.calculation_exercise.length >= 45, `${ext.emne_id} lacks a specific calculation exercise`);
  assert(text(ext.scholarly_conflict) && ext.scholarly_conflict.length >= 45, `${ext.emne_id} lacks a specific scholarly conflict`);
  assert(array(ext.dataset_ids).length >= 3, `${ext.emne_id} needs at least three datasets`);
  assert(ext.dataset_ids.every((id) => datasetSet.has(id)), `${ext.emne_id} references an unknown dataset`);
  assert(array(ext.theory_ids).length >= 2 && ext.theory_ids.every((id) => theorySet.has(id)), `${ext.emne_id} has invalid theory coverage`);
  assert(array(ext.method_protocol_ids).length >= 2 && ext.method_protocol_ids.every((id) => methodSet.has(id)), `${ext.emne_id} has invalid method coverage`);
  assert(array(ext.model_ids).length >= 2 && ext.model_ids.every((id) => modelSet.has(id)), `${ext.emne_id} has invalid model coverage`);
  assert(array(ext.measure_ids).length >= 3 && ext.measure_ids.every((id) => measureSet.has(id)), `${ext.emne_id} has invalid measure coverage`);
  for (const level of ["introductory", "intermediate", "advanced"]) {
    const activity = ext.learning_activities?.[level];
    assert(text(activity) && activity.length >= 120, `${ext.emne_id} has a thin ${level} activity`);
    humanFields.push(activity);
  }
  for (const field of ["introductory_product", "intermediate_product", "advanced_product"]) {
    const product = ext.assessment?.[field];
    assert(text(product) && product.length >= 75, `${ext.emne_id} has a thin ${field}`);
    humanFields.push(product);
  }
  assert(array(ext.common_misconceptions).length >= 3, `${ext.emne_id} needs three emne-specific misconception guards`);
  assert(array(ext.evidence_requirements).length >= 4, `${ext.emne_id} needs four emne-specific evidence requirements`);
  assert(array(ext.quiz_targets?.bridge).length >= 2 && array(ext.quiz_targets?.final).length >= 2, `${ext.emne_id} has incomplete quiz targets`);
  humanFields.push(ext.empirical_unit, ext.calculation_exercise, ext.scholarly_conflict, ...ext.common_misconceptions, ...ext.evidence_requirements, ...ext.quiz_targets.bridge, ...ext.quiz_targets.final);
}

assert(humanFields.every((value) => !value.includes("em_naering_")), "Human-facing university content leaks technical emne IDs");
for (const phrase of forbiddenGeneric) assert(humanFields.every((value) => !value.includes(phrase)), `Generic template survived: ${phrase}`);
for (const level of ["introductory", "intermediate", "advanced"]) unique(extensions.map((row) => row.learning_activities[level]), `${level} learning activities`);
for (const field of ["introductory_product", "intermediate_product", "advanced_product"]) unique(extensions.map((row) => row.assessment[field]), `${field} assessment products`);
unique(extensions.map((row) => row.empirical_unit), "Empirical units");
unique(extensions.map((row) => row.calculation_exercise), "Calculation exercises");
unique(extensions.map((row) => row.scholarly_conflict), "Scholarly conflicts");

const exactReverse = (rows, idField, extensionField, label) => {
  for (const row of rows) {
    const expected = extensions.filter((ext) => ext[extensionField].includes(row[idField])).map((ext) => ext.emne_id);
    assert(expected.length > 0, `${label} ${row[idField]} is unused`);
    assert(sameSet(row.mapped_emne_ids, expected), `${label} ${row[idField]} has stale mapped_emne_ids`);
  }
};
exactReverse(theories, "theory_id", "theory_ids", "Theory");
exactReverse(methods, "method_id", "method_protocol_ids", "Method");
exactReverse(models, "model_id", "model_ids", "Model");
exactReverse(measures, "measure_id", "measure_ids", "Measure");

const requireIncludes = (emneId, field, values) => {
  const ext = byId.get(emneId);
  assert(ext, `Missing ${emneId}`);
  for (const value of values) assert(ext[field].includes(value), `${emneId} must include ${value} in ${field}`);
};
requireIncludes("em_naering_merkevare_og_status", "theory_ids", ["signalering_status_og_merkevare"]);
requireIncludes("em_naering_merkevare_og_status", "method_protocol_ids", ["merkevare_og_kundeverdianalyse"]);
requireIncludes("em_naering_merkevare_og_status", "model_ids", ["merkevarepremie_og_kundelivstidsverdi"]);
requireIncludes("em_naering_merkevare_og_status", "measure_ids", ["merkevarepremie", "kundelojalitet_churn"]);
requireIncludes("em_naering_kriser_boomer_omstilling", "theory_ids", ["finansiell_ustabilitet_og_gjeldssykluser"]);
requireIncludes("em_naering_kriser_boomer_omstilling", "method_protocol_ids", ["hendelsesstudie_og_finansiell_smitte"]);
requireIncludes("em_naering_eiendom_kapital_byutvikling", "theory_ids", ["urban_grunnrente_og_budrente"]);
requireIncludes("em_naering_eiendom_kapital_byutvikling", "method_protocol_ids", ["eiendoms_og_grunnrenteanalyse"]);
requireIncludes("em_naering_startup_grunder_innovasjon", "theory_ids", ["entreprenorskap_og_kreativ_destruksjon"]);
requireIncludes("em_naering_startup_grunder_innovasjon", "model_ids", ["realopsjon_og_runway"]);
requireIncludes("em_naering_digitalisering_plattformokonomi", "measure_ids", ["take_rate", "multihoming_rate"]);
requireIncludes("em_naering_produksjon_produktivitet", "method_protocol_ids", ["arbeidsprosessobservasjon", "tidsserie_og_kausalitetsvakt"]);
requireIncludes("em_naering_tjenesteyting_og_service", "theory_ids", ["emosjonelt_og_usynlig_arbeid"]);
requireIncludes("em_naering_usynlig_arbeid", "theory_ids", ["emosjonelt_og_usynlig_arbeid"]);

const production = byId.get("em_naering_produksjon_produktivitet");
assert(!production.method_protocol_ids.includes("markedsavgrensning_og_konkurranse"), "Production/productivity must not use market definition as its main production method");
assert(!production.method_protocol_ids.includes("elastisitetsanalyse"), "Production/productivity must not use elasticity as its main production method");
const brand = byId.get("em_naering_merkevare_og_status");
assert(!brand.theory_ids.includes("portefolje_risiko_og_avkastning"), "Brand/status must not use portfolio theory as a core theory");

const coverage = quality.coverage || {};
assert(coverage.core_emners === extensions.length, "Quality manifest has stale emne count");
assert(coverage.theory_cards === theories.length, "Quality manifest has stale theory count");
assert(coverage.method_protocols === methods.length, "Quality manifest has stale method count");
assert(coverage.models === models.length, "Quality manifest has stale model count");
assert(coverage.measures === measures.length, "Quality manifest has stale measure count");
assert(coverage.datasets === datasets.datasets.length, "Quality manifest has stale dataset count");

console.log(`OK: individually reviewed ${extensions.length} emners; ${theories.length} theories, ${methods.length} methods, ${models.length} models, ${measures.length} measures, ${datasets.datasets.length} datasets.`);
