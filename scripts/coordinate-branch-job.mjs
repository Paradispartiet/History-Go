#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-162-hausmannsomradet-research');
fs.mkdirSync(reportDir, { recursive: true });

const center = { lat: 59.9149, lon: 10.7560 };
const endpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function fetchJson(url, label) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'History-Go-coordinate-audit/1.0' },
  });
  if (!response.ok) throw new Error(`${label}: HTTP ${response.status}`);
  return response.json();
}

async function nominatim(q, name) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '20');
  url.searchParams.set('polygon_geojson', '1');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('viewbox', '10.749,59.920,10.763,59.910');
  url.searchParams.set('bounded', '1');
  const payload = await fetchJson(url.toString(), `Nominatim ${name}`);
  fs.writeFileSync(path.join(reportDir, `nominatim-${name}.json`), `${JSON.stringify(payload, null, 2)}\n`);
  return payload;
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

const [hausmannNominatim, nybruaNominatim] = await Promise.all([
  nominatim('Hausmanns bru, Oslo, Norway', 'hausmanns-bru'),
  nominatim('Nybrua, Oslo, Norway', 'nybrua'),
]);

const query = `[out:json][timeout:30];(
  way["name"="Akerselva"]["waterway"="river"](around:1600,${center.lat},${center.lon});
  way["bridge"="yes"]["name"="Hausmanns gate"](around:1000,${center.lat},${center.lon});
  way["bridge"="yes"]["name"="Hausmanns bru"](around:1000,${center.lat},${center.lon});
  way["bridge"="yes"]["name"="Storgata"](around:1000,${center.lat},${center.lon});
  way["bridge"="yes"]["name"="Nybrua"](around:1000,${center.lat},${center.lon});
  way["bridge"="yes"](around:900,${center.lat},${center.lon});
);out body geom;`;
const result = await runOverpass(query);
fs.writeFileSync(path.join(reportDir, 'overpass-local-geometry.json'), `${JSON.stringify(result, null, 2)}\n`);

const ways = (result.payload?.elements || []).filter((e) => e?.type === 'way' && Array.isArray(e.geometry));
const rivers = ways.filter((w) => w?.tags?.name === 'Akerselva' && w?.tags?.waterway === 'river');
const bridges = ways.filter((w) => w?.tags?.bridge === 'yes');

const toRad = (v) => v * Math.PI / 180;
const R = 6371008.8;
function haversine(a, b) {
  const dLat = toRad(b.lat - a.lat); const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat); const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
const projectionLat = toRad(center.lat);
const project = (p) => ({ x: p.lon * 111320 * Math.cos(projectionLat), y: p.lat * 110540 });
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
function intersections(river, bridge) {
  const hits = [];
  let measure = 0;
  for (let i = 0; i < river.geometry.length - 1; i += 1) {
    const a = river.geometry[i]; const b = river.geometry[i + 1];
    const len = haversine(a, b);
    for (let j = 0; j < bridge.geometry.length - 1; j += 1) {
      const hit = intersection(a, b, bridge.geometry[j], bridge.geometry[j + 1]);
      if (!hit) continue;
      hits.push({ ...hit, measureM: measure + len * hit.t, riverSegmentIndex: i, bridgeSegmentIndex: j });
    }
    measure += len;
  }
  return hits.filter((hit, index, all) => all.findIndex((other) => haversine(hit, other) < 0.25) === index);
}

const crossingRows = [];
for (const river of rivers) {
  for (const bridge of bridges) {
    const hits = intersections(river, bridge);
    if (!hits.length) continue;
    crossingRows.push({
      riverWayId: river.id,
      riverTags: river.tags || {},
      bridgeWayId: bridge.id,
      bridgeTags: bridge.tags || {},
      intersections: hits,
    });
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'hausmannsomradet_elvelop',
  overpassEndpoint: result.endpoint,
  nominatim: {
    hausmannsBru: hausmannNominatim.map((r) => ({ osm_type: r.osm_type, osm_id: r.osm_id, name: r.name, display_name: r.display_name, category: r.category, type: r.type, geojson: r.geojson })),
    nybrua: nybruaNominatim.map((r) => ({ osm_type: r.osm_type, osm_id: r.osm_id, name: r.name, display_name: r.display_name, category: r.category, type: r.type, geojson: r.geojson })),
  },
  rivers: rivers.map((w) => ({ id: w.id, tags: w.tags || {}, geometry: w.geometry })),
  bridgeCandidates: bridges.map((w) => ({ id: w.id, tags: w.tags || {}, geometry: w.geometry })),
  crossingRows,
  interpretationRule: 'Research only. Production requires one explicit Hausmanns bru crossing and one explicit Nybrua/Storgata crossing on the same continuous visible Akerselva geometry, matching the documented Hausmannskvartalene boundary. No nearest or first-hit selection.',
};
fs.writeFileSync(path.join(reportDir, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);

console.log(JSON.stringify({
  riverWayIds: rivers.map((w) => w.id),
  bridgeCandidates: bridges.map((w) => ({ id: w.id, name: w.tags?.name || null, highway: w.tags?.highway || null })),
  crossingRows: crossingRows.map((row) => ({ riverWayId: row.riverWayId, bridgeWayId: row.bridgeWayId, bridgeName: row.bridgeTags?.name || null, count: row.intersections.length, intersections: row.intersections })),
}, null, 2));
