const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const batchFile = 'people/litteratur/vestland/etne/people_litteratur_etne_batch1.json';
const expected = new Map([
  ['ingvar_moe', 'ingvar_moe_byste_etne'],
  ['olav_vik', 'olav_vik_garden_osnes'],
  ['johan_ebne', 'gurine_johan_ebnes_minde']
]);

const manifest = readJson('data/people/manifest.json');
assert(Array.isArray(manifest.files), 'People-manifestet skal ha ei files-liste');
assert.strictEqual(
  manifest.files.filter((file) => file === batchFile).length,
  1,
  `${batchFile} skal vere registrert nøyaktig éin gong`
);

const batch = readJson(`data/${batchFile}`);
assert(Array.isArray(batch), 'Batch 9-fila skal vere ei liste');
assert.strictEqual(batch.length, expected.size, 'Batch 9 skal innehalde nøyaktig tre personar');
assert.strictEqual(new Set(batch.map((person) => person.id)).size, batch.length, 'Batch 9 skal ha unike ID-ar');

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
for (const person of batch) {
  const expectedPlace = expected.get(person.id);
  assert(expectedPlace, `Uventa person i batch 9: ${person.id}`);
  assert.strictEqual(person.placeId, expectedPlace, `${person.id} har feil primæranker`);
  assert.deepStrictEqual(person.places, [expectedPlace], `${person.id} skal ha éi presis place-lenkje`);
  assert.strictEqual(person.category, 'litteratur', `${person.id} skal ha litteraturkategori`);
  assert(activePlaces.has(expectedPlace), `${person.id} peikar på eit inaktivt place: ${expectedPlace}`);
  assert(Array.isArray(person.source_urls) && person.source_urls.length > 0, `${person.id} manglar kjelder`);
  assert(person.source_urls.every((url) => url.startsWith('https://')), `${person.id} har ugyldig kjelde-URL`);
  assert.strictEqual(person.verifiedAt, '2026-07-18', `${person.id} har feil verifiseringsdato`);
}

const canonicalCounts = new Map();
for (const file of manifest.files) {
  const data = readJson(`data/${file}`);
  const people = Array.isArray(data) ? data : [data];
  for (const person of people) {
    if (expected.has(person.id)) {
      canonicalCounts.set(person.id, (canonicalCounts.get(person.id) || 0) + 1);
    }
  }
}

for (const id of expected.keys()) {
  assert.strictEqual(canonicalCounts.get(id), 1, `${id} skal finnast nøyaktig éin gong globalt`);
}

assert(!batch.some((person) => person.id === 'gurine_ebne'), 'Gurine Ebne skal ikkje inkluderast utan sterkare rollekjelde');

console.log('Etne People of Places batch 9 OK (3 literary people, 3 direct place links)');
