import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const tempPath = path.resolve('scripts/.nature-main-sites-clean-job.mjs');
const sourceUrl = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/58b29b075059ccb3ec06bdb0bbda2ab49b07beb1/scripts/coordinate-branch-job.mjs';
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Kunne ikke hente immutable nature-main-sites-runner: ${response.status} ${response.statusText}`);
let source = await response.text();

const maridalsBefore = `  maridalsvannet: {
    mode: 'osm', aliases: ['Maridalsvannet'], locatorType: 'natural_area', coordRole: 'area_anchor', coordType: 'lake_center',
    osmPreferences: [['natural', 'water']],`;
const maridalsAfter = `  maridalsvannet: {
    mode: 'osm', aliases: ['Maridalsvannet'], locatorType: 'natural_area', coordRole: 'area_anchor', coordType: 'lake_center',
    osmPreferences: [['water', 'reservoir'], ['natural', 'water']],`;
if (!source.includes(maridalsBefore)) throw new Error('Fant ikke Maridalsvannet-filteret i immutable runner.');
source = source.replace(maridalsBefore, maridalsAfter);

fs.writeFileSync(tempPath, source);
try {
  await import(`${pathToFileURL(tempPath).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempPath, { force: true });
}

// The Mærradalen fallback is an exact named OSM natural=valley LineString, not an official protected-area polygon.
// Normalize its contract metadata after the full batch generator has run, before the workflow rebuilds runtime and executes gates.
const aggregatePath = 'data/places/natur/oslo/places_oslo_natur_hovedsteder.json';
const splitPath = 'data/places/natur/oslo/places_oslo_natur_hovedsteder/maerradalen.json';
const splitIndexPath = 'data/places/natur/oslo/places_oslo_natur_hovedsteder_index.json';
const splitManifestPath = 'data/places/natur/oslo/places_oslo_natur_hovedsteder_manifest.json';
const evidencePath = 'data/coordinate-evidence/oslo/natur/maerradalen.json';

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const writeJson = (relativePath, value) => fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
const sha256Text = (text) => crypto.createHash('sha256').update(text).digest('hex');

const aggregate = readJson(aggregatePath);
const place = aggregate.find((entry) => entry.id === 'maerradalen');
if (!place) throw new Error('Mangler Mærradalen i aggregate.');
if (place.sourceProvider === 'osm' && place.sourceObjectId === 'osm-way:844862938') {
  place.coordRole = 'line_anchor';
  place.coordType = 'valley_line_anchor';
  place.coordNote = 'Eksakt navngitt OSM-dalgeometri way 844862938 (natural=valley) brukes som lineært representasjonsanker for Mærradalen. Punktet er beregnet midt langs den navngitte dalgeometrien; det påstås ikke at OSM-linjen er en offisiell vernegrense.';
  writeJson(aggregatePath, aggregate);

  const split = readJson(splitPath);
  for (const field of ['coordRole', 'coordType', 'coordNote']) split[field] = place[field];
  writeJson(splitPath, split);

  const splitIndex = readJson(splitIndexPath);
  const indexEntry = splitIndex.find((entry) => entry.id === 'maerradalen');
  if (!indexEntry) throw new Error('Mangler Mærradalen i familieindeksen.');
  for (const field of ['coordRole', 'coordType', 'coordNote']) indexEntry[field] = place[field];
  writeJson(splitIndexPath, splitIndex);

  const evidence = readJson(evidencePath);
  evidence.currentCoordinate.coordType = place.coordType;
  evidence.currentCoordinate.coordNote = place.coordNote;
  for (const candidate of evidence.geometryCandidates ?? []) candidate.coordRole = place.coordRole;
  for (const candidate of evidence.coordinateCandidates ?? []) candidate.coordRole = place.coordRole;
  evidence.notes = [place.coordNote];
  writeJson(evidencePath, evidence);

  const reportDirs = fs.readdirSync(path.join(root, 'reports'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^oslo-coordinate-control-batch-\d+-nature-main-sites$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => Number(b.match(/batch-(\d+)/)?.[1] ?? 0) - Number(a.match(/batch-(\d+)/)?.[1] ?? 0));
  if (!reportDirs.length) throw new Error('Fant ikke nature-main-sites batchrapport etter generering.');
  const resultsPath = `reports/${reportDirs[0]}/results.json`;
  const results = readJson(resultsPath);
  if (results.after?.maerradalen) results.after.maerradalen.coordType = place.coordType;
  writeJson(resultsPath, results);

  const splitManifest = readJson(splitManifestPath);
  splitManifest.source_sha256 = sha256Text(fs.readFileSync(path.join(root, aggregatePath), 'utf8'));
  for (const row of splitManifest.places) {
    const childPath = `data/places/natur/oslo/${row.file}`;
    row.sha256 = sha256Text(fs.readFileSync(path.join(root, childPath), 'utf8'));
  }
  splitManifest.generated_at = new Date().toISOString();
  writeJson(splitManifestPath, splitManifest);
}

console.log('Nature main-sites batch regenerated from latest main with Maridalsvannet reservoir support and normalized Mærradalen line metadata.');
