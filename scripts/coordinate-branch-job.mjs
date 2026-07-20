import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data");
const targetRel = "places/kunst/oslo/places_kunst.json";
const targetPath = path.join(DATA, targetRel);
const targetDir = path.dirname(targetPath);
const splitManifestPath = path.join(targetDir, "places_kunst_manifest.json");
const splitIndexPath = path.join(targetDir, "places_kunst_index.json");
const placeManifestPath = path.join(DATA, "places", "manifest.json");
const evidenceManifestPath = path.join(DATA, "coordinate-evidence", "manifest.json");
const reportDir = path.join(ROOT, "reports", "visitoslo-oslo-east-audit-20260720");
const restoredIds = ["emanuel_vigeland_mausoleum", "framtidsbiblioteket_nordmarka"];

fs.mkdirSync(path.join(targetDir, "places_kunst"), { recursive: true });
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
  const text = String(output || "").trim();
  try { return JSON.parse(text); } catch {
    const start = text.indexOf("{");
    if (start >= 0) return JSON.parse(text.slice(start));
    throw new Error("Address finder did not return JSON.");
  }
}

function runAddressAttempt(address) {
  const attempt = spawnSync(
    process.execPath,
    ["dist/tools/address-first-coordinate-finder.mjs", "--address", address],
    { encoding: "utf8" },
  );
  if (attempt.stdout) process.stdout.write(attempt.stdout);
  if (attempt.stderr) process.stderr.write(attempt.stderr);
  return { exitCode: attempt.status, result: parseFinderOutput(attempt.stdout) };
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
    const missing = aggregate
      .filter((place) => place?.id && !splitIds.has(place.id))
      .map((place) => ({ id: place.id, name: place.name, category: place.category }));
    if (missing.length) gaps.push({
      manifestEntry: entry,
      splitManifest: path.relative(ROOT, splitPath).replaceAll("\\", "/"),
      aggregateCount: aggregate.length,
      splitCount: (split.places || []).length,
      missing,
    });
  }
  return gaps;
}

const gapsBefore = reverseGapAudit();
const targetGap = gapsBefore.find((row) => row.manifestEntry === targetRel);
if (!targetGap) throw new Error("Expected stale Oslo art split gap was not found.");
if (targetGap.missing.length !== 2 || restoredIds.some((id) => !targetGap.missing.some((place) => place.id === id))) {
  throw new Error(`Unexpected art split gap: ${targetGap.missing.map((place) => place.id).join(", ")}`);
}

const build = spawnSync("npm", ["run", "build:tools"], { stdio: "inherit" });
if (build.status !== 0) throw new Error("build:tools failed.");
const emanuelAddressAttempt = runAddressAttempt("Grimelundsveien 8 Oslo");
if (emanuelAddressAttempt.result?.status !== "needs_review") {
  throw new Error(`Expected ambiguous address-first result for Grimelundsveien 8, got ${emanuelAddressAttempt.result?.status ?? "unknown"}.`);
}

const coordinateConfigs = {
  emanuel_vigeland_mausoleum: {
    lat: 59.947028,
    lon: 10.692694,
    r: 60,
    locatorType: "poi",
    sourceProvider: "manual_research",
    sourceObjectId: "wikidata:Q17769549",
    address: { street: "Grimelundsveien", number: "8", postcode: "0775", city: "Oslo", country: "NO" },
    geocodeAccuracy: "geometric_center",
    coordRole: "display_marker",
    coordType: "linked_object_coordinate",
    coordStatus: "verified",
    coordSource: "Wikidata Q17769549 coordinate cross-checked with the official Emanuel Vigeland Museum address and linked OSM node 974731248",
    coordSourceId: "wikidata:Q17769549",
    coordSourceUrl: "https://www.wikidata.org/wiki/Q17769549",
    coordVerifiedAt: "2026-07-20",
    coordNote: "Grimelundsveien 8 ble kjørt gjennom den låste address-first-metoden, men Geonorge returnerte flere treff uten entydig match. Det eksisterende objektpunktet fra Wikidata Q17769549 beholdes derfor som dokumentert museumspunkt etter kryssjekk mot museets offisielle adresse og Wikidatas kobling til det navngitte OSM-objektet node 974731248. Punktet representerer Emanuel Vigelands mausoleum, ikke Slemdal som område.",
    evidenceFinding: "Den normative Geonorge-kjøringen for Grimelundsveien 8 ga needs_review på grunn av flere uentydige treff. Museets offisielle nettside bekrefter adressen, og Wikidata Q17769549 gir den eksisterende objektkoordinaten og kobler identiteten til OSM-node 974731248.",
  },
  framtidsbiblioteket_nordmarka: {
    lat: 59.98633333333333,
    lon: 10.69686111111111,
    r: 120,
    locatorType: "poi",
    sourceProvider: "manual_research",
    sourceObjectId: "visitnorway:future-library-forest-nordmarka",
    geocodeAccuracy: "geometric_center",
    coordRole: "display_marker",
    coordType: "published_visitor_coordinate",
    coordStatus: "verified",
    coordSource: "Visit Norway published visitor coordinates for Framtidsbiblioteket i Nordmarka",
    coordSourceId: "visitnorway:future-library-forest-nordmarka",
    coordSourceUrl: "https://www.visitnorway.no/aktiviteter-og-attraksjoner/kunst-kultur/litteratur/framtidsbiblioteket-i-nordmarka/",
    coordVerifiedAt: "2026-07-20",
    coordNote: "Publiserte besøkskoordinater fra Visit Norway for Framtidsbibliotekets kunstskog i Nordmarka, 59°59′10,8″N 10°41′48,7″E, omregnet direkte til desimalgrader. Punktet representerer besøksstedet i Future Library-skogen, ikke Nordmarka som helhet eller Silent Room i Deichman Bjørvika.",
    evidenceFinding: "Visit Norway publiserer eksakte besøkskoordinater 59°59′10,8″N 10°41′48,7″E for Framtidsbiblioteket i Nordmarka; koordinatene er omregnet direkte til desimalgrader uten kartgjetting.",
  },
};

let aggregate = placesFrom(readJson(targetPath));
aggregate = aggregate.map((place) => coordinateConfigs[place.id] ? { ...place, ...coordinateConfigs[place.id], evidenceFinding: undefined } : place);
for (const place of aggregate) delete place.evidenceFinding;
writeJson(targetPath, aggregate);

const splitManifest = readJson(splitManifestPath);
const rowById = new Map((splitManifest.places || []).map((row) => [row.id, row]));
for (const id of restoredIds) {
  const place = aggregate.find((candidate) => candidate.id === id);
  const childRel = `places_kunst/${id}.json`;
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
  for (const field of ["id","name","category","lat","lon","r","year","coordStatus","coordType","locatorType","sourceProvider","sourceObjectId","address","geocodeAccuracy","coordRole","coordSource","coordSourceId","coordSourceUrl","coordVerifiedAt","coordNote"]) {
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
  const config = coordinateConfigs[id];
  const evidenceRel = `oslo/kunst/${id}.json`;
  writeJson(path.join(DATA, "coordinate-evidence", evidenceRel), {
    placeId: id,
    placeFile: `data/${targetRel}`,
    evidenceStatus: "applied_to_place",
    coordinateDecision: "do_not_change_coordinates_yet",
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: place.name, resolvedIdentity: place.name, identityStatus: "resolved", identityProblem: "", locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: "" },
    requiredEvidence: ["stabil kildeidentitet for koordinatankeret", "eksisterende canonical identitet i aggregate place-kilden", "runtime-restaurering gjennom synkronisert split-manifest"],
    evidence: [{
      sourceProvider: place.sourceProvider,
      sourceName: place.coordSource,
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId,
      sourceQuality: "stable_source_identity_plus_existing_canonical_identity",
      finding: `${config.evidenceFinding} Den eksisterende canonical recorden ble skjult fra runtime av en stale sibling split-manifest og gjenopprettes uten å opprette ny place-id.`,
      canVerifyCoordinate: true,
      reason: place.coordNote,
    }],
    addressCandidates: place.address ? [{ address: `${place.address.street} ${place.address.number} Oslo`, sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }] : [],
    sourceObjectCandidates: [{ sourceProvider: place.sourceProvider, sourceObjectId: place.sourceObjectId, canApplyToPlace: true }],
    geometryCandidates: [],
    coordinateCandidates: [{ lat: place.lat, lon: place.lon, coordRole: place.coordRole, canApplyToPlace: true }],
    decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Restored the existing canonical place to split/runtime materialization with a v1-compatible verified coordinate source." },
    notes: ["This is a runtime restoration of an existing canonical place, not a new place creation.", place.coordNote],
  });
  if (!evidenceManifest.files.includes(evidenceRel)) evidenceManifest.files.push(evidenceRel);
}
writeJson(evidenceManifestPath, evidenceManifest);

const gapsAfter = reverseGapAudit();
const beforeCount = gapsBefore.reduce((sum, row) => sum + row.missing.length, 0);
const afterCount = gapsAfter.reduce((sum, row) => sum + row.missing.length, 0);
if (afterCount !== 0) throw new Error(`Reverse aggregate-to-split audit still finds ${afterCount} missing record(s): ${gapsAfter.flatMap((row) => row.missing.map((place) => `${row.manifestEntry}#${place.id}`)).join(", ")}`);

writeJson(path.join(reportDir, "split-manifest-reverse-coverage-final.json"), {
  generatedAt: new Date().toISOString(),
  targetManifestEntry: targetRel,
  diagnosis: "The runtime index builder prefers valid sibling split manifests. The Oslo art split manifest had four rows while the aggregate later grew to six records, hiding Emanuel Vigelands mausoleum and Framtidsbiblioteket – Nordmarka from runtime.",
  restoredPlaceIds: restoredIds,
  gapsBefore,
  gapsAfter,
  beforeCount,
  afterCount,
  emanuelAddressFirstAttempt,
  coordinateSources: Object.fromEntries(restoredIds.map((id) => [id, { sourceProvider: coordinateConfigs[id].sourceProvider, sourceObjectId: coordinateConfigs[id].sourceObjectId, lat: coordinateConfigs[id].lat, lon: coordinateConfigs[id].lon }])),
});
fs.writeFileSync(path.join(reportDir, "split-manifest-reverse-coverage-final.md"), `# Final reverse split-manifest coverage repair\n\nDate: 2026-07-20\n\nThe Oslo art sibling split manifest had four rows while its active aggregate contained six canonical places. That silently removed \`emanuel_vigeland_mausoleum\` and \`framtidsbiblioteket_nordmarka\` from the generated runtime index.\n\nBoth existing canonical places are restored as split children and the split manifest/index are synchronized. The normative address-first lookup for Emanuel Vigelands mausoleum returned an ambiguous needs-review result for Grimelundsveien 8, so the documented Wikidata object coordinate is retained after official-address and linked-OSM identity cross-check rather than forcing an arbitrary address candidate. Framtidsbiblioteket uses Visit Norway's published visitor coordinate for the Future Library forest.\n\nReverse aggregate-to-split gaps before this repair: **${beforeCount}**.\n\nReverse aggregate-to-split gaps after this repair: **${afterCount}**.\n`, "utf8");

console.log(`Restored ${restoredIds.join(", ")} to split/runtime materialization.`);
console.log(`Emanuel address-first status: ${emanuelAddressAttempt.result.status}.`);
console.log(`Reverse aggregate-to-split gaps before: ${beforeCount}; after: ${afterCount}.`);
