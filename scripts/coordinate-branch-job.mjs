import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-159-alnaelvstien-route-research');
const inputPath = path.join(reportDir, 'candidate-summary.json');
const outputPath = path.join(reportDir, 'linear-chain-topology.json');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const ways = data.exactNamedWays || [];
if (!ways.length) throw new Error('Mangler exactNamedWays fra batch 159-research');

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
function routeLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += haversineM(points[i - 1], points[i]);
  return total;
}
function routeMidpoint(points) {
  const total = routeLength(points);
  const target = total / 2;
  let walked = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const segment = haversineM(a, b);
    if (walked + segment >= target) {
      const fraction = segment === 0 ? 0 : (target - walked) / segment;
      return {
        lat: Number((a.lat + (b.lat - a.lat) * fraction).toFixed(7)),
        lon: Number((a.lon + (b.lon - a.lon) * fraction).toFixed(7)),
        totalLengthM: Number(total.toFixed(1)),
      };
    }
    walked += segment;
  }
  const last = points.at(-1);
  return { lat: last.lat, lon: last.lon, totalLengthM: Number(total.toFixed(1)) };
}

const byId = new Map(ways.map((way) => [way.osmId, way]));
const endpointNodes = new Map();
for (const way of ways) {
  const endpoints = [way.nodeIds[0], way.nodeIds.at(-1)];
  for (const nodeId of endpoints) {
    if (!endpointNodes.has(nodeId)) endpointNodes.set(nodeId, []);
    endpointNodes.get(nodeId).push(way.osmId);
  }
}

const adjacency = new Map(ways.map((way) => [way.osmId, []]));
const sharedEndpointLinks = [];
for (const [nodeId, wayIds] of endpointNodes.entries()) {
  if (wayIds.length > 1) {
    for (let i = 0; i < wayIds.length; i += 1) {
      for (let j = i + 1; j < wayIds.length; j += 1) {
        adjacency.get(wayIds[i]).push({ otherWayId: wayIds[j], sharedNodeId: nodeId });
        adjacency.get(wayIds[j]).push({ otherWayId: wayIds[i], sharedNodeId: nodeId });
        sharedEndpointLinks.push({ nodeId, wayA: wayIds[i], wayB: wayIds[j] });
      }
    }
  }
}

const wayDegrees = [...adjacency.entries()].map(([wayId, links]) => ({ wayId, degree: links.length, links }));
const endpointWayIds = wayDegrees.filter((row) => row.degree === 1).map((row) => row.wayId);
const branchingWayIds = wayDegrees.filter((row) => row.degree > 2).map((row) => row.wayId);
const isolatedWayIds = wayDegrees.filter((row) => row.degree === 0).map((row) => row.wayId);
const sharedEndpointNodeDegrees = [...endpointNodes.entries()]
  .filter(([, wayIds]) => wayIds.length > 1)
  .map(([nodeId, wayIds]) => ({ nodeId, wayIds, degree: wayIds.length }));
const branchingNodeIds = sharedEndpointNodeDegrees.filter((row) => row.degree > 2).map((row) => row.nodeId);

let orderedWayIds = [];
let orderedPoints = [];
let orientationRows = [];
let isLinearChain = endpointWayIds.length === 2 && branchingWayIds.length === 0 && isolatedWayIds.length === 0 && branchingNodeIds.length === 0;
if (isLinearChain) {
  let currentWayId = endpointWayIds[0];
  let previousWayId = null;
  const seen = new Set();
  while (currentWayId && !seen.has(currentWayId)) {
    seen.add(currentWayId);
    orderedWayIds.push(currentWayId);
    const links = adjacency.get(currentWayId).filter((link) => link.otherWayId !== previousWayId);
    const next = links.find((link) => !seen.has(link.otherWayId)) || null;
    previousWayId = currentWayId;
    currentWayId = next?.otherWayId || null;
  }
  if (seen.size !== ways.length) isLinearChain = false;
}

if (isLinearChain) {
  let previousSharedNode = null;
  for (let index = 0; index < orderedWayIds.length; index += 1) {
    const wayId = orderedWayIds[index];
    const way = byId.get(wayId);
    const firstNode = way.nodeIds[0];
    const lastNode = way.nodeIds.at(-1);
    let points = [...way.geometry];
    let nodeIds = [...way.nodeIds];
    let reversed = false;

    if (index === 0) {
      const nextWayId = orderedWayIds[index + 1];
      const nextWay = byId.get(nextWayId);
      const nextEndpointSet = new Set([nextWay.nodeIds[0], nextWay.nodeIds.at(-1)]);
      const sharedWithNext = [firstNode, lastNode].find((nodeId) => nextEndpointSet.has(nodeId));
      if (!sharedWithNext) throw new Error(`Finner ikke delt endepunkt mellom første way ${wayId} og ${nextWayId}`);
      if (firstNode === sharedWithNext) {
        points.reverse();
        nodeIds.reverse();
        reversed = true;
      }
      previousSharedNode = sharedWithNext;
    } else {
      if (firstNode !== previousSharedNode && lastNode !== previousSharedNode) {
        throw new Error(`Way ${wayId} kobler ikke på forventet node ${previousSharedNode}`);
      }
      if (lastNode === previousSharedNode) {
        points.reverse();
        nodeIds.reverse();
        reversed = true;
      }
      if (index < orderedWayIds.length - 1) {
        const nextWayId = orderedWayIds[index + 1];
        const nextWay = byId.get(nextWayId);
        const nextEndpointSet = new Set([nextWay.nodeIds[0], nextWay.nodeIds.at(-1)]);
        const sharedWithNext = [nodeIds[0], nodeIds.at(-1)].find((nodeId) => nodeId !== previousSharedNode && nextEndpointSet.has(nodeId));
        if (!sharedWithNext) throw new Error(`Finner ikke neste delt endepunkt mellom ${wayId} og ${nextWayId}`);
        previousSharedNode = sharedWithNext;
      }
    }

    if (!orderedPoints.length) orderedPoints.push(...points);
    else {
      const last = orderedPoints.at(-1);
      const first = points[0];
      if (haversineM(last, first) > 0.5) throw new Error(`Geometri-gap mellom segmenter: ${haversineM(last, first).toFixed(2)} m`);
      orderedPoints.push(...points.slice(1));
    }
    orientationRows.push({ wayId, reversed, startNodeId: nodeIds[0], endNodeId: nodeIds.at(-1) });
  }
}

const midpoint = isLinearChain ? routeMidpoint(orderedPoints) : null;
const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'alnaelvstien',
  wayCount: ways.length,
  endpointWayIds,
  branchingWayIds,
  isolatedWayIds,
  branchingNodeIds,
  wayDegrees,
  sharedEndpointLinks,
  isLinearChain,
  orderedWayIds,
  orientationRows,
  routePointCount: orderedPoints.length,
  routeStart: orderedPoints[0] || null,
  routeEnd: orderedPoints.at(-1) || null,
  midpoint,
  interpretation: isLinearChain
    ? 'All 11 exact named Alnastien ways form one unbranched endpoint-connected chain. This supports an explicit routeSegments model for this concrete Bryn–Svartdalen Alnastien component.'
    : 'The exact named Alnastien ways do not form a single unbranched chain; production must not collapse them into one route without further research.',
};
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  status: 'topology_complete',
  isLinearChain,
  wayCount: ways.length,
  orderedWayIds,
  midpoint,
  report: path.relative(ROOT, outputPath),
}, null, 2));
