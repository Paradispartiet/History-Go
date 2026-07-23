import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = "2026-07-23";
const EXPECTED_BATCH = 172;
const placeId = "klosterenga_skulpturpark";
const placeName = "Klosterenga skulpturpark";
const OSM_WAY_ID = 4874898;
const LOCKED = { lat: 59.9082666, lon: 10.7761761 };
const OFFICIAL_PAGE = "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/klosterenga-park";
const PLACE_FILE = "data/places/kunst/oslo/places_kunst/klosterenga_skulpturpark.json";
const PLACE_MANIFEST_ENTRY = "places/kunst/oslo/places_kunst/klosterenga_skulpturpark.json";
const EVIDENCE_FILE = "data/coordinate-evidence/oslo/kunst/klosterenga_skulpturpark.json";
const EVIDENCE_MANIFEST_ENTRY = "oslo/kunst/klosterenga_skulpturpark.json";

function norm(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a").replace(/[^a-z0-9]+/g, " ").trim();
}
function haversineMeters(a, b) {
  const rad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
async function fetchText(url, headers = {}) {
  const response = await fetch(url, { redirect: "follow", headers: { Accept: "text/html,application/json,*/*", "User-Agent": "History-Go-coordinate-production/1.0", ...headers } });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}: ${text.slice(0, 500)}`);
  return { finalUrl: response.url, text };
}
async function fetchJson(url) {
  const result = await fetchText(url, { Accept: "application/json" });
  return JSON.parse(result.text);
}
function acceptedNames(row) {
  return [...new Set([row?.name, String(row?.display_name ?? "").split(",")[0], ...Object.values(row?.namedetails ?? {})]
    .filter((value) => typeof value === "string")
    .flatMap((value) => [value, ...value.split(/[;|]/g)])
    .map((value) => value.trim()).filter(Boolean))];
}
function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
function appendUnique(array, value) { if (!array.includes(value)) array.push(value); }

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const acceptedIdentityNames = ["Klosterenga skulpturpark", "Klosterenga park", "Klosterenga"].map(norm);
const identityMatches = places.filter((place) => place.id === placeId || acceptedIdentityNames.includes(norm(place.name)));
if (identityMatches.length > 0) throw new Error(`Klosterenga identity already canonical: ${identityMatches.map((place) => place.id).join(", ")}`);

const lookupUrl = `https://nominatim.openstreetmap.org/lookup?osm_ids=W${OSM_WAY_ID}&format=jsonv2&addressdetails=1&extratags=1&namedetails=1&polygon_geojson=1`;
const [rows, official] = await Promise.all([fetchJson(lookupUrl), fetchText(OFFICIAL_PAGE)]);
if (!Array.isArray(rows) || rows.length !== 1) throw new Error(`Exact OSM lookup returned ${Array.isArray(rows) ? rows.length : "non-array"} rows.`);
const park = rows[0];
const names = acceptedNames(park);
const exactNameGate = names.some((name) => [norm("Klosterenga"), norm("Klosterenga park"), norm("Klosterenga skulpturpark")].includes(norm(name)));
const semanticGate = park.type === "park";
const geometryGate = ["Polygon", "MultiPolygon"].includes(park.geojson?.type);
const coordinate = { lat: Number(park.lat), lon: Number(park.lon) };
const coordinateGate = Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lon);
const driftM = coordinateGate ? haversineMeters(coordinate, LOCKED) : Infinity;
const lockedCoordinateGate = driftM <= 10;
const officialText = norm(official.text);
const officialSemanticGate = officialText.includes(norm("Klosterenga park")) && officialText.includes(norm("skulpturpark")) && officialText.includes(norm("Hovinbekken")) && officialText.includes(norm("Bård Breivik"));
if (!exactNameGate || !semanticGate || !geometryGate || !coordinateGate || !lockedCoordinateGate || !officialSemanticGate) {
  throw new Error(`Klosterenga production gate failed: ${JSON.stringify({ exactNameGate, semanticGate, geometryGate, coordinateGate, lockedCoordinateGate, officialSemanticGate, names, category: park.category, type: park.type, geojsonType: park.geojson?.type, coordinate, driftM })}`);
}

const coordNote = `Batch ${EXPECTED_BATCH} object-type-first: exact OSM way ${OSM_WAY_ID} resolves as the named Klosterenga park with ${park.geojson.type} geometry. Fresh exact-object representation point is ${coordinate.lat}, ${coordinate.lon}, ${driftM.toFixed(2)} m from the locked revalidation coordinate. Oslo kommune defines Klosterenga as a sculpture park and experience park where art, water and green areas form one integrated landscape, with the reopened Hovinbekken as a central 700-metre art-and-water element. Canonical scope is the whole named park landscape, not one sculpture, water feature or creek point. No nearest/first-hit selection is used.`;

const place = {
  id: placeId,
  name: placeName,
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: 260,
  category: "kunst",
  year: 1990,
  desc: "Skulpturpark i Gamle Oslo der kunst, vann, grøntområder og den gjenåpnede Hovinbekken er formet som ett sammenhengende parklandskap.",
  popupDesc: "Klosterenga skulpturpark er et stort offentlig kunst- og parklandskap mellom Vålerenga og Grønland. Prosjektet ble utviklet fra 1990-årene med Bård Breiviks visjon som utgangspunkt, og kombinerer steinskulpturer, vannrenner, bassenger, møteplasser og grøntområder. Den gjenåpnede Hovinbekken er en bærende del av anlegget og inngår i et langt kunstnerisk bekkeløp gjennom parken. History Go representerer derfor hele skulptur-, vann- og parkmiljøet som ett sted, mens enkeltverk kan leve som egne innholdslag.",
  tags: ["skulpturpark", "offentlig kunst", "Hovinbekken", "Bård Breivik", "park"],
  visual: { designCode: "sculpture_park_miniature" },
  quiz_profile: {
    place_type: "skulpturpark",
    subtype: "integrert_kunst_vann_og_parklandskap",
    signature_features: ["kunst og vann som ett landskap", "gjenåpnet Hovinbekk gjennom parken", "Bård Breiviks langsiktige kunstprosjekt"],
    primary_angles: ["kunst", "landskap", "vann", "bytransformasjon"],
    question_families: ["gjenkjenning", "romlig_lesning", "historisk_endring", "saertrekk"],
    avoid_angles: ["forveksle_hele_parken_med_ett_kunstverk", "generisk_skulpturpark"],
    must_include: ["samspillet mellom kunst og Hovinbekken", "parken som samlet landskapsverk"],
    contrast_targets: ["ekebergparken", "vigelandsparken", "botsparken"],
    notes: "Skal spørres som samlet kunst-, vann- og parkmiljø, ikke som en enkelt skulptur."
  },
  locatorType: "park",
  sourceProvider: "osm",
  sourceObjectId: `osm-way:${OSM_WAY_ID}`,
  geocodeAccuracy: "geometric_center",
  coordRole: "area_anchor",
  coordStatus: "verified_geometry",
  coordSource: `OpenStreetMap way ${OSM_WAY_ID} – Klosterenga; scope cross-checked with Oslo kommune`,
  coordSourceId: `osm-way:${OSM_WAY_ID}`,
  coordSourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
  coordType: "sculpture_park_center",
  coordVerifiedAt: DATE,
  coordNote,
  geometry: park.geojson,
  externalLinks: [
    { type: "official", label: "Oslo kommune – Klosterenga park", url: OFFICIAL_PAGE, lang: "nb", verifiedAt: DATE },
    { type: "coordinate_source", label: `OpenStreetMap – Klosterenga way ${OSM_WAY_ID}`, url: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`, lang: "nb", verifiedAt: DATE }
  ]
};

const evidence = {
  schemaVersion: "1.0",
  placeId,
  placeFile: PLACE_FILE,
  evidenceStatus: "applied_to_place",
  coordinateDecision: "do_not_change_coordinates_yet",
  currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus, coordSource: place.coordSource, coordType: place.coordType, coordNote: place.coordNote },
  identity: {
    currentName: placeName,
    resolvedIdentity: "Hele Klosterenga skulpturpark som integrert offentlig kunst-, vann- og parklandskap",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "park",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: ["exact locked OSM park identity", "official municipal whole-site scope", "canonical duplicate control against current main"],
  evidence: [
    {
      sourceProvider: "osm",
      sourceName: `OpenStreetMap – Klosterenga way ${OSM_WAY_ID}`,
      sourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
      sourceObjectId: `osm-way:${OSM_WAY_ID}`,
      sourceQuality: "unique_exact_named_park_polygon",
      finding: `Fresh exact lookup resolves way ${OSM_WAY_ID} as ${park.name}, type=park, ${park.geojson.type} geometry and representation point ${coordinate.lat}, ${coordinate.lon}.`,
      canVerifyCoordinate: true,
      reason: "Exact named physical park geometry; no nearest or first-hit selection."
    },
    {
      sourceProvider: "municipality",
      sourceName: "Oslo kommune – Klosterenga park",
      sourceUrl: OFFICIAL_PAGE,
      sourceObjectId: "oslo-kommune:park:klosterenga",
      sourceQuality: "official_integrated_sculpture_park_scope",
      finding: "Oslo kommune defines Klosterenga as a sculpture and experience park integrating art, water, green areas and the reopened Hovinbekken.",
      canVerifyCoordinate: false,
      reason: "Defines the whole-site canonical scope; exact physical area geometry comes from the locked OSM way."
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: "osm", sourceObjectId: `osm-way:${OSM_WAY_ID}`, canApplyToPlace: true },
    { sourceProvider: "municipality", sourceObjectId: "oslo-kommune:park:klosterenga", canApplyToPlace: false }
  ],
  geometryCandidates: [{ sourceProvider: "osm", sourceObjectId: `osm-way:${OSM_WAY_ID}`, geometryType: park.geojson.type, coordRole: "area_anchor", canApplyToPlace: true }],
  coordinateCandidates: [{ lat: coordinate.lat, lon: coordinate.lon, coordRole: "area_anchor", sourceObjectId: `osm-way:${OSM_WAY_ID}`, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Exact Klosterenga park geometry and representation point are applied to canonical sculpture-park place." },
  notes: [coordNote, `Fresh anchor drift from locked production coordinate: ${driftM.toFixed(2)} m.`, "Place-id and accepted Klosterenga identity names were absent from current manifest-loaded canonical place data before production."]
};

writeJson(PLACE_FILE, place);
writeJson(EVIDENCE_FILE, evidence);
const placesManifestPath = "data/places/manifest.json";
const placesManifest = JSON.parse(readFileSync(placesManifestPath, "utf8"));
if (!Array.isArray(placesManifest.files)) throw new Error("data/places/manifest.json has no files array.");
appendUnique(placesManifest.files, PLACE_MANIFEST_ENTRY);
writeJson(placesManifestPath, placesManifest);
const evidenceManifestPath = "data/coordinate-evidence/manifest.json";
const evidenceManifest = JSON.parse(readFileSync(evidenceManifestPath, "utf8"));
if (!Array.isArray(evidenceManifest.files)) throw new Error("data/coordinate-evidence/manifest.json has no files array.");
appendUnique(evidenceManifest.files, EVIDENCE_MANIFEST_ENTRY);
writeJson(evidenceManifestPath, evidenceManifest);

const protocolPath = "docs/coordinates/coordinate-control-protocol.md";
let protocol = readFileSync(protocolPath, "utf8");
if (protocol.includes(`\`${placeId}\``)) throw new Error(`${placeId} already exists in coordinate protocol.`);
const batchNumbers = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1])).filter(Number.isFinite);
const batch = Math.max(...batchNumbers) + 1;
if (batch !== EXPECTED_BATCH) throw new Error(`Expected batch ${EXPECTED_BATCH}, got ${batch}. Rebase on current main before production.`);
const protocolRow = `| ${batch} | \`${placeId}\` | ${placeName} | verified_geometry | \`osm-way:${OSM_WAY_ID}\` |`;
let insertionIndex = protocol.search(/\n##+ [^\n]*Dokumenterte Oslo-kontroller uten godkjent koordinat[^\n]*/i);
if (insertionIndex < 0) insertionIndex = protocol.indexOf("\n## Etne – historiesett");
if (insertionIndex < 0) throw new Error("Could not locate end of Oslo verified coordinate table in protocol.");
protocol = `${protocol.slice(0, insertionIndex)}\n${protocolRow}${protocol.slice(insertionIndex)}`;
protocol = protocol.replace(/(Oslo-protokollen dekker nå )(\d+)( aktive current `verified\*` canonical Oslo-steder\.)/, (_, prefix, count, suffix) => `${prefix}${Number(count) + 1}${suffix}`);
writeFileSync(protocolPath, protocol, "utf8");

const reportDir = `reports/oslo-coordinate-control-batch-${batch}-klosterenga-skulpturpark`;
mkdirSync(reportDir, { recursive: true });
writeJson(`${reportDir}/batch-${batch}-result.json`, {
  version: DATE,
  batch,
  placeId,
  status: "verified_geometry_applied_to_place",
  coordinate: { lat: place.lat, lon: place.lon, r: place.r, coordRole: place.coordRole, coordType: place.coordType },
  sourceObject: { sourceObjectId: `osm-way:${OSM_WAY_ID}`, name: park.name, category: park.category, type: park.type, geometryType: park.geojson.type },
  gates: { exactNameGate, semanticGate, geometryGate, coordinateGate, lockedCoordinateGate, officialSemanticGate, duplicateIdentityMatches: identityMatches.length },
  driftFromLockedCoordinateM: Math.round(driftM * 100) / 100,
  representationLock: "Whole integrated sculpture-, water- and park landscape; individual artworks remain content layers unless independently canonical."
});
writeJson(`${reportDir}/nominatim-way-${OSM_WAY_ID}.json`, park);
writeFileSync(`${reportDir}/sources.md`, `# Klosterenga skulpturpark production sources\n\n- Oslo kommune: ${OFFICIAL_PAGE}\n- OSM exact park object: https://www.openstreetmap.org/way/${OSM_WAY_ID}\n\nCanonical scope: the whole integrated sculpture-, water- and park environment, including the reopened Hovinbekken as a central landscape element.\n`, "utf8");
console.log(`Produced ${placeId} as batch ${batch}: ${place.lat},${place.lon}; source=osm-way:${OSM_WAY_ID}; drift=${driftM.toFixed(2)}m`);
