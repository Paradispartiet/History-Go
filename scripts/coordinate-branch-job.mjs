#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 162;
const date = '2026-07-23';
const placeId = 'hausmannsomradet_elvelop';
const newName = 'Hausmannskvartalene – elveløp';

const riverWayId = 80915045;
const nybruaPolygonWayId = 315066295;
const hausmannPolygonWayId = 377766486;
const byleksikonHausmannskvartalene = 'https://oslobyleksikon.no/side/Hausmannskvartalene';
const byleksikonNybrua = 'https://oslobyleksikon.no/side/Nybrua';
const byleksikonHausmannsBru = 'https://oslobyleksikon.no/side/Hausmanns_bru';

const aggregateFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json');
const childFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute/hausmannsomradet_elvelop.json');
const indexFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json');
const manifestFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/natur/hausmannsomradet_elvelop.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-162-hausmannskvartalene-river-segment');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function parseAttrs(text) {
  const attrs = {};
  for (const match of text.matchAll(/([A-Za-z0-9_:-]+)="([^"]*)"/g)) attrs[match[1]] = match[2];
  return attrs;
}

function parseWayXml(xml, expectedId) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.id && attrs.lat != null && attrs.lon != null) nodes.set(Number(attrs.id), { id: Number(attrs.id), lat: Number(attrs.lat), lon: Number(attrs.lon) });
  }
  const row = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)]
    .map((match) => ({ attrs: parseAttrs(match[1]), body: match[2] }))
    .find((item) => Number(item.attrs.id) === expectedId);
  if (!row) throw new Error(`Mangler OSM way ${expectedId}`);
  const nodeIds = [...row.body.matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((match) => Number(parseAttrs(match[1]).ref));
  const tags = {};
  for (const match of row.body.matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.k != null) tags[attrs.k] = attrs.v ?? '';
  }
  const geometry = nodeIds.map((id) => nodes.get(id)).filter(Boolean);
  if (geometry.length !== nodeIds.length || geometry.length < 2) throw new Error(`Ufullstendig geometri for OSM way ${expectedId}`);
  return { id: expectedId, nodeIds, tags, geometry };
}

async function fetchWay(wayId, label) {
  const url = `https://api.openstreetmap.org/api/0.6/way/${wayId}/full`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: 'application/xml', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
      if (!response.ok) lastError = new Error(`${label}: HTTP ${response.status}`);
      else {
        const xml = await response.text();
        fs.writeFileSync(path.join(reportDir, `osm-way-${wayId}-full.xml`), xml);
        return parseWayXml(xml, wayId);
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
  }
  throw lastError || new Error(`${label}: OSM API-oppslag feilet`);
}

const [river, nybrua, hausmannsBru] = await Promise.all([
  fetchWay(riverWayId, 'Akerselva'),
  fetchWay(nybruaPolygonWayId, 'Nybrua'),
  fetchWay(hausmannPolygonWayId, 'Hausmanns bru'),
]);
if (river.tags.name !== 'Akerselva' || river.tags.waterway !== 'river' || river.tags.covered === 'yes' || river.tags.tunnel === 'yes') {
  throw new Error(`OSM way ${riverWayId} er ikke forventet synlig Akerselva-geometri`);
}
if (nybrua.tags.name !== 'Nybrua' || nybrua.tags.man_made !== 'bridge') throw new Error(`OSM way ${nybruaPolygonWayId} er ikke navngitt Nybrua-broflate`);
if (hausmannsBru.tags.name !== 'Hausmanns bru' || hausmannsBru.tags.man_made !== 'bridge') throw new Error(`OSM way ${hausmannPolygonWayId} er ikke navngitt Hausmanns bru-broflate`);

const toRad = (value) => value * Math.PI / 180;
const R = 6371008.8;
function haversine(a, b) {
  const dLat = toRad(b.lat - a.lat); const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat); const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
const projectionLat = toRad(59.9165);
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

function polygonCrossing(polygonWay) {
  const edges = [];
  for (let i = 0; i < polygonWay.geometry.length - 1; i += 1) edges.push([polygonWay.geometry[i], polygonWay.geometry[i + 1]]);
  if (polygonWay.nodeIds[0] !== polygonWay.nodeIds.at(-1)) edges.push([polygonWay.geometry.at(-1), polygonWay.geometry[0]]);

  const hits = [];
  let cumulative = 0;
  for (let i = 0; i < river.geometry.length - 1; i += 1) {
    const a = river.geometry[i]; const b = river.geometry[i + 1];
    const len = haversine(a, b);
    for (let j = 0; j < edges.length; j += 1) {
      const hit = segmentIntersection(a, b, edges[j][0], edges[j][1]);
      if (!hit) continue;
      hits.push({ ...hit, measureM: cumulative + len * hit.riverT, riverSegmentIndex: i, polygonEdgeIndex: j });
    }
    cumulative += len;
  }
  const unique = hits
    .sort((a, b) => a.measureM - b.measureM)
    .filter((hit, index, all) => all.findIndex((other) => haversine(hit, other) < 0.2) === index);
  if (unique.length !== 2) throw new Error(`${polygonWay.tags.name} må skjære Akerselva nøyaktig to ganger i broflaten; fant ${unique.length}`);
  return {
    entry: unique[0],
    exit: unique[1],
    measureM: (unique[0].measureM + unique[1].measureM) / 2,
    widthAlongRiverM: unique[1].measureM - unique[0].measureM,
  };
}

function pointAtMeasure(targetM) {
  let cumulative = 0;
  for (let i = 0; i < river.geometry.length - 1; i += 1) {
    const a = river.geometry[i]; const b = river.geometry[i + 1];
    const len = haversine(a, b);
    if (cumulative + len >= targetM) {
      const t = len === 0 ? 0 : (targetM - cumulative) / len;
      return { lat: a.lat + t * (b.lat - a.lat), lon: a.lon + t * (b.lon - a.lon) };
    }
    cumulative += len;
  }
  return river.geometry.at(-1);
}

const upstream = polygonCrossing(nybrua);
const downstream = polygonCrossing(hausmannsBru);
if (!(upstream.measureM < downstream.measureM)) throw new Error('Nybrua må ligge oppstrøms Hausmanns bru på den validerte Akerselva-geometrien');
const clippedLengthM = downstream.measureM - upstream.measureM;
if (clippedLengthM < 350 || clippedLengthM > 470) throw new Error(`Uventet lengde på Hausmannskvartalenes elvegrense: ${clippedLengthM.toFixed(1)} m`);
const upstreamPoint = pointAtMeasure(upstream.measureM);
const downstreamPoint = pointAtMeasure(downstream.measureM);
const midpointMeasureM = (upstream.measureM + downstream.measureM) / 2;
const midpoint = pointAtMeasure(midpointMeasureM);
if (!upstreamPoint || !downstreamPoint || !midpoint) throw new Error('Kunne ikke beregne bro- eller midtanker på Akerselva');

for (const [label, actual, expected] of [
  ['Nybrua', upstreamPoint, { lat: 59.917778461174194, lon: 10.759154678132907 }],
  ['Hausmanns bru', downstreamPoint, { lat: 59.915187221700485, lon: 10.7598841974919 }],
  ['midtanker', midpoint, { lat: 59.91675289691115, lon: 10.7617223200004 }],
]) {
  if (haversine(actual, expected) > 25) throw new Error(`${label} har flyttet seg mer enn 25 m fra research-resultatet`);
}

const sourceObjectId = `osm-way:${riverWayId}`;
const sourceUrl = `https://www.openstreetmap.org/way/${riverWayId}`;
const coordNote = `Batch 162 avgrenser Hausmannskvartalenes synlige Akerselva-grense mellom de eksakte navngitte broflatene Nybrua (OSM way ${nybruaPolygonWayId}) og Hausmanns bru (OSM way ${hausmannPolygonWayId}). Begge broflatene skjærer samme synlige Akerselva-way ${riverWayId} nøyaktig to ganger; grenseankrene er midtpunktene langs elvas passasje gjennom hver broflate. Canonical lat/lon er lengdemidtpunktet langs den ${clippedLengthM.toFixed(1)} meter lange klippede elvegeometrien. Legacy-punktet vest for elva, nearest/first-hit og tilfeldig valg av kjørebane brukes ikke.`;

const segmentScope = {
  method: 'clipped_visible_river_geometry_between_exact_named_bridge_polygons',
  identity: {
    name: 'Hausmannskvartalene',
    sourceProvider: 'manual_research',
    sourceUrl: byleksikonHausmannskvartalene,
    documentedBoundary: 'Hausmanns gate i nord, Akerselva i nordøst og Storgata i sørøst',
  },
  riverWayId,
  upstreamBoundary: {
    name: 'Nybrua',
    bridgePolygonWayId: nybruaPolygonWayId,
    sourceUrl: byleksikonNybrua,
    riverCrossingCenter: upstreamPoint,
    bridgeWidthAlongRiverM: Number(upstream.widthAlongRiverM.toFixed(1)),
  },
  downstreamBoundary: {
    name: 'Hausmanns bru',
    bridgePolygonWayId: hausmannPolygonWayId,
    sourceUrl: byleksikonHausmannsBru,
    riverCrossingCenter: downstreamPoint,
    bridgeWidthAlongRiverM: Number(downstream.widthAlongRiverM.toFixed(1)),
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
  coordSource: `OpenStreetMap way ${riverWayId} – Akerselva clipped between exact named bridge polygons Nybrua ${nybruaPolygonWayId} and Hausmanns bru ${hausmannPolygonWayId}`,
  coordSourceId: sourceObjectId,
  coordSourceUrl: sourceUrl,
  coordType: 'clipped_river_segment_anchor',
  coordVerifiedAt: date,
  coordNote,
};

const aggregate = readJson(aggregateFile);
const matches = aggregate.filter((place) => place?.id === placeId);
if (matches.length !== 1) throw new Error(`${placeId} må finnes nøyaktig én gang i aggregate`);
const oldPlace = matches[0];
const child = readJson(childFile);
if (child?.id !== placeId) throw new Error(`Child-filen matcher ikke ${placeId}`);
const updatedPlace = {
  ...child,
  name: newName,
  desc: 'Den synlige Akerselva-strekningen som danner nordøstgrensen til Hausmannskvartalene, fra Nybrua til Hausmanns bru.',
  popupDesc: 'Mellom Nybrua og Hausmanns bru følger Akerselva kanten av Hausmannskvartalene. Her møter det åpne elveløpet en tett del av sentrum preget av historisk murby, infrastruktur og kulturmiljøer. History Go avgrenser derfor stedet etter de to fysiske, navngitte broene som faktisk rammer inn kvartalenes elvegrense – ikke etter det gamle feilplasserte kartpunktet vest for elva.',
  sourceHint: 'Scope følger Hausmannskvartalenes dokumenterte Akerselva-grense og klippes fysisk mellom de navngitte broflatene Nybrua og Hausmanns bru.',
  ...fields,
  segmentScope,
};
const updatedAggregate = aggregate.map((place) => place?.id === placeId ? updatedPlace : place);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} mangler i split-index`);
for (const key of ['name','lat','lon','r','coordStatus','coordType','locatorType','sourceProvider','sourceObjectId','geocodeAccuracy','coordRole','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote']) {
  if (updatedPlace[key] !== undefined) indexRow[key] = updatedPlace[key];
}
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} mangler i split-manifest`);
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.name = newName;
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
    currentName: newName,
    resolvedIdentity: 'Hausmannskvartalenes synlige Akerselva-grense mellom Nybrua og Hausmanns bru',
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
      sourceName: 'Oslo byleksikon – Hausmannskvartalene',
      sourceUrl: byleksikonHausmannskvartalene,
      sourceObjectId: 'oslobyleksikon:hausmannskvartalene',
      sourceQuality: 'documented_area_boundary',
      finding: 'Hausmannskvartalene avgrenses av Hausmanns gate i nord, Akerselva i nordøst og Storgata i sørøst; den relevante elvegrensen ligger derfor mellom broene ved disse gatene.',
      canVerifyCoordinate: false,
      reason: 'Kilden avgrenser identiteten; koordinaten kommer fra den eksplisitt klippede OSM-elvgeometrien.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – Akerselva, Nybrua og Hausmanns bru',
      sourceUrl,
      sourceObjectId,
      sourceQuality: 'explicit_clipped_route_geometry',
      finding: `Synlig Akerselva way ${riverWayId} passerer gjennom de eksakte navngitte broflatene Nybrua way ${nybruaPolygonWayId} og Hausmanns bru way ${hausmannPolygonWayId}; deres elvekryssingssentre gir deterministiske yttergrenser.`,
      canVerifyCoordinate: true,
      reason: 'Strekningen er fysisk avgrenset av to eksakte navngitte brogeometrier på samme synlige elveobjekt.',
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
  const insertion = `| 162 | \`${placeId}\` | ${newName} | verified_geometry | \`${sourceObjectId}\` |\n\nBatch 162 (${date}) løser den tidligere brede «Hausmannsområdet»-recorden som Hausmannskvartalenes dokumenterte Akerselva-grense mellom Nybrua og Hausmanns bru. Oslo byleksikon avgrenser Hausmannskvartalene med Hausmanns gate i nord, Akerselva i nordøst og Storgata i sørøst. Fresh OSM way ${riverWayId} er den synlige Akerselva-geometrien; de eksakte navngitte broflatene Nybrua (way ${nybruaPolygonWayId}) og Hausmanns bru (way ${hausmannPolygonWayId}) skjærer samme elveway og brukes som fysiske yttergrenser. Canonical lat/lon er lengdemidtpunktet langs den klippede ca. ${clippedLengthM.toFixed(1)} meter lange elvegeometrien. Legacy-punktet vest for elva og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex < 0) throw new Error('Fant ikke protokollinnsettingspunkt');
  protocol = `${protocol.slice(0, markerIndex)}${insertion}${protocol.slice(markerIndex)}`;
}
protocol = protocol.split('\n').filter((line) => !line.includes(`| \`${placeId}\` –`)).join('\n');
fs.writeFileSync(protocolFile, protocol);

writeJson(path.join(reportDir, 'batch-162-result.json'), {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  name: newName,
  sourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: fields.lat, lon: fields.lon },
  status: fields.coordStatus,
  method: segmentScope.method,
  segmentScope,
  midpointMeasureM: Number(midpointMeasureM.toFixed(1)),
});
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 162 sources\n\n- Oslo byleksikon, Hausmannskvartalene: ${byleksikonHausmannskvartalene}\n- Oslo byleksikon, Nybrua: ${byleksikonNybrua}\n- Oslo byleksikon, Hausmanns bru: ${byleksikonHausmannsBru}\n- OpenStreetMap way ${riverWayId}: visible Akerselva source geometry.\n- OpenStreetMap way ${nybruaPolygonWayId}: exact named Nybrua bridge polygon.\n- OpenStreetMap way ${hausmannPolygonWayId}: exact named Hausmanns bru bridge polygon.\n- Research precursor: PR #3421.\n\nNo legacy coordinate, nearest-object rule, first-hit selection or arbitrary roadway choice is used.\n`);

console.log(JSON.stringify({
  batch,
  placeId,
  name: newName,
  sourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: fields.lat, lon: fields.lon },
  clippedLengthM: Number(clippedLengthM.toFixed(1)),
  boundaries: { upstream: upstreamPoint, downstream: downstreamPoint },
}, null, 2));
