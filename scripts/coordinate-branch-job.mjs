import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const DATE = "2026-07-23";
const PLACE_ID = "the_mini_bottle_gallery";
const PLACE_NAME = "The Mini Bottle Gallery";
const CATEGORY = "historie";
const PLACE_FILE = `data/places/${CATEGORY}/oslo/places_${CATEGORY}/${PLACE_ID}.json`;
const EVIDENCE_FILE = `data/coordinate-evidence/oslo/${CATEGORY}/${PLACE_ID}.json`;
const READINESS_FILE = "reports/visitoslo-galleries-audit-20260723/candidate-coordinate-intake/PRODUCTION_READINESS.json";
const REPORT_DIR = "reports/visitoslo-galleries-audit-20260723/production";
mkdirSync(REPORT_DIR, { recursive: true });
mkdirSync(`data/places/${CATEGORY}/oslo/places_${CATEGORY}`, { recursive: true });
mkdirSync(`data/coordinate-evidence/oslo/${CATEGORY}`, { recursive: true });

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
if (ready.sourceObjectId !== "geonorge-adresser-v1:0301:13707:10") throw new Error(`Unexpected readiness source object ${ready.sourceObjectId}`);

const currentPlaces = extractPlaces(readJson("data/places/places_index.json"));
if (currentPlaces.some((place) => place.id === PLACE_ID)) throw new Error(`Duplicate id ${PLACE_ID}`);
const names = new Set([PLACE_NAME.toLowerCase(), "mini bottle gallery", "småflaskemuseet", "smaflaskemuseet"]);
if (currentPlaces.some((place) => names.has(String(place.name).toLowerCase().trim()))) throw new Error(`Exact or canonical name duplicate for ${PLACE_ID}`);

const build = spawnSync("npm", ["run", "build:tools"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/${PLACE_ID}-build-tools.log`, `${build.stdout ?? ""}${build.stderr ?? ""}`, "utf8");
if (build.status !== 0) throw new Error(`build:tools failed with status ${build.status}`);

const finder = spawnSync("node", ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Kirkegata 10 Oslo"], { encoding: "utf8" });
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

const coordNote = "Offisiell adressekoordinat fra Geonorge Adresser API for Kirkegata 10, 0153 Oslo. Museets egen nettside dokumenterer samme adresse og at The Mini Bottle Gallery åpnet her i mai 2003; punktet brukes som canonical display-marker for spesialmuseet og samlingen.";
const place = {
  id: PLACE_ID,
  name: PLACE_NAME,
  lat,
  lon,
  r: 50,
  category: CATEGORY,
  year: 2003,
  desc: "Spesialmuseum i Kirkegata 10, åpnet i 2003, bygget rundt Christian Ringnes' omfattende samling av miniatyrflasker og presentert gjennom tematiske installasjoner over flere etasjer.",
  popupDesc: "The Mini Bottle Gallery åpnet museumsdørene i Kirkegata 10 i mai 2003. Samlingen vokste fram fra Christian Ringnes' første miniatyrflaske, som han fikk som barn i 1961, og utviklet seg over flere tiår til et eget museumsunivers i Oslo sentrum.\n\nMuseet beskriver samlingen som verdens største småflaskesamling. Tusenvis av miniatyrflasker er organisert i tematiske installasjoner over tre etasjer, mens en langt større del av samlingen oppbevares utenfor utstilling. Bygningen brukes også til arrangementer og selskaper, men museumssamlingen er den varige kulturhistoriske kjernen.\n\nI History Go behandles The Mini Bottle Gallery som et spesialmuseum og samlingshistorisk sted, ikke som et ordinært kommersielt galleri. Stedet åpner for spørsmål om samlerpraksis, museumsfortelling, masseproduserte hverdagsobjekter og hvordan private samlinger blir offentlig kulturarv.",
  emne_ids: [
    "em_his_spor_materialitet",
    "em_his_kulturminner_bevaring",
    "em_his_samtid_ettertid_fortelling"
  ],
  quiz_profile: {
    place_type: "museum",
    subtype: "spesialmuseum_for_miniatyrflasker_og_privatsamling",
    signature_features: [
      "åpnet i Kirkegata 10 i mai 2003",
      "bygget rundt Christian Ringnes' private samling",
      "miniatyrflasker vist i tematiske installasjoner over tre etasjer",
      "museet beskriver samlingen som verdens største i sitt slag"
    ],
    primary_angles: [
      "museumshistorie",
      "samlerkultur",
      "materiell_kultur",
      "private_samlinger_og_offentlighet",
      "hverdagsobjekter_som_kulturhistorie"
    ],
    question_families: [
      "institusjonshistorie",
      "samling_og_kuratering",
      "materiell_kultur",
      "historisk_endring",
      "kontrast"
    ],
    avoid_angles: [
      "behandle_stedet_som_alkoholreklame",
      "forveksle_museet_med_et_ordinært_kunstgalleri",
      "gjøre_arrangementsvirksomheten_til_hovedhistorien"
    ],
    must_include: [
      "åpningen i 2003",
      "Kirkegata 10",
      "samlingens opprinnelse hos Christian Ringnes",
      "rollen som spesialmuseum"
    ],
    contrast_targets: ["norsk_folkemuseum", "oslo_bymuseum", "teknisk_museum"],
    notes: "Bruk museets egen samlingshistorie og skill varig museumskjerne fra arrangementsvirksomheten."
  },
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: found.sourceObjectId,
  address: { street: "Kirkegata", number: "10", postcode: "0153", city: "Oslo", country: "NO" },
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
    { type: "official", label: "The Mini Bottle Gallery – museet", url: "https://www.minibottlegallery.com/?kategori=museum", lang: "nb", verifiedAt: DATE },
    { type: "official", label: "The Mini Bottle Gallery – hovedside", url: "https://www.minibottlegallery.com/", lang: "nb", verifiedAt: DATE }
  ]
};

const evidence = {
  schemaVersion: "1.0",
  placeId: PLACE_ID,
  placeFile: PLACE_FILE,
  evidenceStatus: "applied_to_place",
  coordinateDecision: "do_not_change_coordinates_yet",
  currentCoordinate: { lat, lon, r: 50, coordStatus: "verified", coordSource: "geonorge_adresser_v1", coordType: "address_point", coordNote },
  identity: {
    currentName: PLACE_NAME,
    resolvedIdentity: "Spesialmuseet The Mini Bottle Gallery i Kirkegata 10, separat fra ordinære kunstgallerier i VisitOSLO-kilden",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: ["eksakt nåværende besøksadresse", "canonical identitets- og nærhetskontroll", "dokumentert museumshistorie"],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "Geonorge Adresser API v1 – Kirkegata 10",
      sourceUrl: found.sourceUrl,
      sourceObjectId: found.sourceObjectId,
      sourceQuality: "official_address",
      finding: "Ett tydelig offisielt adressepunkt for Kirkegata 10 i Oslo.",
      canVerifyCoordinate: true,
      reason: coordNote
    },
    {
      sourceProvider: "manual_research",
      sourceName: "The Mini Bottle Gallery – Museum",
      sourceUrl: "https://www.minibottlegallery.com/?kategori=museum",
      sourceObjectId: "mini-bottle:official-museum",
      sourceQuality: "official_museum_identity",
      finding: "Dokumenterer samlingens historie, kjøpet av Kirkegata 10 i 1996 og museumsåpningen i mai 2003.",
      canVerifyCoordinate: false,
      reason: "Identitets- og institusjonshistorisk kryssjekk."
    },
    {
      sourceProvider: "manual_research",
      sourceName: "The Mini Bottle Gallery – Contact",
      sourceUrl: "https://www.minibottlegallery.com/",
      sourceObjectId: "mini-bottle:official-contact",
      sourceQuality: "official_site_address",
      finding: "Dokumenterer The Mini Bottle Gallery AS og Kirkegata 10, 0153 Oslo som dagens adresse.",
      canVerifyCoordinate: false,
      reason: "Nåværende adressekryssjekk."
    }
  ],
  addressCandidates: [{ address: "Kirkegata 10, 0153 Oslo", sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [
    { sourceProvider: "official_address", sourceObjectId: found.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: "manual_research", sourceObjectId: "mini-bottle:official-museum", canApplyToPlace: false },
    { sourceProvider: "manual_research", sourceObjectId: "mini-bottle:official-contact", canApplyToPlace: false }
  ],
  geometryCandidates: [],
  coordinateCandidates: [{ lat, lon, coordRole: "display_marker", sourceObjectId: found.sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Kirkegata 10 er anvendt som canonical display-marker." },
  notes: [coordNote, `Nærmeste eksisterende canonical marker ved write-time var ${nearby[0]?.id ?? "ingen"} på ${nearby[0]?.distanceMeters ?? "n/a"} meter; ingen markør lå innen 3 meter.`]
};

writeJson(PLACE_FILE, place);
writeJson(EVIDENCE_FILE, evidence);
appendManifest("data/places/manifest.json", `places/${CATEGORY}/oslo/places_${CATEGORY}/${PLACE_ID}.json`);
appendManifest("data/coordinate-evidence/manifest.json", `oslo/${CATEGORY}/${PLACE_ID}.json`);

let protocol = readFileSync("docs/coordinates/coordinate-control-protocol.md", "utf8");
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1]));
if (!batches.length) throw new Error("Could not determine current Oslo batch max");
const nextBatch = Math.max(...batches) + 1;
const countPattern = /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./;
const countMatch = protocol.match(countPattern);
if (!countMatch) throw new Error("Could not update protocol verified count");
protocol = protocol.replace(countPattern, `Oslo-protokollen dekker nå ${Number(countMatch[1]) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
protocol = `${protocol.trimEnd()}\n\n| ${nextBatch} | \`${PLACE_ID}\` | ${PLACE_NAME} | verified | \`${found.sourceObjectId}\` |\n\nBatch ${nextBatch} (${DATE}) produserer \`${PLACE_ID}\` etter den lukkede VisitOSLO Galleries scope-auditen og kandidat-readiness-auditen. Stedet kategoriseres som \`historie\` fordi det er et spesialmuseum, og det eksakte Geonorge-adressepunktet for Kirkegata 10 brukes som display-marker.\n`;
writeFileSync("docs/coordinates/coordinate-control-protocol.md", protocol, "utf8");

writeJson(`${REPORT_DIR}/${PLACE_ID}-production.json`, {
  version: DATE,
  placeId: PLACE_ID,
  category: CATEGORY,
  batch: nextBatch,
  status: "produced",
  sourceObjectId: found.sourceObjectId,
  coordinate: { lat, lon },
  nearestCanonicalBeforeWrite: nearby[0] ?? null,
  writeTimeDuplicateChecks: { placeIdAbsent: true, exactNameAbsent: true, noCanonicalMarkerWithin3m: true },
  sourceReadiness: READINESS_FILE
});

console.log(JSON.stringify({ placeId: PLACE_ID, category: CATEGORY, batch: nextBatch, sourceObjectId: found.sourceObjectId, lat, lon, nearestCanonicalBeforeWrite: nearby[0] ?? null }, null, 2));
