#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 164;
const date = '2026-07-23';
const placeId = 'frysjadammen';
const sourceRef = 'origin/agent/oslo-coordinate-control-batch-164-oset-slusebru-production';
const aggregateFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const childFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/frysjadammen.json';
const indexFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const manifestFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/frysjadammen.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-164-oset-slusebru-production';

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const gitShow = (file) => execFileSync('git', ['show', `${sourceRef}:${file}`], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
const gitShowJson = (file) => JSON.parse(gitShow(file));
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');

const validatedPlace = gitShowJson(childFile);
if (validatedPlace?.id !== placeId) throw new Error('Validated place ID mismatch');
if (validatedPlace.coordStatus !== 'verified_geometry') throw new Error('Validated place is not verified_geometry');
if (validatedPlace.sourceObjectId !== 'osm-way:79506476') throw new Error('Unexpected validated Oset source object');
if (validatedPlace.identityScope?.anleggsbruWayId !== 66159193) throw new Error('Missing validated Oset topology crosscheck');
if (validatedPlace.identityScope?.bridgeCenterDistanceM >= 25) throw new Error('Validated Oset bridge pair is not immediate');

const aggregate = readJson(aggregateFile);
if (aggregate.filter((entry) => entry?.id === placeId).length !== 1) throw new Error(`${placeId} must exist exactly once in aggregate`);
writeJson(aggregateFile, aggregate.map((entry) => entry?.id === placeId ? validatedPlace : entry));
writeJson(childFile, validatedPlace);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} missing from split index`);
for (const key of [
  'name', 'lat', 'lon', 'r', 'year', 'coordStatus', 'coordType', 'locatorType', 'sourceProvider',
  'sourceObjectId', 'geocodeAccuracy', 'coordRole', 'coordSource', 'coordSourceId', 'coordSourceUrl',
  'coordVerifiedAt', 'coordNote',
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

const evidence = gitShowJson(evidenceFile);
if (evidence?.placeId !== placeId || evidence?.decision?.canBecomeVerified !== true) throw new Error('Validated batch 164 evidence is not applicable');
writeJson(evidenceFile, evidence);

let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${date}`);
if (!protocol.includes(`| ${batch} | \`${placeId}\``)) {
  protocol = protocol.replace(
    /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
    (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
  );
  const insertion = `| ${batch} | \`${placeId}\` | ${validatedPlace.name} | verified_geometry | \`${validatedPlace.sourceObjectId}\` |\n\nBatch ${batch} (${date}) løser identitetskonflikten i legacy-recorden \`frysjadammen\`. Recordens innhold og kilder beskriver damanlegget ved Maridalsoset, ikke Brekkedammen/Kjelsåsdammen ved Frysja. Oset slusebru identifiseres gjennom den kildefestede topologien som tre-gangbrua umiddelbart nedenfor Oset anleggsbru. Bounded OSM-research fant tre brede fotbru/kjørebru-par, men bare way 79506476 og den stengte servicebrua way 66159193 oppfyller den umiddelbare naborelasjonen, med 9,6 meter mellom geometrisentrene. Canonical lat/lon er geometrisk sentrum av fresh OSM way 79506476. Det stabile placeId-et beholdes for kompatibilitet; legacy-punktet, Brekkedammen som proxy og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex < 0) throw new Error('Could not find protocol insertion marker');
  protocol = `${protocol.slice(0, markerIndex)}${insertion}${protocol.slice(markerIndex)}`;
}
protocol = protocol.split('\n').filter((line) => !(line.includes(`\`${placeId}\``) && line.includes('needs_review'))).join('\n');
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
for (const name of [
  'batch-164-result.json',
  'osm-way-66159193-full.xml',
  'osm-way-79506476-full.xml',
  'sources.md',
  'topology-research-summary.json',
]) {
  fs.writeFileSync(abs(`${reportDir}/${name}`), gitShow(`${reportDir}/${name}`));
}
writeJson(`${reportDir}/exact-main-replay.json`, {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  sourceValidatedBranch: sourceRef,
  replayBase: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  newCoordinate: { lat: validatedPlace.lat, lon: validatedPlace.lon },
  sourceObjectId: validatedPlace.sourceObjectId,
  identityScope: validatedPlace.identityScope,
});

console.log(JSON.stringify({
  batch,
  placeId,
  name: validatedPlace.name,
  coordinate: { lat: validatedPlace.lat, lon: validatedPlace.lon },
  sourceObjectId: validatedPlace.sourceObjectId,
  exactMainReplay: true,
}, null, 2));
