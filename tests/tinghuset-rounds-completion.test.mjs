import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const manifest = readJson('data/people/manifest.json');
const peopleFiles = manifest.files.filter(file => file.includes('tinghuset') || file.includes('politics_places_batch_02') || file.includes('uncovered_places_batch_01'));
const people = peopleFiles.flatMap(file => {
  const value = readJson(`data/${file}`);
  return Array.isArray(value) ? value : Array.isArray(value.people) ? value.people : [value];
});
const tinghusetPeople = people.filter(person => person.placeId === 'tinghuset' || person.places?.includes('tinghuset'));
const peopleById = new Map(tinghusetPeople.map(person => [person.id, person]));

for (const id of ['ole_lislerud', 'oivind_astein', 'yngve_svendsen', 'nina_sundbye', 'svein_strand', 'svein_bolling', 'ingunn_skogholt']) {
  assert.ok(peopleById.has(id), `mangler canonical Oslo tinghus-person ${id}`);
}
assert.equal(peopleById.size >= 7, true, 'Oslo tinghus skal ha et reelt persongalleri');

const yngve = peopleById.get('yngve_svendsen');
assert.equal(yngve.imageMeta.source, 'history_go_editorial_illustration');
assert.equal(yngve.imageMeta.mediaType, 'editorial_illustration');
assert.equal(yngve.imageMeta.reviewStatus, 'identity_and_editorial_review_passed');
assert.match(yngve.imageMeta.disclosure, /Illustrasjon.*ikke fotografi/i);
assert.ok(fs.existsSync(yngve.image));
assert.ok(fs.existsSync(yngve.cardImage));

const brands = readJson('data/brands/brands_master.json');
const brandsByPlace = readJson('data/brands/brands_by_place.json');
const brand = brands.find(item => item.id === 'beate_ellingsen_as');
assert.ok(brand, 'mangler canonical Beate Ellingsen AS-brand');
assert.equal(brand.state, 'catalog');
assert.ok(brandsByPlace.tinghuset.includes(brand.id));
assert.ok(fs.existsSync(brand.logo));
assert.ok(brand.source_urls.includes('https://beate-ellingsen.no/oslo-tinghus'));

const place = readJson('data/places/politikk/oslo/places_politikk/tinghuset.json');
assert.ok(place.objects?.some(object => object.image && fs.existsSync(object.image)), 'Objects-preview mangler');

const cardRuntime = fs.readFileSync('js/ui/place-card.js', 'utf8');
assert.match(cardRuntime, /persons\?\.find\(person => person\?\.cardImage \|\| person\?\.imageCard \|\| person\?\.image\)/);

console.log('Oslo tinghus rounds completion OK: People, Objects and Brands are image-ready');
