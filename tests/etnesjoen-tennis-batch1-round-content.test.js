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
assert.deepStrictEqual(profiles.sport, expectedRounds, 'Etne tennisanlegg skal bruke den dokumenterte sportprofilen');

const placePath = 'data/places/sport/vestland/etne/etne_tennisanlegg.json';
const place = readJson(placePath)[0];
const peoplePath = 'people/sport/vestland/etne/harald_ekornrud.json';
const person = readJson(`data/${peoplePath}`)[0];
const peopleManifest = readJson('data/people/manifest.json');
const relations = readJson('data/relations.json');
const relation = relations.find((row) => row.id === 'rel_harald_ekornrud_etne_tennisanlegg');
const storyPath = 'data/stories/stories_etnesjoen_sport_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_etne_tennis_fra_1992_til_to_bookbare_baner');
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json';
const article = readJson(leksikonPath).find((row) => row.place_id === place.id);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));
const validEmneIds = new Set(readJson('data/fag/sport/emner_sport_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/sport.json').sub);

assert.strictEqual(place.category, 'sport', 'Tennisanlegget skal halde fram som sportsstad');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'play', 'nature_profile']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Sportprofilen skal ikkje få irrelevant eller manuell ${forbidden}`);
}

assert(peopleManifest.files.includes(peoplePath), 'Tennisleiaren skal vere manifestlasta');
assert.strictEqual(person.id, 'harald_ekornrud', 'People-rundingen skal bruke den dokumenterte tennisleiaren');
assert.strictEqual(person.placeId, place.id, 'Harald Ekornrud skal ha tennisanlegget som primæranker');
assert(person.places.includes(place.id), 'Harald Ekornrud skal peike på tennisanlegget i places');
assert(relation, 'People-rundingen skal ha ei eksplisitt person–stad-kopling');
assert.strictEqual(relation.person, person.id, 'Relasjonen skal peike på rett tennisleiar');
assert.strictEqual(relation.place, place.id, 'Relasjonen skal peike på rett tennisanlegg');

assert(storyManifest.files.some((entry) => entry.category === 'sport' && entry.path === storyPath), 'Tennisforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Tennisleksikonet skal vere manifestlasta');
assert(story, 'Tennisanlegget skal ha ei eiga forteljing i sportsfila');
assert(article, 'Tennisanlegget skal ha ein eigen leksikonartikkel i sportsfila');
assert.strictEqual(story.place_id, place.id, 'Forteljinga skal ha tennisanlegget som stadanker');
assert.strictEqual(story.person_id, person.id, 'Forteljinga skal lenkje dagens dokumenterte tennisleiar');
assert.strictEqual(article.place_id, place.id, 'Leksikonartikkelen skal ha tennisanlegget som stadanker');
assert.strictEqual(article.visual.designCode, 'article_sports_history_miniature', 'Leksikonet skal bruke den presise sportshistoriske designkoden');
assert(article.links.entry_ids.includes(story.id), 'Leksikonet skal lenkje tennisforteljinga');

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
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, 'Tennisinnhaldet skal følgje sportprofilen i rett rekkjefølgje');
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Etne tennisanlegg manglar innhald i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Tennisanlegget skal ha kontrollerte HTTPS-kjelder');
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Tennisanlegget skal berre bruke kanoniske sportsemne');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Tennisanlegget skal berre bruke dokumenterte sport-underbadges');
assert(place.training_profile.exercises.length >= 3, 'Treningsrundingen skal ha minst tre trygge introduksjonsøvingar');
assert(/gyldig MATCHi-booking|open og tørr/i.test(place.training_profile.safety), 'Treningsrundingen skal krevje booking og ei trygg speleflate');
assert(/stopp dersom ballar|Kost bana etter spel/i.test(place.training_profile.safety), 'Treningsrundingen skal handtere nabobane og banestell');
assert(place.works.length >= 4, 'Verk-rundingen skal ha gruppe-, bane-, booking- og banestellspor');
assert(place.civication_store.length >= 2, 'Civication-rundingen skal ha minst to stadsspesifikke objekt');
assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objekta skal vere fysiske og stadsspesifikke');
assert(place.brands.length >= 3, 'Aktør-rundingen skal ha klubbgruppe, bookingplattform og banesystem');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal vere komplett');
assert(person.source_urls.length >= 3, 'People-kortet skal ha fleire offisielle rolle- og stadskjelder');
assert(story.sources.length >= 5, 'Tennisforteljinga skal ha breitt kjeldegrunnlag');
assert(article.wikiText.length >= 3 && article.sources.length >= 5, 'Tennisleksikonet skal ha full tekst og breitt kjeldegrunnlag');

assert.deepStrictEqual([place.lat, place.lon, place.year], [59.66795396985244, 5.942168981207253, null], 'Tennisanlegget skal behalde besøksankeret og ukjent fysisk opningsår');
assert.strictEqual(placeIndex.get(place.id)?.year, null, 'Runtime-indeksen skal behalde ukjent fysisk opningsår');

const combined = JSON.stringify({ place, person, relation, story, article });
assert(/starta opp i 1992|starta i 1992/.test(combined), 'Batchen skal dokumentere oppstarten av tennisgruppa');
assert(/to utandørs|to Playrite Clayrite|to eigne/.test(combined) && /Playrite Clayrite/.test(combined), 'Batchen skal dokumentere dei to kunstgrusbanene');
assert(/MATCHi/.test(combined) && /booking/.test(combined), 'Batchen skal dokumentere det digitale bookingsystemet');
assert(/kosta|kostar|koste|Kost/.test(combined) && /sanden|sand/.test(combined), 'Batchen skal dokumentere banestellet etter spel');
assert(/ikkje brukast som bygge- eller opningsår|ikkje dokumentert som opningsår|ikkje når dagens to baner opna/.test(combined), 'Batchen skal halde gruppeåret skilt frå dagens udokumenterte baneopning');
assert(/utan å vise ein faktisk tilgangskode/.test(combined), 'Civication-objektet skal aldri røpe ein reell portkode');

console.log('Etnesjøen tennis batch 1 round content OK');
