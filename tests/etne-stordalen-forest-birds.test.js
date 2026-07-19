const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const manifest = readJson('data/natur/fauna/manifest.json');
assert(manifest.files.includes('fugler_etne_stordalen.json'), 'Faunamanifestet skal laste fugler_etne_stordalen.json');

const newBirds = readJson('data/natur/fauna/fugler_etne_stordalen.json');
const expectedNew = {
  emne_fauna_lovsanger: ['Phylloscopus trochilus', 4374],
  emne_fauna_svarthvit_fluesnapper: ['Ficedula hypoleuca', 209426],
  emne_fauna_gulsanger: ['Hippolais icterina', 4344],
  emne_fauna_munk: ['Sylvia atricapilla', 203675],
  emne_fauna_rodvingetrost: ['Turdus iliacus', 4449],
  emne_fauna_jernspurv: ['Prunella modularis', 203741],
  emne_fauna_hvitryggspett: ['Dendrocopos leucotos', 203614],
  emne_fauna_dvergspett: ['Dryobates minor', 203612],
  emne_fauna_kattugle: ['Strix aluco', 203602]
};

assert.strictEqual(newBirds.length, 9, 'Batchen skal opprette ni manglende skogsfugler');
for (const bird of newBirds) {
  const expected = expectedNew[bird.id];
  assert(expected, `Uventet fugle-ID ${bird.id}`);
  assert.strictEqual(bird.latin, expected[0], `${bird.id} har feil latinsk navn`);
  assert.strictEqual(bird.taxonomy?.artskart_taxon_id, expected[1], `${bird.id} har feil taxon-id`);
  assert.strictEqual(bird.taxonomy?.klasse, 'Aves', `${bird.id} skal være fugl`);
  assert(Array.isArray(bird.kjennetegn) && bird.kjennetegn.length >= 4, `${bird.id} mangler kjennetegn`);
  assert(Array.isArray(bird.observasjonstips) && bird.observasjonstips.length >= 2, `${bird.id} mangler observasjonstips`);
  assert(bird.source_urls?.includes('https://kringom.no/nb/sunnhordland/etne/stordalen'), `${bird.id} mangler stedskilde`);
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

const expectedForestBirds = [
  'emne_fauna_lovsanger',
  'emne_fauna_bokfink',
  'emne_fauna_svarthvit_fluesnapper',
  'emne_fauna_rodstrupe',
  'emne_fauna_gulsanger',
  'emne_fauna_munk',
  'emne_fauna_rodvingetrost',
  'emne_fauna_jernspurv',
  'emne_fauna_svarttrost',
  'emne_fauna_maaltrost',
  'emne_fauna_hvitryggspett',
  'emne_fauna_dvergspett',
  'emne_fauna_kattugle'
];

const map = readJson('data/natur/nature_etne_place_map.json');
const entry = map.places.stordalsvatnet_etne;
for (const id of expectedForestBirds) {
  assert(entry.fauna.includes(id), `Stordalsvatnet mangler dokumentert skogsfugl ${id}`);
}
assert.strictEqual(entry.fauna.length, 23, 'Stordalsvatnet skal ha 23 dokumenterte fisk- og fuglearter etter batchen');
assert.strictEqual(new Set(entry.fauna).size, entry.fauna.length, 'Stordalsvatnet har dupliserte fauna-ID-er');
for (const id of entry.fauna) assert(allFaunaIds.has(id), `Stordalsvatnet peker til ukjent fauna-ID ${id}`);
assert(entry.documentation.includes('gråorskogen ved Hellaug'), 'Kartdokumentasjonen skal forklare Hellaug-utvalget');
assert(map.meta.sources.includes('https://kringom.no/nb/sunnhordland/etne/stordalen'));

console.log('Etne Stordalen forest bird mapping OK');
