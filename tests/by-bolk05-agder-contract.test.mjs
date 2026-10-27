import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const base = 'data/places/by/agder';
const ids = [
  'arendal_gamle_radhus',
  'arendal_stasjon',
  'arendal_tollbod',
  'trefoldighetskirken_arendal',
  'tyholmen_arendal_byhistorie',
];
const quizPath = (id) => 'data/quiz/by/' + id + '_regional_v1_sets.json';
const cardPath = (part) => 'data/quizcards/by/regional_bolk05_agder_part' + part + '_v1_20261027.json';

test('By05 Agder editorial packages maintain Fagverk/quiz/QuizCard parity as added', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  let completed = 0;
  for (const [index, id] of ids.entries()) {
    const place = read(base + '/' + id + '/' + id + '.json');
    const qpath = quizPath(id);
    const cpath = cardPath(index + 1);
    assert.equal(place.id, id);
    // This test tracks editorial packages as they are pushed to the draft PR.
    // It does not treat unfinished packages as published or integrated.
    if (!fs.existsSync(qpath) || !fs.existsSync(cpath)) continue;
    completed++;
    assert.equal(place.fagverk?.schema, 'history_go_place_fagverk_v2', id);
    assert.equal(place.fagverk?.status, 'curated', id);
    assert.equal(place.fagverk?.article?.length, 3, id);
    assert.equal(place.fagverk?.lenses?.length, 3, id);
    assert.ok(place.fagverk?.source_urls?.length >= 2, id);
    assert.ok(place.fagverk.source_urls.every((url) => url.startsWith('https://')), id);
    assert.ok(place.fagverk?.observable_traces?.length >= 2, id);
    assert.equal(registry.placeLinks[id]?.sourceFile, 'places/by/agder/' + id + '/' + id + '.json');

    const questions = read(qpath).sets.flatMap((set) => set.questions);
    const cards = read(cpath).cards;
    const card = cards.find((item) => item.targetId === id);
    assert.ok(card, id + ': QuizCard not found');
    assert.equal(questions.length, 10, id);
    assert.equal(card.questionCount, 10, id);
    assert.equal(card.questions.length, 10, id);
    assert.equal(new Set(questions.map((q) => q.question)).size, 10, id);
    const yearQuestions = questions.filter((q) => /^(?:når|hvilket år|i hvilket år|fra hvilket år)\b/i.test(q.question));
    assert.ok(yearQuestions.length <= 2, id + ': too many year-only questions');
    for (const [n, q] of questions.entries()) {
      assert.equal(q.options[q.answerIndex], q.answer, id);
      assert.ok(q.source_urls?.length >= 1, id);
      assert.ok(q.source_urls.every((url) => url.startsWith('https://')), id);
      assert.equal(q.knowledge_link_status, 'pending', id);
      assert.equal(q.quiz_id, card.questions[n].quiz_id, id);
      assert.equal(q.answer, card.questions[n].answer, id);
      assert.deepEqual(q.options, card.questions[n].options, id);
    }
  }
  assert.ok(completed >= 2, 'At least two Agder editorial packages should be present');
});
