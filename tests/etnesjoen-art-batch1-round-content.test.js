const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'nature', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const artProfileMatch = runtimeSource.match(/kunst:\s*\[([^\]]+)\]/);
assert(artProfileMatch, 'Runtime skal ha ein dokumentert kunstprofil');
const runtimeRounds = JSON.parse(`[${artProfileMatch[1]}]`);
assert.deepStrictEqual(runtimeRounds, expectedRounds, 'Kunstprofilen skal velje dei dokumenterte ni rundingane');

const primaryPeople = {
  fugl_fonix_etne: {
    id: 'audun_stene',
    file: 'data/people/kunst/vestland/etne/fugl_fonix/people_fugl_fonix_batch1.json'
  },
  old_river_saloon_etne: {
    id: 'aslaug_olden_mala',
    file: 'data/people/musikk/vestland/etne/old_river_saloon/people_old_river_saloon_batch1.json'
  },
  skakke_kultursenter_etne: {
    id: 'goril_eidhammer',
    file: 'data/people/kunst/vestland/etne/skakke/goril_eidhammer.json'
  },
  abc_studio_etne: {
    id: 'nils_osmund_halleland',
    file: 'data/people/musikk/vestland/etne/abc_studio/nils_osmund_halleland.json'
  }
};
const expectedCoordinates = {
  fugl_fonix_etne: [59.664378686105366, 5.9337544781587654],
  old_river_saloon_etne: [59.66779228417683, 5.9390911675902585],
  skakke_kultursenter_etne: [59.66699689549377, 5.940741056207339],
  abc_studio_etne: [59.67166913033782, 5.94580792953166]
};
const expectedYears = {
  fugl_fonix_etne: 1999,
  old_river_saloon_etne: 1999,
  skakke_kultursenter_etne: null,
  abc_studio_etne: 2006
};
const placeIds = Object.keys(primaryPeople);
const places = new Map(placeIds.map((id) => {
  const rows = readJson(`data/places/kunst/vestland/etne/${id}.json`);
  assert(Array.isArray(rows) && rows.length === 1, `${id} skal liggje som éi oppføring i den splitta stadfila`);
  return [id, rows[0]];
}));

const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const storyPath = 'data/stories/stories_etnesjoen_kunst_rounds_batch1.json';
const storyManifest = readJson('data/stories/stories_manifest.json');
const stories = readJson(storyPath);
const leksikonPath = 'data/leksikon/places/vestland/etne/kunst/leksikon_etnesjoen_kunst_rounds_batch1.json';
const leksikonManifest = readJson('data/leksikon/manifest.json');
const articles = readJson(leksikonPath);
const validEmneIds = new Set(readJson('data/fag/kunst/emner_kunst_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validUnderbadgeIds = new Set(readJson('data/badges/kunst.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert(storyManifest.files.some((entry) => entry.category === 'kunst' && entry.path === storyPath), 'Stories-manifestet skal laste Etnesjøen kunst-batch 1');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonmanifestet skal laste Etnesjøen kunst-batch 1');
assert(peopleManifest.files.includes('people/kunst/vestland/etne/skakke/goril_eidhammer.json'), 'People-manifestet skal laste den dokumenterte Skakke-leiaren');

const storyByPlace = new Map(stories.map((story) => [story.place_id, story]));
const articleByPlace = new Map(articles.map((article) => [article.place_id, article]));

for (const placeId of placeIds) {
  const place = places.get(placeId);
  const personConfig = primaryPeople[placeId];
  const people = readJson(personConfig.file);
  const person = people.find((row) => row.id === personConfig.id);
  const story = storyByPlace.get(placeId);
  const article = articleByPlace.get(placeId);
  const placeRelations = relations.filter((row) => row.place === placeId && row.person === personConfig.id);
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

  assert.strictEqual(place.category, 'kunst', `${placeId} skal bruke kunstprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'rounds'), `${placeId} skal ikkje overstyre kategoriprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'rundinger'), `${placeId} skal ikkje ha alternativ rundingsoverstyring`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'routes'), `${placeId} skal bruke før_nå og ikkje routes`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'tasks'), `${placeId} skal ikkje få oppgåver i kunstprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'play'), `${placeId} skal ikkje få leikerunding`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'training'), `${placeId} skal ikkje få treningsrunding`);
  assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, `${placeId} sitt innhald skal følgje rekkjefølgja i kunstprofilen`);

  for (const [roundId, value] of Object.entries(roundContent)) {
    const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
    assert(filled, `${placeId} manglar innhald i rundingen ${roundId}`);
  }

  assert(person, `${placeId} manglar people-oppføringa ${personConfig.id}`);
  assert.strictEqual(person.placeId, placeId, `${personConfig.id} skal ha ${placeId} som primæranker`);
  assert(person.places.includes(placeId), `${personConfig.id} skal peike på ${placeId}`);
  assert.deepStrictEqual(placeRelations.map((row) => row.person), [personConfig.id], `${placeId} skal ha den planlagde people-koplinga`);
  assert.strictEqual(story.person_id, personConfig.id, `${placeId} si forteljing skal bruke den planlagde personen`);
  assert(story.sources.length >= 2, `${placeId} si forteljing skal ha minst to kjelder`);
  assert(article.wikiText.length >= 3, `${placeId} skal ha ein full leksikontekst`);
  assert(article.sources.length >= 2, `${placeId} sin leksikonartikkel skal ha minst to kjelder`);
  assert(article.links.entry_ids.includes(story.id), `${placeId} sin leksikonartikkel skal kople hovudforteljinga`);
  assert(place.externalLinks.length >= 2 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), `${placeId} skal ha kjeldekontrollerte HTTPS-lenkjer`);
  assert(place.works.length >= 3, `${placeId} skal ha minst tre stadsspesifikke verk eller produksjonsspor`);
  assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), `${placeId} sine Civication-objekt skal vere fysiske og stadsspesifikke`);
  assert(place.emne_ids.every((id) => validEmneIds.has(id)), `${placeId} skal berre bruke kanoniske kunstemne`);
  assert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), `${placeId} skal berre bruke dokumenterte kunst-underbadges`);
  assert.deepStrictEqual([place.lat, place.lon], expectedCoordinates[placeId], `${placeId} skal behalde det kontrollerte kartankeret`);
  assert.strictEqual(place.year, expectedYears[placeId], `${placeId} skal bruke kjeldekontrollert fysisk stadår`);
  assert.strictEqual(placeIndex.get(placeId)?.year, expectedYears[placeId], `${placeId} sitt kjeldeår skal vere synkronisert til runtime-indeksen`);
}

const fuglContent = JSON.stringify({
  place: places.get('fugl_fonix_etne'),
  story: storyByPlace.get('fugl_fonix_etne'),
  article: articleByPlace.get('fugl_fonix_etne')
});
assert(/1999/.test(fuglContent) && /2001/.test(fuglContent), 'Fugl Fønix skal dokumentere kaféstart og hotell-overtaking');
assert(/galleri/.test(fuglContent) && /standup/.test(fuglContent), 'Fugl Fønix skal halde den tverrkunstnariske profilen synleg');

const saloonContent = JSON.stringify({
  place: places.get('old_river_saloon_etne'),
  story: storyByPlace.get('old_river_saloon_etne'),
  article: articleByPlace.get('old_river_saloon_etne')
});
assert(/Marknadsfjosen/.test(saloonContent) && /1999/.test(saloonContent), 'Old River skal dokumentere det flytta bygget og opningsåret');
assert(/2024/.test(saloonContent) && /livekonsert/.test(saloonContent), 'Old River skal dokumentere gjenopninga som scene');
assert(!/"year":2020/.test(saloonContent), 'Old River skal ikkje behalde det feilaktige stadåret 2020');

const skakkeContent = JSON.stringify({
  place: places.get('skakke_kultursenter_etne'),
  story: storyByPlace.get('skakke_kultursenter_etne'),
  article: articleByPlace.get('skakke_kultursenter_etne')
});
assert(/339/.test(skakkeContent) && /kino-, konsert- og teatersal/.test(skakkeContent), 'Skakke skal dokumentere den kombinerte salen');
assert(/kulturskule/.test(skakkeContent) && /utstilling/.test(skakkeContent), 'Skakke skal dokumentere undervisning og kulturformidling i huset');
assert(/eigne stader|egne stader/.test(skakkeContent), 'Skakke skal halde nabofunksjonane som eigne kartstader');

const abcContent = JSON.stringify({
  place: places.get('abc_studio_etne'),
  story: storyByPlace.get('abc_studio_etne'),
  article: articleByPlace.get('abc_studio_etne')
});
assert(/5\. desember 2005/.test(abcContent), 'ABC Studio skal dokumentere datoen for Ljoshall-brannen');
assert(/november 2006/i.test(abcContent) && /Enge gamle skule/.test(abcContent), 'ABC Studio skal dokumentere opninga på det fysiske kartstedet');
assert(/ABC Live/.test(abcContent) && /ABC Tunes/.test(abcContent), 'ABC Studio skal dokumentere både scene- og distribusjonsarbeidet');
assert(!/1987/.test(abcContent), 'ABC-kortet skal ikkje bruke eldre foretaksår som opningsår for studioet i gamleskulen');

console.log('Etnesjøen art batch 1 round content OK');
