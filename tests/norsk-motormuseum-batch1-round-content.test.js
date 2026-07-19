const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/naeringsliv:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha en dokumentert næringslivsprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'Norsk Motormuseum skal bruke næringslivsprofilen');

const place = readJson('data/places/naeringsliv/vestland/etne/norsk_motormuseum_skanevik.json')[0];
const people = readJson('data/people/naeringsliv/vestland/etne/people_naeringsliv_etne_batch2.json');
const peopleIds = ['ove_wiland', 'paul_hovda', 'gudvin_hovda'];
const peopleById = new Map(people.map((person) => [person.id, person]));
const relations = readJson('data/relations.json').filter((row) => row.place === place.id && peopleIds.includes(row.person));
const storyPath = 'data/stories/stories_etnesjoen_naeringsliv_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_norsk_motormuseum_fra_smv_hall_til_dokumentarmuseum');
const articlePath = 'data/leksikon/places/vestland/etne/naeringsliv/leksikon_etnesjoen_naeringsliv_rounds_batch1.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const validUnderbadgeIds = new Set(readJson('data/badges/naeringsliv.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'naeringsliv');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Museet skal ikke ha ${forbidden}`);
}

for (const personId of peopleIds) {
  const person = peopleById.get(personId);
  assert(person, `Manglende personkort: ${personId}`);
  assert.strictEqual(person.placeId, place.id, `${personId} skal ha museet som primæranker`);
  assert(person.places.includes(place.id), `${personId} skal peke på museet`);
}
assert.strictEqual(relations.length, 3, 'People-rundingen skal ha tre dokumenterte stifterkoblinger');
assert(relations.some((row) => row.person === 'ove_wiland' && /formidlar/.test(row.type)), 'Ove Wiland skal være koblet som stifter og formidler');
assert(relations.some((row) => row.person === 'paul_hovda' && /industrikopling/.test(row.type)), 'Paul Hovda skal dokumentere industrikoblingen');
assert(relations.some((row) => row.person === 'gudvin_hovda' && /medstiftar/.test(row.type)), 'Gudvin Hovda skal være koblet som stifter');
assert(story && story.place_id === place.id && story.person_id === 'ove_wiland', 'Fortellingen skal være forankret i museet og hovedformidleren');
assert(article && article.place_id === place.id && article.links.entry_ids.includes(story.id), 'Leksikonet skal være koblet til fortellingen');

const roundContent = {
  people: relations,
  works: place.works,
  badges: place.underbadge_ids,
  før_nå: place.for_na,
  civication: place.civication_store,
  brands: place.brands,
  nature: place.nature_profile,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds);
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Norsk Motormuseum mangler ${roundId}`);
}

assert(place.externalLinks.length >= 4 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Museet skal ha kontrollerte HTTPS-kilder');
assert(place.works.length >= 6, 'Verk-rundingen skal dekke hall, stiftelse, samling, industri og drift');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle næringslivs-underbadges skal være kanoniske');
assert(place.brands.length >= 4, 'Aktør-rundingen skal dokumentere museum, SMV, kommune og industrifelt');
assert(place.nature_profile.themes.length >= 5, 'Natur-rundingen skal dokumentere fjord, båtbruk og kystnæring');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(story.sources.length >= 4 && article.sources.length >= 4, 'Fortelling og leksikon skal ha bredt kildegrunnlag');
assert.deepStrictEqual([place.lat, place.lon, place.year], [59.73324, 5.93949, 1958], 'Kartanker og industrihistorisk stedår skal bevares');
assert.strictEqual(placeIndex.get(place.id)?.year, 1958, 'Runtime-indeksen skal beholde 1958');

const combined = JSON.stringify({ place, people, relations, story, article });
assert(/1958/.test(combined) && /produksjonshall|produksjonslokale/.test(combined), 'SMV-historien skal være dokumentert');
assert(/1986/.test(combined) && /stifta|stiftet/.test(combined), 'Museumsstiftelsen skal være dokumentert');
assert(/Ove Wiland/.test(combined) && /Paul Hovda/.test(combined) && /Gudvin Hovda/.test(combined), 'Alle tre stiftere skal være med');
assert(/140/.test(combined) && /motorfabrikk/.test(combined), 'Den nasjonale industrikonteksten skal være med');
assert(/1895/.test(combined) && /fiskeflåten/.test(combined), 'Mekaniseringen av fiskeflåten skal være med');
assert(!/museet blei stifta i 1958|museet ble stiftet i 1958/i.test(combined), '1958 skal ikke framstilles som museumsstiftelsesår');
assert(!/samme sted som dagens SMV|dagens SMV-anlegg ligger i museumshallen/i.test(combined), 'Museet skal holdes fysisk skilt fra dagens SMV-anlegg');
assert(!/alle 140 motorfabrikkar er utstilte|alle 140 motorfabrikker er utstilt/i.test(combined), 'Batchen skal ikke overdrive samlingens dekning');
assert(!/artar ved staden|flora ved staden|fauna ved staden/i.test(combined), 'Natur-rundingen skal ikke dikte inn arter');

console.log('Norsk Motormuseum batch 1 round content OK');
