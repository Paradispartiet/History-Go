import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const place=read("data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_05/villa_furulund.json");
const quiz=read("data/quiz/kunst/villa_furulund_sets.json");
const card=read("data/quizcards/kunst/villa_furulund_quizcard_v1.json");
const brief=read("data/quiz/production_briefs/kunst/villa_furulund.json");
const manifest=read("data/quiz/manifest.json");
const cardManifest=read("data/quizcards/kunst/manifest.json");
const fq=quiz.sets.flatMap(s=>s.questions);
test("Villa Furulund: 21 reviewed art questions in three sets of seven",()=>{
 assert.equal(place.id,"villa_furulund");assert.equal(place.category,"kunst");
 assert.equal(quiz.categoryId,"kunst");assert.deepEqual(quiz.sets.map(s=>s.questions.length),[7,7,7]);
 assert.equal(fq.length,21);assert.equal(new Set(fq.map(q=>q.id)).size,21);
 assert.equal(new Set(fq.map(q=>q.quiz_id)).size,21);
 assert.equal(brief.claims.length,21);
 for(const q of fq){
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert.equal(q.options[q.answerIndex],q.answer);
  assert.ok(q.knowledge.length>40);assert.ok(brief.claims.some(c=>c.claim_id===q.claim_id));
  assert.ok(q.source.length>0&&q.source.every(s=>brief.sources[s]?.review_status==="reviewed"));
  assert.ok(q.source_urls.every(u=>u.startsWith("https://")));
 }
 assert.equal(fq.filter(q=>/^(I hvilket år|Hvilken dato|Når ble)/iu.test(q.question)).length,0);
 assert.equal(manifest.sets.filter(s=>s.targetId==="villa_furulund").length,3);
});
test("Villa Furulund: ten exact quizcard questions and canonical Knowledge",()=>{
 assert.equal(card.cards.length,1);const items=card.cards[0].questions;
 assert.equal(items.length,10);assert.equal(new Set(items.map(q=>q.id)).size,10);
 for(const q of items){
  const original=fq.find(x=>x.id===q.sourceQuestionId);assert.ok(original);
  for(const key of ["question","answer","answerIndex","options","knowledge","quiz_id"])assert.deepEqual(q[key],original[key]);
  assert.ok(q.primary_knowledge_unit_id&&q.knowledge_unit_ids?.length,q.id);
  assert.equal(q.knowledge_link_status,"linked");
 }
 assert.equal(fq.filter(q=>q.knowledge_link_status==="linked"&&q.primary_knowledge_unit_id&&q.knowledge_unit_ids?.length).length,21);
 assert.ok(cardManifest.collections.includes("villa_furulund_quizcard_v1.json"));
});
test("Villa Furulund: source-supported Fagverk, preserved photo license, current Place-open",()=>{
 assert.equal(place.coordStatus,"verified");
 assert.equal(place.fagverk?.article?.length,3);assert.equal(place.fagverk?.lenses?.length,3);
 assert.ok(place.fagverk.source_urls.some(u=>u.includes("oslo.kommune.no")));
 assert.equal(place.imageLicense,"CC BY-SA 4.0");
 assert.equal(place.imageMeta?.license,"CC BY-SA 4.0");
 for(const asset of [place.image,place.frontImage])assert.ok(existsSync(new URL("../"+asset,import.meta.url)),asset);
 const runtime=read("data/runtime/place-open/villa_furulund.json").place;
 assert.equal(runtime.id,place.id);assert.equal(runtime.image,place.image);
 assert.equal(runtime.frontImage,place.frontImage);
 assert.deepEqual(runtime.fagverk?.article,place.fagverk.article);
});
