import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data");
const targetRel = "places/historie/oslo/places_historie_added_batch_01.json";
const targetPath = path.join(DATA, targetRel);
const targetDir = path.dirname(targetPath);
const splitManifestPath = path.join(targetDir, "places_historie_added_batch_01_manifest.json");
const splitIndexPath = path.join(targetDir, "places_historie_added_batch_01_index.json");
const childDir = path.join(targetDir, "places_historie_added_batch_01");
const placeManifestPath = path.join(DATA, "places", "manifest.json");
const evidenceManifestPath = path.join(DATA, "coordinate-evidence", "manifest.json");
const reportDir = path.join(ROOT, "reports", "visitoslo-oslo-east-audit-20260720");
const restoredIds = ["villa_stenersen", "st_hallvard_kirke_kloster"];

fs.mkdirSync(childDir, { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const placesFrom = (data) => Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : data?.id ? [data] : [];
const splitManifestPathFor = (sourcePath) => {
  const parsed = path.parse(sourcePath);
  return path.join(parsed.dir, `${parsed.name}_manifest${parsed.ext || ".json"}`);
};

function parseFinderOutput(output) {
  const text = output.trim();
  try { return JSON.parse(text); } catch {
    const start = text.indexOf("{");
    if (start >= 0) return JSON.parse(text.slice(start));
    throw new Error("Address finder did not return JSON.");
  }
}

function findAddress(address) {
  const output = execFileSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", address], { encoding: "utf8" });
  process.stdout.write(output);
  const result = parseFinderOutput(output);
  if (!result?.ok || result.status !== "verified_candidate" || !result.coordinate) {
    throw new Error(`Address-first lookup failed for ${address}: ${result?.status ?? "unknown"}`);
  }
  return result;
}

function reverseGapAudit() {
  const manifest = readJson(placeManifestPath);
  const gaps = [];
  for (const entryRaw of manifest.files || []) {
    const entry = String(entryRaw || "").trim();
    if (!entry) continue;
    const sourcePath = path.join(DATA, entry);
    const splitPath = splitManifestPathFor(sourcePath);
    if (!fs.existsSync(splitPath)) continue;
    const aggregate = placesFrom(readJson(sourcePath));
    const split = readJson(splitPath);
    const splitIds = new Set((split.places || []).map((row) => String(row?.id || "").trim()).filter(Boolean));
    const missing = aggregate.filter((place) => place?.id && !splitIds.has(place.id)).map((place) => ({ id: place.id, name: place.name, category: place.category }));
    if (missing.length) gaps.push({ manifestEntry: entry, splitManifest: path.relative(ROOT, splitPath).replaceAll("\\", "/"), aggregateCount: aggregate.length, splitCount: (split.places || []).length, missing });
  }
  return gaps;
}

const gapsBefore = reverseGapAudit();
const targetGap = gapsBefore.find((row) => row.manifestEntry === targetRel);
if (!targetGap) throw new Error("Expected stale split gap was not found.");
for (const id of restoredIds) {
  if (!targetGap.missing.some((place) => place.id === id)) throw new Error(`Expected aggregate-only place ${id} was not found.`);
}

execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const coordinateResults = {
  villa_stenersen: findAddress("Tuengen allé 10C Oslo"),
  st_hallvard_kirke_kloster: findAddress("Enerhauggata 4 Oslo"),
};
const notes = {
  villa_stenersen: "Offisiell adressekoordinat fra Geonorge Adresser API for Tuengen allé 10C, OSLO. Punktet brukes som display-marker for Villa Stenersen og erstatter den eldre kildekoordinaten etter den låste address-first-metoden.",
  st_hallvard_kirke_kloster: "Offisiell adressekoordinat fra Geonorge Adresser API for Enerhauggata 4, OSLO. Punktet brukes som display-marker for St. Hallvard kirke og kloster og erstatter den eldre publiserte punktkoordinaten etter den låste address-first-metoden.",
};

let aggregate = placesFrom(readJson(targetPath));
aggregate = aggregate.map((place) => {
  const result = coordinateResults[place.id];
  if (!result) return place;
  const coordinate = result.coordinate;
  return {
    ...place,
    lat: coordinate.lat,
    lon: coordinate.lon,
    r: place.id === "st_hallvard_kirke_kloster" ? 80 : 70,
    locatorType: "building",
    sourceProvider: "official_address",
    sourceObjectId: result.sourceObjectId,
    address: coordinate.address,
    geocodeAccuracy: "rooftop",
    coordRole: "display_marker",
    coordType: "address_point",
    coordStatus: "verified",
    coordSource: "geonorge_adresser_v1",
    coordSourceId: result.sourceObjectId,
    coordSourceUrl: result.sourceUrl,
    coordVerifiedAt: "2026-07-20",
    coordNote: notes[place.id],
  };
});
writeJson(targetPath, aggregate);

const splitManifest = readJson(splitManifestPath);
const rowById = new Map((splitManifest.places || []).map((row) => [row.id, row]));
for (const id of restoredIds) {
  const place = aggregate.find((candidate) => candidate.id === id);
  if (!place) throw new Error(`Aggregate place ${id} is missing.`);
  const childRel = `places_historie_added_batch_01/${id}.json`;
  const childPath = path.join(targetDir, childRel);
  writeJson(childPath, place);
  rowById.set(id, { id, name: place.name, category: place.category, file: childRel, order: 0, sha256: sha256(childPath) });
}

splitManifest.places = aggregate.map((place, order) => {
  const row = { ...(rowById.get(place.id) || {}) };
  if (!row.file) throw new Error(`No split child is registered for ${place.id}.`);
  const childPath = path.join(targetDir, row.file);
  if (!fs.existsSync(childPath)) throw new Error(`Missing split child ${childPath}.`);
  return { ...row, id: place.id, name: place.name, category: place.category, order, sha256: sha256(childPath) };
});
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256(targetPath);
splitManifest.generated_at = new Date().toISOString();
writeJson(splitManifestPath, splitManifest);

const splitIndex = aggregate.map((place) => {
  const manifestRow = splitManifest.places.find((row) => row.id === place.id);
  const row = {};
  for (const field of ["id","name","category","lat","lon","r","year","coordStatus","coordType","locatorType","sourceProvider","sourceObjectId","geocodeAccuracy","coordRole","coordSource","coordSourceId","coordSourceUrl","coordVerifiedAt","coordNote"]) {
    if (Object.prototype.hasOwnProperty.call(place, field)) row[field] = place[field];
  }
  row.file = manifestRow.file;
  return row;
});
writeJson(splitIndexPath, splitIndex);

const evidenceManifest = readJson(evidenceManifestPath);
if (!Array.isArray(evidenceManifest.files)) throw new Error("Coordinate evidence manifest has no files array.");
for (const id of restoredIds) {
  const place = aggregate.find((candidate) => candidate.id === id);
  const result = coordinateResults[id];
  const evidenceRel = `oslo/historie/${id}.json`;
  const evidencePath = path.join(DATA, "coordinate-evidence", evidenceRel);
  writeJson(evidencePath, {
    placeId: id,
    placeFile: `data/${targetRel}`,
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
    requiredEvidence: ["entydig offisielt adressepunkt", "eksisterende canonical identitet i aggregate place-kilden", "runtime-restaurering gjennom synkronisert split-manifest"],
    evidence: [{
      sourceProvider: "official_address",
      sourceName: "geonorge_adresser_v1",
      sourceUrl: result.sourceUrl,
      sourceObjectId: result.sourceObjectId,
      sourceQuality: "official_address_plus_existing_canonical_identity",
      finding: `Geonorge gir ett tydelig adressetreff for ${result.query}. Den eksisterende canonical recorden ble skjult fra runtime av en stale sibling split-manifest og gjenopprettes uten å opprette ny place-id.`,
      canVerifyCoordinate: true,
      reason: place.coordNote,
    }],
    addressCandidates: [{ address: result.query, sourceProvider: "official_address", sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
    sourceObjectCandidates: [{ sourceProvider: "official_address", sourceObjectId: result.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: "display_marker", canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Restored the existing canonical place to split/runtime materialization with a verified address-first coordinate." },
    notes: ["This is a runtime restoration of an existing canonical place, not a new place creation.", place.coordNote],
  });
  if (!evidenceManifest.files.includes(evidenceRel)) evidenceManifest.files.push(evidenceRel);
}
writeJson(evidenceManifestPath, evidenceManifest);

const gapsAfter = reverseGapAudit();
if (gapsAfter.some((row) => row.manifestEntry === targetRel)) throw new Error("Target split manifest still omits aggregate records.");

const beforeCount = gapsBefore.reduce((sum, row) => sum + row.missing.length, 0);
const afterCount = gapsAfter.reduce((sum, row) => sum + row.missing.length, 0);
writeJson(path.join(reportDir, "split-manifest-reverse-coverage-repair.json"), {
  generatedAt: new Date().toISOString(),
  targetManifestEntry: targetRel,
  diagnosis: "The runtime index builder prefers valid sibling split manifests. This split manifest had six rows while the aggregate later grew to eight places, hiding Villa Stenersen and St. Hallvard kirke og kloster from runtime.",
  restoredPlaceIds: restoredIds,
  gapsBefore,
  gapsAfter,
  coordinateResults: Object.fromEntries(Object.entries(coordinateResults).map(([id, result]) => [id, { query: result.query, sourceObjectId: result.sourceObjectId, coordinate: result.coordinate }])),
});
fs.writeFileSync(path.join(reportDir, "split-manifest-reverse-coverage-repair.md"), `# Split-manifest reverse coverage repair\n\nDate: 2026-07-20\n\nThe runtime index builder prefers a valid sibling split manifest over its aggregate source. The Oslo history split manifest had six rows while the aggregate later grew to eight records, hiding \`villa_stenersen\` and \`st_hallvard_kirke_kloster\` from runtime.\n\nBoth existing canonical places are restored as split children, the split manifest and split index are synchronized, and both coordinates are reverified through the locked Geonorge address-first method.\n\nReverse aggregate-to-split gaps before this repair: **${beforeCount}** across **${gapsBefore.length}** split manifests.\n\nReverse aggregate-to-split gaps after this targeted repair: **${afterCount}** across **${gapsAfter.length}** split manifests.\n`, "utf8");

console.log("Restored Villa Stenersen and St. Hallvard kirke og kloster to split/runtime materialization.");
console.log(`Reverse aggregate-to-split gaps before: ${beforeCount}; after: ${afterCount}.`);
