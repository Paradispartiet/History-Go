import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-153-bolerbekken-mouth-research');
const BBOX = [59.878, 10.824, 59.886, 10.840];
const BRIDGE_REFERENCE = { lat: 59.8813167, lon: 10.8320833 };
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchJson(url, timeoutMs = 45000) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}
function haversineM(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon), lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const [south, west, north, east] = BBOX;
const query = `[out:json][timeout:30];(way["name"="Bølerbekken"](${south},${west},${north},${east});nwr["name"="Østensjøvannet"]["natural"="water"](${south},${west},${north},${east}););out body geom;`;
const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let raw = null;
let usedUrl = null;
let errors = [];
for (const endpoint of endpoints) {
  try {
    const url = `${endpoint}?data=${encodeURIComponent(query)}`;
    raw = await fetchJson(url);
    usedUrl = url;
    break;
  } catch (error) {
    errors.push(String(error));
  }
}
if (!raw) throw new Error(`Alle Overpass-endepunkter feilet: ${errors.join(' | ')}`);
fs.writeFileSync(path.join(REPORT_DIR, 'overpass-bolerbekken-mouth.json'), `${JSON.stringify({ query, usedUrl, errors, raw }, null, 2)}\n`);

const elements = raw.elements || [];
const streamWays = elements.filter((e) => e.type === 'way' && e.tags?.name === 'Bølerbekken');
const lakeObjects = elements.filter((e) => e.tags?.name === 'Østensjøvannet' && e.tags?.natural === 'water');
const streamSummaries = streamWays.map((way) => {
  const geometry = way.geometry || [];
  const first = geometry[0] || null;
  const last = geometry.at(-1) || null;
  return {
    osmId: way.id,
    tags: way.tags || {},
    nodeCount: Array.isArray(way.nodes) ? way.nodes.length : null,
    firstNodeId: way.nodes?.[0] ?? null,
    lastNodeId: way.nodes?.at(-1) ?? null,
    first,
    last,
    firstDistanceToBridgeRefM: first ? Number(haversineM(first, BRIDGE_REFERENCE).toFixed(1)) : null,
    lastDistanceToBridgeRefM: last ? Number(haversineM(last, BRIDGE_REFERENCE).toFixed(1)) : null,
  };
});

const lakeNodeIds = new Set();
for (const object of lakeObjects) {
  for (const nodeId of object.nodes || []) lakeNodeIds.add(nodeId);
  for (const member of object.members || []) {
    if (member.type === 'node') lakeNodeIds.add(member.ref);
  }
}
const topology = [];
for (const way of streamWays) {
  const endpointsToCheck = [
    { role: 'first', nodeId: way.nodes?.[0], point: way.geometry?.[0] },
    { role: 'last', nodeId: way.nodes?.at(-1), point: way.geometry?.at(-1) },
  ];
  for (const endpoint of endpointsToCheck) {
    topology.push({
      streamWayId: way.id,
      endpointRole: endpoint.role,
      nodeId: endpoint.nodeId ?? null,
      point: endpoint.point ?? null,
      sharedDirectlyWithReturnedLakeGeometry: endpoint.nodeId ? lakeNodeIds.has(endpoint.nodeId) : false,
      distanceToPublishedSouthBridgeReferenceM: endpoint.point ? Number(haversineM(endpoint.point, BRIDGE_REFERENCE).toFixed(1)) : null,
    });
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'ostensjovannet_sor',
  proposedResolvedIdentity: 'Bølerbekkens utløp i Østensjøvannet',
  bbox: BBOX,
  publishedSouthBridgeReference: BRIDGE_REFERENCE,
  streamWayCount: streamWays.length,
  lakeObjectCount: lakeObjects.length,
  streamWays: streamSummaries,
  lakeObjects: lakeObjects.map((object) => ({ osmType: object.type, osmId: object.id, tags: object.tags || {}, nodeCount: object.nodes?.length ?? null, geometryPointCount: object.geometry?.length ?? null })),
  endpointTopology: topology,
  independentContext: {
    finding: 'Østensjøvannets Venner documents Bølerbekken as a major tributary that flows into Østensjøvannet and identifies the south end as a bird-rich observation area. A separate published GPS reference identifies the bridge in the south end and is used only as a local scope crosscheck.',
    legacyCoordinateUsedForSelection: false,
  },
  nextAction: streamWays.length > 0
    ? 'Inspect exact Bølerbekken endpoint topology against the lake/shoreline and connected ways before any canonical production update.'
    : 'Keep the synthetic south-zone record unresolved; no exact named Bølerbekken geometry was found in the bounded south-end scope.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 153 research sources\n\n- Østensjøvannets Venner documents Bølerbekken as a major tributary and states that it flows into Østensjøvannet after passing the bridge at Valborgs vei.\n- The local visitor guide recommends the south end and Bølerbekken outlet for bird observation, and publishes a GPS reference for the south-end bridge.\n- The GPS reference is only a scope crosscheck; the research audits exact named OSM Bølerbekken geometry and endpoint topology.\n- The legacy History Go south-zone coordinate is not used.\n`);
console.log(JSON.stringify({ status: 'research_complete', streamWayCount: streamWays.length, lakeObjectCount: lakeObjects.length, report: path.relative(ROOT, path.join(REPORT_DIR, 'candidate-summary.json')) }, null, 2));
