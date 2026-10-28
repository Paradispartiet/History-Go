import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const placeId = 'var_frelsers_gravlund';
const quizPath = 'data/quiz/historie/var_frelsers_gravlund_sets.json';
const cardsPath = 'data/quizcards/historie/topp10_historie_sted_kort_batch1.json';
const placePath = 'data/places/historie/oslo/places_historie/var_frelsers_gravlund.json';
const quiz = json(quizPath);
const collection = json(cardsPath);
const place = json(placePath);
const cards = collection.cards.filter(item => item.targetId === placeId);
const sourceQuestions = quiz.sets.flatMap(set => set.questions);
const sourceById = new Map(sourceQuestions.map(question => [question.id, question]));

test('Vår Frelsers keeps its existing Place and 4 × 7 Knowledge-linked questions', () => {
  assert.equal(place.id, placeId);
  assert.equal(place.fagverk?.article?.length, 3);
  assert.equal(quiz.sets.length, 4);
  assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7, 7]);
  assert.ok(place.image);
  assert.equal(new Set(sourceQuestions.map(q => q.id)).size, 28);
  for (const q of sourceQuestions) {
    assert.equal(q.knowledge_link_status, 'linked');
    assert.ok(q.primary_knowledge_unit_id);
  }
});

test('QuizCard keeps one canonical card with 10 exact fullquiz questions', () => {
  assert.equal(cards.length, 1, 'never create a duplicate card');
  const card = cards[0];
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions.length, 10);
  assert.equal(card.sourceFile, quizPath);
  assert.equal(card.answerKey.length, 10);
  assert.equal(new Set(card.questions.map(q => q.sourceQuestionId)).size, 10);
  for (const [i, q] of card.questions.entries()) {
    const original = sourceById.get(q.sourceQuestionId);
    assert.ok(original, 'sourceQuestionId must exist in active quiz');
    assert.equal(q.sourceQuizId, original.quiz_id);
    assert.equal(q.sourceQuizFile, quizPath);
    assert.equal(q.question, original.question);
    assert.deepEqual(q.options, original.options);
    assert.equal(q.answer, original.answer);
    assert.equal(q.answerIndex, original.answerIndex);
    assert.equal(q.primary_knowledge_unit_id, original.primary_knowledge_unit_id);
    assert.deepEqual(q.knowledge_unit_ids, original.knowledge_unit_ids);
    assert.equal(q.knowledge_link_status, 'linked');
    assert.equal(q.number, i + 1);
    assert.deepEqual(card.answerKey[i], { number: i + 1, answer: original.answer });
  }
});
