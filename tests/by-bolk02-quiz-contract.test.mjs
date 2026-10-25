import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const legacy = ['akerselva', 'botsparken', 'stensparken', 'vigelandsparken'];
const fresh = [
  'fagerborg_kirke', 'frogner_kirke', 'holmenkollen_kapell',
  'uranienborg_kirke', 'lindoya', 'nakholmen', 'ormoya', 'ulvoya',
  'frognerparken', 'grorudparken', 'kampen_park', 'kirsebarlunden',
  'rudolf_nilsens_plass', 'snippen_lekepark', 'torshovdalen',
  'kampen_okologiske_barnebondegard'
];
const ids = [...legacy, ...fresh];
const inPlaces = new Set([
  ...legacy, 'fagerborg_kirke', 'frogner_kirke', 'holmenkollen_kapell',
  'uranienborg_kirke', 'lindoya', 'nakholmen', 'ormoya', 'ulvoya',
  'kampen_okologiske_barnebondegard'
]);
const placePath = (id) => 'data/places/by/oslo/' +
  (inPlaces.has(id) ? 'places/' : '') + id + '.json';
const imageAdded = fresh.filter((id) => id !== 'kirsebarlunden');
const quizManifest = read('data/quiz/manifest.json').sets;
const cardManifest = read('data/quizcards/by/manifest.json').collections;
const cards = cardManifest.flatMap((name) =>
  read('data/quizcards/by/' + name).cards || []
);

test('By-bolk 02 retains 20 unique canonical places and curated Fagverk', () => {
  assert.equal(new Set(ids).size, 20);
  for (const id of ids) {
    const place = read(placePath(id));
    assert.equal(place.id, id);
    assert.equal(place.category, 'by');
    assert.ok(place.desc?.length >= 30, id + ': missing short history');
    assert.ok(place.popupDesc?.length >= 200, id + ': missing historical article');
    assert.equal(place.fagverk?.status, 'curated', id);
    assert.ok(place.fagverk?.article?.length >= 3, id);
    assert.ok(place.fagverk?.lenses?.length >= 3, id);
    assert.ok(place.fagverk?.source_urls?.length >= 1, id);
    const card = cards.filter((c) => c.targetId === id);
    assert.equal(card.length, 1, id + ': duplicate or missing QuizCard');
    assert.equal(card[0].questions?.length, 10, id + ': QuizCard must have ten questions');
    assert.ok(place.image || id === 'kirsebarlunden', id + ': missing image');
  }
  for (const id of imageAdded) {
    const place = read(placePath(id));
    assert.ok(/^https:\/\/commons\.wikimedia\.org\//.test(place.image), id + ': unexpected photo URL');
    assert.ok(place.imageCredit, id + ': no image creator');
    assert.ok(place.imageSourceUrl, id + ': no image source');
    assert.ok(place.imageLicense, id + ': no image licence');
    assert.ok(place.imageLicenseUrl, id + ': no licence URL');
  }
});

test('All 16 new By fullquiz sets are uniquely registered with exactly 10 sourced, playable questions', () => {
  for (const id of fresh) {
    const file = 'data/quiz/by/' + id + '_oslo_v1_sets.json';
    const entries = quizManifest.filter((row) => row.targetId === id && row.file === file);
    assert.equal(entries.length, 1, id + ': unique quiz manifest registration');
    const json = read(file);
    assert.equal(json.targetId, id);
    assert.equal(json.sets.length, 1);
    const set = json.sets[0];
    assert.equal(entries[0].set_id, set.set_id, id + ': engine set reference');
    assert.equal(set.id, set.set_id);
    assert.equal(set.questions.length, 10);
    const card = cards.find((c) => c.targetId === id);
    assert.equal(card.sourceFile, file);
    const questions = new Set();
    const answers = new Set();
    for (let i = 0; i < 10; i++) {
      const q = set.questions[i], cq = card.questions[i];
      assert.ok(!questions.has(q.question), id + ': duplicated question');
      questions.add(q.question);
      answers.add(q.answer);
      assert.equal(q.quiz_id, set.set_id + '_q' + (i + 1));
      assert.equal(q.targetId, id);
      assert.equal(q.categoryId, 'by');
      assert.equal(q.options.length, 3);
      assert.equal(q.options.indexOf(q.answer), q.answerIndex);
      assert.equal(q.source_origin, 'external');
      assert.ok(q.source_urls?.[0]?.startsWith('https://'), id + ': missing source URL');
      assert.ok(q.emne_id?.startsWith('em_by_'), id + ': missing By subject');
      assert.equal(cq.sourceQuestionId, q.id);
      assert.equal(cq.sourceQuizId, q.quiz_id);
      assert.equal(cq.sourceQuizFile, file);
      assert.equal(q.knowledge_link_status, 'linked', id + ': fullquiz not linked to Knowledge');
      assert.ok(q.knowledge_unit_ids?.length > 0, id + ': no canonical Knowledge units');
      assert.ok(q.knowledge_unit_ids.includes(q.primary_knowledge_unit_id), id + ': invalid primary Knowledge unit');
      assert.equal(q.knowledge_contract_version, 1, id + ': Knowledge contract mismatch');
      assert.equal(cq.knowledge_link_status, q.knowledge_link_status, id + ': QuizCard Knowledge status mismatch');
      assert.deepEqual(cq.knowledge_unit_ids, q.knowledge_unit_ids, id + ': QuizCard Knowledge units mismatch');
      assert.equal(cq.primary_knowledge_unit_id, q.primary_knowledge_unit_id, id + ': QuizCard primary Knowledge mismatch');
      assert.equal(cq.knowledge_contract_version, q.knowledge_contract_version, id + ': QuizCard Knowledge version mismatch');
    }
    assert.equal(questions.size, 10);
    assert.equal(answers.size, 10, id + ': answers should not repeat');
  }
});

test('Stensparken QuizCard uses original local history, not generic park filler', () => {
  const quiz = read('data/quiz/by/stensparken_sets.json');
  const rows = quiz.sets.flatMap((set) => set.questions);
  assert.equal(rows.length, 10);
  const card = cards.find((c) => c.targetId === 'stensparken');
  assert.equal(card.questions.length, 10);
  for (let i = 0; i < 10; i++) {
    assert.equal(card.questions[i].sourceQuestionId, rows[i].id);
    assert.equal(card.questions[i].answer, rows[i].answer);
  }
  const entries = quizManifest.filter((row) => row.targetId === 'stensparken');
  assert.equal(entries.length, 3, 'one registration per historical set');
  assert.deepEqual(entries.map((row) => row.set_id).sort(), quiz.sets.map((set) => set.set_id).sort());
});

test('Fagverk release carries the current canonical registry version', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  const release = read('data/fagverk/fagverk_release.json');
  assert.equal(release.registry.path, 'data/fagverk/fagverk_registry.json');
  assert.equal(release.registry.version, registry.version);
  assert.equal(release.registry.updated_at, registry.updatedAt);
  for (const id of ids) {
    assert.equal(registry.placeLinks?.[id]?.status, 'curated', id + ': Fagverk registry status');
  }
});

test('By-bolk 02 indexed image pointers mirror canonical places', () => {
  const index = read('data/places/places_index.json');
  for (const id of ids) {
    const place = read(placePath(id));
    const matches = index.filter((entry) => entry.id === id);
    assert.equal(matches.length, 1, id + ': missing or duplicate central index entry');
    const indexed = matches[0];
    assert.ok(place.image, id + ': missing canonical Place image');
    assert.ok(place.cardImage, id + ': missing canonical card image');
    assert.equal(indexed.image, place.image, id + ': central index image is stale');
    assert.equal(indexed.cardImage, place.cardImage, id + ': central index card image is stale');
  }
});

const churchAndIslandIds = [
  'fagerborg_kirke', 'frogner_kirke', 'holmenkollen_kapell', 'uranienborg_kirke',
  'lindoya', 'nakholmen', 'ormoya', 'ulvoya'
];

test('By-bolk 02 presents 80 substantive, synchronized editorial explanations', () => {
  for (const id of churchAndIslandIds) {
    const quiz = read('data/quiz/by/' + id + '_oslo_v1_sets.json');
    const questions = quiz.sets.flatMap(set => set.questions);
    const card = cards.find(entry => entry.targetId === id);
    assert.equal(questions.length, 10, id);
    assert.equal(card.questions.length, 10, id);
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];
      const cardQuestion = card.questions[index];
      assert.ok(question.explanation?.length >= 65, question.id + ': substantive explanation missing');
      assert.doesNotMatch(question.explanation, /Spørsmålet bygger på|Historisk fakta knyttet til|Basert på stedets kanoniske/i);
      assert.equal(cardQuestion.explanation, question.explanation, question.id + ': QuizCard/fullquiz explanation mismatch');
      assert.ok(question.source_urls?.[0]?.startsWith('https://'), question.id + ': source missing');
    }
  }
});

test('Quiz result review prefers specific editorial explanations over generic Knowledge legacy text', () => {
  const source = fs.readFileSync('js/quizzes.js', 'utf8');
  assert.match(source, /explanation\.textContent = question\.explanation \|\| question\.knowledge_payload\?\.explanation \|\| question\.knowledge/);
  assert.match(source, /knowledge: q\.explanation \|\| q\.knowledge/);
});
