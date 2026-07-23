import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const DATE = "2026-07-23";
const PLACE_ID = "edvard_munchs_atelier_ekely";
const PLACE_NAME = "Edvard Munchs atelier på Ekely";
const PLACE_FILE = `data/places/kunst/oslo/places_kunst/${PLACE_ID}.json`;
const EVIDENCE_FILE = `data/coordinate-evidence/oslo/kunst/${PLACE_ID}.json`;
const READINESS_FILE = "reports/visitoslo-galleries-audit-20260723/candidate-coordinate-intake/PRODUCTION_READINESS.json";
const REPORT_DIR = "reports/visitoslo-galleries-audit-20260723/production";
mkdirSync(REPORT_DIR, { recursive: true });

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function parseFinderJson(stdout) {
  const text = String(stdout ?? "").trim();
  const start = text.indexOf("{");
  if (start < 0) return null;
  try { return JSON.parse(text.slice(start)); } catch { return null; }
}

function extractPlaces(root) {
  const places = [];
  const seen = new Set();
  const visit = (value, depth = 0) => {
    if (depth > 6 || value === null || value === undefined) return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1);
      return;
    }
    if (typeof value !== "object") return;
    if (typeof value.id === "string" && typeof value.name === "string" && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
      if (!seen.has(value.id)) {
        seen.add(value.id);
        places.push(value);
      }
      return;
    }
    for (const child of Object.values(value)) visit(child, depth + 1);
  };
  visit(root);
  return places;
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
  if (!Array.isArray(manifest.files)) throw new Error(`${path} does not contain a files array`);
  if (!manifest.files.includes(item)) manifest.files.push(item);
  writeJson(path, manifest);
}

if (existsSync(PLACE_FILE)) throw new Error(`${PLACE_ID} already exists on this branch`);
if (existsSync(EVIDENCE_FILE)) throw new Error(`${PLACE_ID} coordinate evidence already exists on this branch`);

const readiness = readJson(READINESS_FILE);
const ready = readiness.coordinateReady?.find((row) => row.placeId === PLACE_ID);
if (!ready) throw new Error(`${PLACE_ID} is not present in merged production readiness`);
if (ready.sourceObjectId !== "geonorge-adresser-v1:0301:13413:14") {
  throw new Error(`Unexpected readiness source object: ${ready.sourceObjectId}`);
}

const currentPlaces = extractPlaces(readJson("data/places/places_index.json"));
if (currentPlaces.some((place) => place.id === PLACE_ID)) throw new Error(`Duplicate place id ${PLACE_ID}`);
if (currentPlaces.some((place) => String(place.name).toLowerCase() === PLACE_NAME.toLowerCase())) {
  throw new Error(`Duplicate exact place name ${PLACE_NAME}`);
}

const build = spawnSync("npm", ["run", "build:tools"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/${PLACE_ID}-build-tools.log`, `${build.stdout ?? ""}${build.stderr ?? ""}`, "utf8");
if (build.status !== 0) throw new Error(`build:tools failed with status ${build.status}`);

const finder = spawnSync(
  "node",
  ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Jarlsborgveien 14 Oslo"],
  { encoding: "utf8" }
);
const finderRaw = `${finder.stdout ?? ""}${finder.stderr ?? ""}`;
writeFileSync(`${REPORT_DIR}/${PLACE_ID}-address-first.log`, finderRaw, "utf8");
const found = parseFinderJson(finder.stdout);
if (!found || found.status !== "verified_candidate") {
  throw new Error(`Address-first lookup did not return a verified candidate: ${found?.status ?? "parse_error"}`);
}
if (found.sourceObjectId !== ready.sourceObjectId) {
  throw new Error(`Geonorge object changed: readiness=${ready.sourceObjectId}, current=${found.sourceObjectId}`);
}
const lat = Number(found.coordinate?.lat);
const lon = Number(found.coordinate?.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("Address-first lookup returned invalid coordinates");
if (Math.abs(lat - ready.lat) > 1e-10 || Math.abs(lon - ready.lon) > 1e-10) {
  throw new Error(`Geonorge coordinate changed since readiness audit: ${lat},${lon}`);
}

const nearby = currentPlaces
  .map((place) => ({
    id: place.id,
    name: place.name,
    distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2))
  }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters)
  .slice(0, 10);
if (nearby[0]?.distanceMeters <= 3) {
  throw new Error(`Canonical marker collision within 3 m: ${nearby[0].id} at ${nearby[0].distanceMeters} m`);
}

const place = {
  id: PLACE_ID,
  name: PLACE_NAME,
  lat,
  lon,
  r: 70,
  category: "kunst",
  year: 1929,
  desc: "Det bevarte vinteratelieret på Ekely, ferdigstilt i sin nåværende form i 1929, på eiendommen der Edvard Munch bodde og arbeidet fra 1916 til sin død i 1944.",
  popupDesc: "Edvard Munch kjøpte Ekely i 1916 og bodde og arbeidet på eiendommen fram til han døde i 1944. Det bevarte vinteratelieret ble først oppført etter tegninger av Arnstein Arneberg i 1919–20 og senere omarbeidet og utvidet av Henrik Bull. Bygningen fikk formen den har i dag i 1929 og er det eneste av Munchs atelierbygg på Ekely som er bevart.\n\nAtelieret rommer to arbeidsrom og et grafikkverksted og brukes fortsatt av billedkunstnere. Eiendommen forvaltes som et kulturhistorisk sted, og Munchs tidligere hage og ateliermiljø gjør forbindelsen mellom kunstnerisk arbeid, arkitektur og sted konkret.\n\nI History Go behandles vinteratelieret og Ekely-eiendommen som ett fysisk kultur- og kunststed. Det skal ikke forveksles med MUNCH-museet i Bjørvika: dette er arbeidsstedet og bomiljøet der Munch levde i sine siste 28 år.",
  emne_ids: [
    "em_kunst_kvalitet_kritikk_og_symbolsk_kapital",
    "em_kunst_institusjonskritikk_og_representasjon"
  ],
  quiz_profile: {
    place_type: "kunstneratelier_og_kulturminne",
    subtype: "bevart_modernistisk_vinteratelier_paa_kunstnereiendom",
    signature_features: [
      "Ekely var Edvard Munchs faste hjem fra 1916 til 1944",
      "det bevarte vinteratelieret fikk sin nåværende form i 1929",
      "atelieret er det eneste bevarte atelierbygget fra Munchs Ekely",
      "bygningen brukes fortsatt av billedkunstnere"
    ],
    primary_angles: [
      "kunstnerliv_og_arbeidssted",
      "atelierarkitektur",
      "kulturminnevern",
      "kunstnerisk_produksjon",
      "Munch_og_Ekely"
    ],
    question_families: [
      "sted_og_kunstnerbiografi",
      "bygg_og_funksjon",
      "historisk_endring",
      "kunstnerisk_praksis",
      "kontrast"
    ],
    avoid_angles: [
      "forveksle_Ekely_med_MUNCH_i_Bjorvika",
      "paastaa_at_alle_Munchs_atelierbygg_er_bevart",
      "generisk_Munch-quiz_uten_Ekely-forankring"
    ],
    must_include: [
      "Munchs kjøp av Ekely i 1916",
      "vinteratelierets ferdigstilling i 1929",
      "stedet som Munchs hjem og arbeidsmiljø fram til 1944",
      "atelierets fortsatte bruk av billedkunstnere"
    ],
    contrast_targets: ["munch_museet", "kunstnernes_hus", "kunstnerforbundet"],
    notes: "Bruk offisielle Ekely-/SEMA-kilder for stedsnære spørsmål og skill tydelig mellom atelierstedet og museet i Bjørvika."
  },
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: found.sourceObjectId,
  address: {
    street: "Jarlsborgveien",
    number: "14",
    postcode: "0377",
    city: "Oslo",
    country: "NO"
  },
  geocodeAccuracy: "rooftop",
  coordRole: "display_marker",
  coordType: "address_point",
  coordStatus: "verified",
  coordSource: "geonorge_adresser_v1",
  coordSourceId: found.sourceObjectId,
  coordSourceUrl: found.sourceUrl,
  coordVerifiedAt: DATE,
  coordNote: "Offisiell adressekoordinat fra Geonorge Adresser API for Jarlsborgveien 14, 0377 Oslo. Den offisielle Ekely-nettsiden dokumenterer samme besøksadresse for den bevarte atelier-eiendommen; punktet brukes som canonical display-marker for atelierstedet, ikke for MUNCH-museet i Bjørvika.",
  externalLinks: [
    {
      type: "official",
      label: "Edvard Munchs atelier – om Ekely",
      url: "https://edvard-munchs-atelier.no/about-ekely/?lang=en",
      lang: "en",
      verifiedAt: DATE
    },
    {
      type: "official",
      label: "Edvard Munchs atelier – besøk",
      url: "https://edvard-munchs-atelier.no/visit-us/?lang=en",
      lang: "en",
      verifiedAt: DATE
    }
  ]
};

const evidence = {
  schemaVersion: "1.0",
  placeId: PLACE_ID,
  placeFile: PLACE_FILE,
  evidenceStatus: "applied_to_place",
  coordinateDecision: "do_not_change_coordinates_yet",
  currentCoordinate: {
    lat,
    lon,
    r: 70,
    coordStatus: "verified",
    coordSource: "geonorge_adresser_v1",
    coordType: "address_point",
    coordNote: place.coordNote
  },
  identity: {
    currentName: PLACE_NAME,
    resolvedIdentity: "Det bevarte vinteratelieret og atelier-eiendommen på Ekely i Jarlsborgveien 14, separat fra MUNCH-museet i Bjørvika",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "building",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: [
    "eksakt nåværende besøksadresse",
    "canonical identitets- og nærhetskontroll",
    "dokumentert fysisk og historisk tilknytning mellom atelieret og Ekely"
  ],
  evidence: [
    {
      sourceProvider: "official_address",
      sourceName: "Geonorge Adresser API v1 – Jarlsborgveien 14",
      sourceUrl: found.sourceUrl,
      sourceObjectId: found.sourceObjectId,
      sourceQuality: "official_address",
      finding: "Ett tydelig offisielt adressepunkt for Jarlsborgveien 14 i Oslo.",
      canVerifyCoordinate: true,
      reason: place.coordNote
    },
    {
      sourceProvider: "manual_research",
      sourceName: "Edvard Munchs atelier – About Ekely",
      sourceUrl: "https://edvard-munchs-atelier.no/about-ekely/?lang=en",
      sourceObjectId: "ekely:about",
      sourceQuality: "official_site_identity",
      finding: "Dokumenterer Munchs kjøp av Ekely i 1916, atelierets bygningshistorie og at den bevarte vinteratelierbygningen fikk sin nåværende form i 1929.",
      canVerifyCoordinate: false,
      reason: "Identitets- og stedsforankringskontroll."
    },
    {
      sourceProvider: "manual_research",
      sourceName: "Edvard Munchs atelier – Visit us",
      sourceUrl: "https://edvard-munchs-atelier.no/visit-us/?lang=en",
      sourceObjectId: "ekely:visit",
      sourceQuality: "official_site_address",
      finding: "Dokumenterer besøksadressen Jarlsborgveien 14, 0377 Oslo for Ekely-eiendommen.",
      canVerifyCoordinate: false,
      reason: "Institusjonens egen besøksadresse kryssjekker det offisielle adresseobjektet."
    }
  ],
  addressCandidates: [
    {
      address: "Jarlsborgveien 14, 0377 Oslo",
      sourceProvider: "official_address",
      sourceObjectId: found.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: "official_address",
      sourceObjectId: found.sourceObjectId,
      canApplyToPlace: true
    },
    {
      sourceProvider: "manual_research",
      sourceObjectId: "ekely:about",
      canApplyToPlace: false
    },
    {
      sourceProvider: "manual_research",
      sourceObjectId: "ekely:visit",
      canApplyToPlace: false
    }
  ],
  geometryCandidates: [],
  coordinateCandidates: [
    {
      lat,
      lon,
      coordRole: "display_marker",
      sourceObjectId: found.sourceObjectId,
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: "",
    nextAction: "Jarlsborgveien 14 er anvendt som canonical display-marker."
  },
  notes: [
    place.coordNote,
    `Nærmeste eksisterende canonical marker i write-time-auditen var ${nearby[0]?.id ?? "ingen"} på ${nearby[0]?.distanceMeters ?? "n/a"} meter; ingen markør lå innen 3 meter.`
  ]
};

writeJson(PLACE_FILE, place);
writeJson(EVIDENCE_FILE, evidence);
appendManifest("data/places/manifest.json", `places/kunst/oslo/places_kunst/${PLACE_ID}.json`);
appendManifest("data/coordinate-evidence/manifest.json", `oslo/kunst/${PLACE_ID}.json`);

let protocol = readFileSync("docs/coordinates/coordinate-control-protocol.md", "utf8");
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1]));
if (!batches.length) throw new Error("Could not determine current Oslo coordinate batch maximum");
const nextBatch = Math.max(...batches) + 1;
const countPattern = /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./;
const countMatch = protocol.match(countPattern);
if (!countMatch) throw new Error("Could not update Oslo verified-place count in protocol header");
protocol = protocol.replace(countPattern, `Oslo-protokollen dekker nå ${Number(countMatch[1]) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
protocol = `${protocol.trimEnd()}\n\n| ${nextBatch} | \`${PLACE_ID}\` | ${PLACE_NAME} | verified | \`${found.sourceObjectId}\` |\n\nBatch ${nextBatch} (${DATE}) produserer \`${PLACE_ID}\` etter den lukkede 66-item VisitOSLO Galleries scope-auditen og den separate kandidat-readiness-auditen. Det eksakte Geonorge-adressepunktet for Jarlsborgveien 14 brukes som display-marker for det bevarte atelierstedet på Ekely; identiteten er separat fra MUNCH-museet i Bjørvika.\n`;
writeFileSync("docs/coordinates/coordinate-control-protocol.md", protocol, "utf8");

writeJson(`${REPORT_DIR}/${PLACE_ID}-production.json`, {
  version: DATE,
  placeId: PLACE_ID,
  batch: nextBatch,
  status: "produced",
  sourceObjectId: found.sourceObjectId,
  coordinate: { lat, lon },
  nearestCanonicalBeforeWrite: nearby[0] ?? null,
  writeTimeDuplicateChecks: {
    placeIdAbsent: true,
    exactNameAbsent: true,
    noCanonicalMarkerWithin3m: true
  },
  sourceReadiness: READINESS_FILE
});

console.log(JSON.stringify({ placeId: PLACE_ID, batch: nextBatch, sourceObjectId: found.sourceObjectId, lat, lon, nearestCanonicalBeforeWrite: nearby[0] ?? null }, null, 2));
