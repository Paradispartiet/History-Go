import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const aggregatePath = 'data/places/natur/oslo/places_oslo_natur_hovedsteder.json';
const splitPath = 'data/places/natur/oslo/places_oslo_natur_hovedsteder/maerradalen.json';
const splitIndexPath = 'data/places/natur/oslo/places_oslo_natur_hovedsteder_index.json';
const splitManifestPath = 'data/places/natur/oslo/places_oslo_natur_hovedsteder_manifest.json';
const evidencePath = 'data/coordinate-evidence/oslo/natur/maerradalen.json';
const resultsPath = 'reports/oslo-coordinate-control-batch-107-nature-main-sites/results.json';

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const writeJson = (relativePath, value) => fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
const sha256Text = (text) => crypto.createHash('sha256').update(text).digest('hex');

const aggregate = readJson(aggregatePath);
const place = aggregate.find((entry) => entry.id === 'maerradalen');
if (!place || place.sourceObjectId !== 'osm-way:844862938') throw new Error('Uventet Mærradalen-kildeobjekt.');
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
for (const candidate of evidence.geometryCandidates ?? []) candidate.coordRole = place.coordRole;
for (const candidate of evidence.coordinateCandidates ?? []) candidate.coordRole = place.coordRole;
evidence.notes = [place.coordNote];
writeJson(evidencePath, evidence);

const results = readJson(resultsPath);
results.after.maerradalen.coordType = place.coordType;
writeJson(resultsPath, results);

const splitManifest = readJson(splitManifestPath);
splitManifest.source_sha256 = sha256Text(fs.readFileSync(path.join(root, aggregatePath), 'utf8'));
for (const row of splitManifest.places) {
  const childPath = `data/places/natur/oslo/${row.file}`;
  row.sha256 = sha256Text(fs.readFileSync(path.join(root, childPath), 'utf8'));
}
splitManifest.generated_at = new Date().toISOString();
writeJson(splitManifestPath, splitManifest);

console.log('Mærradalen metadata rettet til line_anchor / valley_line_anchor.');
