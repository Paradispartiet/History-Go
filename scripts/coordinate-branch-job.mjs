#!/usr/bin/env node

import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const date = '2026-07-23';
const batch = 160;
const placeId = 'elvestrekning_bla_brenneriveien';
const sourceRef = 'origin/agent/oslo-coordinate-control-batch-160-akerselva-bla-brenneriveien-production';

const aggregateFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const childFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/elvestrekning_bla_brenneriveien.json';
const indexFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const manifestFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/elvestrekning_bla_brenneriveien.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-160-akerselva-bla-brenneriveien';

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');
const gitShow = (file) => execFileSync('git', ['show', `${sourceRef}:${file}`], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
const gitShowJson = (file) => JSON.parse(gitShow(file));

// Replay only the already validated canonical batch-160 record from the production branch.
const validatedPlace = gitShowJson(childFile);
if (validatedPlace?.id !== placeId) throw new Error(`Validated source record does not match ${placeId}`);
if (validatedPlace.coordStatus !== 'verified_geometry') throw new Error('Validated source record is not verified_geometry');
if (validatedPlace.sourceObjectId !== 'osm-way:80915045') throw new Error('Unexpected batch-160 source object');
if (validatedPlace.segmentScope?.method !== 'clipped_river_geometry_between_physical_crossings') throw new Error('Missing validated clipped segment scope');
if (validatedPlace.segmentScope?.upperCrossing?.crossingWayId !== 4826556) throw new Error('Unexpected upper bracket');
if (validatedPlace.segmentScope?.internalCrossing?.crossingWayId !== 4826555) throw new Error('Unexpected internal crossing');
if (validatedPlace.segmentScope?.lowerCrossing?.crossingWayId !== 4826553) throw new Error('Unexpected lower bracket');
if (!validatedPlace.nature_profile?.nearby_place_ids?.includes('kuba_parken')) throw new Error('Validated record is missing preserved nature profile');

const aggregate = readJson(aggregateFile);
const matches = aggregate.filter((place) => place?.id === placeId);
if (matches.length !== 1) throw new Error(`${placeId} must exist exactly once in aggregate`);
const oldPlace = matches[0];
const updatedAggregate = aggregate.map((place) => place?.id === placeId ? validatedPlace : place);
writeJson(aggregateFile, updatedAggregate);
writeJson(childFile, validatedPlace);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} missing from split index`);
for (const key of [
  'name', 'lat', 'lon', 'r', 'coordStatus', 'coordType', 'locatorType', 'sourceProvider',
  'sourceObjectId', 'geocodeAccuracy', 'coordRole', 'coordSource', 'coordSourceId',
  'coordSourceUrl', 'coordVerifiedAt', 'coordNote',
]) {
  if (validatedPlace[key] !== undefined) indexRow[key] = validatedPlace[key];
}
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} missing from split manifest`);
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.name = validatedPlace.name;
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

// Evidence was generated and audited in the validated production run; replay exact content.
const validatedEvidence = gitShowJson(evidenceFile);
if (validatedEvidence?.placeId !== placeId || validatedEvidence?.decision?.canBecomeVerified !== true) {
  throw new Error('Validated evidence is not applicable to batch 160');
}
writeJson(evidenceFile, validatedEvidence);

// Keep the protocol current relative to today's exact main, rather than copying an older whole file.
let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${date}`);
if (!protocol.includes(`| ${batch} | \`${placeId}\``)) {
  protocol = protocol.replace(
    /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
    (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
  );
  const insertion = `| 160 | \`${placeId}\` | Elvestrekning ved Blå (Brenneriveien) | verified_geometry | \`osm-way:80915045\` |\n\nBatch 160 (${date}) løser den lokalt definerte Akerselva-strekningen ved Blå/Brenneriveien med eksplisitt bracket-geometri i stedet for legacy-punkt eller nearest-søk. Fresh OSM way 80915045 er Akerselva. Delstrekningen klippes mellom den fysiske Grünerbrua/Nordre gate-kryssingen (way 4826556) og Elvebakken bru-kryssingen (way 4826553); gangbroen ved Blå/Ingens gate (way 4826555) ligger strengt inne i intervallet og kryssjekkes mot Ingens gate way 4826554 og Blå node 4312299494. Canonical lat/lon er det deterministiske lengdemidtpunktet langs den klippede ca. 286.3 meter lange elvegeometrien. Hele 5,2 km-Akerselva-wayen brukes ikke som recordens scope, og legacy-koordinaten brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex < 0) throw new Error('Could not find protocol insertion marker');
  protocol = `${protocol.slice(0, markerIndex)}${insertion}${protocol.slice(markerIndex)}`;
}
protocol = protocol
  .split('\n')
  .filter((line) => !line.includes(`| \`${placeId}\` – Elvestrekning ved Blå (Brenneriveien) | needs_review |`))
  .join('\n');
fs.writeFileSync(abs(protocolFile), protocol);

// Preserve the validated batch-specific source material and result without importing old runner logs.
fs.mkdirSync(abs(reportDir), { recursive: true });
const reportFiles = [
  'batch-160-result.json',
  'preserved-content.json',
  'sources.md',
  'osm-node-4312299494.xml',
  'osm-way-4826553-full.xml',
  'osm-way-4826554-full.xml',
  'osm-way-4826555-full.xml',
  'osm-way-4826556-full.xml',
  'osm-way-80915045-full.xml',
];
for (const name of reportFiles) {
  const file = `${reportDir}/${name}`;
  fs.writeFileSync(abs(file), gitShow(file));
}

writeJson(`${reportDir}/exact-main-replay.json`, {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  sourceValidatedBranch: sourceRef,
  replayBase: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: validatedPlace.lat, lon: validatedPlace.lon },
  sourceObjectId: validatedPlace.sourceObjectId,
  preservedNatureProfile: Boolean(validatedPlace.nature_profile),
  segmentScope: validatedPlace.segmentScope,
});

console.log(JSON.stringify({
  batch,
  placeId,
  status: validatedPlace.coordStatus,
  sourceObjectId: validatedPlace.sourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: validatedPlace.lat, lon: validatedPlace.lon },
  clippedLengthM: validatedPlace.segmentScope.clippedLengthM,
  exactMainReplay: true,
}, null, 2));
