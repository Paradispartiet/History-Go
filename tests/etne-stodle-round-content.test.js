const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const place = readJson('data/places/historie/vestland/etne/stodle_kyrkje.json');
const relations = readJson('data/relations.json').filter((row) => row.place === place.id);
const storyManifest = readJson('data/stories/stories_manifest.json');
const stories = readJson('data/stories/stories_stodle_kyrkje.json');
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikon = readJson('data/leksikon/places/vestland/etne/historie/leksikon_etne_historie_stodle.json');

const expectedHistoryRounds = [
  'people',
  'nature',
  'badges',
  'works',
  'civication',
  'brands',
  'før_nå',
  'fortellinger',
  'leksikon'
];

const roundContent = {
  people: relations,
  nature: place.nature_profile,
  badges: place.underbadge_ids,
  works: place.works,
  civication: place.civication_store,
  brands: place.brands,
  før_nå: place.for_na,
  fortellinger: stories,
  leksikon
};

for (const roundId of expectedHistoryRounds) {
  const value = roundContent[roundId];
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Stødle mangler innhold i rundingen ${roundId}`);
}

assert.deepStrictEqual(
  relations.map((row) => row.person).sort(),
  ['erling_skakke', 'magnus_erlingsson'],
  'People-rundingen skal bruke de to kanoniske Stødle-personene'
);
assert(place.nature_profile.themes.length >= 3, 'Natur-rundingen skal ha stedsspesifikke tema');
assert.deepStrictEqual(place.underbadge_ids, ['middelalder', 'kulturminner_og_bevaring']);
assert(place.works.length >= 3, 'Verk-rundingen skal vise flere bygningslag');
assert(place.civication_store.every((item) => item.placeSpecific === true), 'Civication-objekter skal være stedsspesifikke');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå skal beskrive før, nå og endring');

assert(
  storyManifest.files.some((row) => row.entity_id === place.id && row.path === 'data/stories/stories_stodle_kyrkje.json'),
  'Stødle-fortellingen skal være lastet fra hovedmanifestet'
);
assert(stories.every((story) => story.place_id === place.id && story.sources.length >= 2), 'Stødle-fortellinger skal ha sted og kilder');
assert(/ikkje sikkert|halde.*ope|usik/i.test(stories[0].story), 'Byggherrespørsmålet skal formidles med kildekritisk forbehold');

const leksikonPath = 'data/leksikon/places/vestland/etne/historie/leksikon_etne_historie_stodle.json';
assert(leksikonManifest.files.includes(leksikonPath), 'Stødle-artikkelen skal være lastet fra leksikonmanifestet');
assert.strictEqual(leksikon[0].place_id, place.id);
assert(leksikon[0].wikiText.length >= 3, 'Leksikon-rundingen skal ha en full stedstekst');

assert(place.externalLinks.length >= 3, 'Stødle skal ha eksplisitte kilde- og faglenker');
assert(place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Alle eksterne kildelenker skal bruke HTTPS');

console.log('Etne Stødle round content OK');
