const assert = require('assert');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const place = readJson('data/places/natur/vestland/skano_naturreservat_etne.json')[0];
assert.strictEqual(place.id, 'skano_naturreservat_etne');
assert.strictEqual(place.coordStatus, 'verified_geometry');
assert.strictEqual(place.sourceProvider, 'official_map');
assert(place.sourceObjectId.startsWith('miljodirektoratet-naturvern:'));
assert(place.nature_profile.summary.length >= 180);
assert(place.nature_profile.themes.length >= 5);

const map = readJson('data/natur/nature_etne_place_map.json');
const entry = map.places.skano_naturreservat_etne;
assert(entry);
assert(Array.isArray(entry.flora));
assert(Array.isArray(entry.fauna));
assert.strictEqual(entry.species_audit, 'reports/etne-natur-batch-5-skano-artskart.json');
for (const id of ["emne_fauna_skjaerpiplerke","emne_fauna_kanadagaas","emne_fauna_roedstilk","emne_fauna_havoern","emne_fauna_vipe"]) assert(entry.fauna.includes(id), 'Skåno mangler ' + id);

const audit = readJson('reports/etne-natur-batch-5-skano-artskart.json');
assert.strictEqual(audit.unmatched.length, 0);
assert.strictEqual(audit.meta.placeId, 'skano_naturreservat_etne');
assert.strictEqual(audit.meta.spatialFilter.includes('official'), true);
assert.strictEqual(audit.counts.matchedCanonicalSpecies, entry.flora.length + entry.fauna.length);

const floraManifest = readJson('data/natur/flora/manifest.json');
const faunaManifest = readJson('data/natur/fauna/manifest.json');
const resolve = (manifestPath, ref) => {
  const base = path.dirname(manifestPath);
  const dataBase = path.dirname(base);
  const candidates = [
    ref.startsWith('data/') ? ref : null,
    path.join(base, ref),
    path.join(dataBase, ref),
    path.join('data', ref)
  ].filter(Boolean);
  return candidates.find(candidate => fs.existsSync(path.join(repo, candidate)));
};
const flatten = value => {
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (!value || typeof value !== 'object') return [];
  if (value.kind === 'emne_pack' && Array.isArray(value.items)) return value.items.flatMap(flatten);
  if (value.id) return [value];
  return Object.values(value).flatMap(child => Array.isArray(child) ? flatten(child) : []);
};
const floraIds = new Set(floraManifest.files.flatMap(ref => flatten(readJson(resolve('data/natur/flora/manifest.json', ref)))).filter(Boolean).map(item => item.id));
const faunaIds = new Set(faunaManifest.files.flatMap(ref => flatten(readJson(resolve('data/natur/fauna/manifest.json', ref)))).filter(Boolean).map(item => item.id));
for (const id of entry.flora) assert(floraIds.has(id), 'Missing flora card ' + id);
for (const id of entry.fauna) assert(faunaIds.has(id), 'Missing fauna card ' + id);

const evidence = readJson('data/coordinate-evidence/vestland/natur/skano_naturreservat_etne.json');
assert.strictEqual(evidence.placeId, 'skano_naturreservat_etne');
assert.strictEqual(evidence.evidenceStatus, 'applied_to_place');
assert.strictEqual(evidence.decision.canBecomeVerified, true);

console.log('Etne Skåno exact-polygon nature round mapping OK');
