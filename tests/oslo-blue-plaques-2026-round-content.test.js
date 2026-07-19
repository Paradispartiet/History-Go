const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const roundsDocs = fs.readFileSync(path.join(repo, 'data/places/README_place_rounds.md'), 'utf8');
const placeStandard = fs.readFileSync(path.join(repo, 'docs/PLACE_STANDARD.md'), 'utf8');

const placeFiles = [
  'data/places/popkultur/oslo/places_populaerkultur_oslo_bla_skilt_2026_batch_01.json',
  'data/places/litteratur/oslo/places_litteratur_oslo_bla_skilt_2026_batch_01.json',
  'data/places/politikk/oslo/places_politikk_oslo_bla_skilt_2026_batch_01.json',
  'data/places/historie/oslo/places_historie_oslo_bla_skilt_2026_batch_01.json'
];
const places = placeFiles.flatMap(readJson);
const expected = new Map([
  ['bla_skilt_aud_schonemann_vetlandsveien_69d', 'aud_schonemann'],
  ['bla_skilt_stein_mehren_ullevalsveien_60', 'stein_mehren'],
  ['bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5', 'christopher_hornsrud'],
  ['bla_skilt_helverschous_lokke_munkedamsveien_35', 'nils_helverschou'],
  ['bla_skilt_enerhaugen_samfund_smedgata_34', 'honoratus_halling']
]);

assert.strictEqual(places.length, 5, 'Batchen skal inneholde fem blå-skilt-steder');

for (const place of places) {
  assert(expected.has(place.id), `Uventet place-id ${place.id}`);
  assert(Array.isArray(place.rounds_exclude) && place.rounds_exclude.includes('nature'), `${place.id} skal eksplisitt ekskludere nature`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'nature_profile'), `${place.id} skal ikke ha nature_profile`);
  assert(Array.isArray(place.works) && place.works.length >= 3, `${place.id} skal ha minst tre stedsspesifikke works`);
  assert(Array.isArray(place.civication_store) && place.civication_store.length >= 2, `${place.id} skal ha minst to Civication-objekter`);
  assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), `${place.id} skal bare ha fysiske, stedsspesifikke Civication-objekter`);
  assert(Array.isArray(place.brands) && place.brands.length >= 2, `${place.id} skal ha minst to aktører`);
  assert(place.for_na?.before && place.for_na?.now && place.for_na?.change, `${place.id} skal ha komplett før/nå`);
  assert(Array.isArray(place.emne_ids) && place.emne_ids.length > 0, `${place.id} skal ha emner til badge-rundingen`);
}

const storyPath = 'data/stories/stories_oslo_bla_skilt_2026_rounds_batch1.json';
const stories = readJson(storyPath);
const storyManifest = readJson('data/stories/stories_manifest.json');
for (const [placeId, personId] of expected) {
  const story = stories.find((row) => row.place_id === placeId);
  assert(story, `${placeId} mangler fortelling`);
  assert(story.related_people.includes(personId), `${placeId} sin fortelling skal koble ${personId}`);
  assert(story.sources.length >= 2, `${placeId} sin fortelling skal ha kildegrunnlag`);
  assert(storyManifest.files.some((entry) => entry.entity_id === placeId && entry.path === storyPath), `${placeId} sin fortelling skal være manifestlastet`);
}

const leksikonPath = 'data/leksikon/places/oslo/mixed/leksikon_oslo_bla_skilt_2026_rounds_batch1.json';
const articles = readJson(leksikonPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
assert(leksikonManifest.files.includes(leksikonPath), 'Leksikonbatchen skal være manifestlastet');
for (const placeId of expected.keys()) {
  const article = articles.find((row) => row.place_id === placeId);
  assert(article, `${placeId} mangler leksikonartikkel`);
  assert(Array.isArray(article.wikiText) && article.wikiText.length >= 2, `${placeId} sitt leksikon skal ha fulltekst`);
  assert(Array.isArray(article.sources) && article.sources.length >= 2, `${placeId} sitt leksikon skal ha kilder`);
}

const peopleManifest = readJson('data/people/manifest.json');
for (const file of [
  'people/historie/oslo/bla_skilt_2026/nils_helverschou.json',
  'people/historie/oslo/bla_skilt_2026/honoratus_halling.json'
]) {
  assert(peopleManifest.files.includes(file), `${file} skal være manifestlastet`);
}

const relations = readJson('data/relations.json');
for (const [placeId, personId] of expected) {
  assert(relations.some((row) => row.place === placeId && row.person === personId), `${placeId} mangler eksplisitt person–sted-relasjon til ${personId}`);
}

function extractRoundsRuntime(src) {
  const start = src.indexOf('const PLACE_ROUND_REGISTRY = [');
  const end = src.indexOf('const PLACE_CARD_QUIZ_CARD_BY_ID', start);
  assert(start >= 0 && end > start, 'Fant ikke rundingsruntime');
  return src.slice(start, end);
}

const sandbox = { window: {}, console: { warn() {} } };
vm.createContext(sandbox);
vm.runInContext(extractRoundsRuntime(runtimeSource), sandbox);
for (const category of ['historie', 'politikk', 'litteratur', 'populaerkultur']) {
  const ids = Array.from(sandbox.window.HGPlaceRounds.get({ id: `plaque_${category}`, category, rounds_exclude: ['nature'] }), (def) => def.id);
  assert(!ids.includes('nature'), `${category} med rounds_exclude skal ikke få nature`);
  assert.strictEqual(ids.length, 8, `${category} plaque-profil skal ha åtte relevante rundinger etter nature-eksklusjon`);
}

assert(runtimeSource.includes('place?.rounds_exclude'), 'Runtime skal støtte rounds_exclude');
assert(runtimeSource.includes('if (kind === "works") html = renderPlaceCardWorks(currentPlace || place);'), 'Works-popupen skal rendre place.works');
assert(/minneskilt|plakett/i.test(roundsDocs) && /ikke.*nature|nature.*ikke/i.test(roundsDocs), 'Rundingsdokumentasjonen skal forby automatisk Nature på minneskilt/plaketter');
assert(/minneskilt|plakett/i.test(placeStandard) && /ikke.*nature|nature.*ikke/i.test(placeStandard), 'Place Standard skal dokumentere samme regel');

console.log('Oslo blue plaques 2026 round content OK');
