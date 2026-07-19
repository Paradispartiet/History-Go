const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const manifest = readJson('data/natur/flora/manifest.json');
const allFlora = new Map();

const flatten = items => {
  for (const item of Array.isArray(items) ? items : []) {
    if (item?.kind === 'emne_pack' && Array.isArray(item.items)) flatten(item.items);
    else if (item?.id) allFlora.set(String(item.id), item);
  }
};

for (const file of manifest.files) flatten(readJson(`data/natur/flora/${file}`));

const expected = [
  ['emne_ved_graor', 'Alnus incana'],
  ['emne_ved_osp', 'Populus tremula'],
  ['emne_ved_alm', 'Ulmus glabra'],
  ['emne_ved_lind', 'Tilia spp.'],
  ['emne_ved_ask', 'Fraxinus excelsior'],
  ['emne_ved_selje', 'Salix caprea'],
  ['emne_kratt_einer', 'Juniperus communis']
];

for (const [id, latin] of expected) {
  const item = allFlora.get(id);
  assert(item, `Faunamanifestet mangler florakort ${id}`);
  assert.strictEqual(item.latin, latin, `${id} har feil latinsk navn`);
}

const map = readJson('data/natur/nature_etne_place_map.json');
const entry = map.places.stordalsvatnet_etne;
const expectedIds = expected.map(([id]) => id);

assert.deepStrictEqual(entry.flora, expectedIds, 'Stordalsvatnet skal ha den kildebelagte Stordalen-floraen i fast rekkefølge');
assert.strictEqual(new Set(entry.flora).size, entry.flora.length, 'Stordalsvatnet har dupliserte flora-ID-er');
for (const id of entry.flora) assert(allFlora.has(id), `Stordalsvatnet peker til ukjent flora-ID ${id}`);

assert(entry.documentation.includes('gråorskog'), 'Dokumentasjonen skal forklare gråorskogen');
assert(entry.documentation.includes('lauving eller styving'), 'Dokumentasjonen skal forklare kulturskogen');
assert(entry.documentation.includes('eineren'), 'Dokumentasjonen skal forklare einerkoblingen');
assert(map.meta.sources.includes('https://kringom.no/nb/sunnhordland/etne/stordalen'));
assert(map.meta.sources.includes('https://kringom.no/nb/sunnhordland/etne'));

console.log('Etne Stordalen flora mapping OK');
