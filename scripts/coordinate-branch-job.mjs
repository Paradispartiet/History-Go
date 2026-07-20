import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const AGGREGATE = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json';
const CHILD = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening/korketrekkeren.json';
const SPLIT_INDEX = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening_index.json';
const SPLIT_MANIFEST = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening_manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-93';
const PLACE_ID = 'korketrekkeren';
const RELATION_ID = 1459739;
const RELATION_API = `https://api.openstreetmap.org/api/0.6/relation/${RELATION_ID}/full.json`;
const RELATION_PAGE = `https://www.openstreetmap.org/relation/${RELATION_ID}`;
const FROG_NODE_ID = 25703752;
const MIDT_NODE_ID = 1347436489;
const OFFICIAL_URL = 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/korketrekkeren';
const DATE = '2026-07-21';

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}
function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(full(file))).digest('hex');
}
function normalize(value) {
  return String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
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
function wayLength(way, nodes) {
  let total = 0;
  for (let i = 1; i < way.nodes.length; i += 1) {
    const a = nodes.get(way.nodes[i - 1]);
    const b = nodes.get(way.nodes[i]);
    if (!a || !b) throw new Error(`Missing node geometry in relation member way ${way.id}`);
    total += haversineMeters(a, b);
  }
  return total;
}
async function fetchOsmJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'History-Go-coordinate-audit/1.0'
    }
  });
  if (!response.ok) throw new Error(`OSM API request failed for ${url}: ${response.status} ${response.statusText}`);
  return response.json();
}

const aggregate = readJson(AGGREGATE);
const aggregatePlace = aggregate.find((row) => row?.id === PLACE_ID);
const childPlace = readJson(CHILD);
if (!aggregatePlace || childPlace?.id !== PLACE_ID) throw new Error('Korketrekkeren aggregate/child record missing');
if (aggregatePlace.lat !== childPlace.lat || aggregatePlace.lon !== childPlace.lon || aggregatePlace.coordStatus !== childPlace.coordStatus) {
  throw new Error('Korketrekkeren aggregate and child are not synchronized before relation audit');
}
const previous = {
  lat: childPlace.lat,
  lon: childPlace.lon,
  coordStatus: childPlace.coordStatus || '',
  coordType: childPlace.coordType || '',
  coordSource: childPlace.coordSource || '',
  coordSourceId: childPlace.coordSourceId || '',
  sourceProvider: childPlace.sourceProvider || '',
  sourceObjectId: childPlace.sourceObjectId || ''
};

console.log(`[Batch 93 relation pass] Fetching OSM route relation ${RELATION_ID}`);
const relationFull = await fetchOsmJson(RELATION_API);
writeJson(`${REPORT_DIR}/osm/korketrekkeren-relation-${RELATION_ID}-full.json`, relationFull);

const elements = Array.isArray(relationFull?.elements) ? relationFull.elements : [];
const relation = elements.find((element) => element?.type === 'relation' && element?.id === RELATION_ID);
if (!relation) throw new Error(`Relation ${RELATION_ID} missing from full API response`);
const tags = relation.tags || {};
if (normalize(tags.name) !== 'korketrekkeren') throw new Error(`Relation ${RELATION_ID} is not explicitly named Korketrekkeren`);
if (tags.type !== 'route' || tags.route !== 'sled' || tags['piste:type'] !== 'sled') {
  throw new Error(`Relation ${RELATION_ID} does not have the required route=sled/type=route/piste:type=sled identity`);
}

const nodeMap = new Map(
  elements
    .filter((element) => element?.type === 'node' && Number.isFinite(element.lat) && Number.isFinite(element.lon))
    .map((node) => [node.id, { lat: node.lat, lon: node.lon }])
);
const wayMap = new Map(elements.filter((element) => element?.type === 'way').map((way) => [way.id, way]));
const memberRefs = (relation.members || []).filter((member) => member?.type === 'way').map((member) => member.ref);
const uniqueMemberRefs = [...new Set(memberRefs)];
if (uniqueMemberRefs.length < 2) throw new Error(`Relation ${RELATION_ID} has too few member ways`);
const memberWays = uniqueMemberRefs.map((ref) => {
  const way = wayMap.get(ref);
  if (!way || !Array.isArray(way.nodes) || way.nodes.length < 2) throw new Error(`Missing or invalid member way ${ref}`);
  return way;
});

const endpointToWays = new Map();
for (const way of memberWays) {
  for (const nodeId of [way.nodes[0], way.nodes[way.nodes.length - 1]]) {
    if (!endpointToWays.has(nodeId)) endpointToWays.set(nodeId, []);
    endpointToWays.get(nodeId).push(way.id);
  }
}

const visited = new Set();
const stack = [memberWays[0].id];
while (stack.length) {
  const wayId = stack.pop();
  if (visited.has(wayId)) continue;
  visited.add(wayId);
  const way = wayMap.get(wayId);
  for (const nodeId of [way.nodes[0], way.nodes[way.nodes.length - 1]]) {
    for (const neighbor of endpointToWays.get(nodeId) || []) if (!visited.has(neighbor)) stack.push(neighbor);
  }
}
if (visited.size !== memberWays.length) {
  throw new Error(`Relation ${RELATION_ID} member ways are not one connected route graph (${visited.size}/${memberWays.length} connected)`);
}

const routeEndpointIds = [...endpointToWays.entries()].filter(([, ways]) => ways.length === 1).map(([nodeId]) => nodeId);
if (routeEndpointIds.length !== 2) {
  throw new Error(`Relation ${RELATION_ID} must have exactly two graph endpoints, found ${routeEndpointIds.length}`);
}
const routeEndpoints = routeEndpointIds.map((nodeId) => {
  const point = nodeMap.get(nodeId);
  if (!point) throw new Error(`Missing endpoint node ${nodeId} in relation full response`);
  return { nodeId, point };
});

const totalLengthMeters = memberWays.reduce((sum, way) => sum + wayLength(way, nodeMap), 0);
if (totalLengthMeters < 2000 || totalLengthMeters > 3500) {
  throw new Error(`Full relation geometry length ${totalLengthMeters.toFixed(1)} m is outside the 2.0–3.5 km plausibility range`);
}

const [frogJson, midtJson] = await Promise.all([
  fetchOsmJson(`https://api.openstreetmap.org/api/0.6/node/${FROG_NODE_ID}.json`),
  fetchOsmJson(`https://api.openstreetmap.org/api/0.6/node/${MIDT_NODE_ID}.json`)
]);
writeJson(`${REPORT_DIR}/osm/frognerseteren-node-${FROG_NODE_ID}.json`, frogJson);
writeJson(`${REPORT_DIR}/osm/midtstuen-node-${MIDT_NODE_ID}.json`, midtJson);
const frogNode = frogJson.elements?.find((element) => element?.type === 'node' && element?.id === FROG_NODE_ID);
const midtNode = midtJson.elements?.find((element) => element?.type === 'node' && element?.id === MIDT_NODE_ID);
if (!frogNode || normalize(frogNode.tags?.name) !== 'frognerseteren') throw new Error('Frognerseteren reference node identity check failed');
if (!midtNode || normalize(midtNode.tags?.name) !== 'midtstuen') throw new Error('Midtstuen reference node identity check failed');
const frogPoint = { lat: frogNode.lat, lon: frogNode.lon };
const midtPoint = { lat: midtNode.lat, lon: midtNode.lon };

const pairingA = haversineMeters(routeEndpoints[0].point, frogPoint) + haversineMeters(routeEndpoints[1].point, midtPoint);
const pairingB = haversineMeters(routeEndpoints[1].point, frogPoint) + haversineMeters(routeEndpoints[0].point, midtPoint);
const start = pairingA <= pairingB ? routeEndpoints[0] : routeEndpoints[1];
const finish = pairingA <= pairingB ? routeEndpoints[1] : routeEndpoints[0];
const startToFrogMeters = haversineMeters(start.point, frogPoint);
const finishToMidtMeters = haversineMeters(finish.point, midtPoint);
if (startToFrogMeters > 1000) throw new Error(`Frognerseteren-side route endpoint is ${startToFrogMeters.toFixed(1)} m from Frognerseteren station`);
if (finishToMidtMeters > 1000) throw new Error(`Midtstuen-side route endpoint is ${finishToMidtMeters.toFixed(1)} m from Midtstuen station`);
const legacyPointDistanceMeters = haversineMeters({ lat: childPlace.lat, lon: childPlace.lon }, start.point);
if (legacyPointDistanceMeters > 750) throw new Error(`Relation start is ${legacyPointDistanceMeters.toFixed(1)} m from the legacy display point; manual review required`);

function applyVerified(target) {
  target.lat = start.point.lat;
  target.lon = start.point.lon;
  target.locatorType = 'route_start';
  target.sourceProvider = 'osm';
  target.sourceObjectId = `osm-relation:${RELATION_ID}`;
  target.geocodeAccuracy = 'exact_geometry';
  target.coordRole = 'route_start';
  target.coordType = 'route_start';
  target.coordStatus = 'verified_geometry';
  target.coordSource = `OpenStreetMap route relation ${RELATION_ID} + Oslo kommune route identity`;
  target.coordSourceId = `osm-relation:${RELATION_ID}`;
  target.coordSourceUrl = RELATION_PAGE;
  target.coordVerifiedAt = DATE;
  target.coordNote = `Startendepunkt fra OSM-ruterelasjon ${RELATION_ID}, eksplisitt navngitt Korketrekkeren og tagget route=sled/piste:type=sled. Relasjonens ${memberWays.length} unike medlems-way-er danner én sammenhengende trase på ${totalLengthMeters.toFixed(0)} meter med to endepunkter; startenden ligger ${startToFrogMeters.toFixed(0)} meter fra Frognerseteren stasjon og motsatt ende ${finishToMidtMeters.toFixed(0)} meter fra Midtstuen stasjon. Oslo kommune dokumenterer traseen Frognerseteren–Midtstuen. Trailforks er fjernet som primær koordinatkilde.`;
  delete target.coordPrecisionM;
}
applyVerified(aggregatePlace);
applyVerified(childPlace);
writeJson(AGGREGATE, aggregate);
writeJson(CHILD, childPlace);

const splitIndex = readJson(SPLIT_INDEX);
const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error('Korketrekkeren missing from split index');
indexRow.lat = childPlace.lat;
indexRow.lon = childPlace.lon;
indexRow.r = childPlace.r;
indexRow.coordStatus = childPlace.coordStatus;
indexRow.coordType = childPlace.coordType;
writeJson(SPLIT_INDEX, splitIndex);

const manifest = readJson(SPLIT_MANIFEST);
const manifestRow = manifest.places?.find((row) => row?.id === PLACE_ID);
if (!manifestRow) throw new Error('Korketrekkeren missing from split manifest');
manifestRow.sha256 = sha256(CHILD);
manifest.source_sha256 = sha256(AGGREGATE);
manifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, manifest);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
let lines = protocol.split('\n');
const verifiedHeader = '| batch | placeId | navn | godkjent status | kildeobjekt |';
const verifiedHeaderIndex = lines.indexOf(verifiedHeader);
if (verifiedHeaderIndex < 0) throw new Error('Oslo verified protocol table missing');
let verifiedEnd = verifiedHeaderIndex + 2;
while (verifiedEnd < lines.length && lines[verifiedEnd].startsWith('| ')) verifiedEnd += 1;
if (!lines.slice(verifiedHeaderIndex + 2, verifiedEnd).some((line) => line.includes('`korketrekkeren`'))) {
  lines.splice(verifiedEnd, 0, `| 93 | \`korketrekkeren\` | Korketrekkeren | verified_geometry | \`osm-relation:${RELATION_ID}\` |`);
}
lines = lines.filter((line) => !(line.startsWith('| `korketrekkeren`') && line.includes('needs_source')));
lines = lines.filter((line) => !line.startsWith('Batch 93 (2026-07-21) reviderer `korketrekkeren`'));
protocol = lines.join('\n').replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${DATE}`);

const protocolLines = protocol.split('\n');
const h = protocolLines.indexOf(verifiedHeader);
let e = h + 2;
while (e < protocolLines.length && protocolLines[e].startsWith('| ')) e += 1;
const verifiedCount = e - (h + 2);
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 93 erstatter Trailforks som primær koordinatkilde for \`korketrekkeren\` med den komplette navngitte OSM-ruterelasjonen \`osm-relation:${RELATION_ID}\`, kontrollert mot Oslo kommunes dokumentasjon av traseen Frognerseteren–Midtstuen. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`
);
const note = `Batch 93 (${DATE}) reviderer \`korketrekkeren\` som lineær akebakke/rute, ikke som adressepunkt. Den første eksakt-navn-passeringen fant bare 1474 meter med individuelt navngitte way-segmenter og ble derfor ikke merget som endelig avgjørelse. Den fullstendige kontrollen bruker OSM-ruterelasjon ${RELATION_ID}, som selv er eksplisitt navngitt Korketrekkeren og tagget \`type=route\`, \`route=sled\` og \`piste:type=sled\`. Relasjonens ${memberWays.length} unike medlems-way-er danner én sammenhengende trase på ${totalLengthMeters.toFixed(0)} meter med nøyaktig to endepunkter. Frognerseteren-siden brukes som \`route_start\`; endepunktene ligger henholdsvis ${startToFrogMeters.toFixed(0)} meter fra Frognerseteren stasjon og ${finishToMidtMeters.toFixed(0)} meter fra Midtstuen stasjon. Oslo kommune dokumenterer samme traseidentitet. Trailforks er fjernet som primær koordinatkilde.`;
const anchor = '\nRelevante korrigerende merger';
const noteIndex = protocol.indexOf(anchor);
if (noteIndex < 0) throw new Error('Protocol notes anchor missing');
protocol = `${protocol.slice(0, noteIndex)}\n\n${note}${protocol.slice(noteIndex)}`;
fs.writeFileSync(full(PROTOCOL), protocol);

writeJson(`${REPORT_DIR}/summary.json`, {
  date: DATE,
  batch: 93,
  placeId: PLACE_ID,
  outcome: 'verified_geometry',
  method: 'object-type-first + full exact OSM route relation geometry + official municipality route identity',
  officialIdentitySource: OFFICIAL_URL,
  relation: {
    id: RELATION_ID,
    apiUrl: RELATION_API,
    pageUrl: RELATION_PAGE,
    tags,
    memberWayRefs: memberRefs,
    uniqueMemberWayIds: uniqueMemberRefs,
    memberWayCount: memberWays.length,
    totalLengthMeters: Number(totalLengthMeters.toFixed(1)),
    graphEndpointCount: routeEndpointIds.length,
    start,
    finish
  },
  endpointCrosscheck: {
    frognerseterenReferenceNode: FROG_NODE_ID,
    midtstuenReferenceNode: MIDT_NODE_ID,
    startToFrognerseterenMeters: Number(startToFrogMeters.toFixed(1)),
    finishToMidtstuenMeters: Number(finishToMidtMeters.toFixed(1)),
    legacyPointToVerifiedStartMeters: Number(legacyPointDistanceMeters.toFixed(1))
  },
  previous,
  current: {
    lat: childPlace.lat,
    lon: childPlace.lon,
    coordStatus: childPlace.coordStatus,
    coordType: childPlace.coordType,
    coordSource: childPlace.coordSource,
    coordSourceId: childPlace.coordSourceId,
    sourceProvider: childPlace.sourceProvider,
    sourceObjectId: childPlace.sourceObjectId,
    geocodeAccuracy: childPlace.geocodeAccuracy,
    coordRole: childPlace.coordRole
  },
  protocolVerifiedCountAfterBatch: verifiedCount
});
fs.writeFileSync(
  full(`${REPORT_DIR}/README.md`),
  `# Oslo coordinate control batch 93\n\n` +
  `- Object type: linear sledding route; no address shortcut.\n` +
  `- Official identity: Oslo kommune documents Korketrekkeren from Frognerseteren to Midtstuen.\n` +
  `- Primary geometry: OSM route relation ${RELATION_ID}, explicitly tagged as the Korketrekkeren sled route.\n` +
  `- Relation member graph: ${memberWays.length} unique ways, one connected component, two endpoints, ${totalLengthMeters.toFixed(0)} m total geometry.\n` +
  `- Verified display/start anchor: relation endpoint on the Frognerseteren side.\n` +
  `- Endpoint QA: ${startToFrogMeters.toFixed(0)} m to Frognerseteren station; ${finishToMidtMeters.toFixed(0)} m to Midtstuen station.\n` +
  `- Trailforks removed as primary coordinate source.\n`
);

console.log(JSON.stringify({
  ok: true,
  batch: 93,
  outcome: 'verified_geometry',
  relationId: RELATION_ID,
  memberWayCount: memberWays.length,
  totalLengthMeters: Number(totalLengthMeters.toFixed(1)),
  start,
  finish,
  startToFrognerseterenMeters: Number(startToFrogMeters.toFixed(1)),
  finishToMidtstuenMeters: Number(finishToMidtMeters.toFixed(1)),
  verifiedCount
}, null, 2));
