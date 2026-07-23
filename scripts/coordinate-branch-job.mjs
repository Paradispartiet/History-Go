#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dir = path.join(root, 'reports/oslo-coordinate-control-batch-167-haugerudparken-internal-anchor-research');
fs.mkdirSync(dir, { recursive: true });
const bbox = '59.916,10.852,59.922,10.866';
const q = `[out:json][timeout:30];(
  nwr["leisure"="track"](${bbox});
  nwr["sport"="cycling"](${bbox});
  nwr["highway"="cycleway"](${bbox});
  nwr["amenity"="bbq"](${bbox});
  nwr["leisure"="playground"](${bbox});
  way["surface"="concrete"](${bbox});
  way["man_made"="works"](${bbox});
);out tags center;`;
const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;
const response = await fetch(url, { headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' }, signal: AbortSignal.timeout(35000) });
if (!response.ok) throw new Error(`Overpass ${response.status}`);
const data = await response.json();
const features = (data.elements || []).map((e) => ({
  type: e.type,
  id: e.id,
  tags: e.tags || {},
  center: e.center || (e.lat !== undefined ? { lat: e.lat, lon: e.lon } : null),
}));
const cycleCandidates = features.filter((f) => f.tags.leisure === 'track' || f.tags.sport === 'cycling' || f.tags.highway === 'cycleway');
const concreteCandidates = features.filter((f) => f.tags.surface === 'concrete');
const bbqCandidates = features.filter((f) => f.tags.amenity === 'bbq');
const result = {
  generatedAt: new Date().toISOString(),
  placeId: 'furuset_haugerud_skogbelte',
  proposedIdentity: 'Haugerudparken',
  sourceDefinedInternalFeatures: [
    'gravel bicycle track / sykkelbane',
    'retained concrete slab used as dance/activity floor',
    'grill and seating areas',
  ],
  bbox,
  featureCount: features.length,
  cycleCandidateCount: cycleCandidates.length,
  cycleCandidates,
  concreteCandidateCount: concreteCandidates.length,
  concreteCandidates,
  bbqCandidateCount: bbqCandidates.length,
  bbqCandidates,
  allFeatures: features,
  productionReady: cycleCandidates.length === 1,
  nextAction: cycleCandidates.length === 1
    ? 'Crosscheck the unique cycle candidate against the official Haugerudparken project description and use it only as an explicit internal park anchor, not as park boundary geometry.'
    : 'No unique source-defined internal cycle feature; keep the place unresolved rather than selecting by proximity.',
};
fs.writeFileSync(path.join(dir, 'internal-anchor-summary.json'), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  featureCount: result.featureCount,
  cycleCandidateCount: result.cycleCandidateCount,
  concreteCandidateCount: result.concreteCandidateCount,
  bbqCandidateCount: result.bbqCandidateCount,
  productionReady: result.productionReady,
}, null, 2));
