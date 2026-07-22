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

const lakeRelationId = 16661;
const query = `[out:json][timeout:25];
relation(${lakeRelationId})->.lake;
way(r.lake)->.lakeways;
node(w.lakeways)->.lakenodes;
way(bn.lakenodes)["waterway"]->.connected;
(.lakeways;.connected;);
out body geom;`;

const result = await runOverpass(query, 'Nøklevann direkte utløpstopologi');
const elements = Array.isArray(result.payload?.elements) ? result.payload.elements : [];
const ways = elements.filter((element) => element?.type === 'way');
const lakeWays = ways.filter((way) => !way?.tags?.waterway);
const connectedWaterways = ways.filter((way) => Boolean(way?.tags?.waterway));

const nodeCoords = new Map();
for (const way of ways) {
  const nodes = Array.isArray(way?.nodes) ? way.nodes : [];
  const geometry = Array.isArray(way?.geometry) ? way.geometry : [];
  for (let index = 0; index < Math.min(nodes.length, geometry.length); index += 1) {
    nodeCoords.set(nodes[index], geometry[index]);
  }
}

const shared = [];
for (const lakeWay of lakeWays) {
  const lakeNodes = new Set(lakeWay?.nodes || []);
  for (const waterway of connectedWaterways) {
    for (const nodeId of waterway?.nodes || []) {
      if (!lakeNodes.has(nodeId)) continue;
      shared.push({
        lakeWayId: lakeWay.id,
        waterwayWayId: waterway.id,
        waterway: waterway?.tags?.waterway || null,
        name: waterway?.tags?.name || null,
        alt_name: waterway?.tags?.alt_name || null,
        tunnel: waterway?.tags?.tunnel || null,
        layer: waterway?.tags?.layer || null,
        nodeId,
        coordinate: nodeCoords.get(nodeId) || null,
      });
    }
  }
}

const summary = {
  osmTimestamp: result.payload?.osm3s?.timestamp_osm_base || null,
  endpoint: result.endpoint,
  lakeRelationId,
  lakeMemberWayIds: lakeWays.map((way) => way.id),
  directlyConnectedWaterways: connectedWaterways.map((way) => ({
    id: way.id,
    waterway: way?.tags?.waterway || null,
    name: way?.tags?.name || null,
    alt_name: way?.tags?.alt_name || null,
    tunnel: way?.tags?.tunnel || null,
    layer: way?.tags?.layer || null,
    nodes: way?.nodes || [],
    first: way?.geometry?.[0] || null,
    last: way?.geometry?.at?.(-1) || null,
  })),
  sharedLakeBoundaryNodes: shared,
};

console.log('NOKLEVANN_DIRECT_OUTLET_TOPOLOGY=' + JSON.stringify(summary));
throw new Error('Diagnostic only: no canonical data changed.');
