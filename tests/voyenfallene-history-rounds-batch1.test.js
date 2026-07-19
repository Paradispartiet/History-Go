const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const expectedRounds = ['people', 'works', 'badges', 'før_nå', 'civication', 'brands', 'nature', 'fortellinger', 'leksikon'];

const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtimeSource.match(/historie:\s*\[([^\]]+)\]/);
assert(profileMatch, 'Runtime skal ha historieprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds, 'Vøyenfallene skal bruke de ni historierundingene');

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/voienfossen.json';
const place = readJson(placePath);
const index = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json').find((row) => row.id === place.id);
const manifest = readJson('data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json').places.find((row) => row.id === place.id);
const peopleNaturPath = 'data/people/natur/oslo/people_natur_oslo.json';
const peopleNaeringPath = 'data/people/naeringsliv/oslo/people_naeringsliv_oslo.json';
const peopleNatur = readJson(peopleNaturPath);
const peopleNaering = readJson(peopleNaeringPath);
const knud = peopleNatur.find((row) => row.id === 'knud_graah_voyenfallene');
const roll = peopleNatur.find((row) => row.id === 'oluf_nicolai_roll_nydalen');
const schou = peopleNaering.find((row) => row.id === 'halvor_schou');
const storyPath = 'data/stories/stories_voienfossen.json';
const story = readJson(storyPath).find((row) => row.id === 'st_voienfossen_tre_fall_som_spant_industribyen');
const storyManifest = readJson('data/stories/stories_manifest_natur_batch_01.json');
const articlePath = 'data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json';
const article = readJson(articlePath).find((row) => row.place_id === place.id);
const validBadges = new Set(readJson('data/badges/historie.json').sub);
const placeIds = new Set(readJson('data/places/places_index.json').map((row) => row.id));
const peopleManifest = readJson('data/people/manifest.json');
const leksikonManifest = readJson('data/leksikon/manifest.json');

assert.strictEqual(place.id, 'voienfossen');
assert.strictEqual(place.name, 'Vøyenfallene');
assert.strictEqual(place.category, 'historie');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.93065, 10.75703, 230, 1846]);
assert.strictEqual(place.coordStatus, 'verified_anchor');
assert.strictEqual(place.coordType, 'waterfall_system_anchor');
for (const forbidden of ['rounds', 'rundinger', 'routes', 'tasks', 'training', 'play', 'flora', 'fauna']) {
  assert(!Object.prototype.hasOwnProperty.call(place, forbidden), `Vøyenfallene skal ikke ha ${forbidden}`);
}

assert(index && index.name === place.name && index.lat === place.lat && index.lon === place.lon, 'Ruteindeksen skal bruke korrigert identitet');
assert(manifest && manifest.name === place.name && manifest.order === 8 && /^[0-9a-f]{64}$/.test(manifest.sha256), 'Manifestet skal være oppdatert');

assert(peopleManifest.files.includes(peopleNaturPath.replace(/^data\//, '')), 'People natur-filen skal være manifestlastet');
assert(peopleManifest.files.includes(peopleNaeringPath.replace(/^data\//, '')), 'People næringsliv-filen skal være manifestlastet');
assert(knud && knud.placeId === place.id && knud.places.includes(place.id), 'Knud Graah skal være stedskoblet');
assert(roll && roll.places.includes(place.id), 'Oluf Nicolai Roll skal være stedskoblet');
assert(schou && schou.places.includes(place.id), 'Halvor Schou skal være stedskoblet');
for (const person of [knud, roll, schou]) {
  assert(person.source_urls.length >= 4, `${person.id} skal ha kildegrunnlag`);
  assert(person.image === '' && person.cardImage === '', 'Personer uten bilde skal ikke få oppdiktede bilder');
}

assert(storyManifest.files.some((entry) => entry.path === storyPath), 'Story-filen skal være manifestlastet');
assert(story && story.place_id === place.id && story.person_id === knud.id, 'Fortellingen skal være koblet til stedet og Knud Graah');
assert(story.related_people.includes(schou.id) && story.related_people.includes(roll.id), 'Fortellingen skal koble alle tre dokumenterte personer');
assert(story.sources.length >= 12, 'Fortellingen skal være bredt kildebelagt');
assert(article && article.place_id === place.id, 'Leksikon-rundingen skal ha egen artikkel');
assert(leksikonManifest.files.includes(articlePath), 'Leksikonfilen skal være manifestlastet');

const roundContent = {
  people: [knud, schou, roll],
  works: place.works,
  badges: place.underbadge_ids,
  før_nå: place.for_na,
  civication: place.civication_store,
  brands: place.brands,
  nature: place.nature_profile,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds);
for (const [roundId, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Vøyenfallene mangler ${roundId}`);
}

assert(place.externalLinks.length >= 14 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), 'Kildelenker skal være komplette');
assert(place.underbadge_ids.length >= 7 && place.underbadge_ids.every((id) => validBadges.has(id)), 'Historie-underbadges skal være kanoniske');
assert(place.works.length >= 10, 'Verk-rundingen skal dekke mølle, tekstil, kraft og mekanisk industri');
assert(place.civication_store.length >= 4 && place.civication_store.every((item) => item.physicalObject && item.placeSpecific), 'Civication skal ha fysiske stedsspesifikke objekter');
assert(place.brands.length >= 9, 'Aktør-rundingen skal dekke hovedvirksomhetene');
assert(place.for_na.before && place.for_na.now && place.for_na.look_for.length >= 6, 'Før/nå skal være komplett');
assert(place.nature_profile.summary.length >= 600 && place.nature_profile.themes.length >= 7, 'Natur-rundingen skal være fyldig');
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['glads_molle', 'voien_gard_voienvolden', 'myralokka']);
for (const id of place.nature_profile.nearby_place_ids) assert(placeIds.has(id), `Ukjent nærkobling ${id}`);
assert(article.sources.length >= 14 && article.facts.length >= 9 && article.chronology.length >= 20, 'Leksikonartikkelen skal være komplett');

const quiz = readJson('data/quiz/historie/voienfossen_sets.json');
assert.strictEqual(quiz.sets.length, 6);
assert(quiz.sets.every((set) => set.questions.length === 7), 'Quizzen skal beholde fem sett med sju spørsmål');
assert(quiz.sets.flatMap((set) => set.questions).every((q) => q.claim_basis === 'verified_sources'), 'Alle quizspørsmål skal være kildeverifiserte');

const combined = JSON.stringify({ place, knud, schou, roll, story, article, quiz });
for (const year of ['1844', '1846', '1855', '1860', '1881', '1923', '1957', '1971', '1974', '1980']) {
  assert(combined.includes(year), `Vøyenfallene skal dokumentere ${year}`);
}
for (const fact of ['16 fot', '22 fot', '28 fot', '2372', '65 hestekrefter', '400 vevstoler']) {
  assert(combined.includes(fact), `Vøyenfallene skal dokumentere ${fact}`);
}
assert(/tre fall|tre fossefall/i.test(combined), 'Fossesystemet skal dokumenteres i flertall');
assert(/70–80 arbeidere/.test(combined), 'Arbeidsstokken ved oppstart skal dokumenteres');
assert(/offentlig gangvei|offentlig.*bro|lovlig/i.test(combined), 'Trygg offentlig observasjon skal være tydelig');

console.log('Vøyenfallene history rounds batch 1 OK');
