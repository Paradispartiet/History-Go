const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');

const profileMatch = runtimeSource.match(/const CATEGORY_ROUND_PROFILES = Object\.freeze\((\{[\s\S]*?\})\);/);
assert(profileMatch, 'Runtime skal eksponere kategori-profilane statisk');
const profiles = Function(`return (${profileMatch[1]});`)();
const expectedRounds = ['people', 'training', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
assert.deepStrictEqual(profiles.sport, expectedRounds, 'Etne idrettsanlegg skal bruke den dokumenterte sportprofilen');

const placePath = 'data/places/sport/vestland/etne/etne_idrettsanlegg.json';
const place = readJson(placePath)[0];
const peoplePath = 'people/sport/vestland/etne/havard_matre.json';
const person = readJson(`data/${peoplePath}`)[0];
const peopleManifest = readJson('data/people/manifest.json');
const relations = readJson('data/relations.json');
const relation = relations.find((row) => row.id === 'rel_havard_matre_etne_idrettsanlegg');
const storyPath = 'data/stories/stories_etnesjoen_sport_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_etne_idrettsanlegg_fra_1930_til_cup_og_kunstgras');
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json';
const article = readJson(leksikonPath).find((row) => row.place_id === place.id);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));
const validEmneIds = new Set(readJson('data/fag/sport/emner_sport_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/sport.json').sub);

assert.strictEqual(place.category, 'sport', 'Hovudanlegget skal halde fram som sportsstad');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'play', 'nature_profile']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Sportprofilen skal ikkje få irrelevant eller manuell ${forbidden}`);
}

assert(peopleManifest.files.includes(peoplePath), 'Fotballeiaren skal vere manifestlasta');
assert.strictEqual(person.id, 'havard_matre', 'People-rundingen skal bruke den dokumenterte fotballeiaren');
assert.strictEqual(person.placeId, place.id, 'Håvard Matre skal ha hovudanlegget som primæranker');
assert(person.places.includes(place.id), 'Håvard Matre skal peike på hovudanlegget i places');
assert(relation, 'People-rundingen skal ha ei eksplisitt person–stad-kopling');
assert.strictEqual(relation.person, person.id, 'Relasjonen skal peike på rett klubbleiar');
assert.strictEqual(relation.place, place.id, 'Relasjonen skal peike på rett idrettsanlegg');

assert(storyManifest.files.some((entry) => entry.category === 'sport' && entry.path === storyPath), 'Sportforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Sportleksikonet skal vere manifestlasta');
assert(story, 'Idrettsanlegget skal ha ei eiga forteljing i sportsfila');
assert(article, 'Idrettsanlegget skal ha ein eigen leksikonartikkel i sportsfila');
assert.strictEqual(story.place_id, place.id, 'Forteljinga skal ha hovudanlegget som stadanker');
assert.strictEqual(story.person_id, person.id, 'Forteljinga skal lenkje dagens dokumenterte fotballeiar');
assert.strictEqual(article.place_id, place.id, 'Leksikonartikkelen skal ha hovudanlegget som stadanker');
assert.strictEqual(article.visual.designCode, 'article_sports_history_miniature', 'Leksikonet skal bruke den presise sportshistoriske designkoden');
assert(article.links.entry_ids.includes(story.id), 'Leksikonet skal lenkje hovudforteljinga');

const roundContent = {
  people: [relation],
  training: place.training_profile,
  badges: place.underbadge_ids,
  works: place.works,
  civication: place.civication_store,
  brands: place.brands,
  før_nå: place.for_na,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, 'Anleggsinnhaldet skal følgje sportprofilen i rett rekkjefølgje');
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Etne idrettsanlegg manglar innhald i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 8 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Anlegget skal ha breie, kontrollerte HTTPS-kjelder');
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Anlegget skal berre bruke kanoniske sportsemne');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Anlegget skal berre bruke dokumenterte sport-underbadges');
assert(place.training_profile.exercises.length >= 3, 'Treningsrundingen skal ha minst tre trygge lågterskeløvingar');
assert(/ope og ledig|book/i.test(place.training_profile.safety), 'Treningsrundingen skal respektere opning og booking');
assert(/pågåande trening, kamp og vedlikehald|aldri ball nær andre/i.test(place.training_profile.safety), 'Treningsrundingen skal halde publikum unna organisert aktivitet og vedlikehald');
assert(place.works.length >= 4, 'Verk-rundingen skal ha klubb-, cup-, kunstgras- og rehabiliteringsspor');
assert(place.civication_store.length >= 2, 'Civication-rundingen skal ha minst to stadsspesifikke objekt');
assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objekta skal vere fysiske og stadsspesifikke');
assert(place.brands.length >= 3, 'Aktør-rundingen skal ha klubb, cup og fotballkrets');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal vere komplett');
assert(person.source_urls.length >= 3, 'People-kortet skal ha fleire offisielle rolle- og stadskjelder');
assert(story.sources.length >= 6, 'Forteljinga skal ha breitt kjeldegrunnlag');
assert(article.wikiText.length >= 3 && article.sources.length >= 7, 'Leksikonet skal ha full tekst og breitt kjeldegrunnlag');

assert.deepStrictEqual([place.lat, place.lon, place.year], [59.667473131424615, 5.9390847592782725, null], 'Anlegget skal behalde kartankeret og ukjent samla opningsår');
assert.strictEqual(placeIndex.get(place.id)?.year, null, 'Runtime-indeksen skal behalde ukjent samla opningsår');

const combined = JSON.stringify({ place, person, relation, story, article });
assert(/15\. april 1930/.test(combined), 'Batchen skal dokumentere klubbskipinga presist');
assert(/første gong i 1980/.test(combined), 'Batchen skal dokumentere den første Etnecupen');
assert(/160/.test(combined) && /2000/.test(combined) && /9–13/.test(combined), 'Batchen skal dokumentere omfang og aldersspenn for Etnecup');
assert(/64 × 100/.test(combined) && /2010/.test(combined) && /2023/.test(combined), 'Batchen skal dokumentere kunstgrasstorleik og anleggsår');
assert(/kork og kokos|kork- og kokos/.test(combined), 'Batchen skal dokumentere det organiske innfyllet');
assert(/ikkje brukt som opningsår|ikkje brukast som udokumentert opningsår|ikkje eitt felles opningsår/.test(combined), 'Batchen skal halde klubb- og cupår skilde frå ukjent samla opningsår');
assert(/Enge/.test(combined) && /Steinsvollen/.test(combined), 'Batchen skal vise at Etnecup bruker eit banenett utanfor hovudkomplekset');

console.log('Etnesjøen idrettsanlegg batch 1 round content OK');
