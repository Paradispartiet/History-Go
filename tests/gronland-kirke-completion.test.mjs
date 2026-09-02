import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const exists = (file) => fs.existsSync(path.join(root, file));
const placeFile = 'data/places/religion/oslo/gronland_kirke/gronland_kirke.json';
const oldPlaceFile = 'data/places/by/oslo/places/gronland_kirke.json';
const quizFile = 'data/quiz/religion/gronland_kirke_sets.json';
const oldQuizFile = 'data/quiz/by/gronland_kirke_sets.json';

function place() { return read(placeFile); }

test('Grønland kirke is a complete Religion place with unchanged verified coordinate', () => {
  assert.equal(exists(placeFile), true);
  assert.equal(exists(oldPlaceFile), false);
  const p = place();
  assert.equal(p.category, 'religion');
  assert.equal(p.production_status, 'complete');
  assert.equal(p.operationStatus, 'temporarily_closed_for_renovation');
  assert.equal(p.lat, 59.9110993638745);
  assert.equal(p.lon, 10.767560036280734);
  assert.equal(p.address.street, 'Grønlandsleiret');
  assert.equal(p.address.number, '34');
  assert.match(p.news[0].summary, /1\. september.*24\. november 2026|24\. november.*1\. september 2026/u);
  assert.match(p.news[0].summary, /Gamlebyen kirke/u);
});

test('PlaceCard owns exactly People Objects Brands and Ritualer og tradisjoner', () => {
  const p = place();
  assert.deepEqual(p.place_card_profile.collection_ids, ['people', 'objects', 'brands', 'productions']);
  assert.equal(p.place_card_profile.category_collection_label, 'Ritualer og tradisjoner');
  assert.deepEqual(p.related_people_ids, ['wilhelm_von_hanno']);
  assert.deepEqual(p.objects.map((item) => item.id), ['gronland_kirke_dopefont', 'gronland_kirke_apsisglass']);
  assert.deepEqual(p.productions.map((item) => item.id), ['gronland_kirke_gudstjenester', 'gronland_kirke_dap', 'gronland_kirke_paskeliturgi']);
  for (const item of [...p.objects, ...p.productions]) {
    assert.ok(/^https:\/\//u.test(item.image) || exists(item.image), item.image);
    assert.match(item.imageMeta.sourcePage, /^https:\/\//u, item.id);
    assert.ok(item.source_urls.length > 0, item.id);
  }
  const brands = read('data/brands/brands_by_place.json');
  assert.deepEqual(brands.gronland_kirke, ['den_norske_kirke']);
});

test('curated full Fagverk from the precursor PR survives category migration', () => {
  const f = place().fagverk;
  assert.equal(f.schema, 'history_go_place_fagverk_v2');
  assert.equal(f.level, 'full');
  assert.equal(f.status, 'curated');
  assert.ok(f.article.length >= 5);
  assert.ok(f.lenses.length >= 5);
  assert.ok(f.guiding_questions.length >= 6);
  assert.ok(f.observable_traces.length >= 3);
  const registry = read('data/fagverk/fagverk_registry.json');
  assert.equal(registry.placeLinks.gronland_kirke.sourceFile, 'places/religion/oslo/gronland_kirke/gronland_kirke.json');
});

test('Religion quiz replaces legacy By ownership with 5x7 reviewed questions', () => {
  assert.equal(exists(quizFile), true);
  assert.equal(exists(oldQuizFile), false);
  const quiz = read(quizFile);
  assert.equal(quiz.categoryId, 'religion');
  assert.equal(quiz.targetId, 'gronland_kirke');
  assert.equal(quiz.sets.length, 5);
  assert.deepEqual(quiz.sets.map((set) => set.questions.length), [7, 7, 7, 7, 7]);
  const questions = quiz.sets.flatMap((set) => set.questions);
  assert.equal(questions.length, 35);
  for (const q of questions.slice(0, 14)) {
    assert.equal(q.method_id ?? null, null, q.id);
    assert.equal(q.theory_ref ?? null, null, q.id);
  }
  assert.equal(quiz.production_context.manifest_category, 'religion');
});

test('production packet and workcard prove complete four-collection production', () => {
  const packet = read('data/places/production/gronland_kirke.json');
  assert.equal(packet.status, 'ready_v4_2');
  assert.equal(packet.placeFile, placeFile);
  assert.deepEqual(Object.keys(packet.collections).filter((key) => ['people','objects','brands','productions'].includes(key)), ['people','objects','brands','productions']);
  assert.deepEqual(packet.collections.people, ['wilhelm_von_hanno']);
  assert.equal(packet.collections.objects.length, 2);
  assert.deepEqual(packet.collections.brands, ['den_norske_kirke']);
  assert.equal(packet.collections.productions.length, 3);
  assert.equal(packet.roundsReadiness.exactCollectionCount, 4);
  const workcard = read('reports/place-production/gronland-kirke-workcard-current.json');
  assert.equal(workcard.status, 'complete');
  assert.equal(workcard.quality_gate, '30/30');
});

test('Story, leksikon, language and four reading tracks are materialized', () => {
  const stories = read('data/stories/stories_gronland_kirke.json');
  assert.equal(stories.length, 1);
  assert.equal(stories[0].quality_profile, 'episode_v1');
  assert.equal(stories[0].place_id, 'gronland_kirke');
  const storyManifest = read('data/stories/stories_manifest.json');
  assert.ok(storyManifest.files.some((entry) => entry.entity_id === 'gronland_kirke' && entry.category === 'religion'));
  assert.equal(exists('data/leksikon/places/oslo/religion/leksikon_gronland_kirke.json'), true);
  const language = read('data/leksikon/sprak/places/europe/norway/oslo/gronland_kirke.json');
  assert.equal(language.entries.length, 6);
  const readings = read('data/lesespor/oslo/lesespor_oslo_religion.json');
  assert.equal(readings.items.filter((item) => (item.place_ids || []).includes('gronland_kirke')).length, 4);
});
