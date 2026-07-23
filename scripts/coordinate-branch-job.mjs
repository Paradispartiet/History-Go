import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'reports/oslo-coordinate-control-batch-160-akerselva-bla-brenneriveien-research');
const BBOX = [59.918, 10.742, 59.928, 10.758];
fs.mkdirSync(REPORT_DIR, { recursive: true });

async function fetchJson(url, timeoutMs = 60000) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response.json();
}
function normalize(value = '') {
  return String(value).trim().toLocaleLowerCase('nb-NO');
}
function haversineM(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon), lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function lineLengthM(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += haversineM(points[i - 1], points[i]);
  return Number(total.toFixed(1));
}
function bbox(points) {
  if (!points.length) return null;
  return [Math.min(...points.map((p) => p.lat)), Math.max(...points.map((p) => p.lat)), Math.min(...points.map((p) => p.lon)), Math.max(...points.map((p) => p.lon))];
}
function centerOfGeometry(points) {
  if (!points.length) return null;
  return { lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length, lon: points.reduce((sum, p) => sum + p.lon, 0) / points.length };
}
function pointSegmentDistanceM(point, a, b) {
  const lat0 = ((point.lat + a.lat + b.lat) / 3) * Math.PI / 180;
  const x = (lon) => lon * 111320 * Math.cos(lat0);
  const y = (lat) => lat * 110540;
  const px = x(point.lon), py = y(point.lat), ax = x(a.lon), ay = y(a.lat), bx = x(b.lon), by = y(b.lat);
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function pointLineDistanceM(point, geometry) {
  if (!point || geometry.length < 2) return null;
  return Math.min(...geometry.slice(1).map((b, i) => pointSegmentDistanceM(point, geometry[i], b)));
}
function orientation(a, b, c) {
  const value = (b.lon - a.lon) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lon - a.lon);
  if (Math.abs(value) < 1e-12) return 0;
  return value > 0 ? 1 : -1;
}
function onSegment(a, b, c) {
  return b.lon >= Math.min(a.lon, c.lon) - 1e-12 && b.lon <= Math.max(a.lon, c.lon) + 1e-12 && b.lat >= Math.min(a.lat, c.lat) - 1e-12 && b.lat <= Math.max(a.lat, c.lat) + 1e-12;
}
function segmentsIntersect(a, b, c, d) {
  const o1 = orientation(a, b, c), o2 = orientation(a, b, d), o3 = orientation(c, d, a), o4 = orientation(c, d, b);
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(a, c, b)) return true;
  if (o2 === 0 && onSegment(a, d, b)) return true;
  if (o3 === 0 && onSegment(c, a, d)) return true;
  if (o4 === 0 && onSegment(c, b, d)) return true;
  return false;
}
function linesIntersect(a, b) {
  for (let i = 1; i < a.length; i += 1) {
    for (let j = 1; j < b.length; j += 1) {
      if (segmentsIntersect(a[i - 1], a[i], b[j - 1], b[j])) return true;
    }
  }
  return false;
}
function sharedNodeIds(a, b) {
  const bSet = new Set(b.nodeIds);
  return a.nodeIds.filter((id) => bSet.has(id));
}

const [south, west, north, east] = BBOX;
const query = `[out:json][timeout:45];(\n  way["name"="Akerselva"]["waterway"](${south},${west},${north},${east});\n  nwr["name"="Blå"](${south},${west},${north},${east});\n  way["name"="Brenneriveien"](${south},${west},${north},${east});\n  way["bridge"](${south},${west},${north},${east});\n);out center tags geom;`;
const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let raw = null;
let usedUrl = null;
const errors = [];
for (const endpoint of endpoints) {
  try {
    const url = `${endpoint}?data=${encodeURIComponent(query)}`;
    raw = await fetchJson(url);
    usedUrl = url;
    break;
  } catch (error) {
    errors.push(String(error));
  }
}
if (!raw) throw new Error(`Alle Overpass-endepunkter feilet: ${errors.join(' | ')}`);
fs.writeFileSync(path.join(REPORT_DIR, 'overpass-local-geometry.json'), `${JSON.stringify({ query, usedUrl, errors, raw }, null, 2)}\n`);

const all = (raw.elements || []).map((element) => {
  const geometry = (element.geometry || []).map((p) => ({ lat: p.lat, lon: p.lon }));
  return {
    osmType: element.type,
    osmId: element.id,
    tags: element.tags || {},
    nodeIds: (element.nodes || []).map(String),
    geometry,
    center: element.type === 'node' ? { lat: element.lat, lon: element.lon } : element.center || centerOfGeometry(geometry),
    boundingbox: bbox(geometry),
    lengthM: element.type === 'way' ? lineLengthM(geometry) : null,
  };
});
const rivers = all.filter((x) => x.osmType === 'way' && normalize(x.tags.name) === 'akerselva' && Boolean(x.tags.waterway));
const blaObjects = all.filter((x) => normalize(x.tags.name) === 'blå');
const brenneriveienWays = all.filter((x) => x.osmType === 'way' && normalize(x.tags.name) === 'brenneriveien');
const bridgeWays = all.filter((x) => x.osmType === 'way' && Boolean(x.tags.bridge));

const riverTopology = [];
for (let i = 0; i < rivers.length; i += 1) {
  for (let j = i + 1; j < rivers.length; j += 1) {
    const shared = sharedNodeIds(rivers[i], rivers[j]);
    riverTopology.push({ wayA: rivers[i].osmId, wayB: rivers[j].osmId, sharedNodeIds: shared, directlyConnected: shared.length > 0 });
  }
}
const bridgeCrossings = [];
for (const bridge of bridgeWays) {
  for (const river of rivers) {
    const shared = sharedNodeIds(bridge, river);
    const geometricIntersection = bridge.geometry.length >= 2 && river.geometry.length >= 2 ? linesIntersect(bridge.geometry, river.geometry) : false;
    if (shared.length || geometricIntersection) {
      bridgeCrossings.push({
        bridgeWayId: bridge.osmId,
        bridgeTags: bridge.tags,
        riverWayId: river.osmId,
        sharedNodeIds: shared,
        geometricIntersection,
      });
    }
  }
}
const blaRiverDistances = [];
for (const bla of blaObjects) {
  for (const river of rivers) {
    blaRiverDistances.push({
      blaOsmType: bla.osmType,
      blaOsmId: bla.osmId,
      blaTags: bla.tags,
      riverWayId: river.osmId,
      distanceM: bla.center ? Number(pointLineDistanceM(bla.center, river.geometry).toFixed(1)) : null,
    });
  }
}
const streetRiverRelations = [];
for (const street of brenneriveienWays) {
  for (const river of rivers) {
    streetRiverRelations.push({
      streetWayId: street.osmId,
      riverWayId: river.osmId,
      sharedNodeIds: sharedNodeIds(street, river),
      geometricIntersection: street.geometry.length >= 2 && river.geometry.length >= 2 ? linesIntersect(street.geometry, river.geometry) : false,
      streetCenterDistanceToRiverM: street.center ? Number(pointLineDistanceM(street.center, river.geometry).toFixed(1)) : null,
    });
  }
}

const nominatimQueries = ['Blå, Brenneriveien, Oslo, Norway', 'Brenneriveien, Oslo, Norway'];
const nominatim = [];
for (let i = 0; i < nominatimQueries.length; i += 1) {
  const q = nominatimQueries[i];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${west},${north},${east},${south}&bounded=1`;
  const results = await fetchJson(url, 45000);
  nominatim.push({ query: q, url, results });
  fs.writeFileSync(path.join(REPORT_DIR, `nominatim-${i + 1}.json`), `${JSON.stringify({ query: q, url, results }, null, 2)}\n`);
}

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'elvestrekning_bla_brenneriveien',
  proposedResolvedIdentity: 'Konkret Akerselva-strekning i Blå/Brenneriveien-korridoren, avgrenset med fysisk lokal topologi',
  bbox: BBOX,
  riverWayCount: rivers.length,
  rivers: rivers.map((r) => ({ osmId: r.osmId, tags: r.tags, nodeIds: r.nodeIds, lengthM: r.lengthM, center: r.center, boundingbox: r.boundingbox, geometry: r.geometry })),
  blaObjectCount: blaObjects.length,
  blaObjects: blaObjects.map((b) => ({ osmType: b.osmType, osmId: b.osmId, tags: b.tags, center: b.center, boundingbox: b.boundingbox, geometry: b.geometry })),
  brenneriveienWayCount: brenneriveienWays.length,
  brenneriveienWays: brenneriveienWays.map((w) => ({ osmId: w.osmId, tags: w.tags, nodeIds: w.nodeIds, center: w.center, boundingbox: w.boundingbox, lengthM: w.lengthM, geometry: w.geometry })),
  riverTopology,
  bridgeCrossings,
  blaRiverDistances,
  streetRiverRelations,
  nominatimSearches: nominatim.map((item) => ({ query: item.query, candidates: item.results.map((r) => ({ osmType: r.osm_type, osmId: r.osm_id, name: r.name || r.namedetails?.name || null, category: r.category, type: r.type, lat: r.lat ? Number(r.lat) : null, lon: r.lon ? Number(r.lon) : null, displayName: r.display_name })) })),
  sourceContext: {
    legacyCoordinateUsedForSelection: false,
    nearestFirstHitAllowed: false,
    selectionRule: 'Research must identify the river segment through exact Blå/Brenneriveien physical scope and/or explicit crossing topology; raw minimum distance is reported only diagnostically and must not be the production selection rule.',
  },
  nextAction: 'Inspect whether one exact Akerselva way is uniquely bracketed by documented local crossings or contained in the physical Blå/Brenneriveien corridor. If not, build an explicit connected multi-way segment instead of choosing a nearest river way.',
};
fs.writeFileSync(path.join(REPORT_DIR, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'compact-summary.json'), `${JSON.stringify({
  generatedAt: summary.generatedAt,
  placeId: summary.placeId,
  riverWays: summary.rivers.map((r) => ({ osmId: r.osmId, tags: r.tags, lengthM: r.lengthM, center: r.center, boundingbox: r.boundingbox })),
  blaObjects: summary.blaObjects.map((b) => ({ osmType: b.osmType, osmId: b.osmId, tags: b.tags, center: b.center, boundingbox: b.boundingbox })),
  brenneriveienWays: summary.brenneriveienWays.map((w) => ({ osmId: w.osmId, tags: w.tags, center: w.center, boundingbox: w.boundingbox, lengthM: w.lengthM })),
  riverTopology,
  bridgeCrossings,
  blaRiverDistances,
  streetRiverRelations,
  nextAction: summary.nextAction,
}, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'sources.md'), `# Batch 160 research – Akerselva ved Blå/Brenneriveien\n\n- Fresh bounded OSM audit for exact Akerselva waterway ways.\n- Fresh exact Blå object audit.\n- Fresh exact Brenneriveien way audit.\n- Fresh bridge-way geometry and river-crossing topology audit.\n- Bounded Nominatim searches are retained only for identity/context diagnostics.\n\nThe legacy History Go coordinate is not used for selection. Minimum-distance values are diagnostic only and cannot be used as nearest/first-hit production logic.\n`);

console.log(JSON.stringify({
  status: 'research_complete',
  riverWayCount: rivers.length,
  blaObjectCount: blaObjects.length,
  brenneriveienWayCount: brenneriveienWays.length,
  bridgeCrossingCount: bridgeCrossings.length,
  report: path.relative(ROOT, path.join(REPORT_DIR, 'compact-summary.json')),
}, null, 2));
