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
assert.deepStrictEqual(profiles.sport, expectedRounds, 'BMX- og skateparken skal bruke den dokumenterte sportprofilen');

const place = readJson('data/places/sport/vestland/etne/etne_bmx_og_skatepark.json')[0];
const peoplePath = 'people/sport/vestland/etne/etne_bmx_og_skatefellesskapet.json';
const person = readJson(`data/${peoplePath}`)[0];
const peopleManifest = readJson('data/people/manifest.json');
const relations = readJson('data/relations.json');
const relation = relations.find((row) => row.id === 'rel_etne_bmx_skatefellesskapet_etne_bmx_og_skatepark');
const storyPath = 'data/stories/stories_etnesjoen_sport_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_etne_bmx_skate_eigen_arena_i_stadionvegen');
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/sport/leksikon_etnesjoen_sport_rounds_batch1.json';
const article = readJson(leksikonPath).find((row) => row.place_id === place.id);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validEmneIds = new Set(readJson('data/fag/sport/emner_sport_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/sport.json').sub);

assert.strictEqual(place.category, 'sport');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks_profile', 'play', 'nature_profile']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Sportprofilen skal ikkje få irrelevant eller manuell ${forbidden}`);
}
assert(peopleManifest.files.includes(peoplePath), 'Det kollektive people-ankeret skal vere manifestlasta');
assert.strictEqual(person.id, 'etne_bmx_og_skatefellesskapet');
assert.strictEqual(person.placeId, place.id);
assert(person.places.includes(place.id));
assert(relation && relation.person === person.id && relation.place === place.id, 'People-rundingen skal ha ei eksplisitt kollektiv stadkopling');
assert(storyManifest.files.some((entry) => entry.category === 'sport' && entry.path === storyPath), 'Sportsforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Sportsleksikonet skal vere manifestlasta');
assert(story && story.place_id === place.id && story.person_id === person.id);
assert(article && article.place_id === place.id);
assert.strictEqual(article.visual.designCode, 'article_sports_history_miniature');
assert(article.links.entry_ids.includes(story.id));

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
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds);
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Etne BMX- og skatepark manglar innhald i rundingen ${roundId}`);
}

assert(place.externalLinks.length >= 4 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)));
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Berre kanoniske sportsemne er tillatne');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Berre dokumenterte sport-underbadges er tillatne');
assert(place.training_profile.exercises.length >= 3);
assert(/hjelm|beskyttelse/i.test(place.training_profile.safety));
assert(/ope, tørt|aktiv køyrelinje|førre brukar/i.test(place.training_profile.safety));
assert(place.works.length >= 4);
assert(place.civication_store.length >= 2);
assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true));
assert(place.brands.length >= 3);
assert(place.for_na.before && place.for_na.now && place.for_na.change);
assert(person.source_urls.length >= 3);
assert(story.sources.length >= 4);
assert(article.wikiText.length >= 3 && article.sources.length >= 4);
assert.deepStrictEqual([place.lat, place.lon, place.year], [59.66795396985244, 5.942168981207253, null]);

const combined = JSON.stringify({ place, person, relation, story, article });
assert(/kollektivt miljøanker|kollektivt_bmx_og_skatefellesskap/.test(combined), 'People-rundingen skal vere kollektiv og ikkje byggje på ein tilfeldig styreleiar');
assert(/pumptracken.*2024|pumptrack.*opna i 2024/i.test(combined), 'Batchen skal dokumentere pumptrack-skiljet');
assert(/ikkje.*opningsår.*BMX|2024 skal derfor aldri|2024 høyrer berre til pumptracken/i.test(combined), '2024 må ikkje feilførast som opningsår for BMX- og skateparken');
assert(!/backflip|salto|stor hoppøving|avansert trikstrening/i.test(combined), 'Treningsrundingen skal ikkje gi risikofylt trikkinstruksjon');

console.log('Etnesjøen BMX/skate batch 1 round content OK');
