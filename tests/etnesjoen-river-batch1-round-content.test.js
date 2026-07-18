const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const roundDocs = fs.readFileSync(path.join(repo, 'data/places/README_place_rounds.md'), 'utf8');

const profileMatch = runtimeSource.match(/const CATEGORY_ROUND_PROFILES = Object\.freeze\((\{[\s\S]*?\})\);/);
assert(profileMatch, 'Runtime skal eksponere kategori-profilane statisk');
const profiles = Function(`return (${profileMatch[1]});`)();

const expectedNatureRounds = ['tasks', 'nature', 'badges', 'training', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
const expectedScienceRounds = ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];
assert.deepStrictEqual(profiles.natur, expectedNatureRounds, 'Etneelva skal bruke den dokumenterte naturprofilen');
assert.deepStrictEqual(profiles.vitenskap, expectedScienceRounds, 'Vitenskapsstaden skal bruke den eksplisitt dokumenterte vitskapsprofilen');

const naturePath = 'data/places/natur/vestland/etneelva.json';
const sciencePath = 'data/places/vitenskap/vestland/etne/etneelva_forskningsplattform.json';
const nature = readJson(naturePath)[0];
const science = readJson(sciencePath)[0];
const relations = readJson('data/relations.json');
const peopleManifest = readJson('data/people/manifest.json');
const peoplePath = 'people/vitenskap/vestland/etne/etneelva_forskningsplattform_people_batch1.json';
const people = readJson(`data/${peoplePath}`);
const storyManifest = readJson('data/stories/stories_manifest.json');
const natureStoryPath = 'data/stories/stories_etnesjoen_natur_rounds_batch1.json';
const scienceStoryPath = 'data/stories/stories_etnesjoen_vitenskap_rounds_batch1.json';
const natureStory = readJson(natureStoryPath)[0];
const scienceStory = readJson(scienceStoryPath)[0];
const leksikonPath = 'data/leksikon/places/vestland/etne/leksikon_etnesjoen_river_rounds_batch1.json';
const articles = readJson(leksikonPath);
const leksikonManifest = readJson('data/leksikon/manifest.json');
const articleByPlace = new Map(articles.map((article) => [article.place_id, article]));
const placeIndex = new Map(readJson('data/places/places_index.json').map((place) => [place.id, place]));
const validNatureEmneIds = new Set(readJson('data/fag/natur/emner_natur_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validScienceEmneIds = new Set(readJson('data/fag/vitenskap/emner_vitenskap_canonical_v4_5.json').map((row) => row.emne_id || row.id));
const validNatureBadges = new Set(readJson('data/badges/natur.json').sub);
const validScienceBadges = new Set(readJson('data/badges/vitenskap.json').sub);

assert(peopleManifest.files.includes(peoplePath), 'Dei eksisterande feltforskarane skal vere manifestlasta');
assert(storyManifest.files.some((entry) => entry.category === 'natur' && entry.path === natureStoryPath), 'Naturforteljinga skal vere manifestlasta');
assert(storyManifest.files.some((entry) => entry.category === 'vitenskap' && entry.path === scienceStoryPath), 'Vitskapsforteljinga skal vere manifestlasta');
assert(leksikonManifest.files.includes(leksikonPath), 'Elveleksikonet skal vere manifestlasta');

for (const place of [nature, science]) {
  assert(!Object.prototype.hasOwnProperty.call(place, 'rounds'), `${place.id} skal ikkje overstyre kategoriprofilen`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'rundinger'), `${place.id} skal ikkje bruke legacy-rundinger`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'routes'), `${place.id} skal bruke før_nå og ikkje routes`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'play'), `${place.id} skal ikkje få leikerunding`);
  assert(place.externalLinks.length >= 3 && place.externalLinks.every((link) => /^https:\/\//.test(link.url)), `${place.id} skal ha kjeldekontrollerte HTTPS-lenkjer`);
  assert(place.civication_store.length >= 2, `${place.id} skal ha minst to stadsspesifikke Civication-objekt`);
  assert(place.civication_store.every((item) => item.physicalObject === true && item.placeSpecific === true), `${place.id} sine Civication-objekt skal vere fysiske og stadsspesifikke`);
  assert(place.brands.length >= 3, `${place.id} skal ha dokumenterte aktørar`);
  assert(place.for_na && place.for_na.before && place.for_na.now && place.for_na.change, `${place.id} skal ha komplett før/nå-innhald`);
  assert(articleByPlace.get(place.id)?.wikiText?.length >= 3, `${place.id} skal ha ein full leksikonartikkel`);
}

const natureRoundContent = {
  tasks: nature.tasks_profile,
  nature: nature.nature_profile,
  badges: nature.underbadge_ids,
  training: nature.training_profile,
  civication: nature.civication_store,
  brands: nature.brands,
  før_nå: nature.for_na,
  fortellinger: [natureStory],
  leksikon: [articleByPlace.get(nature.id)]
};
assert.deepStrictEqual(Object.keys(natureRoundContent), expectedNatureRounds, 'Etneelva-innhaldet skal følgje naturprofilen i rett rekkjefølgje');
for (const [roundId, value] of Object.entries(natureRoundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Etneelva manglar innhald i rundingen ${roundId}`);
}
assert(!Object.prototype.hasOwnProperty.call(nature, 'works'), 'Naturprofilen skal ikkje få ei irrelevant works-runding');
assert(!Object.prototype.hasOwnProperty.call(nature, 'people'), 'Naturprofilen skal ikkje få ei irrelevant people-runding');
assert(nature.tasks_profile.tasks.length >= 3, 'Etneelva skal ha minst tre konkrete stadshandlingar');
assert(nature.training_profile.exercises.length >= 2, 'Etneelva skal ha minst to trygge, lågintensive treningsøvingar');
assert(/offentleg|trygg/i.test(nature.training_profile.safety), 'Treningsprofilen skal ha tydeleg tryggleiksregel');
assert(nature.emne_ids.every((id) => validNatureEmneIds.has(id)), 'Etneelva skal berre bruke kanoniske naturemne');
assert(nature.underbadge_ids.every((id) => validNatureBadges.has(id)), 'Etneelva skal berre bruke dokumenterte natur-underbadges');
assert.strictEqual(natureStory.person_id, null, 'Naturforteljinga skal ikkje dikte inn ein hovudperson');
assert.deepStrictEqual([nature.lat, nature.lon, nature.year], [59.66611, 5.94722, 2003], 'Etneelva skal behalde koordinat og verneår');
assert.strictEqual(placeIndex.get(nature.id)?.year, 2003, 'Runtime-indeksen skal behalde Etneelva sitt verneår');

const sciencePeople = new Set(['oystein_skaala', 'per_tommy_fjeldheim']);
const scienceRelations = relations.filter((relation) => relation.place === science.id);
const scienceRoundContent = {
  people: scienceRelations,
  nature: science.nature_profile,
  badges: science.underbadge_ids,
  works: science.works,
  civication: science.civication_store,
  brands: science.brands,
  før_nå: science.for_na,
  fortellinger: [scienceStory],
  leksikon: [articleByPlace.get(science.id)]
};
assert.deepStrictEqual(Object.keys(scienceRoundContent), expectedScienceRounds, 'Forskingsplattform-innhaldet skal følgje standardprofilen i rett rekkjefølgje');
for (const [roundId, value] of Object.entries(scienceRoundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `Forskingsplattforma manglar innhald i rundingen ${roundId}`);
}
assert(!Object.prototype.hasOwnProperty.call(science, 'tasks_profile'), 'Vitenskapsstaden skal ikkje få naturprofilen si tasks-runding');
assert(!Object.prototype.hasOwnProperty.call(science, 'training_profile'), 'Vitenskapsstaden skal ikkje få naturprofilen si training-runding');
assert.deepStrictEqual(new Set(scienceRelations.map((relation) => relation.person)), sciencePeople, 'People-rundingen skal kople begge dokumenterte feltaktørane');
assert(people.filter((person) => sciencePeople.has(person.id)).every((person) => person.placeId === science.id && person.places.includes(science.id)), 'Feltaktørane skal ha forskingsplattforma som stadanker');
assert.strictEqual(scienceStory.person_id, 'oystein_skaala', 'Vitskapsforteljinga skal bruke den dokumenterte prosjektleiaren');
assert(science.works.length >= 4, 'Forskingsplattforma skal ha minst fire instrument-, metode- eller dataspor');
assert(science.emne_ids.every((id) => validScienceEmneIds.has(id)), 'Forskingsplattforma skal berre bruke kanoniske vitskapsemne');
assert(science.underbadge_ids.every((id) => validScienceBadges.has(id)), 'Forskingsplattforma skal berre bruke dokumenterte vitskaps-underbadges');
assert.deepStrictEqual([science.lat, science.lon, science.year], [59.66611, 5.94722, 2013], 'Forskingsplattforma skal behalde semantisk anker og etableringsår');
assert.strictEqual(placeIndex.get(science.id)?.year, 2013, 'Runtime-indeksen skal behalde forskingsplattforma sitt etableringsår');

for (const [story, placeId] of [[natureStory, nature.id], [scienceStory, science.id]]) {
  assert.strictEqual(story.place_id, placeId, `${placeId} si forteljing skal ha rett stadanker`);
  assert(story.sources.length >= 3, `${placeId} si forteljing skal ha minst tre kjelder`);
  const article = articleByPlace.get(placeId);
  assert(article.sources.length >= 3, `${placeId} sin artikkel skal ha minst tre kjelder`);
  assert(article.links.entry_ids.includes(story.id), `${placeId} sin artikkel skal lenkje hovudforteljinga`);
}

assert(runtimeSource.includes('function normalizePlaceCardTrainingProfile(place)'), 'Runtime skal normalisere training_profile');
assert(runtimeSource.includes('trainingEl.innerHTML = renderPlaceCardTrainingProfile(place);'), 'Training-rundingen skal faktisk rendere stadinnhaldet');
assert(runtimeSource.includes('setRoundLabel(trainingIcon, "🏃", trainingProfile?.exercises?.length || "");'), 'Training-rundingen skal vise talet på øvingar');
assert(roundDocs.includes('`training_profile` skal bare fylles når kategori-profilen faktisk har'), 'Den nye training_profile-kontrakten skal vere dokumentert');

const combined = JSON.stringify({ nature, science, natureStory, scienceStory, articles });
assert(/Samkomehølen/.test(combined) && /2003/.test(combined), 'Batchen skal dokumentere samløpet og laksevernet');
assert(/40 meter/.test(combined) && /2013/.test(combined) && /2016/.test(combined), 'Batchen skal dokumentere fellebreidd, etablering og vidareføring');
assert(/PIT/.test(combined) && /DNA/.test(combined), 'Batchen skal dokumentere dei konkrete feltmetodane');

console.log('Etnesjøen river batch 1 round content OK');
