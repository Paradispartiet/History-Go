import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const DATE = "2026-07-23";
const PLACE_ID = "norske_grafikere";
const PLACE_NAME = "Galleri Norske Grafikere";
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
if (ready.sourceObjectId !== "geonorge-adresser-v1:0301:17577:24") throw new Error(`Unexpected readiness source object ${ready.sourceObjectId}`);

const currentPlaces = extractPlaces(readJson("data/places/places_index.json"));
if (currentPlaces.some((place) => place.id === PLACE_ID)) throw new Error(`Duplicate id ${PLACE_ID}`);
const duplicateNames = new Set([PLACE_NAME.toLowerCase(), "norske grafikere"]);
if (currentPlaces.some((place) => duplicateNames.has(String(place.name).toLowerCase().trim()))) throw new Error(`Exact name duplicate for ${PLACE_ID}`);

const build = spawnSync("npm", ["run", "build:tools"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/${PLACE_ID}-build-tools.log`, `${build.stdout ?? ""}${build.stderr ?? ""}`, "utf8");
if (build.status !== 0) throw new Error(`build:tools failed with status ${build.status}`);

const finder = spawnSync("node", ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Tollbugata 24 Oslo"], { encoding: "utf8" });
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

const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Tollbugata 24, 0157 Oslo. Norske Grafikere dokumenterer samme adresse som sitt galleri og har hatt dagens adresse siden 2002; punktet brukes som canonical display-marker for foreningen og galleriet som én varig kunstinstitusjon.";
const place = {
  id: PLACE_ID,
  name: PLACE_NAME,
  lat,
  lon,
  r: 55,
  category: "kunst",
  year: 1919,
  desc: "Landsdekkende fagorganisasjon for grafikere, stiftet i 1919, med kunstnerstyrt galleri og kunnskapssenter for originalgrafikk i Tollbugata 24.",
  popupDesc: "Norske Grafikere ble stiftet 15. november 1919 som et faglig og sosialt samlingssted for utøvende grafikere. Foreningen utviklet seg til en landsdekkende fagorganisasjon og etablerte i 1972 sitt eget kunstnerstyrte galleri med statlig støtte. Etter flere adresser flyttet foreningen til Tollbugata 24 i 2002.\n\nGalleriet er kjernen i foreningens offentlige virksomhet og viser skiftende utstillinger med samtidsgrafikk. Norske Grafikere arbeider samtidig for medlemmenes faglige og økonomiske interesser og for å øke kunnskapen om originalgrafikk og grafikkrelaterte uttrykk.\n\nI History Go behandles Norske Grafikere og galleriet i Tollbugata 24 som én varig kunstinstitusjon. Skiftende utstillinger og enkeltverk er innholdslag, ikke egne steder. Det sentrale er hvordan grafikk organiseres som kunstfelt gjennom fagfellesskap, utstillingspraksis, formidling og kunstøkonomi.",
  emne_ids: [
    "em_kunst_institusjonskritikk_og_representasjon",
    "em_kunst_kvalitet_kritikk_og_symbolsk_kapital",
    "em_kunst_okonomi_og_finansiering"
  ],
  quiz_profile: {
    place_type: "kunstinstitusjon_og_kunstnerorganisasjon",
    subtype: "grafikerforening_og_kunstnerstyrt_galleri",
    signature_features: [
      "stiftet i 1919",
      "kunstnerstyrt galleri etablert i 1972",
      "i Tollbugata 24 siden 2002",
      "faglig senter for originalgrafikk"
    ],
    primary_angles: [
      "grafikk_som_kunstfelt",
      "kunstnerorganisering",
      "utstillingspraksis",
      "original_og_reproduksjon",
      "kunstformidling"
    ],
    question_families: [
      "institusjonshistorie",
      "medium_og_teknikk",
      "organisering_og_makt",
      "kunstformidling",
      "historisk_endring"
    ],
    avoid_angles: [
      "forveksle_foreningen_med_Norske_Grafikeres_Verksted_paa_Kalbakken",
      "redusere_stedet_til_nettbutikk",
      "generisk_grafikkquiz_uten_stedlig_forankring"
    ],
    must_include: [
      "stiftelsen i 1919",
      "galleriet som kunstnerstyrt institusjon",
      "Tollbugata 24 siden 2002",
      "rollen som fagorganisasjon for grafikere"
    ],
    contrast_targets: ["tegnerforbundet", "kunstnerforbundet", "kunstnernes_hus"],
    notes: "Skill tydelig mellom Norske Grafikere i Tollbugata og det uavhengige Norske Grafikeres Verksted på Kalbakken."
  },
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: found.sourceObjectId,
  address: { street: "Tollbugata", number: "24", postcode: "0157", city: "Oslo", country: "NO" },
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
    { type: "official", label: "Norske Grafikere – om oss", url: "https://norske-grafikere.no/norske-grafikere/om-oss/", lang: "nb", verifiedAt: DATE },
    { type: "official", label: "Norske Grafikere – besøk oss", url: "https://norske-grafikere.no/besok-oss/", lang: "nb", verifiedAt: DATE }
  ]
};

const evidence = {
  schemaVersion: "1.0",
  placeId: PLACE_ID,
  placeFile: PLACE_FILE,
  evidenceStatus: "applied_to_place",
  coordinateDecision: "do_not_change_coordinates_yet",
  currentCoordinate: { lat, lon, r: 55, coordStatus: "verified", coordSource: "geonorge_adresser_v1", coordType: "address_point", coordNote },
  identity: {
    currentName: PLACE_NAME,
    resolvedIdentity: "Norske Grafikere som landsdekkende fagorganisasjon og kunstnerstyrt galleri i Tollbugata 24",
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
      sourceName: "Geonorge Adresser API v1 – Tollbugata 24",
      sourceUrl: found.sourceUrl,
      sourceObjectId: found.sourceObjectId,
      sourceQuality: "official_address",
      finding: "Ett tydelig offisielt adressepunkt for Tollbugata 24 i Oslo.",
      canVerifyCoordinate: true,
      reason: coordNote
    },
    {
      sourceProvider: "manual_research",
      sourceName: "Norske Grafikere – Om oss",
      sourceUrl: "https://norske-grafikere.no/norske-grafikere/om-oss/",
      sourceObjectId: "norske-grafikere:about",
      sourceQuality: "official_institution_identity",
      finding: "Dokumenterer stiftelsen i 1919, galleriet fra 1972, flyttingen til Tollbugata 24 i 2002 og rollen som fagorganisasjon og kunnskapssenter.",
      canVerifyCoordinate: false,
      reason: "Identitets- og institusjonshistorisk kryssjekk."
    },
    {
      sourceProvider: "manual_research",
      sourceName: "Norske Grafikere – Besøk oss",
      sourceUrl: "https://norske-grafikere.no/besok-oss/",
      sourceObjectId: "norske-grafikere:visit",
      sourceQuality: "official_site_identity",
      finding: "Dokumenterer det publikumsåpne galleriet og foreningens formidlingsrolle.",
      canVerifyCoordinate: false,
      reason: "Nåværende offentlig funksjon."
    }
  ],
  addressCandidates: [{ address: "Tollbugata 24, 0157 Oslo", sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [
    { sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: "manual_research", sourceObjectId: "norske-grafikere:about", canApplyToPlace: false },
    { sourceProvider: "manual_research", sourceObjectId: "norske-grafikere:visit", canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [{ lat, lon, coordRole: "display_marker", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Tollbugata 24 er anvendt som canonical display-marker." },
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
protocol = `${protocol.trimEnd()}\n\n| ${nextBatch} | \`${PLACE_ID}\` | ${PLACE_NAME} | verified | \`${found.sourceObjectId}\` |\n\nBatch ${nextBatch} (${DATE}) produserer \`${PLACE_ID}\` etter den lukkede VisitOSLO Galleries scope-auditen og kandidat-readiness-auditen. Det eksakte Geonorge-adressepunktet for Tollbugata 24 brukes som display-marker for Norske Grafikere som egen fagorganisasjon og kunstnerstyrt galleriinstitusjon.\n`;
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
