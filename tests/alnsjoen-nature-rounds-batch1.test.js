const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const repo = path.resolve(__dirname, '..');
const readJson = p => JSON.parse(fs.readFileSync(path.join(repo, p), 'utf8'));
const expectedRounds = ['tasks','nature','badges','training','civication','brands','før_nå','fortellinger','leksikon'];
const runtime = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');
const profileMatch = runtime.match(/natur:\s*\[([^\]]+)\]/);
assert(profileMatch, 'runtime mangler naturprofil');
assert.deepStrictEqual(JSON.parse(`[${profileMatch[1]}]`), expectedRounds);

const placePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alnsjoen_alna_kilde.json';
const quizPath = 'data/quiz/natur/alnsjoen_alna_kilde_sets.json';
const storyPath = 'data/stories/stories_alnsjoen_alna_kilde.json';
const articlePath = 'data/leksikon/places/oslo/natur/leksikon_alnsjoen_alna_kilde.json';
const place = readJson(placePath);
const quiz = readJson(quizPath);
const story = readJson(storyPath)[0];
const article = readJson(articlePath);
const index = readJson('data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json').find(x => x.id === place.id);
const routeManifest = readJson('data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json');
const manifestRow = routeManifest.places.find(x => x.id === place.id);
const quizManifest = readJson('data/quiz/manifest.json');
const storyManifest = readJson('data/stories/stories_manifest.json');
const leksikonManifest = readJson('data/leksikon/manifest.json');
const validBadges = new Set(readJson('data/badges/natur.json').sub);

assert.strictEqual(place.id, 'alnsjoen_alna_kilde');
assert.strictEqual(place.name, 'Alnsjøen (Alna-kilde)');
assert.strictEqual(place.category, 'natur');
assert.deepStrictEqual([place.lat, place.lon, place.r, place.year ?? null], [59.96527, 10.84704, 140, null]);
assert.strictEqual(place.routeId, 'alnaelva_grontdrag');
assert.strictEqual(place.coordStatus, 'verified');
assert(index && manifestRow);
assert.deepStrictEqual([index.lat, index.lon, index.r, index.year ?? null], [place.lat, place.lon, place.r, place.year ?? null]);

const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(repo, placePath))).digest('hex');
assert.strictEqual(manifestRow.sha256, hash, 'manifest-hash må følge stedfilen');

for (const key of ['rounds','rundinger','routes','works','people','play_profile','flora','fauna']) {
  assert(!Object.prototype.hasOwnProperty.call(place, key), `forbudt felt ${key}`);
}

const roundContent = {
  tasks: place.tasks_profile,
  nature: place.nature_profile,
  badges: place.underbadge_ids,
  training: place.training_profile,
  civication: place.civication_store,
  brands: place.brands,
  før_nå: place.for_na,
  fortellinger: [story],
  leksikon: [article]
};
assert.deepStrictEqual(Object.keys(roundContent), expectedRounds);
for (const [id, value] of Object.entries(roundContent)) {
  const filled = Array.isArray(value) ? value.length > 0 : Boolean(value && typeof value === 'object');
  assert(filled, `mangler ${id}`);
}

assert(place.externalLinks.length >= 8);
assert(place.externalLinks.every(x => x.type === 'repository' || /^https:\/\//.test(x.url)));
assert(place.underbadge_ids.length >= 15 && place.underbadge_ids.every(x => validBadges.has(x)));
assert(place.tasks_profile.tasks.length === 4);
assert(place.training_profile.exercises.length === 3);
assert(/ikke bad|ikke.*fisk|50 meter|sperring/i.test(place.training_profile.safety));
assert(place.civication_store.length === 4 && place.civication_store.every(x => x.physicalObject && x.placeSpecific));
assert(place.brands.length >= 8);
assert(place.for_na.look_for.length >= 8);
assert(place.nature_profile.summary.length >= 1500);
assert.deepStrictEqual(place.nature_profile.nearby_place_ids, ['groruddammen','alnaparken','alna_smalvoll']);

const mapFiles = [
  'data/natur/nature_place_map.json',
  'data/natur/nature_bird_place_map.json',
  'data/natur/nature_oslo_expansion_place_map.json',
  'data/natur/nature_routes_place_map.json',
  'data/natur/nature_etne_place_map.json'
];
const merged = { flora: [], fauna: [] };
for (const file of mapFiles) {
  const raw = readJson(file);
  const entry = (raw.places || raw).alnsjoen_alna_kilde;
  if (!entry) continue;
  merged.flora.push(...(entry.flora || []));
  merged.fauna.push(...(entry.fauna || []));
}
merged.flora = [...new Set(merged.flora)].sort();
merged.fauna = [...new Set(merged.fauna)].sort();
assert.deepStrictEqual(merged.flora, ['emne_flora_mahonia']);
assert.deepStrictEqual(merged.fauna, []);
const inventory = place.nature_profile.species_inventory;
assert.strictEqual(inventory.total_species, 1);
assert.deepStrictEqual(inventory.flora.map(x => x.id), ['emne_flora_mahonia']);
assert.deepStrictEqual(inventory.fauna, []);

assert.strictEqual(quiz.sets.length, 6);
assert(quiz.sets.every((s, i) => s.order === i + 1 && s.questions.length === 7));
assert(quiz.sets.flatMap(s => s.questions).every(q =>
  q.categoryId === 'natur' &&
  q.placeId === place.id &&
  Array.isArray(q.source) && q.source.length &&
  q.claim_basis === 'documented' &&
  q.options[q.answerIndex] === q.answer &&
  Array.isArray(q.related_emner) && q.related_emner.includes('em_natur_arter_habitat_mangfold')
));
const quizRows = quizManifest.sets.filter(x => x.targetId === place.id);
assert.deepStrictEqual(quizRows, [{ targetId: place.id, file: quizPath }]);

assert(story && story.place_id === place.id && story.sources.length >= 8);
assert(storyManifest.files.some(x => x.path === storyPath && x.entity_id === place.id && x.category === 'natur'));
assert(article && article.place_id === place.id && article.version === 2 && article.title === place.name);
assert(article.sources.length >= 8 && article.facts.length >= 12 && article.chronology.length >= 7);
assert(leksikonManifest.files.includes(articlePath));
assert(leksikonManifest.files.indexOf(articlePath) > leksikonManifest.files.indexOf('data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json'));

const all = JSON.stringify({ place, quiz, story, article });
for (const token of ['mahonia','Mahonia aquifolium','Nittedalkalderaen','listebasalt','kollapsbreksje','1700','1880','1898','1930','50 meter','drikkevann']) {
  assert(all.includes(token), `mangler ${token}`);
}
assert(/ikke en garanti|ikke.*garanti/i.test(all));
console.log('Alnsjøen nature rounds batch 1 OK');
