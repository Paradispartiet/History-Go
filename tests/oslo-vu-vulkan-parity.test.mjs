import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));
const cases = [
  {
    place: 'vulkan_industriomrade',
    quizFile: 'data/quiz/historie/vulkan_industriomrade_sets.json',
    cardFile: 'data/quizcards/historie/vulkan_industriomrade_quizcard_v1.json',
    placeFile: 'data/places/natur/oslo/places_oslo_natur_akerselvarute/vulkan_industriomrade.json',
    expectedQuestions: 28, expectedFagverk: 5,
    manifest: 'data/quizcards/historie/manifest.json'
  },
  {
    place: 'vulkan_energisentral',
    quizFile: 'data/quiz/by/vulkan_energisentral_sets.json',
    cardFile: 'data/quizcards/by/topp10_by_kort_batch1.json',
    placeFile: 'data/places/by/oslo/places/vulkan_energisentral.json',
    expectedQuestions: 15, expectedFagverk: 6,
    manifest: 'data/quizcards/by/manifest.json'
  }
];

for (const entry of cases) {
  test(entry.place + ' preserves existing Place and fullquiz', () => {
    const place = json(entry.placeFile);
    const sets = json(entry.quizFile).sets;
    const questions = sets.flatMap(s => s.questions);
    assert.equal(place.id, entry.place);
    assert.ok(place.image, 'existing photograph is retained');
    assert.equal(place.fagverk.article.length, entry.expectedFagverk);
    assert.equal(questions.length, entry.expectedQuestions);
    assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
    assert.ok(questions.every(q => q.primary_knowledge_unit_id), 'existing canonical IDs remain');
  });

  test(entry.place + ' has one card with ten exact Knowledge-linked source questions', () => {
    const full = json(entry.quizFile).sets.flatMap(s => s.questions);
    const byId = new Map(full.map(q => [q.id, q]));
    const cards = json(entry.cardFile).cards.filter(c => c.targetId === entry.place);
    const manifest = json(entry.manifest);
    assert.ok(manifest.collections.includes(entry.cardFile.split('/').pop()), 'collection is registered');
    assert.equal(cards.length, 1);
    const card = cards[0];
    assert.equal(card.questionCount, 10);
    assert.equal(card.questions.length, 10);
    assert.equal(card.sourceFile, entry.quizFile);
    assert.equal(card.answerKey.length, 10);
    assert.equal(new Set(card.questions.map(q => q.sourceQuestionId)).size, 10);
    for (const [i, q] of card.questions.entries()) {
      const source = byId.get(q.sourceQuestionId);
      assert.ok(source, 'source ID belongs to the active quiz');
      assert.equal(q.number, i+1);
      assert.equal(q.sourceQuizId, source.quiz_id);
      assert.equal(q.sourceQuizFile, entry.quizFile);
      assert.equal(q.question, source.question);
      assert.deepEqual(q.options, source.options);
      assert.equal(q.answer, source.answer);
      assert.equal(q.answerIndex, source.answerIndex);
      assert.equal(q.knowledge_link_status, 'linked');
      assert.equal(q.primary_knowledge_unit_id, source.primary_knowledge_unit_id);
      assert.deepEqual(q.knowledge_unit_ids, source.knowledge_unit_ids);
      assert.deepEqual(card.answerKey[i], {number: i+1, answer: source.answer});
    }
  });
}
