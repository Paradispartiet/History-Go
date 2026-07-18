const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const placeIds = [
  'grindheim_kyrkje_etne',
  'bruteigsteinen_etne',
  'duesteinen_etne',
  'steine_heio_bygdeborg'
];
const places = new Map(placeIds.map((id) => [id, readJson(`data/places/historie/vestland/etne/${id}.json`)]));
const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/historie/vestland/etne/people_historie_etne_rounds_batch2.json';
const people = readJson(`data/${peoplePath}`);
const storyManifest = readJson('data/stories/stories_manifest.json');
const storyPath = 'data/stories/stories_etne_historie_rounds_batch2.json';
const stories = readJson(storyPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/historie/leksikon_etne_historie_rounds_batch2.json';
const articles = readJson(leksikonPath);

assert(peopleManifest.files.includes(peoplePath), 'People-manifestet skal laste Etne-batch 2');
assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Stories-manifestet skal laste Etne-batch 2');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etne-batch 2');

const personByPlace = new Map(people.map((person) => [person.placeId, person]));
const storyByPlace = new Map(stories.map((story) => [story.place_id, story]));
const articleByPlace = new Map(articles.map((article) => [article.place_id, article]));

for (const placeId of placeIds) {
  const place = places.get(placeId);
  const person = personByPlace.get(placeId);
  const story = storyByPlace.get(placeId);
  const article = articleByPlace.get(placeId);
  const roundContent = {
    people: relations.filter((row) => row.place === placeId && row.person === person?.id),
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
  assert.deepStrictEqual(person.places, [placeId], `${placeId} sitt miljøanker skal berre peike på kjeldestaden`);
  assert.strictEqual(story.person_id, person.id, `${placeId} si forteljing skal vere kopla til miljøankeret`);
  assert(story.sources.length >= 2, `${placeId} si forteljing skal ha minst to kjelder`);
  assert(article.wikiText.length >= 3, `${placeId} skal ha ein full leksikontekst`);
  assert(article.sources.length >= 2, `${placeId} sin leksikonartikkel skal ha minst to kjelder`);
  assert(place.externalLinks.every((link) => /^https:\/\//.test(link.url)), `${placeId} skal berre bruke HTTPS-kjeldelenkjer`);
  assert(place.works.length >= 3, `${placeId} skal ha minst tre stadsspesifikke verk eller spor`);
  assert(place.civication_store.every((item) => item.placeSpecific === true), `${placeId} sine Civication-objekt skal vere stadsspesifikke`);
}

assert(/ikkje sikkert|ikkje.*kjend|ukjent/i.test(storyByPlace.get('bruteigsteinen_etne').story), 'Bruteigsteinen skal halde symboltolkinga open');
assert(/ikkje.*sikkert|utan at vi.*sikkert/i.test(storyByPlace.get('duesteinen_etne').story), 'Duesteinen skal halde bruken av felta open');
assert(/usikker|ikkje.*sikkert/i.test(storyByPlace.get('steine_heio_bygdeborg').story), 'Steine-Heio skal halde funksjonen open');
assert(/mest sannsynleg|truleg/i.test(storyByPlace.get('grindheim_kyrkje_etne').story), 'Grindheim skal markere dateringa med atterhald');

console.log('Etne history batch 2 round content OK');
