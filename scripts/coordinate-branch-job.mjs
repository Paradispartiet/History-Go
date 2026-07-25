import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-torggata-storgata-research-20260725');
const raw = JSON.parse(await fs.readFile(path.join(reportDir, 'overpass-raw.json'), 'utf8'));
const initial = JSON.parse(await fs.readFile(path.join(reportDir, 'summary.json'), 'utf8'));

const rad = (value) => value * Math.PI / 180;
function distanceMeters(a, b) {
  const earth = 6371000;
  const x = rad(b.lon - a.lon) * Math.cos(rad((a.lat + b.lat) / 2));
  const y = rad(b.lat - a.lat);
  return Math.sqrt(x * x + y * y) * earth;
}
function lineLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += distanceMeters(points[i - 1], points[i]);
  return total;
}
function normalizeWay(element) {
  const geometry = (element.geometry || []).map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) }));
  const nodes = (element.nodes || []).map(String);
  if (geometry.length < 2 || geometry.length !== nodes.length) return null;
  return {
    id: Number(element.id), tags: element.tags || {}, geometry, nodes,
    startNode: nodes[0], endNode: nodes.at(-1), lengthM: lineLength(geometry),
  };
}
function graphFor(ways) {
  const adjacency = new Map();
  ways.forEach((way, edgeIndex) => {
    for (const [node, other] of [[way.startNode, way.endNode], [way.endNode, way.startNode]]) {
      if (!adjacency.has(node)) adjacency.set(node, []);
      adjacency.get(node).push({ edgeIndex, other, lengthM: way.lengthM });
    }
  });
  return adjacency;
}
function components(ways) {
  const adjacency = graphFor(ways);
  const seenEdges = new Set();
  const out = [];
  for (let i = 0; i < ways.length; i += 1) {
    if (seenEdges.has(i)) continue;
    const queue = [i];
    const indexes = [];
    seenEdges.add(i);
    while (queue.length) {
      const edgeIndex = queue.shift();
      indexes.push(edgeIndex);
      const way = ways[edgeIndex];
      for (const node of [way.startNode, way.endNode]) {
        for (const edge of adjacency.get(node) || []) {
          if (!seenEdges.has(edge.edgeIndex)) {
            seenEdges.add(edge.edgeIndex);
            queue.push(edge.edgeIndex);
          }
        }
      }
    }
    out.push(indexes.map((index) => ways[index]));
  }
  return out;
}
function nodeCoordinates(ways) {
  const map = new Map();
  for (const way of ways) {
    map.set(way.startNode, way.geometry[0]);
    map.set(way.endNode, way.geometry.at(-1));
  }
  return map;
}
function shortestPath(ways, startNode, targetNode) {
  const adjacency = graphFor(ways);
  const distances = new Map([[startNode, 0]]);
  const previous = new Map();
  const unvisited = new Set(adjacency.keys());
  while (unvisited.size) {
    let current = null;
    let bestDistance = Infinity;
    for (const node of unvisited) {
      const value = distances.get(node) ?? Infinity;
      if (value < bestDistance) { bestDistance = value; current = node; }
    }
    if (current === null || bestDistance === Infinity) break;
    unvisited.delete(current);
    if (current === targetNode) break;
    for (const edge of adjacency.get(current) || []) {
      const nextDistance = bestDistance + edge.lengthM;
      if (nextDistance < (distances.get(edge.other) ?? Infinity)) {
        distances.set(edge.other, nextDistance);
        previous.set(edge.other, { node: current, edgeIndex: edge.edgeIndex });
      }
    }
  }
  if (!previous.has(targetNode)) throw new Error(`No route between ${startNode} and ${targetNode}`);
  const reverse = [];
  let node = targetNode;
  while (node !== startNode) {
    const step = previous.get(node);
    reverse.push({ edgeIndex: step.edgeIndex, fromNode: step.node, toNode: node });
    node = step.node;
  }
  return reverse.reverse();
}
function farthestTerminalPair(ways) {
  const adjacency = graphFor(ways);
  const coords = nodeCoordinates(ways);
  const terminals = [...adjacency.entries()].filter(([, edges]) => edges.length === 1).map(([node]) => node);
  if (terminals.length < 2) throw new Error('Street graph has fewer than two terminals');
  let best = null;
  for (let i = 0; i < terminals.length; i += 1) {
    for (let j = i + 1; j < terminals.length; j += 1) {
      const distanceM = distanceMeters(coords.get(terminals[i]), coords.get(terminals[j]));
      if (!best || distanceM > best.distanceM) best = { startNode: terminals[i], targetNode: terminals[j], distanceM };
    }
  }
  return { ...best, terminals: terminals.map((node) => ({ node, ...coords.get(node) })) };
}
function flattenRoute(ways, route) {
  const points = [];
  const orderedWays = [];
  for (const step of route) {
    const way = ways[step.edgeIndex];
    const forward = way.startNode === step.fromNode;
    const geometry = forward ? way.geometry : [...way.geometry].reverse();
    if (!points.length) points.push(...geometry);
    else points.push(...geometry.slice(1));
    orderedWays.push({
      osmWayId: way.id,
      sourceObjectId: `osm-way:${way.id}`,
      sourceUrl: `https://www.openstreetmap.org/way/${way.id}`,
      name: way.tags.name || null,
      highway: way.tags.highway || null,
      surface: way.tags.surface || null,
      lengthM: Number(way.lengthM.toFixed(1)),
      traversal: forward ? 'forward' : 'reverse',
      startNodeId: step.fromNode,
      endNodeId: step.toNode,
      geometry,
    });
  }
  return { points, orderedWays };
}
function midpointWithWay(orderedWays) {
  const totalLengthM = orderedWays.reduce((sum, way) => sum + lineLength(way.geometry), 0);
  const target = totalLengthM / 2;
  let walked = 0;
  for (const way of orderedWays) {
    for (let i = 1; i < way.geometry.length; i += 1) {
      const a = way.geometry[i - 1];
      const b = way.geometry[i];
      const segmentLengthM = distanceMeters(a, b);
      if (walked + segmentLengthM >= target) {
        const t = segmentLengthM === 0 ? 0 : (target - walked) / segmentLengthM;
        return {
          lat: a.lat + (b.lat - a.lat) * t,
          lon: a.lon + (b.lon - a.lon) * t,
          totalLengthM,
          sourceObjectId: way.sourceObjectId,
          sourceUrl: way.sourceUrl,
          osmWayId: way.osmWayId,
          segmentFraction: t,
        };
      }
      walked += segmentLengthM;
    }
  }
  throw new Error('Could not calculate midpoint');
}
function simpleTerminalRoute(ways) {
  const adjacency = graphFor(ways);
  const terminals = [...adjacency.entries()].filter(([, edges]) => edges.length === 1).map(([node]) => node);
  if (terminals.length !== 2) throw new Error(`Expected simple route with two terminals, got ${terminals.length}`);
  return shortestPath(ways, terminals[0], terminals[1]);
}

const output = [];
for (const initialPlace of initial.places) {
  const allWays = (raw.elements || [])
    .filter((element) => element.type === 'way' && element.tags?.name === initialPlace.name && element.tags?.highway && element.tags?.area !== 'yes')
    .map(normalizeWay).filter(Boolean);
  let selectedWays;
  let route;
  let topologyDecision;
  let endpointGate;
  if (initialPlace.placeId === 'torggata') {
    selectedWays = components(allWays).sort((a, b) => b.reduce((s, w) => s + w.lengthM, 0) - a.reduce((s, w) => s + w.lengthM, 0))[0];
    route = simpleTerminalRoute(selectedWays);
    topologyDecision = 'largest connected named component representing the canonical Youngstorget–Ankerbrua street section';
  } else {
    selectedWays = allWays;
    const pair = farthestTerminalPair(selectedWays);
    route = shortestPath(selectedWays, pair.startNode, pair.targetNode);
    topologyDecision = 'shortest named-street path between the two geographically farthest terminal nodes, avoiding parallel-carriageway U-turns';
    endpointGate = pair;
  }
  const flattened = flattenRoute(selectedWays, route);
  const midpoint = midpointWithWay(flattened.orderedWays);
  const endpoints = [flattened.points[0], flattened.points.at(-1)];
  if (initialPlace.placeId === 'torggata') {
    if (!(Math.min(...endpoints.map((p) => p.lat)) < 59.9153 && Math.max(...endpoints.map((p) => p.lat)) > 59.9183)) {
      throw new Error('Torggata endpoint gate failed');
    }
  } else if (!(Math.min(...endpoints.map((p) => p.lat)) < 59.9131 && Math.max(...endpoints.map((p) => p.lat)) > 59.9176)) {
    throw new Error('Storgata Kirkeristen–Nybrua endpoint gate failed');
  }
  output.push({
    ...initialPlace,
    geometryResearchV2: {
      topologyDecision,
      endpointGate,
      orderedRouteWayCount: flattened.orderedWays.length,
      orderedRouteLengthM: Number(midpoint.totalLengthM.toFixed(1)),
      routeEndpoints: endpoints,
      routeWays: flattened.orderedWays.map(({ geometry, ...way }) => way),
    },
    decision: {
      ...initialPlace.decision,
      recommendedLat: midpoint.lat,
      recommendedLon: midpoint.lon,
      sourceProvider: 'osm',
      sourceObjectId: midpoint.sourceObjectId,
      sourceUrl: midpoint.sourceUrl,
      midpointOsmWayId: midpoint.osmWayId,
      pointDistanceToNamedStreetGeometryM: 0,
      displacementFromCurrentM: Number(distanceMeters(initialPlace.currentCoordinate, midpoint).toFixed(1)),
      topologyValidated: true,
    },
  });
}
const summary = {
  version: '2026-07-25-refined-v2',
  researchOnly: true,
  canonicalChanged: false,
  candidateCount: output.length,
  verifiableCount: output.filter((item) => item.decision.canBecomeVerified && item.decision.topologyValidated).length,
  places: output,
};
if (summary.verifiableCount !== 2) throw new Error('Both street candidates must pass refined topology gate');
await fs.writeFile(path.join(reportDir, 'summary-v2.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README-v2.md'), '# Refined Torggata and Storgata topology\n\nTorggata uses the complete simple named component for the intended central street section. Storgata uses the shortest named-street path between the farthest terminal nodes, which avoids traversing both parallel carriageways as a false U-turn. Midpoint source IDs now identify the exact OSM way containing each display point.\n', 'utf8');
console.log(JSON.stringify(summary, null, 2));
