import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const load = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const quiz = load('data/quiz/historie/museumsleiligheten_grabein_sets.json');
const brief = load('data/quiz/production_briefs/historie/museumsleiligheten_grabein.json');
const context = load('data/quiz/production_context/historie/museumsleiligheten_grabein.json');
const quizCard = load('data/quizcards/historie/museumsleiligheten_grabein_quizkort_v1.json');
const production = load('data/places/production/museumsleiligheten_grabein.json');

test('Gråbein preserves the four seven-question quiz sets and canonical answers', () => {
  assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7, 7]);
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(questions.find(q => q.id.endsWith('quiz_05')).answer, 'Bjørklund');
  assert.equal(questions.find(q => q.id.endsWith('quiz_08')).answer, '1891');
});

test('Bjørklund questions do not assert that a specific apartment has been identified', () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  const cardQs = quizCard.cards.flatMap(card => card.questions);
  const expectations = [
    ['museumsleiligheten_grabein_quiz_05', 'Bjørklund'],
    ['museumsleiligheten_grabein_quiz_08', '1891']
  ];
  for (const [id, answer] of expectations) {
    const q = questions.find(item => item.id === id);
    assert.ok(q, id);
    assert.equal(q.answer, answer);
    assert.match(q.claim_basis, /en av to|én av to/i);
    assert.match(q.knowledge, /ikke sikkert|ikke historisk sikker/i);
    assert.ok(q.source.includes('historielag'));
    const claim = brief.claims.find(item => item.claim_id === q.claim_id);
    const derived = context.claim_bank.find(item => item.claim_id === q.claim_id);
    assert.ok(claim && derived);
    assert.equal(claim.statement, q.claim_basis);
    assert.equal(derived.statement, claim.statement);
    assert.ok(claim.source_ids.includes('historielag'));
    const cardQuestion = cardQs.find(item => item.sourceQuestionId === id);
    assert.ok(cardQuestion);
    assert.equal(cardQuestion.question, q.question);
    assert.equal(cardQuestion.answer, q.answer);
    assert.ok(production.quizReadiness.questions.some(item => item.question === q.question && item.answer === answer));
  }
  assert.ok(brief.sources.historielag.url.startsWith('https://egt-historielag.no/'));
});
