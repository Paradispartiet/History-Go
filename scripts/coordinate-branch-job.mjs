import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = "2026-07-23";
const EXPECTED_BATCH = 171;
const placeId = "aamot_bru";
const placeName = "Åmot bru";
const OSM_WAY_ID = 791117473;
const LOCKED = { lat: 60.0185966, lon: 10.615812 };
const HISTORY_PAGE = "https://oslobyleksikon.no/side/%C3%85mot_bru";
const PLACE_FILE = "data/places/historie/oslo/places_historie/aamot_bru.json";
const PLACE_MANIFEST_ENTRY = "places/historie/oslo/places_historie/aamot_bru.json";
const EVIDENCE_FILE = "data/coordinate-evidence/oslo/historie/aamot_bru.json";
const EVIDENCE_MANIFEST_ENTRY = "oslo/historie/aamot_bru.json";

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
const identityMatches = places.filter((place) => place.id === placeId || ["Åmot bru", "Aamot bru"].map(norm).includes(norm(place.name)));
if (identityMatches.length > 0) throw new Error(`Åmot bru already canonical on current main: ${identityMatches.map((place) => place.id).join(", ")}`);

const lookupUrl = `https://nominatim.openstreetmap.org/lookup?osm_ids=W${OSM_WAY_ID}&format=jsonv2&addressdetails=1&extratags=1&namedetails=1&polygon_geojson=1`;
const wayApiUrl = `https://api.openstreetmap.org/api/0.6/way/${OSM_WAY_ID}.json`;
const [rows, wayApi, history] = await Promise.all([fetchJson(lookupUrl), fetchJson(wayApiUrl), fetchText(HISTORY_PAGE)]);
if (!Array.isArray(rows) || rows.length !== 1) throw new Error(`Exact OSM lookup returned ${Array.isArray(rows) ? rows.length : "non-array"} rows.`);
const bridge = rows[0];
const way = wayApi.elements?.find((element) => element.type === "way" && Number(element.id) === OSM_WAY_ID);
if (!way) throw new Error("OSM API did not return the exact Åmot bru way metadata.");

const names = acceptedNames(bridge);
const exactNameGate = names.some((name) => [norm("Åmot bru"), norm("Aamot bru")].includes(norm(name))) || [norm("Åmot bru"), norm("Aamot bru")].includes(norm(way.tags?.name));
const bridgeTagGate = way.tags?.bridge === "yes" || way.tags?.man_made === "bridge";
const acceptedGeometryTypes = new Set(["LineString", "Polygon", "MultiPolygon"]);
const geometryGate = acceptedGeometryTypes.has(bridge.geojson?.type);
const coordRole = bridge.geojson?.type === "LineString" ? "line_anchor" : "area_anchor";
const coordinate = { lat: Number(bridge.lat), lon: Number(bridge.lon) };
const coordinateGate = Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lon);
const driftM = coordinateGate ? haversineMeters(coordinate, LOCKED) : Infinity;
const lockedCoordinateGate = driftM <= 10;
const historyText = norm(history.text);
const historyGate = historyText.includes(norm("Åmot bru")) && historyText.includes("1851") && historyText.includes("1957") && historyText.includes(norm("Åmotsund"));
if (!exactNameGate || !bridgeTagGate || !geometryGate || !coordinateGate || !lockedCoordinateGate || !historyGate) {
  throw new Error(`Åmot bru production gate failed: ${JSON.stringify({ exactNameGate, bridgeTagGate, geometryGate, coordinateGate, lockedCoordinateGate, historyGate, names, tags: way.tags, geojsonType: bridge.geojson?.type, coordinate, driftM })}`);
}

const coordNote = `Batch ${EXPECTED_BATCH} object-type-first: exact OSM way ${OSM_WAY_ID} carries the Åmot bru identity and man_made=bridge, with exact ${bridge.geojson.type} bridge geometry. Fresh exact-object representation point is ${coordinate.lat}, ${coordinate.lon}, ${driftM.toFixed(2)} m from the locked revalidation coordinate. Oslo byleksikon documents the iron chain suspension bridge as built in 1851 for Åmotsund, later dismantled and re-erected at Akerselva in 1957. Canonical scope is the bridge itself; no nearby Akerselva feature, road crossing or nearest/first-hit proxy is used.`;

const place = {
  id: placeId,
  name: placeName,
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: 45,
  category: "historie",
  year: 1851,
  desc: "Historisk kjedehengebro av jern, opprinnelig bygget ved Åmotsund i 1851 og flyttet til Akerselva i 1957.",
  popupDesc: "Åmot bru er en historisk kjedehengebro av jern som i dag krysser Akerselva ved Schultzehaugen. Broen ble bygget i 1851 for Åmotsund ved Drammenselva og var avansert konstruksjonsteknologi for sin tid. Etter at den ble tatt ned, overtok Oslo kommune broen og satte den opp ved Akerselva i 1957. Den kjente innskriften om at broen kan bære hundre mann, men svikter under taktfast marsj, knytter konstruksjonen til 1800-tallets forståelse av svingninger og broteknikk.",
  tags: ["bro", "Akerselva", "jernkonstruksjon", "1851", "kulturminne"],
  visual: { designCode: "bridge_miniature" },
  quiz_profile: {
    place_type: "bro",
    subtype: "historisk_jern_kjedehengebro_flyttet_til_akerselva",
    signature_features: ["jernbro fra 1851", "opprinnelig bygget ved Åmotsund", "flyttet til Akerselva i 1957", "berømt innskrift om taktfast marsj"],
    primary_angles: ["historie", "teknikk", "materialitet", "flytting_ombruk"],
    question_families: ["historisk_endring", "teknisk_fysisk", "gjenkjenning", "saertrekk"],
    avoid_angles: ["forveksle_med_Kristoffer_Aamots_bru", "generisk_bro"],
    must_include: ["flyttingen fra Åmotsund", "jernkonstruksjonen og marsjinnskriften"],
    contrast_targets: ["sannerbrua", "beierbrua", "kristoffer_aamots_bru"],
    notes: "Skal spørres som det konkrete historiske broobjektet, ikke som generell Akerselva-kryssing."
  },
  locatorType: "linear_area",
  sourceProvider: "osm",
  sourceObjectId: `osm-way:${OSM_WAY_ID}`,
  geocodeAccuracy: "geometric_center",
  coordRole,
  coordStatus: "verified_geometry",
  coordSource: `OpenStreetMap way ${OSM_WAY_ID} – Åmot bru; historical identity cross-checked with Oslo byleksikon`,
  coordSourceId: `osm-way:${OSM_WAY_ID}`,
  coordSourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
  coordType: "bridge_center",
  coordVerifiedAt: DATE,
  coordNote,
  geometry: bridge.geojson,
  externalLinks: [
    { type: "reference", label: "Oslo byleksikon – Åmot bru", url: HISTORY_PAGE, lang: "nb", verifiedAt: DATE },
    { type: "coordinate_source", label: `OpenStreetMap – Åmot bru way ${OSM_WAY_ID}`, url: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`, lang: "nb", verifiedAt: DATE }
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
    resolvedIdentity: "Den historiske Åmot bru fra 1851, flyttet fra Åmotsund til Akerselva i 1957",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "linear_area",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: ["exact locked named bridge object", "OSM bridge tag and exact bridge geometry", "historical identity/source cross-check", "canonical duplicate control against current main"],
  evidence: [
    {
      sourceProvider: "osm",
      sourceName: `OpenStreetMap – Åmot bru way ${OSM_WAY_ID}`,
      sourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
      sourceObjectId: `osm-way:${OSM_WAY_ID}`,
      sourceQuality: "unique_exact_named_bridge_way",
      finding: `Exact OSM way ${OSM_WAY_ID} carries the Åmot bru identity, man_made=bridge and ${bridge.geojson.type} geometry. Representation point: ${coordinate.lat}, ${coordinate.lon}.`,
      canVerifyCoordinate: true,
      reason: "Exact physical bridge object and geometry; no nearest or first-hit selection."
    },
    {
      sourceProvider: "manual_research",
      sourceName: "Oslo byleksikon – Åmot bru",
      sourceUrl: HISTORY_PAGE,
      sourceObjectId: "oslobyleksikon:aamot-bru",
      sourceQuality: "historical_identity_and_relocation_source",
      finding: "Documents the 1851 iron chain suspension bridge, original Åmotsund location and re-erection at Akerselva in 1957.",
      canVerifyCoordinate: false,
      reason: "Confirms historical identity and continuity; exact current geometry comes from the locked OSM way."
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: "osm", sourceObjectId: `osm-way:${OSM_WAY_ID}`, canApplyToPlace: true },
    { sourceProvider: "manual_research", sourceObjectId: "oslobyleksikon:aamot-bru", canApplyToPlace: false }
  ],
  geometryCandidates: [
    { sourceProvider: "osm", sourceObjectId: `osm-way:${OSM_WAY_ID}`, geometryType: bridge.geojson.type, coordRole, canApplyToPlace: true }
  ],
  coordinateCandidates: [
    { lat: coordinate.lat, lon: coordinate.lon, coordRole, sourceObjectId: `osm-way:${OSM_WAY_ID}`, canApplyToPlace: true }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: "",
    nextAction: "Exact Åmot bru bridge identity and geometric representation point are applied to canonical place."
  },
  notes: [coordNote, `Fresh anchor drift from locked production coordinate: ${driftM.toFixed(2)} m.`, "Place-id and Åmot/Aamot normalized names were absent from current manifest-loaded canonical place data before production."]
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

const reportDir = `reports/oslo-coordinate-control-batch-${batch}-aamot-bru`;
mkdirSync(reportDir, { recursive: true });
writeJson(`${reportDir}/batch-${batch}-result.json`, {
  version: DATE,
  batch,
  placeId,
  status: "verified_geometry_applied_to_place",
  coordinate: { lat: place.lat, lon: place.lon, r: place.r, coordRole: place.coordRole, coordType: place.coordType },
  sourceObject: { sourceObjectId: `osm-way:${OSM_WAY_ID}`, name: way.tags?.name ?? bridge.name, bridge: way.tags?.bridge ?? null, manMade: way.tags?.man_made ?? null, highway: way.tags?.highway ?? null, geometryType: bridge.geojson.type },
  gates: { exactNameGate, bridgeTagGate, geometryGate, coordinateGate, lockedCoordinateGate, historyGate, duplicateIdentityMatches: identityMatches.length },
  driftFromLockedCoordinateM: Math.round(driftM * 100) / 100,
  representationLock: "Exact historic iron chain suspension bridge object; surrounding Akerselva landscape remains separate."
});
writeJson(`${reportDir}/nominatim-way-${OSM_WAY_ID}.json`, bridge);
writeJson(`${reportDir}/osm-way-${OSM_WAY_ID}.json`, way);
writeFileSync(`${reportDir}/sources.md`, `# Åmot bru production sources\n\n- Oslo byleksikon: ${HISTORY_PAGE}\n- OSM exact bridge object: https://www.openstreetmap.org/way/${OSM_WAY_ID}\n\nCanonical scope: the exact historic iron chain suspension bridge, built in 1851 and re-erected at Akerselva in 1957.\n`, "utf8");

console.log(`Produced ${placeId} as batch ${batch}: ${place.lat},${place.lon}; source=osm-way:${OSM_WAY_ID}; geometry=${bridge.geojson.type}; drift=${driftM.toFixed(2)}m`);
