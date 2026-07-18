const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const primaryPersonIds = {
  sorheimsmoen_gravfelt: 'sorheimsmoen_gravfolket',
  tesdal_gravfelt: 'tesdal_gravfolket',
  etnesjoen_forromersk_landsby: 'etnesjoen_landsbyfolket',
  varhaug_nervik: 'varhaug_nervik_gravmiljoet'
};
const placeIds = Object.keys(primaryPersonIds);
const places = new Map(placeIds.map((id) => [id, readJson(`data/places/historie/vestland/etne/${id}.json`)]));
const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/historie/vestland/etne/people_historie_etne_rounds_batch4.json';
const people = readJson(`data/${peoplePath}`);
const personById = new Map(people.map((person) => [person.id, person]));
const storyManifest = readJson('data/stories/stories_manifest.json');
const storyPath = 'data/stories/stories_etne_historie_rounds_batch4.json';
const stories = readJson(storyPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/historie/leksikon_etne_historie_rounds_batch4.json';
const articles = readJson(leksikonPath);

assert(peopleManifest.files.includes(peoplePath), 'People-manifestet skal laste Etne-batch 4');
assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Stories-manifestet skal laste Etne-batch 4');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etne-batch 4');

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
}

assert(/heile landskapet, ikkje berre denne markøren/i.test(storyByPlace.get('sorheimsmoen_gravfelt').story), 'Sørheimsmoen skal avgrense hundretalet til det større feltet');
assert(/ikkje.*alle.*samtidige/i.test(storyByPlace.get('sorheimsmoen_gravfelt').story), 'Sørheimsmoen skal halde periodane frå kvarandre');
assert(/ikkje ei sikker felles datering|ikkje.*alle.*samstundes/i.test(storyByPlace.get('tesdal_gravfelt').story), 'Tesdal skal halde felles datering og samtid open');
assert(/alle 54 stod ikkje samstundes/i.test(storyByPlace.get('etnesjoen_forromersk_landsby').story), 'Etnesjøen skal ikkje gjere alle 54 bygningane samtidige');
assert(/ikkje eit synleg rekonstruert tun/i.test(storyByPlace.get('etnesjoen_forromersk_landsby').story), 'Etnesjøen skal ikkje framstå som ein synleg rekonstruksjon');
assert(/dateringa.*må.*stå open|datering.*open/i.test(storyByPlace.get('varhaug_nervik').story), 'Varhaug skal halde dateringa open');
assert(/fortel ikkje kven|personen.*skjult/i.test(storyByPlace.get('varhaug_nervik').story), 'Varhaug skal halde identiteten open');

console.log('Etne history batch 4 round content OK');
