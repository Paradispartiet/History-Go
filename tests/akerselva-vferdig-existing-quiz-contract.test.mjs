import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (p) => JSON.parse(readFileSync(new URL('../' + p, import.meta.url), 'utf8'));

test('Akerselva canonical quiz remains registered and internally consistent', () => {
  const manifest = read('data/quiz/manifest.json');
  const path = 'data/quiz/naeringsliv/akerselva_industri_sets_merged.json';
  const quiz = read(path);
  const place = read('data/places/by/oslo/places/akerselva.json');
  const entries = manifest.sets.filter((s) => s.targetId === 'akerselva' && s.file === path);
  assert.equal(place.id, 'akerselva');
  assert.equal(quiz.targetId, place.id);
  assert.equal(quiz.sets.length, 5);
  assert.equal(entries.length, 5);
  const ids = new Set();
  for (const [index, set] of quiz.sets.entries()) {
    assert.equal(set.questions.length, 6, 'existing five-by-six contract');
    assert.ok(entries.some((entry) => entry.set_id === set.set_id && entry.order === index + 1));
    for (const q of set.questions) {
      assert.equal(q.placeId, place.id);
      assert.equal(q.targetId, place.id);
      assert.ok(!ids.has(q.id), 'duplicate question id');
      ids.add(q.id);
      assert.ok(q.question?.trim());
      assert.ok(Array.isArray(q.options) && q.options.length >= 3);
      assert.equal(q.options[q.answerIndex], q.answer);
      assert.ok(q.knowledge?.trim());
      assert.ok(Array.isArray(q.source) && q.source.some((s) => s.startsWith('https://')));
      assert.ok(q.primary_knowledge_unit_id);
      assert.ok(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id));
    }
  }
  assert.equal(ids.size, 30);
});
