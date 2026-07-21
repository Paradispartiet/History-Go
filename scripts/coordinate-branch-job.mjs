import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const reportDir = "reports/visitoslo-oslofjord-audit-20260721/island-coordinate-intake-ssr-v2";
mkdirSync(reportDir, { recursive: true });

const candidates = [
  { id: "heggholmen", name: "Heggholmen", expectedStedsnummer: 692270 },
  { id: "rambergoya", name: "Rambergøya", expectedStedsnummer: 489838 }
];

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
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> ${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

function allRows(payload) {
  return Array.isArray(payload?.navn) ? payload.navn : [];
}

function exactIslandRows(payload, candidate) {
  return allRows(payload).filter((row) => {
    const spellings = [row.skrivemåte, ...(row.stedsnavn ?? []).map((name) => name.skrivemåte)].filter(Boolean).map(norm);
    return spellings.includes(norm(candidate.name))
      && row.navneobjekttype === "Øy i sjø"
      && Number(row.stedsnummer) === candidate.expectedStedsnummer
      && row.stedstatus === "aktiv";
  });
}

function coordinateFromRow(row) {
  const p = row.representasjonspunkt;
  if (Number.isFinite(Number(p?.nord)) && Number.isFinite(Number(p?.øst))) {
    return { lat: Number(p.nord), lon: Number(p.øst), source: "representasjonspunkt.nord_øst" };
  }
  const coords = row.geojson?.geometry?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    return { lat: Number(coords[1]), lon: Number(coords[0]), source: "geojson.geometry.coordinates" };
  }
  throw new Error(`SSR row ${row.stedsnummer} has no usable coordinate.`);
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

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const results = [];

for (const candidate of candidates) {
  const attempts = [];
  for (const endpoint of ["navn", "sted"]) {
    const params = new URLSearchParams({ sok: candidate.name, knr: "0301", treffPerSide: "100", side: "1" });
    const url = `https://api.kartverket.no/stedsnavn/v1/${endpoint}?${params.toString()}`;
    attempts.push({ endpoint, url, data: await fetchJson(url) });
  }

  const exactByEndpoint = attempts.map((attempt) => ({ endpoint: attempt.endpoint, rows: exactIslandRows(attempt.data, candidate) }));
  if (exactByEndpoint.some((group) => group.rows.length !== 1)) {
    throw new Error(`${candidate.id}: expected exactly one active exact Øy i sjø row in each SSR endpoint: ${JSON.stringify(exactByEndpoint.map((g) => ({ endpoint: g.endpoint, count: g.rows.length, rows: g.rows })))}.`);
  }

  const navnRow = exactByEndpoint.find((g) => g.endpoint === "navn").rows[0];
  const stedRow = exactByEndpoint.find((g) => g.endpoint === "sted").rows[0];
  const a = coordinateFromRow(navnRow);
  const b = coordinateFromRow(stedRow);
  const endpointDistanceM = Math.round(haversineMeters(a, b) * 10) / 10;
  if (endpointDistanceM > 1) throw new Error(`${candidate.id}: SSR /navn and /sted coordinates differ by ${endpointDistanceM} m.`);

  const identityMatches = places
    .filter((place) => norm(place.id) === norm(candidate.id) || norm(place.name) === norm(candidate.name))
    .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));

  const nearest = places
    .filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
    .map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      distanceM: Math.round(haversineMeters(a, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10,
      sourceFile: place.sourceFile
    }))
    .sort((x, y) => x.distanceM - y.distanceM)
    .slice(0, 12);

  const result = {
    version: "2026-07-21",
    placeId: candidate.id,
    name: candidate.name,
    status: identityMatches.length === 0 ? "verified_ssr_island_candidate" : "identity_review_required",
    selectionRule: "exact approved active Kartverket SSR name + navneobjekttype Øy i sjø + locked stedsnummer; no fuzzy or nearest selection",
    sourceProvider: "kartverket_ssr",
    sourceObjectId: `kartverket-ssr:${candidate.expectedStedsnummer}`,
    coordinate: {
      lat: a.lat,
      lon: a.lon,
      r: 80,
      locatorType: "natural_area",
      sourceProvider: "kartverket_ssr",
      sourceObjectId: `kartverket-ssr:${candidate.expectedStedsnummer}`,
      geocodeAccuracy: "semantic_anchor",
      coordRole: "area_anchor",
      coordStatus: "verified_semantic_anchor",
      coordSource: "kartverket_ssr",
      coordType: "named_place_anchor",
      coordNote: `Offisielt representasjonspunkt fra Kartverkets Sentralt stedsnavnregister for ${candidate.name}, objekttype Øy i sjø, stedsnummer ${candidate.expectedStedsnummer}. Punktet brukes som stabilt navne-/områdeanker fordi de sammenvokste øylandskapene ikke har et separat, entydig øypolygon i den strenge OSM-gaten.`
    },
    endpointCrosscheckDistanceM: endpointDistanceM,
    duplicateGate: { canonicalIdentityMatches: identityMatches, nearestCanonicalPlaces: nearest },
    officialRows: { navn: navnRow, sted: stedRow },
    attempts
  };

  mkdirSync(`${reportDir}/${candidate.id}`, { recursive: true });
  writeFileSync(`${reportDir}/${candidate.id}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  results.push(result);
  console.log(`${candidate.id}: ${result.status}; ${result.sourceObjectId}; ${a.lat}, ${a.lon}`);
}

writeFileSync(`${reportDir}/summary.json`, `${JSON.stringify({
  version: "2026-07-21",
  total: results.length,
  verified: results.filter((r) => r.status === "verified_ssr_island_candidate").length,
  results: results.map((r) => ({ placeId: r.placeId, name: r.name, status: r.status, sourceObjectId: r.sourceObjectId, coordinate: r.coordinate, duplicateGate: r.duplicateGate }))
}, null, 2)}\n`, "utf8");

console.log(`Resolved ${results.length} exact SSR island objects.`);
