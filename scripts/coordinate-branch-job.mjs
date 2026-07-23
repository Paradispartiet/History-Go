import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-160-akerselva-bla-brenneriveien-research');
const INPUT_PATH = path.join(REPORT_DIR, 'candidate-summary.json');
const OUTPUT_PATH = path.join(REPORT_DIR, 'crossing-order-followup.json');
const RIVER_WAY_ID = 80915045;
const BLA_NODE_ID = 4312299494;
const VIEWBOX = '10.742,59.928,10.758,59.918';
fs.mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const normalize = (value = '') => String(value).trim().toLocaleLowerCase('nb-NO');
const decodeXml = (value = '') => value.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)].map((match) => [match[1], decodeXml(match[2])]));

async function fetchText(url, accept = 'application/xml,text/xml;q=0.9,*/*;q=0.1') {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: accept },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.text();
}
const fetchJson = async (url) => JSON.parse(await fetchText(url, 'application/json'));

function haversineM(a, b) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
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
  const A = localXY(a, origin);
  const B = localXY(b, origin);
  const C = localXY(c, origin);
  const D = localXY(d, origin);
  const r = { x: B.x - A.x, y: B.y - A.y };
  const s = { x: D.x - C.x, y: D.y - C.y };
  const cross = (u, v) => u.x * v.y - u.y * v.x;
  const denominator = cross(r, s);
  if (Math.abs(denominator) < 1e-9) return null;
  const ca = { x: C.x - A.x, y: C.y - A.y };
  const t = cross(ca, s) / denominator;
  const u = cross(ca, r) / denominator;
  if (t < -1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9) return null;
  return { point: fromLocalXY({ x: A.x + t * r.x, y: A.y + t * r.y }, origin), t };
}
function parseWayFull(xml, wayId) {
  const nodeMap = new Map();
  for (const match of xml.matchAll(/<node\b[^>]*>/g)) {
    const a = attrs(match[0]);
    if (a.id && a.lat && a.lon) nodeMap.set(String(a.id), { id: String(a.id), lat: Number(a.lat), lon: Number(a.lon) });
  }
  const match = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)]
    .find((item) => Number(attrs(`<way ${item[1]}>`).id) === wayId);
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
  const points = nodeRefs.map((ref) => nodeMap.get(ref)).filter(Boolean);
  if (points.length !== nodeRefs.length || points.length < 2) throw new Error(`Kunne ikke rekonstruere way ${wayId}`);
  return { id: wayId, tags, nodeRefs, points };
}
function parseWays(xml) {
  const ways = [];
  for (const match of xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)) {
    const meta = attrs(`<way ${match[1]}>`);
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
    ways.push({ id: Number(meta.id), tags, nodeRefs });
  }
  return ways;
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
  return { id: String(nodeId), lat: Number(meta.lat), lon: Number(meta.lon), tags };
}
function minimumPointLineDistanceM(point, points) {
  let best = Infinity;
  for (let index = 1; index < points.length; index += 1) {
    const origin = points[index - 1];
    const P = localXY(point, origin);
    const A = localXY(points[index - 1], origin);
    const B = localXY(points[index], origin);
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((P.x - A.x) * dx + (P.y - A.y) * dy) / lengthSquared));
    best = Math.min(best, Math.hypot(P.x - (A.x + t * dx), P.y - (A.y + t * dy)));
  }
  return best;
}

const initial = readJson(INPUT_PATH);
const bridgeIds = [...new Set((initial.bridgeCrossings || []).map((crossing) => crossing.bridgeWayId))];
if (!bridgeIds.length) throw new Error('Første batch-160-research inneholder ingen brokandidater');

const riverXml = await fetchText(`https://api.openstreetmap.org/api/0.6/way/${RIVER_WAY_ID}/full`);
const blaXml = await fetchText(`https://api.openstreetmap.org/api/0.6/node/${BLA_NODE_ID}`);
fs.writeFileSync(path.join(REPORT_DIR, `osm-way-${RIVER_WAY_ID}-full.xml`), riverXml);
fs.writeFileSync(path.join(REPORT_DIR, `osm-node-${BLA_NODE_ID}.xml`), blaXml);
const river = parseWayFull(riverXml, RIVER_WAY_ID);
const bla = parseNode(blaXml, BLA_NODE_ID);
if (river.tags.name !== 'Akerselva' || river.tags.waterway !== 'river') throw new Error('Uventet Akerselva-mainway');
if (bla.tags.name !== 'Blå') throw new Error('Uventet Blå-node');

const ingensUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent('Ingens gate, Oslo, Norway')}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${VIEWBOX}&bounded=1`;
const ingensResults = await fetchJson(ingensUrl);
fs.writeFileSync(path.join(REPORT_DIR, 'nominatim-ingens-gate.json'), `${JSON.stringify({ ingensUrl, results: ingensResults }, null, 2)}\n`);
const exactIngensWays = ingensResults.filter((result) => normalize(result.name || result.namedetails?.name) === 'ingens gate' && result.osm_type === 'way');
const ingensWayIds = exactIngensWays.map((result) => Number(result.osm_id));

const cumulativeAtNode = [0];
for (let index = 1; index < river.points.length; index += 1) {
  cumulativeAtNode[index] = cumulativeAtNode[index - 1] + haversineM(river.points[index - 1], river.points[index]);
}

const crossings = [];
for (const bridgeId of bridgeIds) {
  const bridgeXml = await fetchText(`https://api.openstreetmap.org/api/0.6/way/${bridgeId}/full`);
  fs.writeFileSync(path.join(REPORT_DIR, `osm-way-${bridgeId}-full.xml`), bridgeXml);
  const bridge = parseWayFull(bridgeXml, bridgeId);
  let bestIntersection = null;
  for (let riverIndex = 1; riverIndex < river.points.length; riverIndex += 1) {
    for (let bridgeIndex = 1; bridgeIndex < bridge.points.length; bridgeIndex += 1) {
      const intersection = segmentIntersection(river.points[riverIndex - 1], river.points[riverIndex], bridge.points[bridgeIndex - 1], bridge.points[bridgeIndex]);
      if (!intersection) continue;
      const measureM = cumulativeAtNode[riverIndex - 1] + haversineM(river.points[riverIndex - 1], intersection.point);
      const candidate = { point: intersection.point, measureM };
      if (!bestIntersection || candidate.measureM < bestIntersection.measureM) bestIntersection = candidate;
    }
  }
  if (!bestIntersection) continue;

  const endpointContext = [];
  for (const endpointNodeId of [bridge.nodeRefs[0], bridge.nodeRefs.at(-1)]) {
    const xml = await fetchText(`https://api.openstreetmap.org/api/0.6/node/${endpointNodeId}/ways`);
    fs.writeFileSync(path.join(REPORT_DIR, `osm-node-${endpointNodeId}-ways.xml`), xml);
    const connected = parseWays(xml).filter((way) => way.id !== bridgeId);
    endpointContext.push({
      nodeId: endpointNodeId,
      connectedWays: connected.map((way) => ({ id: way.id, name: way.tags.name || null, highway: way.tags.highway || null, tags: way.tags })),
    });
  }
  const connectedWayIds = endpointContext.flatMap((endpoint) => endpoint.connectedWays.map((way) => way.id));
  const connectedNames = endpointContext.flatMap((endpoint) => endpoint.connectedWays.map((way) => normalize(way.name))).filter(Boolean);
  crossings.push({
    bridgeWayId: bridgeId,
    bridgeTags: bridge.tags,
    crossingPoint: bestIntersection.point,
    riverMeasureM: Number(bestIntersection.measureM.toFixed(1)),
    distanceToBlaM: Number(haversineM(bestIntersection.point, bla).toFixed(1)),
    endpointContext,
    connectedWayIds,
    connectedNames,
    connectedToExactIngensWay: ingensWayIds.some((wayId) => connectedWayIds.includes(wayId)),
    connectedToIngensByName: connectedNames.includes('ingens gate'),
    connectedToMollerveien: connectedNames.includes('møllerveien'),
    connectedToNordreGate: connectedNames.includes('nordre gate'),
    connectedToNedreGate: connectedNames.includes('nedre gate'),
    connectedToElvebakken: connectedNames.includes('elvebakken'),
  });
}
crossings.sort((a, b) => a.riverMeasureM - b.riverMeasureM);

const ingensCandidates = crossings.filter((crossing) => crossing.connectedToExactIngensWay || crossing.connectedToIngensByName);
const grunerCandidates = crossings.filter((crossing) => normalize(crossing.bridgeTags.name) === 'nordre gate' || (crossing.connectedToMollerveien && crossing.connectedToNordreGate));
const lowerGangbridgeCandidates = crossings.filter((crossing) => crossing.connectedToNedreGate && crossing.connectedToElvebakken);

const blaBridge = ingensCandidates.length === 1 ? ingensCandidates[0] : null;
const grunerBridge = grunerCandidates.length === 1 ? grunerCandidates[0] : null;
const lowerGangbridge = lowerGangbridgeCandidates.length === 1 ? lowerGangbridgeCandidates[0] : null;
let officialOrderMatches = false;
let bracketStart = null;
let bracketEnd = null;
if (blaBridge && grunerBridge && lowerGangbridge) {
  const ascending = grunerBridge.riverMeasureM < blaBridge.riverMeasureM && blaBridge.riverMeasureM < lowerGangbridge.riverMeasureM;
  const descending = lowerGangbridge.riverMeasureM < blaBridge.riverMeasureM && blaBridge.riverMeasureM < grunerBridge.riverMeasureM;
  officialOrderMatches = ascending || descending;
  if (officialOrderMatches) {
    bracketStart = grunerBridge;
    bracketEnd = lowerGangbridge;
  }
}

const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'elvestrekning_bla_brenneriveien',
  riverWay: { osmId: RIVER_WAY_ID, tags: river.tags, totalLengthM: Number(cumulativeAtNode.at(-1).toFixed(1)) },
  bla: { osmId: BLA_NODE_ID, lat: bla.lat, lon: bla.lon, tags: bla.tags, distanceToRiverM: Number(minimumPointLineDistanceM(bla, river.points).toFixed(1)) },
  exactIngensWayIds: ingensWayIds,
  crossingCount: crossings.length,
  crossings,
  ingensBridgeCandidateCount: ingensCandidates.length,
  ingensBridgeCandidates: ingensCandidates,
  grunerBridgeCandidateCount: grunerCandidates.length,
  grunerBridgeCandidates: grunerCandidates,
  lowerGangbridgeCandidateCount: lowerGangbridgeCandidates.length,
  lowerGangbridgeCandidates,
  blaBridge,
  grunerBridge,
  lowerGangbridge,
  officialOrderMatches,
  bracketStart,
  bracketEnd,
  decisionRule: 'The production segment may be clipped only between uniquely identified Grünerbrua and the uniquely identified Nedre gate–Elvebakken gangbridge, with the uniquely identified Ingens gate/Blå bridge strictly between them in the official crossing order. Blå distance is diagnostic only.',
  nextAction: officialOrderMatches
    ? 'Clip Akerselva way 80915045 between the Grünerbrua and Nedre gate–Elvebakken crossing points, verify the Ingens gate/Blå crossing lies inside the clipped segment, and derive a deterministic subsegment midpoint.'
    : 'Keep the place unresolved; the three official crossing identities/order were not uniquely reproduced.',
};
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  status: 'crossing_followup_complete',
  exactIngensWayIds: ingensWayIds,
  crossingCount: crossings.length,
  ingensBridgeCandidateCount: ingensCandidates.length,
  grunerBridgeCandidateCount: grunerCandidates.length,
  lowerGangbridgeCandidateCount: lowerGangbridgeCandidates.length,
  officialOrderMatches,
  blaBridgeWayId: blaBridge?.bridgeWayId || null,
  grunerBridgeWayId: grunerBridge?.bridgeWayId || null,
  lowerGangbridgeWayId: lowerGangbridge?.bridgeWayId || null,
  report: path.relative(ROOT, OUTPUT_PATH),
}, null, 2));
