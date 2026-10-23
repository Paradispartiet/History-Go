import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixCardReview } from '../scripts/build-oslo-six-card-review.mjs';
import { buildOsloSixFullquizReview } from '../scripts/build-oslo-six-fullquiz-review.mjs';

const gate = JSON.parse(readFileSync(new URL('../reports/place-production/oslo-six-places-integration-gates-20261022.json', import.meta.url)));
const manifest = JSON.parse(readFileSync(new URL('../data/quiz/manifest.json', import.meta.url)));

test('three place-specific fullquiz proposals meet 3x7, answer, source and exact first-ten QuizCard parity', () => {
  const pack = buildOsloSixFullquizReview();
  const cards = buildOsloSixCardReview();
  const ids = ['ekebergrestauranten', 'frognerseteren', 'sarabraten'];
  assert.equal(pack.publication_status, 'NOT_REGISTERED_NOT_PLAYABLE');
  assert.deepEqual(pack.places.map(p => p.place_id), ids);
  for (const place of pack.places) {
    assert.equal(place.status, 'SOURCE_REVIEW_CANDIDATE_ONLY');
    assert.equal(place.proposed_quiz_profile, 'narrow_3x7_not_confirmed');
    assert.equal(place.sets.length, 3);
    assert.equal(place.quizcard_question_ids.length, 10);
    const questionIds = new Set();
    const questionTexts = new Set();
    const questions = place.sets.flatMap((set, i) => {
      assert.equal(set.order, i + 1);
      assert.equal(set.level, i + 1);
      assert.equal(set.questions.length, 7);
      return set.questions;
    });
    assert.equal(questions.length, 21);
    for (const [i, q] of questions.entries()) {
      assert.equal(q.id, place.place_id + '_review_quiz_' + String(i + 1).padStart(2, '0'));
      assert.equal(q.targetId, place.place_id);
      assert.equal(q.categoryId, gate.places.find(p => p.place_id === place.place_id).category_candidate);
      assert.equal(q.runtime_registered, false);
      const individualSarabratenSources = {
        15: 'https://www.skiforeningen.no/utimarka/omrader/ostmarka/steder/sarabraten/',
        20: 'https://oslobyleksikon.no/side/N%C3%B8klevann'
      };
      const individualSource = place.place_id === 'sarabraten' ? individualSarabratenSources[i] : null;
      assert.equal(q.source_url, individualSource || (place.place_id === 'frognerseteren' && (i >= 10 || i === 2 || i === 4)
        ? 'https://www.frognerseteren.no/mer-historie-' : place.source_url));
      assert.ok(q.source_url.startsWith('https://'));
      assert.ok(q.knowledge.length > 65, q.id);
      assert.equal(q.options.length, 4);
      assert.equal(new Set(q.options.map(s => s.trim().toLowerCase())).size, 4);
      assert.equal(q.options[q.answerIndex], q.answer);
      assert.ok(!questionIds.has(q.id)); questionIds.add(q.id);
      assert.ok(!questionTexts.has(q.question)); questionTexts.add(q.question);
    }
    const card = cards.places.find(x => x.place_id === place.place_id);
    for (let i = 0; i < 10; i++) {
      assert.equal(questions[i].question, card.draft_cards[i].question, questions[i].id);
      assert.equal(questions[i].answer, card.draft_cards[i].answer, questions[i].id);
      assert.equal(questions[i].quizcard_candidate_id, card.draft_cards[i].id);
      assert.equal(place.quizcard_question_ids[i], questions[i].id);
    }
  }
});

test('three fullquiz proposals do not bypass source and geographic release gates', () => {
  const pack = buildOsloSixFullquizReview();
  for (const place of pack.places) {
    const hold = gate.places.find(p => p.place_id === place.place_id);
    assert.ok(hold);
    assert.equal(hold.release_status, 'BLOCKED');
    assert.equal(hold.geographical_anchor.status, 'HOLD');
    assert.ok(Object.values(hold.publication_gates).every(x => x === false));
    assert.equal(place.canonical_place_created, false);
    assert.equal(place.quiz_manifest_registered, false);
    assert.equal(place.knowledge_synced, false);
    assert.equal(place.browser_qa_passed, false);
    assert.equal((manifest.sets || []).some(s => s.targetId === place.place_id),['ekebergrestauranten','frognerseteren'].includes(place.place_id));
  }
  assert.match(pack.places.find(p => p.place_id === 'frognerseteren').learning_scope_notice, /Holmenkollveien 200/);
});
