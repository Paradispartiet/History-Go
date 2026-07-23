import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const DATE = "2026-07-23";
const BATCH = 187;
const PLACE_ID = "akershus_energi";
const LEGACY_FILE = "data/places/naeringsliv/oslo/places_naeringsliv.json";
const PLACE_FILE = "data/places/naeringsliv/akershus/akershus_energipark.json";
const EVIDENCE_FILE = "data/coordinate-evidence/akershus/naeringsliv/akershus_energi.json";
const REPORT_DIR = "reports/oslo-coordinate-control-batch-187-akershus-energipark-relocation";
const OFFICIAL_IDENTITY_URL = "https://www.mynewsdesk.com/no/akershus-energi/pressreleases/skal-investere-naermere-400-millioner-kroner-for-aa-gi-mer-varme-til-lillestroem-3365257";
mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path, value) => {
  mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
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
const appendManifest = (path, item) => {
  const manifest = readJson(path);
  if (!Array.isArray(manifest.files)) throw new Error(`${path} has no files array`);
  if (!manifest.files.includes(item)) manifest.files.push(item);
  writeJson(path, manifest);
};

if (existsSync(PLACE_FILE)) throw new Error(`${PLACE_FILE} already exists`);
if (existsSync(EVIDENCE_FILE)) throw new Error(`${EVIDENCE_FILE} already exists`);

const protocolPath = "docs/coordinates/coordinate-control-protocol.md";
let protocol = readFileSync(protocolPath, "utf8");
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1]));
const maxBatch = Math.max(...batches);
if (maxBatch !== 186) throw new Error(`Expected max Oslo coordinate batch 186, got ${maxBatch}`);

const legacy = readJson(LEGACY_FILE);
if (!Array.isArray(legacy)) throw new Error(`${LEGACY_FILE} is not an array`);
const matches = legacy.filter((place) => place?.id === PLACE_ID);
if (matches.length !== 1) throw new Error(`Expected exactly one legacy ${PLACE_ID}, got ${matches.length}`);
const oldPlace = matches[0];
if (oldPlace.coordStatus || oldPlace.sourceObjectId || oldPlace.locatorType) throw new Error(`${PLACE_ID} unexpectedly already has coordinate contract metadata`);

const build = spawnSync("npm", ["run", "build:tools"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/build-tools.log`, `${build.stdout ?? ""}${build.stderr ?? ""}`, "utf8");
if (build.status !== 0) throw new Error(`build failed ${build.status}`);

const finder = spawnSync("node", ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Rolf Olsens vei 50 2007 Kjeller"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/address-first.log`, `${finder.stdout ?? ""}${finder.stderr ?? ""}`, "utf8");
const found = parseFinderJson(finder.stdout);
if (finder.status !== 0 || found?.status !== "verified_candidate") throw new Error(`Address-first failed: ${found?.status ?? "parse_error"}`);
if (found.sourceObjectId !== "geonorge-adresser-v1:3205:11500:50") throw new Error(`Unexpected Geonorge object ${found.sourceObjectId}`);
const lat = Number(found.coordinate?.lat);
const lon = Number(found.coordinate?.lon);
if (Math.abs(lat - 59.97151165737936) > 1e-10 || Math.abs(lon - 11.072630258843615) > 1e-10) throw new Error(`Coordinate drifted to ${lat}, ${lon}`);

const places = extractPlaces(readJson("data/places/places_index.json"));
const nearby = places
  .filter((place) => place.id !== PLACE_ID)
  .map((place) => ({ id: place.id, name: place.name, distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2)) }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters)
  .slice(0, 10);
if (nearby[0]?.distanceMeters <= 3) throw new Error(`Canonical collision with ${nearby[0].id} at ${nearby[0].distanceMeters}m`);

const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Rolf Olsens vei 50, 2007 Kjeller. Akershus Energis egen omtale dokumenterer Akershus EnergiPark som det fysiske fjernvarmeanlegget som åpnet i 2011. Punktet brukes som canonical display-marker for energiparken; det er ikke konsernets kontoradresse i Brogata og ikke den tidligere udokumenterte Oslo-markøren.";
const place = {
  ...oldPlace,
  name: "Akershus EnergiPark",
  lat,
  lon,
  r: 100,
  year: 2011,
  desc: "Fjernvarmeanlegg på Kjeller som produserer lokal fornybar varme til Lillestrøm-området.",
  popupDesc: "Akershus EnergiPark på Kjeller åpnet i 2011 og er et fysisk produksjonsanlegg for fjernvarme. Anlegget inngår i energiforsyningen til Lillestrøm-området og bruker lokale fornybare energikilder i varmeproduksjonen.\n\nI History Go er stedet et konkret eksempel på den moderne byens energiinfrastruktur: produksjon, distribusjon og tekniske systemer som arbeider kontinuerlig i bakgrunnen for å holde bygninger og bydeler varme. Canonical-stedet representerer selve energiparken på Rolf Olsens vei 50, ikke Akershus Energis administrative hovedkontor.",
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: found.sourceObjectId,
  address: { street: "Rolf Olsens vei", number: "50", postcode: "2007", city: "Kjeller", country: "NO" },
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
    { type: "official", label: "Akershus Energi – Akershus EnergiPark og fjernvarme i Lillestrøm", url: OFFICIAL_IDENTITY_URL, lang: "nb", verifiedAt: DATE }
  ]
};

const evidence = {
  schemaVersion: "1.0",
  placeId: PLACE_ID,
  placeFile: PLACE_FILE,
  evidenceStatus: "applied_to_place",
  coordinateDecision: "do_not_change_coordinates_yet",
  currentCoordinate: { lat, lon, r: 100, coordStatus: "verified", coordSource: "geonorge_adresser_v1", coordType: "address_point", coordNote },
  identity: {
    currentName: "Akershus EnergiPark",
    resolvedIdentity: "Akershus EnergiPark, det fysiske fjernvarmeanlegget på Rolf Olsens vei 50 på Kjeller",
    identityStatus: "resolved",
    identityProblem: "Legacy-recorden het Akershus Energi Varme og var plassert på en udokumentert Oslo-koordinat som ikke representerte det identifiserte fysiske anlegget.",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: ["eksakt fysisk anleggsidentitet", "offisiell adressekoordinat", "geografisk korrigering fra Oslo til Lillestrøm"],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "Geonorge Adresser API v1 – Rolf Olsens vei 50",
      sourceUrl: found.sourceUrl,
      sourceObjectId: found.sourceObjectId,
      sourceQuality: "official_address",
      finding: "Ett tydelig offisielt adressepunkt for Rolf Olsens vei 50, 2007 Kjeller i Lillestrøm kommune.",
      canVerifyCoordinate: true,
      reason: coordNote
    },
    {
      sourceProvider: "manual_research",
      sourceName: "Akershus Energi – omtale av Akershus EnergiPark og fjernvarme i Lillestrøm",
      sourceUrl: OFFICIAL_IDENTITY_URL,
      sourceObjectId: "akershus-energi:energipark-lillestrom-2025",
      sourceQuality: "official_institution_identity",
      finding: "Akershus Energis egen omtale identifiserer Akershus EnergiPark som fjernvarmeanlegget som åpnet i 2011 og leverer varme i Lillestrøm-området.",
      canVerifyCoordinate: false,
      reason: "Dokumenterer fysisk institusjonsidentitet og anleggets funksjon; Geonorge brukes som koordinatkilde."
    }
  ],
  addressCandidates: [{ address: "Rolf Olsens vei 50, 2007 Kjeller", sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [
    { sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: "manual_research", sourceObjectId: "akershus-energi:energipark-lillestrom-2025", canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [{ lat, lon, coordRole: "display_marker", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Canonical-recorden er flyttet til Akershus og forankret på det eksakte offisielle adressepunktet for energiparken." },
  notes: [
    coordNote,
    `Nærmeste andre canonical marker ved write-time var ${nearby[0]?.id ?? "ingen"} på ${nearby[0]?.distanceMeters ?? "n/a"} meter; ingen markør lå innen 3 meter.`,
    `Legacy-koordinaten ${oldPlace.lat}, ${oldPlace.lon} er pensjonert som udokumentert og geografisk feil for den løste identiteten.`
  ]
};

writeJson(LEGACY_FILE, legacy.filter((item) => item?.id !== PLACE_ID));
writeJson(PLACE_FILE, place);
writeJson(EVIDENCE_FILE, evidence);
appendManifest("data/places/manifest.json", "places/naeringsliv/akershus/akershus_energipark.json");
appendManifest("data/coordinate-evidence/manifest.json", "akershus/naeringsliv/akershus_energi.json");

const oldProtocolLines = protocol.split("\n");
const unresolvedIndexes = oldProtocolLines.map((line, index) => line.includes("`akershus_energi`") ? index : -1).filter((index) => index >= 0);
if (unresolvedIndexes.length !== 1) throw new Error(`Expected exactly one protocol row for ${PLACE_ID}, got ${unresolvedIndexes.length}`);
protocol = oldProtocolLines.filter((_, index) => !unresolvedIndexes.includes(index)).join("\n");
protocol = `${protocol.trimEnd()}\n\n| ${BATCH} | \`${PLACE_ID}\` | Akershus EnergiPark | verified; moved to Akershus | \`${found.sourceObjectId}\` |\n\nBatch ${BATCH} (${DATE}) løser \`${PLACE_ID}\` ved geografisk identitetskorreksjon. Legacy-recorden «Akershus Energi Varme» hadde en udokumentert Oslo-markør, mens source-first-kontrollen identifiserer det konkrete fysiske stedet som Akershus EnergiPark på Kjeller. Geonorge gir ett eksakt adresseobjekt for Rolf Olsens vei 50 i Lillestrøm kommune. Canonical placeId beholdes av kompatibilitetshensyn, men recorden flyttes fra Oslo-aggregatet til egen Akershus-kildefil. Oslo-totalen for aktive current \`verified*\`-steder økes ikke, fordi dette er en utflytting av en tidligere uverifisert Oslo-køpost.\n`;
writeFileSync(protocolPath, protocol, "utf8");

writeJson(`${REPORT_DIR}/batch-187-result.json`, {
  version: DATE,
  batch: BATCH,
  placeId: PLACE_ID,
  status: "produced_by_geographic_relocation",
  old: { file: LEGACY_FILE, name: oldPlace.name, coordinate: { lat: oldPlace.lat, lon: oldPlace.lon }, coordStatus: oldPlace.coordStatus ?? null },
  current: { file: PLACE_FILE, name: place.name, coordinate: { lat, lon }, sourceObjectId: found.sourceObjectId, coordStatus: place.coordStatus },
  nearestCanonicalBeforeWrite: nearby[0] ?? null,
  checks: { expectedPreviousBatch: 186, legacyRecordRemoved: true, dedicatedAkershusFileCreated: true, noOtherCanonicalWithin3m: true, unresolvedProtocolRowRemoved: true }
});
console.log(JSON.stringify({ batch: BATCH, placeId: PLACE_ID, sourceObjectId: found.sourceObjectId, coordinate: { lat, lon }, movedFrom: "oslo", movedTo: "akershus", nearestCanonicalBeforeWrite: nearby[0] ?? null }, null, 2));
