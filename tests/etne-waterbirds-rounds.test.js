const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const manifest = readJson('data/natur/fauna/manifest.json');
assert(manifest.files.includes('fugler_etne_vann.json'), 'Faunamanifestet skal laste fugler_etne_vann.json');

const newBirds = readJson('data/natur/fauna/fugler_etne_vann.json');
const expected = {
  emne_fauna_storlom: ['Gavia arctica', 203565],
  emne_fauna_laksand: ['Mergus merganser', 203481],
  emne_fauna_siland: ['Mergus serrator', 3485],
  emne_fauna_sjoorre: ['Melanitta fusca', 203476]
};

assert.strictEqual(newBirds.length, 4, 'Batchen skal opprette fire manglende vannfugler');
for (const bird of newBirds) {
  const expectedData = expected[bird.id];
  assert(expectedData, `Uventet fugle-ID ${bird.id}`);
  assert.strictEqual(bird.latin, expectedData[0], `${bird.id} har feil latinsk navn`);
  assert.strictEqual(bird.taxonomy?.artskart_taxon_id, expectedData[1], `${bird.id} har feil taxon-id`);
  assert.strictEqual(bird.taxonomy?.klasse, 'Aves', `${bird.id} skal være fugl`);
  assert(Array.isArray(bird.kjennetegn) && bird.kjennetegn.length >= 3, `${bird.id} mangler kjennetegn`);
  assert(Array.isArray(bird.observasjonstips) && bird.observasjonstips.length >= 2, `${bird.id} mangler observasjonstips`);
}

const allFaunaIds = new Set();
for (const file of manifest.files) {
  const rows = readJson(`data/natur/fauna/${file}`);
  const flatten = items => {
    for (const item of Array.isArray(items) ? items : []) {
      if (item?.kind === 'emne_pack' && Array.isArray(item.items)) flatten(item.items);
      else if (item?.id) allFaunaIds.add(String(item.id));
    }
  };
  flatten(rows);
}

const map = readJson('data/natur/nature_etne_place_map.json');
const stordalsvatnetBirds = [
  'emne_fauna_storlom',
  'emne_fauna_laksand',
  'emne_fauna_siland',
  'emne_fauna_graahegre',
  'emne_fauna_sjoorre'
];
const etneelvaBirds = [
  'emne_fauna_fossekall',
  'emne_fauna_laksand',
  'emne_fauna_graahegre'
];

for (const id of stordalsvatnetBirds) {
  assert(map.places.stordalsvatnet_etne.fauna.includes(id), `Stordalsvatnet mangler ${id}`);
}
for (const id of etneelvaBirds) {
  assert(map.places.etneelva.fauna.includes(id), `Etneelva mangler ${id}`);
}
for (const [placeId, entry] of Object.entries(map.places)) {
  assert.strictEqual(new Set(entry.fauna).size, entry.fauna.length, `${placeId} har dupliserte fauna-ID-er`);
  for (const id of entry.fauna) assert(allFaunaIds.has(id), `${placeId} peker til ukjent fauna-ID ${id}`);
}

assert(map.meta.sources.includes('https://kringom.no/nb/sunnhordland/etne/stordalen'));
assert(map.meta.sources.includes('https://www.kringom.no/nb/sunnhordland/etne/etneelva'));

console.log('Etne waterbird round mapping OK');
