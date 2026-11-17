import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const quiz = JSON.parse(readFileSync('data/quiz/historie/frysjadammen_sets.json', 'utf8'));
const rows = quiz.sets.flatMap(set => set.questions);
const sourcedIds = [
  ...Array.from({length: 7}, (_, n) => `frysjadammen_s1_q${n + 1}`),
  ...Array.from({length: 3}, (_, n) => `frysjadammen_s2_q${n + 1}`),
];

test('Oset retains the six-set, 42-question quiz and stable progression IDs', () => {
  assert.equal(quiz.targetId, 'frysjadammen');
  assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7, 7, 7, 7]);
  assert.equal(rows.length, 42);
  assert.equal(new Set(rows.map(q => q.id)).size, 42);
  assert.equal(new Set(rows.map(q => q.quiz_id)).size, 42);
  for (const [setIndex, set] of quiz.sets.entries()) {
    assert.equal(set.set_id, `historie_frysjadammen_set_${setIndex + 1}`);
    for (const [qIndex, q] of set.questions.entries()) {
      assert.equal(q.id, `frysjadammen_s${setIndex + 1}_q${qIndex + 1}`);
      assert.equal(q.quiz_id, `historie_frysjadammen_set_${setIndex + 1}_q${qIndex + 1}`);
      assert.match(q.primary_knowledge_unit_id, /^ku_/);
      assert.ok(q.knowledge_unit_ids.includes(q.primary_knowledge_unit_id));
    }
  }
});

test('The first ten Oset questions are sourced, local, linked and valid multiple choice', () => {
  for (const id of sourcedIds) {
    const q = rows.find(q => q.id === id);
    assert.ok(q, id);
    assert.match(q.question + ' ' + q.knowledge, /Oset|Maridalsvann|Akerselva|sluse|bru|Vann-/i);
    assert.doesNotMatch(q.question + ' ' + q.knowledge, /Frysjadammen|History Go-læring|quizdata/i);
    assert.equal(q.options.length, 3);
    assert.equal(new Set(q.options).size, 3);
    assert.equal(q.options[q.answerIndex], q.answer);
    assert.ok(Array.isArray(q.source) && q.source.length > 0);
    assert.ok(q.source.every(url => /^https:\/\/oslobyleksikon\.no\/side\//.test(url)), id);
    assert.equal(q.claim_basis, 'sourced_place_fact');
    assert.equal(q.knowledge_link_status, 'linked');
    assert.equal(q.knowledge_link_evidence?.method, 'explicit');
    assert.equal(q.knowledge_link_evidence?.reviewedAt, '2026-11-17');
    assert.ok(q.emne_ids.every(eid => /^em_his_/.test(eid)));
  }
  assert.equal(sourcedIds.filter(id => /\b1859\b/.test(rows.find(q => q.id === id).answer)).length, 1);
});
