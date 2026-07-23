#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 161;
const date = '2026-07-23';
const placeId = 'fossveien_elvestrekning';

const riverWayId = 80915045;
const southBridgeWayId = 4826556; // Grünerbrua / Nordre gate
const internalSouthBridgeWayId = 457755404; // bridge in Nedre Foss park scope
const internalNorthBridgeWayId = 4826557; // bridge in Kuba/Nedre Foss scope
const northBridgeWayId = 3236542; // bridge by Kunsthøgskolen / Seilduksgata scope
const fossveienWayId = 3235603;
const seilduksgataWayId = 3235625;
const expectedFossveienNorthNode = 12534281;
const northConnectorWayIds = [941452472, 941452473, 72141365, 72141363, 457755401];
const byleksikonUrl = 'https://oslobyleksikon.no/side/Fossveien';

const aggregateFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json');
const childFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute/fossveien_elvestrekning.json');
const indexFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json');
const manifestFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/natur/fossveien_elvestrekning.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-161-fossveien-river-segment');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function parseAttrs(text) {
  const attrs = {};
  for (const match of text.matchAll(/([A-Za-z0-9_:-]+)="([^"]*)"/g)) attrs[match[1]] = match[2];
  return attrs;
}

function parseWayXml(xml, expectedWayId) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.id && attrs.lat != null && attrs.lon != null) {
      nodes.set(Number(attrs.id), { id: Number(attrs.id), lat: Number(attrs.lat), lon: Number(attrs.lon) });
    }
  }
  const wayMatch = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)]
    .map((match) => ({ attrs: parseAttrs(match[1]), body: match[2] }))
    .find((row) => Number(row.attrs.id) === expectedWayId);
  if (!wayMatch) throw new Error(`Primary OSM response missing way ${expectedWayId}`);
  const nodeIds = [...wayMatch.body.matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((match) => Number(parseAttrs(match[1]).ref));
  const tags = {};
  for (const match of wayMatch.body.matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.k != null) tags[attrs.k] = attrs.v ?? '';
  }
  const geometry = nodeIds.map((id) => nodes.get(id)).filter(Boolean);
  if (geometry.length !== nodeIds.length || geometry.length < 2) throw new Error(`Way ${expectedWayId} missing full node geometry`);
  return { id: expectedWayId, nodes: nodeIds, tags, geometry };
}

async function fetchWayFull(wayId, label) {
  const url = `https://api.openstreetmap.org/api/0.6/way/${wayId}/full`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: 'application/xml', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
      if (!response.ok) {
        lastError = new Error(`${label}: HTTP ${response.status}`);
      } else {
        const xml = await response.text();
        fs.writeFileSync(path.join(reportDir, `osm-way-${wayId}-full.xml`), xml);
        return parseWayXml(xml, wayId);
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
  }
  throw lastError || new Error(`${label}: primary OSM lookup failed`);
}

const wayIds = [
  riverWayId,
  southBridgeWayId,
  internalSouthBridgeWayId,
  internalNorthBridgeWayId,
  northBridgeWayId,
  fossveienWayId,
  seilduksgataWayId,
  ...northConnectorWayIds,
];
const fetchedWays = await Promise.all(wayIds.map((id) => fetchWayFull(id, `OSM way ${id}`)));
const byId = new Map(fetchedWays.map((way) => [way.id, way]));
const river = byId.get(riverWayId);
const southBridge = byId.get(southBridgeWayId);
const internalSouthBridge = byId.get(internalSouthBridgeWayId);
const internalNorthBridge = byId.get(internalNorthBridgeWayId);
const northBridge = byId.get(northBridgeWayId);
const fossveien = byId.get(fossveienWayId);
const seilduksgata = byId.get(seilduksgataWayId);

if (river.tags.name !== 'Akerselva' || river.tags.waterway !== 'river') throw new Error(`Way ${riverWayId} is not Akerselva waterway=river`);
if (southBridge.tags.bridge !== 'yes' || southBridge.tags.name !== 'Nordre gate') throw new Error(`Way ${southBridgeWayId} is not the Nordre gate/Grünerbrua crossing`);
if (northBridge.tags.bridge !== 'yes') throw new Error(`Way ${northBridgeWayId} is not bridge=yes`);
if (internalSouthBridge.tags.bridge !== 'yes' || internalNorthBridge.tags.bridge !== 'yes') throw new Error('Internal scope crossings must remain bridge=yes');
if (fossveien.tags.name !== 'Fossveien') throw new Error(`Way ${fossveienWayId} is not Fossveien`);
if (seilduksgata.tags.name !== 'Seilduksgata') throw new Error(`Way ${seilduksgataWayId} is not Seilduksgata`);
if (!fossveien.nodes.includes(expectedFossveienNorthNode) || !seilduksgata.nodes.includes(expectedFossveienNorthNode)) {
  throw new Error(`Fossveien and Seilduksgata no longer share expected north endpoint node ${expectedFossveienNorthNode}`);
}

const toRad = (value) => value * Math.PI / 180;
const R = 6371008.8;
function haversine(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
const projectionLat = toRad(59.9235);
const project = (p) => ({ x: p.lon * 111320 * Math.cos(projectionLat), y: p.lat * 110540 });

function segmentIntersection(a, b, c, d) {
  const A = project(a); const B = project(b); const C = project(c); const D = project(d);
  const rx = B.x - A.x; const ry = B.y - A.y; const sx = D.x - C.x; const sy = D.y - C.y;
  const denom = rx * sy - ry * sx;
  if (Math.abs(denom) < 1e-9) return null;
  const qpx = C.x - A.x; const qpy = C.y - A.y;
  const t = (qpx * sy - qpy * sx) / denom;
  const u = (qpx * ry - qpy * rx) / denom;
  if (t < -1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9) return null;
  return { lat: a.lat + t * (b.lat - a.lat), lon: a.lon + t * (b.lon - a.lon), riverT: t };
}

function riverIntersections(crossing) {
  const hits = [];
  let cumulative = 0;
  for (let index = 0; index < river.geometry.length - 1; index += 1) {
    const a = river.geometry[index];
    const b = river.geometry[index + 1];
    const segmentLength = haversine(a, b);
    for (let j = 0; j < crossing.geometry.length - 1; j += 1) {
      const hit = segmentIntersection(a, b, crossing.geometry[j], crossing.geometry[j + 1]);
      if (!hit) continue;
      hits.push({ ...hit, riverSegmentIndex: index, crossingSegmentIndex: j, measureM: cumulative + segmentLength * hit.riverT });
    }
    cumulative += segmentLength;
  }
  return hits.filter((hit, index, all) => all.findIndex((other) => haversine(hit, other) < 0.25) === index);
}

const crossings = new Map();
for (const crossing of [southBridge, internalSouthBridge, internalNorthBridge, northBridge]) {
  const hits = riverIntersections(crossing);
  if (hits.length !== 1) throw new Error(`Crossing way ${crossing.id} must intersect Akerselva way ${riverWayId} exactly once; found ${hits.length}`);
  crossings.set(crossing.id, hits[0]);
}
const southHit = crossings.get(southBridgeWayId);
const internalSouthHit = crossings.get(internalSouthBridgeWayId);
const internalNorthHit = crossings.get(internalNorthBridgeWayId);
const northHit = crossings.get(northBridgeWayId);

const ordered = [northHit.measureM, internalNorthHit.measureM, internalSouthHit.measureM, southHit.measureM];
if (!(ordered[0] < ordered[1] && ordered[1] < ordered[2] && ordered[2] < ordered[3])) {
  throw new Error(`Crossing order no longer matches Seilduksgata/Kunsthøgskolen -> Kuba -> Nedre Foss -> Grünerbrua: ${ordered.join(', ')}`);
}
const clippedLengthM = southHit.measureM - northHit.measureM;
if (clippedLengthM < 500 || clippedLengthM > 700) throw new Error(`Unexpected clipped Fossveien river length ${clippedLengthM.toFixed(1)} m`);

// Revalidate the exact north-end pedestrian/service topology found by the research pass.
const connectorWays = [fossveien, seilduksgata, northBridge, ...northConnectorWayIds.map((id) => byId.get(id))];
const adjacency = new Map();
const nodeCoords = new Map();
function addEdge(a, b, way) {
  if (!adjacency.has(a)) adjacency.set(a, []);
  adjacency.get(a).push({ nodeId: b, wayId: way.id, wayName: way.tags?.name || null, highway: way.tags?.highway || null });
}
for (const way of connectorWays) {
  for (let index = 0; index < way.nodes.length; index += 1) nodeCoords.set(Number(way.nodes[index]), way.geometry[index]);
  for (let index = 0; index < way.nodes.length - 1; index += 1) {
    const a = Number(way.nodes[index]); const b = Number(way.nodes[index + 1]);
    addEdge(a, b, way); addEdge(b, a, way);
  }
}
function bfs(start, targets) {
  const targetSet = new Set(targets.map(Number));
  const queue = [{ nodeId: Number(start), path: [] }];
  const visited = new Set([Number(start)]);
  while (queue.length) {
    const current = queue.shift();
    if (targetSet.has(current.nodeId)) return current.path;
    if (current.path.length >= 30) continue;
    for (const edge of adjacency.get(current.nodeId) || []) {
      if (visited.has(edge.nodeId)) continue;
      visited.add(edge.nodeId);
      queue.push({ nodeId: edge.nodeId, path: [...current.path, edge] });
    }
  }
  return null;
}
const northPath = bfs(expectedFossveienNorthNode, northBridge.nodes);
if (!northPath) throw new Error('No exact network path remains from Fossveien/Seilduksgata endpoint to north bridge');
let northPathLengthM = 0;
let previousNode = expectedFossveienNorthNode;
const northPathWaySequence = [];
for (const edge of northPath) {
  const a = nodeCoords.get(previousNode); const b = nodeCoords.get(edge.nodeId);
  if (a && b) northPathLengthM += haversine(a, b);
  if (northPathWaySequence.at(-1)?.wayId !== edge.wayId) northPathWaySequence.push({ wayId: edge.wayId, wayName: edge.wayName, highway: edge.highway });
  previousNode = edge.nodeId;
}
if (northPathLengthM > 130) throw new Error(`North endpoint-to-bridge topology path is unexpectedly long: ${northPathLengthM.toFixed(1)} m`);

function pointAtMeasure(targetM) {
  let cumulative = 0;
  for (let index = 0; index < river.geometry.length - 1; index += 1) {
    const a = river.geometry[index]; const b = river.geometry[index + 1];
    const segmentLength = haversine(a, b);
    if (cumulative + segmentLength >= targetM) {
      const t = segmentLength === 0 ? 0 : (targetM - cumulative) / segmentLength;
      return { lat: a.lat + t * (b.lat - a.lat), lon: a.lon + t * (b.lon - a.lon) };
    }
    cumulative += segmentLength;
  }
  return river.geometry.at(-1);
}
const midpointMeasureM = (northHit.measureM + southHit.measureM) / 2;
const midpoint = pointAtMeasure(midpointMeasureM);
if (!midpoint) throw new Error('Could not calculate clipped river midpoint');

const sourceObjectId = `osm-way:${riverWayId}`;
const sourceUrl = `https://www.openstreetmap.org/way/${riverWayId}`;
const coordNote = `Batch 161 avgrenser Fossveien-recordens Akerselva-scope etter Fossveiens dokumenterte gateomfang fra Nordre gate til Seilduksgata. Sørgrensen er Grünerbrua/Nordre gate (OSM way ${southBridgeWayId}); nordgrensen er den fysiske broen ved Kunsthøgskolen/Seilduksgata-scope (way ${northBridgeWayId}), med live topologisk gang-/servicekobling fra Fossveiens Seilduksgata-endepunkt. Broene ${internalSouthBridgeWayId} og ${internalNorthBridgeWayId} ligger strengt inne i intervallet. Canonical lat/lon er lengdemidtpunktet langs den klippede Akerselva-geometrien, ikke en projeksjon fra Fossveien og ikke nearest/first-hit.`;

const segmentScope = {
  method: 'clipped_river_geometry_matching_documented_street_extent',
  streetIdentity: {
    name: 'Fossveien',
    sourceProvider: 'manual_research',
    sourceUrl: byleksikonUrl,
    documentedExtent: 'fra Nordre gate til Seilduksgata',
    osmWayId: fossveienWayId,
    northEndpointNodeId: expectedFossveienNorthNode,
    seilduksgataWayId,
  },
  riverWayId,
  southBoundary: { name: 'Grünerbrua / Nordre gate', crossingWayId: southBridgeWayId, lat: southHit.lat, lon: southHit.lon },
  internalCrossings: [
    { crossingWayId: internalSouthBridgeWayId, lat: internalSouthHit.lat, lon: internalSouthHit.lon },
    { crossingWayId: internalNorthBridgeWayId, lat: internalNorthHit.lat, lon: internalNorthHit.lon },
  ],
  northBoundary: {
    name: 'Bro ved Kunsthøgskolen / Seilduksgata-scope',
    crossingWayId: northBridgeWayId,
    lat: northHit.lat,
    lon: northHit.lon,
    endpointToBridgePathLengthM: Number(northPathLengthM.toFixed(1)),
    endpointToBridgeWaySequence: northPathWaySequence,
  },
  clippedLengthM: Number(clippedLengthM.toFixed(1)),
};

const fields = {
  lat: midpoint.lat,
  lon: midpoint.lon,
  r: 150,
  locatorType: 'route',
  sourceProvider: 'osm',
  sourceObjectId,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'line_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `OpenStreetMap way ${riverWayId} – Akerselva clipped from Grünerbrua/Nordre gate to the Kunsthøgskolen/Seilduksgata bridge scope`,
  coordSourceId: sourceObjectId,
  coordSourceUrl: sourceUrl,
  coordType: 'clipped_river_segment_anchor',
  coordVerifiedAt: date,
  coordNote,
};

const aggregate = readJson(aggregateFile);
const aggregateMatches = aggregate.filter((place) => place?.id === placeId);
if (aggregateMatches.length !== 1) throw new Error(`${placeId} must exist exactly once in aggregate`);
const oldPlace = aggregateMatches[0];
const child = readJson(childFile);
if (child?.id !== placeId) throw new Error(`Child file does not match ${placeId}`);
const updatedPlace = {
  ...child,
  desc: 'Akerselva-strekningen som følger Fossveiens historiske og urbane korridor fra Grünerbrua ved Nordre gate til området ved Seilduksgata og Kunsthøgskolen.',
  sourceHint: 'Scope følger Fossveiens dokumenterte utstrekning fra Nordre gate til Seilduksgata og klippes fysisk i Akerselva mellom korresponderende brogrenser.',
  ...fields,
  segmentScope,
};
const updatedAggregate = aggregate.map((place) => place?.id === placeId ? updatedPlace : place);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} missing from split index`);
for (const key of ['name','lat','lon','r','coordStatus','coordType','locatorType','sourceProvider','sourceObjectId','geocodeAccuracy','coordRole','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote']) {
  if (updatedPlace[key] !== undefined) indexRow[key] = updatedPlace[key];
}
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} missing from split manifest`);
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.name = updatedPlace.name;
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: fields.lat, lon: fields.lon, r: fields.r, coordStatus: fields.coordStatus, coordSource: fields.coordSource, coordType: fields.coordType, coordNote },
  identity: {
    currentName: updatedPlace.name,
    resolvedIdentity: 'Akerselva-strekningen langs Fossveiens dokumenterte korridor fra Nordre gate til Seilduksgata',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'route',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Fossveien',
      sourceUrl: byleksikonUrl,
      sourceObjectId: 'oslobyleksikon:fossveien',
      sourceQuality: 'documented_street_extent',
      finding: 'Fossveien er dokumentert fra Nordre gate til Seilduksgata; dette brukes som semantisk scope for den parallelle Akerselva-recorden.',
      canVerifyCoordinate: false,
      reason: 'Kilden avgrenser identiteten, mens selve koordinaten kommer fra den eksplisitt klippede OSM-elvgeometrien.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – Akerselva og fysiske scope-broer',
      sourceUrl,
      sourceObjectId,
      sourceQuality: 'explicit_clipped_route_geometry',
      finding: `Akerselva way ${riverWayId} klippes mellom Grünerbrua/Nordre gate way ${southBridgeWayId} og bro way ${northBridgeWayId}; interne broer ${internalSouthBridgeWayId} og ${internalNorthBridgeWayId} ligger i riktig rekkefølge, og nordenden har eksplisitt nettverkskobling til Fossveien/Seilduksgata.`,
      canVerifyCoordinate: true,
      reason: 'Den lokale elvestrekningen har to kildebelagte fysiske yttergrenser og live-validert topologi.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [{ sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true }],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId, geometryRole: 'clipped_route_segment', canApplyToPlace: true, segmentScope }],
  coordinateCandidates: [{ lat: fields.lat, lon: fields.lon, geocodeAccuracy: fields.geocodeAccuracy, coordRole: fields.coordRole, sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Applied to canonical place.' },
  notes: [coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${date}`);
if (!protocol.includes(`| ${batch} | \`${placeId}\``)) {
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
  const insertion = `| 161 | \`${placeId}\` | ${updatedPlace.name} | verified_geometry | \`${sourceObjectId}\` |\n\nBatch 161 (${date}) løser Fossveien-recorden som Akerselva-strekningen som svarer til Fossveiens dokumenterte utstrekning fra Nordre gate til Seilduksgata. Sørgrensen er Grünerbrua/Nordre gate (way ${southBridgeWayId}); nordgrensen er den fysiske broen ved Kunsthøgskolen/Seilduksgata-scope (way ${northBridgeWayId}), med live-validert topologisk forbindelse fra Fossveiens Seilduksgata-endepunkt. De interne broene ${internalSouthBridgeWayId} og ${internalNorthBridgeWayId} ligger strengt inne i intervallet. Canonical lat/lon er lengdemidtpunktet langs den klippede ca. ${clippedLengthM.toFixed(1)} meter lange Akerselva-geometrien; dagens Fossveien-way brukes ikke som et kunstig elvepunkt, og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex < 0) throw new Error('Could not find protocol insertion marker');
  protocol = `${protocol.slice(0, markerIndex)}${insertion}${protocol.slice(markerIndex)}`;
}
protocol = protocol.split('\n').filter((line) => !line.includes(`| \`${placeId}\` – Fossveien – elvestrekning | needs_review |`)).join('\n');
fs.writeFileSync(protocolFile, protocol);

writeJson(path.join(reportDir, 'batch-161-result.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  name: updatedPlace.name,
  sourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: fields.lat, lon: fields.lon },
  status: fields.coordStatus,
  method: segmentScope.method,
  segmentScope,
  midpointMeasureM: Number(midpointMeasureM.toFixed(1)),
});
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 161 sources\n\n- Oslo byleksikon, Fossveien: ${byleksikonUrl} — documents the street extent from Nordre gate to Seilduksgata.\n- OpenStreetMap way ${riverWayId}: Akerselva source geometry.\n- OpenStreetMap way ${southBridgeWayId}: Grünerbrua / Nordre gate south bracket.\n- OpenStreetMap way ${northBridgeWayId}: north physical bracket in the Kunsthøgskolen / Seilduksgata scope.\n- OpenStreetMap ways ${internalSouthBridgeWayId} and ${internalNorthBridgeWayId}: internal physical crossing checks.\n- OpenStreetMap ways ${northConnectorWayIds.join(', ')}: exact north-end pedestrian/service topology between Fossveien/Seilduksgata and the north bridge.\n- Research precursor: PR #3417.\n\nNo legacy coordinate, street-to-river projection, nearest-object rule or first-hit selection is used.\n`);

console.log(JSON.stringify({
  batch,
  placeId,
  sourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: fields.lat, lon: fields.lon },
  clippedLengthM: Number(clippedLengthM.toFixed(1)),
  northPathLengthM: Number(northPathLengthM.toFixed(1)),
  boundaries: { north: northHit, internalNorth: internalNorthHit, internalSouth: internalSouthHit, south: southHit },
}, null, 2));
