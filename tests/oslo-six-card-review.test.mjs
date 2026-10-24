import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixStaging } from '../scripts/build-oslo-six-quiz-handoff.mjs';
import { buildOsloSixCardReview } from '../scripts/build-oslo-six-card-review.mjs';

const rootJson = (path) => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const manifest = rootJson('data/quiz/manifest.json');
const release = rootJson('reports/place-production/oslo-six-places-integration-gates-20261022.json');

test('five remaining sites have exactly ten four-option review questions with editorial answer parity', () => {
  const original = buildOsloSixStaging();
  const pack = buildOsloSixCardReview();
  assert.equal(pack.schema, 'history_go_oslo_six_card_review_v1');
  assert.equal(pack.status, 'NON_PUBLISHING_EDITORIAL_REVIEW');
  assert.equal(pack.places.length, 5);
  assert.equal(pack.total_card_candidates, 50);
  assert.deepEqual(pack.places.map(place => place.place_id),
    original.places.filter(p => p.id !== 'linderud_gard').map(p => p.id));
  const allIds = new Set();
  for (const place of pack.places) {
    const source = original.places.find(p => p.id === place.place_id);
    assert.ok(source);
    assert.equal(place.public_release, false);
    assert.equal(place.fullquiz_profile_decision, 'not_confirmed');
    assert.equal(place.draft_cards.length, 10);
    assert.equal(place.minimum_additional_distinct_questions_for_narrow_3x7, 11);
    for (const [i, candidate] of place.draft_cards.entries()) {
      const fact = source.fact_candidates[i];
      assert.equal(candidate.question, fact.question, candidate.id);
      assert.equal(candidate.answer, fact.answer_core, candidate.id);
      assert.equal(candidate.source_trace, fact.source_trace, candidate.id);
      assert.equal(candidate.categoryId, release.places.find(p => p.place_id === place.place_id).category_candidate);
      assert.equal(candidate.targetId, place.place_id);
      assert.equal(candidate.options.length, 4, candidate.id);
      assert.equal(new Set(candidate.options.map(v => v.toLowerCase().normalize('NFKC'))).size, 4, candidate.id);
      assert.equal(candidate.options[candidate.answerIndex], candidate.answer, candidate.id);
      assert.ok(candidate.knowledge.length >= 60, candidate.id + ': explanation too short');
      assert.ok(candidate.source_bundle_urls.length >= 1, candidate.id);
      assert.ok(candidate.source_bundle_urls.every(u => u.startsWith('https://')), candidate.id);
      assert.equal(candidate.source_claim_review, 'pending_per_question_original_source_review');
      assert.equal(candidate.fullquiz_question_id, null);
      assert.equal(candidate.card_runtime_registered, false);
      assert.equal(candidate.editor_status, 'candidate_not_approved');
      assert.ok(!allIds.has(candidate.id), candidate.id);
      allIds.add(candidate.id);
    }
  }
  assert.equal(allIds.size, 50);
});

test('draft review cards cannot implicitly turn on a Place, quiz or location', () => {
  const pack = buildOsloSixCardReview();
  assert.equal(release.status, 'editorial_only_not_v1');
  assert.equal(release.safeguards.active_places, 0);
  for (const place of pack.places) {
    const gate = release.places.find(p => p.place_id === place.place_id);
    assert.ok(gate);
    assert.equal(gate.release_status, 'BLOCKED', place.place_id);
    assert.equal(gate.geographical_anchor.status, 'HOLD', place.place_id);
    assert.ok(Object.values(gate.publication_gates).every(x => x === false));
    assert.equal((manifest.sets || []).some(s => s.targetId === place.place_id),['ekebergrestauranten','frognerseteren'].includes(place.place_id));
    assert.ok(!(manifest.targets || []).some(s => s.targetId === place.place_id));
    assert.ok(!(manifest.files || []).some(f => f.includes(place.place_id)));
  }
  const industrial = pack.places.find(p => p.place_id === 'kristiania_teglverk_bryn');
  assert.match(industrial.geographical_anchor, /HOLD_address_identity_14_vs_18/);
});
