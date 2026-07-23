#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'reports/oslo-coordinate-control-batch-167-haugerudparken-research');
fs.mkdirSync(dir, { recursive: true });
const bbox = '59.910,10.845,59.930,10.880';
const q = `[out:json][timeout:30];(
  nwr["name"="Haugerudparken"](${bbox});
  way["leisure"="park"](${bbox});relation["leisure"="park"](${bbox});
  way["landuse"="recreation_ground"](${bbox});relation["landuse"="recreation_ground"](${bbox});
  way["landuse"="forest"](${bbox});relation["landuse"="forest"](${bbox});
  way["natural"="wood"](${bbox});relation["natural"="wood"](${bbox});
);out tags center;`;
const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let data = null;
let endpoint = null;
let lastError = null;
for (const base of endpoints) {
  try {
    const url = `${base}?data=${encodeURIComponent(q)}`;
    const response = await fetch(url, { headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' }, signal: AbortSignal.timeout(35000) });
    if (!response.ok) throw new Error(`Overpass ${response.status}`);
    data = await response.json();
    endpoint = base;
    break;
  } catch (error) {
    lastError = String(error?.message || error);
  }
}
if (!data) throw new Error(`All Overpass endpoints failed: ${lastError}`);
const candidates = (data.elements || []).map((e) => ({
  type: e.type,
  id: e.id,
  tags: e.tags || {},
  center: e.center || (e.lat !== undefined ? { lat: e.lat, lon: e.lon } : null),
}));
const exactNamed = candidates.filter((c) => c.tags.name === 'Haugerudparken');
const exactNamedAreas = exactNamed.filter((c) => c.type === 'way' || c.type === 'relation');
const physicalAreas = candidates.filter((c) => (c.type === 'way' || c.type === 'relation') && (
  c.tags.leisure === 'park'
  || c.tags.landuse === 'recreation_ground'
  || c.tags.landuse === 'forest'
  || c.tags.natural === 'wood'
));
let selected = exactNamedAreas.length === 1 ? exactNamedAreas[0] : null;
if (selected) {
  const xmlUrl = `https://api.openstreetmap.org/api/0.6/${selected.type}/${selected.id}/full`;
  const xmlResponse = await fetch(xmlUrl, { headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' }, signal: AbortSignal.timeout(30000) });
  if (!xmlResponse.ok) throw new Error(`OSM API ${xmlResponse.status}`);
  fs.writeFileSync(path.join(dir, `osm-${selected.type}-${selected.id}-full.xml`), await xmlResponse.text());
}
const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'furuset_haugerud_skogbelte',
  legacyIdentity: 'Furuset–Haugerud skogbelte',
  proposedIdentity: 'Haugerudparken',
  bbox,
  overpassEndpoint: endpoint,
  exactNamedCount: exactNamed.length,
  exactNamed,
  exactNamedAreaCount: exactNamedAreas.length,
  exactNamedAreas,
  physicalAreaCount: physicalAreas.length,
  physicalAreas,
  selected,
  productionReady: Boolean(selected),
  nextAction: selected
    ? 'Exact named physical area exists; inspect fresh geometry before production.'
    : 'No exact named area geometry exists in OSM. Use the exact-name object only as identity evidence and require an independently bounded physical area before production; do not select a nearby polygon by distance.',
  identityBasis: 'Oslo kommune documents Haugerudparken as a municipally owned regulated friområde with woodland, paths, habitat management and state-secured outdoor recreation.',
};
fs.writeFileSync(path.join(dir, 'candidate-summary.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  exactNamedCount: result.exactNamedCount,
  exactNamedAreaCount: result.exactNamedAreaCount,
  physicalAreaCount: result.physicalAreaCount,
  productionReady: result.productionReady,
}, null, 2));
