import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-159-alnaelvstien-route-research');
const BBOX = [59.890, 10.750, 59.975, 10.910];
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchJson(url, timeoutMs = 60000) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}
function normalize(value = '') {
  return String(value).trim().toLocaleLowerCase('nb-NO');
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
function bbox(points) {
  if (!points.length) return null;
  return [
    Math.min(...points.map((point) => point.lat)),
    Math.max(...points.map((point) => point.lat)),
    Math.min(...points.map((point) => point.lon)),
    Math.max(...points.map((point) => point.lon)),
  ];
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

const [south, west, north, east] = BBOX;
const overpassQuery = `[out:json][timeout:45];\n(\n  way["name"="Alnastien"](${south},${west},${north},${east});\n  way["official_name"="Alnastien"](${south},${west},${north},${east});\n  way["alt_name"="Alnastien"](${south},${west},${north},${east});\n  relation["name"="Alnastien"](${south},${west},${north},${east});\n  relation["official_name"="Alnastien"](${south},${west},${north},${east});\n);\nout body geom;`;
const overpassEndpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
let raw = null;
let usedUrl = null;
const overpassErrors = [];
for (const endpoint of overpassEndpoints) {
  try {
    const url = `${endpoint}?data=${encodeURIComponent(overpassQuery)}`;
    raw = await fetchJson(url);
    usedUrl = url;
    break;
  } catch (error) {
    overpassErrors.push(String(error));
  }
}
if (!raw) throw new Error(`Alle Overpass-endepunkter feilet: ${overpassErrors.join(' | ')}`);
fs.writeFileSync(path.join(REPORT_DIR, 'overpass-alnastien-exact-name.json'), `${JSON.stringify({ query: overpassQuery, usedUrl, errors: overpassErrors, raw }, null, 2)}\n`);

const wayCandidates = (raw.elements || [])
  .filter((element) => element.type === 'way')
  .map((way) => {
    const geometry = (way.geometry || []).map((point) => ({ lat: point.lat, lon: point.lon }));
    return {
      osmId: way.id,
      tags: way.tags || {},
      nodeIds: (way.nodes || []).map(String),
      pointCount: geometry.length,
      lengthM: lineLengthM(geometry),
      firstPoint: geometry[0] || null,
      lastPoint: geometry.at(-1) || null,
      boundingbox: bbox(geometry),
      geometry,
    };
  });
const relationCandidates = (raw.elements || [])
  .filter((element) => element.type === 'relation')
  .map((relation) => ({
    osmId: relation.id,
    tags: relation.tags || {},
    members: (relation.members || []).map((member) => ({
      type: member.type,
      ref: member.ref,
      role: member.role || '',
    })),
  }));

const exactNamedWays = wayCandidates.filter((way) =>
  ['alnastien'].includes(normalize(way.tags.name)) ||
  ['alnastien'].includes(normalize(way.tags.official_name)) ||
  ['alnastien'].includes(normalize(way.tags.alt_name))
);
const exactNamedRelations = relationCandidates.filter((relation) =>
  ['alnastien'].includes(normalize(relation.tags.name)) ||
  ['alnastien'].includes(normalize(relation.tags.official_name))
);

const sharedNodeLinks = [];
for (let i = 0; i < exactNamedWays.length; i += 1) {
  for (let j = i + 1; j < exactNamedWays.length; j += 1) {
    const a = exactNamedWays[i];
    const b = exactNamedWays[j];
    const bNodes = new Set(b.nodeIds);
    const sharedNodes = a.nodeIds.filter((nodeId) => bNodes.has(nodeId));
    const endpoint = endpointDistanceSummary(a, b);
    sharedNodeLinks.push({
      wayA: a.osmId,
      wayB: b.osmId,
      sharedNodeIds: sharedNodes,
      closestEndpointPair: endpoint?.kind || null,
      closestEndpointDistanceM: endpoint?.distanceM ?? null,
      directlyConnected: sharedNodes.length > 0,
    });
  }
}

const adjacency = new Map(exactNamedWays.map((way) => [way.osmId, new Set()]));
for (const link of sharedNodeLinks.filter((link) => link.directlyConnected)) {
  adjacency.get(link.wayA)?.add(link.wayB);
  adjacency.get(link.wayB)?.add(link.wayA);
}
const visited = new Set();
const connectedComponents = [];
for (const way of exactNamedWays) {
  if (visited.has(way.osmId)) continue;
  const queue = [way.osmId];
  const component = [];
  visited.add(way.osmId);
  while (queue.length) {
    const current = queue.shift();
    component.push(current);
    for (const next of adjacency.get(current) || []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  const componentWays = component.map((id) => exactNamedWays.find((candidate) => candidate.osmId === id)).filter(Boolean);
  connectedComponents.push({
    wayIds: component,
    wayCount: component.length,
    totalLengthM: Number(componentWays.reduce((sum, candidate) => sum + candidate.lengthM, 0).toFixed(1)),
    minLat: Math.min(...componentWays.flatMap((candidate) => candidate.boundingbox ? [candidate.boundingbox[0]] : [])),
    maxLat: Math.max(...componentWays.flatMap((candidate) => candidate.boundingbox ? [candidate.boundingbox[1]] : [])),
    minLon: Math.min(...componentWays.flatMap((candidate) => candidate.boundingbox ? [candidate.boundingbox[2]] : [])),
    maxLon: Math.max(...componentWays.flatMap((candidate) => candidate.boundingbox ? [candidate.boundingbox[3]] : [])),
  });
}
connectedComponents.sort((a, b) => b.totalLengthM - a.totalLengthM);

const relationMembership = exactNamedRelations.map((relation) => ({
  relationId: relation.osmId,
  tags: relation.tags,
  memberWayIds: relation.members.filter((member) => member.type === 'way').map((member) => member.ref),
  exactNamedWayMembers: relation.members
    .filter((member) => member.type === 'way' && exactNamedWays.some((way) => way.osmId === member.ref))
    .map((member) => member.ref),
}));

const nominatimQueries = ['Alnastien, Oslo, Norway', 'Alnaelvstien, Oslo, Norway'];
const nominatimResults = [];
for (let i = 0; i < nominatimQueries.length; i += 1) {
  const query = nominatimQueries[i];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=50&addressdetails=1&namedetails=1&viewbox=${west},${north},${east},${south}&bounded=1`;
  const results = await fetchJson(url, 45000);
  nominatimResults.push({ query, url, results });
  fs.writeFileSync(path.join(REPORT_DIR, `nominatim-${i + 1}.json`), `${JSON.stringify({ query, url, results }, null, 2)}\n`);
}

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'alnaelvstien',
  proposedModel: 'explicit_route_segments_or_route_relation',
  bbox: BBOX,
  exactNamedWayCount: exactNamedWays.length,
  exactNamedRelationCount: exactNamedRelations.length,
  exactNamedWays,
  exactNamedRelations,
  relationMembership,
  connectedComponentCount: connectedComponents.length,
  connectedComponents,
  sharedNodeLinks,
  nominatimSearches: nominatimResults.map((result) => ({
    query: result.query,
    candidates: result.results.map((candidate) => ({
      osmType: candidate.osm_type,
      osmId: candidate.osm_id,
      name: candidate.name || candidate.namedetails?.name || null,
      category: candidate.category,
      type: candidate.type,
      lat: candidate.lat ? Number(candidate.lat) : null,
      lon: candidate.lon ? Number(candidate.lon) : null,
      displayName: candidate.display_name,
    })),
  })),
  sourceContext: {
    officialIdentity: 'Oslo kommune documents a turvei along Alnaelva, including concrete sections through Svartdalsparken. Existing History Go evidence resolves the identity but not one-point geometry.',
    canonicalAlnaParentNowVerified: true,
    legacyCoordinateUsedForSelection: false,
    nearestFirstHitAllowed: false,
  },
  nextAction: exactNamedRelations.length === 1
    ? 'Inspect whether the single exact Alnastien relation is a genuine route relation with sufficient member coverage; otherwise model explicit verified routeSegments.'
    : connectedComponents.length > 0
      ? 'Inspect the exact named connected components and identify which components are defensibly part of the documented Alnaelvstien. Do not collapse disconnected components into one invented line.'
      : 'Keep the record unresolved until explicit route geometry can be sourced.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'compact-summary.json'), `${JSON.stringify({
  generatedAt: summary.generatedAt,
  placeId: summary.placeId,
  exactNamedWayCount: summary.exactNamedWayCount,
  exactNamedRelationCount: summary.exactNamedRelationCount,
  connectedComponentCount: summary.connectedComponentCount,
  connectedComponents: summary.connectedComponents,
  ways: exactNamedWays.map((way) => ({ osmId: way.osmId, tags: way.tags, lengthM: way.lengthM, firstPoint: way.firstPoint, lastPoint: way.lastPoint, boundingbox: way.boundingbox })),
  relations: relationMembership,
  nextAction: summary.nextAction,
}, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 159 research sources – Alnaelvstien\n\n- Existing official source: Oslo kommune documents a turvei along Alnaelva, including sections through Svartdalsparken.\n- Fresh bounded Overpass audit: exact ways and relations named Alnastien, including node topology and connected components.\n- Fresh bounded Nominatim searches for Alnastien and Alnaelvstien.\n- Canonical Alnaelva is already verified as a separate nine-anchor river model and is used only as route context, not as a proxy for the trail geometry.\n\nThe legacy Alnaelvstien point and nearest/first-hit selection are not used.\n`);

console.log(JSON.stringify({
  status: 'research_complete',
  exactNamedWayCount: exactNamedWays.length,
  exactNamedRelationCount: exactNamedRelations.length,
  connectedComponentCount: connectedComponents.length,
  largestComponentLengthM: connectedComponents[0]?.totalLengthM || 0,
  report: path.relative(ROOT, path.join(REPORT_DIR, 'compact-summary.json')),
}, null, 2));
