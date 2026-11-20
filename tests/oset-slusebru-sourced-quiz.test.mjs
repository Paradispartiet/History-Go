import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const quiz = JSON.parse(readFileSync('data/quiz/historie/frysjadammen_sets.json', 'utf8'));
const rows = quiz.sets.flatMap(set => set.questions);
const sourcedIds = [
  ...Array.from({length: 7}, (_, n) => `frysjadammen_s1_q${n + 1}`),
  ...Array.from({length: 3}, (_, n) => `frysjadammen_s2_q${n + 1}`),
];

test('The first ten Oset questions are sourced, local, linked and valid multiple choice', () => {
  for (const id of sourcedIds) {
    const q = rows.find(q => q.id === id);
    assert.ok(q, id);
    assert.match(q.question + ' ' + q.knowledge, /Oset|Maridalsvann|Akerselva|sluse|bru|Vann-/i);
    assert.doesNotMatch(q.question + ' ' + q.knowledge, /Frysjadammen|History Go-læring|quizdata/i);
    assert.equal(q.options.length, 3);
    assert.equal(new Set(q.options).size, 3);
    assert.equal(q.options[q.answerIndex], q.answer);
    assert.ok(Array.isArray(q.source_urls) && q.source_urls.length > 0);
    assert.ok(q.source_urls.some(url => /^https:\/\/oslobyleksikon\.no\/side\//.test(url)), id);
    assert.ok(q.claim_basis?.trim(), id);
    assert.equal(q.knowledge_link_status, 'linked');
    assert.equal(q.knowledge_link_evidence?.method, 'explicit');
    assert.equal(q.knowledge_link_evidence?.reviewedAt, '2026-11-17');
    assert.ok(q.emne_ids.every(eid => /^em_his_/.test(eid)));
  }
  assert.equal(sourcedIds.filter(id => /\b1859\b/.test(rows.find(q => q.id === id).answer)).length, 1);
});
