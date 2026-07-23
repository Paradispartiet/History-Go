#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const aggregatePath = 'data/places/scenekunst/oslo/places_scenekunst.json';
const splitDir = 'data/places/scenekunst/oslo/places_scenekunst';
const splitIndexPath = 'data/places/scenekunst/oslo/places_scenekunst_index.json';
const splitManifestPath = 'data/places/scenekunst/oslo/places_scenekunst_manifest.json';
const globalIndexPath = 'data/places/places_index.json';
const reportJson = 'reports/scenekunst-oslo-missing-split-venues-2026-07-23.json';
const reportMd = 'reports/scenekunst-oslo-missing-split-venues-2026-07-23.md';
const ids = ['rommen_scene', 'salt_oslo', 'det_andre_teatret_intimscenen'];

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

const aggregate = readJson(aggregatePath);
const globalIndex = readJson(globalIndexPath);
if (!Array.isArray(aggregate) || !Array.isArray(globalIndex)) throw new Error('Unexpected aggregate or global index shape');
const aggregateIds = new Set(aggregate.map((place) => place.id));
const globalIds = new Set(globalIndex.map((place) => place.id));
const places = [];

for (const id of ids) {
  if (aggregateIds.has(id) || globalIds.has(id)) throw new Error(`Canonical ID already exists: ${id}`);
  const file = path.join(splitDir, `${id}.json`);
  const place = readJson(file);
  if (!place || place.id !== id) throw new Error(`Unexpected split payload for ${id}`);
  aggregate.push(place);
  aggregateIds.add(id);
  places.push(place);
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

const generatedAt = new Date().toISOString();
const coordinateResults = places.map((place) => ({
  id: place.id,
  sourceObjectId: place.sourceObjectId,
  coordinate: { lat: place.lat, lon: place.lon },
  address: place.address,
  exactOverlapIds: place.coLocationAudit?.nearbyCanonicalIds ?? [],
  overlapDecision: place.coLocationAudit?.intentionalSharedAnchor ? 'intentional_shared_anchor' : 'no_overlap'
}));
const report = {
  generatedAt,
  status: 'built_pending_validation',
  category: 'scenekunst',
  batch: 'oslo_missing_split_venues_after_batch_5',
  excludedExistingIds: ['teater_manu', 'vega_scene'],
  addedPlaceIds: ids,
  coordinateResults,
  physicalScopeDecisions: Object.fromEntries(places.map((place) => [place.id, place.physicalScope])),
  hybridCategoryDecisions: {
    rommen_scene: ['scenekunst', 'musikk', 'by'],
    salt_oslo: ['scenekunst', 'musikk', 'by']
  },
  validation: {
    duplicateIdGuard: 'pass',
    splitAggregateBuild: 'pass',
    splitManifestBuild: 'pass',
    splitIndexBuild: 'pass',
    placesIndexBuild: 'pending_ci',
    placesChecks: 'pending_ci',
    categoryAudit: 'pending_ci'
  }
};
writeJson(reportJson, report);

const md = [
  '# Scenekunst – tre manglende Oslo-splitsteder', '',
  `Generert: ${generatedAt}`, '',
  '## Nye steder', '',
  ...places.map((place) => `- \`${place.id}\` – ${place.name}`), '',
  '## Koordinater', '',
  ...places.flatMap((place) => [
    `### \`${place.id}\``, '',
    `- Adresse: ${place.address.street} ${place.address.number}, ${place.address.postcode} ${place.address.city}`,
    `- Geonorge-objekt: \`${place.sourceObjectId}\``,
    `- Punkt: ${place.lat}, ${place.lon}`,
    `- Overlap: ${place.coLocationAudit?.intentionalSharedAnchor ? `intentional_shared_anchor (${(place.coLocationAudit.nearbyCanonicalIds ?? []).join(', ')})` : 'no_overlap'}`, ''
  ]),
  '## Fysisk scope', '',
  ...places.map((place) => `- \`${place.id}\`: ${place.physicalScope}`), '',
  '## Eksisterende steder', '',
  '- `teater_manu` og `vega_scene` er ikke med i denne batchen fordi de allerede er canonical på `main`.', ''
];
fs.writeFileSync(reportMd, md.join('\n'));
console.log(`Built ${places.length} missing Oslo Scenekunst split venues.`);
