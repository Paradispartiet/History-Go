const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'nature', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const artProfileMatch = runtimeSource.match(/kunst:\s*\[([^\]]+)\]/);
assert(artProfileMatch, 'Runtime skal ha ein dokumentert kunstprofil');
assert.deepStrictEqual(JSON.parse(`[${artProfileMatch[1]}]`), expectedRounds, 'House of Blues skal bruke kunstprofilen');

const placePath = 'data/places/kunst/vestland/etne/house_of_blues_skanevik.json';
const place = readJson(placePath)[0];
const peoplePath = 'data/people/musikk/vestland/etne/house_of_blues/people_house_of_blues_batch1.json';
const people = readJson(peoplePath);
const peopleIds = ['alf_warloe_christophersen', 'frode_ronli', 'anders_bru', 'oystein_eldoy', 'knut_konigsberg'];
const personById = new Map(people.map((person) => [person.id, person]));
const relations = readJson('data/relations.json').filter((row) => row.place === place.id && peopleIds.includes(row.person));
const storyPath = 'data/stories/stories_etnesjoen_kunst_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_house_of_blues_fra_festivalscene_til_fast_arena');
const leksikonPath = 'data/leksikon/places/vestland/etne/kunst/leksikon_etnesjoen_kunst_rounds_batch1.json';
const article = readJson(leksikonPath).find((row) => row.place_id === place.id);
const validEmneIds = new Set(readJson('data/fag/kunst/emner_kunst_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/kunst.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'kunst');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `House of Blues skal ikkje ha ${forbidden}`);
}

for (const personId of peopleIds) {
  const person = personById.get(personId);
  assert(person, `Manglar personkortet ${personId}`);
  assert.strictEqual(person.placeId, place.id, `${personId} skal ha House of Blues som primæranker`);
  assert(person.places.includes(place.id), `${personId} skal peike på House of Blues`);
}
assert.strictEqual(relations.length, peopleIds.length, 'People-rundingen skal ha fem dokumenterte personkoplingar');
assert(relations.some((row) => row.person === 'alf_warloe_christophersen'), 'Festivalgeneralen skal vere hovudankeret');
assert(story && story.place_id === place.id, 'Forteljinga skal vere knytt til House of Blues');
assert.strictEqual(story.person_id, 'alf_warloe_christophersen', 'Forteljinga skal bruke det organisatoriske hovudankeret');
assert(article && article.place_id === place.id, 'Leksikonartikkelen skal vere knytt til House of Blues');
assert(article.links.entry_ids.includes(story.id), 'Leksikonet skal lenkje hovudforteljinga');

const roundContent = {
  people: relations,
  works: place.works,
  badges: place.underbadge_ids,
  nature: place.nature_profile,
  civication: place.civication_store,
  brands: place.brands,
  før_nå: place.for_na,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds);
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `House of Blues manglar ${roundId}`);
}

assert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Staden skal ha kjeldekontrollerte lenkjer');
assert(place.works.length >= 5, 'Verk-rundingen skal ha minst fem dokumenterte produksjonsspor');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objekta skal vere fysiske og stadsspesifikke');
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Alle kunstemne skal vere kanoniske');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle kunst-underbadges skal vere kanoniske');
assert(place.nature_profile.themes.length >= 5 && place.nature_profile.nearby_place_ids.length >= 3, 'Natur-rundingen skal skildre det konkrete fjord- og sentrumsmiljøet');
assert(place.brands.length >= 4, 'Aktør-rundingen skal ha scene, festival, artistmiljø og programkanal');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal vere komplett');
assert(story.sources.length >= 5, 'Forteljinga skal ha breitt kjeldegrunnlag');
assert(article.wikiText.length >= 4 && article.sources.length >= 6, 'Leksikonet skal ha full tekst og kjelder');
assert.deepStrictEqual([place.lat, place.lon, place.year], [59.7335160679012, 5.93448709055975, 2007], 'Kartanker og eksisterande stadår skal bevarast');
assert.strictEqual(placeIndex.get(place.id)?.year, 2007, 'Runtime-indeksen skal behalde stadåret');

const combined = JSON.stringify({ place, story, article });
assert(/1997/.test(combined), 'Festivalstarten i 1997 skal vere med');
assert(/2005/.test(combined), 'Dokumentert House of Blues-sceneaktivitet i 2005 skal vere med');
assert(/2007/.test(combined), 'Selskapsåret 2007 skal vere med');
assert(/2026/.test(combined), 'Aktiv sceneverksemd i 2026 skal vere med');
assert(/Stavangerensemblet/.test(combined), 'Den tilbakevendande konsertlinja skal vere synleg');
assert(!/opna i 2007|åpnet i 2007|opningsåret 2007|åpningsåret 2007/i.test(combined), '2007 skal ikkje framstillast som dokumentert fysisk opningsår');
assert(!/artar ved staden|flora ved staden|fauna ved staden/i.test(combined), 'Natur-rundingen skal ikkje dikte inn artar');

console.log('House of Blues batch 1 round content OK');
