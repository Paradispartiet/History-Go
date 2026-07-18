const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const primaryPersonIds = {
  vardahaugen_lauareid: 'vardahaugen_gravmiljoet',
  stampehaug_meland: 'stampehaug_gravmiljoet',
  hoyland_gravhaug_etne: 'hoyland_gravmiljoet',
  etne_prestebustad: 'etne_prestegard_tunmiljoet'
};
const expectedCoordinates = {
  vardahaugen_lauareid: [59.722, 6.125],
  stampehaug_meland: [59.642, 5.897],
  hoyland_gravhaug_etne: [59.647, 6.0135],
  etne_prestebustad: [59.671099414861274, 5.957246993001724]
};
const placeIds = Object.keys(primaryPersonIds);
const places = new Map(placeIds.map((id) => [id, readJson(`data/places/historie/vestland/etne/${id}.json`)]));
const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/historie/vestland/etne/people_historie_etne_rounds_batch6.json';
const people = readJson(`data/${peoplePath}`);
const personById = new Map(people.map((person) => [person.id, person]));
const storyManifest = readJson('data/stories/stories_manifest.json');
const storyPath = 'data/stories/stories_etne_historie_rounds_batch6.json';
const stories = readJson(storyPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/historie/leksikon_etne_historie_rounds_batch6.json';
const articles = readJson(leksikonPath);

assert(peopleManifest.files.includes(peoplePath), 'People-manifestet skal laste Etne-batch 6');
assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Stories-manifestet skal laste Etne-batch 6');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etne-batch 6');

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

for (const placeId of ['vardahaugen_lauareid', 'stampehaug_meland', 'hoyland_gravhaug_etne']) {
  assert(places.get(placeId).externalLinks.some((link) => /b2find\.eudat\.eu\/dataset\//.test(link.url)), `${placeId} skal lenkje den konkrete B2FIND-posten`);
}

assert(/naturleg rygg.*kunstig|kunstig påbygg/i.test(storyByPlace.get('stampehaug_meland').story), 'Stampehaug skal skilje naturleg rygg frå kunstig påbygg');
assert(/godt kan vere|atterhald|kan vere/i.test(storyByPlace.get('hoyland_gravhaug_etne').story), 'Høyland skal halde koplinga til jordfyllinga som ei varsam tolking');
assert(/ikkje.*einskapleg byggjedato|fleire periodar|eldre hus/i.test(storyByPlace.get('etne_prestebustad').story), 'Prestegarden skal ikkje framstille alle bygningane som frå 1871');
assert(/1991/.test(articleByPlace.get('etne_prestebustad').wikiText.join(' ')), 'Prestegarden skal dokumentere fredinga i 1991');

console.log('Etne history batch 6 round content OK');
