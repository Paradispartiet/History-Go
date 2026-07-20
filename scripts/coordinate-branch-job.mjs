import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data");
const sourceRel = "places/kunst/oslo/places_kunst.json";
const sourcePath = path.join(DATA, sourceRel);
const sourceDir = path.dirname(sourcePath);
const splitManifestPath = path.join(sourceDir, "places_kunst_manifest.json");
const splitIndexPath = path.join(sourceDir, "places_kunst_index.json");
const placesManifestPath = path.join(DATA, "places", "manifest.json");
const evidenceManifestPath = path.join(DATA, "coordinate-evidence", "manifest.json");
const reportDir = path.join(ROOT, "reports", "visitoslo-oslo-east-audit-20260720");
const restoredIds = ["emanuel_vigeland_mausoleum", "framtidsbiblioteket_nordmarka"];

fs.mkdirSync(path.join(sourceDir, "places_kunst"), { recursive: true });
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const placesFrom = (value) => Array.isArray(value) ? value : Array.isArray(value?.places) ? value.places : value?.id ? [value] : [];
const siblingManifest = (file) => {
  const parsed = path.parse(file);
  return path.join(parsed.dir, `${parsed.name}_manifest${parsed.ext || ".json"}`);
};

function reverseGaps() {
  const result = [];
  for (const raw of readJson(placesManifestPath).files || []) {
    const entry = String(raw || "").trim();
    if (!entry) continue;
    const aggregatePath = path.join(DATA, entry);
    const splitPath = siblingManifest(aggregatePath);
    if (!fs.existsSync(splitPath)) continue;
    const aggregate = placesFrom(readJson(aggregatePath));
    const split = readJson(splitPath);
    const ids = new Set((split.places || []).map((row) => row?.id).filter(Boolean));
    const missing = aggregate.filter((place) => place?.id && !ids.has(place.id)).map((place) => ({ id: place.id, name: place.name, category: place.category }));
    if (missing.length) result.push({ manifestEntry: entry, splitManifest: path.relative(ROOT, splitPath).replaceAll("\\", "/"), aggregateCount: aggregate.length, splitCount: (split.places || []).length, missing });
  }
  return result;
}

const gapsBefore = reverseGaps();
const targetGap = gapsBefore.find((row) => row.manifestEntry === sourceRel);
if (!targetGap || targetGap.missing.length !== 2 || restoredIds.some((id) => !targetGap.missing.some((place) => place.id === id))) {
  throw new Error(`Unexpected Oslo art reverse gap: ${JSON.stringify(targetGap ?? null)}`);
}

const build = spawnSync("npm", ["run", "build:tools"], { stdio: "inherit" });
if (build.status !== 0) throw new Error("build:tools failed");
const finder = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Grimelundsveien 8 Oslo"], { encoding: "utf8" });
if (finder.stdout) process.stdout.write(finder.stdout);
if (finder.stderr) process.stderr.write(finder.stderr);
const emanuelAddressAttempt = JSON.parse(finder.stdout.trim());
if (emanuelAddressAttempt.status !== "needs_review") throw new Error(`Expected Grimelundsveien 8 to require review, got ${emanuelAddressAttempt.status}`);

const configs = {
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
    coordNote: "Grimelundsveien 8 ble kjørt gjennom den låste address-first-metoden, men Geonorge returnerte flere treff uten entydig match. Det eksisterende objektpunktet fra Wikidata Q17769549 beholdes derfor etter kryssjekk mot museets offisielle adresse og Wikidatas kobling til OSM-node 974731248. Punktet representerer Emanuel Vigelands mausoleum, ikke Slemdal som område.",
    finding: "Den normative Geonorge-kjøringen for Grimelundsveien 8 ga needs_review. Museets offisielle nettside bekrefter adressen, mens Wikidata Q17769549 gir objektkoordinaten og kobler identiteten til OSM-node 974731248.",
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
    finding: "Visit Norway publiserer besøkskoordinatene 59°59′10,8″N 10°41′48,7″E for Framtidsbiblioteket i Nordmarka; de er omregnet direkte til desimalgrader uten kartgjetting.",
  },
};

let aggregate = placesFrom(readJson(sourcePath));
aggregate = aggregate.map((place) => {
  const config = configs[place.id];
  if (!config) return place;
  const { finding, ...coordinateFields } = config;
  return { ...place, ...coordinateFields };
});
writeJson(sourcePath, aggregate);

const splitManifest = readJson(splitManifestPath);
const rows = new Map((splitManifest.places || []).map((row) => [row.id, row]));
for (const id of restoredIds) {
  const place = aggregate.find((candidate) => candidate.id === id);
  const file = `places_kunst/${id}.json`;
  const child = path.join(sourceDir, file);
  writeJson(child, place);
  rows.set(id, { id, name: place.name, category: place.category, file, order: 0, sha256: hash(child) });
}

splitManifest.places = aggregate.map((place, order) => {
  const row = { ...(rows.get(place.id) || {}) };
  const child = path.join(sourceDir, row.file || "");
  if (!row.file || !fs.existsSync(child)) throw new Error(`Missing split child for ${place.id}`);
  return { ...row, id: place.id, name: place.name, category: place.category, order, sha256: hash(child) };
});
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = hash(sourcePath);
splitManifest.generated_at = new Date().toISOString();
writeJson(splitManifestPath, splitManifest);

const splitIndex = aggregate.map((place) => {
  const row = {};
  for (const field of ["id","name","category","lat","lon","r","year","coordStatus","coordType","locatorType","sourceProvider","sourceObjectId","address","geocodeAccuracy","coordRole","coordSource","coordSourceId","coordSourceUrl","coordVerifiedAt","coordNote"]) {
    if (Object.prototype.hasOwnProperty.call(place, field)) row[field] = place[field];
  }
  row.file = splitManifest.places.find((candidate) => candidate.id === place.id).file;
  return row;
});
writeJson(splitIndexPath, splitIndex);

const evidenceManifest = readJson(evidenceManifestPath);
for (const id of restoredIds) {
  const place = aggregate.find((candidate) => candidate.id === id);
  const config = configs[id];
  const evidenceRel = `oslo/kunst/${id}.json`;
  writeJson(path.join(DATA, "coordinate-evidence", evidenceRel), {
    placeId: id,
    placeFile: `data/${sourceRel}`,
    evidenceStatus: "applied_to_place",
    coordinateDecision: "do_not_change_coordinates_yet",
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
    identity: { currentName: place.name, resolvedIdentity: place.name, identityStatus: "resolved", identityProblem: "", locatorTypeCandidate: place.locatorType, requiresSplit: false, splitReason: "" },
    requiredEvidence: ["stabil kildeidentitet for koordinatankeret", "eksisterende canonical identitet i aggregate place-kilden", "runtime-restaurering gjennom synkronisert split-manifest"],
    evidence: [{ sourceProvider: place.sourceProvider, sourceName: place.coordSource, sourceUrl: place.coordSourceUrl, sourceObjectId: place.sourceObjectId, sourceQuality: "stable_source_identity_plus_existing_canonical_identity", finding: `${config.finding} Den eksisterende canonical recorden ble skjult fra runtime av en stale sibling split-manifest og gjenopprettes uten ny place-id.`, canVerifyCoordinate: true, reason: place.coordNote }],
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

const gapsAfter = reverseGaps();
const beforeCount = gapsBefore.reduce((sum, row) => sum + row.missing.length, 0);
const afterCount = gapsAfter.reduce((sum, row) => sum + row.missing.length, 0);
if (afterCount !== 0) throw new Error(`Reverse aggregate-to-split audit still finds ${afterCount} missing record(s): ${JSON.stringify(gapsAfter)}`);

writeJson(path.join(reportDir, "split-manifest-reverse-coverage-final.json"), {
  generatedAt: new Date().toISOString(),
  targetManifestEntry: sourceRel,
  restoredPlaceIds: restoredIds,
  gapsBefore,
  gapsAfter,
  beforeCount,
  afterCount,
  emanuelAddressAttempt,
  coordinateSources: Object.fromEntries(restoredIds.map((id) => [id, { sourceProvider: configs[id].sourceProvider, sourceObjectId: configs[id].sourceObjectId, lat: configs[id].lat, lon: configs[id].lon }])),
});
fs.writeFileSync(path.join(reportDir, "split-manifest-reverse-coverage-final.md"), `# Final reverse split-manifest coverage repair\n\nDate: 2026-07-20\n\nThe Oslo art sibling split manifest had four rows while its active aggregate contained six canonical places, hiding \`emanuel_vigeland_mausoleum\` and \`framtidsbiblioteket_nordmarka\` from runtime. Both are restored as split children. Emanuel's address-first lookup correctly remains needs-review, so its documented object coordinate is retained after official-address and linked-OSM identity cross-check. Framtidsbiblioteket uses Visit Norway's published visitor coordinate.\n\nReverse aggregate-to-split gaps before: **${beforeCount}**.\n\nReverse aggregate-to-split gaps after: **${afterCount}**.\n`, "utf8");

console.log(`Restored ${restoredIds.join(", ")} to split/runtime materialization.`);
console.log(`Emanuel address-first status: ${emanuelAddressAttempt.status}.`);
console.log(`Reverse aggregate-to-split gaps before: ${beforeCount}; after: ${afterCount}.`);
