const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const readText = relativePath => fs.readFileSync(path.join(repo, relativePath), 'utf8');

const manifest = readJson('data/natur/fauna/manifest.json');
assert(manifest.files.includes('fisk_etne.json'), 'Faunamanifestet skal laste fisk_etne.json');

const fish = readJson('data/natur/fauna/fisk_etne.json');
const expectedSpecies = {
  emne_fauna_laks: 'Salmo salar',
  emne_fauna_orret: 'Salmo trutta',
  emne_fauna_roye: 'Salvelinus alpinus',
  emne_fauna_al: 'Anguilla anguilla',
  emne_fauna_trepigget_stingsild: 'Gasterosteus aculeatus'
};

assert.strictEqual(fish.length, Object.keys(expectedSpecies).length, 'Batchen skal ha fem biologiske fiskearter');
for (const entry of fish) {
  assert.strictEqual(entry.latin, expectedSpecies[entry.id], `Uventet eller duplisert fiskeart: ${entry.id}`);
  assert.strictEqual(entry.taxonomy?.klasse, 'Actinopterygii', `${entry.id} skal identifiseres som strålefinnefisk`);
  assert(Number.isInteger(entry.taxonomy?.artskart_taxon_id), `${entry.id} mangler Artsdatabanken taxon-id`);
  assert(Array.isArray(entry.kjennetegn) && entry.kjennetegn.length >= 3, `${entry.id} mangler kjennetegn`);
  assert(Array.isArray(entry.observasjonstips) && entry.observasjonstips.length >= 1, `${entry.id} mangler observasjonstips`);
}

const placeMap = readJson('data/natur/nature_etne_place_map.json');
const expectedFishByPlace = {
  etneelva: ['emne_fauna_laks', 'emne_fauna_orret'],
  etneelva_forskningsplattform: ['emne_fauna_laks', 'emne_fauna_orret'],
  stordalsvatnet_etne: [
    'emne_fauna_laks',
    'emne_fauna_orret',
    'emne_fauna_roye',
    'emne_fauna_al',
    'emne_fauna_trepigget_stingsild'
  ]
};
for (const [placeId, speciesIds] of Object.entries(expectedFishByPlace)) {
  const fauna = placeMap.places[placeId]?.fauna || [];
  for (const speciesId of speciesIds) {
    assert(fauna.includes(speciesId), `${placeId} mangler fiskearten ${speciesId}`);
  }
}

const knownIds = new Set(fish.map(entry => entry.id));
for (const [placeId, speciesIds] of Object.entries(expectedFishByPlace)) {
  for (const speciesId of speciesIds) {
    assert(knownIds.has(speciesId), `${placeId} peker til ukjent fiskeart ${speciesId}`);
  }
}

const bridge = readText('js/nature_place_map_bridge.js');
assert(bridge.includes('"data/natur/nature_etne_place_map.json"'), 'Runtime skal laste Etne-artskartet');
assert(bridge.includes('klass.includes("actinopteryg")'), 'Fisk skal gjenkjennes fra taksonomisk klasse');
assert(bridge.includes('return "🐟"'), 'Fisk uten bilde skal få fiskeikon');
assert(bridge.includes('nature.floraItems.length + nature.faunaItems.length'), 'Natur-rundingen skal telle flora og fauna samlet');
assert(bridge.includes('window.openNatureCard({ ...item, _kind: kind })'), 'Fiskekort skal åpnes i fullt artskort');

console.log('Etne fish species round mapping OK');
