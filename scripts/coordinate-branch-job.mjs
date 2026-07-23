#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 163;
const date = '2026-07-23';
const placeId = 'voienfossen';

const riverWayId = 80915045;
const bentsebruaWayId = 381743815;
const sannerbruaWayId = 381749952;
const expectedWaterfallNodeIds = [7876345836, 10820084635, 5169533163];

const byleksikonUrl = 'https://oslobyleksikon.no/side/V%C3%B8yenfallene';
const lokalhistoriewikiUrl = 'https://lokalhistoriewiki.no/wiki/V%C3%B8yenfallene';

const aggregateFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json');
const childFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute/voienfossen.json');
const indexFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json');
const manifestFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/natur/voienfossen.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-163-voyenfallene-system');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function parseAttrs(text) {
  const attrs = {};
  for (const match of text.matchAll(/([A-Za-z0-9_:-]+)="([^"]*)"/g)) attrs[match[1]] = match[2];
  return attrs;
}

function parseOsmXml(xml) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (!attrs.id || attrs.lat == null || attrs.lon == null) continue;
    nodes.set(Number(attrs.id), { id: Number(attrs.id), lat: Number(attrs.lat), lon: Number(attrs.lon), tags: {} });
  }
  for (const match of xml.matchAll(/<node\b([^>]*)>([\s\S]*?)<\/node>/g)) {
    const attrs = parseAttrs(match[1]);
    if (!attrs.id || attrs.lat == null || attrs.lon == null) continue;
    const tags = {};
    for (const tag of match[2].matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
      const tagAttrs = parseAttrs(tag[1]);
      if (tagAttrs.k != null) tags[tagAttrs.k] = tagAttrs.v ?? '';
    }
    nodes.set(Number(attrs.id), { id: Number(attrs.id), lat: Number(attrs.lat), lon: Number(attrs.lon), tags });
  }
  const ways = new Map();
  for (const match of xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)) {
    const attrs = parseAttrs(match[1]);
    const body = match[2];
    const id = Number(attrs.id);
    const nodeIds = [...body.matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((nd) => Number(parseAttrs(nd[1]).ref));
    const tags = {};
    for (const tag of body.matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
      const tagAttrs = parseAttrs(tag[1]);
      if (tagAttrs.k != null) tags[tagAttrs.k] = tagAttrs.v ?? '';
    }
    ways.set(id, { id, nodeIds, tags });
  }
  return { nodes, ways };
}

async function fetchOsm(pathname, filename) {
  const url = `https://api.openstreetmap.org/api/0.6/${pathname}`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: 'application/xml', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
      if (!response.ok) lastError = new Error(`${pathname}: HTTP ${response.status}`);
      else {
        const xml = await response.text();
        fs.writeFileSync(path.join(reportDir, filename), xml);
        return parseOsmXml(xml);
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }
  throw lastError || new Error(`OSM lookup failed: ${pathname}`);
}

const [riverParsed, bentseParsed, sannerParsed] = await Promise.all([
  fetchOsm(`way/${riverWayId}/full`, `osm-way-${riverWayId}-full.xml`),
  fetchOsm(`way/${bentsebruaWayId}/full`, `osm-way-${bentsebruaWayId}-full.xml`),
  fetchOsm(`way/${sannerbruaWayId}/full`, `osm-way-${sannerbruaWayId}-full.xml`),
]);

function fullWay(parsed, wayId) {
  const way = parsed.ways.get(wayId);
  if (!way) throw new Error(`Missing OSM way ${wayId}`);
  const geometry = way.nodeIds.map((id) => parsed.nodes.get(id)).filter(Boolean);
  if (geometry.length !== way.nodeIds.length || geometry.length < 2) throw new Error(`Incomplete geometry for OSM way ${wayId}`);
  return { ...way, geometry };
}

const river = fullWay(riverParsed, riverWayId);
const bentse = fullWay(bentseParsed, bentsebruaWayId);
const sanner = fullWay(sannerParsed, sannerbruaWayId);
if (river.tags.name !== 'Akerselva' || river.tags.waterway !== 'river' || river.tags.covered === 'yes' || river.tags.tunnel === 'yes') {
  throw new Error(`OSM way ${riverWayId} er ikke forventet synlig Akerselva-geometri`);
}
if (bentse.tags.name !== 'Bentsebrua' || bentse.tags.man_made !== 'bridge') throw new Error(`OSM way ${bentsebruaWayId} er ikke Bentsebrua-broflaten`);
if (sanner.tags.name !== 'Sannerbrua' || sanner.tags.man_made !== 'bridge') throw new Error(`OSM way ${sannerbruaWayId} er ikke Sannerbrua-broflaten`);

const toRad = (value) => value * Math.PI / 180;
const R = 6371008.8;
function haversine(a, b) {
  const dLat = toRad(b.lat - a.lat); const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat); const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
const projectionLat = toRad(59.933);
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
  const unique = hits.sort((a, b) => a.measureM - b.measureM).filter((hit, index, all) => all.findIndex((other) => haversine(hit, other) < 0.2) === index);
  if (unique.length !== 2) throw new Error(`${polygonWay.tags.name} må skjære Akerselva nøyaktig to ganger; fant ${unique.length}`);
  return { entry: unique[0], exit: unique[1], measureM: (unique[0].measureM + unique[1].measureM) / 2, widthAlongRiverM: unique[1].measureM - unique[0].measureM };
}

function measureForNode(nodeId) {
  const index = river.nodeIds.indexOf(nodeId);
  if (index < 0) return null;
  let measureM = 0;
  for (let i = 0; i < index; i += 1) measureM += haversine(river.geometry[i], river.geometry[i + 1]);
  return measureM;
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

const bentseCrossing = polygonCrossing(bentse);
const sannerCrossing = polygonCrossing(sanner);
if (!(bentseCrossing.measureM < sannerCrossing.measureM)) throw new Error('Bentsebrua må ligge oppstrøms Sannerbrua på den validerte elvegeometrien');
const clippedLengthM = sannerCrossing.measureM - bentseCrossing.measureM;
if (clippedLengthM < 1000 || clippedLengthM > 1250) throw new Error(`Uventet Vøyenfallene-systemlengde ${clippedLengthM.toFixed(1)} m`);

const waterfallNodesOnRiver = river.nodeIds
  .map((nodeId) => ({ nodeId, node: riverParsed.nodes.get(nodeId), measureM: measureForNode(nodeId) }))
  .filter((row) => row.node?.tags?.waterway === 'waterfall')
  .filter((row) => row.measureM > bentseCrossing.measureM && row.measureM < sannerCrossing.measureM)
  .sort((a, b) => a.measureM - b.measureM);

if (waterfallNodesOnRiver.length !== 3) throw new Error(`Forventet nøyaktig tre waterfall-noder i systemintervallet; fant ${waterfallNodesOnRiver.length}`);
const actualIds = waterfallNodesOnRiver.map((row) => row.nodeId);
if (JSON.stringify(actualIds) !== JSON.stringify(expectedWaterfallNodeIds)) {
  throw new Error(`Waterfall-node-settet har endret seg: ${actualIds.join(', ')}`);
}

const fallAnchors = waterfallNodesOnRiver.map((row, index) => ({
  order: index + 1,
  sourceProvider: 'osm',
  sourceObjectId: `osm-node:${row.nodeId}`,
  nodeId: row.nodeId,
  lat: row.node.lat,
  lon: row.node.lon,
  r: 70,
  coordRole: 'waterfall_anchor',
  measureM: Number(row.measureM.toFixed(1)),
  distanceFromPreviousM: index === 0 ? null : Number((row.measureM - waterfallNodesOnRiver[index - 1].measureM).toFixed(1)),
}));

const firstFallMeasureM = waterfallNodesOnRiver[0].measureM;
const lastFallMeasureM = waterfallNodesOnRiver.at(-1).measureM;
const systemAnchorMeasureM = (firstFallMeasureM + lastFallMeasureM) / 2;
const systemAnchor = pointAtMeasure(systemAnchorMeasureM);
const upstreamBoundary = pointAtMeasure(bentseCrossing.measureM);
const downstreamBoundary = pointAtMeasure(sannerCrossing.measureM);
if (!systemAnchor || !upstreamBoundary || !downstreamBoundary) throw new Error('Kunne ikke beregne systemankre');

const sourceObjectId = `osm-way:${riverWayId}`;
const sourceUrl = `https://www.openstreetmap.org/way/${riverWayId}`;
const coordNote = `Batch 163 modellerer Vøyenfallene som et tre-fallsystem, ikke som ett enkelt foss-punkt. Den synlige Akerselva-wayen ${riverWayId} klippes mellom de eksakte navngitte broflatene Bentsebrua (way ${bentsebruaWayId}) og Sannerbrua (way ${sannerbruaWayId}). Nøyaktig tre waterway=waterfall-noder er medlemmer av samme elveway inne i intervallet: ${actualIds.join(', ')}. Canonical lat/lon er et semantisk systemanker langs elva midt i spennvidden mellom første og siste fossanker; hele bro-til-bro-geometrien og alle tre fossankrene lagres eksplisitt.`;

const segmentScope = {
  method: 'bridge_bounded_river_geometry_with_three_explicit_waterfall_node_anchors',
  riverWayId,
  upstreamBoundary: {
    name: 'Bentsebrua',
    bridgePolygonWayId: bentsebruaWayId,
    crossingCenter: upstreamBoundary,
    widthAlongRiverM: Number(bentseCrossing.widthAlongRiverM.toFixed(1)),
  },
  downstreamBoundary: {
    name: 'Sannerbrua',
    bridgePolygonWayId: sannerbruaWayId,
    crossingCenter: downstreamBoundary,
    widthAlongRiverM: Number(sannerCrossing.widthAlongRiverM.toFixed(1)),
  },
  clippedLengthM: Number(clippedLengthM.toFixed(1)),
  systemAnchorMethod: 'midpoint_along_river_between_first_and_last_waterfall_anchors',
  systemAnchorMeasureM: Number(systemAnchorMeasureM.toFixed(1)),
  waterfallAnchors: fallAnchors,
};

const fields = {
  lat: systemAnchor.lat,
  lon: systemAnchor.lon,
  r: 180,
  locatorType: 'natural_area',
  sourceProvider: 'osm',
  sourceObjectId,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `OpenStreetMap way ${riverWayId} – Akerselva between Bentsebrua and Sannerbrua with three explicit waterfall nodes`,
  coordSourceId: sourceObjectId,
  coordSourceUrl: sourceUrl,
  coordType: 'bridge_bounded_three_waterfall_system_anchor',
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
  ...fields,
  sourceHint: 'Canonical scope er hele Vøyenfallene-systemet mellom Bentsebrua og Sannerbrua, med tre eksakte waterfall-noder som interne fossankre.',
  segmentScope,
  fallAnchors,
};
writeJson(aggregateFile, aggregate.map((place) => place?.id === placeId ? updatedPlace : place));
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
manifestRow.name = updatedPlace.name;
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: fields.lat,
    lon: fields.lon,
    r: fields.r,
    coordStatus: fields.coordStatus,
    coordSource: fields.coordSource,
    coordType: fields.coordType,
    coordNote,
  },
  identity: {
    currentName: updatedPlace.name,
    resolvedIdentity: 'Vøyenfallene – tre dokumenterte fall i Akerselva mellom Bentsebrua og Sannerbrua',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'natural_area',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Vøyenfallene',
      sourceUrl: byleksikonUrl,
      sourceObjectId: 'oslobyleksikon:voyenfallene',
      sourceQuality: 'documented_multi_fall_scope',
      finding: 'Vøyenfallene er dokumentert som en fallrekke med tre historiske kraftpunkter mellom Bentsebrua og Sannerbrua.',
      canVerifyCoordinate: false,
      reason: 'Kilden avgrenser identiteten og tre-fallsystemet; den maskinsporbare geometrien kommer fra OSM.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Lokalhistoriewiki – Vøyenfallene',
      sourceUrl: lokalhistoriewikiUrl,
      sourceObjectId: 'lokalhistoriewiki:voyenfallene',
      sourceQuality: 'corroborating_historical_scope',
      finding: 'Kilden støtter Vøyenfallene som et flerfalls- og industrihistorisk elvelandskap, ikke ett enkelt punkt.',
      canVerifyCoordinate: false,
      reason: 'Brukes som identitets- og scope-kryssjekk.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – Akerselva, Bentsebrua, Sannerbrua og tre waterfall-noder',
      sourceUrl,
      sourceObjectId,
      sourceQuality: 'explicit_multi_anchor_system_geometry',
      finding: `Akerselva way ${riverWayId} klippes mellom de eksakte navngitte broflatene Bentsebrua ${bentsebruaWayId} og Sannerbrua ${sannerbruaWayId}; nøyaktig tre waterfall-noder (${actualIds.join(', ')}) er medlemmer av samme elveway inne i intervallet.`,
      canVerifyCoordinate: true,
      reason: 'Geometrien representerer hele dokumenterte system-scope og lagrer alle tre fossankrene eksplisitt.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId, canApplyToPlace: true },
    ...fallAnchors.map((anchor) => ({ sourceProvider: 'osm', sourceObjectId: anchor.sourceObjectId, canApplyToPlace: true })),
  ],
  geometryCandidates: [
    { sourceProvider: 'osm', sourceObjectId, geometryRole: 'bridge_bounded_multi_fall_system', canApplyToPlace: true, segmentScope },
  ],
  coordinateCandidates: [
    { lat: fields.lat, lon: fields.lon, geocodeAccuracy: fields.geocodeAccuracy, coordRole: fields.coordRole, sourceObjectId, canApplyToPlace: true },
    ...fallAnchors.map((anchor) => ({ lat: anchor.lat, lon: anchor.lon, geocodeAccuracy: 'semantic_anchor', coordRole: 'waterfall_anchor', sourceObjectId: anchor.sourceObjectId, canApplyToPlace: true })),
  ],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Applied to canonical place.' },
  notes: [coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${date}`);
if (!protocol.includes(`| ${batch} | \`${placeId}\``)) {
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
  const insertion = `| 163 | \`${placeId}\` | Vøyenfallene | verified_geometry | \`${sourceObjectId}\` |\n\nBatch 163 (${date}) løser Vøyenfallene som et eksplisitt tre-fallsystem i stedet for ett tilfeldig foss-punkt. Fresh OSM way ${riverWayId} er den synlige Akerselva-geometrien mellom de eksakte navngitte broflatene Bentsebrua (way ${bentsebruaWayId}) og Sannerbrua (way ${sannerbruaWayId}), en strekning på ca. ${clippedLengthM.toFixed(1)} meter. Nøyaktig tre waterway=waterfall-noder (${actualIds.join(', ')}) er medlemmer av samme elveway strengt inne i intervallet og lagres som egne fossankre. Canonical lat/lon er et semantisk systemanker langs elva midt i spennvidden mellom første og siste fossanker; hele segmentet og alle tre fallene er bevart i scope-metadata.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex < 0) throw new Error('Fant ikke protokollinnsettingspunkt');
  protocol = `${protocol.slice(0, markerIndex)}${insertion}${protocol.slice(markerIndex)}`;
}
protocol = protocol.split('\n').filter((line) => !line.includes(`| \`${placeId}\` – Vøyenfallene | needs_review |`)).join('\n');
fs.writeFileSync(protocolFile, protocol);

writeJson(path.join(reportDir, 'batch-163-result.json'), {
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
  fallAnchors,
});
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 163 sources\n\n- Oslo byleksikon, Vøyenfallene: ${byleksikonUrl}\n- Lokalhistoriewiki, Vøyenfallene: ${lokalhistoriewikiUrl}\n- OpenStreetMap way ${riverWayId}: visible Akerselva system geometry.\n- OpenStreetMap way ${bentsebruaWayId}: exact named Bentsebrua bridge polygon.\n- OpenStreetMap way ${sannerbruaWayId}: exact named Sannerbrua bridge polygon.\n- OpenStreetMap waterfall nodes: ${actualIds.join(', ')}.\n- Research precursor: PR #3425.\n\nThe system is not collapsed to one waterfall point. No legacy-coordinate, nearest-object or first-hit selection is used.\n`);

console.log(JSON.stringify({
  batch,
  placeId,
  sourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: fields.lat, lon: fields.lon },
  clippedLengthM: Number(clippedLengthM.toFixed(1)),
  waterfallNodeIds: actualIds,
  fallAnchors,
}, null, 2));
