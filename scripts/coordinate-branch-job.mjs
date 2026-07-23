#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/79593c6d4cd309510287de1bba0e725ecb11a15e/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Could not fetch validated salamander production script: ${response.status} ${response.statusText}`);
let source = await response.text();

// Renumber the previously validated logical batches because Haugerudparken now owns batch 167.
source = source
  .replace(".replace('const batch = 166;', 'const batch = 167;')", ".replace('const batch = 166;', 'const batch = 168;')")
  .replaceAll("batch-167-bantjern-private-proxy-retirement", "batch-168-bantjern-private-proxy-retirement")
  .replaceAll("batch-167-result.json", "batch-168-result.json")
  .replace("const batch = 168;\nconst placeId = 'blindern_forskningsparken_salamanderdam';", "const batch = 169;\nconst placeId = 'blindern_forskningsparken_salamanderdam';")
  .replaceAll("batch-168-blindern-forskningsparken-pond-production", "batch-169-blindern-forskningsparken-pond-production")
  .replaceAll("batch-168-result.json", "batch-169-result.json")
  .replace("batches: [167, 168]", "batches: [168, 169]")
  .replace("place.geocodeAccuracy = 'polygon_centroid';", "place.geocodeAccuracy = 'geometric_center';")
  .replace("place.locatorType = 'area';", "place.locatorType = 'natural_area';");

if (!source.includes(".replace('const batch = 166;', 'const batch = 168;')")) {
  throw new Error('Could not renumber Båntjern retirement to batch 168');
}
if (!source.includes("const batch = 169;\nconst placeId = 'blindern_forskningsparken_salamanderdam';")) {
  throw new Error('Could not renumber Forskningsparken pond production to batch 169');
}
if (!source.includes("place.geocodeAccuracy = 'geometric_center';") || !source.includes("place.locatorType = 'natural_area';")) {
  throw new Error('Could not apply validated coordinate-contract fixes for batch 169');
}

const tempScript = path.join('/tmp', `history-go-batches-168-169-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);

// Normalize evidence exactly to the active canonical source selected by the evidence audit.
const placeId = 'blindern_forskningsparken_salamanderdam';
const evidencePath = path.join(root, 'data/coordinate-evidence/oslo/natur/blindern_forskningsparken_salamanderdam.json');
const placeManifestPath = path.join(root, 'data/places/manifest.json');
const toPlaces = (payload) => Array.isArray(payload)
  ? payload
  : Array.isArray(payload?.places)
    ? payload.places
    : Array.isArray(payload?.items)
      ? payload.items
      : [payload];

const manifest = JSON.parse(fs.readFileSync(placeManifestPath, 'utf8'));
let active = null;
for (const entry of manifest.files || []) {
  const absoluteFile = path.join(root, 'data', entry);
  if (!fs.existsSync(absoluteFile)) continue;
  const payload = JSON.parse(fs.readFileSync(absoluteFile, 'utf8'));
  const place = toPlaces(payload).find((candidate) => candidate?.id === placeId);
  if (!place) continue;
  active = {
    file: path.relative(root, absoluteFile).replaceAll('\\', '/'),
    place,
  };
  break;
}
if (!active) throw new Error(`Could not resolve active place-manifest source for ${placeId}`);

const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
evidence.placeFile = active.file;
evidence.currentCoordinate = {
  lat: active.place?.lat ?? null,
  lon: active.place?.lon ?? null,
  r: active.place?.r ?? null,
  coordStatus: active.place?.coordStatus ?? '',
  coordSource: active.place?.coordSource ?? '',
  coordType: active.place?.coordType ?? '',
  coordNote: active.place?.coordNote ?? '',
};
if (evidence.identity) evidence.identity.locatorTypeCandidate = active.place?.locatorType ?? 'natural_area';
fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

console.log(JSON.stringify({
  finalBatches: [168, 169],
  evidenceNormalization: {
    placeId,
    activePlaceFile: active.file,
    geocodeAccuracy: active.place?.geocodeAccuracy ?? null,
    locatorType: active.place?.locatorType ?? null,
  },
}, null, 2));
