const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/kuba_parken.json';
const place = readJson(placePath);

assert.strictEqual(place.id, 'kuba_parken');
assert.strictEqual(place.name, 'Kuba-parken');
assert.strictEqual(place.year, 1928, 'Parkens canonical år skal være anleggsåret 1928');
assert.strictEqual(place.lat, 59.92472, 'Koordinaten skal ikke endres i rundingsbatchen');
assert.strictEqual(place.lon, 10.75244, 'Koordinaten skal ikke endres i rundingsbatchen');
assert.strictEqual(place.r, 180, 'Radius skal ikke endres i rundingsbatchen');
assert.strictEqual(place.coordSourceId, 'aroundus:8957874', 'Eksisterende coordinate source skal bevares');

assert(Array.isArray(place.tasks_profile?.tasks) && place.tasks_profile.tasks.length >= 4, 'Oppgaver-rundingen skal være fylt');
assert(Array.isArray(place.training_profile?.exercises) && place.training_profile.exercises.length >= 3, 'Trening-rundingen skal være fylt');
assert(Array.isArray(place.civication_store) && place.civication_store.length >= 4, 'Civication-rundingen skal være fylt');
assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(Array.isArray(place.brands) && place.brands.length >= 4, 'Aktører-rundingen skal være fylt');
assert(place.for_na?.before && place.for_na?.now && place.for_na?.change, 'Før/nå-rundingen skal være komplett');
assert(Array.isArray(place.underbadge_ids) && place.underbadge_ids.includes('pollinatorer'), 'Badge-rundingen skal ha stedsspesifikke naturkoblinger');

const inventory = place.nature_profile?.species_inventory;
assert(inventory, 'Natur-rundingen skal ha eksplisitt species_inventory');
assert.deepStrictEqual(inventory.flora.map((row) => row.id), ['emne_flora_snobaer']);
assert.deepStrictEqual(inventory.fauna.map((row) => row.id), ['emne_fauna_honningbie']);
assert.strictEqual(inventory.total_species, 2, 'Bare de to aktivt kartlagte artene skal tas med');

const expansionMap = readJson('data/natur/nature_oslo_expansion_place_map.json');
assert.deepStrictEqual(expansionMap.places.kuba_parken.flora, ['emne_flora_snobaer']);
assert.deepStrictEqual(expansionMap.places.kuba_parken.fauna, ['emne_fauna_honningbie']);

const stories = readJson('data/stories/stories_kuba_parken.json');
const story = stories.find((row) => row.place_id === 'kuba_parken');
assert(story, 'Fortelling mangler');
assert.strictEqual(story.year, 1928);
assert(story.story.includes('gassklokke'), 'Fortellingen skal være stedsspesifikk');
assert(Array.isArray(story.sources) && story.sources.length >= 3, 'Fortellingen skal ha eksternt kildegrunnlag');

const articles = readJson('data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch1.json');
const article = articles.find((row) => row.place_id === 'kuba_parken');
assert(article, 'Leksikonartikkel mangler');
assert.strictEqual(article.version, 2);
assert(Array.isArray(article.facts) && article.facts.length >= 6, 'Leksikonet skal ha stedsspesifikke fakta');
assert(Array.isArray(article.sources) && article.sources.length >= 4, 'Leksikonet skal ha kildegrunnlag');
assert(article.wikiText.join(' ').includes('1928'));
assert(article.wikiText.join(' ').includes('1925'));
assert(article.wikiText.join(' ').includes('1973'));

const routeIndex = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json');
const indexRow = routeIndex.find((row) => row.id === 'kuba_parken');
assert(indexRow, 'Kuba mangler i route index');
assert.strictEqual(indexRow.year, 1928, 'Route index skal følge canonical år');

const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const start = runtimeSource.indexOf('const PLACE_ROUND_REGISTRY = [');
const end = runtimeSource.indexOf('const PLACE_CARD_QUIZ_CARD_BY_ID', start);
assert(start >= 0 && end > start, 'Fant ikke PlaceCard round runtime');
const sandbox = { window: {}, console: { warn() {} } };
vm.createContext(sandbox);
vm.runInContext(runtimeSource.slice(start, end), sandbox);
const rounds = Array.from(sandbox.window.HGPlaceRounds.get(place), (def) => def.id);
assert.deepStrictEqual(rounds, ['tasks', 'nature', 'badges', 'training', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon']);

console.log('Kuba-parken nature rounds batch 1 OK');
