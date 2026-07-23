import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-160-akerselva-bla-brenneriveien-research');
const BBOX = [59.918, 10.742, 59.928, 10.758];
const RIVER_WAY_ID = 80915045;
const BLA_NODE_ID = 4312299494;
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchText(url, accept = 'application/xml,text/xml;q=0.9,*/*;q=0.1') {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: accept },
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.text();
}
const fetchJson = async (url) => JSON.parse(await fetchText(url, 'application/json'));
const decodeXml = (v = '') => v.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)].map((m) => [m[1], decodeXml(m[2])]));
const normalize = (v = '') => String(v).trim().toLocaleLowerCase('nb-NO');

function haversineM(a, b) {
  const toRad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon), lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function localXY(point, origin) {
  const lat0 = origin.lat * Math.PI / 180;
  return { x: (point.lon - origin.lon) * 111320 * Math.cos(lat0), y: (point.lat - origin.lat) * 110540 };
}
function fromLocalXY(point, origin) {
  const lat0 = origin.lat * Math.PI / 180;
  return { lat: origin.lat + point.y / 110540, lon: origin.lon + point.x / (111320 * Math.cos(lat0)) };
}
function segmentIntersection(a, b, c, d) {
  const origin = a;
  const A = localXY(a, origin), B = localXY(b, origin), C = localXY(c, origin), D = localXY(d, origin);
  const r = { x: B.x - A.x, y: B.y - A.y };
  const s = { x: D.x - C.x, y: D.y - C.y };
  const cross = (u, v) => u.x * v.y - u.y * v.x;
  const denominator = cross(r, s);
  if (Math.abs(denominator) < 1e-9) return null;
  const CA = { x: C.x - A.x, y: C.y - A.y };
  const t = cross(CA, s) / denominator;
  const u = cross(CA, r) / denominator;
  if (t < -1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9) return null;
  const p = { x: A.x + t * r.x, y: A.y + t * r.y };
  return { point: fromLocalXY(p, origin), t };
}
function parseWayFull(xml, wayId) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b[^>]*>/g)) {
    const a = attrs(match[0]);
    if (a.id && a.lat && a.lon) nodes.set(String(a.id), { id: String(a.id), lat: Number(a.lat), lon: Number(a.lon) });
  }
  const match = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)].find((item) => Number(attrs(`<way ${item[1]}>`).id) === wayId);
  if (!match) throw new Error(`Fant ikke way ${wayId}`);
  const tags = {};
  const nodeRefs = [];
  for (const tagMatch of match[2].matchAll(/<tag\b[^>]*\/>/g)) {
    const a = attrs(tagMatch[0]);
    if (a.k) tags[a.k] = a.v ?? '';
  }
  for (const ndMatch of match[2].matchAll(/<nd\b[^>]*\/>/g)) {
    const a = attrs(ndMatch[0]);
    if (a.ref) nodeRefs.push(String(a.ref));
  }
  return { id: wayId, tags, nodeRefs, points: nodeRefs.map((ref) => nodes.get(ref)).filter(Boolean) };
}
function parseNode(xml, nodeId) {
  const match = [...xml.matchAll(/<node\b([^>]*)>([\s\S]*?)<\/node>|<node\b([^>]*)\/>/g)]
    .find((item) => Number(attrs(`<node ${item[1] || item[3]}>`).id) === nodeId);
  if (!match) throw new Error(`Fant ikke node ${nodeId}`);
  const meta = attrs(`<node ${match[1] || match[3]}>`);
  const tags = {};
  for (const tagMatch of (match[2] || '').matchAll(/<tag\b[^>]*\/>/g)) {
    const a = attrs(tagMatch[0]);
    if (a.k) tags[a.k] = a.v ?? '';
  }
  return { id: nodeId, lat: Number(meta.lat), lon: Number(meta.lon), tags };
}
function parseWaysFromOverpass(raw) {
  return (raw.elements || []).filter((e) => e.type === 'way').map((way) => ({
    id: way.id,
    tags: way.tags || {},
    nodeRefs: (way.nodes || []).map(String),
    points: (way.geometry || []).map((p) => ({ lat: p.lat, lon: p.lon })),
  }));
}
function minPointLineDistanceM(point, points) {
  if (!point || points.length < 2) return null;
  let best = Infinity;
  for (let i = 1; i < points.length; i += 1) {
    const origin = points[i - 1];
    const P = localXY(point, origin), A = localXY(points[i - 1], origin), B = localXY(points[i], origin);
    const dx = B.x - A.x, dy = B.y - A.y, len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((P.x - A.x) * dx + (P.y - A.y) * dy) / len2));
    best = Math.min(best, Math.hypot(P.x - (A.x + t * dx), P.y - (A.y + t * dy)));
  }
  return best;
}

const riverXml = await fetchText(`https://api.openstreetmap.org/api/0.6/way/${RIVER_WAY_ID}/full`);
const blaXml = await fetchText(`https://api.openstreetmap.org/api/0.6/node/${BLA_NODE_ID}`);
fs.writeFileSync(path.join(REPORT_DIR, `osm-way-${RIVER_WAY_ID}-full.xml`), riverXml);
fs.writeFileSync(path.join(REPORT_DIR, `osm-node-${BLA_NODE_ID}.xml`), blaXml);
const river = parseWayFull(riverXml, RIVER_WAY_ID);
const bla = parseNode(blaXml, BLA_NODE_ID);
if (river.tags.name !== 'Akerselva' || river.tags.waterway !== 'river') throw new Error('Uventet Akerselva-mainway');
if (bla.tags.name !== 'Blå') throw new Error('Uventet Blå-node');

const [south, west, north, east] = BBOX;
const query = `[out:json][timeout:45];(\n  way["bridge"](${south},${west},${north},${east});\n  way["name"="Ingens gate"](${south},${west},${north},${east});\n  way["name"="Møllerveien"](${south},${west},${north},${east});\n  way["name"="Nordre gate"](${south},${west},${north},${east});\n  way["name"="Nedre gate"](${south},${west},${north},${east});\n  way["name"="Elvebakken"](${south},${west},${north},${east});\n);out body geom;`;
const overpassUrls = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let raw = null;
let usedUrl = null;
const errors = [];
for (const endpoint of overpassUrls) {
  try {
    const url = `${endpoint}?data=${encodeURIComponent(query)}`;
    raw = await fetchJson(url);
    usedUrl = url;
    break;
  } catch (error) {
    errors.push(String(error));
  }
}
if (!raw) throw new Error(`Overpass feilet: ${errors.join(' | ')}`);
fs.writeFileSync(path.join(REPORT_DIR, 'overpass-crossing-topology.json'), `${JSON.stringify({ query, usedUrl, errors, raw }, null, 2)}\n`);
const ways = parseWaysFromOverpass(raw);
const bridges = ways.filter((w) => Boolean(w.tags.bridge));
const namedRoads = ways.filter((w) => !w.tags.bridge && ['ingens gate', 'møllerveien', 'nordre gate', 'nedre gate', 'elvebakken'].includes(normalize(w.tags.name)));

const cumulativeAtNode = [0];
for (let i = 1; i < river.points.length; i += 1) cumulativeAtNode[i] = cumulativeAtNode[i - 1] + haversineM(river.points[i - 1], river.points[i]);
const crossings = [];
for (const bridge of bridges) {
  let best = null;
  for (let i = 1; i < river.points.length; i += 1) {
    for (let j = 1; j < bridge.points.length; j += 1) {
      const intersection = segmentIntersection(river.points[i - 1], river.points[i], bridge.points[j - 1], bridge.points[j]);
      if (!intersection) continue;
      const measureM = cumulativeAtNode[i - 1] + haversineM(river.points[i - 1], intersection.point);
      const candidate = { point: intersection.point, measureM, riverSegmentIndex: i - 1, bridgeSegmentIndex: j - 1 };
      if (!best || candidate.measureM < best.measureM) best = candidate;
    }
  }
  if (best) {
    const endpointRoadLinks = [];
    for (const road of namedRoads) {
      const roadNodeSet = new Set(road.nodeRefs);
      const shared = [bridge.nodeRefs[0], bridge.nodeRefs.at(-1)].filter((nodeId) => roadNodeSet.has(nodeId));
      if (shared.length) endpointRoadLinks.push({ roadWayId: road.id, roadName: road.tags.name, sharedNodeIds: shared });
    }
    crossings.push({
      bridgeWayId: bridge.id,
      bridgeTags: bridge.tags,
      crossingPoint: best.point,
      riverMeasureM: Number(best.measureM.toFixed(1)),
      distanceToBlaM: Number(haversineM(best.point, bla).toFixed(1)),
      endpointRoadLinks,
    });
  }
}
crossings.sort((a, b) => a.riverMeasureM - b.riverMeasureM);

const ingensBridgeCandidates = crossings.filter((crossing) =>
  crossing.endpointRoadLinks.some((link) => normalize(link.roadName) === 'ingens gate')
);
const grunerBridgeCandidates = crossings.filter((crossing) =>
  normalize(crossing.bridgeTags.name) === 'nordre gate' ||
  crossing.endpointRoadLinks.some((link) => ['møllerveien', 'nordre gate'].includes(normalize(link.roadName)))
);
const blaBridge = ingensBridgeCandidates.length === 1 ? ingensBridgeCandidates[0] : null;
const blaIndex = blaBridge ? crossings.findIndex((crossing) => crossing.bridgeWayId === blaBridge.bridgeWayId) : -1;
const previousCrossing = blaIndex > 0 ? crossings[blaIndex - 1] : null;
const nextCrossing = blaIndex >= 0 && blaIndex < crossings.length - 1 ? crossings[blaIndex + 1] : null;

const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'elvestrekning_bla_brenneriveien',
  riverWay: { osmId: RIVER_WAY_ID, tags: river.tags, nodeCount: river.nodeRefs.length, totalLengthM: Number(cumulativeAtNode.at(-1).toFixed(1)) },
  bla: { osmId: BLA_NODE_ID, lat: bla.lat, lon: bla.lon, tags: bla.tags, distanceToRiverM: Number(minPointLineDistanceM(bla, river.points).toFixed(1)) },
  crossingCount: crossings.length,
  crossings,
  ingensBridgeCandidateCount: ingensBridgeCandidates.length,
  ingensBridgeCandidates,
  grunerBridgeCandidateCount: grunerBridgeCandidates.length,
  grunerBridgeCandidates,
  blaBridge,
  immediatePreviousCrossing: previousCrossing,
  immediateNextCrossing: nextCrossing,
  officialCrossingOrderContext: ['Grünerbrua', 'Gangbro Brenneriveien–Nedre gate v/Blå', 'Gangbro Nedre gate–Elvebakken'],
  decisionRule: 'Production may define the local Blå river segment only from explicit crossing order: identify the Ingens gate/Blå bridge topologically, then use its immediate upstream and downstream river crossings as local brackets. Distance to Blå is crosscheck only.',
  nextAction: blaBridge && previousCrossing && nextCrossing
    ? 'Crosscheck that immediate crossing order matches official bridge order, then clip Akerselva way 80915045 between the adjacent crossing points around the Blå bridge and derive a deterministic midpoint.'
    : 'Do not produce the canonical segment; crossing topology is not unique enough.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'crossing-order-followup.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  status: 'crossing_followup_complete',
  crossingCount: crossings.length,
  ingensBridgeCandidateCount: ingensBridgeCandidates.length,
  blaBridgeWayId: blaBridge?.bridgeWayId || null,
  previousBridgeWayId: previousCrossing?.bridgeWayId || null,
  nextBridgeWayId: nextCrossing?.bridgeWayId || null,
  report: path.relative(ROOT, path.join(REPORT_DIR, 'crossing-order-followup.json')),
}, null, 2));
