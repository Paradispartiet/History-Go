const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'nature', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const artProfileMatch = runtimeSource.match(/kunst:\s*\[([^\]]+)\]/);
assert(artProfileMatch, 'Runtime skal ha en dokumentert kunstprofil');
assert.deepStrictEqual(JSON.parse(`[${artProfileMatch[1]}]`), expectedRounds, 'Skånevik kulturhall skal bruke kunstprofilen');

const place = readJson('data/places/kunst/vestland/etne/skanevik_kultur_og_idrettshall.json')[0];
const people = readJson('data/people/kunst/vestland/etne/people_skanevik_kultur_og_idrettshall_batch1.json');
const peopleIds = ['jan_henning_jespersen', 'leif_jonny_johansen'];
const peopleById = new Map(people.map((person) => [person.id, person]));
const relations = readJson('data/relations.json').filter((row) => row.place === place.id && peopleIds.includes(row.person));
const storyPath = 'data/stories/stories_etnesjoen_kunst_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_skanevik_kulturhall_22000_dugnadstimar');
const articlePath = 'data/leksikon/places/vestland/etne/kunst/leksikon_etnesjoen_kunst_rounds_batch1.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const validEmneIds = new Set(readJson('data/fag/kunst/emner_kunst_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/kunst.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'kunst');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Skånevik kulturhall skal ikke ha ${forbidden}`);
}

for (const personId of peopleIds) {
  const person = peopleById.get(personId);
  assert(person, `Manglende personkort: ${personId}`);
  assert.strictEqual(person.placeId, place.id, `${personId} skal ha hallen som primæranker`);
  assert(person.places.includes(place.id), `${personId} skal peke på hallen`);
}
assert.strictEqual(relations.length, 2, 'People-rundingen skal ha to dokumenterte personkoblinger');
assert(relations.some((row) => row.person === 'jan_henning_jespersen' && /byggjeleiar/.test(row.type)), 'Jan Henning Jespersen skal være koblet som byggeleder');
assert(relations.some((row) => row.person === 'leif_jonny_johansen' && /innreiingsleiar/.test(row.type)), 'Leif Jonny Johansen skal være koblet som innredningsleder');
assert(story && story.place_id === place.id, 'Fortellingen skal være knyttet til hallen');
assert.strictEqual(story.person_id, 'jan_henning_jespersen', 'Fortellingen skal bruke den dokumenterte byggelederen som hovedanker');
assert(article && article.place_id === place.id, 'Leksikonartikkelen skal være knyttet til hallen');
assert(article.links.entry_ids.includes(story.id), 'Leksikonet skal lenke hovedfortellingen');

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
  assert(filled, `Skånevik kulturhall mangler ${roundId}`);
}

assert(place.externalLinks.length >= 4 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Hallen skal ha kontrollerte HTTPS-kilder');
assert(place.works.length >= 7, 'Verk-rundingen skal dokumentere hele bygge- og kulturforløpet');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Alle kunstemner skal være kanoniske');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle kunst-underbadges skal være kanoniske');
assert(place.nature_profile.themes.length >= 5 && place.nature_profile.nearby_place_ids.length >= 3, 'Natur-rundingen skal beskrive skuleveg, sentrum og værskjerming');
assert(place.brands.length >= 5, 'Aktør-rundingen skal dokumentere hall, initiativ, Torgdagar, kommune og idrettslag');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(story.sources.length >= 4, 'Fortellingen skal ha bredt kildegrunnlag');
assert(article.wikiText.length >= 4 && article.sources.length >= 4, 'Leksikonet skal ha full tekst og kilder');
assert.deepStrictEqual([place.lat, place.lon, place.year], [59.731053106182465, 5.922931264241455, null], 'Kartverket-ankeret og eksisterende ukjent stedår skal bevares');
assert.strictEqual(placeIndex.get(place.id)?.year, null, 'Runtime-indeksen skal beholde ukjent stedår');

const combined = JSON.stringify({ place, people, relations, story, article });
assert(/1985/.test(combined) && /Torgdagane/.test(combined), 'Torgdagene fra 1985 skal være dokumentert');
assert(/1986/.test(combined) && /1,5 million/.test(combined), 'Det kommunale vedtaket fra 1986 skal være dokumentert');
assert(/1989/.test(combined) && /veggelement/.test(combined), 'Byggemilepælen fra 1989 skal være dokumentert');
assert(/1991/.test(combined) && /22 000/.test(combined), 'Første etasje og dugnadstimene skal være dokumentert');
assert(/3\. januar 1992/.test(combined), 'Første gymtime skal være dokumentert med dato');
assert(/hausten 1994/.test(combined), 'Full innvielse høsten 1994 skal være dokumentert');
assert(/revy/.test(combined) && /julemarknad/.test(combined), 'Kulturbruken skal være synlig');
assert(!/Jan Henning Jespersen bygde hallen alene|Leif Jonny Johansen innredet alt alene/i.test(combined), 'Batchen skal ikke overdrive enkeltpersonenes roller');
assert(!/22 000 dugnadstimar totalt for alle år etter 1994/i.test(combined), 'Dugnadstallet skal ikke generaliseres utover kilden');
assert(!/artar ved staden|flora ved staden|fauna ved staden/i.test(combined), 'Natur-rundingen skal ikke dikte inn arter');

console.log('Skånevik kulturhall batch 1 round content OK');
