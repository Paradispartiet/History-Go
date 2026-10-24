import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixIntegrationPreview } from '../scripts/build-oslo-six-integration-preview.mjs';

const load = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));
const clone = value => JSON.parse(JSON.stringify(value));

test('six-place read-only integration preview has 133 unique fullquiz candidates and exact 60 QuizCard mirrors', () => {
  const result = buildOsloSixIntegrationPreview();
  assert.equal(result.schema, 'history_go_oslo_six_integration_preview_v1');
  assert.equal(result.publication_status, 'BLOCKED_PREVIEW_ONLY_NO_RUNTIME_WRITES');
  assert.equal(result.place_count, 6);
  assert.equal(result.fullquiz_candidate_count, 133);
  assert.equal(result.quizcard_candidate_count, 60);
  assert.equal(result.fagverk_candidate_count, 6);
  assert.deepEqual(result.places.map(p => p.place_id), [
    'linderud_gard', 'ekebergrestauranten', 'frognerseteren', 'sarabraten',
    'saeterhytten_bygdoy', 'kristiania_teglverk_bryn'
  ]);
  const questionIds = new Set();
  for (const p of result.places) {
    const expected = p.place_id === 'linderud_gard' ? 28 : 21;
    assert.equal(p.fullquiz_preview.length, expected, p.place_id);
    assert.equal(p.quizcard_preview.length, 10, p.place_id);
    assert.equal(p.v1_status, 'BLOCKED');
    assert.equal(p.public_release, false);
    assert.equal(p.canonical_place_registered, false);
    assert.equal(p.fagverk_registered, false);
    assert.equal(p.knowledge_synced, false);
    assert.equal(p.images_integrated, false);
    assert.equal(p.browser_qa_passed, false);
    assert.equal(p.fagverk_preview.schema, 'history_go_place_fagverk_v2');
    assert.ok(p.fagverk_preview.article.length >= 3, p.place_id);
    const byId = new Map(p.fullquiz_preview.map(q => [q.id, q]));
    for (const q of p.fullquiz_preview) {
      assert.equal(questionIds.has(q.id), false, q.id);
      questionIds.add(q.id);
      assert.equal(q.targetId, p.place_id);
      assert.equal(q.categoryId, p.categoryId);
      assert.equal(q.options[q.answerIndex], q.answer);
      assert.equal(q.options.length, 4);
      assert.equal(q.needs_independent_claim_review, true);
      assert.equal(q.runtime_registered, false);
      assert.ok(q.source_urls.length > 0);
    }
    for (const card of p.quizcard_preview) {
      const q = byId.get(card.sourceQuestionId);
      assert.ok(q, p.place_id + ': orphan QuizCard');
      for (const key of ['question', 'answer', 'answerIndex', 'knowledge', 'options', 'source_urls'])
        assert.deepEqual(card[key], q[key], p.place_id + ': mismatch in ' + key);
      assert.equal(card.runtime_registered, false);
    }
  }
  assert.equal(questionIds.size, 133);
  const frognerseteren = result.places.find(p => p.place_id === 'frognerseteren');
  assert.deepEqual(frognerseteren.fullquiz_preview.filter(q => q.adjacent_building_scope_hold).map(q => q.id), []);
  for (const id of ['frognerseteren_review_quiz_03', 'frognerseteren_review_quiz_05']) {
    assert.ok(frognerseteren.fullquiz_preview.find(q => q.id === id)?.source_urls.includes('https://www.frognerseteren.no/mer-historie-'));
  }
  assert.ok(frognerseteren.fullquiz_preview.slice(10).every(q =>
    q.source_urls.includes('https://www.frognerseteren.no/mer-historie-') && !q.adjacent_building_scope_hold));
  assert.equal(result.places.at(-1).geo_status, 'HARD_HOLD');
});

test('source, coordinate, Fagverk and publication gates all fail closed under tampering', () => {
  const gates = load('reports/place-production/oslo-six-places-integration-gates-20261022.json');
  const geo = load('reports/place-production/oslo-six-geo-entrance-source-audit-20261022.json');
  const fagverk = load('reports/place-production/oslo-six-fagverk-preintegration-20261022.json');
  const linderud = load('reports/place-production/linderud-gard-quiz-preintegration-20261022.json');

  const opened = clone(gates);
  opened.places[0].publication_gates.canonical_place = true;
  assert.throws(() => buildOsloSixIntegrationPreview({ gates: opened }), /publication or geographic hold/);

  const geoPin = clone(geo);
  geoPin.places[0].coordinate = { lat: 59.94, lon: 10.82 };
  assert.throws(() => buildOsloSixIntegrationPreview({ geo: geoPin }), /coordinate and access/);

  const addressPretend = clone(geo);
  addressPretend.places.at(-1).address_source_status = 'official_confirmed';
  assert.throws(() => buildOsloSixIntegrationPreview({ geo: addressPretend }), /address 14\/18/);

  const stagedPage = clone(fagverk);
  stagedPage.places[0].fagverk_registry_registered = true;
  assert.throws(() => buildOsloSixIntegrationPreview({ fagverk: stagedPage }), /staged Fagverk/);

  const prematureClaim = clone(linderud);
  prematureClaim.sets[0].questions[0].review_status = 'reviewed';
  assert.throws(() => buildOsloSixIntegrationPreview({ linderud: prematureClaim }), /unverified source question/);

  const invalidAnswer = clone(linderud);
  invalidAnswer.sets[0].questions[0].answerIndex = 0;
  assert.throws(() => buildOsloSixIntegrationPreview({ linderud: invalidAnswer }), /invalid or prematurely active question/);
});
