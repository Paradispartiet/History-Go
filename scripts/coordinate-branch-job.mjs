import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const placeId = "ingierstrand_bad";
const reportDir = "reports/visitoslo-oslofjord-audit-20260721/ingierstrand-bad";
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

function flattenCoordinates(value, out = []) {
  if (!Array.isArray(value)) return out;
  if (value.length >= 2 && !Array.isArray(value[0]) && Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1]))) {
    out.push([Number(value[0]), Number(value[1])]);
    return out;
  }
  for (const child of value) flattenCoordinates(child, out);
  return out;
}

function geometryCenter(geometry, fallback) {
  if (!geometry) return fallback ? { ...fallback, method: "source_point" } : null;
  if (geometry.type === "Point") return { lon: Number(geometry.coordinates[0]), lat: Number(geometry.coordinates[1]), method: "official_point" };
  const coords = flattenCoordinates(geometry.coordinates);
  if (!coords.length) return fallback ? { ...fallback, method: "source_point_fallback" } : null;
  return {
    lon: coords.reduce((sum, [lon]) => sum + lon, 0) / coords.length,
    lat: coords.reduce((sum, [, lat]) => sum + lat, 0) / coords.length,
    method: "official_geometry_vertex_mean"
  };
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

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers: { accept: "application/json", ...headers } });
  const text = await response.text();
  if (!response.ok) return { ok: false, status: response.status, url, text, data: null };
  return { ok: true, status: response.status, url, text, data: JSON.parse(text) };
}

async function queryRiksantikvarenLayer(layerId) {
  const layerUrl = `https://kart.ra.no/arcgis/rest/services/Betatjenester/BetaKulturminner/MapServer/${layerId}`;
  const metadata = await fetchJson(`${layerUrl}?f=json`);
  if (!metadata.ok) return { layerId, metadata, attempts: [], features: [] };
  const stringFields = (metadata.data?.fields ?? [])
    .filter((field) => String(field.type).includes("String"))
    .filter((field) => /navn|name|beskriv|lokalitet|kulturminne/i.test(`${field.name} ${field.alias ?? ""}`));
  const attempts = [];
  const unique = new Map();
  for (const field of stringFields) {
    const where = `${field.name} LIKE '%Ingierstrand%'`;
    const params = new URLSearchParams({
      where,
      outFields: "*",
      returnGeometry: "true",
      outSR: "4326",
      f: "geojson"
    });
    const url = `${layerUrl}/query?${params.toString()}`;
    const response = await fetchJson(url);
    attempts.push({ field: field.name, alias: field.alias, url, ok: response.ok, status: response.status, count: response.data?.features?.length ?? 0 });
    for (const feature of response.data?.features ?? []) {
      const key = String(feature.id ?? feature.properties?.OBJECTID ?? JSON.stringify(feature.properties));
      if (!unique.has(key)) unique.set(key, feature);
    }
  }
  return { layerId, layerUrl, metadata: { fields: metadata.data?.fields ?? [] }, attempts, features: [...unique.values()] };
}

async function queryNominatim() {
  const params = new URLSearchParams({
    q: "Ingierstrand bad, Norway",
    format: "jsonv2",
    addressdetails: "1",
    extratags: "1",
    namedetails: "1",
    polygon_geojson: "1",
    limit: "20",
    bounded: "1",
    viewbox: "10.68,59.86,10.82,59.74"
  });
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const response = await fetchJson(url, { "user-agent": "History-Go-coordinate-audit/1.0 (repo audit)" });
  if (!response.ok) throw new Error(`Nominatim failed ${response.status}: ${response.text.slice(0, 500)}`);
  const rows = response.data;
  const wanted = new Set(["ingierstrand bad", "ingierstrand"]);
  const exact = rows.filter((row) => {
    const names = [row.name, String(row.display_name ?? "").split(",")[0], ...Object.values(row.namedetails ?? {})]
      .filter((value) => typeof value === "string")
      .map(norm);
    return names.some((name) => wanted.has(name));
  });
  return { url, rows, exact };
}

execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const addressAttempt = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Ingierstrandveien 30 Svartskog"], { encoding: "utf8" });
if (addressAttempt.stdout) process.stdout.write(addressAttempt.stdout);
if (addressAttempt.stderr) process.stderr.write(addressAttempt.stderr);
let addressResult = null;
try { addressResult = JSON.parse(String(addressAttempt.stdout || "").trim()); } catch {}

const raPolygon = await queryRiksantikvarenLayer(1);
const raPoint = await queryRiksantikvarenLayer(0);
const allRa = [
  ...raPolygon.features.map((feature) => ({ layerId: 1, feature })),
  ...raPoint.features.map((feature) => ({ layerId: 0, feature }))
].filter(({ feature }) => norm(JSON.stringify(feature.properties)).includes("ingierstrand"));

const polygonMatches = allRa.filter((row) => row.layerId === 1 && row.feature.geometry);
const pointMatches = allRa.filter((row) => row.layerId === 0 && row.feature.geometry);
const selectedRa = polygonMatches.length === 1 ? polygonMatches[0] : null;
const raCenter = selectedRa ? geometryCenter(selectedRa.feature.geometry) : null;
const pointCenter = pointMatches.length === 1 ? geometryCenter(pointMatches[0].feature.geometry) : null;
const raPointDistanceM = raCenter && pointCenter ? Math.round(haversineMeters(raCenter, pointCenter) * 10) / 10 : null;

const nominatim = await queryNominatim();
const exactOsmPhysical = nominatim.exact.filter((row) => {
  const type = String(row.type ?? "").toLowerCase();
  const cls = String(row.class ?? "").toLowerCase();
  return ["beach", "bathing_place", "recreation_ground", "park", "sports_centre", "attraction"].includes(type)
    || ["leisure", "natural", "tourism"].includes(cls);
});
const selectedOsm = exactOsmPhysical.length === 1 ? exactOsmPhysical[0] : null;
const osmCenter = selectedOsm ? geometryCenter(selectedOsm.geojson, { lat: Number(selectedOsm.lat), lon: Number(selectedOsm.lon) }) : null;

const applied = selectedRa && raCenter
  ? {
      authority: "riksantikvaren",
      sourceProvider: "official_heritage_registry",
      sourceObjectId: `riksantikvaren-feature:${selectedRa.feature.id ?? selectedRa.feature.properties?.OBJECTID ?? "ingierstrand"}`,
      sourceUrl: raPolygon.layerUrl,
      geometryType: selectedRa.feature.geometry.type,
      lat: raCenter.lat,
      lon: raCenter.lon,
      method: raCenter.method,
      properties: selectedRa.feature.properties
    }
  : selectedOsm && osmCenter
    ? {
        authority: "osm_exact_named_object",
        sourceProvider: "osm",
        sourceObjectId: `osm-${selectedOsm.osm_type}:${selectedOsm.osm_id}`,
        sourceUrl: `https://www.openstreetmap.org/${selectedOsm.osm_type}/${selectedOsm.osm_id}`,
        geometryType: selectedOsm.geojson?.type ?? null,
        lat: osmCenter.lat,
        lon: osmCenter.lon,
        method: osmCenter.method,
        properties: { class: selectedOsm.class, type: selectedOsm.type, displayName: selectedOsm.display_name }
      }
    : null;

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const identityMatches = places
  .filter((place) => norm(place.id) === norm(placeId) || norm(place.name) === "ingierstrand bad")
  .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
const nearest = applied
  ? places
    .filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
    .map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      distanceM: Math.round(haversineMeters({ lat: applied.lat, lon: applied.lon }, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10,
      sourceFile: place.sourceFile
    }))
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, 15)
  : [];

const crosschecks = {
  riksantikvarenPointDistanceM: raPointDistanceM,
  address: addressResult,
  osm: selectedOsm && osmCenter ? {
    sourceObjectId: `osm-${selectedOsm.osm_type}:${selectedOsm.osm_id}`,
    lat: osmCenter.lat,
    lon: osmCenter.lon,
    distanceFromAppliedM: applied ? Math.round(haversineMeters({ lat: applied.lat, lon: applied.lon }, osmCenter) * 10) / 10 : null
  } : null
};

const status = applied && identityMatches.length === 0 ? "verified_complex_candidate" : applied ? "identity_review_required" : "needs_review";
const result = {
  version: "2026-07-21",
  placeId,
  status,
  representationLock: "whole protected functionalist bathing complex; not restaurant business alone",
  appliedCandidate: applied,
  crosschecks,
  duplicateGate: {
    canonicalIdentityMatches: identityMatches,
    nearestCanonicalPlaces: nearest
  },
  riksantikvaren: {
    polygonLayerAttempts: raPolygon.attempts,
    pointLayerAttempts: raPoint.attempts,
    polygonMatches: polygonMatches.map(({ feature }) => ({ id: feature.id, properties: feature.properties, geometryType: feature.geometry?.type ?? null })),
    pointMatches: pointMatches.map(({ feature }) => ({ id: feature.id, properties: feature.properties, geometryType: feature.geometry?.type ?? null }))
  },
  nominatim: {
    url: nominatim.url,
    exactMatchCount: nominatim.exact.length,
    acceptedPhysicalExactMatchCount: exactOsmPhysical.length,
    exactMatches: nominatim.exact
  }
};
writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
writeFileSync(`${reportDir}/README.md`, `# Ingierstrand bad — complex coordinate intake\n\nDate: 2026-07-21\n\nStatus: **${status}**\n\nRepresentation lock: the complete protected functionalist bathing complex, not the restaurant business alone.\n\nPrimary applied authority: **${applied?.authority ?? "none"}**\n\nApplied source object: **${applied?.sourceObjectId ?? "none"}**\n\nApplied coordinate: **${applied ? `${applied.lat}, ${applied.lon}` : "not resolved"}**\n\nThe runner prioritizes Riksantikvaren's official protected-site geometry. An exact named OSM physical object is accepted only as fallback. The Geonorge address for Ingierstrandveien 30 is retained as a cross-check and may not redefine the whole site as a restaurant building.\n`, "utf8");

console.log(`Ingierstrand bad: ${status}; authority=${applied?.authority ?? "none"}; source=${applied?.sourceObjectId ?? "none"}`);
