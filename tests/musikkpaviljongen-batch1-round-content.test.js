const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'nature', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const artProfileMatch = runtimeSource.match(/kunst:\s*\[([^\]]+)\]/);
assert(artProfileMatch, 'Runtime skal ha en dokumentert kunstprofil');
assert.deepStrictEqual(JSON.parse(`[${artProfileMatch[1]}]`), expectedRounds, 'Musikkpaviljongen skal bruke kunstprofilen');

const place = readJson('data/places/kunst/vestland/etne/musikkpaviljongen_doktorhagen.json')[0];
const person = readJson('data/people/kunst/vestland/etne/people_musikkpaviljongen_doktorhagen_batch1.json')[0];
const relation = readJson('data/relations.json').find((row) => row.id === 'rel_bygdafolket_lions_musikkpaviljongen');
const storyPath = 'data/stories/stories_etnesjoen_kunst_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_musikkpaviljongen_fra_lotteri_til_offentleg_scene');
const articlePath = 'data/leksikon/places/vestland/etne/kunst/leksikon_etnesjoen_kunst_rounds_batch1.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const validEmneIds = new Set(readJson('data/fag/kunst/emner_kunst_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/kunst.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'kunst');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Musikkpaviljongen skal ikke ha ${forbidden}`);
}

assert(person && person.id === 'bygdafolket_og_lions_musikkpaviljongen', 'People-rundingen skal bruke det dokumenterte kollektive miljøankeret');
assert.strictEqual(person.placeId, place.id);
assert(person.places.includes(place.id));
assert(relation && relation.person === person.id && relation.place === place.id, 'People-rundingen skal ha eksplisitt person–sted-kobling');
assert(story && story.place_id === place.id && story.person_id === person.id, 'Fortellingen skal være forankret i stedet og det kollektive miljøankeret');
assert(article && article.place_id === place.id, 'Leksikonartikkelen skal være forankret i stedet');
assert(article.links.entry_ids.includes(story.id), 'Leksikonet skal lenke hovedfortellingen');

const roundContent = {
  people: [relation],
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
  assert(filled, `Musikkpaviljongen mangler ${roundId}`);
}

assert(place.externalLinks.length >= 3 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Stedet skal ha kontrollerte HTTPS-kilder');
assert(place.works.length >= 4, 'Verk-rundingen skal dokumentere finansiering, innviing, overlevering og åpen invitasjon');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Alle kunstemner skal være kanoniske');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle kunst-underbadges skal være kanoniske');
assert(place.nature_profile.themes.length >= 5 && place.nature_profile.nearby_place_ids.length >= 3, 'Natur-rundingen skal beskrive det konkrete hage- og fjordmiljøet');
assert(place.brands.length >= 4, 'Aktør-rundingen skal dokumentere lokalmiljø, Lions, kommunen og musikkmiljøet');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(story.sources.length >= 3, 'Fortellingen skal ha bredt kildegrunnlag');
assert(article.wikiText.length >= 4 && article.sources.length >= 3, 'Leksikonet skal ha full tekst og kilder');
assert.deepStrictEqual([place.lat, place.lon, place.year], [59.7339, 5.9362, 2000], 'Representativt kartanker og dokumentert år skal bevares');
assert.strictEqual(placeIndex.get(place.id)?.year, 2000, 'Runtime-indeksen skal beholde året 2000');

const combined = JSON.stringify({ place, person, relation, story, article });
assert(/3\. juni 2000/.test(combined), 'Den presise innviingsdatoen skal være med');
assert(/lotteri/.test(combined) && /innsamling/.test(combined), 'Den lokale finansieringen skal være med');
assert(/Etne kommune/.test(combined) && /overlevert|overtaking/.test(combined), 'Kommunal overlevering skal være med');
assert(/ståande invitasjon|stående invitasjon/.test(combined), 'Den åpne invitasjonen til lokale musikkrefter skal være med');
assert(!/formann i Lions|arkitekten var|bygget av [A-ZÆØÅ][a-zæøå]+ [A-ZÆØÅ]/.test(combined), 'Batchen skal ikke dikte opp navngitte personer eller roller');
assert(!/artar ved staden|flora ved staden|fauna ved staden/i.test(combined), 'Natur-rundingen skal ikke dikte inn arter');

console.log('Musikkpaviljongen batch 1 round content OK');
