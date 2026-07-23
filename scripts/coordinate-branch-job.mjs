#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'reports/oslo-coordinate-control-batch-167-haugerudparken-topology-research');
fs.mkdirSync(dir, { recursive: true });
const candidateIds = [318203810, 1277898087, 1277898090];
const UA = 'History-Go-coordinate-control/1.0';

function attrs(text) {
  return Object.fromEntries([...text.matchAll(/([:\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
}
function parseWay(xml, id) {
  const nodes = new Map();
  for (const m of xml.matchAll(/<node\b([^>]*)\/?\s*>/g)) {
    const a = attrs(m[1]);
    if (a.id && a.lat && a.lon) nodes.set(a.id, { lat: Number(a.lat), lon: Number(a.lon) });
  }
  const way = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)].find((m) => attrs(m[1]).id === String(id));
  if (!way) throw new Error(`Missing way ${id}`);
  const refs = [...way[2].matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((m) => attrs(m[1]).ref).filter(Boolean);
  const tags = Object.fromEntries([...way[2].matchAll(/<tag\b([^>]*)\/?\s*>/g)].map((m) => attrs(m[1])).map((a) => [a.k, a.v || '']));
  const points = refs.map((ref) => nodes.get(ref));
  if (points.some((p) => !p) || refs[0] !== refs[refs.length - 1]) throw new Error(`Incomplete/nonclosed way ${id}`);
  return { id, refs, tags, points };
}
function metrics(points) {
  const lat0 = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const mLat = 111320;
  const mLon = 111320 * Math.cos(lat0 * Math.PI / 180);
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = points[i].lon * mLon, y1 = points[i].lat * mLat;
    const x2 = points[i + 1].lon * mLon, y2 = points[i + 1].lat * mLat;
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  const areaM2 = Math.abs(twiceArea) / 2;
  if (Math.abs(twiceArea) < 1e-9) throw new Error('Degenerate polygon');
  return { areaM2, centroid: { lat: (cy / (3 * twiceArea)) / mLat, lon: (cx / (3 * twiceArea)) / mLon } };
}
async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${r.status} for ${url}`);
  return await r.text();
}

const parkCandidates = [];
for (const id of candidateIds) {
  const xml = await get(`https://api.openstreetmap.org/api/0.6/way/${id}/full`);
  fs.writeFileSync(path.join(dir, `osm-way-${id}-full.xml`), xml);
  const way = parseWay(xml, id);
  parkCandidates.push({ osmWayId: id, tags: way.tags, nodeCount: way.points.length, ...metrics(way.points) });
}

const q = '[out:json][timeout:25];nwr["name"="Haugerud kirke"](59.915,10.855,59.930,10.875);out tags center;';
const overpass = await get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`);
const churchData = JSON.parse(overpass);
const churches = (churchData.elements || []).map((e) => ({
  type: e.type,
  id: e.id,
  tags: e.tags || {},
  center: e.center || (e.lat !== undefined ? { lat: e.lat, lon: e.lon } : null),
})).filter((e) => e.center);
if (churches.length < 1) throw new Error('Could not resolve Haugerud kirke topology anchor');
const church = churches.sort((a, b) => Number(Boolean(b.tags.amenity === 'place_of_worship')) - Number(Boolean(a.tags.amenity === 'place_of_worship')))[0];

const matching = parkCandidates.filter((c) =>
  c.tags.leisure === 'park'
  && c.areaM2 >= 10000
  && c.areaM2 <= 14000
  && c.centroid.lat < church.center.lat
);
const selected = matching.length === 1 ? matching[0] : null;
const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'furuset_haugerud_skogbelte',
  proposedIdentity: 'Haugerudparken',
  independentSourceConstraints: {
    officialAreaSize: '12 daa (Norske landskapsarkitekters forening / project page)',
    officialTopology: 'south of Haugerud church (Oslo byleksikon)',
  },
  church,
  parkCandidates,
  matchingCandidateCount: matching.length,
  matching,
  selected,
  productionReady: Boolean(selected),
  decisionRule: 'Select only if exactly one bounded leisure=park polygon is 10–14 daa and lies south of the exact Haugerud kirke anchor. Distance to the legacy point is not used.',
};
fs.writeFileSync(path.join(dir, 'topology-summary.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
