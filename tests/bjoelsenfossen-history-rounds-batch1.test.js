const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];

const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/historie:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha historieprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'Bjølsenfossen skal bruke de ni historierundingene');

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/bjoelsenfossen.json';
const place = readJson(placePath);
const peoplePath = 'data/people/natur/oslo/people_natur_oslo.json';
const people = readJson(peoplePath);
const gerhard = people.find((row) => row.id === 'gerhard_treschow_bjoelsen');
const gustav = people.find((row) => row.id === 'gustav_martinsen_bjoelsen_valsemolle');
const ole = people.find((row) => row.id === 'ole_amundsen_bjoelsen_molle');
const storyPath = 'data/stories/stories_bjoelsenfossen.json';
const story = readJson(storyPath).find((row) => row.id === 'st_bjoelsenfossen_fossen_som_malte_byens_brod');
const storyManifest = readJson('data/stories/stories_manifest_natur_batch_01.json');
const articlePath = 'data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const validBadges = new Set(readJson('data/badges/historie.json').sub);
const placeIds = new Set(readJson('data/places/places_index.json').map((row) => row.id));
const peopleManifest = readJson('data/people/manifest.json');
const leksikonManifest = readJson('data/leksikon/manifest.json');

assert.strictEqual(place.id, 'bjoelsenfossen');
assert.strictEqual(place.category, 'historie');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.9398, 10.7602, 150, 1850]);
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'training', 'play', 'flora', 'fauna']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Bjølsenfossen skal ikke ha ${forbidden}`);
}

assert(peopleManifest.files.includes(peoplePath.replace(/^data\//, '')), 'People-filen skal være manifestlastet');
for (const person of [gerhard, gustav, ole]) {
  assert(person && person.placeId === place.id && person.places.includes(place.id), 'Personer-rundingen skal være stedskoblet');
  assert(person.source_urls.length >= 3, `${person.id} skal ha kildegrunnlag`);
  assert(person.image === '' && person.cardImage === '', 'Nye personer skal ikke få oppdiktede bilder');
}

assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Story-filen skal være manifestlastet');
assert(story && story.place_id === place.id && story.person_id === gustav.id, 'Fortellingen skal være koblet til stedet og Gustav Martinsen');
assert(story.related_people.includes(gerhard.id) && story.related_people.includes(ole.id), 'Fortellingen skal koble alle tre dokumenterte personer');
assert(story.sources.length >= 8, 'Fortellingen skal være bredt kildebelagt');
assert(article && article.place_id === place.id, 'Leksikon-rundingen skal ha egen artikkel');
assert(leksikonManifest.files.includes(articlePath), 'Leksikonfilen skal være manifestlastet');

const roundContent = {
  people: [gerhard, gustav, ole],
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
  assert(filled, `Bjølsenfossen mangler ${roundId}`);
}

assert(place.externalLinks.length >= 7 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Kildelenker skal være komplette');
assert(place.underbadge_ids.length >= 6 && place.underbadge_ids.every((id) => validBadges.has(id)), 'Historie-underbadges skal være kanoniske');
assert(place.works.length >= 9, 'Verk-rundingen skal dekke sag, vanninntak, mølle og kraftanlegg');
assert(place.civication_store.length >= 3 && place.civication_store.every((item) => item.physicalObject && item.placeSpecific), 'Civication skal ha fysiske stedsspesifikke objekter');
assert(place.brands.length >= 8, 'Aktør-rundingen skal dekke historiske og nåværende aktører');
assert(place.for_na.before && place.for_na.now && place.for_na.look_for.length >= 5, 'Før/nå skal være komplett');
assert(place.nature_profile.summary.length >= 450 && place.nature_profile.themes.length >= 6, 'Natur-rundingen skal være fyldig');
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['stilla_nydalen', 'bjoelsenparken_elvenaer', 'glads_molle']);
for (const id of place.nature_profile.nearby_place_ids) assert(placeIds.has(id), `Ukjent nærkobling ${id}`);
assert(article.sources.length >= 10 && article.facts.length >= 6 && article.chronology.length >= 9, 'Leksikonartikkelen skal være komplett');

const combined = JSON.stringify({ place, gerhard, gustav, ole, story, article });
for (const year of ['1701', '1860', '1867', '1884', '1885', '1889', '1899', '1939', '1999']) assert(combined.includes(year), `Bjølsenfossen skal dokumentere ${year}`);
assert(/16 meter/.test(combined), 'Fallhøyden skal dokumenteres');
assert(/1200/.test(combined), 'Turbinytelsen skal dokumenteres');
assert(/Bjølsen Valsemølle/.test(combined));
assert(/Lantmännen Cerealia/.test(combined));
assert(/begrenset offentlig tilgang|begrenset adgang|aktivt industriområde/i.test(combined), 'Tilgangsbegrensningen skal være tydelig');

console.log('Bjølsenfossen history rounds batch 1 OK');
