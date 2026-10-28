import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => JSON.parse(readFileSync(path, 'utf8'));
const id = 'vulkan_energisentral';
const quizPath = 'data/quiz/by/vulkan_energisentral_sets.json';
const cardPath = 'data/quizcards/by/topp10_by_kort_batch1.json';
const placePath = 'data/places/by/oslo/places/vulkan_energisentral.json';
const sourceSets = read(quizPath).sets;
const sourceQuestions = sourceSets.flatMap(set => set.questions);
const sourceById = new Map(sourceQuestions.map(q => [q.id, q]));
const cards = read(cardPath).cards.filter(card => card.targetId === id);
const place = read(placePath);

test('Vulkan energisentral retains its Place, Fagverk and active quiz', () => {
  assert.equal(place.id, id);
  assert.ok(place.image);
  assert.ok(place.fagverk?.article?.length >= 3);
  assert.deepEqual(sourceSets.map(set => set.questions.length), [5, 5, 5]);
  assert.equal(sourceQuestions.length, 15);
  for (const q of sourceQuestions) {
    assert.equal(q.knowledge_link_status, 'linked');
    assert.ok(q.primary_knowledge_unit_id);
  }
});

test('Vulkan energisentral QuizCard reuses 10 exact Knowledge-linked questions', () => {
  assert.equal(cards.length, 1);
  const card = cards[0];
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions.length, 10);
  assert.equal(card.sourceFile, quizPath);
  assert.equal(card.answerKey.length, 10);
  assert.equal(new Set(card.questions.map(q => q.sourceQuestionId)).size, 10);
  for (const [i, q] of card.questions.entries()) {
    const source = sourceById.get(q.sourceQuestionId);
    assert.ok(source, 'sourceQuestionId must resolve in active quiz');
    assert.equal(q.sourceQuizId, source.quiz_id);
    assert.equal(q.sourceQuizFile, quizPath);
    assert.equal(q.question, source.question);
    assert.deepEqual(q.options, source.options);
    assert.equal(q.answer, source.answer);
    assert.equal(q.answerIndex, source.answerIndex);
    assert.equal(q.primary_knowledge_unit_id, source.primary_knowledge_unit_id);
    assert.deepEqual(q.knowledge_unit_ids, source.knowledge_unit_ids);
    assert.equal(q.knowledge_link_status, 'linked');
    assert.deepEqual(card.answerKey[i], { number: i + 1, answer: source.answer });
  }
});
