const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const historyProfileMatch = runtimeSource.match(/historie:\s*\[([^\]]+)\]/);
assert(historyProfileMatch, 'Runtime skal ha ein dokumentert historieprofil');
const runtimeRounds = JSON.parse(`[${historyProfileMatch[1]}]`);
assert.deepStrictEqual(runtimeRounds, expectedRounds, 'Historieprofilen skal velje dei dokumenterte ni rundingane');

const primaryPersonIds = {
  gjerdesvagen_jernvinne: 'gjerdesvagen_jernvinnemiljoet',
  postvegen_etne_skanevik: 'etne_skanevik_postferdselsmiljoet'
};
const expectedCoordinates = {
  gjerdesvagen_jernvinne: [59.6443, 5.92245],
  postvegen_etne_skanevik: [59.699744, 5.937062]
};
const placeIds = Object.keys(primaryPersonIds);
const places = new Map(placeIds.map((id) => [id, readJson(`data/places/historie/vestland/etne/${id}.json`)]));
const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/historie/vestland/etne/people_historie_etne_rounds_batch9.json';
const people = readJson(`data/${peoplePath}`);
const personById = new Map(people.map((person) => [person.id, person]));
const storyManifest = readJson('data/stories/stories_manifest.json');
const storyPath = 'data/stories/stories_etne_historie_rounds_batch9.json';
const stories = readJson(storyPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/historie/leksikon_etne_historie_rounds_batch9.json';
const articles = readJson(leksikonPath);

assert(peopleManifest.files.includes(peoplePath), 'People-manifestet skal laste Etne-batch 9');
assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Stories-manifestet skal laste Etne-batch 9');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etne-batch 9');

const storyByPlace = new Map(stories.map((story) => [story.place_id, story]));
const articleByPlace = new Map(articles.map((article) => [article.place_id, article]));

for (const placeId of placeIds) {
  const place = places.get(placeId);
  const story = storyByPlace.get(placeId);
  const article = articleByPlace.get(placeId);
  const placeRelations = relations.filter((row) => row.place === placeId);
  const roundContent = {
    people: placeRelations,
    works: place.works,
    badges: place.underbadge_ids,
    før_nå: place.for_na,
    civication: place.civication_store,
    brands: place.brands,
    nature: place.nature_profile,
    fortellinger: story ? [story] : [],
    leksikon: article ? [article] : []
  };

  assert.strictEqual(place.category, 'historie', `${placeId} skal bruke historieprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'rounds'), `${placeId} skal ikkje overstyre den dokumenterte kategori-profilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'rundinger'), `${placeId} skal ikkje ha ei alternativ rundingsoverstyring`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'tasks'), `${placeId} skal ikkje få fysiske oppgåver i historieprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'play'), `${placeId} skal ikkje få leikerunding`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'training'), `${placeId} skal ikkje få treningsrunding`);
  assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, `${placeId} sitt innhald skal følgje rekkjefølgja i historieprofilen`);

  for (const [roundId, value] of Object.entries(roundContent)) {
    const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
    assert(filled, `${placeId} mangler innhald i rundingen ${roundId}`);
  }

  const personId = primaryPersonIds[placeId];
  const person = personById.get(personId);
  assert(person, `${placeId} mangler people-oppføringa ${personId}`);
  assert.deepStrictEqual(person.places, [placeId], `${personId} skal berre peike på kjeldestaden`);
  assert(/kollektivt/i.test(person.popupDesc), `${personId} skal vere tydeleg merkt som kollektivt miljøanker`);
  assert.deepStrictEqual(placeRelations.map((row) => row.person), [personId], `${placeId} skal ha den planlagde people-koplinga`);
  assert.strictEqual(story.person_id, personId, `${placeId} si forteljing skal bruke det planlagde miljøankeret`);
  assert(story.sources.length >= 2, `${placeId} si forteljing skal ha minst to kjelder`);
  assert(article.wikiText.length >= 3, `${placeId} skal ha ein full leksikontekst`);
  assert(article.sources.length >= 2, `${placeId} sin leksikonartikkel skal ha minst to kjelder`);
  assert(article.links.entry_ids.includes(story.id), `${placeId} sin leksikonartikkel skal kople hovudforteljinga`);
  assert(place.externalLinks.every((link) => /^https:\/\//.test(link.url)), `${placeId} skal berre bruke HTTPS-kjeldelenkjer`);
  assert(place.works.length >= 3, `${placeId} skal ha minst tre stadsspesifikke verk eller spor`);
  assert(place.civication_store.every((item) => item.placeSpecific === true), `${placeId} sine Civication-objekt skal vere stadsspesifikke`);
  assert.deepStrictEqual([place.lat, place.lon], expectedCoordinates[placeId], `${placeId} skal behalde det kjeldekontrollerte representative kartankeret`);
}

const gjerdeStory = storyByPlace.get('gjerdesvagen_jernvinne').story;
assert(/410–560 e\.Kr\./.test(gjerdeStory), 'Gjerdesvågen skal ta med den kjeldebelagde C14-dateringa');
assert(/trekolhaldig lag med slagg og jern/i.test(gjerdeStory), 'Gjerdesvågen skal halde funnkonteksten samla');
assert(/brent leirklining/i.test(gjerdeStory), 'Gjerdesvågen skal ta med leirklininga');
assert(/ikkje eit synleg, rekonstruert jernverk/i.test(gjerdeStory), 'Gjerdesvågen skal ikkje framstillast som eit synleg rekonstruert anlegg');
assert(/representativt.*anker/i.test(gjerdeStory), 'Gjerdesvågen skal skilje områdeankeret frå eit eksakt prøvestikkpunkt');

const postStory = storyByPlace.get('postvegen_etne_skanevik').story;
assert(/Stavangerske Posttour/.test(postStory), 'Postvegen skal halde systemkoplinga synleg');
assert(/mid(t|d) på 1600-talet/.test(postStory), 'Postvegen skal knyte utbygginga til den fastare posttenesta');
assert(/Først på 1800-talet.*køyrevegar/s.test(postStory), 'Postvegen skal skilje ridevegen frå den seinare køyrevegstandarden');
assert(/ikkje ein urørt original/i.test(postStory), 'Postvegen skal ikkje framstille turvegen som uendra original');
assert(/representativt anker.*lineær rute/i.test(postStory), 'Postvegen skal skilje kartankeret frå heile den lineære ruta');

console.log('Etne history batch 9 round content OK');
