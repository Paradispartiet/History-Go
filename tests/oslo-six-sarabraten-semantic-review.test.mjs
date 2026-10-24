import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixFullquizReview } from '../scripts/build-oslo-six-fullquiz-review.mjs';
import { buildOsloSixCardReview } from '../scripts/build-oslo-six-card-review.mjs';

const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));

test('Sarabråten does not repeat wheelboat Sara or quiz disputed ski-race year as unambiguous fact',()=>{
  const q=buildOsloSixFullquizReview().places.find(p=>p.place_id==='sarabraten')
    .sets.flatMap(x=>x.questions);
  const audit=read('reports/place-production/sarabraten-quiz-semantic-uncertainty-review-20261023.json');
  assert.equal(q.length,21);
  assert.equal(audit.status,'TWO_REWRITTEN_CANDIDATES_NOT_PUBLISHED');
  const source=new Map(audit.changes.map(x=>[x.question_id,x]));
  assert.equal(source.size,2);
  for(const id of ['sarabraten_review_quiz_16','sarabraten_review_quiz_21']){
    const question=q.find(x=>x.id===id),evidence=source.get(id);
    assert.ok(question && evidence);
    assert.equal(question.question,evidence.new_question);
    assert.equal(question.answer,evidence.correct_answer);
    assert.equal(question.source_url,evidence.primary_url);
    assert.equal(question.runtime_registered,false);
    assert.ok(question.knowledge.length>50);
    assert.equal(question.options[question.answerIndex],question.answer);
  }
  assert.ok(q.some(x=>x.answer==='Sara'));
  assert.equal(q.filter(x=>x.answer==='Sara').length,1);
  assert.ok(q.every(x=>!x.question.includes('tidsrom ble Sarabråtrennet')));
  assert.ok(q.every(x=>!x.answer.includes('1902–1928')));
  assert.deepEqual(new Set(audit.disputed_sarabraten_ski_race_start.map(x=>x.reported_start)),new Set([1900,1902]));
  assert.ok(Object.values(audit.release_hold).every(x=>x===false));
});

test('Sarabråten source map covers all 21 draft questions and disputed opening year cannot leak to visitor prose',()=>{
  const review=read('reports/place-production/sarabraten-21-question-source-review-20261023.json');
  const quiz=buildOsloSixFullquizReview().places.find(p=>p.place_id==='sarabraten').sets.flatMap(s=>s.questions);
  const card=buildOsloSixCardReview().places.find(p=>p.place_id==='sarabraten');
  const editorial=readFileSync(new URL('../reports/place-production/oslo-six-places-editorial-20261022.md',import.meta.url),'utf8');
  const sarabraten=editorial.split('## Sarabråten (`sarabraten`)')[1].split('## Sæterhytten')[0];
  const fagverk=read('reports/place-production/oslo-six-fagverk-preintegration-20261022.json');
  const article=fagverk.places.find(p=>p.place_id==='sarabraten').fagverk;
  assert.equal(review.place_id,'sarabraten');
  assert.equal(review.reviewed_claims.length,21);
  assert.deepEqual(review.reviewed_claims.map(x=>x.question_id),quiz.map(x=>x.id));
  assert.deepEqual(review.disputed_opening_years,[1900,1902]);
  for(let i=0;i<21;i++){
    const claim=review.reviewed_claims[i],q=quiz[i];
    assert.equal(claim.source_url,q.source_url);
    assert.ok(claim.claim_topic.length>7);
    assert.ok(claim.source_text_anchor.length>7);
    assert.equal(claim.independent_editorial_signoff,false);
    assert.equal(claim.status,'SOURCE_TEXT_MATCHED_CANDIDATE_ONLY');
    assert.equal(q.runtime_registered,false);
  }
  assert.equal(review.all_claims_independently_approved,false);
  assert.equal(review.publication_ready,false);
  assert.equal(review.geo_approved,false);
  assert.equal(review.runtime_registered,false);
  assert.match(card.draft_cards[7].knowledge,/1900 eller 1902/);
  assert.doesNotMatch(card.draft_cards[7].knowledge,/fra 1902 til 1928/);
  for(const visitorText of [sarabraten,...article.article,...article.lenses.map(x=>x.evidence)]){
    assert.doesNotMatch(visitorText,/Sarabråtrennet(?:, holdt)? fra 1902 til 1928/i);
    assert.doesNotMatch(visitorText,/Sarabråtrennet fra 1900 til 1928/i);
  }
});
