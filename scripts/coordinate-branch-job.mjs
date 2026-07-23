import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DATE = "2026-07-23";
const EXPECTED_BATCH = 173;
const placeId = "peer_gynt_parken";
const placeName = "Peer Gynt-parken";
const OSM_WAY_ID = 126850692;
const LOCKED = { lat: 59.9319086, lon: 10.7922952 };
const PARK_PAGE = "https://www.peergyntparken.no/";
const OSLO_BYPLAN_PAGE = "https://magasin.oslo.kommune.no/byplan/hva-kan-vi-laere-av-loren";
const PLACE_FILE = "data/places/kunst/oslo/places_kunst/peer_gynt_parken.json";
const PLACE_MANIFEST_ENTRY = "places/kunst/oslo/places_kunst/peer_gynt_parken.json";
const EVIDENCE_FILE = "data/coordinate-evidence/oslo/kunst/peer_gynt_parken.json";
const EVIDENCE_MANIFEST_ENTRY = "oslo/kunst/peer_gynt_parken.json";

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
const acceptedIdentityNames = ["Peer Gynt-parken", "Peer Gynt Park", "Peer Gynt Parken"].map(norm);
const identityMatches = places.filter((place) => place.id === placeId || acceptedIdentityNames.includes(norm(place.name)));
if (identityMatches.length > 0) throw new Error(`Peer Gynt-parken already canonical: ${identityMatches.map((place) => place.id).join(", ")}`);

const lookupUrl = `https://nominatim.openstreetmap.org/lookup?osm_ids=W${OSM_WAY_ID}&format=jsonv2&addressdetails=1&extratags=1&namedetails=1&polygon_geojson=1`;
const [rows, parkSite, byplan] = await Promise.all([fetchJson(lookupUrl), fetchText(PARK_PAGE), fetchText(OSLO_BYPLAN_PAGE)]);
if (!Array.isArray(rows) || rows.length !== 1) throw new Error(`Exact OSM lookup returned ${Array.isArray(rows) ? rows.length : "non-array"} rows.`);
const park = rows[0];
const names = acceptedNames(park);
const exactNameGate = names.some((name) => acceptedIdentityNames.includes(norm(name)));
const semanticGate = park.type === "park";
const geometryGate = ["Polygon", "MultiPolygon"].includes(park.geojson?.type);
const coordinate = { lat: Number(park.lat), lon: Number(park.lon) };
const coordinateGate = Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lon);
const driftM = coordinateGate ? haversineMeters(coordinate, LOCKED) : Infinity;
const lockedCoordinateGate = driftM <= 10;
const parkSiteText = norm(parkSite.text);
const parkSiteGate = parkSiteText.includes(norm("Peer Gynt-parken")) && parkSiteText.includes(norm("Løren")) && parkSiteText.includes(norm("skulpturpark")) && parkSiteText.includes(norm("Henrik Ibsen"));
const byplanText = norm(byplan.text);
const byplanGate = byplanText.includes(norm("Peer Gynt-parken")) && byplanText.includes(norm("skulpturpark")) && byplanText.includes(norm("Løren"));
if (!exactNameGate || !semanticGate || !geometryGate || !coordinateGate || !lockedCoordinateGate || !parkSiteGate || !byplanGate) {
  throw new Error(`Peer Gynt-parken production gate failed: ${JSON.stringify({ exactNameGate, semanticGate, geometryGate, coordinateGate, lockedCoordinateGate, parkSiteGate, byplanGate, names, category: park.category, type: park.type, geojsonType: park.geojson?.type, coordinate, driftM })}`);
}

const coordNote = `Batch ${EXPECTED_BATCH} object-type-first: exact OSM way ${OSM_WAY_ID} resolves as the named Peer Gynt-parken with ${park.geojson.type} park geometry. Fresh exact-object representation point is ${coordinate.lat}, ${coordinate.lon}, ${driftM.toFixed(2)} m from the locked revalidation coordinate. Peer Gynt-parkens own current site defines the Løren site as an international sculpture park and art walk inspired by Henrik Ibsens Peer Gynt, while Oslo kommune's Byplan material treats the park as a significant neighbourhood meeting and play environment. Canonical scope is the complete sculpture park; individual sculptures remain content layers unless independently justified as canonical places. No nearest/first-hit selection is used.`;

const place = {
  id: placeId,
  name: placeName,
  lat: coordinate.lat,
  lon: coordinate.lon,
  r: 150,
  category: "kunst",
  year: 2006,
  desc: "Skulpturpark på Løren med internasjonale kunstneres tolkninger av Henrik Ibsens Peer Gynt, integrert i boligområdets offentlige byrom.",
  popupDesc: "Peer Gynt-parken på Løren er en offentlig skulpturpark inspirert av Henrik Ibsens drama Peer Gynt. Verk av kunstnere fra flere land er plassert gjennom parken som en kunstvandring der litteratur, skulptur og nabolagslandskap møtes. Parken fungerer samtidig som et hverdagsrom for beboere og barnefamilier på Løren. History Go representerer derfor hele skulpturparken som ett sted, mens de enkelte skulpturene behandles som innholdslag med egne kunstnere, motiver og historier.",
  tags: ["skulpturpark", "Peer Gynt", "Henrik Ibsen", "Løren", "offentlig kunst"],
  visual: { designCode: "sculpture_park_miniature" },
  quiz_profile: {
    place_type: "skulpturpark",
    subtype: "litteraer_internasjonal_skulpturpark_i_boligomrade",
    signature_features: ["kunstverk inspirert av Peer Gynt", "internasjonal kunstvandring", "integrert i Lørens bolig- og nabolagslandskap"],
    primary_angles: ["kunst", "litteratur", "byrom", "bruk"],
    question_families: ["gjenkjenning", "saertrekk", "bruk", "kontrast"],
    avoid_angles: ["forveksle_hele_parken_med_ett_kunstverk", "generisk_skulpturpark"],
    must_include: ["koblingen til Ibsens Peer Gynt", "parken som samlet kunstvandring"],
    contrast_targets: ["klosterenga_skulpturpark", "vigelandsparken", "ekebergparken"],
    notes: "Skal spørres som helhetlig skulpturpark og kunstvandring, ikke som én statue."
  },
  locatorType: "park",
  sourceProvider: "osm",
  sourceObjectId: `osm-way:${OSM_WAY_ID}`,
  geocodeAccuracy: "geometric_center",
  coordRole: "area_anchor",
  coordStatus: "verified_geometry",
  coordSource: `OpenStreetMap way ${OSM_WAY_ID} – Peer Gynt-parken; scope cross-checked with Peer Gynt-parken and Oslo kommune Byplan`,
  coordSourceId: `osm-way:${OSM_WAY_ID}`,
  coordSourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
  coordType: "sculpture_park_center",
  coordVerifiedAt: DATE,
  coordNote,
  geometry: park.geojson,
  externalLinks: [
    { type: "official", label: "Peer Gynt-parken", url: PARK_PAGE, lang: "nb", verifiedAt: DATE },
    { type: "reference", label: "Oslo kommune Byplan – Hva kan vi lære av Løren?", url: OSLO_BYPLAN_PAGE, lang: "nb", verifiedAt: DATE },
    { type: "coordinate_source", label: `OpenStreetMap – Peer Gynt-parken way ${OSM_WAY_ID}`, url: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`, lang: "nb", verifiedAt: DATE }
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
    resolvedIdentity: "Hele Peer Gynt-parken på Løren som internasjonal offentlig skulpturpark og kunstvandring",
    identityStatus: "resolved",
    identityProblem: "",
    locatorTypeCandidate: "park",
    requiresSplit: false,
    splitReason: ""
  },
  requiredEvidence: ["exact locked OSM park identity", "current whole-site sculpture-park source", "municipal neighbourhood-scope cross-check", "canonical duplicate control against current main"],
  evidence: [
    {
      sourceProvider: "osm",
      sourceName: `OpenStreetMap – Peer Gynt-parken way ${OSM_WAY_ID}`,
      sourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
      sourceObjectId: `osm-way:${OSM_WAY_ID}`,
      sourceQuality: "unique_exact_named_park_polygon",
      finding: `Fresh exact lookup resolves way ${OSM_WAY_ID} as ${park.name}, type=park, ${park.geojson.type} geometry and representation point ${coordinate.lat}, ${coordinate.lon}.`,
      canVerifyCoordinate: true,
      reason: "Exact named physical park geometry; no nearest or first-hit selection."
    },
    {
      sourceProvider: "manual_research",
      sourceName: "Peer Gynt-parken – official current site",
      sourceUrl: PARK_PAGE,
      sourceObjectId: "peer-gynt-parken:official-site",
      sourceQuality: "current_whole_site_identity",
      finding: "Defines Peer Gynt-parken at Løren as a sculpture park and international art walk inspired by Henrik Ibsen's Peer Gynt.",
      canVerifyCoordinate: false,
      reason: "Defines current whole-site identity and content scope; exact area geometry comes from the locked OSM way."
    },
    {
      sourceProvider: "municipality",
      sourceName: "Oslo kommune Byplan – Hva kan vi lære av Løren?",
      sourceUrl: OSLO_BYPLAN_PAGE,
      sourceObjectId: "oslo-kommune:byplan:peer-gynt-parken",
      sourceQuality: "municipal_neighbourhood_scope_crosscheck",
      finding: "Treats Peer Gynt-parken as a sculpture park and important public environment within the Løren neighbourhood.",
      canVerifyCoordinate: false,
      reason: "Cross-checks public place function and neighbourhood scope."
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: "osm", sourceObjectId: `osm-way:${OSM_WAY_ID}`, canApplyToPlace: true },
    { sourceProvider: "manual_research", sourceObjectId: "peer-gynt-parken:official-site", canApplyToPlace: false },
    { sourceProvider: "municipality", sourceObjectId: "oslo-kommune:byplan:peer-gynt-parken", canApplyToPlace: false }
  ],
  geometryCandidates: [{ sourceProvider: "osm", sourceObjectId: `osm-way:${OSM_WAY_ID}`, geometryType: park.geojson.type, coordRole: "area_anchor", canApplyToPlace: true }],
  coordinateCandidates: [{ lat: coordinate.lat, lon: coordinate.lon, coordRole: "area_anchor", sourceObjectId: `osm-way:${OSM_WAY_ID}`, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: "", nextAction: "Exact Peer Gynt-parken geometry and representation point are applied to the canonical sculpture-park place." },
  notes: [coordNote, `Fresh anchor drift from locked production coordinate: ${driftM.toFixed(2)} m.`, "Place-id and accepted Peer Gynt park identity names were absent from current manifest-loaded canonical place data before production."]
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

const reportDir = `reports/oslo-coordinate-control-batch-${batch}-peer-gynt-parken`;
mkdirSync(reportDir, { recursive: true });
writeJson(`${reportDir}/batch-${batch}-result.json`, {
  version: DATE,
  batch,
  placeId,
  status: "verified_geometry_applied_to_place",
  coordinate: { lat: place.lat, lon: place.lon, r: place.r, coordRole: place.coordRole, coordType: place.coordType },
  sourceObject: { sourceObjectId: `osm-way:${OSM_WAY_ID}`, name: park.name, category: park.category, type: park.type, geometryType: park.geojson.type },
  gates: { exactNameGate, semanticGate, geometryGate, coordinateGate, lockedCoordinateGate, parkSiteGate, byplanGate, duplicateIdentityMatches: identityMatches.length },
  driftFromLockedCoordinateM: Math.round(driftM * 100) / 100,
  representationLock: "Whole Peer Gynt sculpture park and international art walk; individual sculptures remain content layers unless independently canonical."
});
writeJson(`${reportDir}/nominatim-way-${OSM_WAY_ID}.json`, park);
writeFileSync(`${reportDir}/sources.md`, `# Peer Gynt-parken production sources\n\n- Peer Gynt-parken official site: ${PARK_PAGE}\n- Oslo kommune Byplan: ${OSLO_BYPLAN_PAGE}\n- OSM exact park object: https://www.openstreetmap.org/way/${OSM_WAY_ID}\n\nCanonical scope: the complete sculpture park at Løren as one public-art landscape and art walk.\n`, "utf8");
console.log(`Produced ${placeId} as batch ${batch}: ${place.lat},${place.lon}; source=osm-way:${OSM_WAY_ID}; drift=${driftM.toFixed(2)}m`);
