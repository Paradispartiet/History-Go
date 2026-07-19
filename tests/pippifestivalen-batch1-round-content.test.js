const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'nature', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const artProfileMatch = runtimeSource.match(/kunst:\s*\[([^\]]+)\]/);
assert(artProfileMatch, 'Runtime skal ha en dokumentert kunstprofil');
assert.deepStrictEqual(JSON.parse(`[${artProfileMatch[1]}]`), expectedRounds, 'Pippifestivalen skal bruke kunstprofilen');

const place = readJson('data/places/kunst/vestland/etne/skanevik_fjordhotel_pippifestivalen.json')[0];
const people = readJson('data/people/kunst/vestland/etne/pippifestivalen/people_pippifestivalen_batch1.json');
const peopleIds = ['inger_karin_larsen', 'bard_henrik_tungesvik_hereide', 'theresa_tungesvik_hereide'];
const peopleById = new Map(people.map((person) => [person.id, person]));
const relations = readJson('data/relations.json').filter((row) => row.place === place.id && peopleIds.includes(row.person));
const storyPath = 'data/stories/stories_etnesjoen_kunst_rounds_batch1.json';
const story = readJson(storyPath).find((row) => row.id === 'st_pippifestivalen_fra_regnving_til_utsolgt_hotellhage');
const articlePath = 'data/leksikon/places/vestland/etne/kunst/leksikon_etnesjoen_kunst_rounds_batch1.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const validEmneIds = new Set(readJson('data/fag/kunst/emner_kunst_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/kunst.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'kunst');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Pippifestivalen skal ikke ha ${forbidden}`);
}

for (const personId of peopleIds) {
  const person = peopleById.get(personId);
  assert(person, `Manglende personkort: ${personId}`);
  assert.strictEqual(person.placeId, place.id, `${personId} skal ha festivalstedet som primæranker`);
  assert(person.places.includes(place.id), `${personId} skal peke på festivalstedet`);
}
assert.strictEqual(relations.length, peopleIds.length, 'People-rundingen skal ha tre dokumenterte personkoblinger');
assert(relations.some((row) => row.person === 'inger_karin_larsen'), 'Hotell- og festivalankeret skal være koblet');
assert(relations.some((row) => row.person === 'bard_henrik_tungesvik_hereide'), 'Bård Henrik Hereide skal være koblet som teaterleder');
assert(relations.some((row) => row.person === 'theresa_tungesvik_hereide'), 'Theresa Hereide skal være koblet som teaterleder');
assert(story && story.place_id === place.id, 'Fortellingen skal være knyttet til festivalstedet');
assert.strictEqual(story.person_id, 'inger_karin_larsen', 'Fortellingen skal bruke hotell- og festivalankeret');
assert(article && article.place_id === place.id, 'Leksikonartikkelen skal være knyttet til festivalstedet');
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
  assert(filled, `Pippifestivalen mangler ${roundId}`);
}

assert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Festivalstedet skal ha kontrollerte HTTPS-kilder');
assert(place.works.length >= 5, 'Verk-rundingen skal dokumentere produksjoner og festivalspor fra 2019 til 2026');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.emne_ids.every((id) => validEmneIds.has(id)), 'Alle kunstemner skal være kanoniske');
assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle kunst-underbadges skal være kanoniske');
assert(place.nature_profile.themes.length >= 5 && place.nature_profile.nearby_place_ids.length >= 3, 'Natur-rundingen skal beskrive hotellhage, strand, fjord og vær');
assert(place.brands.length >= 4, 'Aktør-rundingen skal dokumentere festival, teater, hotell og kommune');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(story.sources.length >= 5, 'Fortellingen skal ha bredt kildegrunnlag');
assert(article.wikiText.length >= 4 && article.sources.length >= 6, 'Leksikonet skal ha full tekst og bredt kildegrunnlag');
assert.deepStrictEqual([place.lat, place.lon, place.year], [59.73258264147061, 5.931458034959808, null], 'Kartverket-ankeret og ukjent etableringsår skal bevares');
assert.strictEqual(placeIndex.get(place.id)?.year, null, 'Runtime-indeksen skal beholde ukjent etableringsår');

const combined = JSON.stringify({ place, people, relations, story, article });
assert(/2019/.test(combined) && /Ronja/.test(combined), '2019-produksjonen skal være dokumentert');
assert(/2020/.test(combined) && /minste sommarfestival|mindre sommerfestival/.test(combined), '2020-tilpasningen skal være dokumentert');
assert(/2023/.test(combined) && /seks forestillinger/.test(combined), '2023-produksjonen skal være dokumentert');
assert(/2025/.test(combined) && /utsolgt/.test(combined), 'Utsolgt forestilling i 2025 skal være dokumentert');
assert(/9.–12\. juli 2026/.test(combined), 'Annonserte 2026-datoer skal være dokumentert');
assert(/annonsert program|annonserte festivaldatoene|programspor/.test(combined), '2026 skal behandles som annonsert programspor');
assert(!/2026-utgaven var utsolgt|2026 ble en suksess|rekordpublikum i 2026/i.test(combined), 'Batchen skal ikke dikte resultat for 2026-utgaven');
assert(!/artar ved staden|flora ved staden|fauna ved staden/i.test(combined), 'Natur-rundingen skal ikke dikte inn arter');
assert(!/Skånevik Bluesfestival er Pippifestivalen|samme festival som Bluesfestivalen/i.test(combined), 'Pippifestivalen skal ikke blandes med bluesfestivalen');

console.log('Pippifestivalen batch 1 round content OK');
