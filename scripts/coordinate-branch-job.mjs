import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = "2026-07-23";
const EXPECTED_BATCH = 170;
const placeId = "grorudparken";
const placeName = "Grorudparken";
const OSM_WAY_ID = 125848624;
const LOCKED = { lat: 59.9576727, lon: 10.8755562 };
const OFFICIAL_PAGE = "https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/grorudparken/";
const PLACE_FILE = "data/places/by/oslo/grorudparken.json";
const PLACE_MANIFEST_ENTRY = "places/by/oslo/grorudparken.json";
const EVIDENCE_FILE = "data/coordinate-evidence/oslo/by/grorudparken.json";
const EVIDENCE_MANIFEST_ENTRY = "oslo/by/grorudparken.json";

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
  const response = await fetch(url, {
    redirect: "follow",
    headers: { Accept: "text/html,application/json,*/*", "User-Agent": "History-Go-coordinate-production/1.0", ...headers }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}: ${text.slice(0, 500)}`);
  return { finalUrl: response.url, text };
}

async function fetchJson(url) {
  const result = await fetchText(url, { Accept: "application/json" });
  return JSON.parse(result.text);
}

function acceptedNames(row) {
  return [...new Set([
    row?.name,
    String(row?.display_name ?? "").split(",")[0],
    ...Object.values(row?.namedetails ?? {})
  ].filter((value) => typeof value === "string").flatMap((value) => [value, ...value.split(/[;|]/g)]).map((value) => value.trim()).filter(Boolean))];
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function appendUnique(array, value) {
  if (!array.includes(value)) array.push(value);
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const identityMatches = places.filter((place) => place.id === placeId || norm(place.name) === norm(placeName));
if (identityMatches.length > 0) throw new Error(`Grorudparken already canonical on current main: ${identityMatches.map((place) => place.id).join(", ")}`);

const lookupUrl = `https://nominatim.openstreetmap.org/lookup?osm_ids=W${OSM_WAY_ID}&format=jsonv2&addressdetails=1&extratags=1&namedetails=1&polygon_geojson=1`;
const [rows, official] = await Promise.all([fetchJson(lookupUrl), fetchText(OFFICIAL_PAGE)]);
if (!Array.isArray(rows) || rows.length !== 1) throw new Error(`Exact OSM lookup returned ${Array.isArray(rows) ? rows.length : "non-array"} rows.`);
const park = rows[0];
const names = acceptedNames(park);
const exactNameGate = names.some((name) => norm(name) === norm(placeName));
const semanticGate = park.type === "park";
const geometryGate = ["Polygon", "MultiPolygon"].includes(park.geojson?.type);
const coordinate = { lat: Number(park.lat), lon: Number(park.lon) };
const coordinateGate = Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lon);
const driftM = coordinateGate ? haversineMeters(coordinate, LOCKED) : Infinity;
const lockedCoordinateGate = driftM <= 10;
const officialText = norm(official.text);
const officialSemanticGate = officialText.includes(norm("Grorudparken")) && officialText.includes(norm("Alnaelven")) && officialText.includes(norm("Holalokka"));
if (!exactNameGate || !semanticGate || !geometryGate || !coordinateGate || !lockedCoordinateGate || !officialSemanticGate) {
  throw new Error(`Grorudparken production gate failed: ${JSON.stringify({ exactNameGate, semanticGate, geometryGate, coordinateGate, lockedCoordinateGate, officialSemanticGate, names, category: park.category, type: park.type, geojsonType: park.geojson?.type, coordinate, driftM })}`);
}

const coordNote = `Batch ${EXPECTED_BATCH} object-type-first: exact OSM way ${OSM_WAY_ID} resolves as the named Grorudparken park with area geometry. Fresh exact-object representation point is ${coordinate.lat}, ${coordinate.lon}, ${driftM.toFixed(2)} m from the locked revalidation coordinate. Oslo kommune defines Grorudparken as the park landscape along Alnaelven from Grorud senter to Hølaløkka and lists Groruddammen as a facility inside the park. Canonical scope is therefore the broader named public park; groruddammen remains a separate exact water/recreation place. No nearest/first-hit selection is used.`;

const place = {
  id: placeId,
  name: placeName,
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: 220,
  category: "by",
  year: 2013,
  emne_ids: ["em_by_parker_som_sosial_infrastruktur", "em_by_opphold_vs_gjennomgang"],
  desc: "Sammenhengende parklandskap langs Alna fra Grorud senter mot Hølaløkka, med vann, grøntområder og rekreasjonsfunksjoner som binder nabolaget sammen.",
  popupDesc: "Grorudparken er et offentlig parklandskap langs Alnaelva, fra Grorud senter mot Hølaløkka. Parken samler turvei, grøntområder og rekreasjonsrom i en sammenhengende struktur gjennom Grorud. Groruddammen ligger inne i dette større landskapet, men beholder sin egen stedidentitet i History Go. Grorudparken representerer derfor hele det navngitte parkarealet, ikke bare dammen eller ett enkelt oppholdspunkt.",
  tags: ["park", "Alna", "Grorud", "rekreasjon", "Hølaløkka"],
  underbadge_ids: ["park", "friluftsliv"],
  visual: { designCode: "park_miniature" },
  quiz_profile: {
    place_type: "park",
    subtype: "langstrakt_elvenar_nabolagspark",
    signature_features: ["parklandskap langs Alna", "strekker seg fra Grorud senter mot Hølaløkka", "Groruddammen som eget delsted inne i den større parken"],
    primary_angles: ["bruk", "landskap", "vannlop", "nabolag"],
    question_families: ["gjenkjenning", "romlig_lesning", "bruk", "kontrast"],
    avoid_angles: ["forveksle_hele_parken_med_groruddammen", "generisk_nabolagspark"],
    must_include: ["forholdet til Alna", "skillet mellom parken og Groruddammen"],
    contrast_targets: ["groruddammen", "grorud", "holalokka"],
    notes: "Skal spørres som sammenhengende parklandskap langs elva, ikke som ett enkelt vann- eller lekeområde."
  },
  locatorType: "park",
  sourceProvider: "osm",
  sourceObjectId: `osm-way:${OSM_WAY_ID}`,
  geocodeAccuracy: "geometric_center",
  coordRole: "area_anchor",
  coordStatus: "verified_geometry",
  coordSource: `OpenStreetMap way ${OSM_WAY_ID} – Grorudparken; scope cross-checked with Oslo kommune`,
  coordSourceId: `osm-way:${OSM_WAY_ID}`,
  coordSourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
  coordType: "park_center",
  coordVerifiedAt: DATE,
  coordNote,
  geometry: park.geojson,
  externalLinks: [
    { type: "official", label: "Oslo kommune – Grorudparken", url: OFFICIAL_PAGE, lang: "nb", verifiedAt: DATE },
    { type: "coordinate_source", label: `OpenStreetMap – Grorudparken way ${OSM_WAY_ID}`, url: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`, lang: "nb", verifiedAt: DATE }
  ]
};

const evidence = {
  schemaVersion: "1.0",
  placeId,
  placeFile: PLACE_FILE,
  evidenceStatus: "applied_to_place",
  coordinateDecision: "do_not_change_coordinates_yet",
  currentCoordinate: {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote
  },
  identity: {
    currentName: placeName,
    resolvedIdentity: "Grorudparken som det brede navngitte parklandskapet langs Alna, med Groruddammen som separat delsted",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "park",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: ["exact locked OSM park identity", "official municipal park-scope definition", "canonical duplicate control against current main"],
  evidence: [
    {
      sourceProvider: "osm",
      sourceName: `OpenStreetMap – Grorudparken way ${OSM_WAY_ID}`,
      sourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
      sourceObjectId: `osm-way:${OSM_WAY_ID}`,
      sourceQuality: "unique_exact_named_park_polygon",
      finding: `Fresh exact lookup resolves way ${OSM_WAY_ID} as Grorudparken, type=park, ${park.geojson.type} geometry and representation point ${coordinate.lat}, ${coordinate.lon}.`,
      canVerifyCoordinate: true,
      reason: "Exact named physical park geometry; no nearest or first-hit selection."
    },
    {
      sourceProvider: "municipality",
      sourceName: "Oslo kommune – Grorudparken",
      sourceUrl: OFFICIAL_PAGE,
      sourceObjectId: "oslo-kommune:park:grorudparken",
      sourceQuality: "official_park_scope_definition",
      finding: "Oslo kommune defines Grorudparken as a park along Alnaelven from Grorud senter to Hølaløkka and lists Groruddammen among the park facilities.",
      canVerifyCoordinate: false,
      reason: "Official scope and parent/subplace relationship; exact area geometry comes from the locked OSM way."
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: "osm", sourceObjectId: `osm-way:${OSM_WAY_ID}`, canApplyToPlace: true },
    { sourceProvider: "municipality", sourceObjectId: "oslo-kommune:park:grorudparken", canApplyToPlace: false }
  ],
  geometryCandidates: [
    { sourceProvider: "osm", sourceObjectId: `osm-way:${OSM_WAY_ID}`, geometryType: park.geojson.type, coordRole: "area_anchor", canApplyToPlace: true }
  ],
  coordinateCandidates: [
    { lat: coordinate.lat, lon: coordinate.lon, coordRole: "area_anchor", sourceObjectId: `osm-way:${OSM_WAY_ID}`, canApplyToPlace: true }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: "",
    nextAction: "Exact Grorudparken park identity and geometric representation point are applied to canonical place."
  },
  notes: [coordNote, `Fresh anchor drift from locked production coordinate: ${driftM.toFixed(2)} m.`, "Place-id and normalized name were absent from current manifest-loaded canonical place data before production."]
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

const reportDir = `reports/oslo-coordinate-control-batch-${batch}-grorudparken`;
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
  representationLock: "Whole named Grorudparken park landscape; Groruddammen remains a separate exact place inside the broader park."
});
writeJson(`${reportDir}/nominatim-way-${OSM_WAY_ID}.json`, park);
writeFileSync(`${reportDir}/sources.md`, `# Grorudparken production sources\n\n- Oslo kommune: ${OFFICIAL_PAGE}\n- OSM exact park object: https://www.openstreetmap.org/way/${OSM_WAY_ID}\n\nCanonical scope: the whole named public park landscape along Alna from Grorud senter toward Hølaløkka. Groruddammen remains a separate place inside the park.\n`, "utf8");

console.log(`Produced ${placeId} as batch ${batch}: ${place.lat},${place.lon}; source=osm-way:${OSM_WAY_ID}; drift=${driftM.toFixed(2)}m`);
