#!/usr/bin/env node

const endpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function runOverpass(query, label) {
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const url = `${endpoint}?data=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'History-Go-coordinate-audit/1.0',
        },
      });
      if (!response.ok) {
        lastError = new Error(`${label}: ${endpoint} svarte HTTP ${response.status}`);
        continue;
      }
      return { endpoint, payload: await response.json() };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`${label}: alle Overpass-endepunkter feilet`);
}

const center = '59.8836,10.8780';
const identityQuery = `[out:json][timeout:25];nwr["natural"="water"]["name"="Nøklevann"](around:1500,${center});out tags center;`;
const topologyQuery = `[out:json][timeout:25];(
  way["waterway"="dam"](around:1200,${center});
  way["waterway"]["name"~"^(Skraperudbekken|Ljanselva)$"](around:1800,${center});
);out body geom;`;

const identityResult = await runOverpass(identityQuery, 'Nøklevann-identitet');
const topologyResult = await runOverpass(topologyQuery, 'Nøklevann-utløpstopologi');

const identityElements = Array.isArray(identityResult.payload?.elements) ? identityResult.payload.elements : [];
const elements = Array.isArray(topologyResult.payload?.elements) ? topologyResult.payload.elements : [];
const ways = elements.filter((element) => element?.type === 'way');
const dams = ways.filter((way) => way?.tags?.waterway === 'dam');
const targetWaterways = ways.filter((way) => ['Skraperudbekken', 'Ljanselva'].includes(way?.tags?.name));

const nodeCoords = new Map();
for (const way of ways) {
  const nodes = Array.isArray(way?.nodes) ? way.nodes : [];
  const geometry = Array.isArray(way?.geometry) ? way.geometry : [];
  for (let index = 0; index < Math.min(nodes.length, geometry.length); index += 1) {
    nodeCoords.set(nodes[index], geometry[index]);
  }
}

const intersections = (leftWays, rightWays) => {
  const rows = [];
  for (const left of leftWays) {
    const leftNodes = new Set(left?.nodes || []);
    for (const right of rightWays) {
      for (const nodeId of right?.nodes || []) {
        if (!leftNodes.has(nodeId)) continue;
        rows.push({
          leftWayId: left.id,
          leftName: left?.tags?.name || null,
          leftWaterway: left?.tags?.waterway || null,
          rightWayId: right.id,
          rightName: right?.tags?.name || null,
          rightWaterway: right?.tags?.waterway || null,
          nodeId,
          coordinate: nodeCoords.get(nodeId) || null,
        });
      }
    }
  }
  return rows;
};

const summary = {
  osmTimestamp: topologyResult.payload?.osm3s?.timestamp_osm_base || null,
  identityEndpoint: identityResult.endpoint,
  topologyEndpoint: topologyResult.endpoint,
  lakeCandidates: identityElements.map((element) => ({
    type: element.type,
    id: element.id,
    name: element?.tags?.name || null,
    natural: element?.tags?.natural || null,
    center: element?.center || null,
  })),
  damCandidates: dams.map((way) => ({
    id: way.id,
    name: way?.tags?.name || null,
    alt_name: way?.tags?.alt_name || null,
    nodes: way?.nodes || [],
    first: way?.geometry?.[0] || null,
    last: way?.geometry?.at?.(-1) || null,
  })),
  targetWaterways: targetWaterways.map((way) => ({
    id: way.id,
    name: way?.tags?.name || null,
    waterway: way?.tags?.waterway || null,
    nodes: way?.nodes || [],
    first: way?.geometry?.[0] || null,
    last: way?.geometry?.at?.(-1) || null,
  })),
  damToTargetSharedNodes: intersections(dams, targetWaterways),
};

console.log('NOKLEVANN_OUTFLOW_TOPOLOGY_SUMMARY=' + JSON.stringify(summary));
throw new Error('Diagnostic only: no canonical data changed.');
