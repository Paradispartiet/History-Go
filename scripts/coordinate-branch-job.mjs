import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-154-alna-smalvoll-research');
const VIEWBOX = '10.815,59.938,10.865,59.914';
const BBOX = [59.914, 10.815, 59.938, 10.865];
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchJson(url, timeoutMs = 45000) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}
function haversineM(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function lineLengthM(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += haversineM(points[i - 1], points[i]);
  return Number(total.toFixed(1));
}
const normalize = (value = '') => String(value).trim().toLocaleLowerCase('nb-NO');

const nominatimQueries = [
  'Smalvoll, Oslo, Norway',
  'Smalvolldalen, Oslo, Norway',
  'Alna, Smalvoll, Oslo, Norway',
];
const nominatimResults = [];
for (let i = 0; i < nominatimQueries.length; i += 1) {
  const query = nominatimQueries[i];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${VIEWBOX}&bounded=1`;
  const results = await fetchJson(url);
  nominatimResults.push({ query, url, results });
  fs.writeFileSync(path.join(REPORT_DIR, `nominatim-${i + 1}.json`), `${JSON.stringify({ query, url, results }, null, 2)}\n`);
}

const [south, west, north, east] = BBOX;
const overpassQuery = `[out:json][timeout:30];(way["name"="Alna"]["waterway"](${south},${west},${north},${east});way["alt_name"="Loelva"]["waterway"](${south},${west},${north},${east});nwr["name"="Smalvoll"](${south},${west},${north},${east});nwr["name"="Smalvolldalen"](${south},${west},${north},${east}););out center tags geom;`;
const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let overpassRaw = null;
let usedUrl = null;
let errors = [];
for (const endpoint of endpoints) {
  try {
    const url = `${endpoint}?data=${encodeURIComponent(overpassQuery)}`;
    overpassRaw = await fetchJson(url);
    usedUrl = url;
    break;
  } catch (error) {
    errors.push(String(error));
  }
}
if (!overpassRaw) throw new Error(`Alle Overpass-endepunkter feilet: ${errors.join(' | ')}`);
fs.writeFileSync(path.join(REPORT_DIR, 'overpass-scope-and-alna.json'), `${JSON.stringify({ query: overpassQuery, usedUrl, errors, raw: overpassRaw }, null, 2)}\n`);

const elements = overpassRaw.elements || [];
const riverWays = elements
  .filter((element) => element.type === 'way' && element.tags?.waterway && (normalize(element.tags?.name) === 'alna' || normalize(element.tags?.alt_name) === 'loelva'))
  .map((way) => {
    const geometry = (way.geometry || []).map((point) => ({ lat: point.lat, lon: point.lon }));
    return {
      osmId: way.id,
      tags: way.tags || {},
      nodeIds: way.nodes || [],
      pointCount: geometry.length,
      lengthM: lineLengthM(geometry),
      firstPoint: geometry[0] || null,
      lastPoint: geometry.at(-1) || null,
      boundingbox: geometry.length
        ? [
            Math.min(...geometry.map((p) => p.lat)),
            Math.max(...geometry.map((p) => p.lat)),
            Math.min(...geometry.map((p) => p.lon)),
            Math.max(...geometry.map((p) => p.lon)),
          ]
        : null,
      geometry,
    };
  });
const scopeObjects = elements
  .filter((element) => ['smalvoll', 'smalvolldalen'].includes(normalize(element.tags?.name)))
  .map((element) => ({
    osmType: element.type,
    osmId: element.id,
    tags: element.tags || {},
    lat: element.lat ?? element.center?.lat ?? null,
    lon: element.lon ?? element.center?.lon ?? null,
    geometryPointCount: element.geometry?.length ?? null,
    geometry: element.geometry || null,
  }));

const endpointLinks = [];
for (let i = 0; i < riverWays.length; i += 1) {
  for (let j = i + 1; j < riverWays.length; j += 1) {
    const a = riverWays[i];
    const b = riverWays[j];
    const pairs = [
      ['first-first', a.firstPoint, b.firstPoint],
      ['first-last', a.firstPoint, b.lastPoint],
      ['last-first', a.lastPoint, b.firstPoint],
      ['last-last', a.lastPoint, b.lastPoint],
    ];
    const best = pairs
      .filter(([, p1, p2]) => p1 && p2)
      .map(([kind, p1, p2]) => ({ kind, distanceM: haversineM(p1, p2) }))
      .sort((x, y) => x.distanceM - y.distanceM)[0];
    endpointLinks.push({ wayA: a.osmId, wayB: b.osmId, closestEndpointPair: best?.kind || null, distanceM: best ? Number(best.distanceM.toFixed(2)) : null });
  }
}

const uniqueNominatim = new Map();
for (const queryResult of nominatimResults) {
  for (const result of queryResult.results) {
    const key = `${result.osm_type}:${result.osm_id}`;
    if (!uniqueNominatim.has(key)) uniqueNominatim.set(key, { ...result, matchedQueries: [] });
    uniqueNominatim.get(key).matchedQueries.push(queryResult.query);
  }
}
const nominatimCandidates = [...uniqueNominatim.values()].map((result) => ({
  osmType: result.osm_type,
  osmId: result.osm_id,
  category: result.category,
  type: result.type,
  name: result.name || result.namedetails?.name || null,
  displayName: result.display_name,
  boundingbox: result.boundingbox,
  geojsonType: result.geojson?.type || null,
  lat: result.lat ? Number(result.lat) : null,
  lon: result.lon ? Number(result.lon) : null,
  matchedQueries: result.matchedQueries,
}));

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'alna_smalvoll',
  proposedResolvedIdentity: 'Lokal Alna-strekning gjennom Smalvoll/Smalvolldalen',
  viewbox: VIEWBOX.split(',').map(Number),
  bbox: BBOX,
  riverWayCount: riverWays.length,
  riverWays,
  scopeObjectCount: scopeObjects.length,
  scopeObjects,
  endpointLinks,
  nominatimCandidates,
  sourceContext: {
    existingDocumentedIdentity: 'Oslo byleksikon documents Alna and Alnastien through Smalvolldalen/Smalvollveien; the canonical record is intended as the local river corridor, not a road or business point.',
    legacyCoordinateUsedForSelection: false,
    nearestFirstHitAllowed: false,
  },
  nextAction: riverWays.length > 0
    ? 'Resolve which exact connected Alna way or connected way chain is geographically inside the independently identified Smalvoll/Smalvolldalen scope, then verify fresh source geometry before production.'
    : 'Keep the canonical record unresolved; no exact named Alna waterway geometry was found in the corrected Smalvoll scope.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 154 research sources\n\n- Existing History Go evidence cites Oslo byleksikon for Alna's pronounced meanders in Smalvolldalen and Alnastien along Smalvollveien.\n- This runner uses a corrected bounded Smalvoll/Smalvolldalen scope and collects all exact Alna/Loelva waterway ways plus named scope objects.\n- Segment selection is deferred until topology and scope are explicit.\n- The legacy History Go coordinate and nearest/first-hit logic are not used.\n`);

console.log(JSON.stringify({
  status: 'research_complete',
  riverWayCount: riverWays.length,
  scopeObjectCount: scopeObjects.length,
  report: path.relative(ROOT, path.join(REPORT_DIR, 'candidate-summary.json')),
}, null, 2));
