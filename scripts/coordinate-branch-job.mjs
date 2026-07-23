#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-161-fossveien-research');
fs.mkdirSync(reportDir, { recursive: true });

const streetWayId = 3235603;
const southBridgeWayId = 457755404;
const northBridgeWayId = 3236542;
const overpassEndpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

function parseAttrs(text) {
  const attrs = {};
  for (const match of text.matchAll(/([A-Za-z0-9_:-]+)="([^"]*)"/g)) attrs[match[1]] = match[2];
  return attrs;
}

function parseWayXml(xml, expectedWayId) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.id && attrs.lat != null && attrs.lon != null) {
      nodes.set(Number(attrs.id), { id: Number(attrs.id), lat: Number(attrs.lat), lon: Number(attrs.lon) });
    }
  }
  const wayMatch = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)]
    .map((match) => ({ attrs: parseAttrs(match[1]), body: match[2] }))
    .find((row) => Number(row.attrs.id) === expectedWayId);
  if (!wayMatch) throw new Error(`Primary OSM response missing way ${expectedWayId}`);
  const nodeIds = [...wayMatch.body.matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((match) => Number(parseAttrs(match[1]).ref));
  const tags = {};
  for (const match of wayMatch.body.matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.k != null) tags[attrs.k] = attrs.v ?? '';
  }
  const geometry = nodeIds.map((id) => nodes.get(id)).filter(Boolean);
  if (geometry.length !== nodeIds.length || geometry.length < 2) throw new Error(`Way ${expectedWayId} missing full node geometry`);
  return { id: expectedWayId, nodes: nodeIds, tags, geometry };
}

async function fetchWayFull(wayId, label) {
  const url = `https://api.openstreetmap.org/api/0.6/way/${wayId}/full`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: 'application/xml', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
      if (!response.ok) {
        lastError = new Error(`${label}: HTTP ${response.status}`);
      } else {
        const xml = await response.text();
        fs.writeFileSync(path.join(reportDir, `osm-way-${wayId}-full.xml`), xml);
        return parseWayXml(xml, wayId);
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
  }
  throw lastError || new Error(`${label}: primary OSM lookup failed`);
}

async function overpass(query, label) {
  let lastError = null;
  for (const endpoint of overpassEndpoints) {
    try {
      const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' },
      });
      if (!response.ok) {
        lastError = new Error(`${label}: ${endpoint} HTTP ${response.status}`);
        continue;
      }
      return { endpoint, payload: await response.json() };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`${label}: all Overpass endpoints failed`);
}

const [street, southBridge, northBridge] = await Promise.all([
  fetchWayFull(streetWayId, 'Fossveien'),
  fetchWayFull(southBridgeWayId, 'south candidate bridge'),
  fetchWayFull(northBridgeWayId, 'north candidate bridge'),
]);
if (street.tags.name !== 'Fossveien') throw new Error(`Way ${streetWayId} is not Fossveien`);
if (southBridge.tags.bridge !== 'yes' || northBridge.tags.bridge !== 'yes') throw new Error('Candidate bracket ways must remain bridge=yes');

const streetEndpoints = [street.nodes[0], street.nodes.at(-1)];
const streetEndpointCoords = [street.geometry[0], street.geometry.at(-1)];

const graphQuery = `[out:json][timeout:35];(
  way["highway"](around:400,${streetEndpointCoords[0].lat},${streetEndpointCoords[0].lon});
  way["highway"](around:400,${streetEndpointCoords[1].lat},${streetEndpointCoords[1].lon});
);out body geom;`;
const graphResult = await overpass(graphQuery, 'local highway graph');
const graphPayload = graphResult.payload;
fs.writeFileSync(path.join(reportDir, 'endpoint-highway-graph.json'), `${JSON.stringify({ endpoint: graphResult.endpoint, payload: graphPayload }, null, 2)}\n`);

const ways = (graphPayload.elements || []).filter((element) => element.type === 'way' && Array.isArray(element.nodes));
// Ensure the exact seed ways are present in the graph even if Overpass omitted one due to its radius geometry rules.
for (const seed of [street, southBridge, northBridge]) {
  if (!ways.some((way) => Number(way.id) === seed.id)) ways.push(seed);
}

const nodeToWays = new Map();
const nodeCoords = new Map();
for (const way of ways) {
  const geometry = way.geometry || [];
  for (let index = 0; index < way.nodes.length; index += 1) {
    const nodeId = Number(way.nodes[index]);
    if (!nodeToWays.has(nodeId)) nodeToWays.set(nodeId, []);
    nodeToWays.get(nodeId).push(way);
    if (geometry[index]) nodeCoords.set(nodeId, geometry[index]);
  }
}
for (const seed of [street, southBridge, northBridge]) {
  for (let index = 0; index < seed.nodes.length; index += 1) nodeCoords.set(Number(seed.nodes[index]), seed.geometry[index]);
}

const toRad = (value) => value * Math.PI / 180;
const R = 6371008.8;
function distance(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

const adjacency = new Map();
function addEdge(a, b, way) {
  if (!adjacency.has(a)) adjacency.set(a, []);
  adjacency.get(a).push({ nodeId: b, wayId: Number(way.id), wayName: way.tags?.name || null, highway: way.tags?.highway || null });
}
for (const way of ways) {
  for (let index = 0; index < way.nodes.length - 1; index += 1) {
    const a = Number(way.nodes[index]);
    const b = Number(way.nodes[index + 1]);
    addEdge(a, b, way);
    addEdge(b, a, way);
  }
}

function bfs(startNode, targetNodes, maxEdges = 50) {
  const targets = new Set(targetNodes.map(Number));
  const queue = [{ nodeId: Number(startNode), path: [] }];
  const visited = new Set([Number(startNode)]);
  while (queue.length) {
    const current = queue.shift();
    if (targets.has(current.nodeId)) return current.path;
    if (current.path.length >= maxEdges) continue;
    for (const edge of adjacency.get(current.nodeId) || []) {
      if (visited.has(edge.nodeId)) continue;
      visited.add(edge.nodeId);
      queue.push({ nodeId: edge.nodeId, path: [...current.path, edge] });
    }
  }
  return null;
}

function summarizePath(startNode, path) {
  if (!path) return null;
  let lengthM = 0;
  let previousNode = Number(startNode);
  const waySequence = [];
  for (const edge of path) {
    const a = nodeCoords.get(previousNode);
    const b = nodeCoords.get(edge.nodeId);
    if (a && b) lengthM += distance(a, b);
    const last = waySequence.at(-1);
    if (!last || last.wayId !== edge.wayId) waySequence.push({ wayId: edge.wayId, wayName: edge.wayName, highway: edge.highway });
    previousNode = edge.nodeId;
  }
  return { edgeCount: path.length, lengthM: Number(lengthM.toFixed(1)), terminalNodeId: previousNode, waySequence };
}

const endpointRows = streetEndpoints.map((nodeId, index) => {
  const southPath = bfs(nodeId, southBridge.nodes);
  const northPath = bfs(nodeId, northBridge.nodes);
  return {
    endpointIndex: index,
    nodeId: Number(nodeId),
    coordinate: streetEndpointCoords[index],
    connectedWaysAtNode: (nodeToWays.get(Number(nodeId)) || []).map((way) => ({ id: Number(way.id), name: way.tags?.name || null, highway: way.tags?.highway || null })),
    pathToSouthBridge: summarizePath(nodeId, southPath),
    pathToNorthBridge: summarizePath(nodeId, northPath),
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  graphEndpoint: graphResult.endpoint,
  street: {
    wayId: streetWayId,
    name: street.tags.name,
    endpointNodes: streetEndpoints,
    endpointCoords: streetEndpointCoords,
  },
  candidateBridges: {
    south: { wayId: southBridgeWayId, tags: southBridge.tags, endpointNodes: [southBridge.nodes[0], southBridge.nodes.at(-1)] },
    north: { wayId: northBridgeWayId, tags: northBridge.tags, endpointNodes: [northBridge.nodes[0], northBridge.nodes.at(-1)] },
  },
  endpointRows,
  interpretationRule: 'A topological path demonstrates network connectivity only. Production still requires the connected bridge pair to match the documented Fossveien endpoint identity and intended local river scope; proximity alone is insufficient.',
};

fs.writeFileSync(path.join(reportDir, 'endpoint-bridge-topology.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
