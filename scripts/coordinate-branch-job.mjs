import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-155-alna-bryn-research');
const BBOX = [59.899, 10.78, 59.917, 10.838];
const UPSTREAM_REFERENCE_WAY = 22698275;
const DOWNSTREAM_REFERENCE_WAY = 685201630;
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
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon), lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function lineLengthM(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += haversineM(points[i - 1], points[i]);
  return Number(total.toFixed(1));
}
function endpointDistanceSummary(a, b) {
  const pairs = [
    ['first-first', a.firstPoint, b.firstPoint],
    ['first-last', a.firstPoint, b.lastPoint],
    ['last-first', a.lastPoint, b.firstPoint],
    ['last-last', a.lastPoint, b.lastPoint],
  ];
  return pairs
    .filter(([, p1, p2]) => p1 && p2)
    .map(([kind, p1, p2]) => ({ kind, distanceM: Number(haversineM(p1, p2).toFixed(2)) }))
    .sort((x, y) => x.distanceM - y.distanceM)[0] || null;
}
const normalize = (value = '') => String(value).trim().toLocaleLowerCase('nb-NO');

const [south, west, north, east] = BBOX;
const query = `[out:json][timeout:35];(way["name"="Alna"]["waterway"](${south},${west},${north},${east});way["alt_name"="Loelva"]["waterway"](${south},${west},${north},${east});way(${UPSTREAM_REFERENCE_WAY});way(${DOWNSTREAM_REFERENCE_WAY});nwr["name"="Bryn bru"](${south},${west},${north},${east});nwr["name"="Brynsfossen"](${south},${west},${north},${east});nwr["name"="Bryn"](${south},${west},${north},${east}););out center tags geom;`;
const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let raw = null;
let usedUrl = null;
let errors = [];
for (const endpoint of endpoints) {
  try {
    const url = `${endpoint}?data=${encodeURIComponent(query)}`;
    raw = await fetchJson(url);
    usedUrl = url;
    break;
  } catch (error) {
    errors.push(String(error));
  }
}
if (!raw) throw new Error(`Alle Overpass-endepunkter feilet: ${errors.join(' | ')}`);
fs.writeFileSync(path.join(REPORT_DIR, 'overpass-bryn-alna.json'), `${JSON.stringify({ query, usedUrl, errors, raw }, null, 2)}\n`);

const elements = raw.elements || [];
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
      boundingbox: geometry.length ? [Math.min(...geometry.map((p) => p.lat)), Math.max(...geometry.map((p) => p.lat)), Math.min(...geometry.map((p) => p.lon)), Math.max(...geometry.map((p) => p.lon))] : null,
      geometry,
    };
  });
const referenceUpstream = riverWays.find((way) => way.osmId === UPSTREAM_REFERENCE_WAY) || null;
const referenceDownstream = riverWays.find((way) => way.osmId === DOWNSTREAM_REFERENCE_WAY) || null;
const localRiverWays = riverWays.filter((way) => ![UPSTREAM_REFERENCE_WAY, DOWNSTREAM_REFERENCE_WAY].includes(way.osmId));
const namedBrynObjects = elements
  .filter((element) => ['bryn', 'bryn bru', 'brynsfossen'].includes(normalize(element.tags?.name)))
  .map((element) => ({
    osmType: element.type,
    osmId: element.id,
    tags: element.tags || {},
    lat: element.lat ?? element.center?.lat ?? null,
    lon: element.lon ?? element.center?.lon ?? null,
    geometryPointCount: element.geometry?.length ?? null,
    geometry: element.geometry || null,
  }));

const topology = localRiverWays.map((way) => ({
  osmId: way.osmId,
  toUpstreamReference: referenceUpstream ? endpointDistanceSummary(way, referenceUpstream) : null,
  toDownstreamReference: referenceDownstream ? endpointDistanceSummary(way, referenceDownstream) : null,
  connectionsToLocalWays: localRiverWays
    .filter((other) => other.osmId !== way.osmId)
    .map((other) => ({ otherWayId: other.osmId, ...endpointDistanceSummary(way, other) }))
    .sort((a, b) => a.distanceM - b.distanceM),
}));

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'alna_bryn',
  proposedResolvedIdentity: 'Lokal Alna-strekning ved Bryn mellom Smalvoll-korridoren og nedre Alna/Svartdalen-systemet',
  bbox: BBOX,
  upstreamReferenceWay: UPSTREAM_REFERENCE_WAY,
  downstreamReferenceWay: DOWNSTREAM_REFERENCE_WAY,
  riverWayCount: riverWays.length,
  localRiverWayCount: localRiverWays.length,
  riverWays,
  localRiverWays,
  namedBrynObjects,
  topology,
  sourceContext: {
    existingDocumentedIdentity: 'Existing evidence documents Alna below Bryn and onward through Svartdalen; Bryn bridge is a separate named object and must not be substituted automatically for the broader river record.',
    legacyCoordinateUsedForSelection: false,
    nearestFirstHitAllowed: false,
  },
  nextAction: localRiverWays.length > 0
    ? 'Resolve an exact connected Alna segment or chain bracketed by the upstream Smalvoll reference and downstream verified Alna reference; use Bryn-named objects only as independent scope context, not as proxies.'
    : 'Keep the canonical record unresolved; no exact named Alna geometry was found in the corrected Bryn scope.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 155 research sources\n\n- Existing History Go evidence cites Oslo byleksikon for Alna below Bryn and onward through Svartdalen.\n- Upstream reference way 22698275 is the Smalvoll candidate selected in batch 154 research; downstream reference way 685201630 is the already verified Kværnerbyen Alna segment.\n- The runner audits all exact Alna/Loelva waterway ways in a corrected Bryn scope and records named Bryn/Bryn bru/Brynsfossen objects separately.\n- Bryn bridge or any other named object is not used as a proxy for the river record.\n- The legacy History Go coordinate and nearest/first-hit logic are not used.\n`);
console.log(JSON.stringify({ status: 'research_complete', localRiverWayCount: localRiverWays.length, namedBrynObjectCount: namedBrynObjects.length, report: path.relative(ROOT, path.join(REPORT_DIR, 'candidate-summary.json')) }, null, 2));
