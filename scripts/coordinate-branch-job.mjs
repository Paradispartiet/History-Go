#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-162-hausmannsomradet-research');
fs.mkdirSync(reportDir, { recursive: true });

const riverWayId = 80915045;
const nybruaPolygonWayId = 315066295;
const hausmannPolygonWayId = 377766486;

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
  if (!row) throw new Error(`Missing way ${expectedId}`);
  const nodeIds = [...row.body.matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((match) => Number(parseAttrs(match[1]).ref));
  const tags = {};
  for (const match of row.body.matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.k != null) tags[attrs.k] = attrs.v ?? '';
  }
  const geometry = nodeIds.map((id) => nodes.get(id)).filter(Boolean);
  if (geometry.length !== nodeIds.length || geometry.length < 2) throw new Error(`Incomplete geometry for way ${expectedId}`);
  return { id: expectedId, nodeIds, tags, geometry };
}

async function fetchWay(wayId) {
  const url = `https://api.openstreetmap.org/api/0.6/way/${wayId}/full`;
  let lastError = null;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { Accept: 'application/xml', 'User-Agent': 'History-Go-coordinate-audit/1.0' } });
      if (!response.ok) lastError = new Error(`way ${wayId}: HTTP ${response.status}`);
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
  throw lastError || new Error(`Failed way ${wayId}`);
}

const [river, nybrua, hausmann] = await Promise.all([
  fetchWay(riverWayId),
  fetchWay(nybruaPolygonWayId),
  fetchWay(hausmannPolygonWayId),
]);
if (river.tags.name !== 'Akerselva' || river.tags.waterway !== 'river') throw new Error('River source mismatch');
if (nybrua.tags.name !== 'Nybrua' || nybrua.tags.man_made !== 'bridge') throw new Error('Nybrua named bridge polygon mismatch');
if (hausmann.tags.name !== 'Hausmanns bru' || hausmann.tags.man_made !== 'bridge') throw new Error('Hausmanns bru named bridge polygon mismatch');

const toRad = (v) => v * Math.PI / 180;
const R = 6371008.8;
function distance(a, b) {
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
  const polygon = polygonWay.geometry;
  const edges = [];
  for (let i = 0; i < polygon.length - 1; i += 1) edges.push([polygon[i], polygon[i + 1]]);
  if (polygon[0].id !== polygon.at(-1).id) edges.push([polygon.at(-1), polygon[0]]);

  const hits = [];
  let cumulative = 0;
  for (let i = 0; i < river.geometry.length - 1; i += 1) {
    const a = river.geometry[i]; const b = river.geometry[i + 1];
    const len = distance(a, b);
    for (let j = 0; j < edges.length; j += 1) {
      const hit = segmentIntersection(a, b, edges[j][0], edges[j][1]);
      if (!hit) continue;
      hits.push({ ...hit, measureM: cumulative + len * hit.riverT, riverSegmentIndex: i, polygonEdgeIndex: j });
    }
    cumulative += len;
  }
  const unique = hits
    .sort((a, b) => a.measureM - b.measureM)
    .filter((hit, index, all) => all.findIndex((other) => distance(hit, other) < 0.2) === index);
  if (unique.length !== 2) throw new Error(`${polygonWay.tags.name} must have exactly two river-boundary intersections; found ${unique.length}`);
  const midpointMeasureM = (unique[0].measureM + unique[1].measureM) / 2;
  return { entry: unique[0], exit: unique[1], midpointMeasureM, widthAlongRiverM: unique[1].measureM - unique[0].measureM };
}

function pointAtMeasure(targetM) {
  let cumulative = 0;
  for (let i = 0; i < river.geometry.length - 1; i += 1) {
    const a = river.geometry[i]; const b = river.geometry[i + 1];
    const len = distance(a, b);
    if (cumulative + len >= targetM) {
      const t = len === 0 ? 0 : (targetM - cumulative) / len;
      return { lat: a.lat + t * (b.lat - a.lat), lon: a.lon + t * (b.lon - a.lon) };
    }
    cumulative += len;
  }
  return river.geometry.at(-1);
}

const ny = polygonCrossing(nybrua);
const ha = polygonCrossing(hausmann);
const nyPoint = pointAtMeasure(ny.midpointMeasureM);
const haPoint = pointAtMeasure(ha.midpointMeasureM);
if (!nyPoint || !haPoint) throw new Error('Could not resolve bridge center points');
if (!(ny.midpointMeasureM < ha.midpointMeasureM)) throw new Error('Unexpected river order: Nybrua should be upstream of Hausmanns bru');
const segmentLengthM = ha.midpointMeasureM - ny.midpointMeasureM;
if (segmentLengthM < 250 || segmentLengthM > 500) throw new Error(`Unexpected Hausmannskvartal river-boundary length ${segmentLengthM.toFixed(1)} m`);
const midpointMeasureM = (ny.midpointMeasureM + ha.midpointMeasureM) / 2;
const midpoint = pointAtMeasure(midpointMeasureM);

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'hausmannsomradet_elvelop',
  river: { wayId: riverWayId, name: river.tags.name, waterway: river.tags.waterway },
  upstreamBoundary: {
    name: 'Nybrua',
    bridgePolygonWayId: nybruaPolygonWayId,
    polygonTags: nybrua.tags,
    riverBoundaryIntersections: [ny.entry, ny.exit],
    riverCrossingCenter: nyPoint,
    bridgeWidthAlongRiverM: Number(ny.widthAlongRiverM.toFixed(1)),
    measureM: Number(ny.midpointMeasureM.toFixed(1)),
  },
  downstreamBoundary: {
    name: 'Hausmanns bru',
    bridgePolygonWayId: hausmannPolygonWayId,
    polygonTags: hausmann.tags,
    riverBoundaryIntersections: [ha.entry, ha.exit],
    riverCrossingCenter: haPoint,
    bridgeWidthAlongRiverM: Number(ha.widthAlongRiverM.toFixed(1)),
    measureM: Number(ha.midpointMeasureM.toFixed(1)),
  },
  clippedSegment: {
    lengthM: Number(segmentLengthM.toFixed(1)),
    midpointMeasureM: Number(midpointMeasureM.toFixed(1)),
    midpoint,
  },
  decision: {
    canProduce: true,
    method: 'clipped_visible_river_geometry_between_exact_named_bridge_polygons',
    rationale: 'Both exact named bridge polygons intersect the same visible Akerselva way exactly twice; their river-crossing centers define deterministic physical brackets for the documented Akerselva boundary of Hausmannskvartalene.',
  },
};
fs.writeFileSync(path.join(reportDir, 'exact-bridge-polygon-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
