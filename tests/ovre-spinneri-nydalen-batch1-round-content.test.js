const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];

const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const match = runtimeSource.match(/historie:\s*\[([^\]]+)\]/);
assert(match, 'Runtime skal ha historieprofil');
assert.deepStrictEqual(JSON.parse(`[${match[1]}]`), expectedRounds);

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/seilduksfabrikken_nydalen.json';
const place = readJson(placePath);
const people = readJson('data/people/natur/oslo/people_natur_oslo.json');
const adam = people.find((row) => row.id === 'adam_severin_hiorth_nydalen');
const roll = people.find((row) => row.id === 'oluf_nicolai_roll_nydalen');
const stories = readJson('data/stories/stories_nydalsdammen.json');
const story = stories.find((row) => row.id === 'st_ovre_spinneri_nydalen_elva_under_fabrikken');
const articles = readJson('data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json');
const article = articles.find((row) => row.place_id === place.id);
const quiz = readJson('data/quiz/historie/seilduksfabrikken_nydalen_sets.json');
const validBadges = new Set(readJson('data/badges/historie.json').sub);
const placeIds = new Set(readJson('data/places/places_index.json').map((row) => row.id));

assert.strictEqual(place.id, 'seilduksfabrikken_nydalen', 'Canonical ID skal bevares');
assert.strictEqual(place.name, 'Øvre spinneri (Nydalens Compagnie)');
assert.strictEqual(place.category, 'historie');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.9469, 10.7671, 150, 1856]);
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training', 'flora', 'fauna']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Stedet skal ikke ha ${forbidden}`);
}

assert(adam && adam.places.includes(place.id), 'Adam Hiorth skal være koblet til Øvre spinneri');
assert(roll && roll.placeId === place.id && roll.places.includes('nydalen_industristed'), 'Oluf Roll skal forankres i spinneriet og Nydalen');
assert(roll.source_urls.length >= 3 && roll.image === '' && roll.cardImage === '', 'Roll skal være kildebelagt uten oppdiktede bilder');
assert(story && story.place_id === place.id && story.person_id === roll.id, 'Fortellingen skal være forankret i stedet og Roll');
assert(story.sources.length >= 5 && story.related_people.includes(adam.id), 'Fortellingen skal ha kilder og people-koblinger');
assert(article && article.version >= 2 && article.sources.length >= 5, 'Leksikon-rundingen skal være korrigert og kildebelagt');

const content = {
  people: [adam, roll],
  works: place.works,
  badges: place.underbadge_ids,
  før_nå: place.for_na,
  civication: place.civication_store,
  brands: place.brands,
  nature: place.nature_profile,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(content), expectedRounds);
for (const [roundId, value] of Object.entries(content)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Mangler ${roundId}`);
}

assert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)));
assert(place.underbadge_ids.length >= 4 && place.underbadge_ids.every((id) => validBadges.has(id)));
assert(place.works.length >= 7);
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject && item.placeSpecific));
assert(place.brands.length >= 5);
assert(place.for_na.before && place.for_na.now && place.for_na.change && place.for_na.look_for.length >= 4);
assert(place.nature_profile.summary.length >= 350 && place.nature_profile.themes.length >= 6);
assert.strictEqual(new Set(place.nature_profile.themes).size, place.nature_profile.themes.length);
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['nydalen_industristed', 'nydalsdammen', 'stilla_nydalen']);
for (const id of place.nature_profile.nearby_place_ids) assert(placeIds.has(id), `Ukjent nærkobling ${id}`);

const displayText = JSON.stringify({ place, story, article, quiz });
assert(!/Seilduksfabrikken|Seildugsfabrikken/.test(displayText), 'Feil fabrikkidentitet skal ikke stå i visningsinnholdet');
assert(/Øvre spinneri/.test(displayText));
assert(/14 000/.test(displayText));
assert(/kulvert/i.test(displayText));
assert(/Oluf Nicolai Roll/.test(JSON.stringify({ roll, place, story, article })));
assert(/Christiania Seildugsfabrik/.test(place.popupDesc) && /Øvre Foss/.test(place.popupDesc), 'Identitetsgrensen skal forklares eksplisitt i steddata');

console.log('Øvre spinneri Nydalen batch 1 round content OK');
