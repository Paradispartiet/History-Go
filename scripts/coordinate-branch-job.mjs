#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const previousRunnerUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/75b0fef2f20db83ae30198c657a90ffd80d435f1/scripts/coordinate-branch-job.mjs';
const response = await fetch(previousRunnerUrl, {
  headers: { 'User-Agent': 'History-Go-coordinate-control/1.0' },
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error(`Could not fetch normalized batch-176 runner: ${response.status} ${response.statusText}`);
const source = await response.text();
const tempScript = path.join('/tmp', `history-go-batch-176-normalized-${Date.now()}.mjs`);
fs.writeFileSync(tempScript, source);
await import(`${pathToFileURL(tempScript).href}?v=${Date.now()}`);

const placeId = 'hellerud_gard';
const aggregateFile = 'data/places/natur/oslo/places_oslo_alna.json';
const childFile = 'data/places/natur/oslo/places_oslo_alna/hellerud_gard.json';
const indexFile = 'data/places/natur/oslo/places_oslo_alna_index.json';
const manifestFile = 'data/places/natur/oslo/places_oslo_alna_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/hellerud_gard.json';
const placeManifestFile = 'data/places/manifest.json';
const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');
const toPlaces = (payload) => Array.isArray(payload)
  ? payload
  : Array.isArray(payload?.places)
    ? payload.places
    : Array.isArray(payload?.items)
      ? payload.items
      : [payload];

const child = readJson(childFile);
const anchor = {
  id: 'nedre_hellerud_cadastral_site_143_3',
  name: 'Nedre Hellerud – gnr. 143 / bnr. 3',
  type: 'historical_anchor',
  lat: child.lat,
  lon: child.lon,
  r: child.r,
};
child.anchors = [anchor];
writeJson(childFile, child);

const aggregate = readJson(aggregateFile);
const aggregateRow = aggregate.find((row) => row?.id === placeId);
if (!aggregateRow) throw new Error(`${placeId} missing from aggregate while adding historical anchor`);
aggregateRow.anchors = [anchor];
writeJson(aggregateFile, aggregate);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} missing from split index while adding historical anchor`);
indexRow.anchors = [anchor];
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} missing from split manifest while refreshing hashes`);
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

const placeManifest = readJson(placeManifestFile);
let active = null;
for (const entry of placeManifest.files || []) {
  const absoluteFile = path.join(root, 'data', entry);
  if (!fs.existsSync(absoluteFile)) continue;
  const place = toPlaces(JSON.parse(fs.readFileSync(absoluteFile, 'utf8'))).find((candidate) => candidate?.id === placeId);
  if (!place) continue;
  active = { file: path.relative(root, absoluteFile).replaceAll('\\', '/'), place };
}
if (!active) throw new Error(`Could not resolve active manifest source for ${placeId} after adding historical anchor`);
if (!Array.isArray(active.place.anchors) || active.place.anchors.length !== 1) throw new Error('Active Nedre Hellerud source does not expose the required historical anchor');

const evidence = readJson(evidenceFile);
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
evidence.geometryCandidates = [{
  sourceProvider: 'manual_research',
  sourceObjectId: 'history-go-research:nedre-hellerud-cadastral:143-3',
  geometryType: 'historical_point_anchor',
  coordRole: 'historical_anchor',
  lat: active.place.lat,
  lon: active.place.lon,
  canApplyToPlace: true,
}];
writeJson(evidenceFile, evidence);

console.log(JSON.stringify({
  batch: 176,
  placeId,
  historicalAnchor: anchor,
  activePlaceFile: active.file,
  coordStatus: active.place.coordStatus,
  geocodeAccuracy: active.place.geocodeAccuracy,
  coordRole: active.place.coordRole,
}, null, 2));
