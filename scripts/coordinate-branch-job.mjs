#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'reports/oslo-coordinate-control-batch-167-haugerudparken-research');
fs.mkdirSync(dir, { recursive: true });
const q = '[out:json][timeout:25];(way["name"="Haugerudparken"](59.910,10.845,59.930,10.880);relation["name"="Haugerudparken"](59.910,10.845,59.930,10.880););out tags center;';
const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;
const response = await fetch(url, { headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' }, signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Overpass ${response.status}`);
const data = await response.json();
const candidates = (data.elements || []).map((e) => ({ type: e.type, id: e.id, tags: e.tags || {}, center: e.center || null }));
const allowed = candidates.filter((c) => c.tags.name === 'Haugerudparken' && ['park','recreation_ground','forest'].includes(c.tags.leisure || c.tags.landuse));
if (allowed.length !== 1) throw new Error(`Expected one exact physical Haugerudparken area, found ${allowed.length}`);
const selected = allowed[0];
const xmlUrl = `https://api.openstreetmap.org/api/0.6/${selected.type}/${selected.id}/full`;
const xmlResponse = await fetch(xmlUrl, { headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' }, signal: AbortSignal.timeout(30000) });
if (!xmlResponse.ok) throw new Error(`OSM API ${xmlResponse.status}`);
const xml = await xmlResponse.text();
fs.writeFileSync(path.join(dir, `osm-${selected.type}-${selected.id}-full.xml`), xml);
const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'furuset_haugerud_skogbelte',
  proposedIdentity: 'Haugerudparken',
  candidates,
  selected,
  productionReady: true,
  identityBasis: 'Oslo kommune documents Haugerudparken as a municipally owned regulated friområde with woodland, paths, habitat management and state-secured outdoor recreation.',
};
fs.writeFileSync(path.join(dir, 'candidate-summary.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
