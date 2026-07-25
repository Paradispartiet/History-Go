import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-torggata-storgata-research-20260725');
await fs.mkdir(reportDir, { recursive: true });

const userAgent = 'History-Go coordinate research/2026-07-25';
const configs = [
  {
    placeId: 'torggata',
    name: 'Torggata',
    placePath: 'data/places/by/oslo/places/torggata.json',
    identityUrl: 'https://oslobyleksikon.no/side/Torggata',
    identityPattern: /Torggata/i,
  },
  {
    placeId: 'storgata',
    name: 'Storgata',
    placePath: 'data/places/by/oslo/places/storgata.json',
    identityUrl: 'https://oslobyleksikon.no/side/Storgata',
    identityPattern: /Storgata/i,
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function fetchText(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'user-agent': userAgent, ...(options.headers || {}) },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1500 * attempt);
    }
  }
  throw lastError;
}

const rad = (value) => value * Math.PI / 180;
function distanceMeters(a, b) {
  const earth = 6371000;
  const x = rad(b.lon - a.lon) * Math.cos(rad((a.lat + b.lat) / 2));
  const y = rad(b.lat - a.lat);
  return Math.sqrt(x * x + y * y) * earth;
}
function projectPointToSegment(point, a, b) {
  const lat0 = rad((point.lat + a.lat + b.lat) / 3);
  const scaleX = 6371000 * Math.cos(lat0) * Math.PI / 180;
  const scaleY = 6371000 * Math.PI / 180;
  const ax = a.lon * scaleX;
  const ay = a.lat * scaleY;
  const bx = b.lon * scaleX;
  const by = b.lat * scaleY;
  const px = point.lon * scaleX;
  const py = point.lat * scaleY;
  const dx = bx - ax;
  const dy = by - ay;
  const denom = dx * dx + dy * dy;
  const t = denom === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / denom));
  const x = ax + t * dx;
  const y = ay + t * dy;
  return {
    lat: y / scaleY,
    lon: x / scaleX,
    distanceM: Math.hypot(px - x, py - y),
    t,
  };
}
function nearestPointOnPolyline(point, points) {
  let best = null;
  for (let i = 1; i < points.length; i += 1) {
    const candidate = projectPointToSegment(point, points[i - 1], points[i]);
    if (!best || candidate.distanceM < best.distanceM) best = { ...candidate, segmentIndex: i - 1 };
  }
  return best;
}
function lineLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += distanceMeters(points[i - 1], points[i]);
  return total;
}
function midpointOnLine(points) {
  const total = lineLength(points);
  const target = total / 2;
  let walked = 0;
  for (let i = 1; i < points.length; i += 1) {
    const segment = distanceMeters(points[i - 1], points[i]);
    if (walked + segment >= target) {
      const t = segment === 0 ? 0 : (target - walked) / segment;
      return {
        lat: points[i - 1].lat + (points[i].lat - points[i - 1].lat) * t,
        lon: points[i - 1].lon + (points[i].lon - points[i - 1].lon) * t,
        totalLengthM: total,
        segmentIndex: i - 1,
        segmentFraction: t,
      };
    }
    walked += segment;
  }
  return { ...points.at(-1), totalLengthM: total, segmentIndex: points.length - 2, segmentFraction: 1 };
}

function normalizeWay(element) {
  const geometry = Array.isArray(element.geometry)
    ? element.geometry.map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) }))
    : [];
  const nodes = Array.isArray(element.nodes) ? element.nodes.map(String) : [];
  if (geometry.length < 2 || nodes.length !== geometry.length) return null;
  return {
    id: Number(element.id),
    tags: element.tags || {},
    nodes,
    geometry,
    startNode: nodes[0],
    endNode: nodes.at(-1),
    lengthM: lineLength(geometry),
  };
}

function connectedComponents(ways) {
  const endpointMap = new Map();
  ways.forEach((way, index) => {
    for (const node of [way.startNode, way.endNode]) {
      if (!endpointMap.has(node)) endpointMap.set(node, []);
      endpointMap.get(node).push(index);
    }
  });
  const seen = new Set();
  const components = [];
  for (let i = 0; i < ways.length; i += 1) {
    if (seen.has(i)) continue;
    const queue = [i];
    const indexes = [];
    seen.add(i);
    while (queue.length) {
      const current = queue.shift();
      indexes.push(current);
      const way = ways[current];
      for (const node of [way.startNode, way.endNode]) {
        for (const next of endpointMap.get(node) || []) {
          if (!seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
        }
      }
    }
    components.push(indexes.map((index) => ways[index]));
  }
  return components;
}

function longestRoute(component) {
  const adjacency = new Map();
  component.forEach((way, edgeIndex) => {
    for (const [node, other] of [[way.startNode, way.endNode], [way.endNode, way.startNode]]) {
      if (!adjacency.has(node)) adjacency.set(node, []);
      adjacency.get(node).push({ edgeIndex, other });
    }
  });
  const terminals = [...adjacency.entries()].filter(([, edges]) => edges.length === 1).map(([node]) => node);
  const starts = terminals.length ? terminals : [...adjacency.keys()];
  let best = null;
  function dfs(node, usedEdges, route, lengthM) {
    const options = (adjacency.get(node) || []).filter((edge) => !usedEdges.has(edge.edgeIndex));
    if (!options.length) {
      if (!best || lengthM > best.lengthM) best = { route: [...route], lengthM };
      return;
    }
    for (const option of options) {
      const nextUsed = new Set(usedEdges);
      nextUsed.add(option.edgeIndex);
      dfs(option.other, nextUsed, [...route, { edgeIndex: option.edgeIndex, fromNode: node, toNode: option.other }], lengthM + component[option.edgeIndex].lengthM);
    }
  }
  for (const start of starts) dfs(start, new Set(), [], 0);
  if (!best || !best.route.length) throw new Error('Could not order street geometry');
  const points = [];
  const orderedWays = [];
  for (const step of best.route) {
    const way = component[step.edgeIndex];
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
    });
  }
  const selectedIds = new Set(best.route.map((step) => step.edgeIndex));
  return {
    points,
    orderedWays,
    excludedBranchWays: component.filter((_, index) => !selectedIds.has(index)).map((way) => way.id),
    degreeSummary: [...adjacency.values()].reduce((acc, edges) => {
      acc[edges.length] = (acc[edges.length] || 0) + 1;
      return acc;
    }, {}),
  };
}

const bbox = '(59.9000,10.7300,59.9300,10.7800)';
const query = `[out:json][timeout:90];(way["highway"]["name"="Torggata"]${bbox};way["highway"]["name"="Storgata"]${bbox};);out body geom;`;
const endpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter',
];
let overpass = null;
let overpassEndpoint = null;
const endpointErrors = [];
for (const endpoint of endpoints) {
  try {
    const text = await fetchText(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: query }).toString(),
    }, 2);
    overpass = JSON.parse(text);
    overpassEndpoint = endpoint;
    break;
  } catch (error) {
    endpointErrors.push({ endpoint, error: String(error) });
  }
}
if (!overpass) throw new Error(`All Overpass endpoints failed: ${JSON.stringify(endpointErrors)}`);
await fs.writeFile(path.join(reportDir, 'overpass-raw.json'), `${JSON.stringify(overpass, null, 2)}\n`, 'utf8');

const results = [];
for (const config of configs) {
  const place = JSON.parse(await fs.readFile(path.join(root, config.placePath), 'utf8'));
  const identityHtml = await fetchText(config.identityUrl, {}, 2);
  await fs.writeFile(path.join(reportDir, `${config.placeId}-identity.html`), identityHtml, 'utf8');
  const identityConfirmed = config.identityPattern.test(identityHtml);
  const ways = (overpass.elements || [])
    .filter((element) => element.type === 'way' && element.tags?.name === config.name && element.tags?.highway && element.tags?.area !== 'yes')
    .map(normalizeWay)
    .filter(Boolean);
  if (!ways.length) throw new Error(`No usable named OSM ways for ${config.name}`);
  const components = connectedComponents(ways).map((component) => ({
    component,
    totalLengthM: component.reduce((sum, way) => sum + way.lengthM, 0),
  })).sort((a, b) => b.totalLengthM - a.totalLengthM);
  const selectedComponent = components[0];
  const route = longestRoute(selectedComponent.component);
  const midpoint = midpointOnLine(route.points);
  const current = { lat: Number(place.lat), lon: Number(place.lon) };
  const currentNearest = nearestPointOnPolyline(current, route.points);
  const newNearest = nearestPointOnPolyline({ lat: midpoint.lat, lon: midpoint.lon }, route.points);
  const endpointA = route.points[0];
  const endpointB = route.points.at(-1);
  const routeRadius = Math.ceil(Math.max(distanceMeters(midpoint, endpointA), distanceMeters(midpoint, endpointB)) / 10) * 10;
  const result = {
    placeId: config.placeId,
    name: config.name,
    placePath: config.placePath,
    researchOnly: true,
    canonicalChanged: false,
    identity: {
      sourceUrl: config.identityUrl,
      confirmsIdentity: identityConfirmed,
    },
    currentCoordinate: {
      lat: current.lat,
      lon: current.lon,
      r: place.r,
      coordStatus: place.coordStatus,
      coordType: place.coordType,
      distanceToNamedStreetGeometryM: Number(currentNearest.distanceM.toFixed(1)),
      nearestPointOnGeometry: {
        lat: currentNearest.lat,
        lon: currentNearest.lon,
      },
    },
    geometryResearch: {
      provider: 'osm_overpass',
      endpoint: overpassEndpoint,
      exactName: config.name,
      namedWayCount: ways.length,
      connectedComponentCount: components.length,
      selectedComponentWayCount: selectedComponent.component.length,
      selectedRouteWayCount: route.orderedWays.length,
      selectedRouteLengthM: Number(midpoint.totalLengthM.toFixed(1)),
      degreeSummary: route.degreeSummary,
      excludedBranchWays: route.excludedBranchWays,
      routeWays: route.orderedWays,
      routeEndpoints: [endpointA, endpointB],
    },
    decision: {
      canBecomeVerified: identityConfirmed && newNearest.distanceM < 0.1,
      coordinateDecision: 'replace_arithmetic_midpoint_with_length_midpoint_on_named_street_geometry',
      recommendedLat: midpoint.lat,
      recommendedLon: midpoint.lon,
      recommendedRadius: place.r,
      fullRouteHalfExtentRadiusM: routeRadius,
      coordStatus: 'verified_geometry',
      coordType: 'street_geometry_midpoint',
      coordRole: 'line_anchor',
      locatorType: 'street',
      sourceProvider: 'osm',
      sourceObjectId: route.orderedWays[midpoint.segmentIndex < route.orderedWays.length ? midpoint.segmentIndex : 0]?.sourceObjectId || route.orderedWays[0].sourceObjectId,
      pointDistanceToNamedStreetGeometryM: Number(newNearest.distanceM.toFixed(3)),
      displacementFromCurrentM: Number(distanceMeters(current, midpoint).toFixed(1)),
      radiusDecision: 'Preserve existing gameplay radius; store complete ordered street geometry separately.',
    },
  };
  if (!result.decision.canBecomeVerified) throw new Error(`${config.name} failed identity/geometry gate`);
  results.push(result);
}

const summary = {
  version: '2026-07-25',
  researchOnly: true,
  canonicalChanged: false,
  overpassEndpoint,
  endpointErrors,
  candidateCount: results.length,
  verifiableCount: results.filter((item) => item.decision.canBecomeVerified).length,
  places: results,
};
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Torggata and Storgata coordinate research\n\nBoth canonical display markers are replaced only if a deterministic length midpoint is computed directly on the complete named OSM street geometry. Existing gameplay radii are preserved; ordered route ways are retained for production.\n`, 'utf8');
console.log(JSON.stringify(summary, null, 2));
