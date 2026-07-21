import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-21";
const reportDir = "reports/visitoslo-holmenkollen-audit-20260721/coordinate-intake";
mkdirSync(reportDir, { recursive: true });

function norm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function haversineMeters(a, b) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const R = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "History-Go-coordinate-audit/1.0 (repo audit)"
    }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> ${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

async function nominatimSearch({ queries, viewbox }) {
  const attempts = [];
  const unique = new Map();
  for (const query of queries) {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      addressdetails: "1",
      extratags: "1",
      namedetails: "1",
      polygon_geojson: "1",
      limit: "20",
      bounded: "1",
      viewbox
    });
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const rows = await fetchJson(url);
    attempts.push({ query, url, resultCount: rows.length, rows });
    for (const row of rows) {
      const key = `${row.osm_type}:${row.osm_id}`;
      if (!unique.has(key)) unique.set(key, row);
    }
  }
  return { attempts, rows: [...unique.values()] };
}

function rowNames(row) {
  const values = [row.name, String(row.display_name ?? "").split(",")[0], ...Object.values(row.namedetails ?? {})];
  return [...new Set(values.filter((value) => typeof value === "string").map(norm))];
}

function exactNamedRows(rows, aliases) {
  const wanted = new Set(aliases.map(norm));
  return rows.filter((row) => rowNames(row).some((name) => wanted.has(name)));
}

function nearestPlaces(places, point, limit = 15) {
  return places
    .filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
    .map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      distanceM: Math.round(haversineMeters(point, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10,
      sourceFile: place.sourceFile
    }))
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, limit);
}

function canonicalIdentityMatches(places, id, aliases) {
  const wanted = new Set([id, ...aliases].map(norm));
  return places
    .filter((place) => wanted.has(norm(place.id)) || wanted.has(norm(place.name)))
    .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
}

function writeJson(file, value) {
  mkdirSync(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];

// 1. Oslo Golfklubb at Bogstad — exact golf-course object first.
const golfAliases = ["Oslo Golfklubb", "Oslo Golf Club", "Bogstad golfbane", "Oslo Golfklubb Bogstad"];
const golfSearch = await nominatimSearch({
  queries: ["Oslo Golfklubb, Oslo, Norway", "Bogstad golfbane, Oslo, Norway"],
  viewbox: "10.55,60.01,10.75,59.90"
});
const golfExact = exactNamedRows(golfSearch.rows, golfAliases);
const golfAccepted = golfExact.filter((row) => String(row.class).toLowerCase() === "leisure" && String(row.type).toLowerCase() === "golf_course");
if (golfAccepted.length !== 1) {
  throw new Error(`Expected exactly one exact Oslo Golfklubb golf_course object, found ${golfAccepted.length}: ${JSON.stringify(golfExact.map((row) => ({ osm_type: row.osm_type, osm_id: row.osm_id, class: row.class, type: row.type, display_name: row.display_name })))}`);
}
const golfRow = golfAccepted[0];
const golfPoint = { lat: Number(golfRow.lat), lon: Number(golfRow.lon) };
const golfId = "oslo_golfklubb_bogstad";
const golfDuplicates = canonicalIdentityMatches(places, golfId, golfAliases);
if (golfDuplicates.length) throw new Error(`Canonical golf identity already exists: ${JSON.stringify(golfDuplicates)}`);
const golfNearest = nearestPlaces(places, golfPoint);
const golfResult = {
  version: DATE,
  placeId: golfId,
  name: "Oslo Golfklubb på Bogstad",
  status: "verified_object_candidate",
  selectionRule: "exact normalized name + OSM leisure=golf_course inside predefined Bogstad/Holmenkollen search scope; no nearest/first-hit selection",
  selected: {
    sourceProvider: "osm",
    sourceObjectId: `osm-${golfRow.osm_type}:${golfRow.osm_id}`,
    sourceUrl: `https://www.openstreetmap.org/${golfRow.osm_type}/${golfRow.osm_id}`,
    osmType: golfRow.osm_type,
    osmId: golfRow.osm_id,
    class: golfRow.class,
    type: golfRow.type,
    displayName: golfRow.display_name,
    lat: golfPoint.lat,
    lon: golfPoint.lon,
    boundingbox: golfRow.boundingbox,
    geojsonType: golfRow.geojson?.type ?? null
  },
  duplicateGate: {
    canonicalIdentityMatches: golfDuplicates,
    nearestCanonicalPlaces: golfNearest,
    conclusion: "No canonical Oslo Golfklubb/Bogstad golf-course identity exists. Nearby Bogstad Manor and Bogstadvannet are distinct physical identities."
  },
  searchAttempts: golfSearch.attempts
};
writeJson(`${reportDir}/${golfId}/result.json`, golfResult);
writeJson(`${reportDir}/${golfId}/decision.json`, {
  version: DATE,
  placeId: golfId,
  primaryCategory: "sport",
  productionGate: "ready_for_canonical_production",
  representationDecision: "Create one canonical sport place for the stable Oslo Golfklubb golf-course facility at Bogstad. The place represents the course/facility, not the abstract organization and not Bogstad Manor.",
  coordinate: {
    lat: golfPoint.lat,
    lon: golfPoint.lon,
    r: 240,
    locatorType: "sports_facility",
    sourceProvider: "osm",
    sourceObjectId: `osm-${golfRow.osm_type}:${golfRow.osm_id}`,
    geocodeAccuracy: "geometric_center",
    coordRole: "area_anchor",
    coordStatus: "verified_geometry",
    coordSource: `OpenStreetMap ${golfRow.osm_type} ${golfRow.osm_id} – Oslo Golfklubb`,
    coordSourceId: `osm-${golfRow.osm_type}:${golfRow.osm_id}`,
    coordSourceUrl: `https://www.openstreetmap.org/${golfRow.osm_type}/${golfRow.osm_id}`,
    coordType: "sports_facility_center",
    coordNote: "Eksakt navngitt OSM-objekt med leisure=golf_course for Oslo Golfklubb på Bogstad, valgt gjennom låst objekttypefilter og ikke nearest/first-hit. Punktet representerer golfanlegget som fysisk område og er ikke et anker for Bogstad gård eller Bogstadvannet."
  },
  duplicateGate: golfResult.duplicateGate
});

// 2. Ski Museum — prefer exact named museum object, fall back to exact official address.
execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const addressAttempt = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Kongeveien 40 Oslo"], { encoding: "utf8" });
if (addressAttempt.stdout) process.stdout.write(addressAttempt.stdout);
if (addressAttempt.stderr) process.stderr.write(addressAttempt.stderr);
const museumAddress = JSON.parse(String(addressAttempt.stdout || "").trim());
if (museumAddress?.status !== "verified_candidate") {
  throw new Error(`Expected verified Kongeveien 40 address candidate, got ${museumAddress?.status ?? "unknown"}.`);
}
const museumAliases = ["Skimuseet i Holmenkollen", "Holmenkollen Ski Museum", "Ski Museum in Holmenkollen", "Skimuseet"];
const museumSearch = await nominatimSearch({
  queries: ["Skimuseet i Holmenkollen, Oslo, Norway", "Holmenkollen Ski Museum, Oslo, Norway"],
  viewbox: "10.60,60.01,10.75,59.93"
});
const museumExact = exactNamedRows(museumSearch.rows, museumAliases);
const museumAccepted = museumExact.filter((row) => String(row.type).toLowerCase() === "museum" || String(row.class).toLowerCase() === "tourism");
let museumSelected;
if (museumAccepted.length === 1) {
  const row = museumAccepted[0];
  museumSelected = {
    authority: "osm_exact_museum",
    sourceProvider: "osm",
    sourceObjectId: `osm-${row.osm_type}:${row.osm_id}`,
    sourceUrl: `https://www.openstreetmap.org/${row.osm_type}/${row.osm_id}`,
    lat: Number(row.lat),
    lon: Number(row.lon),
    locatorType: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "building" : "poi",
    geocodeAccuracy: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "geometric_center" : "semantic_anchor",
    coordRole: "display_marker",
    coordStatus: "verified_geometry",
    coordSource: `OpenStreetMap ${row.osm_type} ${row.osm_id} – Skimuseet i Holmenkollen`,
    coordSourceId: `osm-${row.osm_type}:${row.osm_id}`,
    coordSourceUrl: `https://www.openstreetmap.org/${row.osm_type}/${row.osm_id}`,
    coordType: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "museum_center" : "museum_point",
    rawObject: row
  };
} else if (museumAccepted.length === 0) {
  museumSelected = {
    authority: "official_address_fallback",
    sourceProvider: "official_address",
    sourceObjectId: museumAddress.sourceObjectId,
    sourceUrl: museumAddress.sourceUrl,
    lat: Number(museumAddress.coordinate.lat),
    lon: Number(museumAddress.coordinate.lon),
    locatorType: "building",
    geocodeAccuracy: "rooftop",
    coordRole: "display_marker",
    coordStatus: "verified",
    coordSource: "geonorge_adresser_v1",
    coordSourceId: museumAddress.sourceObjectId,
    coordSourceUrl: museumAddress.sourceUrl,
    coordType: "address_point"
  };
} else {
  throw new Error(`Multiple exact Ski Museum objects require review: ${JSON.stringify(museumAccepted.map((row) => ({ osm_type: row.osm_type, osm_id: row.osm_id, class: row.class, type: row.type, display_name: row.display_name })))}`);
}

const museumId = "holmenkollen_skimuseum";
const museumDuplicates = canonicalIdentityMatches(places, museumId, museumAliases);
if (museumDuplicates.length) throw new Error(`Canonical Ski Museum identity already exists: ${JSON.stringify(museumDuplicates)}`);
const museumPoint = { lat: museumSelected.lat, lon: museumSelected.lon };
const museumNearest = nearestPlaces(places, museumPoint);
const parent = places.find((place) => place.id === "holmenkollen_nasjonalanlegg");
if (!parent) throw new Error("Expected canonical holmenkollen_nasjonalanlegg parent is missing.");
const parentDistanceM = Math.round(haversineMeters(museumPoint, { lat: Number(parent.lat), lon: Number(parent.lon) }) * 10) / 10;
const addressDistanceM = Math.round(haversineMeters(museumPoint, { lat: Number(museumAddress.coordinate.lat), lon: Number(museumAddress.coordinate.lon) }) * 10) / 10;
if (addressDistanceM > 250) throw new Error(`Selected Ski Museum object is ${addressDistanceM} m from exact Kongeveien 40 address; manual review required.`);

const museumResult = {
  version: DATE,
  placeId: museumId,
  name: "Skimuseet i Holmenkollen",
  status: "verified_museum_candidate",
  selected: museumSelected,
  addressCrosscheck: {
    query: "Kongeveien 40 Oslo",
    sourceObjectId: museumAddress.sourceObjectId,
    lat: Number(museumAddress.coordinate.lat),
    lon: Number(museumAddress.coordinate.lon),
    distanceFromSelectedM: addressDistanceM
  },
  parentOverlapAudit: {
    parentPlaceId: "holmenkollen_nasjonalanlegg",
    parentName: parent.name,
    distanceM: parentDistanceM,
    conclusion: "Physical overlap/proximity is expected and not a duplicate: the museum is a distinct persistent institution and visitor place inside the broader national ski arena complex. The jump tower remains represented by the parent arena scope."
  },
  duplicateGate: {
    canonicalIdentityMatches: museumDuplicates,
    nearestCanonicalPlaces: museumNearest
  },
  exactMuseumCandidates: museumExact.map((row) => ({ osmType: row.osm_type, osmId: row.osm_id, class: row.class, type: row.type, displayName: row.display_name, lat: row.lat, lon: row.lon, geojsonType: row.geojson?.type ?? null })),
  searchAttempts: museumSearch.attempts
};
writeJson(`${reportDir}/${museumId}/result.json`, museumResult);
writeJson(`${reportDir}/${museumId}/decision.json`, {
  version: DATE,
  placeId: museumId,
  primaryCategory: "historie",
  productionGate: "ready_for_canonical_production",
  representationDecision: "Create one canonical history/museum place for Skimuseet i Holmenkollen. The museum is a distinct institution inside Holmenkollen National Ski Arena; the jump tower is not a new place and remains within the existing arena identity.",
  coordinate: {
    lat: museumSelected.lat,
    lon: museumSelected.lon,
    r: 55,
    locatorType: museumSelected.locatorType,
    sourceProvider: museumSelected.sourceProvider,
    sourceObjectId: museumSelected.sourceObjectId,
    geocodeAccuracy: museumSelected.geocodeAccuracy,
    coordRole: museumSelected.coordRole,
    coordStatus: museumSelected.coordStatus,
    coordSource: museumSelected.coordSource,
    coordSourceId: museumSelected.coordSourceId,
    coordSourceUrl: museumSelected.coordSourceUrl,
    coordType: museumSelected.coordType,
    coordNote: museumSelected.authority === "osm_exact_museum"
      ? `Eksakt navngitt museumsobjekt for Skimuseet i Holmenkollen, kryssjekket mot den offisielle besøksadressen Kongeveien 40 (${addressDistanceM} m). Punktet representerer museet som egen institusjon inne i Holmenkollen nasjonalanlegg og oppretter ikke et separat hopptårn-place.`
      : `Offisiell adressekoordinat fra Geonorge for Kongeveien 40, brukt som museumsmarkør etter at ingen entydig separat OSM-museumsidentitet ble funnet. Museet behandles som egen institusjon inne i Holmenkollen nasjonalanlegg; hopptårnet forblir del av parent-stedet.`,
  },
  parentOverlapAudit: museumResult.parentOverlapAudit,
  duplicateGate: museumResult.duplicateGate
});

const summary = {
  version: DATE,
  status: "all_candidates_coordinate_ready",
  approvedCandidates: 2,
  coordinateReady: 2,
  unresolved: 0,
  candidates: [
    { placeId: golfId, name: "Oslo Golfklubb på Bogstad", status: "ready_for_canonical_production", sourceObjectId: `osm-${golfRow.osm_type}:${golfRow.osm_id}`, lat: golfPoint.lat, lon: golfPoint.lon },
    { placeId: museumId, name: "Skimuseet i Holmenkollen", status: "ready_for_canonical_production", sourceObjectId: museumSelected.sourceObjectId, lat: museumSelected.lat, lon: museumSelected.lon, parentDistanceM, addressDistanceM }
  ]
};
writeJson(`${reportDir}/summary.json`, summary);
writeFileSync(`${reportDir}/README.md`, `# VisitOSLO Holmenkollen — candidate coordinate intake\n\nDate: ${DATE}\n\nBoth scope-approved candidates are coordinate-ready.\n\n| placeId | Status | Source object | Coordinate |\n|---|---|---|---|\n| \`${golfId}\` | ready | \`osm-${golfRow.osm_type}:${golfRow.osm_id}\` | ${golfPoint.lat}, ${golfPoint.lon} |\n| \`${museumId}\` | ready | \`${museumSelected.sourceObjectId}\` | ${museumSelected.lat}, ${museumSelected.lon} |\n\nThe golf course is resolved through one exact named \`leisure=golf_course\` OSM object. The Ski Museum prefers one exact museum object and otherwise falls back to the exact official address Kongeveien 40; its physical proximity to \`holmenkollen_nasjonalanlegg\` is expected parent/child overlap, not identity duplication.\n`, "utf8");

console.log(JSON.stringify(summary, null, 2));
