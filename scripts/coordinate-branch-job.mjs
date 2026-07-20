import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT = 'reports/oslo-coordinate-control-batch-93/relation-connectivity-diagnostic.json';
const RELATION_ID = 1459739;
const API = `https://api.openstreetmap.org/api/0.6/relation/${RELATION_ID}/full.json`;
const FROG = { lat: 59.9791178, lon: 10.6766344 };
const MIDT = { lat: 59.9613099, lon: 10.6830798 };

function full(file) { return path.join(ROOT, file); }
function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function nearest(pointsA, pointsB) {
  let best = { meters: Infinity, a: null, b: null };
  for (const a of pointsA) {
    for (const b of pointsB) {
      const meters = haversineMeters(a, b);
      if (meters < best.meters) best = { meters, a, b };
    }
  }
  return best;
}

const response = await fetch(API, { headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
if (!response.ok) throw new Error(`OSM API failed: ${response.status}`);
const data = await response.json();
const elements = data.elements || [];
const relation = elements.find((e) => e.type === 'relation' && e.id === RELATION_ID);
if (!relation) throw new Error('Relation missing');
const nodeMap = new Map(elements.filter((e) => e.type === 'node').map((n) => [n.id, { lat: n.lat, lon: n.lon, id: n.id }]));
const wayMap = new Map(elements.filter((e) => e.type === 'way').map((w) => [w.id, w]));
const refs = [...new Set((relation.members || []).filter((m) => m.type === 'way').map((m) => m.ref))];
const ways = refs.map((id) => wayMap.get(id)).filter(Boolean);

const nodeToWays = new Map();
for (const way of ways) {
  for (const nodeId of new Set(way.nodes || [])) {
    if (!nodeToWays.has(nodeId)) nodeToWays.set(nodeId, []);
    nodeToWays.get(nodeId).push(way.id);
  }
}

const unassigned = new Set(ways.map((w) => w.id));
const components = [];
while (unassigned.size) {
  const seed = unassigned.values().next().value;
  const stack = [seed];
  const componentWayIds = [];
  while (stack.length) {
    const wayId = stack.pop();
    if (!unassigned.has(wayId)) continue;
    unassigned.delete(wayId);
    componentWayIds.push(wayId);
    const way = wayMap.get(wayId);
    for (const nodeId of new Set(way.nodes || [])) {
      for (const neighbor of nodeToWays.get(nodeId) || []) if (unassigned.has(neighbor)) stack.push(neighbor);
    }
  }
  const componentWays = componentWayIds.map((id) => wayMap.get(id));
  const edgeMap = new Map();
  const degree = new Map();
  const pointByNode = new Map();
  for (const way of componentWays) {
    for (const nodeId of way.nodes || []) {
      const point = nodeMap.get(nodeId);
      if (point) pointByNode.set(nodeId, point);
    }
    for (let i = 1; i < way.nodes.length; i += 1) {
      const aId = way.nodes[i - 1];
      const bId = way.nodes[i];
      const key = aId < bId ? `${aId}:${bId}` : `${bId}:${aId}`;
      if (edgeMap.has(key)) continue;
      const a = nodeMap.get(aId);
      const b = nodeMap.get(bId);
      if (!a || !b) continue;
      edgeMap.set(key, haversineMeters(a, b));
      degree.set(aId, (degree.get(aId) || 0) + 1);
      degree.set(bId, (degree.get(bId) || 0) + 1);
    }
  }
  const points = [...pointByNode.values()];
  const endpointIds = [...degree.entries()].filter(([, d]) => d === 1).map(([id]) => id);
  components.push({
    wayIds: componentWayIds,
    wayCount: componentWayIds.length,
    lengthMeters: [...edgeMap.values()].reduce((sum, value) => sum + value, 0),
    nodeCount: points.length,
    endpointIds,
    endpoints: endpointIds.map((id) => nodeMap.get(id)).filter(Boolean),
    minDistanceToFrognerseterenMeters: Math.min(...points.map((p) => haversineMeters(p, FROG))),
    minDistanceToMidtstuenMeters: Math.min(...points.map((p) => haversineMeters(p, MIDT))),
    points
  });
}
components.sort((a, b) => a.minDistanceToFrognerseterenMeters - b.minDistanceToFrognerseterenMeters);

const componentGaps = [];
for (let i = 0; i < components.length; i += 1) {
  for (let j = i + 1; j < components.length; j += 1) {
    const gap = nearest(components[i].points, components[j].points);
    componentGaps.push({
      a: i,
      b: j,
      meters: Number(gap.meters.toFixed(2)),
      aPoint: gap.a,
      bPoint: gap.b
    });
  }
}
componentGaps.sort((a, b) => a.meters - b.meters);

const compactComponents = components.map(({ points, ...component }, index) => ({
  index,
  ...component,
  lengthMeters: Number(component.lengthMeters.toFixed(1)),
  minDistanceToFrognerseterenMeters: Number(component.minDistanceToFrognerseterenMeters.toFixed(1)),
  minDistanceToMidtstuenMeters: Number(component.minDistanceToMidtstuenMeters.toFixed(1))
}));
const result = {
  relationId: RELATION_ID,
  tags: relation.tags,
  memberWayCount: ways.length,
  componentCount: components.length,
  totalMemberGeometryLengthMeters: Number(components.reduce((sum, c) => sum + c.lengthMeters, 0).toFixed(1)),
  components: compactComponents,
  nearestComponentGaps: componentGaps.slice(0, 20)
};
fs.mkdirSync(path.dirname(full(REPORT)), { recursive: true });
fs.writeFileSync(full(REPORT), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
