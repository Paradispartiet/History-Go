const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const primaryPersonIds = {
  grindheim_runestein: 'tormod_grindheim_runereisar',
  grindheim_steinkross: 'grindheim_kross_samlingsmiljoet',
  grindheimsveien_nord_gravfelt: 'grindheim_gravfolket',
  grindheim_jernvinne: 'grindheim_jernvinnemiljoet'
};
const placeIds = Object.keys(primaryPersonIds);
const places = new Map(placeIds.map((id) => [id, readJson(`data/places/historie/vestland/etne/${id}.json`)]));
const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/historie/vestland/etne/people_historie_etne_rounds_batch3.json';
const people = readJson(`data/${peoplePath}`);
const personById = new Map(people.map((person) => [person.id, person]));
const storyManifest = readJson('data/stories/stories_manifest.json');
const storyPath = 'data/stories/stories_etne_historie_rounds_batch3.json';
const stories = readJson(storyPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/historie/leksikon_etne_historie_rounds_batch3.json';
const articles = readJson(leksikonPath);

assert(peopleManifest.files.includes(peoplePath), 'People-manifestet skal laste Etne-batch 3');
assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Stories-manifestet skal laste Etne-batch 3');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etne-batch 3');

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

  assert(person, `${placeId} mangler hovudperson eller miljøanker`);
  assert.deepStrictEqual(person.places, [placeId], `${placeId} sitt people-anker skal berre peike på kjeldestaden`);
  assert.strictEqual(story.person_id, person.id, `${placeId} si forteljing skal vere kopla til hovudankeret`);
  assert(story.sources.length >= 2, `${placeId} si forteljing skal ha minst to kjelder`);
  assert(article.wikiText.length >= 3, `${placeId} skal ha ein full leksikontekst`);
  assert(article.sources.length >= 2, `${placeId} sin leksikonartikkel skal ha minst to kjelder`);
  assert(place.externalLinks.every((link) => /^https:\/\//.test(link.url)), `${placeId} skal berre bruke HTTPS-kjeldelenkjer`);
  assert(place.works.length >= 3, `${placeId} skal ha minst tre stadsspesifikke verk eller spor`);
  assert(place.civication_store.every((item) => item.placeSpecific === true), `${placeId} sine Civication-objekt skal vere stadsspesifikke`);
}

const runestoneRelations = relations.filter((row) => row.place === 'grindheim_runestein');
assert(runestoneRelations.some((row) => row.person === 'tormod_grindheim_runereisar'), 'Runesteinen skal kople den namngjevne reisaren');
assert(runestoneRelations.some((row) => row.person === 'tormod_svidande'), 'Runesteinen skal kople den namngjevne faren');
assert(storyByPlace.get('grindheim_runestein').related_people.includes('tormod_svidande'), 'Runesteinsforteljinga skal ta med begge Tormodane');

for (const placeId of ['grindheim_steinkross', 'grindheimsveien_nord_gravfelt', 'grindheim_jernvinne']) {
  assert(/kollektiv/i.test(personById.get(primaryPersonIds[placeId]).popupDesc), `${placeId} skal merke det anonyme miljøankeret som kollektivt`);
}

assert(/langt frå sikkert|ikkje.*sikkert/i.test(storyByPlace.get('grindheim_runestein').story), 'Runesteinen skal halde tolkinga av Svidande open');
assert(/ikkje.*sikkert|ikkje.*dokumentert/i.test(storyByPlace.get('grindheim_steinkross').story), 'Steinkrossen skal halde Krossbakken-funksjonen open');
assert(/ikkje.*berre denne markøren|ikkje.*denne markøren/i.test(storyByPlace.get('grindheimsveien_nord_gravfelt').story), 'Gravfeltet skal avgrense 250-talet korrekt');
assert(/ikkje.*sikker dato|utan.*sikker dato/i.test(storyByPlace.get('grindheim_jernvinne').story), 'Jernvinna skal halde dateringa open');

console.log('Etne history batch 3 round content OK');
