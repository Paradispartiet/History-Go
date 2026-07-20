import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_ROOT = path.join(ROOT, "data");
const placesManifestPath = path.join(DATA_ROOT, "places", "manifest.json");
const evidenceManifestPath = path.join(DATA_ROOT, "coordinate-evidence", "manifest.json");
const targetRel = "places/historie/oslo/places_historie_added_batch_01.json";
const targetPath = path.join(DATA_ROOT, targetRel);
const targetDir = path.dirname(targetPath);
const splitManifestPath = path.join(targetDir, "places_historie_added_batch_01_manifest.json");
const splitIndexPath = path.join(targetDir, "places_historie_added_batch_01_index.json");
const childDir = path.join(targetDir, "places_historie_added_batch_01");
const reportDir = path.join(ROOT, "reports", "visitoslo-oslo-east-audit-20260720");

fs.mkdirSync(childDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
function splitManifestPathFor(sourcePath) {
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}_manifest${parsed.ext || ".json"}`);
}
function placesFrom(data) {
  if (Array.isArray(data)) return data.filter((value) => value && typeof value === "object");
  if (data && typeof data === "object" && Array.isArray(data.places)) return data.places;
  if (data && typeof data === "object" && typeof data.id === "string") return [data];
  return [];
}
function parseFinderOutput(output) {
  const text = output.trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    if (start >= 0) return JSON.parse(text.slice(start));
    throw new Error("Address-first finder did not return JSON.");
  }
}
function runAddressFinder(address) {
  const output = execFileSync(
    process.execPath,
    ["dist/tools/address-first-coordinate-finder.mjs", "--address", address],
    { encoding: "utf8" },
  );
  process.stdout.write(output);
  const result = parseFinderOutput(output);
  if (!result?.ok || !result?.coordinate || result.status !== "verified_candidate") {
    throw new Error(`Address-first finder failed for ${address}: ${result?.status ?? "unknown"}`);
  }
  return result;
}

function reverseGapAudit() {
  const manifest = readJson(placesManifestPath);
  const rows = [];
  for (const entryRaw of Array.isArray(manifest.files) ? manifest.files : []) {
    const entry = String(entryRaw || "").trim();
    if (!entry) continue;
    const sourcePath = path.join(DATA_ROOT, entry);
    const smPath = splitManifestPathFor(sourcePath);
    if (!fs.existsSync(smPath)) continue;
    const aggregate = placesFrom(readJson(sourcePath));
    const splitManifest = readJson(smPath);
    const splitRows = Array.isArray(splitManifest.places) ? splitManifest.places : [];
    const splitIds = new Set(splitRows.map((row) => String(row?.id || "").trim()).filter(Boolean));
    const missing = aggregate
      .filter((place) => typeof place.id === "string" && place.id.trim() && !splitIds.has(place.id.trim()))
      .map((place) => ({ id: place.id, name: place.name, category: place.category }));
    if (missing.length) {
      rows.push({
        manifestEntry: entry,
        splitManifest: path.relative(ROOT, smPath).split(path.sep).join("/"),
        aggregateCount: aggregate.length,
        splitCount: splitRows.length,
        missing,
      });
    }
  }
  return rows;
}

const gapsBefore = reverseGapAudit();
const targetGapBefore = gapsBefore.find((row) => row.manifestEntry === targetRel);
if (!targetGapBefore) {
  throw new Error("Expected stale split gap for places_historie_added_batch_01 was not found.");
}

const expectedMissing = new Set(["villa_stenersen", "st_hallvard_kirke_kloster"]);
const actualMissing = new Set(targetGapBefore.missing.map((place) => place.id));
for (const id of expectedMissing) {
  if (!actualMissing.has(id)) throw new Error(`Expected missing split child ${id} was not found.`);
}

execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const coordinateResults = {
  villa_stenersen: runAddressFinder("Tuengen allé 10C Oslo"),
  st_hallvard_kirke_kloster: runAddressFinder("Enerhauggata 4 Oslo"),
};

let aggregate = placesFrom(readJson(targetPath));
const coordinateNotes = {
  villa_stenersen:
    "Offisiell adressekoordinat fra Geonorge Adresser API for Tuengen allé 10C, OSLO. Punktet brukes som display-marker for Villa Stenersen og erstatter den eldre kildekoordinaten etter den låste address-first-metoden.",
  st_hallvard_kirke_kloster:
    "Offisiell adressekoordinat fra Geonorge Adresser API for Enerhauggata 4, OSLO. Punktet brukes som display-marker for St. Hallvard kirke og kloster og erstatter den eldre publiserte punktkoordinaten etter den låste address-first-metoden.",
};

aggregate = aggregate.map((place) => {
  const result = coordinateResults[place.id];
  if (!result) return place;
  const coordinate = result.coordinate;
  const next = { ...place };
  delete next.lng;
  next.lat = coordinate.lat;
  next.lon = coordinate.lon;
  next.r = place.id === "st_hallvard_kirke_kloster" ? 80 : 70;
  next.locatorType = "building";
  next.sourceProvider = "official_address";
  next.sourceObjectId = result.sourceObjectId;
  next.address = coordinate.address;
  next.geocodeAccuracy = "rooftop";
  next.coordRole = "display_marker";
  next.coordType = "address_point";
  next.coordStatus = "verified";
  next.coordSource = "geonorge_adresser_v1";
  next.coordSourceId = result.sourceObjectId;
  next.coordSourceUrl = result.sourceUrl;
  next.coordVerifiedAt = "2026-07-20";
  next.coordNote = coordinateNotes[place.id];
  return next;
});
writeJson(targetPath, aggregate);

const splitManifest = readJson(splitManifestPath);
const existingRowsById = new Map(
  (Array.isArray(splitManifest.places) ? splitManifest.places : [])
    .map((row) => [String(row?.id || "").trim(), row])
    .filter(([id]) => id),
);

for (const place of aggregate) {
  if (!place?.id || existingRowsById.has(place.id)) continue;
  const childRel = `places_historie_added_batch_01/${place.id}.json`;
  const childPath = path.join(targetDir, childRel);
  writeJson(childPath, place);
  existingRowsById.set(place.id, {
    id: place.id,
    name: place.name,
    category: place.category,
    file: childRel,
    order: 0,
    sha256: sha256(childPath),
  });
}

const orderedRows = aggregate.map((place, order) => {
  const row = { ...existingRowsById.get(place.id) };
  if (!row.file) throw new Error(`Split manifest has no child file for ${place.id}.`);
  const childPath = path.join(targetDir, row.file);
  if (!fs.existsSync(childPath)) throw new Error(`Missing split child file ${childPath}.`);
  row.id = place.id;
  row.name = place.name;
  row.category = place.category;
  row.order = order;
  row.sha256 = sha256(childPath);
  return row;
});

splitManifest.place_count = orderedRows.length;
splitManifest.source_sha256 = sha256(targetPath);
splitManifest.generated_at = new Date().toISOString();
splitManifest.places = orderedRows;
writeJson(splitManifestPath, splitManifest);

const existingIndex = fs.existsSync(splitIndexPath) ? readJson(splitIndexPath) : [];
const indexById = new Map((Array.isArray(existingIndex) ? existingIndex : []).map((row) => [row.id, row]));
const splitIndex = aggregate.map((place) => {
  const row = { ...(indexById.get(place.id) || {}) };
  const manifestRow = orderedRows.find((candidate) => candidate.id === place.id);
  const fields = [
    "id", "name", "category", "lat", "lon", "r", "year", "coordStatus", "coordType",
    "locatorType", "sourceProvider", "sourceObjectId", "geocodeAccuracy", "coordRole",
    "coordSource", "coordSourceId", "coordSourceUrl", "coordVerifiedAt", "coordNote"
  ];
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(place, field)) row[field] = place[field];
  }
  row.file = manifestRow.file;
  return row;
});
writeJson(splitIndexPath, splitIndex);

function appendEvidenceManifest(entry) {
  const manifest = readJson(evidenceManifestPath);
  if (!Array.isArray(manifest.files)) throw new Error("Coordinate evidence manifest has no files array.");
  if (!manifest.files.includes(entry)) manifest.files.push(entry);
  writeJson(evidenceManifestPath, manifest);
}

for (const placeId of Object.keys(coordinateResults)) {
  const place = aggregate.find((candidate) => candidate.id === placeId);
  const result = coordinateResults[placeId];
  const evidenceRel = `oslo/historie/${placeId}.json`;
  const evidencePath = path.join(DATA_ROOT, "coordinate-evidence", evidenceRel);
  const evidence = {
    placeId,
    placeFile: `data/${targetRel.replace(/\.json$/, `/${placeId}.json`).replace("places_historie_added_batch_01/", "places_historie_added_batch_01/")}`,
    evidenceStatus: "applied_to_place",
    coordinateDecision: "do_not_change_coordinates_yet",
    currentCoordinate: {
      lat: place.lat,
      lon: place.lon,
      r: place.r,
      coordStatus: place.coordStatus,
      coordSource: place.coordSource,
      coordType: place.coordType,
      coordNote: place.coordNote,
    },
    identity: {
      currentName: place.name,
      resolvedIdentity: place.name,
      identityStatus: "resolved",
      identityProblem: "",
      locatorTypeCandidate: "building",
      requiresSplit: false,
      splitReason: "",
    },
    requiredEvidence: [
      "entydig offisielt adressepunkt",
      "eksisterende canonical identitet i aggregate place-kilden",
      "runtime-restaurering gjennom synkronisert split-manifest",
    ],
    evidence: [
      {
        sourceProvider: "official_address",
        sourceName: "geonorge_adresser_v1",
        sourceUrl: result.sourceUrl,
        sourceObjectId: result.sourceObjectId,
        sourceQuality: "official_address_plus_existing_canonical_identity",
        finding: `Geonorge gir ett tydelig adressetreff for ${result.query}. Den eksisterende canonical recorden ble skjult fra runtime av en stale sibling split-manifest og gjenopprettes uten å opprette ny place-id.`,
        canVerifyCoordinate: true,
        reason: place.coordNote,
      },
    ],
    addressCandidates: [
      {
        address: result.query,
        sourceProvider: "official_address",
        sourceObjectId: result.sourceObjectId,
        canApplyToPlace: true,
      },
    ],
    sourceObjectCandidates: [
      {
        sourceProvider: "official_address",
        sourceObjectId: result.sourceObjectId,
        canApplyToPlace: true,
      },
    ],
    geometryCandidates: [],
    coordinateCandidates: [
      {
        lat: place.lat,
        lon: place.lon,
        coordRole: "display_marker",
        canApplyToPlace: true,
      },
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: "",
      nextAction: "Restored the existing canonical place to split/runtime materialization with a verified address-first coordinate.",
    },
    notes: [
      "This is a runtime restoration of an existing canonical place, not a new place creation.",
      place.coordNote,
    ],
  };
  writeJson(evidencePath, evidence);
  appendEvidenceManifest(evidenceRel);
}

const gapsAfter = reverseGapAudit();
const targetGapAfter = gapsAfter.find((row) => row.manifestEntry === targetRel);
if (targetGapAfter) {
  throw new Error(`Target split manifest still has aggregate-only places: ${targetGapAfter.missing.map((place) => place.id).join(", ")}`);
}

const report = {
  generatedAt: new Date().toISOString(),
  targetManifestEntry: targetRel,
  diagnosis: "Sibling split manifests override aggregate files in the runtime index builder. The split manifest had 6 rows while the aggregate later grew to 8 places, hiding Villa Stenersen and St. Hallvard kirke og kloster from runtime.",
  restoredPlaceIds: ["villa_stenersen", "st_hallvard_kirke_kloster"],
  gapsBefore,
  gapsAfter,
  coordinateResults: Object.fromEntries(
    Object.entries(coordinateResults).map(([id, result]) => [id, {
      query: result.query,
      sourceObjectId: result.sourceObjectId,
      coordinate: result.coordinate,
    }]),
  ),
};
writeJson(path.join(reportDir, "split-manifest-reverse-coverage-repair.json"), report);

const markdown = `# Split-manifest reverse coverage repair\n\nDate: 2026-07-20\n\n## Diagnosis\n\nThe runtime index builder prefers a valid sibling split manifest over the aggregate source. \`places_historie_added_batch_01_manifest.json\` contained 6 rows, while the active aggregate source later grew to 8 records. As a result, \`villa_stenersen\` and \`st_hallvard_kirke_kloster\` remained canonical in the aggregate but disappeared from runtime.\n\n## Repair\n\n- restored split child: \`villa_stenersen\`\n- restored split child: \`st_hallvard_kirke_kloster\`\n- updated the sibling split manifest and split index to preserve aggregate order\n- reverified both building addresses through the locked Geonorge address-first method\n- added coordinate evidence for both restored canonical places\n\n## Reverse aggregate-to-split gaps\n\nBefore repair: **${gapsBefore.reduce((sum, row) => sum + row.missing.length, 0)} missing aggregate records across ${gapsBefore.length} split manifests**.\n\nAfter this targeted repair: **${gapsAfter.reduce((sum, row) => sum + row.missing.length, 0)} missing aggregate records across ${gapsAfter.length} split manifests**.\n\nThe JSON report lists any remaining gaps so the audit tool can be strengthened without guessing.\n`;
fs.writeFileSync(path.join(reportDir, "split-manifest-reverse-coverage-repair.md"), markdown, "utf8");

console.log(`Restored split/runtime materialization for Villa Stenersen and St. Hallvard kirke og kloster.`);
console.log(`Reverse split gaps before: ${gapsBefore.reduce((sum, row) => sum + row.missing.length, 0)}; after: ${gapsAfter.reduce((sum, row) => sum + row.missing.length, 0)}.`);
