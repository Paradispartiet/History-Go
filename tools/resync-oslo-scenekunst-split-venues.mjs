#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const aggregatePath = 'data/places/scenekunst/oslo/places_scenekunst.json';
const splitDir = 'data/places/scenekunst/oslo/places_scenekunst';
const splitIndexPath = 'data/places/scenekunst/oslo/places_scenekunst_index.json';
const splitManifestPath = 'data/places/scenekunst/oslo/places_scenekunst_manifest.json';
const reportPath = 'reports/scenekunst-oslo-split-venues-batch-1-2026-07-23.json';
const ids = ['teater_manu', 'vega_scene', 'rommen_scene', 'salt_oslo', 'det_andre_teatret_intimscenen'];

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const aggregate = readJson(aggregatePath);
if (!Array.isArray(aggregate)) throw new Error('Unexpected Oslo Scenekunst aggregate shape');
const existing = new Set(aggregate.map((place) => place.id));
for (const id of ids) {
  if (existing.has(id)) throw new Error(`Canonical Oslo Scenekunst ID already exists: ${id}`);
  const file = path.join(splitDir, `${id}.json`);
  const place = readJson(file);
  if (!place || place.id !== id) throw new Error(`Unexpected split payload for ${id}`);
  aggregate.push(place);
  existing.add(id);
}
writeJson(aggregatePath, aggregate);

const indexEntry = (place) => ({
  id: place.id,
  name: place.name,
  category: place.category,
  lat: place.lat,
  lon: place.lon,
  r: place.r,
  ...(place.year ? { year: place.year } : {}),
  coordStatus: place.coordStatus,
  coordType: place.coordType,
  locatorType: place.locatorType,
  sourceProvider: place.sourceProvider,
  sourceObjectId: place.sourceObjectId,
  geocodeAccuracy: place.geocodeAccuracy,
  coordRole: place.coordRole,
  coordSource: place.coordSource,
  coordSourceUrl: place.coordSourceUrl,
  coordVerifiedAt: place.coordVerifiedAt,
  coordNote: place.coordNote,
  file: `places_scenekunst/${place.id}.json`,
  address: place.address
});
writeJson(splitIndexPath, aggregate.map(indexEntry));

writeJson(splitManifestPath, {
  version: 'places_scenekunst_split_v1',
  source_file: 'places_scenekunst.json',
  source_path: aggregatePath,
  source_sha256: sha256(aggregatePath),
  generated_at: new Date().toISOString(),
  place_count: aggregate.length,
  layout: {
    place_files_dir: 'places_scenekunst/',
    one_file_per_place: true,
    filename_rule: '<place.id>.json',
    manifest_preserves_original_order: true,
    original_aggregate_left_unchanged: false
  },
  places: aggregate.map((place, order) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    file: `places_scenekunst/${place.id}.json`,
    order,
    sha256: sha256(path.join(splitDir, `${place.id}.json`))
  }))
});

const report = readJson(reportPath);
report.status = 'resynced_pending_validation';
report.resyncedFromPullRequest = 3343;
report.resyncedAt = new Date().toISOString();
report.base = 'current_main';
writeJson(reportPath, report);
console.log(`Rebuilt Oslo Scenekunst aggregate with ${ids.length} validated venues.`);
