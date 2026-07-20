const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const floraManifest = readJson('data/natur/flora/manifest.json');
assert(floraManifest.files.includes('karplanter_etne_langebudalen.json'), 'Floramanifestet skal laste Langebudalen-plantene');

const flora = readJson('data/natur/flora/karplanter_etne_langebudalen.json');
const expected = {
  emne_ved_barlind: 'Taxus baccata',
  emne_bregne_bjonnkam: 'Blechnum spicant',
  emne_siv_heisiv: 'Juncus squarrosus',
  emne_urt_kystmaure: 'Galium saxatile',
  emne_bregne_smoretelg: 'Oreopteris limbosperma',
  emne_urt_rome: 'Narthecium ossifragum',
  emne_kratt_klokkelyng: 'Erica tetralix'
};
assert.strictEqual(flora.length, 7, 'Langebudalen skal ha sju kildebelagte karplanter');
for (const item of flora) {
  assert.strictEqual(item.latin, expected[item.id], `Uventet plante-ID eller latinsk navn: ${item.id}`);
  assert(Array.isArray(item.kjennetegn) && item.kjennetegn.length >= 3, `${item.id} mangler kjennetegn`);
  assert(Array.isArray(item.observasjonstips) && item.observasjonstips.length >= 2, `${item.id} mangler observasjonstips`);
  assert(item.source_urls.includes('https://kringom.no/nb/sunnhordland/etne/langebudalen'), `${item.id} mangler stedskilden Kringom`);
}

const placeManifest = readJson('data/places/manifest.json');
assert(placeManifest.files.includes('places/natur/vestland/langebudalen_naturreservat.json'));
const place = readJson('data/places/natur/vestland/langebudalen_naturreservat.json')[0];
assert.strictEqual(place.id, 'langebudalen_naturreservat');
assert.strictEqual(place.coordStatus, 'verified_geometry');
assert.strictEqual(place.sourceProvider, 'official_map');
assert(place.sourceObjectId, 'Langebudalen mangler stabilt kildeobjekt');
assert(place.nature_profile?.summary?.length >= 180, 'Langebudalen trenger langt naturinnhold');
assert(place.nature_profile?.themes?.length >= 5, 'Langebudalen trenger minst fem naturtemaer');

const map = readJson('data/natur/nature_etne_place_map.json');
assert.deepStrictEqual(map.places.langebudalen_naturreservat.flora, Object.keys(expected));
assert.deepStrictEqual(map.places.langebudalen_naturreservat.fauna, []);
assert(map.places.langebudalen_naturreservat.documentation.includes('Kringom'));

const evidence = readJson('data/coordinate-evidence/vestland/natur/langebudalen_naturreservat.json');
assert.strictEqual(evidence.placeId, 'langebudalen_naturreservat');
assert.strictEqual(evidence.evidenceStatus, 'applied_to_place');
assert.strictEqual(evidence.decision.canBecomeVerified, true);

console.log('Etne Langebudalen nature round mapping OK');
