#!/usr/bin/env node

import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const date = '2026-07-23';
const batch = 162;
const placeId = 'hausmannsomradet_elvelop';
const sourceRef = 'origin/agent/oslo-coordinate-control-batch-162-hausmannskvartalene-production';

const aggregateFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const childFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/hausmannsomradet_elvelop.json';
const indexFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const manifestFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/hausmannsomradet_elvelop.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-162-hausmannskvartalene-river-segment';

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');
const gitShow = (file) => execFileSync('git', ['show', `${sourceRef}:${file}`], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
const gitShowJson = (file) => JSON.parse(gitShow(file));

const validatedPlace = gitShowJson(childFile);
if (validatedPlace?.id !== placeId) throw new Error(`Validated source record does not match ${placeId}`);
if (validatedPlace.name !== 'Hausmannskvartalene – elveløp') throw new Error('Unexpected validated display identity');
if (validatedPlace.coordStatus !== 'verified_geometry') throw new Error('Validated source record is not verified_geometry');
if (validatedPlace.sourceObjectId !== 'osm-way:80915045') throw new Error('Unexpected batch-162 source object');
if (validatedPlace.segmentScope?.method !== 'clipped_visible_river_geometry_between_exact_named_bridge_polygons') {
  throw new Error('Missing validated exact bridge-polygon segment scope');
}
if (validatedPlace.segmentScope?.upstreamBoundary?.bridgePolygonWayId !== 315066295) throw new Error('Unexpected Nybrua boundary');
if (validatedPlace.segmentScope?.downstreamBoundary?.bridgePolygonWayId !== 377766486) throw new Error('Unexpected Hausmanns bru boundary');

const currentChild = readJson(childFile);
if (currentChild?.id !== placeId) throw new Error(`Current-main child does not match ${placeId}`);

// Preserve any unrelated metadata added on current main while replaying only validated batch-162 fields.
const fieldsToReplay = [
  'name', 'lat', 'lon', 'r', 'desc', 'popupDesc', 'sourceHint',
  'coordType', 'coordStatus', 'coordSource', 'coordVerifiedAt',
  'locatorType', 'sourceProvider', 'sourceObjectId', 'geocodeAccuracy',
  'coordRole', 'coordNote', 'coordSourceId', 'coordSourceUrl', 'segmentScope',
];
const updatedPlace = { ...currentChild };
for (const key of fieldsToReplay) {
  if (validatedPlace[key] !== undefined) updatedPlace[key] = validatedPlace[key];
}

// Core non-coordinate metadata must remain intact through the replay.
for (const key of ['quiz_profile', 'primary_category', 'secondary_category', 'hybrid', 'underbadge_ids', 'emne_ids', 'routeId', 'tags']) {
  if (currentChild[key] !== undefined && JSON.stringify(updatedPlace[key]) !== JSON.stringify(currentChild[key])) {
    throw new Error(`Replay unexpectedly changed preserved metadata field ${key}`);
  }
}

const aggregate = readJson(aggregateFile);
const matches = aggregate.filter((place) => place?.id === placeId);
if (matches.length !== 1) throw new Error(`${placeId} must exist exactly once in aggregate`);
const oldPlace = matches[0];
writeJson(aggregateFile, aggregate.map((place) => place?.id === placeId ? updatedPlace : place));
writeJson(childFile, updatedPlace);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} missing from split index`);
for (const key of [
  'name', 'lat', 'lon', 'r', 'coordStatus', 'coordType', 'locatorType', 'sourceProvider',
  'sourceObjectId', 'geocodeAccuracy', 'coordRole', 'coordSource', 'coordSourceId',
  'coordSourceUrl', 'coordVerifiedAt', 'coordNote',
]) {
  if (updatedPlace[key] !== undefined) indexRow[key] = updatedPlace[key];
}
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} missing from split manifest`);
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.name = updatedPlace.name;
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

const validatedEvidence = gitShowJson(evidenceFile);
if (validatedEvidence?.placeId !== placeId || validatedEvidence?.decision?.canBecomeVerified !== true) {
  throw new Error('Validated batch-162 evidence is not applicable');
}
writeJson(evidenceFile, validatedEvidence);

let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${date}`);
if (!protocol.includes(`| ${batch} | \`${placeId}\``)) {
  protocol = protocol.replace(
    /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
    (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
  );
  const insertion = `| 162 | \`${placeId}\` | Hausmannskvartalene – elveløp | verified_geometry | \`osm-way:80915045\` |\n\nBatch 162 (${date}) løser den tidligere brede «Hausmannsområdet»-recorden som Hausmannskvartalenes dokumenterte Akerselva-grense mellom Nybrua og Hausmanns bru. Oslo byleksikon avgrenser Hausmannskvartalene med Hausmanns gate i nord, Akerselva i nordøst og Storgata i sørøst. Fresh OSM way 80915045 er den synlige Akerselva-geometrien; de eksakte navngitte broflatene Nybrua (way 315066295) og Hausmanns bru (way 377766486) skjærer samme elveway og brukes som fysiske yttergrenser. Canonical lat/lon er lengdemidtpunktet langs den klippede ca. 409.3 meter lange elvegeometrien. Legacy-punktet vest for elva og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex < 0) throw new Error('Could not find protocol insertion marker');
  protocol = `${protocol.slice(0, markerIndex)}${insertion}${protocol.slice(markerIndex)}`;
}
protocol = protocol
  .split('\n')
  .filter((line) => !line.includes(`| \`${placeId}\` – Hausmannsområdet (elveløp) | needs_review |`))
  .join('\n');
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
for (const name of [
  'batch-162-result.json',
  'sources.md',
  'osm-way-315066295-full.xml',
  'osm-way-377766486-full.xml',
  'osm-way-80915045-full.xml',
]) {
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
  newCoordinate: { lat: updatedPlace.lat, lon: updatedPlace.lon },
  sourceObjectId: updatedPlace.sourceObjectId,
  preservedMetadataFields: ['quiz_profile', 'primary_category', 'secondary_category', 'hybrid', 'underbadge_ids', 'emne_ids', 'routeId', 'tags'],
  segmentScope: updatedPlace.segmentScope,
});

console.log(JSON.stringify({
  batch,
  placeId,
  name: updatedPlace.name,
  status: updatedPlace.coordStatus,
  sourceObjectId: updatedPlace.sourceObjectId,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: updatedPlace.lat, lon: updatedPlace.lon },
  clippedLengthM: updatedPlace.segmentScope?.clippedLengthM,
  exactMainReplay: true,
}, null, 2));
