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

test('restaurant QuizCard and extras all target the correct building with operator sources, but remain unregistered', () => {
  const preview = buildOsloSixIntegrationPreview();
  const p = preview.places.find(p => p.place_id === 'frognerseteren');
  const held = p.fullquiz_preview.filter(q => q.adjacent_building_scope_hold).map(q => q.id);
  assert.deepEqual(held, []);
  assert.deepEqual(audit.quizcard_context_decisions, []);
  assert.deepEqual(audit.quizcard_operator_source_facts.map(r => r.question_id), [
    'frognerseteren_review_quiz_03', 'frognerseteren_review_quiz_05'
  ]);
  for (const row of audit.quizcard_operator_source_facts) {
    const q = p.fullquiz_preview.find(question => question.id === row.question_id);
    assert.ok(q);
    assert.ok(q.source_urls.includes(OPERATOR));
    assert.ok(p.quizcard_preview.some(card => card.sourceQuestionId === row.question_id));
    assert.equal(row.independent_claim_signoff, false);
    assert.equal(row.release_ready, false);
  }
  assert.ok(p.fullquiz_preview.slice(10).every(q => !q.adjacent_building_scope_hold && q.source_urls.includes(OPERATOR)));
  assert.equal(preview.publication_status, 'BLOCKED_PREVIEW_ONLY_NO_RUNTIME_WRITES');
});

test('Frognerseteren 1864/1865 purchase discrepancy is source-attributed without false exact-date quiz premise',()=>{
  const shortQuiz=buildOsloSixFullquizReview().places.find(p=>p.place_id==='frognerseteren').sets.flatMap(s=>s.questions);
  const target=shortQuiz[1];
  assert.match(target.question,/1860-tallet/);
  assert.doesNotMatch(target.question,/1864|1865/);
  assert.match(target.knowledge,/1864/);
  assert.match(target.knowledge,/1865/);
  const caveat=audit.ownership_chronology_caveat;
  assert.equal(caveat.date_reported_by_oslo_byleksikon,1864);
  assert.equal(caveat.date_reported_by_restaurant_operator,1865);
  assert.equal(caveat.independent_editorial_resolution,false);
  const editorial=readFileSync(new URL('../reports/place-production/oslo-six-places-editorial-20261022.md',import.meta.url),'utf8')
    .split('## Frognerseteren (`frognerseteren`)')[1].split('## Sarabråten')[0];
  const article=JSON.parse(readFileSync(new URL('../reports/place-production/oslo-six-fagverk-preintegration-20261022.json',import.meta.url),'utf8'))
    .places.find(p=>p.place_id==='frognerseteren').fagverk;
  for(const publicText of [editorial,...article.article,...article.lenses.map(x=>x.evidence)])
    assert.doesNotMatch(publicText,/Heftye kjøpte (?:eiendommen|Frognerseteren|området) i 1864/);
  assert.equal(target.runtime_registered,false);
});

test('all 21 Frognerseteren quiz claims have source owners and source-date caveats without runtime approval',()=>{
  const qs=buildOsloSixFullquizReview().places.find(p=>p.place_id==='frognerseteren').sets.flatMap(s=>s.questions);
  const mapped=audit.all_21_question_source_alignment;
  assert.equal(mapped.length,21);
  assert.deepEqual(mapped.map(x=>x.question_id),qs.map(x=>x.id));
  assert.deepEqual(mapped.slice(10).map(x=>x.question_id),audit.rows.map(x=>x.question_id));
  assert.equal(mapped.filter(x=>x.primary_source===OPERATOR).length,13);
  assert.equal(mapped.filter(x=>x.primary_source==='https://oslobyleksikon.no/side/Frognerseteren').length,8);
  for(let i=0;i<mapped.length;i++){
    const evidence=mapped[i],quiz=qs[i];
    assert.equal(evidence.primary_source,quiz.source_url,evidence.question_id);
    assert.equal(evidence.status,'SOURCE_TEXT_MATCHED_CANDIDATE_ONLY');
    assert.equal(evidence.independently_approved,false);
    assert.ok(evidence.source_text_anchor.length>15);
    assert.ok(evidence.claim_topic.length>12);
    assert.equal(quiz.runtime_registered,false);
  }
  assert.equal(audit.all_21_review_summary.question_count,21);
  assert.equal(audit.all_21_review_summary.source_approval_for_runtime,false);
  assert.equal(audit.ownership_chronology_caveat.independent_editorial_resolution,false);
  assert.match(audit.all_21_review_summary.safe_player_question_policy,/decade/);
});
