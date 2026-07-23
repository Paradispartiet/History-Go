#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-163-voyenfallene-research');
fs.mkdirSync(reportDir, { recursive: true });

const riverWayId = 80915045;
const bentsebruaWayId = 381743815;
const sannerbruaWayId = 381749952;
const waterfallNodeIds = [7876345836, 10820084635, 5169533163];

function parseAttrs(text) {
  const attrs = {};
  for (const match of text.matchAll(/([A-Za-z0-9_:-]+)="([^"]*)"/g)) attrs[match[1]] = match[2];
  return attrs;
}

function parseOsmXml(xml) {
  const nodes = new Map();
  for (const match of xml.matchAll(/<node\b([^>]*)>([\s\S]*?)<\/node>|<node\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1] || match[3] || '');
    if (!attrs.id || attrs.lat == null || attrs.lon == null) continue;
    const body = match[2] || '';
    const tags = {};
    for (const tag of body.matchAll(/<tag\b([^>]*)\/?\s*>/g)) {
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

const [riverParsed, bentseParsed, sannerParsed, ...nodePayloads] = await Promise.all([
  fetchOsm(`way/${riverWayId}/full`, `osm-way-${riverWayId}-full.xml`),
  fetchOsm(`way/${bentsebruaWayId}/full`, `osm-way-${bentsebruaWayId}-full.xml`),
  fetchOsm(`way/${sannerbruaWayId}/full`, `osm-way-${sannerbruaWayId}-full.xml`),
  ...waterfallNodeIds.map((id) => fetchOsm(`node/${id}`, `osm-node-${id}.xml`)),
]);

function fullWay(parsed, wayId) {
  const way = parsed.ways.get(wayId);
  if (!way) throw new Error(`Missing way ${wayId}`);
  const geometry = way.nodeIds.map((id) => parsed.nodes.get(id)).filter(Boolean);
  if (geometry.length !== way.nodeIds.length || geometry.length < 2) throw new Error(`Incomplete geometry for way ${wayId}`);
  return { ...way, geometry };
}

const river = fullWay(riverParsed, riverWayId);
const bentse = fullWay(bentseParsed, bentsebruaWayId);
const sanner = fullWay(sannerParsed, sannerbruaWayId);
if (river.tags.name !== 'Akerselva' || river.tags.waterway !== 'river') throw new Error('River identity mismatch');
if (bentse.tags.name !== 'Bentsebrua' || bentse.tags.man_made !== 'bridge') throw new Error('Bentsebrua polygon mismatch');
if (sanner.tags.name !== 'Sannerbrua' || sanner.tags.man_made !== 'bridge') throw new Error('Sannerbrua polygon mismatch');

const waterfallNodes = waterfallNodeIds.map((id, index) => {
  const node = nodePayloads[index].nodes.get(id);
  if (!node) throw new Error(`Missing waterfall node ${id}`);
  if (node.tags.waterway !== 'waterfall') throw new Error(`Node ${id} is not waterway=waterfall`);
  return node;
});

const toRad = (v) => v * Math.PI / 180;
const R = 6371008.8;
function distance(a, b) {
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
    const len = distance(a, b);
    for (let j = 0; j < edges.length; j += 1) {
      const hit = segmentIntersection(a, b, edges[j][0], edges[j][1]);
      if (!hit) continue;
      hits.push({ ...hit, measureM: cumulative + len * hit.riverT, riverSegmentIndex: i, polygonEdgeIndex: j });
    }
    cumulative += len;
  }
  const unique = hits.sort((a, b) => a.measureM - b.measureM).filter((hit, index, all) => all.findIndex((other) => distance(hit, other) < 0.2) === index);
  if (unique.length !== 2) throw new Error(`${polygonWay.tags.name} must intersect river polygon boundary exactly twice; found ${unique.length}`);
  return { entry: unique[0], exit: unique[1], measureM: (unique[0].measureM + unique[1].measureM) / 2, widthAlongRiverM: unique[1].measureM - unique[0].measureM };
}

function measureForNode(nodeId) {
  const index = river.nodeIds.indexOf(nodeId);
  if (index < 0) return null;
  let measureM = 0;
  for (let i = 0; i < index; i += 1) measureM += distance(river.geometry[i], river.geometry[i + 1]);
  return measureM;
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

const bentseCrossing = polygonCrossing(bentse);
const sannerCrossing = polygonCrossing(sanner);
const upstream = Math.min(bentseCrossing.measureM, sannerCrossing.measureM) === bentseCrossing.measureM ? bentseCrossing : sannerCrossing;
const downstream = upstream === bentseCrossing ? sannerCrossing : bentseCrossing;
const upstreamName = upstream === bentseCrossing ? 'Bentsebrua' : 'Sannerbrua';
const downstreamName = downstream === bentseCrossing ? 'Bentsebrua' : 'Sannerbrua';
const clippedLengthM = downstream.measureM - upstream.measureM;
if (clippedLengthM < 700 || clippedLengthM > 1300) throw new Error(`Unexpected bridge-bounded system length ${clippedLengthM.toFixed(1)} m`);

const anchors = waterfallNodes.map((node) => ({
  nodeId: node.id,
  lat: node.lat,
  lon: node.lon,
  measureM: measureForNode(node.id),
}));
if (anchors.some((anchor) => anchor.measureM == null)) throw new Error('At least one candidate waterfall node is not a node of the selected Akerselva way');
anchors.sort((a, b) => a.measureM - b.measureM);
if (anchors.some((anchor) => anchor.measureM <= upstream.measureM || anchor.measureM >= downstream.measureM)) {
  throw new Error('At least one waterfall anchor lies outside the Bentsebrua–Sannerbrua system interval');
}
if (new Set(anchors.map((anchor) => anchor.nodeId)).size !== 3) throw new Error('Expected exactly three distinct waterfall anchors');

const midpointMeasureM = (upstream.measureM + downstream.measureM) / 2;
const midpoint = pointAtMeasure(midpointMeasureM);

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'voienfossen',
  river: { wayId: riverWayId, name: river.tags.name, waterway: river.tags.waterway },
  upstreamBoundary: {
    name: upstreamName,
    bridgePolygonWayId: upstreamName === 'Bentsebrua' ? bentsebruaWayId : sannerbruaWayId,
    crossingCenter: pointAtMeasure(upstream.measureM),
    measureM: Number(upstream.measureM.toFixed(1)),
    widthAlongRiverM: Number(upstream.widthAlongRiverM.toFixed(1)),
  },
  downstreamBoundary: {
    name: downstreamName,
    bridgePolygonWayId: downstreamName === 'Bentsebrua' ? bentsebruaWayId : sannerbruaWayId,
    crossingCenter: pointAtMeasure(downstream.measureM),
    measureM: Number(downstream.measureM.toFixed(1)),
    widthAlongRiverM: Number(downstream.widthAlongRiverM.toFixed(1)),
  },
  waterfallAnchors: anchors.map((anchor, index) => ({
    order: index + 1,
    sourceObjectId: `osm-node:${anchor.nodeId}`,
    nodeId: anchor.nodeId,
    lat: anchor.lat,
    lon: anchor.lon,
    measureM: Number(anchor.measureM.toFixed(1)),
    distanceFromPreviousM: index === 0 ? null : Number((anchor.measureM - anchors[index - 1].measureM).toFixed(1)),
  })),
  clippedSystem: {
    lengthM: Number(clippedLengthM.toFixed(1)),
    midpointMeasureM: Number(midpointMeasureM.toFixed(1)),
    midpoint,
  },
  decision: {
    canProduce: true,
    method: 'bridge_bounded_river_geometry_with_three_explicit_waterfall_node_anchors',
    rationale: 'The exact named Bentsebrua and Sannerbrua bridge polygons bracket one continuous Akerselva way, and exactly three waterway=waterfall nodes are members of that same river way strictly inside the interval. The geometry therefore matches the documented three-fall system scope without collapsing it to a single fall point.',
  },
};

fs.writeFileSync(path.join(reportDir, 'three-fall-topology-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
