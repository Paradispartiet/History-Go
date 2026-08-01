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

const hasLocalImage = entity => {
  const image = String(entity?.cardImage || entity?.imageCard || entity?.image || entity?.logo || '').trim();
  return Boolean(image && fs.existsSync(image));
};

const popupOpening = person => String(person?.popupDesc || person?.popupdesc || '')
  .replace(String(person?.name || ''), '')
  .trim()
  .toLocaleLowerCase('nb-NO')
  .split(/\s+/)
  .slice(0, 6)
  .join(' ');

const openingCounts = new Map();
for (const person of peopleById.values()) {
  const opening = popupOpening(person);
  if (opening) openingCounts.set(opening, (openingCounts.get(opening) || 0) + 1);
}

const duplicateOpenings = [...openingCounts.entries()].filter(([, count]) => count > 1);
const peopleWithImages = [...peopleById.values()].filter(hasLocalImage);
const primaryFunctionPeople = [...peopleById.values()].filter(person => {
  const role = String(person?.role || person?.kindLabel || '').trim();
  const tags = new Set((Array.isArray(person?.tags) ? person.tags : []).map(tag => String(tag).toLowerCase()));
  return Boolean(role && (tags.has('domstol') || tags.has('rettsstat') || tags.has('dommer')));
});

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
const objects = Array.isArray(place.objects) ? place.objects : [];
const objectTitles = new Set(objects.map(object => String(object?.title || '').trim()).filter(Boolean));

const quality = {
  peopleVisualCoverage: peopleWithImages.length === peopleById.size,
  primaryFunctionDominates: primaryFunctionPeople.length > peopleById.size / 2,
  peopleTextsAreDistinct: duplicateOpenings.length === 0,
  objectsHaveDepth: objects.length >= 3
    && objectTitles.size === objects.length
    && objects.every(object => hasLocalImage(object) && Array.isArray(object.source_urls) && object.source_urls.length > 0),
  brandsAreReady: brandsByPlace.tinghuset.length > 0
    && brandsByPlace.tinghuset.every(id => {
      const item = brands.find(candidate => candidate.id === id);
      return item && hasLocalImage(item) && Array.isArray(item.source_urls) && item.source_urls.length > 0;
    })
};

const report = fs.readFileSync('reports/place-production/tinghuset-politikk-v1.md', 'utf8');
const markedProductionReady = /Status for samlet sted:\s*\*\*produksjonsklart\*\*/i.test(report);
if (markedProductionReady) {
  for (const [gate, passed] of Object.entries(quality)) {
    assert.equal(passed, true, `Oslo tinghus kan ikke være produksjonsklart: ${gate} feiler`);
  }
} else {
  assert.match(report, /Status for samlet sted:\s*\*\*under sanering[^*]*\*\*/i);
}

const cardRuntime = fs.readFileSync('js/ui/place-card.js', 'utf8');
assert.match(cardRuntime, /persons\?\.find\(person => person\?\.cardImage \|\| person\?\.imageCard \|\| person\?\.image\)/);
assert.match(cardRuntime, /const personDesc = String\(p\.desc \|\| ""\)\.trim\(\)/);
assert.doesNotMatch(cardRuntime, /const personDesc = String\(p\.popupDesc \|\| p\.popupdesc \|\| p\.desc/);

const failedGates = Object.entries(quality).filter(([, passed]) => !passed).map(([gate]) => gate);
console.log(`Oslo tinghus round audit: ${peopleWithImages.length}/${peopleById.size} People med bilde, ${objects.length} Objects, ${brandsByPlace.tinghuset.length} Brands; uferdige porter: ${failedGates.join(', ') || 'ingen'}`);
