const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedPeople = {
  skanevik_gjestgjevargarden: ['skanevik_gjestgjevarmiljoet'],
  driftevegen_stordalen_roldal: ['stordalen_drifteferdselsmiljoet'],
  folgefonden_minnesmerke_skanevik: ['folgefonden_minnemiljoet'],
  reichwald_snublesteiner_skanevik: ['hans_reichwald', 'edith_reichwald', 'harry_reichwald']
};
const primaryPersonIds = {
  skanevik_gjestgjevargarden: 'skanevik_gjestgjevarmiljoet',
  driftevegen_stordalen_roldal: 'stordalen_drifteferdselsmiljoet',
  folgefonden_minnesmerke_skanevik: 'folgefonden_minnemiljoet',
  reichwald_snublesteiner_skanevik: 'hans_reichwald'
};
const expectedCoordinates = {
  skanevik_gjestgjevargarden: [59.73128737155455, 5.92525891571817],
  driftevegen_stordalen_roldal: [59.75232, 6.20454],
  folgefonden_minnesmerke_skanevik: [59.73343, 5.93264],
  reichwald_snublesteiner_skanevik: [59.733018516381904, 5.934691072324555]
};
const placeIds = Object.keys(primaryPersonIds);
const places = new Map(placeIds.map((id) => [id, readJson(`data/places/historie/vestland/etne/${id}.json`)]));
const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/historie/vestland/etne/people_historie_etne_rounds_batch8.json';
const people = readJson(`data/${peoplePath}`);
const personById = new Map(people.map((person) => [person.id, person]));
const storyManifest = readJson('data/stories/stories_manifest.json');
const storyPath = 'data/stories/stories_etne_historie_rounds_batch8.json';
const stories = readJson(storyPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/historie/leksikon_etne_historie_rounds_batch8.json';
const articles = readJson(leksikonPath);

assert(peopleManifest.files.includes(peoplePath), 'People-manifestet skal laste Etne-batch 8');
assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Stories-manifestet skal laste Etne-batch 8');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etne-batch 8');

const storyByPlace = new Map(stories.map((story) => [story.place_id, story]));
const articleByPlace = new Map(articles.map((article) => [article.place_id, article]));

for (const placeId of placeIds) {
  const place = places.get(placeId);
  const story = storyByPlace.get(placeId);
  const article = articleByPlace.get(placeId);
  const placeRelations = relations.filter((row) => row.place === placeId);
  const roundContent = {
    people: placeRelations,
    nature: place.nature_profile,
    badges: place.underbadge_ids,
    works: place.works,
    civication: place.civication_store,
    brands: place.brands,
    før_nå: place.for_na,
    fortellinger: story ? [story] : [],
    leksikon: article ? [article] : []
  };

  for (const [roundId, value] of Object.entries(roundContent)) {
    const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
    assert(filled, `${placeId} mangler innhold i rundingen ${roundId}`);
  }

  const actualPersonIds = placeRelations.map((row) => row.person).sort();
  assert.deepStrictEqual(actualPersonIds, [...expectedPeople[placeId]].sort(), `${placeId} skal ha dei planlagde people-koplingane`);
  for (const personId of expectedPeople[placeId]) {
    const person = personById.get(personId);
    assert(person, `${placeId} mangler people-oppføringa ${personId}`);
    assert.deepStrictEqual(person.places, [placeId], `${personId} skal berre peike på kjeldestaden`);
  }
  assert.strictEqual(story.person_id, primaryPersonIds[placeId], `${placeId} si forteljing skal bruke det planlagde hovudankeret`);
  assert(story.sources.length >= 2, `${placeId} si forteljing skal ha minst to kjelder`);
  assert(article.wikiText.length >= 3, `${placeId} skal ha ein full leksikontekst`);
  assert(article.sources.length >= 2, `${placeId} sin leksikonartikkel skal ha minst to kjelder`);
  assert(article.links.entry_ids.includes(story.id), `${placeId} sin leksikonartikkel skal kople hovudforteljinga`);
  assert(place.externalLinks.every((link) => /^https:\/\//.test(link.url)), `${placeId} skal berre bruke HTTPS-kjeldelenkjer`);
  assert(place.works.length >= 3, `${placeId} skal ha minst tre stadsspesifikke verk eller spor`);
  assert(place.civication_store.every((item) => item.placeSpecific === true), `${placeId} sine Civication-objekt skal vere stadsspesifikke`);
  assert.deepStrictEqual([place.lat, place.lon], expectedCoordinates[placeId], `${placeId} skal bruke den kjeldekontrollerte koordinaten`);
}

for (const placeId of ['skanevik_gjestgjevargarden', 'driftevegen_stordalen_roldal', 'folgefonden_minnesmerke_skanevik']) {
  assert(/kollektiv/i.test(personById.get(primaryPersonIds[placeId]).popupDesc), `${placeId} skal merke miljøankeret som kollektivt`);
}

assert(/berre to bygningar|to bygningar.*står att/i.test(storyByPlace.get('skanevik_gjestgjevargarden').story), 'Gjestgjevargarden skal ikkje framstillast som eit komplett bevart anlegg');
assert(/ikkje heile vegen|representativt.*anker/i.test(storyByPlace.get('driftevegen_stordalen_roldal').story), 'Driftevegen skal skilje kartankeret frå den lange ruta');
assert(/ikkje.*uendra|uendra.*ikkje/i.test(storyByPlace.get('driftevegen_stordalen_roldal').story), 'Driftevegen skal ikkje slå fast éin uendra trase');
assert(/26 menneske omkom/i.test(storyByPlace.get('folgefonden_minnesmerke_skanevik').story), 'Folgefonden skal halde fast på 26 omkomne');
assert(/ikkje sikre?.*overlev|usikkert.*overlev|overlevde.*ikkje.*sikker/i.test(storyByPlace.get('folgefonden_minnesmerke_skanevik').story), 'Folgefonden skal ikkje gjere talet på overlevande sikkert');
assert(/ikkje Trøskenesfluno|ikkje.*grunnstøytingsstaden/i.test(storyByPlace.get('folgefonden_minnesmerke_skanevik').story), 'Folgefonden skal skilje minnesmerket frå forlisstaden');

const reichwaldStory = storyByPlace.get('reichwald_snublesteiner_skanevik').story;
for (const name of ['Hans', 'Edith', 'Harry']) {
  assert(reichwaldStory.includes(name), `Reichwald-forteljinga skal halde ${name} synleg`);
}
assert(/norsk politi og lensmann/i.test(reichwaldStory), 'Reichwald-forteljinga skal synleggjere den norske arrestasjonen');
assert(/Donau/.test(reichwaldStory) && /Gotenland/.test(reichwaldStory), 'Reichwald-forteljinga skal skilje dei to deportasjonane');
assert.strictEqual(places.get('reichwald_snublesteiner_skanevik').works.length, 3, 'Reichwald-staden skal ha eitt minnespor for kvar person');

console.log('Etne history batch 8 round content OK');
