import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const DATE = "2026-07-23";
const BATCH = 188;
const PLACE_ID = "sagene_kvernhus";
const AGGREGATE_FILE = "data/places/naeringsliv/oslo/places_naeringsliv.json";
const SPLIT_FILE = "data/places/naeringsliv/oslo/places_naeringsliv/sagene_kvernhus.json";
const SPLIT_MANIFEST = "data/places/naeringsliv/oslo/places_naeringsliv_manifest.json";
const SPLIT_INDEX = "data/places/naeringsliv/oslo/places_naeringsliv_index.json";
const EVIDENCE_FILE = "data/coordinate-evidence/oslo/naeringsliv/sagene_kvernhus.json";
const REPORT_DIR = "reports/oslo-coordinate-control-batch-188-glads-molle";
const OSLO_KOMMUNE_URL = "https://magasin.oslo.kommune.no/byplan/sagene-et-unikt-omrade";
const BYLEKSIKON_URL = "https://oslobyleksikon.no/side/Glads_m%C3%B8lle";
mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const parseFinderJson = (stdout) => {
  const text = String(stdout ?? "").trim();
  const start = text.indexOf("{");
  if (start < 0) return null;
  try { return JSON.parse(text.slice(start)); } catch { return null; }
};
const distanceMeters = (a, b, c, d) => {
  const rad = (x) => x * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(c - a);
  const dLon = rad(d - b);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(q));
};
const extractPlaces = (root) => {
  const out = [];
  const seen = new Set();
  const visit = (value, depth = 0) => {
    if (depth > 7 || value == null) return;
    if (Array.isArray(value)) { for (const item of value) visit(item, depth + 1); return; }
    if (typeof value !== "object") return;
    if (typeof value.id === "string" && typeof value.name === "string" && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
      if (!seen.has(value.id)) { seen.add(value.id); out.push(value); }
      return;
    }
    for (const item of Object.values(value)) visit(item, depth + 1);
  };
  visit(root);
  return out;
};

let protocol = readFileSync("docs/coordinates/coordinate-control-protocol.md", "utf8");
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1]));
const maxBatch = Math.max(...batches);
if (maxBatch !== 187) throw new Error(`Expected max Oslo coordinate batch 187, got ${maxBatch}`);

const aggregate = readJson(AGGREGATE_FILE);
if (!Array.isArray(aggregate)) throw new Error(`${AGGREGATE_FILE} is not an array`);
const aggregateIndex = aggregate.findIndex((place) => place?.id === PLACE_ID);
if (aggregateIndex < 0 || aggregate.filter((place) => place?.id === PLACE_ID).length !== 1) throw new Error(`Expected exactly one ${PLACE_ID} in aggregate`);
const oldPlace = aggregate[aggregateIndex];
if (oldPlace.coordStatus || oldPlace.sourceObjectId || oldPlace.locatorType) throw new Error(`${PLACE_ID} unexpectedly already has coordinate contract metadata`);

const oldEvidence = readJson(EVIDENCE_FILE);
if (oldEvidence.placeId !== PLACE_ID || oldEvidence.evidenceStatus !== "needs_research" || oldEvidence.coordinateDecision !== "needs_identity_split") {
  throw new Error("Unexpected pre-production evidence state for sagene_kvernhus");
}

const build = spawnSync("npm", ["run", "build:tools"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/build-tools.log`, `${build.stdout ?? ""}${build.stderr ?? ""}`, "utf8");
if (build.status !== 0) throw new Error(`build failed ${build.status}`);

const finder = spawnSync("node", ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Sandakerveien 10A Oslo"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/address-first.log`, `${finder.stdout ?? ""}${finder.stderr ?? ""}`, "utf8");
const found = parseFinderJson(finder.stdout);
if (finder.status !== 0 || found?.status !== "verified_candidate") throw new Error(`Address-first failed: ${found?.status ?? "parse_error"}`);
if (found.sourceObjectId !== "geonorge-adresser-v1:0301:16161:10A") throw new Error(`Unexpected Geonorge object ${found.sourceObjectId}`);
const lat = Number(found.coordinate?.lat);
const lon = Number(found.coordinate?.lon);
if (Math.abs(lat - 59.931850362845985) > 1e-10 || Math.abs(lon - 10.757873019733754) > 1e-10) throw new Error(`Coordinate drifted to ${lat}, ${lon}`);

const currentPlaces = extractPlaces(readJson("data/places/places_index.json"));
const nearby = currentPlaces
  .filter((place) => place.id !== PLACE_ID)
  .map((place) => ({ id: place.id, name: place.name, distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2)) }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters)
  .slice(0, 10);
if (nearby[0]?.distanceMeters <= 3) throw new Error(`Canonical collision with ${nearby[0].id} at ${nearby[0].distanceMeters}m`);

const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Sandakerveien 10A, 0473 Oslo. Oslo kommune og Oslo byleksikon identifiserer den bevarte bygningen på adressen som Glads mølle, tidligere Nedre Papirmølle, oppført i 1736. Punktet brukes som canonical display-marker for den konkrete bevarte mølle- og fabrikkbygningen, ikke som generelt områdeanker for all historisk industri på Sagene.";
const place = {
  ...oldPlace,
  name: "Glads mølle",
  lat,
  lon,
  r: 60,
  year: 1736,
  desc: "Bevart mølle- og fabrikkbygning fra 1736 ved Akerselva, tidligere kjent som Nedre Papirmølle.",
  popupDesc: "Glads mølle ved Akerselva er den bevarte bygningen etter Nedre Papirmølle, oppført i 1736. Bygningen representerer et tidlig lag av produksjonshistorien på Sagene, der vannkraften fra elva la grunnlaget for møller og senere industri.\n\nI History Go er stedet avgrenset til den konkrete bevarte bygningen i Sandakerveien 10A. Det bredere industrilandskapet langs Akerselva er kontekst, men koordinaten markerer ikke hele Sagene som mølle- og industriområde.",
  quiz_profile: {
    ...(oldPlace.quiz_profile ?? {}),
    place_type: "bygning",
    subtype: "historisk_molle_og_tidlig_fabrikk",
    signature_features: [
      "Glads mølle, tidligere Nedre Papirmølle",
      "bevart fabrikkbygning fra 1736 ved Akerselva",
      "konkret spor etter den tidlige vannkraftbaserte produksjonen på Sagene"
    ],
    notes: "Spør stedet som den konkrete bevarte Glads mølle og som inngang til tidlig industrihistorie langs Akerselva, ikke som et generelt Sagene-industriområde."
  },
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: found.sourceObjectId,
  address: { street: "Sandakerveien", number: "10A", postcode: "0473", city: "Oslo", country: "NO" },
  geocodeAccuracy: "rooftop",
  coordRole: "display_marker",
  coordType: "address_point",
  coordStatus: "verified",
  coordSource: "geonorge_adresser_v1",
  coordSourceId: found.sourceObjectId,
  coordSourceUrl: found.sourceUrl,
  coordVerifiedAt: DATE,
  coordNote,
  externalLinks: [
    { type: "official", label: "Oslo kommune – Sagene, et unikt område", url: OSLO_KOMMUNE_URL, lang: "nb", verifiedAt: DATE },
    { type: "reference", label: "Oslo byleksikon – Glads mølle", url: BYLEKSIKON_URL, lang: "nb", verifiedAt: DATE }
  ]
};

const evidence = {
  schemaVersion: "1.0",
  placeId: PLACE_ID,
  placeFile: AGGREGATE_FILE,
  evidenceStatus: "applied_to_place",
  coordinateDecision: "do_not_change_coordinates_yet",
  currentCoordinate: { lat, lon, r: 60, coordStatus: "verified", coordSource: "geonorge_adresser_v1", coordType: "address_point", coordNote },
  identity: {
    currentName: "Glads mølle",
    resolvedIdentity: "Glads mølle (tidligere Nedre Papirmølle), den bevarte mølle- og fabrikkbygningen fra 1736 i Sandakerveien 10A",
    identityStatus: "resolved",
    identityProblem: "Den gamle recorden blandet flere mølle-, sagbruks- og industrifunksjoner på Sagene. Source-first-kontrollen avgrenser canonical stedet til ett navngitt og bevart fysisk anlegg.",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: "Den brede legacy-identiteten er erstattet av ett entydig fysisk anlegg; ingen separat Hjula- eller områdekopi opprettes."
  },
  requiredEvidence: ["entydig navngitt mølle", "avgrenset fysisk bygning", "eksakt offisiell adressekoordinat", "overlap-audit mot øvrige Akerselva-industristeder"],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "Geonorge Adresser API v1 – Sandakerveien 10A",
      sourceUrl: found.sourceUrl,
      sourceObjectId: found.sourceObjectId,
      sourceQuality: "official_address",
      finding: "Ett tydelig offisielt adressepunkt for Sandakerveien 10A, 0473 Oslo.",
      canVerifyCoordinate: true,
      reason: coordNote
    },
    {
      sourceProvider: "municipality",
      sourceName: "Oslo kommune Byplan – Sagene, et unikt område",
      sourceUrl: OSLO_KOMMUNE_URL,
      sourceObjectId: "oslo-kommune:byplan:sagene-glads-molle",
      sourceQuality: "official_municipal_identity",
      finding: "Kommunens omtale identifiserer Glads mølle som bygningen fra 1736 og dokumenterer den som et bevart tidlig industrispor på Sagene.",
      canVerifyCoordinate: false,
      reason: "Dokumenterer identitet og historisk fysisk scope; Geonorge brukes som koordinatkilde."
    },
    {
      sourceProvider: "manual_research",
      sourceName: "Oslo byleksikon – Glads mølle",
      sourceUrl: BYLEKSIKON_URL,
      sourceObjectId: "oslo-byleksikon:glads-molle",
      sourceQuality: "historical_identity_reference",
      finding: "Identifiserer Glads mølle som Sandakerveien 10A, tidligere Nedre Papirmølle, oppført i 1736.",
      canVerifyCoordinate: false,
      reason: "Kryssjekker navn, adresse og historisk identitet."
    }
  ],
  addressCandidates: [{ address: "Sandakerveien 10A, 0473 Oslo", sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [
    { sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: "municipality", sourceObjectId: "oslo-kommune:byplan:sagene-glads-molle", canApplyToPlace: false },
    { sourceProvider: "manual_research", sourceObjectId: "oslo-byleksikon:glads-molle", canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [{ lat, lon, coordRole: "display_marker", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Sandakerveien 10A er anvendt som canonical display-marker for Glads mølle." },
  notes: [
    coordNote,
    `Nærmeste andre canonical marker ved write-time var ${nearby[0]?.id ?? "ingen"} på ${nearby[0]?.distanceMeters ?? "n/a"} meter; ingen markør lå innen 3 meter.`,
    `Legacy-koordinaten ${oldPlace.lat}, ${oldPlace.lon} er erstattet fordi den representerte et bredt og sammenblandet område fremfor den løste fysiske identiteten.`
  ]
};

aggregate[aggregateIndex] = place;
writeJson(AGGREGATE_FILE, aggregate);
writeJson(SPLIT_FILE, place);
writeJson(EVIDENCE_FILE, evidence);

const splitManifest = readJson(SPLIT_MANIFEST);
if (!Array.isArray(splitManifest.places)) throw new Error(`${SPLIT_MANIFEST} missing places[]`);
const manifestRow = splitManifest.places.find((row) => row?.id === PLACE_ID);
if (!manifestRow || splitManifest.places.filter((row) => row?.id === PLACE_ID).length !== 1) throw new Error(`Expected one ${PLACE_ID} split-manifest row`);
manifestRow.name = place.name;
manifestRow.category = place.category;
manifestRow.sha256 = sha256(SPLIT_FILE);
splitManifest.source_sha256 = sha256(AGGREGATE_FILE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

const splitIndex = readJson(SPLIT_INDEX);
if (!Array.isArray(splitIndex)) throw new Error(`${SPLIT_INDEX} is not an array`);
const indexPosition = splitIndex.findIndex((row) => row?.id === PLACE_ID);
if (indexPosition < 0 || splitIndex.filter((row) => row?.id === PLACE_ID).length !== 1) throw new Error(`Expected one ${PLACE_ID} split-index row`);
const indexFile = splitIndex[indexPosition].file ?? "places_naeringsliv/sagene_kvernhus.json";
const indexKeys = ["id", "name", "category", "lat", "lon", "r", "year", "coordStatus", "coordType", "coordSource", "coordVerifiedAt", "coordNote", "locatorType", "sourceProvider", "sourceObjectId", "address", "geocodeAccuracy", "coordRole"];
const indexRow = { file: indexFile };
for (const key of indexKeys) if (place[key] !== undefined) indexRow[key] = place[key];
splitIndex[indexPosition] = indexRow;
writeJson(SPLIT_INDEX, splitIndex);

const protocolLines = protocol.split("\n");
const unresolvedRows = protocolLines.map((line, index) => line.includes("`sagene_kvernhus`") ? index : -1).filter((index) => index >= 0);
if (unresolvedRows.length !== 1) throw new Error(`Expected exactly one unresolved protocol row for ${PLACE_ID}, got ${unresolvedRows.length}`);
protocol = protocolLines.filter((_, index) => !unresolvedRows.includes(index)).join("\n");
protocol = `${protocol.trimEnd()}\n\n| ${BATCH} | \`${PLACE_ID}\` | Glads mølle | verified | \`${found.sourceObjectId}\` |\n\nBatch ${BATCH} (${DATE}) løser \`${PLACE_ID}\` ved å avgrense den tidligere brede «Sagene mølle og kvernhus»-recorden til den konkrete bevarte Glads mølle, tidligere Nedre Papirmølle. Oslo kommune og Oslo byleksikon dokumenterer identiteten og historikken, mens Geonorge gir ett entydig offisielt adressepunkt for Sandakerveien 10A. Punktet brukes som display-marker for bygningen, ikke som områdeanker for hele Sagene eller Akerselvas samlede industrihistorie.\n`;
writeFileSync("docs/coordinates/coordinate-control-protocol.md", protocol, "utf8");

writeJson(`${REPORT_DIR}/batch-188-result.json`, {
  version: DATE,
  batch: BATCH,
  placeId: PLACE_ID,
  status: "verified_by_identity_narrowing_and_official_address",
  old: { name: oldPlace.name, coordinate: { lat: oldPlace.lat, lon: oldPlace.lon }, r: oldPlace.r, evidenceStatus: oldEvidence.evidenceStatus },
  current: { name: place.name, coordinate: { lat, lon }, r: place.r, sourceObjectId: found.sourceObjectId, coordStatus: place.coordStatus },
  nearestCanonicalBeforeWrite: nearby[0] ?? null,
  checks: { expectedPreviousBatch: 187, exactAddressObjectLocked: true, aggregateAndSplitChildUpdated: true, splitManifestUpdated: true, splitIndexUpdated: true, evidencePromoted: true, noOtherCanonicalWithin3m: true, unresolvedProtocolRowRemoved: true }
});
console.log(JSON.stringify({ batch: BATCH, placeId: PLACE_ID, name: place.name, sourceObjectId: found.sourceObjectId, coordinate: { lat, lon }, nearestCanonicalBeforeWrite: nearby[0] ?? null }, null, 2));
