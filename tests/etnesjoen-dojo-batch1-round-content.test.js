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
assert.deepStrictEqual(profiles.sport, expectedRounds, 'Etne-dojoen skal bruke den dokumenterte sportprofilen');

const placePath = 'data/places/sport/vestland/etne/etne_kyokushin_dojo.json';
const place = readJson(placePath)[0];
const peoplePath = 'people/sport/vestland/etne/geir_havreberg.json';
const person = readJson(`data/${peoplePath}`)[0];
const peopleManifest = readJson('data/people/manifest.json');
const relations = readJson('data/relations.json');
const relation = relations.find((row) => row.id === 'rel_geir_havreberg_etne_kyokushin_dojo');
const storyPath = 'data/stories/stories_etnesjoen_sport_rounds_batch1.json';
const story = readJson(storyPath)[0];
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json';
const article = readJson(leksikonPath)[0];
const leksikonManifest = readJson('data/leksikon/manifest.json');
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));
const validEmneIds = new Set(readJson('data/fag/sport/emner_sport_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/sport.json').sub);

assert.strictEqual(place.category, 'sport', 'Dojoen skal halde fram som sportsstad');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'play', 'nature_profile']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Sportprofilen skal ikkje få irrelevant eller manuell ${forbidden}`);
}

assert(peopleManifest.files.includes(peoplePath), 'Hovudtrenaren skal vere manifestlasta');
assert.strictEqual(person.id, 'geir_havreberg', 'People-rundingen skal bruke dokumentert klubbgrunnleggjar og hovudtrenar');
assert.strictEqual(person.placeId, place.id, 'Geir Havreberg skal ha dojoen som primæranker');
assert(person.places.includes(place.id), 'Geir Havreberg skal peike på dojoen i places');
assert(relation, 'People-rundingen skal ha ei eksplisitt person–stad-kopling');
assert.strictEqual(relation.person, person.id, 'Relasjonen skal peike på rett instruktør');
assert.strictEqual(relation.place, place.id, 'Relasjonen skal peike på rett dojo');

assert(storyManifest.files.some((entry) => entry.category === 'sport' && entry.path === storyPath), 'Sportforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Sportleksikonet skal vere manifestlasta');
assert.strictEqual(story.place_id, place.id, 'Forteljinga skal ha dojoen som stadanker');
assert.strictEqual(story.person_id, person.id, 'Forteljinga skal bruke den dokumenterte klubbgrunnleggjaren');
assert.strictEqual(article.place_id, place.id, 'Leksikonartikkelen skal ha dojoen som stadanker');
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
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, 'Dojo-innhaldet skal følgje sportprofilen i rett rekkjefølgje');
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Etne-dojoen manglar innhald i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Dojoen skal ha kjeldekontrollerte HTTPS-lenkjer');
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Dojoen skal berre bruke kanoniske sportsemne');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Dojoen skal berre bruke dokumenterte sport-underbadges');
assert(place.training_profile.exercises.length >= 3, 'Treningsrundingen skal ha minst tre instruktørstyrte introduksjonsøvingar');
assert(/annonsert klubbøkt|instruktør/i.test(place.training_profile.safety), 'Treningsrundingen skal krevje organisert instruksjon');
assert(/ikkje tren slag|kumite\/fight krev/i.test(place.training_profile.safety), 'Treningsrundingen skal avvise ukontrollert kontakttrening');
assert(place.works.length >= 4, 'Verk-rundingen skal ha klubb-, dojo-, leir- og treningsspor');
assert(place.civication_store.length >= 2, 'Civication-rundingen skal ha minst to stadsspesifikke objekt');
assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objekta skal vere fysiske og stadsspesifikke');
assert(place.brands.length >= 3, 'Aktør-rundingen skal ha klubb, internasjonalt nettverk og kommune');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal vere komplett');
assert(/ikkje brukast som bygge- eller opningsår|ikkje brukast som udokumentert opningsår/.test(JSON.stringify({ place, article })), 'Batchen skal halde klubbåret skilt frå dojoens ukjende opningsår');
assert(story.sources.length >= 4, 'Forteljinga skal ha minst fire kjelder');
assert(article.wikiText.length >= 3 && article.sources.length >= 5, 'Leksikonet skal ha full tekst og breitt kjeldegrunnlag');

assert.deepStrictEqual([place.lat, place.lon, place.year], [59.66665622691498, 5.935542842911436, null], 'Dojoen skal behalde kontrollert kartanker og ukjent fysisk opningsår');
assert.strictEqual(placeIndex.get(place.id)?.year, null, 'Runtime-indeksen skal behalde ukjent opningsår');

const combined = JSON.stringify({ place, person, relation, story, article });
assert(/30\. desember 1985/.test(combined), 'Batchen skal dokumentere klubbskipinga presist');
assert(/5\. dan|5th Dan/.test(combined) && /hovudtrenar/.test(combined), 'Batchen skal dokumentere Geir Havreberg si rolle og grad');
assert(/130/.test(combined) && /14/.test(combined) && /Spania/.test(combined), 'Batchen skal dokumentere vinterleiren 2023');
assert(/kihon/i.test(combined) && /kata/i.test(combined) && /kumite/i.test(combined), 'Batchen skal dokumentere dei tre treningsspora');

console.log('Etnesjøen dojo batch 1 round content OK');
