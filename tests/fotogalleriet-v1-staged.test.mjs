import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => JSON.parse(fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const quiz = read('reports/place-production/fotogalleriet/quiz-sets-staged.json');
const cards = read('reports/place-production/fotogalleriet/quizcard-staged.json');
const packet = read('data/places/production/fotogalleriet.json');
const place = read('data/places/kunst/oslo/places_kunst/fotogalleriet.json');
const knownClaims = new Map(packet.claims.map(c => [c.id,c]));
const all = quiz.sets.flatMap(s => s.questions);

test('Fotogalleriet is one existing Kunst place and draft has three sets of seven', () => {
  assert.equal(place.id, 'fotogalleriet');
  assert.equal(place.category, 'kunst');
  assert.equal(quiz.production_context.status, 'staged_not_registered_in_quiz_manifest');
  assert.equal(quiz.sets.length, 3);
  assert.deepEqual(quiz.sets.map(s => s.questions.length), [7,7,7]);
  assert.equal(new Set(all.map(q => q.quiz_id)).size, 21);
  assert.equal(new Set(all.map(q => q.id)).size, 21);
});

test('every answer, source and Knowledge identifier is explicit and source-backed', () => {
  for (const q of all) {
    assert.equal(q.targetId, place.id);
    assert.equal(q.placeId, place.id);
    assert.equal(q.categoryId, place.category);
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4);
    assert.equal(q.options[q.answerIndex], q.answer);
    assert.ok(q.knowledge.length > 20);
    const claim = knownClaims.get(q.claim_id);
    assert.equal(claim?.status, 'verified', q.id);
    assert.equal(q.claim_basis, claim.claim);
    assert.ok(q.source_urls.includes(claim.sourceUrl));
    assert.ok(q.primary_knowledge_unit_id.startsWith('ku_kunst_'));
    assert.ok(q.knowledge_unit_ids.includes(q.primary_knowledge_unit_id));
    assert.equal(q.knowledge_link_status, 'staged_pending_canonical_registry');
  }
});

test('ten QuizCard questions are exact references to the fullquiz', () => {
  assert.equal(cards.production_status, 'staged_not_registered_in_quizcard_manifest');
  assert.equal(cards.cards.length, 1);
  const card = cards.cards[0];
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions.length, 10);
  assert.equal(new Set(card.questions.map(q => q.sourceQuizId)).size, 10);
  const byQuiz = new Map(all.map(q => [q.quiz_id,q]));
  for (const q of card.questions) {
    const source = byQuiz.get(q.sourceQuizId);
    assert.ok(source, q.sourceQuizId);
    for (const key of ['question','answer','answerIndex','quiz_id','primary_knowledge_unit_id']) {
      assert.deepEqual(q[key], source[key], q.id + ' ' + key);
    }
    assert.deepEqual(q.options, source.options);
  }
});

test('no same-photo image and frontImage shortcuts in Fotogalleriet draft', () => {
  if (place.image && place.frontImage) {
    assert.notEqual(place.image, place.frontImage);
    assert.notEqual(place.imageMeta?.sourceSha256, place.frontImageMeta?.sourceSha256);
    assert.notEqual(place.imageMeta?.sourcePage, place.frontImageMeta?.sourcePage);
  }
});
