import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const id = 'vinmonopolet_lager';
const place = read('data/places/naeringsliv/oslo/places_naeringsliv/vinmonopolet_lager.json');
const index = read('data/places/places_index.json');
const runtime = read('data/runtime/place-open/vinmonopolet_lager.json');
const quiz = read('data/quiz/naeringsliv/vinmonopolet_lager_sets_merged.json');
const quizManifest = read('data/quiz/manifest.json');
const card = read('data/quizcards/naeringsliv/vinmonopolet_lager_quizkort_v1.json');
const cardManifest = read('data/quizcards/naeringsliv/manifest.json');
const qs = quiz.sets.flatMap(set => set.questions);

test('same 1933 opening across canonical place, index and runtime', () => {
  assert.equal(place.year, 1933);
  assert.equal(runtime.place.year, 1933);
  const indexed = Array.isArray(index) ? index.find(p => p.id === id) : Object.values(index).find(p => p?.id === id);
  assert.ok(indexed, 'place index is missing canonical Hasle site');
  assert.equal(indexed.year, 1933);
  assert.match(place.desc, /1933/);
  assert.ok(!JSON.stringify(place.quiz_profile).includes('Bygget i 1930'));
  assert.equal(place.fagverk.article.length, 3);
  assert.equal(place.fagverk.lenses.length, 3);
});

test('30 source-linked fullquiz questions, 5 sets, fewer year-only answers', () => {
  assert.equal(quiz.sets.length, 5);
  assert.deepEqual(quiz.sets.map(s => s.questions.length), [6,6,6,6,6]);
  assert.equal(qs.length, 30);
  assert.equal(new Set(qs.map(q => q.id)).size, 30);
  assert.equal(new Set(qs.map(q => q.question)).size, 30);
  assert.equal(qs.filter(q => /^\\s*(?:18|19|20)\\d{2}\\s*$/.test(q.answer)).length, 1);
  for (const q of qs) {
    assert.equal(q.targetId, id, q.id);
    assert.equal(q.options[q.answerIndex], q.answer, q.id);
    assert.ok(q.source.length >= 1, q.id);
    assert.ok(q.knowledge_unit_ids.length >= 1, q.id);
    assert.equal(q.knowledge_link_status, 'linked', q.id);
    assert.ok(!q.question.includes('vinmonopolet_lager'), 'Internal key leaked to players');
  }
  const active = quizManifest.sets.filter(s => s.targetId === id);
  assert.equal(active.length, 5);
  assert.deepEqual(active.map(s => s.set_id), quiz.sets.map(s => s.set_id));
});

test('QuizCard exactly reuses ten fullquiz questions, answers and Knowledge IDs', () => {
  assert.ok(cardManifest.collections.includes('vinmonopolet_lager_quizkort_v1.json'));
  assert.equal(card.cards.length, 1);
  const c = card.cards[0];
  assert.equal(c.targetId, id);
  assert.equal(c.questionCount, 10);
  assert.equal(c.questions.length, 10);
  for (const [i, entry] of c.questions.entries()) {
    assert.equal(entry.number, i + 1);
    const source = qs.find(q => q.id === entry.sourceQuestionId);
    assert.ok(source, 'QuizCard question without canonical fullquiz question');
    for (const key of ['question','answer','answerIndex','knowledge','primary_knowledge_unit_id'])
      assert.deepEqual(entry[key], source[key], key + ':' + source.id);
    assert.deepEqual(entry.options, source.options);
    assert.deepEqual(entry.knowledge_unit_ids, source.knowledge_unit_ids);
    assert.equal(entry.sourceQuizId, source.quiz_id);
  }
});

test('canonical existing photographs are present; license requires editorial verification', () => {
  for (const path of [place.image, place.cardImage]) {
    assert.ok(fs.existsSync(path), 'Missing image: ' + path);
    assert.ok(fs.statSync(path).size > 0, 'Empty image: ' + path);
  }
});
