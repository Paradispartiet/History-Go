#!/usr/bin/env node

const query = `[out:json][timeout:60];(
  way["natural"="water"]["name"~"^(Alungsjøen|Alnsjøen)$"](around:2000,59.96549,10.85129);
  relation["natural"="water"]["name"~"^(Alungsjøen|Alnsjøen)$"](around:2000,59.96549,10.85129);
  way["waterway"](around:1500,59.96549,10.85129);
);out body geom;`;
const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!response.ok) throw new Error(`Overpass feilet: HTTP ${response.status}`);
const payload = await response.json();
const elements = Array.isArray(payload?.elements) ? payload.elements : [];
const ways = elements.filter((element) => element?.type === 'way');
const lakes = elements.filter((element) => ['way', 'relation'].includes(element?.type) && element?.tags?.natural === 'water' && ['Alungsjøen', 'Alnsjøen'].includes(element?.tags?.name));
const dams = ways.filter((way) => way?.tags?.waterway === 'dam' && ['Alunsjødammen', 'Alundammen'].some((name) => [way?.tags?.name, way?.tags?.alt_name].includes(name)));
const alnaWays = ways.filter((way) => way?.tags?.name === 'Alna' && ['river', 'stream'].includes(way?.tags?.waterway));

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
      const shared = (right?.nodes || []).filter((nodeId) => leftNodes.has(nodeId));
      for (const nodeId of shared) {
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

const lakeWays = lakes.filter((element) => element?.type === 'way');
const summary = {
  osmTimestamp: payload?.osm3s?.timestamp_osm_base || null,
  lakeCandidates: lakes.map((element) => ({ type: element.type, id: element.id, name: element?.tags?.name || null, nodes: element?.nodes?.length || 0 })),
  damCandidates: dams.map((way) => ({ id: way.id, name: way?.tags?.name || null, alt_name: way?.tags?.alt_name || null, nodes: way?.nodes || [], first: way?.geometry?.[0] || null, last: way?.geometry?.at?.(-1) || null })),
  alnaWays: alnaWays.map((way) => ({ id: way.id, waterway: way?.tags?.waterway || null, loc_name: way?.tags?.loc_name || null, nodes: way?.nodes || [], first: way?.geometry?.[0] || null, last: way?.geometry?.at?.(-1) || null })),
  lakeToAlnaSharedNodes: intersections(lakeWays, alnaWays),
  damToAlnaSharedNodes: intersections(dams, alnaWays),
};
console.log('ALUNGSJOEN_ALNA_TOPOLOGY_SUMMARY=' + JSON.stringify(summary));
throw new Error('Diagnostic only: no canonical data changed.');
