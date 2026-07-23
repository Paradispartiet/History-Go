import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const DATE = "2026-07-23";
const PLACE_ID = "unge_kunstneres_samfund";
const PLACE_NAME = "Unge Kunstneres Samfund";
const PLACE_FILE = `data/places/kunst/oslo/places_kunst/${PLACE_ID}.json`;
const EVIDENCE_FILE = `data/coordinate-evidence/oslo/kunst/${PLACE_ID}.json`;
const READINESS_FILE = "reports/visitoslo-galleries-audit-20260723/candidate-coordinate-intake/PRODUCTION_READINESS.json";
const REPORT_DIR = "reports/visitoslo-galleries-audit-20260723/production";
mkdirSync(REPORT_DIR, { recursive: true });

function readJson(path) { return JSON.parse(readFileSync(path, "utf8")); }
function writeJson(path, value) { writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function parseFinderJson(stdout) {
  const text = String(stdout ?? "").trim();
  const start = text.indexOf("{");
  if (start < 0) return null;
  try { return JSON.parse(text.slice(start)); } catch { return null; }
}
function extractPlaces(root) {
  const result = [];
  const seen = new Set();
  const visit = (value, depth = 0) => {
    if (depth > 6 || value == null) return;
    if (Array.isArray(value)) { for (const item of value) visit(item, depth + 1); return; }
    if (typeof value !== "object") return;
    if (typeof value.id === "string" && typeof value.name === "string" && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
      if (!seen.has(value.id)) { seen.add(value.id); result.push(value); }
      return;
    }
    for (const child of Object.values(value)) visit(child, depth + 1);
  };
  visit(root);
  return result;
}
function distanceMeters(lat1, lon1, lat2, lon2) {
  const rad = (degrees) => degrees * Math.PI / 180;
  const r = 6371000;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}
function appendManifest(path, item) {
  const manifest = readJson(path);
  if (!Array.isArray(manifest.files)) throw new Error(`${path} has no files array`);
  if (!manifest.files.includes(item)) manifest.files.push(item);
  writeJson(path, manifest);
}

if (existsSync(PLACE_FILE) || existsSync(EVIDENCE_FILE)) throw new Error(`${PLACE_ID} already exists on branch`);
const readiness = readJson(READINESS_FILE);
const ready = readiness.coordinateReady?.find((row) => row.placeId === PLACE_ID);
if (!ready) throw new Error(`${PLACE_ID} missing from merged production readiness`);
if (ready.sourceObjectId !== "geonorge-adresser-v1:0301:13669:1") throw new Error(`Unexpected readiness source object ${ready.sourceObjectId}`);

const currentPlaces = extractPlaces(readJson("data/places/places_index.json"));
if (currentPlaces.some((place) => place.id === PLACE_ID)) throw new Error(`Duplicate id ${PLACE_ID}`);
if (currentPlaces.some((place) => String(place.name).toLowerCase().trim() === PLACE_NAME.toLowerCase())) throw new Error(`Exact name duplicate ${PLACE_NAME}`);

const build = spawnSync("npm", ["run", "build:tools"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/${PLACE_ID}-build-tools.log`, `${build.stdout ?? ""}${build.stderr ?? ""}`, "utf8");
if (build.status !== 0) throw new Error(`build:tools failed with status ${build.status}`);

const finder = spawnSync("node", ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Keysers gate 1 Oslo"], { encoding: "utf8" });
const finderRaw = `${finder.stdout ?? ""}${finder.stderr ?? ""}`;
writeFileSync(`${REPORT_DIR}/${PLACE_ID}-address-first.log`, finderRaw, "utf8");
const found = parseFinderJson(finder.stdout);
if (!found || found.status !== "verified_candidate") throw new Error(`Address-first did not verify: ${found?.status ?? "parse_error"}`);
if (found.sourceObjectId !== ready.sourceObjectId) throw new Error(`Geonorge object changed: ${found.sourceObjectId}`);
const lat = Number(found.coordinate?.lat);
const lon = Number(found.coordinate?.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("Invalid address coordinate");
if (Math.abs(lat - ready.lat) > 1e-10 || Math.abs(lon - ready.lon) > 1e-10) throw new Error(`Coordinate changed since readiness audit: ${lat},${lon}`);

const nearby = currentPlaces
  .map((place) => ({ id: place.id, name: place.name, distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2)) }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters)
  .slice(0, 10);
if (nearby[0]?.distanceMeters <= 3) throw new Error(`Canonical marker collision: ${nearby[0].id} at ${nearby[0].distanceMeters} m`);

const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Keysers gate 1, 0165 Oslo. UKS dokumenterer selv Keysers gate 1 som sitt utstillingssted i Oslo sentrum; punktet brukes som canonical display-marker for Unge Kunstneres Samfund som egen medlemsorganisasjon og samtidskunstinstitusjon.";
const place = {
  id: PLACE_ID,
  name: PLACE_NAME,
  lat,
  lon,
  r: 65,
  category: "kunst",
  year: 1921,
  desc: "Kunstnerdrevet medlemsorganisasjon og utstillingssted for samtidskunst, grunnlagt i 1921 og i dag med fast offentlig visningssted i Keysers gate 1.",
  popupDesc: "Unge Kunstneres Samfund, vanligvis kalt UKS, ble grunnlagt av og for kunstnere i 1921. Organisasjonen kombinerer fagpolitisk arbeid for profesjonelle kunstnere med et selvstendig utstillingsprogram for samtidskunst og har gjennom mer enn hundre år vært en sentral arena for eksperimentelle og kritiske kunstpraksiser i Norge.\n\nUKS er en ideell medlemsorganisasjon med over 600 medlemmer og inngår i Norske Billedkunstnere. Utstillingsprogrammet er organisatorisk åpent også for kunstnere uten medlemskap. I Keysers gate 1 har UKS et stort utstillingsrom og flere tilknyttede rom for prosjekter, møter og formidling.\n\nI History Go behandles UKS som én varig kunstinstitusjon og kunstnerorganisasjon. Skiftende utstillinger og arrangementer er innholdslag, ikke egne place-markører. Stedet gjør forbindelsen mellom kunstnerorganisering, institusjonsmakt, eksperimentell kunst og offentlighet konkret.",
  emne_ids: [
    "em_kunst_institusjonskritikk_og_representasjon",
    "em_kunst_kvalitet_kritikk_og_symbolsk_kapital",
    "em_kunst_okonomi_og_finansiering"
  ],
  quiz_profile: {
    place_type: "kunstinstitusjon_og_kunstnerorganisasjon",
    subtype: "kunstnerdrevet_samtidskunstinstitusjon_og_fagpolitisk_medlemsorganisasjon",
    signature_features: [
      "grunnlagt av og for kunstnere i 1921",
      "medlemsorganisasjon for profesjonelle kunstnere",
      "selvstendig samtidskunstprogram",
      "offentlig visningssted i Keysers gate 1"
    ],
    primary_angles: [
      "kunstnerorganisering",
      "institusjonshistorie",
      "eksperimentell_samtidskunst",
      "kunstpolitikk",
      "kunstinstitusjon_og_offentlighet"
    ],
    question_families: [
      "institusjonshistorie",
      "organisering_og_makt",
      "kunstpolitikk",
      "utstillingspraksis",
      "historisk_endring"
    ],
    avoid_angles: [
      "behandle_UKS_som_en_enkelt_utstilling",
      "forveksle_med_Kunstnernes_Hus",
      "generisk_samtidskunstquiz_uten_stedlig_kilde"
    ],
    must_include: [
      "grunnleggelsen i 1921",
      "rollen som medlemsorganisasjon",
      "rollen som utstillingssted",
      "Keysers gate 1 som dagens fysiske sted"
    ],
    contrast_targets: ["kunstnernes_hus", "kunstnerforbundet", "tegnerforbundet"],
    notes: "Bruk UKS' egne organisasjons-, historie- og programkilder for stedsnære spørsmål."
  },
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: found.sourceObjectId,
  address: { street: "Keysers gate", number: "1", postcode: "0165", city: "Oslo", country: "NO" },
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
    { type: "official", label: "UKS – medlemsorganisasjonen", url: "https://www.uks.no/uks-union/", lang: "en", verifiedAt: DATE },
    { type: "official", label: "UKS – program og sted", url: "https://www.uks.no/", lang: "en", verifiedAt: DATE }
  ]
};

const evidence = {
  schemaVersion: "1.0",
  placeId: PLACE_ID,
  placeFile: PLACE_FILE,
  evidenceStatus: "applied_to_place",
  coordinateDecision: "do_not_change_coordinates_yet",
  currentCoordinate: { lat, lon, r: 65, coordStatus: "verified", coordSource: "geonorge_adresser_v1", coordType: "address_point", coordNote },
  identity: {
    currentName: PLACE_NAME,
    resolvedIdentity: "UKS som egen kunstnerdrevet medlemsorganisasjon og samtidskunstinstitusjon i Keysers gate 1",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: ["eksakt nåværende besøksadresse", "canonical identitets- og nærhetskontroll", "dokumentert institusjonell kontinuitet"],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "Geonorge Adresser API v1 – Keysers gate 1",
      sourceUrl: found.sourceUrl,
      sourceObjectId: found.sourceObjectId,
      sourceQuality: "official_address",
      finding: "Ett tydelig offisielt adressepunkt for Keysers gate 1 i Oslo.",
      canVerifyCoordinate: true,
      reason: coordNote
    },
    {
      sourceProvider: "manual_research",
      sourceName: "UKS – Union/About",
      sourceUrl: "https://www.uks.no/uks-union/",
      sourceObjectId: "uks:union-about",
      sourceQuality: "official_institution_identity",
      finding: "Dokumenterer UKS som medlemsorganisasjon og utstillingssted, grunnlagt i 1921 av og for kunstnere.",
      canVerifyCoordinate: false,
      reason: "Identitets- og institusjonshistorisk kryssjekk."
    },
    {
      sourceProvider: "manual_research",
      sourceName: "UKS – current programme",
      sourceUrl: "https://www.uks.no/",
      sourceObjectId: "uks:current-site",
      sourceQuality: "official_site_address",
      finding: "Dokumenterer aktivt program og Keysers gate 1 som dagens fysiske UKS-sted.",
      canVerifyCoordinate: false,
      reason: "Nåværende stedstilknytning."
    }
  ],
  addressCandidates: [{ address: "Keysers gate 1, 0165 Oslo", sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [
    { sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: "manual_research", sourceObjectId: "uks:union-about", canApplyToPlace: false },
    { sourceProvider: "manual_research", sourceObjectId: "uks:current-site", canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [{ lat, lon, coordRole: "display_marker", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Keysers gate 1 er anvendt som canonical display-marker." },
  notes: [coordNote, `Nærmeste eksisterende canonical marker ved write-time var ${nearby[0]?.id ?? "ingen"} på ${nearby[0]?.distanceMeters ?? "n/a"} meter; ingen markør lå innen 3 meter.`]
};

writeJson(PLACE_FILE, place);
writeJson(EVIDENCE_FILE, evidence);
appendManifest("data/places/manifest.json", `places/kunst/oslo/places_kunst/${PLACE_ID}.json`);
appendManifest("data/coordinate-evidence/manifest.json", `oslo/kunst/${PLACE_ID}.json`);

let protocol = readFileSync("docs/coordinates/coordinate-control-protocol.md", "utf8");
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1]));
if (!batches.length) throw new Error("Could not determine current Oslo batch max");
const nextBatch = Math.max(...batches) + 1;
const countPattern = /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./;
const countMatch = protocol.match(countPattern);
if (!countMatch) throw new Error("Could not update protocol verified count");
protocol = protocol.replace(countPattern, `Oslo-protokollen dekker nå ${Number(countMatch[1]) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
protocol = `${protocol.trimEnd()}\n\n| ${nextBatch} | \`${PLACE_ID}\` | ${PLACE_NAME} | verified | \`${found.sourceObjectId}\` |\n\nBatch ${nextBatch} (${DATE}) produserer \`${PLACE_ID}\` etter den lukkede VisitOSLO Galleries scope-auditen og kandidat-readiness-auditen. Det eksakte Geonorge-adressepunktet for Keysers gate 1 brukes som display-marker for UKS som egen kunstnerdrevet medlemsorganisasjon og samtidskunstinstitusjon.\n`;
writeFileSync("docs/coordinates/coordinate-control-protocol.md", protocol, "utf8");

writeJson(`${REPORT_DIR}/${PLACE_ID}-production.json`, {
  version: DATE,
  placeId: PLACE_ID,
  batch: nextBatch,
  status: "produced",
  sourceObjectId: found.sourceObjectId,
  coordinate: { lat, lon },
  nearestCanonicalBeforeWrite: nearby[0] ?? null,
  writeTimeDuplicateChecks: { placeIdAbsent: true, exactNameAbsent: true, noCanonicalMarkerWithin3m: true },
  sourceReadiness: READINESS_FILE
});

console.log(JSON.stringify({ placeId: PLACE_ID, batch: nextBatch, sourceObjectId: found.sourceObjectId, lat, lon, nearestCanonicalBeforeWrite: nearby[0] ?? null }, null, 2));
