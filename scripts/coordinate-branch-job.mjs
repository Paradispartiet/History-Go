#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const validatedProductionUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/25ba44853ad6e2be0860765af2bdf1d24e40de3f/scripts/coordinate-branch-job.mjs';
const response = await fetch(validatedProductionUrl, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Could not fetch validated Ring 3 production runner: ${response.status} ${response.statusText}`);
let source = await response.text();
source = source
  .replace("const BATCH = 177;", "const BATCH = 186;")
  .replace("if (maxBatch !== 176) throw new Error(`Expected current coordinate max batch 176, got ${maxBatch}. Rebase before batch 177.`);", "if (maxBatch !== 185) throw new Error(`Expected current coordinate max batch 185, got ${maxBatch}. Rebase before batch 186.`);");
if (!source.includes("const BATCH = 186;")) throw new Error('Could not renumber validated Ring 3 runner to batch 186');
if (!source.includes("if (maxBatch !== 185)")) throw new Error('Could not update Ring 3 sequence guard to max batch 185');

const tempScript = path.join('/tmp', `history-go-batch-186-ring3-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);

const placeId = 'ring_3';
const evidencePath = path.join(root, 'data/coordinate-evidence/oslo/by/ring_3.json');
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
  const place = toPlaces(JSON.parse(fs.readFileSync(absoluteFile, 'utf8'))).find((candidate) => candidate?.id === placeId);
  if (!place) continue;
  active = { file: path.relative(root, absoluteFile).replaceAll('\\', '/'), place };
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

console.log(JSON.stringify({ replayedBatch: 186, placeId, activePlaceFile: active.file, routeSegmentCount: active.place?.routeSegments?.length ?? 0 }, null, 2));
