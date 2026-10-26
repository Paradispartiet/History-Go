import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const load = file => fs.readFileSync(file, 'utf8');

test('Tinghus has precisely ten existing multiple-choice QuizCard questions and answers', () => {
  const collection = JSON.parse(load('data/quizcards/politikk/topp10_politikk_oslo_v1_batch1.json'));
  const cards = collection.cards.filter(card => card.targetId === 'tinghuset');
  assert.equal(cards.length, 1);
  const card = cards[0];
  assert.equal(card.questions.length, 10);
  assert.equal(card.answerKey.length, 10);
  for (const question of card.questions) {
    assert.ok(String(question.question || '').trim());
    assert.ok(Array.isArray(question.options) && question.options.length >= 2, 'Every question must have multiple-choice options');
    assert.ok(question.options.includes(question.answer), 'Answer must occur among options');
  }
});

test('Both shipping PlaceCard resolvers and their TypeScript source load Politikk QuizCards', () => {
  const canonicalManifest = JSON.parse(load('data/quizcards/politikk/manifest.json'));
  assert.ok(canonicalManifest.collections.includes('topp10_politikk_oslo_v1_batch1.json'));
  assert.ok(load('js/ui/place-card.js').includes('"data/quizcards/politikk/manifest.json"'));
  assert.ok(load('js/ui/placeQuizCards.ts').includes('"politikk/manifest.json"'));
  assert.ok(load('js/ui/place-card-quizcards-patch.js').includes('"politikk/manifest.json"'));
});
