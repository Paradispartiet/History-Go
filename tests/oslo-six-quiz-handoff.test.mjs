import assert from 'node:assert/strict';
import test from 'node:test';
import { buildOsloSixStaging, STEDER } from '../scripts/build-oslo-six-quiz-handoff.mjs';

test('sekssteders redaksjonelle quiz-handoff er intakt, men ikke publisert', () => {
  const pack = buildOsloSixStaging();
  assert.equal(pack.publication_status, 'NOT_PUBLISHED');
  assert.equal(pack.places.length, 6);
  assert.equal(new Set(pack.places.map((p) => p.id)).size, 6);
  assert.deepEqual(pack.places.map((p) => p.id), STEDER.map(([id]) => id));
  assert.equal(pack.source_claim_count_linderud, 35);
  assert.equal(pack.count_fact_candidates, 60);
  assert.equal(pack.count_alternative_drafts, 50);
  for (const place of pack.places) {
    assert.equal(place.fact_candidates.length, 10);
    assert.equal(place.four_option_drafts.length, place.id === 'linderud_gard' ? 0 : 10);
    assert.equal(place.canonical_place_ready, false);
    assert.equal(place.full_quiz_ready, false);
    assert.equal(place.quizcard_ready, false);
    assert.equal(place.fagverk_ready, false);
    assert.equal(place.photo_ready, false);
    assert.equal(place.browser_qa_ready, false);
    for (const q of place.four_option_drafts) assert.equal(q.distractors.length, 3);
  }
  assert.equal(pack.places.at(-1).pin_status, 'HOLD_address_identity_14_vs_18');
});
