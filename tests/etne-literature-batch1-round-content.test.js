const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'nature', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const literatureProfileMatch = runtimeSource.match(/litteratur:\s*\[([^\]]+)\]/);
assert(literatureProfileMatch, 'Runtime skal ha ein dokumentert litteraturprofil');
const runtimeRounds = JSON.parse(`[${literatureProfileMatch[1]}]`);
assert.deepStrictEqual(runtimeRounds, expectedRounds, 'Litteraturprofilen skal velje dei dokumenterte ni rundingane');

const primaryPersonIds = {
  gurine_johan_ebnes_minde: 'johan_ebne',
  ingvar_moe_byste_etne: 'ingvar_moe',
  olav_vik_garden_osnes: 'olav_vik'
};
const expectedCoordinates = {
  gurine_johan_ebnes_minde: [59.70492905372869, 5.824738133852842],
  ingvar_moe_byste_etne: [59.66489494369154, 5.934465720587056],
  olav_vik_garden_osnes: [59.649670122324274, 5.901348177311577]
};
const placeIds = Object.keys(primaryPersonIds);
const places = new Map(placeIds.map((id) => {
  const rows = readJson(`data/places/litteratur/vestland/etne/${id}.json`);
  assert(Array.isArray(rows) && rows.length === 1, `${id} skal liggje som éi oppføring i den splitta stadfila`);
  return [id, rows[0]];
}));

const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/litteratur/vestland/etne/people_litteratur_etne_batch1.json';
const people = readJson(`data/${peoplePath}`);
const personById = new Map(people.map((person) => [person.id, person]));
const storyManifest = readJson('data/stories/stories_manifest.json');
const storyPath = 'data/stories/stories_etne_litteratur_rounds_batch1.json';
const stories = readJson(storyPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const leksikonPath = 'data/leksikon/places/vestland/etne/litteratur/leksikon_etne_litteratur_rounds_batch1.json';
const articles = readJson(leksikonPath);
const validEmneIds = new Set(readJson('data/fag/litteratur/emner_litteratur_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/litteratur.json').sub);

assert(peopleManifest.files.includes(peoplePath), 'People-manifestet skal laste Etne litteratur-batch 1');
assert(storyManifest.files.some((entry) => entry.category === 'litteratur' && entry.path === storyPath), 'Stories-manifestet skal laste Etne litteratur-batch 1 med rett kategori');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etne litteratur-batch 1');

const storyByPlace = new Map(stories.map((story) => [story.place_id, story]));
const articleByPlace = new Map(articles.map((article) => [article.place_id, article]));

for (const placeId of placeIds) {
  const place = places.get(placeId);
  const personId = primaryPersonIds[placeId];
  const story = storyByPlace.get(placeId);
  const article = articleByPlace.get(placeId);
  const placeRelations = relations.filter((row) => row.place === placeId && row.person === personId);
  const roundContent = {
    people: placeRelations,
    works: place.works,
    badges: place.underbadge_ids,
    nature: place.nature_profile,
    civication: place.civication_store,
    brands: place.brands,
    før_nå: place.for_na,
    fortellinger: story ? [story] : [],
    leksikon: article ? [article] : []
  };

  assert.strictEqual(place.category, 'litteratur', `${placeId} skal bruke litteraturprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'rounds'), `${placeId} skal ikkje overstyre kategoriprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'rundinger'), `${placeId} skal ikkje ha alternativ rundingsoverstyring`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'routes'), `${placeId} skal bruke før_nå og ikkje routes`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'tasks'), `${placeId} skal ikkje få oppgåver i litteraturprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'play'), `${placeId} skal ikkje få leikerunding`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'training'), `${placeId} skal ikkje få treningsrunding`);
  assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, `${placeId} sitt innhald skal følgje rekkjefølgja i litteraturprofilen`);

  for (const [roundId, value] of Object.entries(roundContent)) {
    const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
    assert(filled, `${placeId} manglar innhald i rundingen ${roundId}`);
  }

  const person = personById.get(personId);
  assert(person, `${placeId} manglar people-oppføringa ${personId}`);
  assert.deepStrictEqual(person.places, [placeId], `${personId} skal berre peike på kjeldestaden`);
  assert.strictEqual(person.category, 'litteratur', `${personId} skal høyre til litteraturprofilen`);
  assert.deepStrictEqual(placeRelations.map((row) => row.person), [personId], `${placeId} skal ha den planlagde people-koplinga`);
  assert.strictEqual(story.person_id, personId, `${placeId} si forteljing skal bruke den planlagde personen`);
  assert(story.sources.length >= 2, `${placeId} si forteljing skal ha minst to kjelder`);
  assert(article.wikiText.length >= 3, `${placeId} skal ha ein full leksikontekst`);
  assert(article.sources.length >= 2, `${placeId} sin leksikonartikkel skal ha minst to kjelder`);
  assert(article.links.entry_ids.includes(story.id), `${placeId} sin leksikonartikkel skal kople hovudforteljinga`);
  assert(place.externalLinks.length >= 2 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), `${placeId} skal ha kjeldekontrollerte HTTPS-lenkjer`);
  assert(place.works.length >= 3, `${placeId} skal ha minst tre stadsspesifikke verk eller spor`);
  assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), `${placeId} sine Civication-objekt skal vere fysiske og stadsspesifikke`);
  assert(place.emne_ids.every((id) => validEmneIds.has(id)), `${placeId} skal berre bruke kanoniske litteraturemne`);
  assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), `${placeId} skal berre bruke dokumenterte litteratur-underbadges`);
  assert.deepStrictEqual([place.lat, place.lon], expectedCoordinates[placeId], `${placeId} skal behalde det kontrollerte kartankeret`);
}

const ebneContent = JSON.stringify({
  place: places.get('gurine_johan_ebnes_minde'),
  story: storyByPlace.get('gurine_johan_ebnes_minde'),
  article: articleByPlace.get('gurine_johan_ebnes_minde')
});
assert(/29\. januar 1944/.test(ebneContent) && /6\. oktober 1953/.test(ebneContent), 'Ebne skal dokumentere begge testamentdatoane');
assert(/Ebne.*Sandvik.*Lovik/.test(ebneContent), 'Ebne skal dokumentere dei tre bygdene i skulekrinsen');
assert(/ikkje dokumentasjon på at.*reist/.test(ebneContent), 'Ebne skal halde det moglege bibliotekhuset skilt frå eit dokumentert bygg');
assert(/representativt Ebne-anker/.test(ebneContent), 'Ebne skal merke kartpunktet som representativt');

const moeContent = JSON.stringify({
  place: places.get('ingvar_moe_byste_etne'),
  story: storyByPlace.get('ingvar_moe_byste_etne'),
  article: articleByPlace.get('ingvar_moe_byste_etne')
});
assert(/9\. desember 2006/.test(moeContent), 'Ingvar Moe-bysta skal ha den kjeldekontrollerte avdukingsdatoen');
assert(/Vidar Bratlund Mæland/.test(moeContent) && /like ved kaien/.test(moeContent), 'Ingvar Moe-bysta skal halde kunstnar og plassering samla');
assert(/løktastolpefrø/.test(moeContent) && /Rundt sjøen/.test(moeContent), 'Ingvar Moe skal ha verk som forklarer heimstadsporet');
assert(!/2009/.test(moeContent), 'Ingvar Moe-bysta skal ikkje bruke den motstridande 2009-dateringa');

const vikContent = JSON.stringify({
  place: places.get('olav_vik_garden_osnes'),
  story: storyByPlace.get('olav_vik_garden_osnes'),
  article: articleByPlace.get('olav_vik_garden_osnes')
});
assert(/1910–1990/.test(vikContent), 'Olav Vik skal ha kjeldekontrollert livsspenn');
assert(/mangfald av treslag/.test(vikContent), 'Olav Vik-garden skal dokumentere treplantinga');
assert(/testamentert/.test(vikContent) && /1800-talet/.test(vikContent), 'Olav Vik-garden skal dokumentere stiftingsarven og dei bevarte bygningane');
assert(/Hjartemål/.test(vikContent) && /Det liv som gror or draumen/.test(vikContent), 'Olav Vik skal ha dokumenterte verk frå starten og slutten av forfattarskapet');
assert(/ikkje heile Osnes/.test(vikContent), 'Olav Vik-kortet skal avgrensast frå heile Osnes-halvøya');

console.log('Etne literature batch 1 round content OK');
