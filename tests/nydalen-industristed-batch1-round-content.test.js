const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const historyProfileMatch = runtimeSource.match(/historie:\s*\[([^\]]+)\]/);
assert(historyProfileMatch, 'Runtime skal ha en dokumentert historieprofil');
assert.deepStrictEqual(JSON.parse(`[${historyProfileMatch[1]}]`), expectedRounds, 'Nydalen industristed skal bruke de ni historierundingene');

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/nydalen_industristed.json';
const place = readJson(placePath);
const peoplePath = 'data/people/natur/oslo/people_natur_oslo.json';
const people = readJson(peoplePath);
const adam = people.find((row) => row.id === 'adam_severin_hiorth_nydalen');
const oluf = people.find((row) => row.id === 'oluf_onsum_christiania_spigerverk');
const peopleManifest = readJson('data/people/manifest.json');

const storyPath = 'data/stories/stories_nydalsdammen.json';
const stories = readJson(storyPath);
const story = stories.find((row) => row.id === 'st_nydalen_industristed_fra_fossedal_til_bydel');
const storyManifest = readJson('data/stories/stories_manifest_natur_batch_01.json');

const articlePath = 'data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json';
const article = readJson(articlePath).find((row) => row.place_id === 'nydalen_industristed');
const leksikonManifest = readJson('data/leksikon/manifest.json');

const validUnderbadgeIds = new Set(readJson('data/badges/historie.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.category, 'historie', 'Nydalen industristed skal bruke historieprofilen');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'play', 'training']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Nydalen industristed skal ikke ha ${forbidden}`);
}

assert(peopleManifest.files.includes(peoplePath.replace(/^data\//, '')), 'People-filen skal være manifestlastet');
for (const person of [adam, oluf]) {
  assert(person, 'People-rundingen skal ha begge dokumenterte industrigrunnleggerne');
  assert.strictEqual(person.placeId, place.id, `${person.id} skal være forankret i Nydalen industristed`);
  assert(person.places.includes(place.id), `${person.id} skal liste Nydalen industristed`);
  assert(Array.isArray(person.source_urls) && person.source_urls.length >= 2, `${person.id} skal ha kildegrunnlag`);
  assert(person.image === '' && person.cardImage === '', `${person.id} skal ikke få oppdiktede bildefiler`);
}

assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Story-filen skal være manifestlastet');
assert(story && story.place_id === place.id, 'Fortellingen skal være forankret i Nydalen industristed');
assert.strictEqual(story.person_id, adam.id, 'Fortellingen skal bruke Adam Severin Hiorth som hovedperson');
assert(story.related_people.includes(oluf.id), 'Oluf Onsum skal inngå i fortellingens personkoblinger');
assert(story.sources.length >= 5, 'Fortellingen skal ha minst fem kilder');

assert(article && article.place_id === place.id, 'Eksisterende Leksikon-artikkel skal være forankret i Nydalen industristed');
assert(leksikonManifest.files.includes(articlePath), 'Leksikonfilen skal være manifestlastet');
assert(Array.isArray(article.wikiText) && article.wikiText.length >= 2, 'Nydalen skal beholde en egen leksikontekst');

const roundContent = {
  people: [adam, oluf],
  works: place.works,
  badges: place.underbadge_ids,
  før_nå: place.for_na,
  civication: place.civication_store,
  brands: place.brands,
  nature: place.nature_profile,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds, 'Innholdet skal følge historierundingenes rekkefølge');
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Nydalen industristed mangler ${roundId}`);
}

assert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Nydalen skal ha verifiserte HTTPS-kilder');
assert(place.underbadge_ids.length >= 4 && place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle historie-underbadges skal være kanoniske');
assert(place.works.length >= 7, 'Verk-rundingen skal dekke tekstil, jern, arbeidermiljø og byomforming');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.brands.length >= 5, 'Brands-rundingen skal dekke industri- og transformasjonsaktører');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(place.nature_profile && place.nature_profile.summary.length >= 300, 'Natur-rundingen skal forklare elvedalen og vannkraftlandskapet');
assert(place.nature_profile.themes.length >= 6, 'Natur-rundingen skal ha minst seks stedsspesifikke temaer');
assert.strictEqual(new Set(place.nature_profile.themes).size, place.nature_profile.themes.length, 'Naturtemaene skal være unike');
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['nydalsdammen', 'stilla_nydalen', 'seilduksfabrikken_nydalen'], 'Natur-rundingen skal bruke de tre planlagte nærkoblingene');
for (const nearbyId of place.nature_profile.nearby_place_ids) {
  assert(placeIndex.has(nearbyId), `Nærkoblingen ${nearbyId} skal være aktiv`);
}

assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.9476, 10.7682, 200, 1845], 'Kartanker, radius og canonical stedår skal bevares');
assert.strictEqual(placeIndex.get(place.id)?.year, 1845, 'Runtime-indeksen skal beholde 1845');

const combined = JSON.stringify({ place, adam, oluf, story, article });
for (const year of ['1845', '1847', '1853', '1864', '1989', '1990']) {
  assert(combined.includes(year), `Nydalen industristed skal dokumentere ${year}`);
}
assert(/Nydalens Compagnie/.test(combined), 'Nydalens Compagnie skal dokumenteres');
assert(/Christiania Spigerverk/.test(combined), 'Christiania Spigerverk skal dokumenteres');
assert(/Akerselva/.test(combined), 'Akerselva skal være gjennomgående stedskontekst');
assert(/arbeider/i.test(combined), 'Arbeidersamfunnet skal være med');
assert(!Object.prototype.hasOwnProperty.call(place, 'flora') && !Object.prototype.hasOwnProperty.call(place, 'fauna'), 'Stedfilen skal ikke få gjettede artslister');
assert(!/Seilduksfabrikken[^.]{0,80}(grunnlagt|etablert|bygget|oppført)/i.test(combined), 'Batchen skal ikke overføre udokumenterte etableringsfakta til det separate Seilduksfabrikken-stedet');

console.log('Nydalen industristed batch 1 round content OK');
