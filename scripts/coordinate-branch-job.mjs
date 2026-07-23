#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const batch = 160;
const date = '2026-07-23';
const placeId = 'elvestrekning_bla_brenneriveien';

const riverWayId = 80915045;
const upperCrossingWayId = 4826556; // Nordre gate / Grünerbrua crossing
const centerCrossingWayId = 4826555; // gangbro at Blå / Ingens gate
const lowerCrossingWayId = 4826553; // Elvebakken bru / gangbro
const ingensGateWayId = 4826554;
const blaNodeId = 4312299494;

const diagnosed = {
  upper: { lat: 59.921142237224046, lon: 10.7539976558539 },
  center: { lat: 59.91991456226684, lon: 10.753085997575697 },
  lower: { lat: 59.91942572237372, lon: 10.754529750518405 },
};

const aggregateFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json');
const childFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute/elvestrekning_bla_brenneriveien.json');
const indexFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json');
const manifestFile = path.join(root, 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json');
const evidenceFile = path.join(root, 'data/coordinate-evidence/oslo/natur/elvestrekning_bla_brenneriveien.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-160-akerselva-bla-brenneriveien');
fs.mkdirSync(reportDir, { recursive: true });

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function fetchOsm(pathname, label, reportName) {
  const url = `https://api.openstreetmap.org/api/0.6/${pathname}`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1',
          'User-Agent': 'History-Go-coordinate-audit/1.0',
        },
      });
      if (!response.ok) {
        lastError = new Error(`${label}: OSM API svarte HTTP ${response.status}`);
      } else {
        const xml = await response.text();
        fs.writeFileSync(path.join(reportDir, reportName), xml);
        return { url, xml };
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
  }
  throw lastError || new Error(`${label}: OSM API-oppslag feilet`);
}

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
    nodes.set(Number(attrs.id), {
      id: Number(attrs.id),
      lat: Number(attrs.lat),
      lon: Number(attrs.lon),
    });
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

const toRad = (value) => (value * Math.PI) / 180;
const earthRadiusM = 6371008.8;
function haversine(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusM * Math.asin(Math.min(1, Math.sqrt(h)));
}

const projectionLat = toRad(59.92);
const project = (p) => ({ x: p.lon * 111320 * Math.cos(projectionLat), y: p.lat * 110540 });
function segmentIntersection(a, b, c, d) {
  const A = project(a);
  const B = project(b);
  const C = project(c);
  const D = project(d);
  const rx = B.x - A.x;
  const ry = B.y - A.y;
  const sx = D.x - C.x;
  const sy = D.y - C.y;
  const denom = rx * sy - ry * sx;
  if (Math.abs(denom) < 1e-9) return null;
  const qpx = C.x - A.x;
  const qpy = C.y - A.y;
  const t = (qpx * sy - qpy * sx) / denom;
  const u = (qpx * ry - qpy * rx) / denom;
  if (t < -1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9) return null;
  return {
    lat: a.lat + t * (b.lat - a.lat),
    lon: a.lon + t * (b.lon - a.lon),
    riverT: t,
  };
}

function wayCoordinates(parsed, wayId) {
  const way = parsed.ways.get(wayId);
  if (!way) throw new Error(`Mangler OSM way ${wayId}`);
  const coords = way.nodeIds.map((id) => parsed.nodes.get(id)).filter(Boolean);
  if (coords.length !== way.nodeIds.length || coords.length < 2) throw new Error(`OSM way ${wayId} mangler full nodegeometri`);
  return { ...way, coords };
}

function findIntersections(riverCoords, crossingCoords) {
  const rows = [];
  let cumulative = 0;
  for (let i = 0; i < riverCoords.length - 1; i += 1) {
    const a = riverCoords[i];
    const b = riverCoords[i + 1];
    const segmentLength = haversine(a, b);
    for (let j = 0; j < crossingCoords.length - 1; j += 1) {
      const hit = segmentIntersection(a, b, crossingCoords[j], crossingCoords[j + 1]);
      if (!hit) continue;
      rows.push({
        ...hit,
        riverSegmentIndex: i,
        crossingSegmentIndex: j,
        measureM: cumulative + segmentLength * hit.riverT,
      });
    }
    cumulative += segmentLength;
  }
  const unique = [];
  for (const row of rows) {
    if (unique.some((other) => haversine(row, other) < 0.25)) continue;
    unique.push(row);
  }
  return unique;
}

function pointAtMeasure(coords, targetM) {
  let cumulative = 0;
  for (let i = 0; i < coords.length - 1; i += 1) {
    const a = coords[i];
    const b = coords[i + 1];
    const segmentLength = haversine(a, b);
    if (cumulative + segmentLength >= targetM) {
      const t = segmentLength === 0 ? 0 : (targetM - cumulative) / segmentLength;
      return { lat: a.lat + t * (b.lat - a.lat), lon: a.lon + t * (b.lon - a.lon) };
    }
    cumulative += segmentLength;
  }
  return coords.at(-1);
}

function pointToSegmentDistance(point, a, b) {
  const P = project(point);
  const A = project(a);
  const B = project(b);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const denom = dx * dx + dy * dy;
  const t = denom === 0 ? 0 : Math.max(0, Math.min(1, ((P.x - A.x) * dx + (P.y - A.y) * dy) / denom));
  const x = A.x + t * dx;
  const y = A.y + t * dy;
  return Math.hypot(P.x - x, P.y - y);
}

function pointToLineDistance(point, coords) {
  let best = Infinity;
  for (let i = 0; i < coords.length - 1; i += 1) best = Math.min(best, pointToSegmentDistance(point, coords[i], coords[i + 1]));
  return best;
}

const [riverRaw, upperRaw, centerRaw, lowerRaw, ingensRaw, blaRaw] = await Promise.all([
  fetchOsm(`way/${riverWayId}/full`, 'Akerselva-way', `osm-way-${riverWayId}-full.xml`),
  fetchOsm(`way/${upperCrossingWayId}/full`, 'Grünerbrua-kryssing', `osm-way-${upperCrossingWayId}-full.xml`),
  fetchOsm(`way/${centerCrossingWayId}/full`, 'Blå/Ingens gate-kryssing', `osm-way-${centerCrossingWayId}-full.xml`),
  fetchOsm(`way/${lowerCrossingWayId}/full`, 'Elvebakken bru-kryssing', `osm-way-${lowerCrossingWayId}-full.xml`),
  fetchOsm(`way/${ingensGateWayId}/full`, 'Ingens gate', `osm-way-${ingensGateWayId}-full.xml`),
  fetchOsm(`node/${blaNodeId}`, 'Blå-node', `osm-node-${blaNodeId}.xml`),
]);

const riverParsed = parseOsmXml(riverRaw.xml);
const river = wayCoordinates(riverParsed, riverWayId);
if (river.tags.name !== 'Akerselva' || river.tags.waterway !== 'river') throw new Error(`OSM way ${riverWayId} er ikke Akerselva waterway=river`);

const loadCrossing = (raw, wayId, label) => {
  const parsed = parseOsmXml(raw.xml);
  const way = wayCoordinates(parsed, wayId);
  if (way.tags.bridge !== 'yes') throw new Error(`${label} way ${wayId} er ikke bridge=yes`);
  const hits = findIntersections(river.coords, way.coords);
  if (hits.length !== 1) throw new Error(`${label} må krysse Akerselva way ${riverWayId} nøyaktig én gang; fant ${hits.length}`);
  return { way, hit: hits[0] };
};

const upper = loadCrossing(upperRaw, upperCrossingWayId, 'Grünerbrua/Nordre gate');
const center = loadCrossing(centerRaw, centerCrossingWayId, 'Gangbro ved Blå/Ingens gate');
const lower = loadCrossing(lowerRaw, lowerCrossingWayId, 'Elvebakken bru');
if (upper.way.tags.name !== 'Nordre gate') throw new Error(`Way ${upperCrossingWayId} matcher ikke Nordre gate-kryssingen`);

for (const [label, actual, expected] of [
  ['upper', upper.hit, diagnosed.upper],
  ['center', center.hit, diagnosed.center],
  ['lower', lower.hit, diagnosed.lower],
]) {
  const drift = haversine(actual, expected);
  if (drift > 25) throw new Error(`${label}-kryssingen har flyttet seg ${drift.toFixed(1)} m fra research-resultatet`);
}

const ingensParsed = parseOsmXml(ingensRaw.xml);
const ingens = wayCoordinates(ingensParsed, ingensGateWayId);
if (ingens.tags.name !== 'Ingens gate') throw new Error(`OSM way ${ingensGateWayId} er ikke Ingens gate`);
if (pointToLineDistance(center.hit, ingens.coords) > 20) throw new Error('Blå-gangbroen kan ikke lenger knyttes fysisk til Ingens gate-scope');

const blaParsed = parseOsmXml(blaRaw.xml);
const blaNode = blaParsed.nodes.get(blaNodeId);
if (!blaNode) throw new Error(`Mangler Blå node ${blaNodeId}`);
if (haversine(center.hit, blaNode) > 80) throw new Error('Blå-node ligger ikke lenger innenfor kontrollert center-crossing-scope');

const measures = [upper.hit.measureM, center.hit.measureM, lower.hit.measureM];
const increasing = measures[0] < measures[1] && measures[1] < measures[2];
const decreasing = measures[0] > measures[1] && measures[1] > measures[2];
if (!increasing && !decreasing) throw new Error(`Kryssingsrekkefølgen er ikke Grünerbrua -> Blå/Ingens gate -> Elvebakken bru`);

const startMeasureM = Math.min(upper.hit.measureM, lower.hit.measureM);
const endMeasureM = Math.max(upper.hit.measureM, lower.hit.measureM);
const clippedLengthM = endMeasureM - startMeasureM;
if (clippedLengthM < 220 || clippedLengthM > 360) throw new Error(`Klippet Akerselva-strekning har uventet lengde ${clippedLengthM.toFixed(1)} m`);
const midpointMeasureM = (startMeasureM + endMeasureM) / 2;
const midpoint = pointAtMeasure(river.coords, midpointMeasureM);
if (!midpoint) throw new Error('Kunne ikke beregne lengdemidtpunkt for klippet elvestrekning');

const sourceObjectId = `osm-way:${riverWayId}`;
const sourceUrl = `https://www.openstreetmap.org/way/${riverWayId}`;
const coordNote = `Batch 160 avgrenser Akerselva-strekningen ved Blå/Brenneriveien med eksplisitt fysisk bracket-topologi på fresh OSM way ${riverWayId}. Delstrekningen klippes mellom Grünerbrua/Nordre gate-kryssingen (way ${upperCrossingWayId}) og Elvebakken bru-kryssingen (way ${lowerCrossingWayId}); gangbroen ved Blå/Ingens gate (way ${centerCrossingWayId}) ligger strengt inne i intervallet og kryssjekkes mot Ingens gate way ${ingensGateWayId} og den allerede verifiserte Blå-node ${blaNodeId}. Canonical lat/lon er lengdemidtpunktet langs den klippede elvegeometrien, ikke sentrum av hele Akerselva-wayen og ikke et nearest/first-hit-resultat.`;

const segmentScope = {
  method: 'clipped_river_geometry_between_physical_crossings',
  riverWayId,
  upperCrossing: {
    name: 'Grünerbrua / Nordre gate',
    crossingWayId: upperCrossingWayId,
    lat: upper.hit.lat,
    lon: upper.hit.lon,
  },
  internalCrossing: {
    name: 'Gangbro ved Blå / Ingens gate',
    crossingWayId: centerCrossingWayId,
    ingensGateWayId,
    blaNodeId,
    lat: center.hit.lat,
    lon: center.hit.lon,
  },
  lowerCrossing: {
    name: 'Elvebakken bru',
    crossingWayId: lowerCrossingWayId,
    lat: lower.hit.lat,
    lon: lower.hit.lon,
  },
  clippedLengthM: Number(clippedLengthM.toFixed(1)),
};

const fields = {
  lat: midpoint.lat,
  lon: midpoint.lon,
  r: 130,
  locatorType: 'route',
  sourceProvider: 'osm',
  sourceObjectId,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'line_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `OpenStreetMap way ${riverWayId} – Akerselva clipped between Grünerbrua and Elvebakken bru`,
  coordSourceId: sourceObjectId,
  coordSourceUrl: sourceUrl,
  coordType: 'clipped_river_segment_anchor',
  coordVerifiedAt: date,
  coordNote,
};

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate) || aggregate.filter((place) => place?.id === placeId).length !== 1) throw new Error(`${placeId} må finnes nøyaktig én gang i aggregate`);
const oldPlace = aggregate.find((place) => place?.id === placeId);
const updatedAggregate = aggregate.map((place) => {
  if (place?.id !== placeId) return place;
  return {
    ...place,
    desc: 'Akerselva-strekningen mellom Grünerbrua og Elvebakken bru, med Blå og Ingens gate som et sentralt kultur- og bynaturpunkt langs elva.',
    sourceHint: 'Canonical scope er den fresh OSM-elvestrekningen som klippes mellom de fysiske kryssingene ved Grünerbrua og Elvebakken bru; Blå/Ingens gate-broen ligger inne i intervallet.',
    ...fields,
    segmentScope,
  };
});
const updatedPlace = updatedAggregate.find((place) => place?.id === placeId);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, updatedPlace);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} mangler i split-index`);
Object.assign(indexRow, {
  name: updatedPlace.name,
  lat: fields.lat,
  lon: fields.lon,
  r: fields.r,
  coordStatus: fields.coordStatus,
  coordType: fields.coordType,
  locatorType: fields.locatorType,
  sourceProvider: fields.sourceProvider,
  sourceObjectId: fields.sourceObjectId,
  geocodeAccuracy: fields.geocodeAccuracy,
  coordRole: fields.coordRole,
  coordSource: fields.coordSource,
  coordSourceId: fields.coordSourceId,
  coordSourceUrl: fields.coordSourceUrl,
  coordVerifiedAt: fields.coordVerifiedAt,
  coordNote: fields.coordNote,
});
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
    resolvedIdentity: 'Akerselva-strekningen mellom Grünerbrua og Elvebakken bru ved Blå/Brenneriveien',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'route',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – Akerselva og fysiske brokryssinger',
      sourceUrl,
      sourceObjectId,
      sourceQuality: 'explicit_clipped_route_geometry',
      finding: `Fresh OSM-geometri avgrenser Akerselva way ${riverWayId} mellom Grünerbrua/Nordre gate og Elvebakken bru, med gangbroen ved Blå/Ingens gate strengt inne i intervallet.`,
      canVerifyCoordinate: true,
      reason: 'Stedets lokale elvestrekning er avgrenset av to konkrete fysiske kryssinger og kryssjekket med et tredje internt Blå/Ingens gate-anker.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId,
      geometryRole: 'clipped_route_segment',
      canApplyToPlace: true,
      segmentScope,
    },
  ],
  coordinateCandidates: [
    {
      lat: fields.lat,
      lon: fields.lon,
      geocodeAccuracy: fields.geocodeAccuracy,
      coordRole: fields.coordRole,
      sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Applied to canonical place.',
  },
  notes: [coordNote],
});

let protocol = fs.readFileSync(protocolFile, 'utf8');
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${date}`);
protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
protocol = protocol
  .split('\n')
  .filter((line) => !line.includes(`| \`${placeId}\` –`))
  .join('\n');
const protocolInsertion = `| 160 | \`${placeId}\` | ${updatedPlace.name} | verified_geometry | \`${sourceObjectId}\` |\n\nBatch 160 (${date}) løser den lokalt definerte Akerselva-strekningen ved Blå/Brenneriveien med eksplisitt bracket-geometri i stedet for legacy-punkt eller nearest-søk. Fresh OSM way ${riverWayId} er Akerselva. Delstrekningen klippes mellom den fysiske Grünerbrua/Nordre gate-kryssingen (way ${upperCrossingWayId}) og Elvebakken bru-kryssingen (way ${lowerCrossingWayId}); gangbroen ved Blå/Ingens gate (way ${centerCrossingWayId}) ligger strengt inne i intervallet og kryssjekkes mot Ingens gate way ${ingensGateWayId} og Blå node ${blaNodeId}. Canonical lat/lon er det deterministiske lengdemidtpunktet langs den klippede ca. ${clippedLengthM.toFixed(1)} meter lange elvegeometrien. Hele 5,2 km-Akerselva-wayen brukes ikke som recordens scope, og legacy-koordinaten brukes ikke.\n\n`;
const marker = 'Retrospektiv compliance-audit batch 1–120';
const markerIndex = protocol.indexOf(marker);
if (markerIndex < 0) throw new Error('Fant ikke protokollinnsettingspunkt');
protocol = `${protocol.slice(0, markerIndex)}${protocolInsertion}${protocol.slice(markerIndex)}`;
fs.writeFileSync(protocolFile, protocol);

writeJson(path.join(reportDir, 'batch-160-result.json'), {
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

fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 160 sources\n\n- OpenStreetMap way ${riverWayId}: Akerselva source geometry.\n- OpenStreetMap way ${upperCrossingWayId}: Nordre gate bridge crossing used as the upper bracket (Grünerbrua scope).\n- OpenStreetMap way ${centerCrossingWayId}: physical gangbridge crossing at Blå / Ingens gate used as the mandatory internal bracket check.\n- OpenStreetMap way ${lowerCrossingWayId}: physical gangbridge crossing used as the lower bracket (Elvebakken bru scope).\n- OpenStreetMap way ${ingensGateWayId}: exact Ingens gate geometry used to confirm the internal crossing scope.\n- OpenStreetMap node ${blaNodeId}: already verified Blå POI used only as a scope crosscheck.\n- Research precursor: PR #3401 and its persisted batch-160 topology reports.\n\nNo legacy coordinate, nearest-object rule or first-hit selection is used.\n`);

console.log(JSON.stringify({
  batch,
  placeId,
  sourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: fields.lat, lon: fields.lon },
  clippedLengthM: Number(clippedLengthM.toFixed(1)),
  crossings: {
    upper: upper.hit,
    center: center.hit,
    lower: lower.hit,
  },
}, null, 2));
