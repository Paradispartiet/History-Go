import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-21";
const reportDir = "reports/visitoslo-holmenkollen-audit-20260721/coordinate-intake";
mkdirSync(reportDir, { recursive: true });

function norm(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a").replace(/[^a-z0-9]+/g, " ").trim();
}
function haversineMeters(a, b) {
  const toRad = (d) => d * Math.PI / 180;
  const R = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "History-Go-coordinate-audit/1.0" } });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> ${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}
async function nominatim(queries, viewbox) {
  const attempts = [];
  const unique = new Map();
  for (const q of queries) {
    const params = new URLSearchParams({ q, format: "jsonv2", addressdetails: "1", namedetails: "1", extratags: "1", polygon_geojson: "1", limit: "20", bounded: "1", viewbox });
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const rows = await fetchJson(url);
    attempts.push({ q, url, rows });
    for (const row of rows) unique.set(`${row.osm_type}:${row.osm_id}`, row);
  }
  return { attempts, rows: [...unique.values()] };
}
function rowNames(row) {
  return [row.name, String(row.display_name ?? "").split(",")[0], ...Object.values(row.namedetails ?? {})].filter((v) => typeof v === "string").map(norm);
}
function exactRows(rows, aliases) {
  const wanted = new Set(aliases.map(norm));
  return rows.filter((row) => rowNames(row).some((name) => wanted.has(name)));
}
function nearest(places, point) {
  return places.filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon))).map((p) => ({ id: p.id, name: p.name, category: p.category, sourceFile: p.sourceFile, distanceM: Math.round(haversineMeters(point, { lat: Number(p.lat), lon: Number(p.lon) }) * 10) / 10 })).sort((a, b) => a.distanceM - b.distanceM).slice(0, 15);
}
function writeJson(file, value) {
  mkdirSync(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];

// Oslo Golfklubb: exact name plus exact golf_course type. Nominatim v2 may omit legacy class.
const golfId = "oslo_golfklubb_bogstad";
if (places.some((p) => p.id === golfId || norm(p.name) === "oslo golfklubb pa bogstad" || norm(p.name) === "oslo golfklubb")) throw new Error("Canonical Oslo Golfklubb identity already exists.");
const golfSearch = await nominatim(["Oslo Golfklubb, Oslo, Norway", "Bogstad golfbane, Oslo, Norway"], "10.55,60.01,10.75,59.90");
const golfExact = exactRows(golfSearch.rows, ["Oslo Golfklubb", "Oslo Golf Club", "Oslo Golfklubb Bogstad", "Bogstad golfbane"]);
const golfCandidates = golfExact.filter((row) => String(row.type ?? "").toLowerCase() === "golf_course");
if (golfCandidates.length !== 1) throw new Error(`Expected exactly one exact golf_course object, found ${golfCandidates.length}: ${JSON.stringify(golfExact.map((r) => ({ osm_type: r.osm_type, osm_id: r.osm_id, category: r.category, class: r.class, type: r.type, display_name: r.display_name })))}`);
const golf = golfCandidates[0];
const golfPoint = { lat: Number(golf.lat), lon: Number(golf.lon) };
const golfSourceId = `osm-${golf.osm_type}:${golf.osm_id}`;
const golfDecision = {
  version: DATE,
  placeId: golfId,
  name: "Oslo Golfklubb på Bogstad",
  primaryCategory: "sport",
  productionGate: "ready_for_canonical_production",
  representationDecision: "Create one canonical place for the stable golf-course facility at Bogstad, not the abstract organization and not Bogstad Manor.",
  coordinate: {
    lat: golfPoint.lat,
    lon: golfPoint.lon,
    r: 240,
    locatorType: "sports_facility",
    sourceProvider: "osm",
    sourceObjectId: golfSourceId,
    geocodeAccuracy: "geometric_center",
    coordRole: "area_anchor",
    coordStatus: "verified_geometry",
    coordSource: `OpenStreetMap ${golf.osm_type} ${golf.osm_id} – Oslo Golfklubb`,
    coordSourceId: golfSourceId,
    coordSourceUrl: `https://www.openstreetmap.org/${golf.osm_type}/${golf.osm_id}`,
    coordType: "sports_facility_center",
    coordNote: "Eksakt navngitt OSM-objekt med type golf_course for Oslo Golfklubb på Bogstad. Objektet ble valgt gjennom eksakt navne- og objekttypegate, ikke nearest/first-hit, og representerer selve golfanlegget."
  },
  duplicateGate: { canonicalIdentityMatches: [], nearestCanonicalPlaces: nearest(places, golfPoint) },
  selectedObject: { osmType: golf.osm_type, osmId: golf.osm_id, category: golf.category, class: golf.class, type: golf.type, displayName: golf.display_name, geojsonType: golf.geojson?.type ?? null, boundingbox: golf.boundingbox },
  searchAttempts: golfSearch.attempts
};
writeJson(`${reportDir}/${golfId}/decision.json`, golfDecision);
writeJson(`${reportDir}/${golfId}/result.json`, { ...golfDecision, status: "verified_object_candidate" });

// Ski Museum: exact museum object preferred; verified Kongeveien 40 address is fallback/cross-check.
const museumId = "holmenkollen_skimuseum";
if (places.some((p) => p.id === museumId || norm(p.name) === "skimuseet i holmenkollen")) throw new Error("Canonical Ski Museum identity already exists.");
execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const addressRun = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Kongeveien 40 Oslo"], { encoding: "utf8" });
if (addressRun.stdout) process.stdout.write(addressRun.stdout);
if (addressRun.stderr) process.stderr.write(addressRun.stderr);
const address = JSON.parse(String(addressRun.stdout || "").trim());
if (address?.status !== "verified_candidate") throw new Error(`Kongeveien 40 did not resolve cleanly: ${address?.status ?? "unknown"}`);

const museumSearch = await nominatim(["Skimuseet i Holmenkollen, Oslo, Norway", "Holmenkollen Ski Museum, Oslo, Norway"], "10.60,60.01,10.75,59.93");
const museumExact = exactRows(museumSearch.rows, ["Skimuseet i Holmenkollen", "Holmenkollen Ski Museum", "Ski Museum in Holmenkollen", "Skimuseet"]);
const museumCandidates = museumExact.filter((row) => String(row.type ?? "").toLowerCase() === "museum" || String(row.category ?? row.class ?? "").toLowerCase() === "tourism");
if (museumCandidates.length > 1) throw new Error(`Multiple exact museum objects require review: ${JSON.stringify(museumCandidates.map((r) => ({ osm_type: r.osm_type, osm_id: r.osm_id, category: r.category, class: r.class, type: r.type, display_name: r.display_name })))}`);

let museumCoord;
let selectedMuseumObject = null;
if (museumCandidates.length === 1) {
  const row = museumCandidates[0];
  const sourceObjectId = `osm-${row.osm_type}:${row.osm_id}`;
  selectedMuseumObject = row;
  museumCoord = {
    lat: Number(row.lat), lon: Number(row.lon), r: 55,
    locatorType: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "building" : "poi",
    sourceProvider: "osm", sourceObjectId,
    geocodeAccuracy: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "geometric_center" : "semantic_anchor",
    coordRole: "display_marker", coordStatus: "verified_geometry",
    coordSource: `OpenStreetMap ${row.osm_type} ${row.osm_id} – Skimuseet i Holmenkollen`, coordSourceId: sourceObjectId,
    coordSourceUrl: `https://www.openstreetmap.org/${row.osm_type}/${row.osm_id}`,
    coordType: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "museum_center" : "museum_point"
  };
} else {
  museumCoord = {
    lat: Number(address.coordinate.lat), lon: Number(address.coordinate.lon), r: 55,
    locatorType: "building", sourceProvider: "official_address", sourceObjectId: address.sourceObjectId,
    geocodeAccuracy: "rooftop", coordRole: "display_marker", coordStatus: "verified",
    coordSource: "geonorge_adresser_v1", coordSourceId: address.sourceObjectId, coordSourceUrl: address.sourceUrl, coordType: "address_point"
  };
}
const museumPoint = { lat: museumCoord.lat, lon: museumCoord.lon };
const parent = places.find((p) => p.id === "holmenkollen_nasjonalanlegg");
if (!parent) throw new Error("holmenkollen_nasjonalanlegg is missing from current main.");
const parentDistanceM = Math.round(haversineMeters(museumPoint, { lat: Number(parent.lat), lon: Number(parent.lon) }) * 10) / 10;
const addressDistanceM = Math.round(haversineMeters(museumPoint, { lat: Number(address.coordinate.lat), lon: Number(address.coordinate.lon) }) * 10) / 10;
if (addressDistanceM > 250) throw new Error(`Selected museum anchor is ${addressDistanceM} m from exact Kongeveien 40 address.`);

const museumDecision = {
  version: DATE,
  placeId: museumId,
  name: "Skimuseet i Holmenkollen",
  primaryCategory: "historie",
  productionGate: "ready_for_canonical_production",
  representationDecision: "Create the Ski Museum as a distinct stable museum institution inside the broader Holmenkollen National Ski Arena. Do not create a separate jump-tower place.",
  coordinate: {
    ...museumCoord,
    coordNote: selectedMuseumObject
      ? `Eksakt navngitt museumsobjekt for Skimuseet i Holmenkollen, kryssjekket mot offisiell besøksadresse Kongeveien 40 (${addressDistanceM} m). Museet er en egen institusjon inne i Holmenkollen nasjonalanlegg; hopptårnet forblir del av parent-stedet.`
      : "Offisiell adressekoordinat fra Geonorge for Kongeveien 40, brukt som museumsmarkør fordi ingen entydig separat OSM-museumsidentitet ble funnet. Museet er en egen institusjon inne i Holmenkollen nasjonalanlegg; hopptårnet forblir del av parent-stedet."
  },
  parentOverlapAudit: {
    parentPlaceId: "holmenkollen_nasjonalanlegg",
    parentName: parent.name,
    distanceM: parentDistanceM,
    conclusion: "Expected parent/child physical overlap, not identity duplication. The museum has its own persistent institution, collections and visitor identity; the arena remains the broader sport infrastructure place."
  },
  addressCrosscheck: { query: "Kongeveien 40 Oslo", sourceObjectId: address.sourceObjectId, lat: Number(address.coordinate.lat), lon: Number(address.coordinate.lon), distanceFromSelectedM: addressDistanceM },
  duplicateGate: { canonicalIdentityMatches: [], nearestCanonicalPlaces: nearest(places, museumPoint) },
  exactMuseumCandidates: museumExact.map((r) => ({ osmType: r.osm_type, osmId: r.osm_id, category: r.category, class: r.class, type: r.type, displayName: r.display_name, lat: r.lat, lon: r.lon, geojsonType: r.geojson?.type ?? null })),
  searchAttempts: museumSearch.attempts
};
writeJson(`${reportDir}/${museumId}/decision.json`, museumDecision);
writeJson(`${reportDir}/${museumId}/result.json`, { ...museumDecision, status: "verified_museum_candidate" });

const summary = {
  version: DATE,
  status: "all_candidates_coordinate_ready",
  approvedCandidates: 2,
  coordinateReady: 2,
  unresolved: 0,
  candidates: [
    { placeId: golfId, name: golfDecision.name, status: golfDecision.productionGate, sourceObjectId: golfDecision.coordinate.sourceObjectId, lat: golfDecision.coordinate.lat, lon: golfDecision.coordinate.lon },
    { placeId: museumId, name: museumDecision.name, status: museumDecision.productionGate, sourceObjectId: museumDecision.coordinate.sourceObjectId, lat: museumDecision.coordinate.lat, lon: museumDecision.coordinate.lon, parentDistanceM, addressDistanceM }
  ]
};
writeJson(`${reportDir}/summary.json`, summary);
writeFileSync(`${reportDir}/README.md`, `# VisitOSLO Holmenkollen — candidate coordinate intake\n\nDate: ${DATE}\n\nBoth approved candidates are coordinate-ready.\n\n- \`${golfId}\`: ${golfDecision.coordinate.sourceObjectId} at ${golfDecision.coordinate.lat}, ${golfDecision.coordinate.lon}\n- \`${museumId}\`: ${museumDecision.coordinate.sourceObjectId} at ${museumDecision.coordinate.lat}, ${museumDecision.coordinate.lon}\n\nThe golf facility is resolved through one exact named \`golf_course\` OSM object. The Ski Museum uses one exact named museum object when available, otherwise the exact Kongeveien 40 official address; proximity to \`holmenkollen_nasjonalanlegg\` is treated as expected parent/child overlap.\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
