import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixFullquizReview } from '../scripts/build-oslo-six-fullquiz-review.mjs';
import { buildOsloSixIntegrationPreview } from '../scripts/build-oslo-six-integration-preview.mjs';

const audit = JSON.parse(readFileSync(new URL('../reports/place-production/frognerseteren-building-quiz-source-audit-20261022.json', import.meta.url), 'utf8'));
const OPERATOR = 'https://www.frognerseteren.no/mer-historie-';
test('eleven new Frognerseteren restaurant-only questions match primary-source claim review index', () => {
  const pack = buildOsloSixFullquizReview();
  const place = pack.places.find(p => p.place_id === 'frognerseteren');
  assert.ok(place);
  const questions = place.sets.flatMap(s => s.questions);
  assert.equal(questions.length, 21);
  const additions = questions.slice(10);
  assert.equal(audit.rows.length, 11);
  assert.deepEqual(additions.map(q => q.id), audit.rows.map(r => r.question_id));
  assert.equal(new Set(audit.rows.map(r => r.claim_topic)).size, 11);
  assert.equal(audit.source.url, OPERATOR);
  assert.equal(audit.source.source_type, 'operator_first_party_history');
  assert.match(audit.chronology_caveat, /1909–10/);
  for (const [index, q] of additions.entries()) {
    const r = audit.rows[index];
    assert.equal(q.source_url, OPERATOR, q.id);
    assert.match(q.external_claim_review, /pending/);
    assert.match(q.source_trace, /Restaurantens/);
    assert.equal(r.editorial_source_read, 'matched_primary_source');
    assert.equal(r.independent_claim_signoff, false);
    assert.equal(r.release_ready, false);
    assert.ok(r.evidence_section.length > 20);
    assert.ok(Number.isInteger(r.display_line_hint));
    assert.equal(q.options.length, 4);
    assert.equal(q.options[q.answerIndex], q.answer);
    assert.doesNotMatch(q.question, /Heftyevillaen|Skimuseet|Sportshall|T-banestasjon/i,
      'extra question wrongly targets another building');
  }
  assert.equal(audit.runtime_publication_status, 'NOT_REGISTERED');
});

test('restaurant extras have no adjacent-building hold; two contextual core questions stay blocked', () => {
  const preview = buildOsloSixIntegrationPreview();
  const p = preview.places.find(p => p.place_id === 'frognerseteren');
  const held = p.fullquiz_preview.filter(q => q.adjacent_building_scope_hold).map(q => q.id);
  assert.deepEqual(held, audit.quizcard_context_decisions.map(x => x.question_id));
  assert.deepEqual(audit.quizcard_context_decisions.map(x => x.decision), ['CONTEXT_HOLD', 'CONTEXT_HOLD']);
  assert.ok(p.fullquiz_preview.slice(10).every(q => !q.adjacent_building_scope_hold && q.source_urls.includes(OPERATOR)));
  assert.equal(preview.publication_status, 'BLOCKED_PREVIEW_ONLY_NO_RUNTIME_WRITES');
});
