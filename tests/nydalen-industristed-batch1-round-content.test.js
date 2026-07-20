const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const placePath = 'data/places/by/oslo/places/nydalen.json';
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
const article = readJson(articlePath).find((row) => row.place_id === 'nydalen' && Array.isArray(row.wikiText) && row.wikiText.length >= 2);
const leksikonManifest = readJson('data/leksikon/manifest.json');

const validUnderbadgeIds = new Set(readJson('data/badges/historie.json').sub);
const placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));

assert.strictEqual(place.id, 'nydalen', 'Industrisporet skal ligge på canonical Nydalen');
assert.strictEqual(place.category, 'by', 'Canonical Nydalen skal beholde by-kategorien');
assert.strictEqual(place.coordStatus, 'verified_geometry', 'Canonical Nydalen skal beholde verifisert områdeanker');
assert.strictEqual(place.routeId, 'akerselva_grontdrag', 'Canonical Nydalen skal fortsatt være koblet til Akerselva-ruta');

assert(peopleManifest.files.includes(peoplePath.replace(/^data\//, '')), 'People-filen skal være manifestlastet');
for (const person of [adam, oluf]) {
  assert(person, 'People-rundingen skal ha begge dokumenterte industrigrunnleggerne');
  assert.strictEqual(person.placeId, place.id, `${person.id} skal være forankret i canonical Nydalen`);
  assert(person.places.includes(place.id), `${person.id} skal liste canonical Nydalen`);
  assert(Array.isArray(person.source_urls) && person.source_urls.length >= 2, `${person.id} skal ha kildegrunnlag`);
}

assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Story-filen skal være manifestlastet');
assert(story && story.place_id === place.id, 'Industrifortellingen skal være forankret i canonical Nydalen');
assert.strictEqual(story.person_id, adam.id, 'Fortellingen skal bruke Adam Severin Hiorth som hovedperson');
assert(story.related_people.includes(oluf.id), 'Oluf Onsum skal inngå i fortellingens personkoblinger');

assert(article && article.place_id === place.id, 'Industrileksikonet skal være forankret i canonical Nydalen');
assert(leksikonManifest.files.includes(articlePath), 'Leksikonfilen skal være manifestlastet');

for (const field of ['works', 'underbadge_ids', 'for_na', 'civication_store', 'brands', 'nature_profile']) {
  const value = place[field];
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Canonical Nydalen mangler migrert industrifelt ${field}`);
}
assert(place.externalLinks.length >= 5 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Nydalen skal beholde verifiserte HTTPS-kilder');
assert(place.underbadge_ids.length >= 4 && place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)), 'Alle migrerte historie-underbadges skal være kanoniske');
assert(place.works.length >= 7, 'Verk-rundingen skal dekke tekstil, jern, arbeidermiljø og byomforming');
assert(place.civication_store.length >= 2 && place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), 'Civication-objektene skal være fysiske og stedsspesifikke');
assert(place.brands.length >= 5, 'Brands-rundingen skal dekke industri- og transformasjonsaktører');
assert(place.for_na.before && place.for_na.now && place.for_na.change, 'Før/nå-rundingen skal være komplett');
assert(place.nature_profile && place.nature_profile.summary.length >= 300, 'Natur-rundingen skal forklare elvedalen og vannkraftlandskapet');
assert(place.nature_profile.themes.length >= 6, 'Natur-rundingen skal ha minst seks stedsspesifikke temaer');
assert.strictEqual(new Set(place.nature_profile.themes).size, place.nature_profile.themes.length, 'Naturtemaene skal være unike');
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['nydalsdammen', 'stilla_nydalen', 'seilduksfabrikken_nydalen'], 'Natur-rundingen skal beholde de tre planlagte nærkoblingene');
for (const nearbyId of place.nature_profile.nearby_place_ids) assert(placeIndex.has(nearbyId), `Nærkoblingen ${nearbyId} skal være aktiv`);

assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.9497, 10.7675, 260, 2000], 'Canonical Nydalen skal beholde sitt verifiserte områdeanker og canonical stedår');
assert.strictEqual(placeIndex.get(place.id)?.year, 2000, 'Runtime-indeksen skal beholde canonical Nydalen-år');

const combined = JSON.stringify({ place, adam, oluf, story, article });
for (const year of ['1845', '1847', '1853', '1864', '1989', '1990']) assert(combined.includes(year), `Det migrerte industrisporet skal dokumentere ${year}`);
assert(/Nydalens Compagnie/.test(combined), 'Nydalens Compagnie skal dokumenteres');
assert(/Christiania Spigerverk/.test(combined), 'Christiania Spigerverk skal dokumenteres');
assert(/Akerselva/.test(combined), 'Akerselva skal være gjennomgående stedskontekst');
assert(/arbeider/i.test(combined), 'Arbeidersamfunnet skal være med');
assert(!Object.prototype.hasOwnProperty.call(place, 'flora') && !Object.prototype.hasOwnProperty.call(place, 'fauna'), 'Stedfilen skal ikke få gjettede artslister');

console.log('Nydalen industrial content migration to canonical place OK');
