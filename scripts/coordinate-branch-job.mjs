#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const DATE = '2026-07-23';
const placeId = 'ring_3';
const reportDir = 'reports/oslo-coordinate-ring3-route-research-post-176';
const bbox = '59.84,10.45,60.08,11.02';
const overpassUrl = 'https://overpass-api.de/api/interpreter';
const nominatimUrl = 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&namedetails=1&polygon_geojson=1&limit=50&bounded=1&viewbox=10.45,60.08,11.02,59.84&q=Ring%203%2C%20Oslo%2C%20Norway';
const officialUrl = 'https://www.vegvesen.no/vegprosjekter/prosjekt/sykkelvegeroslo/';

const abs = (file) => path.join(root, file);
const protocol = fs.readFileSync(abs('docs/coordinates/coordinate-control-protocol.md'), 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1])).filter(Number.isFinite));
if (maxBatch !== 176) throw new Error(`Expected current coordinate max batch 176, got ${maxBatch}. Rebase before Ring 3 research.`);

const place = JSON.parse(fs.readFileSync(abs('data/places/by/oslo/places/ring_3.json'), 'utf8'));
const evidence = JSON.parse(fs.readFileSync(abs('data/coordinate-evidence/oslo/by/ring_3.json'), 'utf8'));
if (place.id !== placeId || evidence.placeId !== placeId) throw new Error('Ring 3 source/evidence identity mismatch');
if (evidence.coordinateDecision !== 'needs_geometry') throw new Error(`Ring 3 no longer requires geometry: ${evidence.coordinateDecision}`);

async function fetchText(url, init = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    ...init,
    headers: {
      'User-Agent': 'History-Go-coordinate-control/1.0',
      Accept: 'application/json,text/html,*/*',
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(120000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> ${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
  return { finalUrl: response.url, text, contentType: response.headers.get('content-type') };
}

async function fetchJson(url, init = {}) {
  const result = await fetchText(url, init);
  return { ...result, data: JSON.parse(result.text) };
}

async function overpass(query) {
  const body = new URLSearchParams({ data: query });
  return fetchJson(overpassUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

function haversineMeters(a, b) {
  const rad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function geometryLengthM(geometry = []) {
  let total = 0;
  for (let i = 1; i < geometry.length; i += 1) total += haversineMeters(geometry[i - 1], geometry[i]);
  return total;
}

function normalizeRef(value) {
  return String(value ?? '').split(';').map((part) => part.trim()).filter(Boolean);
}

const relationQuery = `[out:json][timeout:90];
(
  relation["route"="road"]["ref"~"(^|;)\\s*150\\s*(;|$)"](${bbox});
  relation["route"="road"]["name"~"Ring 3",i](${bbox});
);
out body geom;`;
const wayQuery = `[out:json][timeout:90];
way["highway"]["ref"~"(^|;)\\s*150\\s*(;|$)"](${bbox});
out body geom;`;

const [relationsResponse, waysResponse, nominatimResponse, officialResponse] = await Promise.all([
  overpass(relationQuery),
  overpass(wayQuery),
  fetchJson(nominatimUrl),
  fetchText(officialUrl).catch((error) => ({ finalUrl: officialUrl, text: '', error: String(error) })),
]);

const relations = (relationsResponse.data.elements || []).filter((element) => element.type === 'relation');
const ways = (waysResponse.data.elements || []).filter((element) => element.type === 'way');
const wayById = new Map(ways.map((way) => [Number(way.id), way]));

const relationCandidates = relations.map((relation) => {
  const memberWays = (relation.members || []).filter((member) => member.type === 'way');
  const memberWayIds = memberWays.map((member) => Number(member.ref));
  const memberGeometries = memberWays.filter((member) => Array.isArray(member.geometry) && member.geometry.length >= 2);
  const totalGeometryLengthM = memberGeometries.reduce((sum, member) => sum + geometryLengthM(member.geometry), 0);
  return {
    sourceObjectId: `osm-relation:${relation.id}`,
    osmRelationId: Number(relation.id),
    tags: relation.tags || {},
    acceptedRef150: normalizeRef(relation.tags?.ref).includes('150'),
    nameMentionsRing3: /ring\s*3/i.test(String(relation.tags?.name ?? '')),
    memberWayCount: memberWayIds.length,
    memberWayIds,
    memberWaysWithGeometry: memberGeometries.length,
    totalGeometryLengthM: Math.round(totalGeometryLengthM * 10) / 10,
  };
});

const wayRows = ways.map((way) => ({
  osmWayId: Number(way.id),
  sourceObjectId: `osm-way:${way.id}`,
  tags: way.tags || {},
  nodeIds: Array.isArray(way.nodes) ? way.nodes.map(String) : [],
  startNodeId: Array.isArray(way.nodes) && way.nodes.length ? String(way.nodes[0]) : null,
  endNodeId: Array.isArray(way.nodes) && way.nodes.length ? String(way.nodes[way.nodes.length - 1]) : null,
  lengthM: Math.round(geometryLengthM(way.geometry || []) * 10) / 10,
  geometryPointCount: Array.isArray(way.geometry) ? way.geometry.length : 0,
}));

// Build exact endpoint-connected components. This is deliberately conservative:
// touching only at an interior node does not make two route segments an ordered chain.
const endpointToWays = new Map();
for (const way of wayRows) {
  for (const nodeId of [way.startNodeId, way.endNodeId].filter(Boolean)) {
    if (!endpointToWays.has(nodeId)) endpointToWays.set(nodeId, []);
    endpointToWays.get(nodeId).push(way.osmWayId);
  }
}
const adjacency = new Map(wayRows.map((way) => [way.osmWayId, new Set()]));
for (const ids of endpointToWays.values()) {
  for (const a of ids) for (const b of ids) if (a !== b) adjacency.get(a)?.add(b);
}
const seen = new Set();
const components = [];
for (const way of wayRows) {
  if (seen.has(way.osmWayId)) continue;
  const stack = [way.osmWayId];
  const ids = [];
  seen.add(way.osmWayId);
  while (stack.length) {
    const current = stack.pop();
    ids.push(current);
    for (const next of adjacency.get(current) || []) {
      if (seen.has(next)) continue;
      seen.add(next);
      stack.push(next);
    }
  }
  const rows = ids.map((id) => wayRows.find((row) => row.osmWayId === id)).filter(Boolean);
  const endpointDegrees = new Map();
  for (const row of rows) {
    for (const nodeId of [row.startNodeId, row.endNodeId].filter(Boolean)) endpointDegrees.set(nodeId, (endpointDegrees.get(nodeId) || 0) + 1);
  }
  components.push({
    wayCount: rows.length,
    wayIds: ids.sort((a, b) => a - b),
    totalLengthM: Math.round(rows.reduce((sum, row) => sum + row.lengthM, 0) * 10) / 10,
    openEndpointNodeIds: [...endpointDegrees.entries()].filter(([, degree]) => degree === 1).map(([nodeId]) => nodeId),
    branchNodeIds: [...endpointDegrees.entries()].filter(([, degree]) => degree > 2).map(([nodeId]) => nodeId),
  });
}
components.sort((a, b) => b.totalLengthM - a.totalLengthM);

const exactRelationCandidates = relationCandidates.filter((row) => row.acceptedRef150 || row.nameMentionsRing3);
const nominatimCandidates = (nominatimResponse.data || []).map((row) => ({
  sourceObjectId: `osm-${row.osm_type}:${row.osm_id}`,
  displayName: row.display_name,
  name: row.name,
  category: row.category,
  type: row.type,
  lat: Number(row.lat),
  lon: Number(row.lon),
  namedetails: row.namedetails || {},
  extratags: row.extratags || {},
  geojsonType: row.geojson?.type || null,
}));

let status = 'route_geometry_research_incomplete';
let productionCandidate = null;
if (exactRelationCandidates.length === 1 && exactRelationCandidates[0].memberWayCount > 0 && exactRelationCandidates[0].memberWaysWithGeometry === exactRelationCandidates[0].memberWayCount) {
  const relation = exactRelationCandidates[0];
  productionCandidate = {
    type: 'osm_route_relation',
    sourceObjectId: relation.sourceObjectId,
    osmRelationId: relation.osmRelationId,
    tags: relation.tags,
    memberWayCount: relation.memberWayCount,
    totalGeometryLengthM: relation.totalGeometryLengthM,
  };
  status = 'unique_exact_osm_route_relation_candidate';
} else if (components.length === 1 && components[0].wayCount > 1 && components[0].branchNodeIds.length === 0 && components[0].openEndpointNodeIds.length === 2) {
  productionCandidate = {
    type: 'connected_ref150_way_chain',
    wayCount: components[0].wayCount,
    wayIds: components[0].wayIds,
    totalLengthM: components[0].totalLengthM,
  };
  status = 'single_unbranched_ref150_way_chain_candidate';
}

const officialText = String(officialResponse.text || '');
const result = {
  version: DATE,
  placeId,
  status,
  currentCoordinate: evidence.currentCoordinate,
  identity: evidence.identity,
  officialIdentityCheck: {
    sourceUrl: officialUrl,
    fetched: !officialResponse.error,
    mentionsRing3: /Ring\s*3/i.test(officialText),
    mentionsRv150: /rv\.?\s*150|riksvei\s*150/i.test(officialText),
    error: officialResponse.error || null,
  },
  overpass: {
    bbox,
    relationQuery,
    wayQuery,
    relationCandidateCount: exactRelationCandidates.length,
    ref150WayCount: wayRows.length,
  },
  relationCandidates,
  exactRelationCandidates,
  wayComponents: components,
  ref150Ways: wayRows,
  nominatimCandidates,
  productionCandidate,
  methodology: {
    accepted: ['exact route relation with complete member geometry', 'single endpoint-connected unbranched ref=150 chain'],
    rejected: ['nearest road segment', 'first search hit', 'single symbolic midpoint without route evidence'],
  },
};

fs.mkdirSync(abs(reportDir), { recursive: true });
fs.writeFileSync(abs(`${reportDir}/result.json`), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/overpass-relations.json`), `${JSON.stringify(relationsResponse.data, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/overpass-ref150-ways.json`), `${JSON.stringify(waysResponse.data, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/nominatim-ring3.json`), `${JSON.stringify(nominatimResponse.data, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/README.md`), `# Ring 3 route geometry research — post batch 176\n\nStatus: **${status}**\n\nThis pass searches for a unique exact OSM road-route relation for Ring 3 / rv. 150 and independently inventories all highway ways carrying ref=150 in a fixed Oslo-region bounding box. It records exact relation membership and endpoint-connected way components. No nearest/first-hit road segment and no legacy symbolic midpoint can be promoted by this research job.\n`);

console.log(JSON.stringify({ status, exactRelationCandidates: exactRelationCandidates.map((row) => row.sourceObjectId), ref150WayCount: wayRows.length, components: components.map((row) => ({ wayCount: row.wayCount, totalLengthM: row.totalLengthM, openEndpoints: row.openEndpointNodeIds.length, branches: row.branchNodeIds.length })), productionCandidate }, null, 2));
