const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const primaryPersonIds = {
  nesjarhaugen_byrkjenes: 'nesjarhaugen_steinringmiljoet',
  keisarhaugen_frette: 'keisarhaugen_gravmiljoet',
  dysjanes_rivaisen_gravroys: 'dysjanes_gravmiljoet',
  hidlesnes_nernes_gravroys: 'hidlesnes_gravmiljoet'
};
const expectedCoordinates = {
  nesjarhaugen_byrkjenes: [59.6515, 5.796],
  keisarhaugen_frette: [59.735, 6.1825],
  dysjanes_rivaisen_gravroys: [59.65991, 5.8647],
  hidlesnes_nernes_gravroys: [59.707, 6.091]
};
const placeIds = Object.keys(primaryPersonIds);
const places = new Map(placeIds.map((id) => [id, readJson(`data/places/historie/vestland/etne/${id}.json`)]));
const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/historie/vestland/etne/people_historie_etne_rounds_batch5.json';
const people = readJson(`data/${peoplePath}`);
const personById = new Map(people.map((person) => [person.id, person]));
const storyManifest = readJson('data/stories/stories_manifest.json');
const storyPath = 'data/stories/stories_etne_historie_rounds_batch5.json';
const stories = readJson(storyPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/historie/leksikon_etne_historie_rounds_batch5.json';
const articles = readJson(leksikonPath);

assert(peopleManifest.files.includes(peoplePath), 'People-manifestet skal laste Etne-batch 5');
assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Stories-manifestet skal laste Etne-batch 5');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etne-batch 5');

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
  assert(place.externalLinks.some((link) => /b2find\.eudat\.eu\/dataset\//.test(link.url)), `${placeId} skal lenkje den konkrete B2FIND-posten`);
  assert(place.works.length >= 3, `${placeId} skal ha minst tre stadsspesifikke verk eller spor`);
  assert(place.civication_store.every((item) => item.placeSpecific === true), `${placeId} sine Civication-objekt skal vere stadsspesifikke`);
  assert.deepStrictEqual([place.lat, place.lon], expectedCoordinates[placeId], `${placeId} skal bruke den kjeldekontrollerte koordinatdekninga`);
}

assert(/skal ha blitt.*tyske|skal.*tyske.*krigen/i.test(storyByPlace.get('nesjarhaugen_byrkjenes').story), 'Nesjarhaugen skal halde krigsskaden som ei overlevert opplysning');
assert(/ikkje eit bevis.*keisar|ikkje.*keisar vart gravlagd/i.test(storyByPlace.get('keisarhaugen_frette').story), 'Keisarhaugen skal ikkje dikte ein keisar frå stadnamnet');
assert(/ikkje eit moderne arkeologisk funn|utan moderne utgravingsdokumentasjon/i.test(storyByPlace.get('keisarhaugen_frette').story), 'Keisarhaugen skal avgrense helleopplysninga');
assert(/betyr ikkje at røysa er intakt|ikkje.*intakt/i.test(storyByPlace.get('dysjanes_rivaisen_gravroys').story), 'Dysjanes skal halde stabil rest og intakt monument frå kvarandre');
assert(/ikkje.*sikker datering|ikkje.*dato|verken ei publisert C14-datering/i.test(storyByPlace.get('hidlesnes_nernes_gravroys').story), 'Hidlesnes skal ikkje gjere kolopplysninga til ei sikker datering');

console.log('Etne history batch 5 round content OK');
