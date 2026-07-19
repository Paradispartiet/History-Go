const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/beierbrua.json';
const place = readJson(placePath);

assert.strictEqual(place.id, 'beierbrua');
assert.strictEqual(place.name, 'Beierbrua');
assert.strictEqual(place.category, 'by');
assert.strictEqual(place.year, 1837, 'Beierbruas canonical år skal være nybyggingen som kjørebro i 1837');
assert.strictEqual(place.lat, 59.9283, 'Koordinaten skal ikke endres i rundingsbatchen');
assert.strictEqual(place.lon, 10.7464, 'Koordinaten skal ikke endres i rundingsbatchen');
assert.strictEqual(place.r, 120, 'Radius skal ikke endres i rundingsbatchen');

assert(place.nature_profile?.summary, 'Nature-rundingen skal være stedsspesifikt fylt');
assert(!place.nature_profile.species_inventory, 'Beierbrua skal ikke få oppdiktet artsinventar');
assert(Array.isArray(place.works) && place.works.length >= 3, 'Works-rundingen skal være fylt');
assert(place.works.some((row) => row.id === 'beierbrua_1837_kjorebro'), 'Broverket fra 1837 mangler');
assert(place.works.some((row) => row.id === 'skulder_ved_skulder_fabrikkjentene_1986'), 'Fabrikkjentene-skulpturen mangler');
assert(Array.isArray(place.civication_store) && place.civication_store.length >= 3, 'Civication-rundingen skal være fylt');
assert(place.civication_store.every((row) => row.physicalObject === true && row.placeSpecific === true), 'Civication-objekter skal være fysiske og stedsspesifikke');
assert(Array.isArray(place.brands) && place.brands.length >= 3, 'Aktører-rundingen skal være fylt');
assert(place.for_na?.before && place.for_na?.now && place.for_na?.change, 'Før/nå-rundingen skal være komplett');
assert(Array.isArray(place.emne_ids) && place.emne_ids.includes('em_by_infrastruktur_mobilitet'), 'Badge-rundingen skal beholde infrastrukturemnet');

const peopleManifest = readJson('data/people/manifest.json');
const oskarPath = 'people/litteratur/oslo/akerselva/oskar_braaten.json';
assert(peopleManifest.files.includes(oskarPath), 'Oskar Braaten-filen skal være manifestlastet');
const oskarRows = readJson(`data/people/${oskarPath}`);
assert.strictEqual(oskarRows.length, 1);
assert.strictEqual(oskarRows[0].id, 'oskar_braaten');
assert.strictEqual(oskarRows[0].placeId, 'oscar_braaten_statuen', 'Personens primære fysiske anker skal være den eksisterende bysten');
assert(!oskarRows[0].places.includes('beierbrua'), 'Beierbrua skal ikke påstås som fysisk personsted via people.places');

const relations = readJson('data/relations.json');
assert(relations.some((row) => row.id === 'rel_oskar_braaten_beierbrua_litteraert_sted' && row.place === 'beierbrua' && row.person === 'oskar_braaten'), 'Oskar Braaten mangler litterær Beierbrua-relasjon');
assert(relations.some((row) => row.id === 'rel_oskar_braaten_byste_beierbrua' && row.place === 'oscar_braaten_statuen' && row.person === 'oskar_braaten'), 'Oskar Braaten mangler relasjon til sin canonical byste');

const storyPath = 'data/stories/stories_beierbrua.json';
const stories = readJson(storyPath);
const story = stories.find((row) => row.place_id === 'beierbrua');
assert(story, 'Beierbrua-fortellingen mangler');
assert(story.related_people.includes('oskar_braaten'));
assert(story.story.includes('fabrikkjentenes bro'), 'Fortellingen skal bruke det dokumenterte litterære stedsnavnet');
assert(Array.isArray(story.sources) && story.sources.length >= 3, 'Fortellingen skal ha eksternt kildegrunnlag');
const storyManifest = readJson('data/stories/stories_manifest.json');
assert(storyManifest.files.some((row) => row.entity_id === 'beierbrua' && row.path === storyPath), 'Fortellingen skal være manifestlastet');

const articles = readJson('data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json');
const article = articles.find((row) => row.place_id === 'beierbrua');
assert(article, 'Beierbrua-leksikon mangler');
assert.strictEqual(article.version, 2);
assert(Array.isArray(article.facts) && article.facts.length >= 6, 'Leksikonet skal ha stedsspesifikke fakta');
assert(Array.isArray(article.sources) && article.sources.length >= 3, 'Leksikonet skal ha kilder');
assert(article.wikiText.join(' ').includes('1837'));
assert(article.wikiText.join(' ').includes('1974'));
assert(article.wikiText.join(' ').includes('1985'));
assert(article.wikiText.join(' ').includes('1986'));

const routeIndex = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json');
const indexRow = routeIndex.find((row) => row.id === 'beierbrua');
assert(indexRow, 'Beierbrua mangler i route index');
assert.strictEqual(indexRow.year, 1837);

const splitManifest = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json');
const manifestRow = splitManifest.places.find((row) => row.id === 'beierbrua');
assert(manifestRow, 'Beierbrua mangler i split-manifest');
const splitContent = fs.readFileSync(path.join(repo, placePath));
const splitHash = crypto.createHash('sha256').update(splitContent).digest('hex');
assert.strictEqual(manifestRow.sha256, splitHash, 'Split-manifest-hash skal matche Beierbrua-filen');

const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const runtimeStart = runtimeSource.indexOf('const PLACE_ROUND_REGISTRY = [');
const runtimeEnd = runtimeSource.indexOf('const PLACE_CARD_QUIZ_CARD_BY_ID', runtimeStart);
assert(runtimeStart >= 0 && runtimeEnd > runtimeStart, 'Fant ikke PlaceCard round runtime');
const sandbox = { window: {}, console: { warn() {} } };
vm.createContext(sandbox);
vm.runInContext(runtimeSource.slice(runtimeStart, runtimeEnd), sandbox);
const rounds = Array.from(sandbox.window.HGPlaceRounds.get(place), (def) => def.id);
assert.deepStrictEqual(rounds, ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon']);

console.log('Beierbrua rounds batch 1 OK');
