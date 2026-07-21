import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const placeId = "ingierstrand_bad";
const reportDir = "reports/visitoslo-oslofjord-audit-20260721/ingierstrand-bad-v3";
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

function exactSpellings(row) {
  return [row.skrivemåte, ...(row.stedsnavn ?? []).map((name) => name.skrivemåte)].filter(Boolean).map(norm);
}

function ssrCoordinate(row) {
  const p = row.representasjonspunkt;
  if (Number.isFinite(Number(p?.nord)) && Number.isFinite(Number(p?.øst))) {
    return { lat: Number(p.nord), lon: Number(p.øst), method: "representasjonspunkt.nord_øst" };
  }
  const coords = row.geojson?.geometry?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    return { lat: Number(coords[1]), lon: Number(coords[0]), method: "geojson.geometry.coordinates" };
  }
  throw new Error(`SSR row ${row.stedsnummer} has no coordinate.`);
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
  if (geometry.type === "Point" && Array.isArray(geometry.coordinates)) {
    return { lon: Number(geometry.coordinates[0]), lat: Number(geometry.coordinates[1]), method: "official_point" };
  }
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

async function querySsr() {
  const attempts = [];
  for (const endpoint of ["navn", "sted"]) {
    const params = new URLSearchParams({ sok: "Ingierstrand bad", treffPerSide: "100", side: "1" });
    const url = `https://api.kartverket.no/stedsnavn/v1/${endpoint}?${params.toString()}`;
    attempts.push({ endpoint, url, data: await fetchJson(url) });
  }
  const groups = attempts.map((attempt) => ({
    endpoint: attempt.endpoint,
    rows: (attempt.data?.navn ?? []).filter((row) =>
      exactSpellings(row).includes("ingierstrand bad")
      && Number(row.stedsnummer) === 448130
      && row.stedstatus === "aktiv"
    )
  }));
  if (groups.some((group) => group.rows.length !== 1)) {
    throw new Error(`Expected exact active SSR stedsnummer 448130 in both endpoints: ${JSON.stringify(groups.map((g) => ({ endpoint: g.endpoint, count: g.rows.length, rows: g.rows })))}`);
  }
  const navnRow = groups.find((group) => group.endpoint === "navn").rows[0];
  const stedRow = groups.find((group) => group.endpoint === "sted").rows[0];
  const a = ssrCoordinate(navnRow);
  const b = ssrCoordinate(stedRow);
  const distanceM = Math.round(haversineMeters(a, b) * 10) / 10;
  if (distanceM > 1) throw new Error(`SSR /navn and /sted differ by ${distanceM} m.`);
  return { attempts, navnRow, stedRow, coordinate: a, endpointDistanceM: distanceM };
}

async function queryRiksantikvarenFind() {
  const params = new URLSearchParams({
    searchText: "Ingierstrand",
    contains: "true",
    searchFields: "navn,Navn",
    layers: "1,4,5,6,7,8,15,16",
    returnGeometry: "true",
    sr: "4326",
    f: "json"
  });
  const url = `https://kart.ra.no/arcgis/rest/services/Distribusjon/Kulturminner20180301/MapServer/find?${params.toString()}`;
  const data = await fetchJson(url);
  return { url, results: data?.results ?? [] };
}

function normalizeArcGisGeometry(geometry) {
  if (!geometry) return null;
  if (Number.isFinite(Number(geometry.x)) && Number.isFinite(Number(geometry.y))) {
    return { type: "Point", coordinates: [Number(geometry.x), Number(geometry.y)] };
  }
  if (Array.isArray(geometry.rings)) return { type: "Polygon", coordinates: geometry.rings };
  if (Array.isArray(geometry.paths)) return { type: "MultiLineString", coordinates: geometry.paths };
  return null;
}

execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const addressAttempt = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", "Ingierstrandveien 30 Svartskog"], { encoding: "utf8" });
if (addressAttempt.stdout) process.stdout.write(addressAttempt.stdout);
if (addressAttempt.stderr) process.stderr.write(addressAttempt.stderr);
const addressResult = JSON.parse(String(addressAttempt.stdout || "").trim());
if (addressResult?.status !== "verified_candidate") throw new Error(`Expected exact Ingierstrand address cross-check, got ${addressResult?.status}.`);

const ssr = await querySsr();
const heritage = await queryRiksantikvarenFind();
const heritageMatches = heritage.results.filter((row) => norm(JSON.stringify({ value: row.value, attributes: row.attributes })).includes("ingierstrand"));
const heritageCandidates = heritageMatches.map((row) => {
  const geometry = normalizeArcGisGeometry(row.geometry);
  return {
    layerId: row.layerId,
    layerName: row.layerName,
    displayFieldName: row.displayFieldName,
    foundFieldName: row.foundFieldName,
    value: row.value,
    attributes: row.attributes,
    geometry,
    center: geometryCenter(geometry)
  };
});

const exactNamedAreaCandidates = heritageCandidates.filter((row) => {
  const text = norm(`${row.value ?? ""} ${JSON.stringify(row.attributes ?? {})}`);
  return text.includes("ingierstrand") && row.geometry && row.geometry.type !== "Point";
});

const uniqueAreaCandidate = exactNamedAreaCandidates.length === 1 ? exactNamedAreaCandidates[0] : null;
const ssrPoint = ssr.coordinate;
const applied = uniqueAreaCandidate?.center
  ? {
      authority: "riksantikvaren_named_heritage_geometry",
      sourceProvider: "official_heritage_registry",
      sourceObjectId: `riksantikvaren-layer-${uniqueAreaCandidate.layerId}:${uniqueAreaCandidate.attributes?.OBJECTID ?? uniqueAreaCandidate.value}`,
      sourceUrl: heritage.url,
      layerId: uniqueAreaCandidate.layerId,
      layerName: uniqueAreaCandidate.layerName,
      geometryType: uniqueAreaCandidate.geometry.type,
      lat: uniqueAreaCandidate.center.lat,
      lon: uniqueAreaCandidate.center.lon,
      coordinateMethod: uniqueAreaCandidate.center.method,
      attributes: uniqueAreaCandidate.attributes
    }
  : {
      authority: "kartverket_ssr_site_point",
      sourceProvider: "kartverket_ssr",
      sourceObjectId: "kartverket-ssr:448130",
      sourceUrl: ssr.attempts.find((attempt) => attempt.endpoint === "sted").url,
      layerId: null,
      layerName: null,
      geometryType: "Point",
      lat: ssrPoint.lat,
      lon: ssrPoint.lon,
      coordinateMethod: ssrPoint.method,
      attributes: ssr.stedRow
    };

const addressDistanceM = Math.round(haversineMeters({ lat: applied.lat, lon: applied.lon }, { lat: Number(addressResult.coordinate.lat), lon: Number(addressResult.coordinate.lon) }) * 10) / 10;
if (addressDistanceM > 500) {
  throw new Error(`Applied Ingierstrand anchor is ${addressDistanceM} m from the exact official complex address; manual review required.`);
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const identityMatches = places
  .filter((place) => norm(place.id) === norm(placeId) || norm(place.name) === "ingierstrand bad")
  .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
const nearest = places
  .filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
  .map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    distanceM: Math.round(haversineMeters({ lat: applied.lat, lon: applied.lon }, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10,
    sourceFile: place.sourceFile
  }))
  .sort((a, b) => a.distanceM - b.distanceM)
  .slice(0, 15);

const result = {
  version: "2026-07-21",
  placeId,
  status: identityMatches.length === 0 ? "verified_complex_candidate" : "identity_review_required",
  representationLock: "whole protected functionalist bathing complex; not restaurant business alone",
  appliedCandidate: applied,
  fallbackRule: "Use one exact named Riksantikvaren area geometry only if unique; otherwise use exact Kartverket SSR place object 448130 as semantic site anchor. Geonorge address is cross-check only.",
  crosschecks: {
    ssrEndpointDistanceM: ssr.endpointDistanceM,
    geonorgeAddress: addressResult,
    addressDistanceFromAppliedM: addressDistanceM
  },
  duplicateGate: { canonicalIdentityMatches: identityMatches, nearestCanonicalPlaces: nearest },
  riksantikvaren: {
    url: heritage.url,
    resultCount: heritage.results.length,
    ingierstrandMatchCount: heritageMatches.length,
    nonPointNamedAreaCandidateCount: exactNamedAreaCandidates.length,
    candidates: heritageCandidates
  },
  ssr: {
    sourceObjectId: "kartverket-ssr:448130",
    navnRow: ssr.navnRow,
    stedRow: ssr.stedRow,
    attempts: ssr.attempts
  }
};

writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
writeFileSync(`${reportDir}/README.md`, `# Ingierstrand bad — final coordinate intake\n\nDate: 2026-07-21\n\nStatus: **${result.status}**\n\nRepresentation lock: complete protected functionalist bathing complex, not the restaurant business alone.\n\nApplied authority: **${applied.authority}**\n\nApplied source object: **${applied.sourceObjectId}**\n\nApplied coordinate: **${applied.lat}, ${applied.lon}**\n\nDistance to exact Geonorge address point: **${addressDistanceM} m**\n\nRiksantikvaren Ingierstrand matches: **${heritageMatches.length}**; unique non-point named area candidates: **${exactNamedAreaCandidates.length}**.\n\nThe coordinate rule is conservative: a Riksantikvaren area is used only when exactly one named non-point Ingierstrand feature resolves. Otherwise the exact official Kartverket SSR site object \`448130\` is used as a semantic anchor for the whole bathing place, with the exact address as an independent positional cross-check.\n`, "utf8");

console.log(`Ingierstrand bad: ${result.status}; authority=${applied.authority}; source=${applied.sourceObjectId}; addressDistanceM=${addressDistanceM}; heritageMatches=${heritageMatches.length}; namedAreaCandidates=${exactNamedAreaCandidates.length}`);
