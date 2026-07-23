import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const DATE = "2026-07-23";
const BATCH = 188;
const OLD_ID = "sagene_kvernhus";
const NEW_ID = "glads_molle";
const CANONICAL_SOURCE_OBJECT_ID = "geonorge-adresser-v1:0301:16161:10A";
const CANONICAL_LAT = 59.931850362845985;
const CANONICAL_LON = 10.757873019733754;
const CANONICAL_FILE = "data/places/natur/oslo/places_oslo_natur_akerselvarute/glads_molle.json";
const CANONICAL_EVIDENCE = "data/coordinate-evidence/oslo/natur/glads_molle.json";
const OLD_AGGREGATE = "data/places/naeringsliv/oslo/places_naeringsliv.json";
const OLD_SPLIT_MANIFEST = "data/places/naeringsliv/oslo/places_naeringsliv_manifest.json";
const OLD_SPLIT_INDEX = "data/places/naeringsliv/oslo/places_naeringsliv_index.json";
const OLD_SPLIT_FILE = "data/places/naeringsliv/oslo/places_naeringsliv/sagene_kvernhus.json";
const OLD_EVIDENCE = "data/coordinate-evidence/oslo/naeringsliv/sagene_kvernhus.json";
const OLD_QUIZ_SET = "data/quiz/naeringsliv/sagene_kvernhus_sets_merged.json";
const EVIDENCE_MANIFEST = "data/coordinate-evidence/manifest.json";
const REPORT_DIR = "reports/oslo-coordinate-control-batch-188-sagene-kvernhus-duplicate-retirement";
mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const replaceText = (path, replacer) => {
  const before = readFileSync(path, "utf8");
  const after = replacer(before);
  if (before === after) throw new Error(`Expected migration edit in ${path}, but content was unchanged`);
  writeFileSync(path, after, "utf8");
};
const replaceLegacyId = (path) => replaceText(path, (text) => text.replaceAll(OLD_ID, NEW_ID));

let protocol = readFileSync("docs/coordinates/coordinate-control-protocol.md", "utf8");
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1]));
const maxBatch = Math.max(...batches);
if (maxBatch !== 187) throw new Error(`Expected max coordinate batch 187, got ${maxBatch}`);

const canonical = readJson(CANONICAL_FILE);
if (canonical.id !== NEW_ID || canonical.name !== "Glads mølle") throw new Error("Canonical Glads mølle identity changed");
if (canonical.coordStatus !== "verified" || canonical.sourceObjectId !== CANONICAL_SOURCE_OBJECT_ID) throw new Error("Canonical Glads mølle coordinate contract changed");
if (Math.abs(canonical.lat - CANONICAL_LAT) > 1e-12 || Math.abs(canonical.lon - CANONICAL_LON) > 1e-12) throw new Error("Canonical Glads mølle coordinate changed");
const canonicalEvidence = readJson(CANONICAL_EVIDENCE);
if (canonicalEvidence.placeId !== NEW_ID || canonicalEvidence.evidenceStatus !== "applied_to_place") throw new Error("Canonical Glads mølle evidence is not applied");
if (!existsSync("data/quiz/historie/glads_molle_sets.json")) throw new Error("Canonical Glads mølle quiz package is missing");

const aggregate = readJson(OLD_AGGREGATE);
if (!Array.isArray(aggregate)) throw new Error("Legacy business aggregate is not an array");
const legacyRows = aggregate.filter((place) => place?.id === OLD_ID);
if (legacyRows.length !== 1) throw new Error(`Expected one ${OLD_ID} legacy row, got ${legacyRows.length}`);
const legacy = legacyRows[0];
if (legacy.coordStatus || legacy.sourceObjectId || legacy.locatorType) throw new Error("Legacy duplicate unexpectedly has a coordinate contract");
const oldEvidence = readJson(OLD_EVIDENCE);
if (oldEvidence.placeId !== OLD_ID || oldEvidence.evidenceStatus !== "needs_research" || oldEvidence.coordinateDecision !== "needs_identity_split") {
  throw new Error("Legacy duplicate evidence state changed");
}

const canonicalCivication = readJson("data/Civication/map/historyGoPlaceMapping.natur_akerselvarute.json");
const canonicalCivicationCount = Object.values(canonicalCivication.mappings ?? {}).filter((entry) => entry?.historyGoPlaceId === NEW_ID).length;
if (canonicalCivicationCount !== 1) throw new Error(`Expected one canonical Civication mapping for ${NEW_ID}, got ${canonicalCivicationCount}`);
for (const localePath of ["data/i18n/content/places/en.json", "data/i18n/content/places/es.json", "data/i18n/content/places/pt.json"]) {
  const locale = readJson(localePath);
  if (!locale[OLD_ID] || !locale[NEW_ID]) throw new Error(`${localePath} must contain both legacy and canonical translations before retirement`);
}

// Retarget genuine active relationships to the existing canonical place.
const retargetFiles = [
  "data/lesespor/lesespor_oslo_batch2.json",
  "data/natur/routes_patched_akerselva_knagger_baseline_v0_2_patched_groft.json",
  "data/people/by/oslo/people_by_oslo.json",
  "data/places/historie/oslo/places_historie/arbeidermuseet.json",
  "data/routes/historical/routes_historical_oslo.json"
];
for (const path of retargetFiles) replaceLegacyId(path);
replaceText("data/routes.json", (text) => text
  .replaceAll(OLD_ID, NEW_ID)
  .replaceAll("Sagene mølle og kvernhus", "Glads mølle")
  .replaceAll("Her startet byens industri – møller og sagbruk drevet av Akerselva.", "Bevart papirmølle fra 1736 ved Akerselva – et konkret spor etter den tidlige vannkraftbaserte industrien."));

// Update historical cross-evidence so it no longer describes the retired proxy as an active place.
replaceText("data/coordinate-evidence/oslo/historie/arbeidermuseet.json", (text) => text
  .replaceAll("`sagene_kvernhus` er et bredt og sammensatt industrihistorisk områdeanker", "`glads_molle` er det separate canonical stedet for Glads mølle i Sandakerveien 10A")
  .replaceAll("sagene_kvernhus", NEW_ID));

// Remove the obsolete business-category Civication mapping; the canonical nature-route mapping remains.
const businessCivicationPath = "data/Civication/map/historyGoPlaceMapping.naeringsliv.json";
const businessCivication = readJson(businessCivicationPath);
if (!businessCivication.mappings || typeof businessCivication.mappings !== "object") throw new Error("Business Civication mapping has no mappings object");
const oldMappingKeys = Object.entries(businessCivication.mappings)
  .filter(([, entry]) => entry?.historyGoPlaceId === OLD_ID)
  .map(([key]) => key);
if (oldMappingKeys.length !== 1) throw new Error(`Expected one legacy Civication mapping, got ${oldMappingKeys.length}`);
delete businessCivication.mappings[oldMappingKeys[0]];
writeJson(businessCivicationPath, businessCivication);

// Remove obsolete translated duplicate cards; canonical Glads mølle translations already exist.
const removedLocaleEntries = [];
for (const localePath of ["data/i18n/content/places/en.json", "data/i18n/content/places/es.json", "data/i18n/content/places/pt.json"]) {
  const locale = readJson(localePath);
  if (!locale[OLD_ID] || !locale[NEW_ID]) throw new Error(`Unexpected locale state in ${localePath}`);
  delete locale[OLD_ID];
  writeJson(localePath, locale);
  removedLocaleEntries.push(localePath);
}

// Retire duplicate quiz content rather than attach a second, lower-authority quiz package to Glads mølle.
if (!existsSync(OLD_QUIZ_SET)) throw new Error(`Missing expected duplicate quiz file ${OLD_QUIZ_SET}`);
rmSync(OLD_QUIZ_SET);
const flatQuizPath = "data/quiz/quiz_naeringsliv.json";
const flatQuiz = readJson(flatQuizPath);
if (!Array.isArray(flatQuiz)) throw new Error("quiz_naeringsliv.json is not an array");
const removedFlatQuiz = flatQuiz.filter((question) => question?.placeId === OLD_ID);
if (removedFlatQuiz.length !== 5) throw new Error(`Expected five legacy flat quiz questions, got ${removedFlatQuiz.length}`);
writeJson(flatQuizPath, flatQuiz.filter((question) => question?.placeId !== OLD_ID));

// Retire the duplicate business place and keep split artifacts consistent.
const remainingAggregate = aggregate.filter((place) => place?.id !== OLD_ID);
writeJson(OLD_AGGREGATE, remainingAggregate);
const splitManifest = readJson(OLD_SPLIT_MANIFEST);
if (!Array.isArray(splitManifest.places)) throw new Error("Business split manifest missing places[]");
const beforeSplitCount = splitManifest.places.length;
splitManifest.places = splitManifest.places
  .filter((row) => row?.id !== OLD_ID)
  .map((row) => ({ ...row, order: remainingAggregate.findIndex((place) => place.id === row.id) }));
if (beforeSplitCount - splitManifest.places.length !== 1 || splitManifest.places.some((row) => row.order < 0)) throw new Error("Could not retire/reindex legacy split manifest row");
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256(OLD_AGGREGATE);
splitManifest.generated_at = new Date().toISOString();
writeJson(OLD_SPLIT_MANIFEST, splitManifest);
const splitIndex = readJson(OLD_SPLIT_INDEX);
if (!Array.isArray(splitIndex) || splitIndex.filter((row) => row?.id === OLD_ID).length !== 1) throw new Error("Unexpected legacy split index state");
writeJson(OLD_SPLIT_INDEX, splitIndex.filter((row) => row?.id !== OLD_ID));
if (!existsSync(OLD_SPLIT_FILE)) throw new Error(`Missing expected split child ${OLD_SPLIT_FILE}`);
rmSync(OLD_SPLIT_FILE);

// Retire duplicate coordinate evidence; canonical Glads mølle evidence remains authoritative.
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (!Array.isArray(evidenceManifest.files)) throw new Error("Coordinate evidence manifest missing files[]");
const oldEvidenceEntry = "oslo/naeringsliv/sagene_kvernhus.json";
if (evidenceManifest.files.filter((entry) => entry === oldEvidenceEntry).length !== 1) throw new Error("Expected one legacy evidence manifest entry");
evidenceManifest.files = evidenceManifest.files.filter((entry) => entry !== oldEvidenceEntry);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);
rmSync(OLD_EVIDENCE);

// Register the retired ID in the established place-id alias guard.
const aliasGuardPath = "tools/check_place_id_aliases.mts";
replaceText(aliasGuardPath, (text) => {
  if (text.includes(`${OLD_ID}: '${NEW_ID}'`)) return text;
  const marker = "const aliases: AliasMap = {";
  const start = text.indexOf(marker);
  const end = text.indexOf("};", start);
  if (start < 0 || end < 0) throw new Error("Could not locate alias map in place-id alias guard");
  const beforeClose = text.slice(0, end).trimEnd();
  return `${beforeClose}, ${OLD_ID}: '${NEW_ID}' ${text.slice(end)}`;
});

// Remove stale generated coverage row if present.
const coveragePath = "docs/reports/stories_coverage_report.md";
if (existsSync(coveragePath)) {
  const coverage = readFileSync(coveragePath, "utf8");
  const next = coverage.split("\n").filter((line) => !line.includes(`\`${OLD_ID}\``)).join("\n");
  if (next !== coverage) writeFileSync(coveragePath, next, "utf8");
}

// Resolve the coordinate queue entry as a duplicate retirement, not a second physical coordinate.
const protocolLines = protocol.split("\n");
const unresolvedRows = protocolLines.map((line, index) => line.includes(`\`${OLD_ID}\``) ? index : -1).filter((index) => index >= 0);
if (unresolvedRows.length !== 1) throw new Error(`Expected exactly one unresolved protocol row for ${OLD_ID}, got ${unresolvedRows.length}`);
protocol = protocolLines.filter((_, index) => !unresolvedRows.includes(index)).join("\n");
protocol = `${protocol.trimEnd()}\n\n| ${BATCH} | \`${OLD_ID}\` | retired duplicate → \`${NEW_ID}\` | retired_duplicate | \`${CANONICAL_SOURCE_OBJECT_ID}\` |\n\nBatch ${BATCH} (${DATE}) pensjonerer \`${OLD_ID}\` som en duplikatproxy for den allerede canonical og verifiserte \`${NEW_ID}\` (Glads mølle). Collision-gaten dokumenterte at begge identitetene løste til samme fysiske bygg og samme eksakte Geonorge-adresseobjekt i Sandakerveien 10A. Reelle aktive relasjoner flyttes til \`${NEW_ID}\`; separat næringslivs-place, coordinate evidence, Civication-mapping, i18n-duplikater og duplikatquiz fjernes. \`${OLD_ID}\` registreres i den etablerte legacy place-id alias-guarden slik at ID-en ikke kan gjeninnføres i aktive place-/quiz-/Civication-data. Ingen ny fysisk koordinat opprettes og verified-totalen økes ikke.\n`;
writeFileSync("docs/coordinates/coordinate-control-protocol.md", protocol, "utf8");

// Hard-gate that no active JSON data still references the retired ID exactly or as an embedded legacy identifier.
const remainingLegacyDataRefs = [];
const walk = (path) => {
  if (!existsSync(path)) return;
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const name of readdirSync(path)) walk(join(path, name));
    return;
  }
  if (!path.endsWith(".json")) return;
  const text = readFileSync(path, "utf8");
  if (text.includes(OLD_ID)) remainingLegacyDataRefs.push(relative(process.cwd(), path).replaceAll("\\", "/"));
};
walk("data");
if (remainingLegacyDataRefs.length) throw new Error(`Legacy id still present in active data JSON: ${remainingLegacyDataRefs.join(", ")}`);

const aliasCheck = spawnSync("npm", ["run", "places:aliases:check"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/place-alias-check.log`, `${aliasCheck.stdout ?? ""}${aliasCheck.stderr ?? ""}`, "utf8");
if (aliasCheck.status !== 0) throw new Error(`Place alias guard failed with exit ${aliasCheck.status}`);

writeJson(`${REPORT_DIR}/batch-188-result.json`, {
  version: DATE,
  batch: BATCH,
  retiredPlaceId: OLD_ID,
  canonicalPlaceId: NEW_ID,
  status: "retired_duplicate",
  canonical: {
    name: canonical.name,
    sourceFile: CANONICAL_FILE,
    sourceObjectId: CANONICAL_SOURCE_OBJECT_ID,
    coordinate: { lat: canonical.lat, lon: canonical.lon },
    coordStatus: canonical.coordStatus
  },
  retiredLegacy: {
    name: legacy.name,
    coordinate: { lat: legacy.lat, lon: legacy.lon },
    evidenceStatus: oldEvidence.evidenceStatus
  },
  migration: {
    retargetedRelationshipFiles: [...retargetFiles, "data/routes.json"],
    removedCivicationMapping: oldMappingKeys[0],
    removedLocaleEntries,
    removedDuplicateQuizSet: OLD_QUIZ_SET,
    removedFlatQuizQuestionCount: removedFlatQuiz.length,
    removedDuplicatePlace: true,
    removedDuplicateEvidence: true,
    addedAliasGuard: `${OLD_ID} -> ${NEW_ID}`,
    remainingLegacyDataRefs
  },
  checks: {
    expectedPreviousBatch: 187,
    canonicalCoordinateUnchanged: true,
    canonicalEvidencePreserved: true,
    canonicalQuizPreserved: true,
    noActiveDataReferenceToLegacyId: true,
    noSecondPhysicalCoordinateCreated: true
  }
});

console.log(JSON.stringify({
  batch: BATCH,
  retiredPlaceId: OLD_ID,
  canonicalPlaceId: NEW_ID,
  canonicalSourceObjectId: CANONICAL_SOURCE_OBJECT_ID,
  removedFlatQuizQuestionCount: removedFlatQuiz.length,
  remainingLegacyDataRefs: remainingLegacyDataRefs.length,
  aliasCheckExitCode: aliasCheck.status
}, null, 2));
