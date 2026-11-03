import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const load = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));

test('Akerselva QuizCard: ten canonical questions and active manifest', () => {
  const manifest = load('data/quizcards/naeringsliv/manifest.json');
  assert.ok(manifest.collections.includes('akerselva_quizcard_v1.json'));
  const collection = load('data/quizcards/naeringsliv/akerselva_quizcard_v1.json');
  const source = load('data/quiz/naeringsliv/akerselva_industri_sets_merged.json');
  const active = new Map(source.sets.flatMap(set => set.questions).map(question => [question.id, question]));
  assert.equal(collection.cards.length, 1);
  const card = collection.cards[0];
  assert.equal(card.targetId, 'akerselva');
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions.length, 10);
  const ids = new Set();
  for (const [index, question] of card.questions.entries()) {
    assert.equal(question.number, index + 1);
    assert.ok(!ids.has(question.sourceQuestionId));
    ids.add(question.sourceQuestionId);
    const canonical = active.get(question.sourceQuestionId);
    assert.ok(canonical, 'QuizCard source must remain in active quiz');
    for (const key of ['id','quiz_id','question','answer','answerIndex','knowledge','primary_knowledge_unit_id'])
      assert.deepEqual(question[key], canonical[key], key);
    assert.deepEqual(question.options, canonical.options);
    assert.deepEqual(question.knowledge_unit_ids, canonical.knowledge_unit_ids);
    assert.equal(question.sourceQuizId, canonical.quiz_id);
    assert.equal(question.options[question.answerIndex], question.answer);
    assert.ok(question.source_urls.length > 0);
  }
});
