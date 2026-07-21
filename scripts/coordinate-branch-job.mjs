import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-21";
const placeId = "holmenkollen_skimuseum";
const reportDir = "reports/visitoslo-holmenkollen-audit-20260721/skimuseum-coordinate-intake";
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
function names(row) {
  return [row.name, String(row.display_name ?? "").split(",")[0], ...Object.values(row.namedetails ?? {})].filter((v) => typeof v === "string").map(norm);
}
function nearest(places, point) {
  return places.filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon))).map((p) => ({ id: p.id, name: p.name, category: p.category, sourceFile: p.sourceFile, distanceM: Math.round(haversineMeters(point, { lat: Number(p.lat), lon: Number(p.lon) }) * 10) / 10 })).sort((a, b) => a.distanceM - b.distanceM).slice(0, 15);
}
function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const raw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(raw) ? raw : raw.places ?? [];
const duplicateMatches = places.filter((p) => p.id === placeId || ["skimuseet i holmenkollen", "holmenkollen ski museum", "skimuseet"].includes(norm(p.name))).map((p) => ({ id: p.id, name: p.name, category: p.category, sourceFile: p.sourceFile }));
if (duplicateMatches.length) throw new Error(`Canonical Ski Museum identity already exists: ${JSON.stringify(duplicateMatches)}`);

execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const addressRun = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Kongeveien 40 Oslo"], { encoding: "utf8" });
if (addressRun.stdout) process.stdout.write(addressRun.stdout);
if (addressRun.stderr) process.stderr.write(addressRun.stderr);
const address = JSON.parse(String(addressRun.stdout || "").trim());
if (address?.status !== "verified_candidate") throw new Error(`Kongeveien 40 did not resolve cleanly: ${address?.status ?? "unknown"}`);

const search = await nominatim(["Skimuseet i Holmenkollen, Oslo, Norway", "Holmenkollen Ski Museum, Oslo, Norway"], "10.60,60.01,10.75,59.93");
const aliases = new Set(["skimuseet i holmenkollen", "holmenkollen ski museum", "ski museum in holmenkollen", "skimuseet"].map(norm));
const exact = search.rows.filter((row) => names(row).some((name) => aliases.has(name)));
const museumObjects = exact.filter((row) => String(row.type ?? "").toLowerCase() === "museum" || String(row.category ?? row.class ?? "").toLowerCase() === "tourism");
if (museumObjects.length > 1) throw new Error(`Multiple exact museum objects require review: ${JSON.stringify(museumObjects.map((r) => ({ osm_type: r.osm_type, osm_id: r.osm_id, category: r.category, class: r.class, type: r.type, display_name: r.display_name })))}`);

let selected;
if (museumObjects.length === 1) {
  const row = museumObjects[0];
  const sourceObjectId = `osm-${row.osm_type}:${row.osm_id}`;
  selected = {
    authority: "osm_exact_museum",
    lat: Number(row.lat),
    lon: Number(row.lon),
    r: 55,
    locatorType: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "building" : "poi",
    sourceProvider: "osm",
    sourceObjectId,
    geocodeAccuracy: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "geometric_center" : "semantic_anchor",
    coordRole: "display_marker",
    coordStatus: "verified_geometry",
    coordSource: `OpenStreetMap ${row.osm_type} ${row.osm_id} – Skimuseet i Holmenkollen`,
    coordSourceId: sourceObjectId,
    coordSourceUrl: `https://www.openstreetmap.org/${row.osm_type}/${row.osm_id}`,
    coordType: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "museum_center" : "museum_point",
    rawObject: { osmType: row.osm_type, osmId: row.osm_id, category: row.category, class: row.class, type: row.type, displayName: row.display_name, boundingbox: row.boundingbox, geojsonType: row.geojson?.type ?? null }
  };
} else {
  selected = {
    authority: "official_address_fallback",
    lat: Number(address.coordinate.lat),
    lon: Number(address.coordinate.lon),
    r: 55,
    locatorType: "building",
    sourceProvider: "official_address",
    sourceObjectId: address.sourceObjectId,
    geocodeAccuracy: "rooftop",
    coordRole: "display_marker",
    coordStatus: "verified",
    coordSource: "geonorge_adresser_v1",
    coordSourceId: address.sourceObjectId,
    coordSourceUrl: address.sourceUrl,
    coordType: "address_point"
  };
}

const point = { lat: selected.lat, lon: selected.lon };
const parent = places.find((p) => p.id === "holmenkollen_nasjonalanlegg");
if (!parent) throw new Error("Expected holmenkollen_nasjonalanlegg parent is missing.");
const parentDistanceM = Math.round(haversineMeters(point, { lat: Number(parent.lat), lon: Number(parent.lon) }) * 10) / 10;
const addressDistanceM = Math.round(haversineMeters(point, { lat: Number(address.coordinate.lat), lon: Number(address.coordinate.lon) }) * 10) / 10;
if (addressDistanceM > 250) throw new Error(`Selected museum anchor is ${addressDistanceM} m from exact Kongeveien 40 address.`);

const coordinate = {
  lat: selected.lat,
  lon: selected.lon,
  r: selected.r,
  locatorType: selected.locatorType,
  sourceProvider: selected.sourceProvider,
  sourceObjectId: selected.sourceObjectId,
  geocodeAccuracy: selected.geocodeAccuracy,
  coordRole: selected.coordRole,
  coordStatus: selected.coordStatus,
  coordSource: selected.coordSource,
  coordSourceId: selected.coordSourceId,
  coordSourceUrl: selected.coordSourceUrl,
  coordType: selected.coordType,
  coordNote: selected.authority === "osm_exact_museum"
    ? `Eksakt navngitt museumsobjekt for Skimuseet i Holmenkollen, kryssjekket mot offisiell besøksadresse Kongeveien 40 (${addressDistanceM} m). Museet er en egen institusjon inne i Holmenkollen nasjonalanlegg; hopptårnet forblir del av parent-stedet.`
    : "Offisiell adressekoordinat fra Geonorge for Kongeveien 40, brukt som museumsmarkør fordi ingen entydig separat OSM-museumsidentitet ble funnet. Museet er en egen institusjon inne i Holmenkollen nasjonalanlegg; hopptårnet forblir del av parent-stedet."
};

const result = {
  version: DATE,
  placeId,
  name: "Skimuseet i Holmenkollen",
  status: "verified_museum_candidate",
  productionGate: "ready_for_canonical_production",
  primaryCategory: "historie",
  representationDecision: "Create the Ski Museum as a distinct persistent museum institution inside the broader Holmenkollen National Ski Arena. The jump tower is not a new place and remains represented by the parent arena identity.",
  coordinate,
  parentOverlapAudit: {
    parentPlaceId: "holmenkollen_nasjonalanlegg",
    parentName: parent.name,
    distanceM: parentDistanceM,
    conclusion: "Expected parent/child physical overlap, not identity duplication. The museum has its own persistent institution, collections and visitor identity; the arena remains the broader sports-infrastructure place."
  },
  addressCrosscheck: {
    query: "Kongeveien 40 Oslo",
    sourceObjectId: address.sourceObjectId,
    sourceUrl: address.sourceUrl,
    lat: Number(address.coordinate.lat),
    lon: Number(address.coordinate.lon),
    distanceFromSelectedM: addressDistanceM
  },
  duplicateGate: {
    canonicalIdentityMatches: [],
    nearestCanonicalPlaces: nearest(places, point)
  },
  exactMuseumCandidates: exact.map((r) => ({ osmType: r.osm_type, osmId: r.osm_id, category: r.category, class: r.class, type: r.type, displayName: r.display_name, lat: r.lat, lon: r.lon, geojsonType: r.geojson?.type ?? null })),
  searchAttempts: search.attempts
};
writeJson(`${reportDir}/result.json`, result);
writeJson(`${reportDir}/decision.json`, result);
writeFileSync(`${reportDir}/README.md`, `# Skimuseet i Holmenkollen — coordinate intake\n\nDate: ${DATE}\n\nStatus: **ready_for_canonical_production**\n\nApplied source: **${coordinate.sourceObjectId}**\n\nCoordinate: **${coordinate.lat}, ${coordinate.lon}**\n\nDistance to exact Kongeveien 40 address: **${addressDistanceM} m**\n\nDistance to existing Holmenkollen National Ski Arena anchor: **${parentDistanceM} m**\n\nThe overlap with the arena is intentional parent/child overlap. The canonical candidate is the museum institution only; no new jump-tower marker is approved.\n`, "utf8");

console.log(`Skimuseet i Holmenkollen: ready; source=${coordinate.sourceObjectId}; coordinate=${coordinate.lat},${coordinate.lon}; parentDistanceM=${parentDistanceM}; addressDistanceM=${addressDistanceM}`);
