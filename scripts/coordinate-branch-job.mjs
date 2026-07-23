#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const placeId = 'fossveien_elvestrekning';
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-161-fossveien-research');
fs.mkdirSync(reportDir, { recursive: true });

const center = { lat: 59.9223, lon: 10.7532 };
const endpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function fetchJson(url, label, headers = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'History-Go-coordinate-audit/1.0',
      ...headers,
    },
  });
  if (!response.ok) throw new Error(`${label}: HTTP ${response.status}`);
  return response.json();
}

async function runOverpass(query) {
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const payload = await fetchJson(`${endpoint}?data=${encodeURIComponent(query)}`, `Overpass ${endpoint}`);
      return { endpoint, payload };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('All Overpass endpoints failed');
}

const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
nominatimUrl.searchParams.set('format', 'jsonv2');
nominatimUrl.searchParams.set('q', 'Fossveien, Oslo, Norway');
nominatimUrl.searchParams.set('limit', '20');
nominatimUrl.searchParams.set('polygon_geojson', '1');
nominatimUrl.searchParams.set('addressdetails', '1');
nominatimUrl.searchParams.set('namedetails', '1');
nominatimUrl.searchParams.set('viewbox', '10.745,59.928,10.761,59.916');
nominatimUrl.searchParams.set('bounded', '1');
const nominatim = await fetchJson(nominatimUrl.toString(), 'Nominatim Fossveien');
fs.writeFileSync(path.join(reportDir, 'nominatim-fossveien.json'), `${JSON.stringify(nominatim, null, 2)}\n`);

const query = `[out:json][timeout:30];(
  way["name"="Fossveien"](around:1800,${center.lat},${center.lon});
  way["name"="Akerselva"]["waterway"="river"](around:2200,${center.lat},${center.lon});
  way["bridge"="yes"](around:1600,${center.lat},${center.lon});
  way["name"="Nedre Foss"](around:1200,${center.lat},${center.lon});
);out body geom;`;
const overpass = await runOverpass(query);
fs.writeFileSync(path.join(reportDir, 'overpass-local-geometry.json'), `${JSON.stringify(overpass, null, 2)}\n`);

const elements = Array.isArray(overpass.payload?.elements) ? overpass.payload.elements : [];
const ways = elements.filter((element) => element?.type === 'way' && Array.isArray(element.geometry));
const fossil = ways.filter((way) => way?.tags?.name === 'Fossveien');
const riverWays = ways.filter((way) => way?.tags?.name === 'Akerselva' && way?.tags?.waterway === 'river');
const bridges = ways.filter((way) => way?.tags?.bridge === 'yes');

const toRad = (value) => (value * Math.PI) / 180;
const projectionLat = toRad(center.lat);
const project = (p) => ({ x: p.lon * 111320 * Math.cos(projectionLat), y: p.lat * 110540 });
const earthRadiusM = 6371008.8;
const haversine = (a, b) => {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusM * Math.asin(Math.min(1, Math.sqrt(h)));
};

function intersection(a, b, c, d) {
  const A = project(a); const B = project(b); const C = project(c); const D = project(d);
  const rx = B.x - A.x; const ry = B.y - A.y; const sx = D.x - C.x; const sy = D.y - C.y;
  const denom = rx * sy - ry * sx;
  if (Math.abs(denom) < 1e-9) return null;
  const qpx = C.x - A.x; const qpy = C.y - A.y;
  const t = (qpx * sy - qpy * sx) / denom;
  const u = (qpx * ry - qpy * rx) / denom;
  if (t < -1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9) return null;
  return { lat: a.lat + t * (b.lat - a.lat), lon: a.lon + t * (b.lon - a.lon), t };
}

function lineIntersections(left, right) {
  const hits = [];
  let cumulative = 0;
  for (let i = 0; i < left.geometry.length - 1; i += 1) {
    const a = left.geometry[i]; const b = left.geometry[i + 1];
    const segmentLength = haversine(a, b);
    for (let j = 0; j < right.geometry.length - 1; j += 1) {
      const hit = intersection(a, b, right.geometry[j], right.geometry[j + 1]);
      if (!hit) continue;
      hits.push({ ...hit, leftMeasureM: cumulative + segmentLength * hit.t, leftSegmentIndex: i, rightSegmentIndex: j });
    }
    cumulative += segmentLength;
  }
  return hits.filter((hit, index, all) => all.findIndex((other) => haversine(hit, other) < 0.3) === index);
}

function pointSegmentDistance(point, a, b) {
  const P = project(point); const A = project(a); const B = project(b);
  const dx = B.x - A.x; const dy = B.y - A.y;
  const denom = dx * dx + dy * dy;
  const t = denom === 0 ? 0 : Math.max(0, Math.min(1, ((P.x - A.x) * dx + (P.y - A.y) * dy) / denom));
  return Math.hypot(P.x - (A.x + t * dx), P.y - (A.y + t * dy));
}

function lineDistance(left, right) {
  let best = Infinity;
  for (const p of left.geometry) {
    for (let i = 0; i < right.geometry.length - 1; i += 1) best = Math.min(best, pointSegmentDistance(p, right.geometry[i], right.geometry[i + 1]));
  }
  for (const p of right.geometry) {
    for (let i = 0; i < left.geometry.length - 1; i += 1) best = Math.min(best, pointSegmentDistance(p, left.geometry[i], left.geometry[i + 1]));
  }
  return best;
}

const bridgeCrossings = [];
for (const river of riverWays) {
  for (const bridge of bridges) {
    const hits = lineIntersections(river, bridge);
    if (!hits.length) continue;
    bridgeCrossings.push({
      riverWayId: river.id,
      bridgeWayId: bridge.id,
      bridgeTags: bridge.tags || {},
      intersections: hits,
    });
  }
}

const fossveienToRiver = [];
for (const street of fossil) {
  for (const river of riverWays) {
    fossveienToRiver.push({
      fossveienWayId: street.id,
      riverWayId: river.id,
      distanceM: Number(lineDistance(street, river).toFixed(1)),
      directIntersections: lineIntersections(river, street),
      fossveienTags: street.tags || {},
    });
  }
}

const readPlace = (name) => JSON.parse(fs.readFileSync(path.join(root, `data/places/natur/oslo/places_oslo_natur_akerselvarute/${name}.json`), 'utf8'));
const adjacentCanonical = ['nedre_foss', 'kuba_parken', 'elvestrekning_bla_brenneriveien'].map((id) => {
  const p = readPlace(id);
  return { id: p.id, name: p.name, lat: p.lat, lon: p.lon, coordStatus: p.coordStatus, sourceObjectId: p.sourceObjectId || null };
});

const summary = {
  generatedAt: new Date().toISOString(),
  placeId,
  overpassEndpoint: overpass.endpoint,
  nominatimResults: nominatim.map((row) => ({
    osm_type: row.osm_type,
    osm_id: row.osm_id,
    category: row.category,
    type: row.type,
    name: row.name,
    display_name: row.display_name,
    boundingbox: row.boundingbox,
    geojson: row.geojson,
  })),
  fossveienWays: fossil.map((way) => ({ id: way.id, tags: way.tags || {}, geometry: way.geometry })),
  riverWays: riverWays.map((way) => ({ id: way.id, tags: way.tags || {}, geometry: way.geometry })),
  bridgeCrossings,
  fossveienToRiver,
  adjacentCanonical,
  interpretationRule: 'Research only. Distances are diagnostics and must not be used as nearest/first-hit selection. Production requires a source-backed Fossveien scope and explicit physical river bracket or connected geometry.',
};
fs.writeFileSync(path.join(reportDir, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);

console.log(JSON.stringify({
  placeId,
  nominatimCount: nominatim.length,
  fossveienWayIds: fossil.map((way) => way.id),
  riverWayIds: riverWays.map((way) => way.id),
  crossingCount: bridgeCrossings.length,
  fossveienToRiver: fossveienToRiver.map(({ fossveienWayId, riverWayId, distanceM, directIntersections }) => ({ fossveienWayId, riverWayId, distanceM, directIntersectionCount: directIntersections.length })),
}, null, 2));
