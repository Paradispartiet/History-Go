#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-161-fossveien-research');
fs.mkdirSync(reportDir, { recursive: true });

const streetWayId = 3235603;
const southBridgeWayId = 457755404;
const northBridgeWayId = 3236542;
const endpoint = 'https://overpass-api.de/api/interpreter';

async function overpass(query, label) {
  const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' },
  });
  if (!response.ok) throw new Error(`${label}: HTTP ${response.status}`);
  return response.json();
}

const seedQuery = `[out:json][timeout:25];way(${streetWayId});way(${southBridgeWayId});way(${northBridgeWayId});out body geom;`;
const seed = await overpass(seedQuery, 'seed ways');
const seedWays = new Map((seed.elements || []).filter((e) => e.type === 'way').map((e) => [Number(e.id), e]));
const street = seedWays.get(streetWayId);
const southBridge = seedWays.get(southBridgeWayId);
const northBridge = seedWays.get(northBridgeWayId);
if (!street || !southBridge || !northBridge) throw new Error('Missing one or more seed ways');
if (street?.tags?.name !== 'Fossveien') throw new Error('Street seed is not Fossveien');

const streetNodes = street.nodes || [];
const streetEndpoints = [streetNodes[0], streetNodes.at(-1)];
const streetGeometry = street.geometry || [];
const streetEndpointCoords = [streetGeometry[0], streetGeometry.at(-1)];

const graphQuery = `[out:json][timeout:35];(
  way["highway"](around:350,${streetEndpointCoords[0].lat},${streetEndpointCoords[0].lon});
  way["highway"](around:350,${streetEndpointCoords[1].lat},${streetEndpointCoords[1].lon});
);out body geom;`;
const graphPayload = await overpass(graphQuery, 'local highway graph');
fs.writeFileSync(path.join(reportDir, 'endpoint-highway-graph.json'), `${JSON.stringify(graphPayload, null, 2)}\n`);

const ways = (graphPayload.elements || []).filter((e) => e.type === 'way' && Array.isArray(e.nodes));
const nodeToWays = new Map();
const nodeCoords = new Map();
for (const way of ways) {
  const geometry = way.geometry || [];
  for (let i = 0; i < way.nodes.length; i += 1) {
    const nodeId = Number(way.nodes[i]);
    if (!nodeToWays.has(nodeId)) nodeToWays.set(nodeId, []);
    nodeToWays.get(nodeId).push(way);
    if (geometry[i]) nodeCoords.set(nodeId, geometry[i]);
  }
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

function buildAdjacency() {
  const adjacency = new Map();
  const addEdge = (a, b, way) => {
    if (!adjacency.has(a)) adjacency.set(a, []);
    adjacency.get(a).push({ nodeId: b, wayId: way.id, wayName: way.tags?.name || null, highway: way.tags?.highway || null });
  };
  for (const way of ways) {
    for (let i = 0; i < way.nodes.length - 1; i += 1) {
      const a = Number(way.nodes[i]);
      const b = Number(way.nodes[i + 1]);
      addEdge(a, b, way);
      addEdge(b, a, way);
    }
  }
  return adjacency;
}

const adjacency = buildAdjacency();
function bfs(startNode, targetNodes, maxSteps = 30) {
  const targets = new Set(targetNodes.map(Number));
  const queue = [{ nodeId: Number(startNode), path: [] }];
  const visited = new Set([Number(startNode)]);
  while (queue.length) {
    const current = queue.shift();
    if (targets.has(current.nodeId)) return current.path;
    if (current.path.length >= maxSteps) continue;
    for (const edge of adjacency.get(current.nodeId) || []) {
      if (visited.has(edge.nodeId)) continue;
      visited.add(edge.nodeId);
      queue.push({ nodeId: edge.nodeId, path: [...current.path, edge] });
    }
  }
  return null;
}

const bridgeTargets = {
  south: (southBridge.nodes || []).map(Number),
  north: (northBridge.nodes || []).map(Number),
};

const endpointRows = streetEndpoints.map((nodeId, index) => ({
  endpointIndex: index,
  nodeId: Number(nodeId),
  coordinate: streetEndpointCoords[index],
  connectedWaysAtNode: (nodeToWays.get(Number(nodeId)) || []).map((way) => ({ id: way.id, name: way.tags?.name || null, highway: way.tags?.highway || null })),
  pathToSouthBridge: bfs(nodeId, bridgeTargets.south),
  pathToNorthBridge: bfs(nodeId, bridgeTargets.north),
}));

for (const row of endpointRows) {
  for (const key of ['pathToSouthBridge', 'pathToNorthBridge']) {
    const path = row[key];
    if (!path) continue;
    let lengthM = 0;
    let prev = row.nodeId;
    for (const edge of path) {
      const a = nodeCoords.get(prev);
      const b = nodeCoords.get(edge.nodeId);
      if (a && b) lengthM += distance(a, b);
      prev = edge.nodeId;
    }
    row[`${key}LengthM`] = Number(lengthM.toFixed(1));
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  street: {
    wayId: streetWayId,
    name: street.tags?.name || null,
    endpointNodes: streetEndpoints,
    endpointCoords: streetEndpointCoords,
  },
  candidateBridges: {
    south: { wayId: southBridgeWayId, tags: southBridge.tags || {}, nodes: southBridge.nodes || [], geometry: southBridge.geometry || [] },
    north: { wayId: northBridgeWayId, tags: northBridge.tags || {}, nodes: northBridge.nodes || [], geometry: northBridge.geometry || [] },
  },
  endpointRows,
  interpretationRule: 'A topological path only demonstrates network connectivity. It does not by itself authorize production; the connected path must also match the documented Fossveien endpoint identity and the intended local river scope.',
};

fs.writeFileSync(path.join(reportDir, 'endpoint-bridge-topology.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
