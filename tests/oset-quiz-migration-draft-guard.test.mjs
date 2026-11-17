import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const draftPath='data/quiz/production_briefs/historie/frysjadammen.json';
const livePath='data/quiz/historie/frysjadammen_sets.json';
const brief=read(draftPath);
const live=read(livePath);
const manifest=read('data/quiz/manifest.json');
const questions=live.sets.flatMap(set=>set.questions);

test('staged Oset migration documents existing 42 IDs without activating a parallel quiz',()=>{
  assert.equal(brief.status,'partial');
  assert.equal(brief.proposed_questions_status,'editorial_draft_28_not_runtime');
  assert.equal(brief.categoryId,'historie');
  assert.equal(brief.targetId,'frysjadammen');
  assert.equal(live.targetId,'frysjadammen');
  assert.equal(questions.length,42);
  assert.equal(live.sets.length,6);
  const existing=manifest.sets.filter(row=>row.targetId==='frysjadammen');
  assert.equal(existing.length,6);
  assert.ok(existing.every(row=>row.file===livePath));
  const ledger=brief.existing_quiz_audit.legacy_id_knowledge_ledger;
  assert.equal(ledger.length,42);
  for(let i=0;i<42;i++){
    const a=ledger[i],q=questions[i];
    assert.equal(a.legacy_id,q.id,'quiz id '+i);
    assert.equal(a.legacy_quiz_id,q.quiz_id,'quiz runtime id '+i);
    assert.equal(a.legacy_primary_knowledge_unit_id,q.primary_knowledge_unit_id,'Knowledge id '+i);
    assert.deepEqual(a.legacy_knowledge_unit_ids,q.knowledge_unit_ids,'all Knowledge ids '+i);
  }
  assert.equal(new Set(ledger.map(x=>x.legacy_id)).size,42);
  assert.equal(new Set(ledger.map(x=>x.legacy_primary_knowledge_unit_id)).size,42);
  assert.equal(questions.filter(q=>q.knowledge_link_status==='linked').length,33);
  assert.equal(questions.filter(q=>q.knowledge_link_status==='editorial_review_required').length,9);
});

test('four-set proposal contains 28 original sourced claims, genuine choices and ordinary first 14 questions',()=>{
  assert.equal(brief.profile_decision.profile,'normal');
  assert.equal(brief.profile_decision.set_count,4);
  assert.equal(brief.profile_decision.questions_per_set,7);
  assert.equal(brief.claims.length,28);
  assert.equal(brief.proposed_questions.length,28);
  const sources=brief.sources;
  assert.ok(Object.keys(sources).length>=3);
  for(const [id,source] of Object.entries(sources)){
    assert.match(source.url,/^https:\/\//,'source '+id);
    assert.equal(source.review_status,'reviewed','source '+id);
    assert.ok(source.review_note?.length>25,'review note '+id);
  }
  const ids=new Set(),queries=new Set();
  const phase=['opening','middle','bridge','final'];
  for(let i=0;i<28;i++){
    const claim=brief.claims[i],q=brief.proposed_questions[i];
    assert.ok(!ids.has(claim.claim_id),'duplicate claim');
    ids.add(claim.claim_id);
    assert.equal(claim.order,i+1);
    assert.equal(claim.planned_phase,phase[Math.floor(i/7)]);
    assert.equal(claim.source_origin,'external');
    assert.ok(claim.source_ids.length);
    assert.equal(claim.review_status,'reviewed');
    assert.ok(claim.source_ids.every(id=>sources[id]));
    assert.equal(q.planned_set,Math.floor(i/7)+1);
    assert.equal(q.planned_question,i%7+1);
    assert.equal(q.source_claim_id,claim.claim_id);
    assert.equal(q.review_status,'draft_not_playable');
    assert.equal(q.options.length,3);
    assert.equal(new Set(q.options).size,3);
    assert.equal(q.options[q.answerIndex],q.answer);
    assert.ok(q.question.endsWith('?'));
    assert.ok(!queries.has(q.question),'duplicate question');
    queries.add(q.question);
    assert.ok(q.knowledge?.length>30);
    assert.deepEqual(q.source,claim.source_ids.map(id=>sources[id].url));
    assert.equal(q.legacy_knowledge_migration,'pending_individual_review');
    if(i<14)assert.doesNotMatch(q.question,/\b(teori|metode|History Go|quiz)\b/iu);
  }
});

test('photo and quiz production are separate: Oset live Place remains pointed to a single canonical place',()=>{
  const place=read('data/places/natur/oslo/places_oslo_natur_akerselvarute/frysjadammen.json');
  assert.equal(place.id,'frysjadammen');
  assert.match(place.name,/Oset slusebru/);
  assert.equal(place.image,'bilder/places/oset_slusebru_landscape.webp');
  assert.equal(place.frontImage,'bilder/illustrasjoner/places/oset_slusebru_front_original.svg');
  assert.equal(place.frontImageMeta.mediaType,'editorial_illustration');
});
