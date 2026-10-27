import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const quiz=read("data/quiz/media/grand_hotel_sets.json");
const card=read("data/quizcards/media/grand_hotel_quizcard_v1.json");
const brief=read("data/quiz/production_briefs/media/grand_hotel.json");
const manifest=read("data/quiz/manifest.json");
const cardManifest=read("data/quizcards/media/manifest.json");
const fag=read("data/fag/fag_manifest.json");
const place=read("data/places/media/oslo/grand_hotel.json");
const questions=quiz.sets.flatMap(s=>s.questions);
test("Grand Hotel: 21 cited historical questions in three sets of seven",()=>{
  assert.deepEqual(quiz.sets.map(s=>s.questions.length),[7,7,7]);
  assert.deepEqual(quiz.sets.map(s=>s.phase),["opening","bridge","final"]);
  assert.equal(new Set(questions.map(q=>q.id)).size,21);
  assert.equal(questions.filter(q=>/^(I hvilket år|Når ble|Hvilket år|Hvilken dato)/iu.test(q.question)).length,0);
  assert.equal(brief.claims.length,21);
  for(const q of questions){
    assert.equal(q.targetId,"grand_hotel");
    assert.equal(q.categoryId,"media");
    assert.equal(q.options.length,4);
    assert.equal(q.options[q.answerIndex],q.answer);
    assert.ok(q.knowledge.length>65,q.id);
    assert.ok(q.source.every(id=>brief.sources[id]?.review_status==="reviewed"),q.id);
    assert.ok(q.source_urls.every(s=>s.startsWith("https://")));
    assert.ok(brief.claims.some(c=>c.claim_id===q.claim_id));
  }
});
test("Grand Hotel: 10 QuizCard entries exactly mirror source questions",()=>{
  const selected=card.cards.flatMap(c=>c.questions);
  assert.equal(selected.length,10);
  assert.equal(new Set(selected.map(q=>q.sourceQuestionId)).size,10);
  const byId=new Map(questions.map(q=>[q.id,q]));
  for(const q of selected){
    const source=byId.get(q.sourceQuestionId);
    assert.ok(source);
    for(const key of ["question","options","answer","answerIndex","knowledge","quiz_id","claim_id","emne_id","knowledge_link_status"])
      assert.deepEqual(q[key],source[key],q.sourceQuestionId+" "+key);
    if(source.knowledge_link_status==="linked"){
      assert.equal(q.primary_knowledge_unit_id,source.primary_knowledge_unit_id);
      assert.deepEqual(q.knowledge_unit_ids,source.knowledge_unit_ids);
    }
  }
});
test("Grand Hotel: active manifests and canonical Place identity",()=>{
  assert.equal(place.id,"grand_hotel");
  assert.equal(place.category,"media");
  assert.equal(place.coordStatus,"verified");
  assert.equal(place.address.number,"31");
  assert.match(place.desc,/Henrik Ibsen/);
  assert.match(place.popupDesc,/Ole Sverre/);
  assert.match(place.popupDesc,/Roald Amundsen/);
  assert.equal(place.fagverk.article.length,3);
  assert.deepEqual(manifest.sets.filter(s=>s.targetId==="grand_hotel").map(s=>s.set_id),["media_grand_hotel_set_1","media_grand_hotel_set_2","media_grand_hotel_set_3"]);
  assert.ok(cardManifest.collections.includes("grand_hotel_quizcard_v1.json"));
  assert.equal(fag.media.quizProduction.targets.grand_hotel.quiz_file,"../quiz/media/grand_hotel_sets.json");
});
test("Grand Hotel: Knowledge status is explicit and consistent",()=>{
  const linked=questions.filter(q=>q.knowledge_link_status==="linked");
  assert.ok(linked.length===0||linked.length===21);
  if(linked.length===21){
    assert.ok(linked.every(q=>q.primary_knowledge_unit_id&&q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id)));
    assert.equal(card.production_status,"knowledge_linked");
  }else{
    assert.equal(card.production_status,"pending_knowledge_link");
  }
});
