#!/usr/bin/env node

const query = `[out:json][timeout:60];(
  way["natural"="water"]["name"="Nøklevann"](around:2000,59.8836,10.8780);
  relation["natural"="water"]["name"="Nøklevann"](around:2000,59.8836,10.8780);
  way["waterway"](around:1800,59.8836,10.8780);
);out body geom;`;
const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!response.ok) throw new Error(`Overpass feilet: HTTP ${response.status}`);
const payload = await response.json();
const elements = Array.isArray(payload?.elements) ? payload.elements : [];
const ways = elements.filter((element) => element?.type === 'way');
const lakes = elements.filter((element) => ['way', 'relation'].includes(element?.type) && element?.tags?.natural === 'water' && element?.tags?.name === 'Nøklevann');
const dams = ways.filter((way) => way?.tags?.waterway === 'dam');
const targetWaterways = ways.filter((way) => ['Skraperudbekken', 'Ljanselva'].includes(way?.tags?.name));

const nodeCoords = new Map();
for (const way of ways) {
  const nodes = Array.isArray(way?.nodes) ? way.nodes : [];
  const geometry = Array.isArray(way?.geometry) ? way.geometry : [];
  for (let index = 0; index < Math.min(nodes.length, geometry.length); index += 1) nodeCoords.set(nodes[index], geometry[index]);
}
const intersections = (leftWays, rightWays) => {
  const rows = [];
  for (const left of leftWays) {
    const leftNodes = new Set(left?.nodes || []);
    for (const right of rightWays) {
      for (const nodeId of right?.nodes || []) {
        if (!leftNodes.has(nodeId)) continue;
        rows.push({ leftWayId: left.id, leftName: left?.tags?.name || null, leftWaterway: left?.tags?.waterway || null, rightWayId: right.id, rightName: right?.tags?.name || null, rightWaterway: right?.tags?.waterway || null, nodeId, coordinate: nodeCoords.get(nodeId) || null });
      }
    }
  }
  return rows;
};

const lakeWays = lakes.filter((element) => element?.type === 'way');
const summary = {
  osmTimestamp: payload?.osm3s?.timestamp_osm_base || null,
  lakeCandidates: lakes.map((element) => ({ type: element.type, id: element.id, name: element?.tags?.name || null, nodes: element?.nodes?.length || 0 })),
  damCandidates: dams.map((way) => ({ id: way.id, name: way?.tags?.name || null, alt_name: way?.tags?.alt_name || null, nodes: way?.nodes || [], first: way?.geometry?.[0] || null, last: way?.geometry?.at?.(-1) || null })),
  targetWaterways: targetWaterways.map((way) => ({ id: way.id, name: way?.tags?.name || null, waterway: way?.tags?.waterway || null, nodes: way?.nodes || [], first: way?.geometry?.[0] || null, last: way?.geometry?.at?.(-1) || null })),
  lakeToTargetSharedNodes: intersections(lakeWays, targetWaterways),
  damToTargetSharedNodes: intersections(dams, targetWaterways),
};
console.log('NOKLEVANN_OUTFLOW_TOPOLOGY_SUMMARY=' + JSON.stringify(summary));
throw new Error('Diagnostic only: no canonical data changed.');
