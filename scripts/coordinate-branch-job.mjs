#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const previousRunnerUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/ceb7797d783ee60bebd3f92872f893b2521031d2/scripts/coordinate-branch-job.mjs';
const response = await fetch(previousRunnerUrl, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Could not fetch historical-contract batch-176 runner: ${response.status} ${response.statusText}`);
const source = await response.text();
const tempScript = path.join('/tmp', `history-go-batch-176-historical-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);

const placeId = 'hellerud_gard';
const evidencePath = path.join(root, 'data/coordinate-evidence/oslo/natur/hellerud_gard.json');
const placeManifestPath = path.join(root, 'data/places/manifest.json');
const toPlaces = (payload) => Array.isArray(payload)
  ? payload
  : Array.isArray(payload?.places)
    ? payload.places
    : Array.isArray(payload?.items)
      ? payload.items
      : [payload];

const placeManifest = JSON.parse(fs.readFileSync(placeManifestPath, 'utf8'));
let active = null;
for (const entry of placeManifest.files || []) {
  const absoluteFile = path.join(root, 'data', entry);
  if (!fs.existsSync(absoluteFile)) continue;
  const payload = JSON.parse(fs.readFileSync(absoluteFile, 'utf8'));
  const place = toPlaces(payload).find((candidate) => candidate?.id === placeId);
  if (!place) continue;
  active = {
    file: path.relative(root, absoluteFile).replaceAll('\\', '/'),
    place,
  };
}
if (!active) throw new Error(`Could not resolve active manifest source for ${placeId}`);

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
fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

console.log(JSON.stringify({
  batch: 176,
  evidenceNormalization: {
    placeId,
    activePlaceFile: active.file,
    coordStatus: active.place?.coordStatus ?? null,
    sourceProvider: active.place?.sourceProvider ?? null,
    sourceObjectId: active.place?.sourceObjectId ?? null,
  },
}, null, 2));
