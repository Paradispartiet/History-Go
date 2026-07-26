#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const readText = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(readText(relativePath));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const frameworkPath =
  "data/fag/naeringsliv/universitetsramme_okonomi_og_naeringsliv_v1.json";
const tracksPath =
  "data/fag/naeringsliv/universitetsspor_okonomi_og_naeringsliv_v1.json";
const mappingPath =
  "data/fag/naeringsliv/universitetsmapping_okonomi_og_naeringsliv_v1.json";

const framework = readJson(frameworkPath);
const tracksDocument = readJson(tracksPath);
const mappingDocument = readJson(mappingPath);
const emners = readJson("data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json");
const categoryContract = readJson("data/categories/category_contract.json");
const badge = readJson("data/badges/naeringsliv.json");
const quizProfile = readJson(
  "data/fag/naeringsliv/supersetQUIZMAL_naeringsliv.json"
);
const categoriesSource = readText("js/core/categories.ts");
const knowledgeRedirect = readText("knowledge/knowledge_naeringsliv.html");

assert(framework.subject_id === "naeringsliv", "Framework subject_id must remain naeringsliv");
assert(
  framework.display_name === "Økonomi og næringsliv",
  "Framework display name must be Økonomi og næringsliv"
);
assert(
  framework.technical_contract?.category_id === "naeringsliv" &&
    framework.technical_contract?.required_emne_prefix === "em_naering_",
  "Stable technical IDs are not preserved"
);
assert(
  framework.canonical_files?.discipline_tracks ===
    "universitetsspor_okonomi_og_naeringsliv_v1.json" &&
    framework.canonical_files?.emne_track_mapping ===
    "universitetsmapping_okonomi_og_naeringsliv_v1.json",
  "Framework does not register its canonical track and mapping files"
);

const tracks = tracksDocument.tracks || {};
assert(Object.keys(tracks).length === 6, "University framework must define six tracks");

const mappings = mappingDocument.mapping || [];
const mappedIds = mappings.map((row) => row.emne_id);
assert(mappingDocument.core_emne_count === 36, "Mapping metadata must declare 36 core emners");
assert(mappings.length === 36, "University framework must map all 36 core emners");
assert(new Set(mappedIds).size === 36, "University framework contains duplicate emne mappings");
assert(
  mappedIds.every((id) => String(id).startsWith("em_naering_")),
  "Every mapped emne must use the em_naering_ prefix"
);
assert(
  mappings.every((row) => tracks[row.primary_track_id]),
  "Every emne mapping must point to a defined primary track"
);
assert(
  mappings.every((row) => (row.secondary_track_ids || []).every((trackId) => tracks[trackId])),
  "Every secondary emne mapping must point to a defined track"
);

const canonicalCoreIds = emners
  .filter((row) => row?.emne_role !== "field_module" && row?.module_type !== "cross_domain_field_module")
  .map((row) => row.emne_id);
assert(canonicalCoreIds.length === 36, "Canonical emne file must contain 36 core emners");
assert(
  JSON.stringify([...new Set(mappedIds)].sort()) === JSON.stringify([...new Set(canonicalCoreIds)].sort()),
  "University mapping must match the canonical 36 core emners exactly"
);
assert(
  Object.keys(tracks).every((trackId) => mappings.some((row) => row.primary_track_id === trackId)),
  "Every university track must be used as a primary track"
);

for (const [trackId, track] of Object.entries(tracks)) {
  assert(track.title, `${trackId} is missing title`);
  assert(track.purpose, `${trackId} is missing purpose`);
  assert((track.core_concepts || []).length >= 5, `${trackId} has too few core concepts`);
  assert((track.method_requirements || []).length >= 3, `${trackId} has too few method requirements`);
  assert((track.theory_requirements || []).length >= 3, `${trackId} has too few theory requirements`);
  assert((track.quantitative_core || []).length >= 3, `${trackId} has too little quantitative core`);
  assert((track.representative_emne_ids || []).every((id) => mappedIds.includes(id)), `${trackId} references an unknown representative emne`);
}

assert(
  framework.method_protocol_required_fields?.includes("operasjonalisering") &&
    framework.method_protocol_required_fields?.includes("feilkilder_og_usikkerhet") &&
    framework.method_protocol_required_fields?.includes("konklusjonsgrense"),
  "Method protocol does not require operationalisation, uncertainty and conclusion limits"
);
assert(
  framework.theory_card_required_fields?.includes("central_works") &&
    framework.theory_card_required_fields?.includes("competing_theories") &&
    framework.theory_card_required_fields?.includes("major_criticisms"),
  "Theory cards do not require works, competitors and criticism"
);

assert(
  categoryContract.labels?.naeringsliv === "Økonomi og næringsliv",
  "Category contract display label is not updated"
);
assert(
  categoryContract.aliases?.["økonomi"] === "naeringsliv" &&
    categoryContract.aliases?.["næringsliv"] === "naeringsliv",
  "Category contract does not preserve economics/business display aliases"
);
assert(badge.id === "naeringsliv", "Badge ID must remain naeringsliv");
assert(badge.name === "Økonomi og næringsliv", "Badge name is not updated");
assert(quizProfile.categoryId === "naeringsliv", "Quiz profile categoryId must remain naeringsliv");
assert(
  quizProfile.title === "Økonomi og næringsliv",
  "Quiz profile display title is not updated"
);
assert(
  quizProfile.governance?.academic_framework === frameworkPath,
  "Quiz profile does not register the university framework"
);
assert(
  quizProfile.normal_opening_profile?.sets === 2 &&
    quizProfile.normal_opening_profile?.questions_per_set === 7,
  "The normal first 2×7 questions were not preserved"
);
assert(
  categoriesSource.includes('id: "naeringsliv", name: "Økonomi og næringsliv"'),
  "Runtime category registry display name is not updated"
);
assert(
  categoriesSource.includes('"Næringsliv"') &&
    categoriesSource.includes('"Økonomi"'),
  "Runtime category aliases are missing"
);
assert(
  knowledgeRedirect.includes("Knowledge for Økonomi og næringsliv"),
  "Knowledge redirect display text is not updated"
);

console.log(
  `OK: Økonomi og næringsliv university framework validates (${mappings.length} emners, ${Object.keys(tracks).length} tracks).`
);
