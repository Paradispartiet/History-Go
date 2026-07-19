const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const historyProfileMatch = runtimeSource.match(/historie:\s*\[([^\]]+)\]/);
assert(historyProfileMatch, 'Runtime skal ha en dokumentert historieprofil');
assert.deepStrictEqual(JSON.parse(`[${historyProfileMatch[1]}]`), expectedRounds, 'Frysjadammen skal bruke de ni historierundingene');

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/frysjadammen.json';
const place = readJson(placePath);
const peoplePath = 'data/people/natur/oslo/people_natur_oslo.json';
const people = readJson(peoplePath);
const person = people.find((row) => row.id === 'vannreguleringsmannskapet_maridalsvannet');
const peopleManifest = readJson('data/people/manifest.json');
const storyPath = 'data/stories/stories_nydalsdammen.json';
const stories = readJson(storyPath);
const story = stories.find((row) => row.id === 'st_frysjadammen_fra_industriregulering_til_bydrift');
const storyManifest = readJson('data/stories/stories_manifest_natur_batch_01.json');
const articlePath = 'data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json';
const article = readJson(articlePath).find((row) => row.place_id === 'frysjadammen');
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validUnderbadgeIds = new Set(readJson('data/badges/historie.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'historie', 'Frysjadammen skal bruke historieprofilen');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Frysjadammen skal ikke ha ${forbidden}`);
}

assert(peopleManifest.files.includes(peoplePath.replace(/^data\//, '')), 'People-filen skal være manifestlastet');
assert(person, 'People-rundingen skal ha det dokumenterte vannreguleringsmannskapet');
assert.strictEqual(person.placeId, 'frysjadammen', 'Frysjadammen skal være primæranker for mannskapskortet');
assert(person.places.includes('frysjadammen') && person.places.includes('maridalsvannet'), 'Mannskapet skal koble reguleringspunktet til Maridalsvannet');
assert(/kollektiv/i.test(person.popupDesc), 'People-kortet skal markeres som kollektivt miljøanker');
assert(Array.isArray(person.source_urls) && person.source_urls.length >= 2, 'People-kortet skal ha offisielt kildegrunnlag');

assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Story-filen skal være manifestlastet');
assert(story && story.place_id === place.id, 'Fortellingen skal være forankret i Frysjadammen');
assert.strictEqual(story.person_id, person.id, 'Fortellingen skal bruke vannreguleringsmannskapet');
assert(story.sources.length >= 4, 'Fortellingen skal ha minst fire kilder');

assert(article && article.place_id === place.id, 'Eksisterende Leksikon-artikkel skal være forankret i Frysjadammen');
assert(leksikonManifest.files.includes(articlePath), 'Leksikonfilen skal være manifestlastet');
assert(Array.isArray(article.wikiText) && article.wikiText.length >= 2, 'Frysjadammen skal beholde en egen leksikontekst');

const roundContent = {
  people: [person],
  works: place.works,
  badges: place.underbadge_ids,
  før_nå: place.for_na,
  civication: place.civication_store,
  brands: place.brands,
  nature: place.nature_profile,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, 'Innholdet skal følge historierundingenes rekkefølge');
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Frysjadammen mangler ${roundId}`);
}

assert(place.externalLinks.length >= 4 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Frysjadammen skal ha verifiserte HTTPS-kilder');
assert(place.underbadge_ids.length >= 4 && place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle historie-underbadges skal være kanoniske');
assert(place.works.length >= 6, 'Verk-rundingen skal dekke reguleringshistorien og dagens drift');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.brands.length >= 4, 'Brands-rundingen skal dokumentere etat, brukseiere, vannbehandling og reguleringssystem');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(place.nature_profile && place.nature_profile.summary.length >= 240, 'Natur-rundingen skal forklare det regulerte utløpet');
assert(place.nature_profile.themes.length >= 5, 'Natur-rundingen skal ha minst fem stedsspesifikke temaer');
assert.strictEqual(new Set(place.nature_profile.themes).size, place.nature_profile.themes.length, 'Naturtemaene skal være unike');
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['maridalsvannet', 'akerselva', 'nydalsdammen'], 'Natur-rundingen skal bruke de tre planlagte nærkoblingene');
for (const nearbyId of place.nature_profile.nearby_place_ids) {
  assert(placeIndex.has(nearbyId), `Nærkoblingen ${nearbyId} skal være aktiv`);
}

assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.9723, 10.7819, 150, 1918], 'Kartanker, radius og canonical stedår skal bevares');
assert.strictEqual(placeIndex.get(place.id)?.year, 1918, 'Runtime-indeksen skal beholde 1918');

const combined = JSON.stringify({ place, person, story, article });
for (const year of ['1853', '1867', '1876', '1952', '1995', '2024']) {
  assert(combined.includes(year), `Frysjadammen skal dokumentere ${year}`);
}
assert(/Maridalsoset/.test(combined), 'Innholdet skal forankres ved Maridalsoset');
assert(/Akerselvens Brugseierforening/.test(combined), 'Brukseierforeningen skal dokumenteres');
assert(/53 dammer/.test(combined), 'Dagens dokumenterte helårsdrift skal være med');
assert(!/Brekke Bruk|Brekkedammen|Brekke kraftstasjon|Frysja 33|Christian Anker/i.test(combined), 'Frysjadammen skal ikke blandes med Brekke/Frysja 33');
assert(!Object.prototype.hasOwnProperty.call(place, 'flora') && !Object.prototype.hasOwnProperty.call(place, 'fauna'), 'Stedfilen skal ikke få gjettede artslister');
assert(!/1918[^.]{0,80}(bygd|bygget|bygging|oppført|anlagt)/i.test(combined), 'Batchen skal ikke hevde at 1918 er dammens byggeår');

console.log('Frysjadammen batch 1 round content OK');
