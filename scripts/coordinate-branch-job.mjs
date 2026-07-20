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
const OFFICIAL_URL = 'https://www.oslo.kommune.no/natur-kultur-og-fritid/idrett/idrettsanlegg/korketrekkeren';
const DATE = '2026-07-21';
const PLACE_ID = 'korketrekkeren';

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
function polylineLength(geometry) {
  let total = 0;
  for (let i = 1; i < geometry.length; i += 1) total += haversineMeters(geometry[i - 1], geometry[i]);
  return total;
}
function elementPoint(element) {
  if (Number.isFinite(element?.lat) && Number.isFinite(element?.lon)) return { lat: element.lat, lon: element.lon };
  if (Number.isFinite(element?.center?.lat) && Number.isFinite(element?.center?.lon)) return element.center;
  if (Array.isArray(element?.geometry) && element.geometry.length) {
    const points = element.geometry.filter((p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lon));
    if (!points.length) return null;
    return {
      lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
      lon: points.reduce((sum, p) => sum + p.lon, 0) / points.length
    };
  }
  return null;
}
function nearestDistance(point, candidates) {
  return Math.min(...candidates.map((candidate) => haversineMeters(point, candidate.point)));
}

const aggregate = readJson(AGGREGATE);
const aggregatePlace = aggregate.find((row) => row?.id === PLACE_ID);
const childPlace = readJson(CHILD);
if (!aggregatePlace || childPlace?.id !== PLACE_ID) throw new Error('Korketrekkeren aggregate/child record missing');
if (aggregatePlace.coordStatus !== childPlace.coordStatus || aggregatePlace.lat !== childPlace.lat || aggregatePlace.lon !== childPlace.lon) {
  throw new Error('Korketrekkeren aggregate and child are not synchronized before batch 93');
}
const previous = {
  lat: childPlace.lat,
  lon: childPlace.lon,
  coordStatus: childPlace.coordStatus || '',
  coordSource: childPlace.coordSource || '',
  coordSourceId: childPlace.coordSourceId || '',
  coordSourceUrl: childPlace.coordSourceUrl || ''
};

const overpassQuery = `[out:json][timeout:30];\n(\n  way["name"="Korketrekkeren"](around:6000,59.97722,10.67878);\n  relation["name"="Korketrekkeren"](around:6000,59.97722,10.67878);\n  nwr["name"="Frognerseteren"](around:6000,59.97722,10.67878);\n  nwr["name"="Midtstuen"](around:6000,59.97722,10.67878);\n);\nout body geom;`;
const endpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];
let overpass = null;
let overpassEndpoint = null;
let lastError = null;
for (const endpoint of endpoints) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Accept: 'application/json',
        'User-Agent': 'History-Go-coordinate-audit/1.0'
      },
      body: new URLSearchParams({ data: overpassQuery })
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    overpass = await response.json();
    overpassEndpoint = endpoint;
    break;
  } catch (error) {
    lastError = error;
  }
}
if (!overpass) throw new Error(`Overpass query failed on all endpoints: ${lastError}`);
writeJson(`${REPORT_DIR}/osm/korketrekkeren-overpass.json`, overpass);

const elements = Array.isArray(overpass?.elements) ? overpass.elements : [];
const exactWays = elements.filter((element) => element?.type === 'way' && normalize(element?.tags?.name) === 'korketrekkeren' && Array.isArray(element.geometry) && element.geometry.length >= 2);
const exactRelations = elements.filter((element) => element?.type === 'relation' && normalize(element?.tags?.name) === 'korketrekkeren');
const transit = elements
  .filter((element) => {
    const name = normalize(element?.tags?.name);
    const transitTagged = Boolean(element?.tags?.railway || element?.tags?.public_transport);
    return transitTagged && (name === 'frognerseteren' || name === 'midtstuen');
  })
  .map((element) => ({ id: `${element.type}:${element.id}`, name: normalize(element.tags.name), point: elementPoint(element), tags: element.tags }))
  .filter((element) => element.point);
const frogTransit = transit.filter((element) => element.name === 'frognerseteren');
const midtTransit = transit.filter((element) => element.name === 'midtstuen');

const auditProblems = [];
let verification = null;
if (!exactWays.length) auditProblems.push('No exact named OSM way geometry for Korketrekkeren was returned');
if (!frogTransit.length) auditProblems.push('No OSM transit object named Frognerseteren was returned');
if (!midtTransit.length) auditProblems.push('No OSM transit object named Midtstuen was returned');

if (!auditProblems.length) {
  const wayById = new Map(exactWays.map((way) => [way.id, way]));
  const endpointToWays = new Map();
  const endpointPoint = new Map();
  for (const way of exactWays) {
    if (!Array.isArray(way.nodes) || way.nodes.length !== way.geometry.length) {
      auditProblems.push(`OSM way ${way.id} lacks node/geometry parity`);
      continue;
    }
    const pairs = [
      [way.nodes[0], way.geometry[0]],
      [way.nodes[way.nodes.length - 1], way.geometry[way.geometry.length - 1]]
    ];
    for (const [nodeId, point] of pairs) {
      if (!endpointToWays.has(nodeId)) endpointToWays.set(nodeId, []);
      endpointToWays.get(nodeId).push(way.id);
      endpointPoint.set(nodeId, point);
    }
  }

  if (!auditProblems.length) {
    const wayIds = [...wayById.keys()];
    const visited = new Set();
    const stack = wayIds.length ? [wayIds[0]] : [];
    while (stack.length) {
      const wayId = stack.pop();
      if (visited.has(wayId)) continue;
      visited.add(wayId);
      const way = wayById.get(wayId);
      for (const nodeId of [way.nodes[0], way.nodes[way.nodes.length - 1]]) {
        for (const neighbor of endpointToWays.get(nodeId) || []) if (!visited.has(neighbor)) stack.push(neighbor);
      }
    }
    if (visited.size !== wayIds.length) auditProblems.push(`Exact named OSM ways form ${wayIds.length - visited.size + 1} disconnected components`);

    const routeEndpointIds = [...endpointToWays.entries()].filter(([, ids]) => ids.length === 1).map(([nodeId]) => nodeId);
    if (routeEndpointIds.length !== 2) auditProblems.push(`Expected two route-network endpoints, found ${routeEndpointIds.length}`);

    const totalLengthMeters = exactWays.reduce((sum, way) => sum + polylineLength(way.geometry), 0);
    if (totalLengthMeters < 1800 || totalLengthMeters > 3400) auditProblems.push(`Exact named geometry length ${totalLengthMeters.toFixed(1)} m is outside the 1.8–3.4 km plausibility range`);

    if (!auditProblems.length) {
      const endpointA = { nodeId: routeEndpointIds[0], point: endpointPoint.get(routeEndpointIds[0]) };
      const endpointB = { nodeId: routeEndpointIds[1], point: endpointPoint.get(routeEndpointIds[1]) };
      const pairing1 = nearestDistance(endpointA.point, frogTransit) + nearestDistance(endpointB.point, midtTransit);
      const pairing2 = nearestDistance(endpointB.point, frogTransit) + nearestDistance(endpointA.point, midtTransit);
      const start = pairing1 <= pairing2 ? endpointA : endpointB;
      const finish = pairing1 <= pairing2 ? endpointB : endpointA;
      const startToFrog = nearestDistance(start.point, frogTransit);
      const finishToMidt = nearestDistance(finish.point, midtTransit);
      if (startToFrog > 1000) auditProblems.push(`Route endpoint is ${startToFrog.toFixed(1)} m from Frognerseteren transit objects`);
      if (finishToMidt > 1000) auditProblems.push(`Opposite route endpoint is ${finishToMidt.toFixed(1)} m from Midtstuen transit objects`);
      if (!auditProblems.length) {
        const startWayId = endpointToWays.get(start.nodeId)[0];
        verification = {
          start,
          finish,
          startWayId,
          exactWayIds: wayIds,
          exactRelationIds: exactRelations.map((relation) => relation.id),
          totalLengthMeters,
          startToFrognerseterenMeters: startToFrog,
          finishToMidtstuenMeters: finishToMidt
        };
      }
    }
  }
}

function applyPlace(target) {
  if (verification) {
    target.lat = verification.start.point.lat;
    target.lon = verification.start.point.lon;
    target.locatorType = 'route_start';
    target.sourceProvider = 'osm';
    target.sourceObjectId = `osm-way:${verification.startWayId}`;
    target.geocodeAccuracy = 'exact_geometry';
    target.coordRole = 'route_start';
    target.coordType = 'route_start';
    target.coordStatus = 'verified_geometry';
    target.coordSource = 'OpenStreetMap exact named Korketrekkeren route geometry + Oslo kommune endpoint identity';
    target.coordSourceId = `osm-way:${verification.startWayId}`;
    target.coordSourceUrl = `https://www.openstreetmap.org/way/${verification.startWayId}`;
    target.coordVerifiedAt = DATE;
    target.coordNote = `Startendepunkt fra en sammenhengende OSM-trase eksplisitt navngitt Korketrekkeren, med samlet navngitt geometri på ${verification.totalLengthMeters.toFixed(0)} meter. Endepunktet er ${verification.startToFrognerseterenMeters.toFixed(0)} meter fra Frognerseteren-transitobjektet, mens motsatt ende er ${verification.finishToMidtstuenMeters.toFixed(0)} meter fra Midtstuen. Oslo kommune dokumenterer at akebakken går fra Frognerseteren til Midtstuen. Trailforks er fjernet som primær koordinatkilde.`;
  } else {
    target.locatorType = 'route_start';
    target.sourceProvider = 'municipality';
    target.sourceObjectId = 'oslo-kommune:korketrekkeren';
    target.geocodeAccuracy = 'unverified';
    target.coordRole = 'route_start_candidate';
    target.coordType = 'route_start_candidate';
    target.coordStatus = 'needs_source';
    target.coordSource = 'Oslo kommune confirms route identity; exact route-start geometry still unresolved';
    delete target.coordSourceId;
    target.coordSourceUrl = OFFICIAL_URL;
    target.coordVerifiedAt = DATE;
    target.coordNote = `Oslo kommune dokumenterer Korketrekkeren som trase fra Frognerseteren til Midtstuen, men den automatiske eksakt-navn-geometri-auditen kunne ikke godkjenne et entydig startanker: ${auditProblems.join('; ')}. Det tidligere Trailforks-punktet beholdes kun som midlertidig displaykoordinat og er ikke lenger verifisert.`;
  }
  delete target.coordPrecisionM;
}

applyPlace(aggregatePlace);
applyPlace(childPlace);
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
const verifiedHeader = '| batch | placeId | navn | godkjent status | kildeobjekt |';
let lines = protocol.split('\n');
const verifiedHeaderIndex = lines.indexOf(verifiedHeader);
if (verifiedHeaderIndex < 0) throw new Error('Oslo verified table header missing');
let verifiedEnd = verifiedHeaderIndex + 2;
while (verifiedEnd < lines.length && lines[verifiedEnd].startsWith('| ')) verifiedEnd += 1;
if (lines.slice(verifiedHeaderIndex + 2, verifiedEnd).some((line) => /^\| 93 \|/.test(line))) throw new Error('Batch 93 already in use');
if (lines.slice(verifiedHeaderIndex + 2, verifiedEnd).some((line) => line.includes('`korketrekkeren`'))) throw new Error('Korketrekkeren already in verified protocol table');

if (verification) {
  lines.splice(verifiedEnd, 0, `| 93 | \`korketrekkeren\` | Korketrekkeren | verified_geometry | \`osm-way:${verification.startWayId}\` |`);
  protocol = lines.join('\n');
} else {
  const unresolvedHeader = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
  const unresolvedIndex = lines.indexOf(unresolvedHeader);
  if (unresolvedIndex < 0) throw new Error('Oslo unresolved table header missing');
  const unresolvedTableHeaderIndex = lines.findIndex((line, index) => index > unresolvedIndex && line.startsWith('| kandidat |'));
  if (unresolvedTableHeaderIndex < 0) throw new Error('Oslo unresolved table columns missing');
  let unresolvedEnd = unresolvedTableHeaderIndex + 2;
  while (unresolvedEnd < lines.length && lines[unresolvedEnd].startsWith('| ')) unresolvedEnd += 1;
  if (!lines.slice(unresolvedTableHeaderIndex + 2, unresolvedEnd).some((line) => line.includes('`korketrekkeren`'))) {
    lines.splice(unresolvedEnd, 0, `| \`korketrekkeren\` – Korketrekkeren | needs_source | Oslo kommune dokumenterer traseen Frognerseteren–Midtstuen, men eksakt navngitt OSM-rutegraf ga ikke et tilstrekkelig entydig startanker: ${auditProblems.join('; ').replaceAll('|', '\\|')} | Finn offisiell rutegeometri eller et eksplisitt, stabilt startobjekt; ikke bruk Trailforks eller Holmenkollveien 201 som proxy. |`);
  }
  protocol = lines.join('\n');
}

protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${DATE}`);
const protocolLines = protocol.split('\n');
const h = protocolLines.indexOf(verifiedHeader);
let e = h + 2;
while (e < protocolLines.length && protocolLines[e].startsWith('| ')) e += 1;
const verifiedCount = e - (h + 2);
const outcomeText = verification
  ? `Batch 93 erstatter Trailforks som primærkilde for \`korketrekkeren\` med et eksplisitt endepunkt i den sammenhengende, navngitte OSM-traseen Korketrekkeren, kontrollert mot Oslo kommunes dokumentasjon av traseen Frognerseteren–Midtstuen.`
  : `Batch 93 underkjenner legacy \`verified_source_coordinate\` for \`korketrekkeren\`. Oslo kommune bekrefter traseidentiteten, men ingen eksakt rutegraf passerte alle objekt- og endepunktkontrollene; det gamle Trailforks-punktet er derfor kun en uverifisert displaykandidat.`;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. ${outcomeText} Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`);

const note = `Batch 93 (${DATE}) reviderer \`korketrekkeren\` som lineær akebakke/rute, ikke som adressepunkt. Oslo kommune er identitetskilden og dokumenterer traseen fra Frognerseteren til Midtstuen. Overpass-auditen søker bare eksakt navngitte OSM-geometrier. ${verification ? `Kontrollen fant ${verification.exactWayIds.length} sammenhengende navngitte way-segmenter med samlet lengde ${verification.totalLengthMeters.toFixed(0)} meter; ruteendepunktet nær Frognerseteren brukes som \`route_start\` og \`osm-way:${verification.startWayId}\` som fysisk kildeobjekt.` : `Kontrollen kunne ikke godkjenne rutegrafen (${auditProblems.join('; ')}), så recorden er nedgradert til \`needs_source\` og Trailforks-punktet er ikke lenger verifisert.`}`;
if (!protocol.includes(note)) {
  const anchor = '\nRelevante korrigerende merger';
  const noteIndex = protocol.indexOf(anchor);
  if (noteIndex < 0) throw new Error('Protocol notes anchor missing');
  protocol = `${protocol.slice(0, noteIndex)}\n\n${note}${protocol.slice(noteIndex)}`;
}
fs.writeFileSync(full(PROTOCOL), protocol);

writeJson(`${REPORT_DIR}/summary.json`, {
  date: DATE,
  batch: 93,
  placeId: PLACE_ID,
  officialIdentitySource: OFFICIAL_URL,
  overpassEndpoint,
  query: overpassQuery,
  exactNamedWays: exactWays.map((way) => ({ id: way.id, tags: way.tags, geometryPointCount: way.geometry.length, lengthMeters: Number(polylineLength(way.geometry).toFixed(1)) })),
  exactNamedRelations: exactRelations.map((relation) => ({ id: relation.id, tags: relation.tags })),
  transitObjects: transit,
  auditProblems,
  outcome: verification ? 'verified_geometry' : 'needs_source',
  verification,
  previous,
  current: {
    lat: childPlace.lat,
    lon: childPlace.lon,
    coordStatus: childPlace.coordStatus,
    coordType: childPlace.coordType,
    coordSource: childPlace.coordSource,
    coordSourceId: childPlace.coordSourceId || '',
    sourceProvider: childPlace.sourceProvider,
    sourceObjectId: childPlace.sourceObjectId,
    geocodeAccuracy: childPlace.geocodeAccuracy,
    coordRole: childPlace.coordRole
  },
  protocolVerifiedCountAfterBatch: verifiedCount
});

fs.writeFileSync(full(`${REPORT_DIR}/README.md`), `# Oslo coordinate control batch 93\n\n- Object type: linear sledding route; no address shortcut.\n- Official identity: Oslo kommune, Korketrekkeren from Frognerseteren to Midtstuen.\n- Geometry research: exact-name OpenStreetMap query through Overpass, raw response saved in \`osm/korketrekkeren-overpass.json\`.\n- Outcome: **${verification ? 'verified_geometry' : 'needs_source'}**.\n${verification ? `- Verified named geometry length: ${verification.totalLengthMeters.toFixed(0)} m across ${verification.exactWayIds.length} connected way segment(s).\n- Canonical route start source: osm-way:${verification.startWayId}.\n` : `- Legacy Trailforks verification removed.\n- Blocking reasons: ${auditProblems.join('; ')}.\n`}\n`);

console.log(JSON.stringify({ ok: true, batch: 93, outcome: verification ? 'verified_geometry' : 'needs_source', verifiedCount, auditProblems, verification }, null, 2));
