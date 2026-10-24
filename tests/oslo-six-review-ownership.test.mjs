import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixCardReview } from '../scripts/build-oslo-six-card-review.mjs';
import { buildOsloSixFullquizReview } from '../scripts/build-oslo-six-fullquiz-review.mjs';
import { buildOsloSixRemainingFullquizReview } from '../scripts/build-oslo-six-remaining-fullquiz-review.mjs';

const readJson = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));

test('one and only one quiz-review owner per Oslo six-place identity', () => {
  const linderud = readJson('reports/place-production/linderud-gard-quiz-preintegration-20261022.json');
  const first = buildOsloSixFullquizReview();
  const remaining = buildOsloSixRemainingFullquizReview();
  const cards = buildOsloSixCardReview();
  const gate = readJson('reports/place-production/oslo-six-places-integration-gates-20261022.json');

  const all = [
    { id: linderud.place_id, count: linderud.sets.flatMap(s => s.questions).length, cards: linderud.quizcard_selection },
    ...first.places.map(p => ({ id: p.place_id, count: p.sets.flatMap(s => s.questions).length, cards: p.quizcard_question_ids })),
    ...remaining.places.map(p => ({ id: p.place_id, count: p.sets.flatMap(s => s.questions).length, cards: p.quizcard_question_ids }))
  ];
  assert.deepEqual(first.places.map(p => p.place_id), ['ekebergrestauranten','frognerseteren','sarabraten']);
  assert.deepEqual(remaining.places.map(p => p.place_id), ['saeterhytten_bygdoy','kristiania_teglverk_bryn']);
  assert.equal(all.length, 6);
  assert.equal(new Set(all.map(x => x.id)).size, 6, 'duplicate review owners would create two competing fullquizzes');
  assert.deepEqual(new Set(all.map(x => x.id)), new Set(gate.places.map(x => x.place_id)));
  assert.equal(all.reduce((n, p) => n + p.count, 0), 133);
  assert.equal(all.reduce((n, p) => n + p.cards.length, 0), 60);
  assert.equal(cards.places.length, 5);
  assert.equal(cards.total_card_candidates, 50);
  assert.equal(gate.safeguards.active_places, 0);
  assert.equal(gate.safeguards.v1_certified, 0);
  for (const p of all) {
    const release = gate.places.find(x => x.place_id === p.id);
    assert.ok(release && release.release_status === 'BLOCKED', p.id);
    assert.ok(Object.values(release.publication_gates).every(x => x === false), p.id);
  }
  assert.equal(linderud.status, 'STAGING_ONLY_NOT_REGISTERED_OR_PLAYABLE');
  assert.equal(first.publication_status, 'NOT_REGISTERED_NOT_PLAYABLE');
  assert.equal(remaining.publication_status, 'NOT_REGISTERED_NOT_PLAYABLE');
});
