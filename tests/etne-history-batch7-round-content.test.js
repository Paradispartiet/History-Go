const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const primaryPersonIds = {
  skanevik_kyrkjestad: 'skanevik_kyrkjelyden',
  fjaera_kapell: 'fjaera_kyrkjelyden',
  gamle_akrafjordvegen: 'akrafjordvegen_arbeidslaget',
  postvegen_rullestadjuvet: 'rullestad_postferdselsmiljoet'
};
const expectedCoordinates = {
  skanevik_kyrkjestad: [59.73199, 5.93934],
  fjaera_kapell: [59.87535812729994, 6.38802246531671],
  gamle_akrafjordvegen: [59.80673, 6.21894],
  postvegen_rullestadjuvet: [59.88144, 6.46432]
};
const placeIds = Object.keys(primaryPersonIds);
const places = new Map(placeIds.map((id) => [id, readJson(`data/places/historie/vestland/etne/${id}.json`)]));
const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/historie/vestland/etne/people_historie_etne_rounds_batch7.json';
const people = readJson(`data/${peoplePath}`);
const personById = new Map(people.map((person) => [person.id, person]));
const storyManifest = readJson('data/stories/stories_manifest.json');
const storyPath = 'data/stories/stories_etne_historie_rounds_batch7.json';
const stories = readJson(storyPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/historie/leksikon_etne_historie_rounds_batch7.json';
const articles = readJson(leksikonPath);

assert(peopleManifest.files.includes(peoplePath), 'People-manifestet skal laste Etne-batch 7');
assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Stories-manifestet skal laste Etne-batch 7');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etne-batch 7');

const storyByPlace = new Map(stories.map((story) => [story.place_id, story]));
const articleByPlace = new Map(articles.map((article) => [article.place_id, article]));

for (const placeId of placeIds) {
  const place = places.get(placeId);
  const person = personById.get(primaryPersonIds[placeId]);
  const story = storyByPlace.get(placeId);
  const article = articleByPlace.get(placeId);
  const roundContent = {
    people: relations.filter((row) => row.place === placeId),
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

  assert(person, `${placeId} mangler eit kollektivt miljøanker`);
  assert(/kollektiv/i.test(person.popupDesc), `${placeId} skal merke miljøankeret som kollektivt`);
  assert.deepStrictEqual(person.places, [placeId], `${placeId} sitt people-anker skal berre peike på kjeldestaden`);
  assert.strictEqual(story.person_id, person.id, `${placeId} si forteljing skal vere kopla til hovudankeret`);
  assert(story.sources.length >= 2, `${placeId} si forteljing skal ha minst to kjelder`);
  assert(article.wikiText.length >= 3, `${placeId} skal ha ein full leksikontekst`);
  assert(article.sources.length >= 2, `${placeId} sin leksikonartikkel skal ha minst to kjelder`);
  assert(article.links.entry_ids.includes(story.id), `${placeId} sin leksikonartikkel skal kople hovudforteljinga`);
  assert(place.externalLinks.every((link) => /^https:\/\//.test(link.url)), `${placeId} skal berre bruke HTTPS-kjeldelenkjer`);
  assert(place.works.length >= 3, `${placeId} skal ha minst tre stadsspesifikke verk eller spor`);
  assert(place.civication_store.every((item) => item.placeSpecific === true), `${placeId} sine Civication-objekt skal vere stadsspesifikke`);
  assert.deepStrictEqual([place.lat, place.lon], expectedCoordinates[placeId], `${placeId} skal bruke den kjeldekontrollerte koordinaten`);
}

assert(/ikkje.*byggjedato|ikkje ein sikker byggjedato/i.test(storyByPlace.get('skanevik_kyrkjestad').story), 'Skånevik skal ikkje gjere 1340 til sikkert byggjeår');
assert(/første kyrkja på staden/i.test(storyByPlace.get('fjaera_kapell').story), 'Fjæra skal dokumentere at kapellet var første kyrkje på staden');
assert(/starta i 1937|byrja i 1937/i.test(storyByPlace.get('gamle_akrafjordvegen').story), 'Åkrafjordvegen skal halde fast på førkrigsstarten');
assert(/ikkje ein urørt original|ikkje.*urørt/i.test(storyByPlace.get('postvegen_rullestadjuvet').story), 'Rullestad skal skilje restaurert tursti frå urørt original');
assert(/skal ha gått|tradisjon/i.test(storyByPlace.get('postvegen_rullestadjuvet').story), 'Hertervig-koplinga skal vere varsamt formulert');

console.log('Etne history batch 7 round content OK');
