import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const placeId = "ingierstrand_bad";
const reportDir = "reports/visitoslo-oslofjord-audit-20260721/ingierstrand-bad-v2";
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

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json, application/geo+json" } });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> ${response.status}: ${text.slice(0, 1000)}`);
  return JSON.parse(text);
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

function geometryCenter(geometry) {
  if (!geometry) return null;
  if (geometry.type === "Point") return { lon: Number(geometry.coordinates[0]), lat: Number(geometry.coordinates[1]), method: "official_point" };
  const coords = flattenCoordinates(geometry.coordinates);
  if (!coords.length) return null;
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

async function queryRiksantikvaren(layerId) {
  const params = new URLSearchParams({
    where: "1=1",
    geometry: "10.735,59.808,10.762,59.828",
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson"
  });
  const url = `https://kart.ra.no/arcgis/rest/services/Betatjenester/BetaKulturminner/MapServer/${layerId}/query?${params.toString()}`;
  const data = await fetchJson(url);
  return { layerId, url, features: data?.features ?? [] };
}

async function querySsr() {
  const attempts = [];
  for (const endpoint of ["navn", "sted"]) {
    const params = new URLSearchParams({ sok: "Ingierstrand bad", treffPerSide: "100", side: "1" });
    const url = `https://api.kartverket.no/stedsnavn/v1/${endpoint}?${params.toString()}`;
    attempts.push({ endpoint, url, data: await fetchJson(url) });
  }
  return attempts;
}

function collectObjects(value, out = []) {
  if (!value || typeof value !== "object") return out;
  if (!Array.isArray(value)) out.push(value);
  for (const child of Array.isArray(value) ? value : Object.values(value)) collectObjects(child, out);
  return out;
}

function extractCoordinate(obj) {
  if (!obj || typeof obj !== "object") return null;
  if (Array.isArray(obj.coordinates) && obj.coordinates.length >= 2 && !Array.isArray(obj.coordinates[0])) {
    const [lon, lat] = obj.coordinates.map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon, source: "coordinates" };
  }
  for (const [key, value] of Object.entries(obj)) {
    if (/representasjonspunkt|punkt|geometry|geometri/i.test(key) && value && typeof value === "object") {
      const nested = extractCoordinate(value);
      if (nested) return { ...nested, source: `${key}.${nested.source}` };
    }
  }
  const lat = obj.lat ?? obj.latitude;
  const lon = obj.lon ?? obj.lng ?? obj.longitude;
  if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lon))) return { lat: Number(lat), lon: Number(lon), source: "lat_lon" };
  return null;
}

execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const addressAttempt = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Ingierstrandveien 30 Svartskog"], { encoding: "utf8" });
if (addressAttempt.stdout) process.stdout.write(addressAttempt.stdout);
if (addressAttempt.stderr) process.stderr.write(addressAttempt.stderr);
const addressResult = JSON.parse(String(addressAttempt.stdout || "").trim());

const raLayers = [await queryRiksantikvaren(1), await queryRiksantikvaren(0)];
const raMatches = raLayers.flatMap((layer) => layer.features.map((feature) => ({ layerId: layer.layerId, sourceUrl: layer.url, feature })))
  .filter(({ feature }) => norm(JSON.stringify(feature.properties ?? {})).includes("ingierstrand"));
const raPolygonMatches = raMatches.filter(({ layerId, feature }) => layerId === 1 && feature.geometry && feature.geometry.type !== "Point");
const raPointMatches = raMatches.filter(({ layerId, feature }) => layerId === 0 && feature.geometry);

const selectedRa = raPolygonMatches.length === 1 ? raPolygonMatches[0] : null;
const raCenter = selectedRa ? geometryCenter(selectedRa.feature.geometry) : null;
const selectedRaPoint = raPointMatches.length === 1 ? raPointMatches[0] : null;
const raPointCenter = selectedRaPoint ? geometryCenter(selectedRaPoint.feature.geometry) : null;

const ssrAttempts = await querySsr();
const ssrExactObjects = ssrAttempts.flatMap((attempt) => collectObjects(attempt.data))
  .filter((obj) => Object.values(obj).some((value) => typeof value === "string" && norm(value) === "ingierstrand bad"));
const ssrCoordinateRows = ssrExactObjects.map((obj) => ({ obj, coordinate: extractCoordinate(obj) })).filter((row) => row.coordinate);
const uniqueSsr = [];
for (const row of ssrCoordinateRows) {
  const key = `${row.coordinate.lat.toFixed(7)},${row.coordinate.lon.toFixed(7)}`;
  if (!uniqueSsr.some((item) => item.key === key)) uniqueSsr.push({ key, ...row });
}
const ssrSelected = uniqueSsr.length === 1 ? uniqueSsr[0] : null;

const applied = selectedRa && raCenter
  ? {
      authority: "riksantikvaren_protected_geometry",
      sourceProvider: "official_heritage_registry",
      sourceObjectId: `riksantikvaren:${selectedRa.feature.properties?.KulturminneID ?? selectedRa.feature.properties?.LokalitetID ?? selectedRa.feature.id}`,
      sourceUrl: selectedRa.sourceUrl,
      featureId: selectedRa.feature.id,
      geometryType: selectedRa.feature.geometry.type,
      lat: raCenter.lat,
      lon: raCenter.lon,
      coordinateMethod: raCenter.method,
      properties: selectedRa.feature.properties
    }
  : ssrSelected
    ? {
        authority: "kartverket_ssr_site_point",
        sourceProvider: "kartverket_ssr",
        sourceObjectId: `kartverket-ssr:${ssrSelected.obj.stedsnummer ?? ssrSelected.obj.stednummer ?? ssrSelected.obj.sted?.stedsnummer ?? 448130}`,
        sourceUrl: ssrAttempts.find((attempt) => attempt.endpoint === "sted")?.url,
        geometryType: "Point",
        lat: ssrSelected.coordinate.lat,
        lon: ssrSelected.coordinate.lon,
        coordinateMethod: ssrSelected.coordinate.source,
        properties: ssrSelected.obj
      }
    : null;

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const identityMatches = places.filter((place) => norm(place.id) === norm(placeId) || norm(place.name) === "ingierstrand bad")
  .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
const nearest = applied ? places
  .filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
  .map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    distanceM: Math.round(haversineMeters({ lat: applied.lat, lon: applied.lon }, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10,
    sourceFile: place.sourceFile
  }))
  .sort((a, b) => a.distanceM - b.distanceM)
  .slice(0, 15) : [];

const addressDistanceM = applied && addressResult?.coordinate
  ? Math.round(haversineMeters({ lat: applied.lat, lon: applied.lon }, { lat: Number(addressResult.coordinate.lat), lon: Number(addressResult.coordinate.lon) }) * 10) / 10
  : null;
const raPointDistanceM = applied && raPointCenter
  ? Math.round(haversineMeters({ lat: applied.lat, lon: applied.lon }, raPointCenter) * 10) / 10
  : null;

const status = applied && identityMatches.length === 0 ? "verified_complex_candidate" : applied ? "identity_review_required" : "needs_review";
const result = {
  version: "2026-07-21",
  placeId,
  status,
  representationLock: "whole protected functionalist bathing complex; not restaurant business alone",
  appliedCandidate: applied,
  crosschecks: {
    geonorgeAddress: addressResult,
    addressDistanceFromAppliedM: addressDistanceM,
    riksantikvarenPointDistanceFromAppliedM: raPointDistanceM,
    ssrUniqueCoordinateCount: uniqueSsr.length,
    ssrCandidate: ssrSelected ? { coordinate: ssrSelected.coordinate, rawObject: ssrSelected.obj } : null
  },
  duplicateGate: { canonicalIdentityMatches: identityMatches, nearestCanonicalPlaces: nearest },
  riksantikvaren: {
    layers: raLayers.map((layer) => ({ layerId: layer.layerId, url: layer.url, returnedFeatureCount: layer.features.length })),
    nameMatchedFeatureCount: raMatches.length,
    polygonMatches: raPolygonMatches.map(({ layerId, feature }) => ({ layerId, featureId: feature.id, properties: feature.properties, geometryType: feature.geometry?.type })),
    pointMatches: raPointMatches.map(({ layerId, feature }) => ({ layerId, featureId: feature.id, properties: feature.properties, geometryType: feature.geometry?.type }))
  },
  ssrAttempts
};
writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
writeFileSync(`${reportDir}/README.md`, `# Ingierstrand bad — protected-complex coordinate intake v2\n\nDate: 2026-07-21\n\nStatus: **${status}**\n\nApplied authority: **${applied?.authority ?? "none"}**\n\nApplied source object: **${applied?.sourceObjectId ?? "none"}**\n\nApplied coordinate: **${applied ? `${applied.lat}, ${applied.lon}` : "not resolved"}**\n\nDistance to exact Geonorge address point: **${addressDistanceM ?? "n/a"} m**\n\nThis pass searches Riksantikvaren spatially around the known Ingierstrand complex rather than assuming a searchable field name. If one protected polygon is identified as Ingierstrand, its geometry is authoritative. Otherwise the exact Kartverket SSR site point is the fallback semantic site anchor, while the restaurant address remains only a cross-check.\n`, "utf8");
console.log(`Ingierstrand bad v2: ${status}; authority=${applied?.authority ?? "none"}; source=${applied?.sourceObjectId ?? "none"}; addressDistanceM=${addressDistanceM}`);
