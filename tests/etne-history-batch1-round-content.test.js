const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const placeIds = [
  'helgaberget_etne',
  'borgasen_etne',
  'saebotunet_etne',
  'gjerde_kyrkje_etne'
];
const places = new Map(placeIds.map((id) => [id, readJson(`data/places/historie/vestland/etne/${id}.json`)]));
const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/historie/vestland/etne/people_historie_etne_rounds_batch1.json';
const people = readJson(`data/${peoplePath}`);
const storyManifest = readJson('data/stories/stories_manifest.json');
const storyPath = 'data/stories/stories_etne_historie_rounds_batch1.json';
const stories = readJson(storyPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/historie/leksikon_etne_historie_rounds_batch1.json';
const articles = readJson(leksikonPath);

assert(peopleManifest.files.includes(peoplePath), 'People-manifestet skal laste Etne-miljøankrene');
assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Stories-manifestet skal laste Etne-batchfortellingene');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etne-batchartiklene');

const personByPlace = new Map(people.map((person) => [person.placeId, person]));
const storyByPlace = new Map(stories.map((story) => [story.place_id, story]));
const articleByPlace = new Map(articles.map((article) => [article.place_id, article]));

for (const placeId of placeIds) {
  const place = places.get(placeId);
  const placeRelations = relations.filter((row) => row.place === placeId);
  const person = personByPlace.get(placeId);
  const story = storyByPlace.get(placeId);
  const article = articleByPlace.get(placeId);

  const roundContent = {
    people: placeRelations.filter((row) => row.person === person?.id),
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

  assert(person.popupDesc.includes('kollektivt') || person.popupDesc.includes('kollektiv'), `${placeId} skal merke miljøankeret som kollektivt`);
  assert.deepStrictEqual(person.places, [placeId], `${placeId} sitt miljøanker skal bare peke på sitt kildebelagte sted`);
  assert.strictEqual(story.person_id, person.id, `${placeId} sin fortelling skal kobles til miljøankeret`);
  assert(story.sources.length >= 2, `${placeId} sin fortelling skal ha minst to kildeoppføringer`);
  assert(article.wikiText.length >= 3, `${placeId} skal ha en full leksikontekst`);
  assert(article.sources.length >= 2, `${placeId} sin leksikonartikkel skal ha kilder`);
  assert(place.externalLinks.every((link) => /^https:\/\//.test(link.url)), `${placeId} skal bare bruke HTTPS-kildelenker`);
  assert(place.works.length >= 3, `${placeId} skal ha minst tre stedsspesifikke verk eller fysiske spor`);
  assert(place.civication_store.every((item) => item.placeSpecific === true), `${placeId} sine Civication-objekter skal være stedsspesifikke`);
}

assert(/ikkje sikkert|usikker|open/i.test(storyByPlace.get('helgaberget_etne').story), 'Helgaberget skal holde symboltolkningen åpen');
assert(/ikkje sikkert|usikre|opne spørsmål/i.test(storyByPlace.get('borgasen_etne').story), 'Borgåsen skal holde funksjonen åpen');
assert(/ulike tal|ikkje.*hovudpoenget|ikkje.*låst/i.test(storyByPlace.get('saebotunet_etne').story), 'Sæbøtunet skal unngå et låst nåtidstall');
assert(/ukjend|ikkje.*fullt kjent/i.test(storyByPlace.get('gjerde_kyrkje_etne').story), 'Gjerde skal holde bygningsopphavet åpent');

console.log('Etne history batch 1 round content OK');
