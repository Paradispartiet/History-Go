import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildOsloSixCardReview } from '../scripts/build-oslo-six-card-review.mjs';
import { buildOsloSixRemainingFullquizReview } from '../scripts/build-oslo-six-remaining-fullquiz-review.mjs';

const load = path => JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const gate = load('reports/place-production/oslo-six-places-integration-gates-20261022.json');
const manifest = load('data/quiz/manifest.json');

test('Sæterhytten and Kristiania Teglverk each have 3x7 distinct source-traced questions and exact ten-card parity', () => {
  const draft=buildOsloSixRemainingFullquizReview();
  const cards=buildOsloSixCardReview();
  assert.equal(draft.publication_status,'NOT_REGISTERED_NOT_PLAYABLE');
  assert.deepEqual(draft.places.map(p=>p.place_id),['saeterhytten_bygdoy','kristiania_teglverk_bryn']);
  for(const p of draft.places){
    assert.equal(p.status,'EDITORIAL_SOURCE_REVIEW_NOT_V1');
    assert.equal(p.sets.length,3);
    assert.equal(p.proposed_quiz_profile,'narrow_3x7_unconfirmed');
    assert.equal(p.quizcard_question_ids.length,10);
    const flattened=p.sets.flatMap((s,i)=>{
      assert.equal(s.order,i+1);
      assert.equal(s.level,i+1);
      assert.equal(s.questions.length,7);
      return s.questions;
    });
    assert.equal(flattened.length,21);
    assert.equal(new Set(flattened.map(q=>q.id)).size,21);
    assert.equal(new Set(flattened.map(q=>q.question.toLowerCase())).size,21);
    const card=cards.places.find(c=>c.place_id===p.place_id);
    const category=p.place_id==='kristiania_teglverk_bryn'?'naeringsliv':'historie';
    for(const [i,q] of flattened.entries()){
      assert.equal(q.id,p.place_id+'_review_quiz_'+String(i+1).padStart(2,'0'));
      assert.equal(q.targetId,p.place_id);
      assert.equal(q.categoryId,category);
      assert.ok(q.question.length>20,q.id);
      assert.ok(q.knowledge.length>=70,q.id);
      assert.ok(q.source_url.startsWith('https://'),q.id);
      assert.equal(q.options.length,4,q.id);
      assert.equal(new Set(q.options.map(v=>v.toLowerCase().normalize('NFKC'))).size,4,q.id);
      assert.equal(q.options[q.answerIndex],q.answer,q.id);
      assert.equal(q.runtime_registered,false,q.id);
      if(i<10){
        assert.equal(q.question,card.draft_cards[i].question,q.id);
        assert.equal(q.answer,card.draft_cards[i].answer,q.id);
        assert.equal(q.quizcard_candidate_id,card.draft_cards[i].id,q.id);
        assert.equal(p.quizcard_question_ids[i],q.id);
      }else{
        assert.equal(q.quizcard_candidate_id,null,q.id);
        assert.equal(q.source_review,'article_inspected_pending_independent_claim_signoff',q.id);
      }
    }
  }
});

test('new 3x7 review packs retain geographic and publication holds', () => {
  const draft=buildOsloSixRemainingFullquizReview();
  for(const p of draft.places){
    const release=gate.places.find(x=>x.place_id===p.place_id);
    assert.equal(release.release_status,'BLOCKED');
    assert.equal(release.geographical_anchor.status,'HOLD');
    assert.ok(Object.values(release.publication_gates).every(x=>x===false));
    assert.equal(p.canonical_place_created,false);
    assert.equal(p.quiz_manifest_registered,false);
    assert.equal(p.knowledge_synced,false);
    assert.equal(p.browser_qa_passed,false);
    assert.ok(!(manifest.sets||[]).some(s=>s.targetId===p.place_id));
  }
  assert.match(draft.places.at(-1).important_hold,/14\/18/);
});

test('Sæterhytten: royal-house 1851 and Statsbygg 1852 must not become a single factual build-year claim in visitor prose',()=>{
  const audit=load('reports/place-production/saeterhytten-bathhouse-year-review-20261023.json');
  assert.equal(audit.original_bathhouse_year.norwegian_royal_house.year,1851);
  assert.equal(audit.original_bathhouse_year.statsbygg.year,1852);
  assert.equal(audit.original_bathhouse_year.independent_resolution,false);
  assert.equal(audit.source_claim_release_approved,false);
  const editorial=readFileSync(new URL('../reports/place-production/oslo-six-places-editorial-20261022.md',import.meta.url),'utf8');
  const visitor=editorial.split('## Sæterhytten (`saeterhytten_bygdoy`)')[1].split('## Kristiania Teglverk')[0];
  const fagverk=load('reports/place-production/oslo-six-fagverk-preintegration-20261022.json')
    .places.find(p=>p.place_id==='saeterhytten_bygdoy').fagverk;
  for(const body of [visitor,...fagverk.article,...fagverk.lenses.map(x=>x.evidence),...fagverk.observable_traces.map(x=>x.interpretation_boundary)]){
    assert.doesNotMatch(body,/I 1852 ble (?:et|det) (?:flytende |kongelig )?badehus/i);
    assert.doesNotMatch(body,/urørt fra 1852/);
  }
  const pack=buildOsloSixRemainingFullquizReview().places.find(p=>p.place_id==='saeterhytten_bygdoy');
  const questions=pack.sets.flatMap(s=>s.questions);
  assert.equal(questions.length,21);
  assert.ok(questions.every(q=>!q.question.includes('1851')&&!q.question.includes('1852')));
  assert.ok(questions.some(q=>q.knowledge.includes('1862')));
  assert.ok(questions.every(q=>q.runtime_registered===false));
});

test('all 21 Sæterhytten draft questions map to page-specific Statsbygg or Oslo byleksikon claim evidence',()=>{
  const review=load('reports/place-production/saeterhytten-bathhouse-year-review-20261023.json');
  const pack=buildOsloSixRemainingFullquizReview().places.find(p=>p.place_id==='saeterhytten_bygdoy');
  const qs=pack.sets.flatMap(s=>s.questions);
  const rows=review.all_21_source_alignment;
  assert.equal(rows.length,21);
  assert.deepEqual(rows.map(x=>x.question_id),qs.map(x=>x.id));
  assert.equal(rows.filter(x=>x.source_url==='https://oslobyleksikon.no/side/S%C3%A6terhytten').length,3);
  assert.equal(rows.filter(x=>x.source_url.endsWith('/bygning_3710_seterhytten.pdf')).length,18);
  for(let i=0;i<qs.length;i++){
    const q=qs[i],claim=rows[i];
    assert.equal(q.source_url,claim.source_url,q.id);
    assert.ok(claim.source_text_anchor.length>=20,q.id);
    assert.equal(claim.independent_editorial_signoff,false,q.id);
    assert.equal(claim.review_status,'ORIGINAL_TEXT_MATCHED_NOT_INDEPENDENTLY_APPROVED');
    assert.equal(q.runtime_registered,false);
    if(claim.source_url.endsWith('.pdf'))assert.equal(claim.source_page,1);
  }
  assert.equal(review.all_21_source_review_summary.source_fulltext_read,true);
  assert.equal(review.all_21_source_review_summary.independent_editorial_signoff_complete,false);
  assert.equal(review.all_21_source_review_summary.no_runtime_registration,true);
});
