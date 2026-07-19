const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/nedre_foss.json';
const place = readJson(placePath);
assert.strictEqual(place.id, 'nedre_foss');
assert.strictEqual(place.category, 'historie');
assert.strictEqual(place.year, 1220);
assert.strictEqual(place.lat, 59.9256);
assert.strictEqual(place.lon, 10.7435);
assert.strictEqual(place.r, 140);

assert(place.nature_profile?.summary, 'Natur-rundingen skal være fylt');
assert(!place.nature_profile.species_inventory, 'Ingen udokumentert artsliste skal legges inn');
assert(Array.isArray(place.works) && place.works.length >= 4, 'Verk-rundingen skal være fylt');
assert(Array.isArray(place.civication_store) && place.civication_store.length >= 4, 'Civication-rundingen skal være fylt');
assert(place.civication_store.every((row) => row.physicalObject === true && row.placeSpecific === true));
assert(Array.isArray(place.brands) && place.brands.length >= 4, 'Aktører-rundingen skal være fylt');
assert(place.for_na?.before && place.for_na?.now && place.for_na?.change, 'Før/nå skal være komplett');

const peopleManifest = readJson('data/people/manifest.json');
const personManifestPath = 'people/historie/oslo/akerselva/friedrich_gruner.json';
assert(peopleManifest.files.includes(personManifestPath));
const people = readJson(`data/${personManifestPath}`);
assert.strictEqual(people.length, 1);
assert.strictEqual(people[0].id, 'friedrich_gruner');
assert.strictEqual(people[0].placeId, 'nedre_foss');

const relations = readJson('data/relations.json');
assert(relations.some((row) => row.id === 'rel_friedrich_gruner_nedre_foss_1672' && row.place === 'nedre_foss' && row.person === 'friedrich_gruner'));

const storyPath = 'data/stories/stories_nedre_foss.json';
const story = readJson(storyPath).find((row) => row.place_id === 'nedre_foss');
assert(story && story.related_people.includes('friedrich_gruner'));
assert(Array.isArray(story.sources) && story.sources.length >= 4);
const storyManifest = readJson('data/stories/stories_manifest.json');
assert(storyManifest.files.some((row) => row.entity_id === 'nedre_foss' && row.path === storyPath));

const article = readJson('data/leksikon/places/oslo/historie/leksikon_oslo_historie_nedre_foss.json');
assert.strictEqual(article.place_id, 'nedre_foss');
assert.strictEqual(article.version, 2);
assert(Array.isArray(article.facts) && article.facts.length >= 8);
assert(Array.isArray(article.sources) && article.sources.length >= 4);
for (const year of [1220, 1537, 1672, 1801, 2001, 2017]) {
  assert(article.chronology.some((row) => row.year === year), `Mangler kronologiår ${year}`);
}

const routeIndex = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json');
assert.strictEqual(routeIndex.find((row) => row.id === 'nedre_foss')?.year, 1220);
const manifest = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json');
const manifestRow = manifest.places.find((row) => row.id === 'nedre_foss');
assert(manifestRow);
const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(repo, placePath))).digest('hex');
assert.strictEqual(manifestRow.sha256, hash);

const runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const start = runtime.indexOf('const PLACE_ROUND_REGISTRY = [');
const end = runtime.indexOf('const PLACE_CARD_QUIZ_CARD_BY_ID', start);
const sandbox = { window: {}, console: { warn() {} } };
vm.createContext(sandbox);
vm.runInContext(runtime.slice(start, end), sandbox);
const rounds = Array.from(sandbox.window.HGPlaceRounds.get(place), (def) => def.id);
assert.deepStrictEqual(rounds, ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon']);

console.log('Nedre Foss rounds batch 1 OK');
