import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=file=>JSON.parse(readFileSync(new URL("../"+file,import.meta.url),"utf8"));
const quiz=read("data/quiz/historie/villa_grande_sets.json");
const card=read("data/quizcards/historie/villa_grande_quizcard_v1.json");
const brief=read("data/quiz/production_briefs/historie/villa_grande.json");
const place=read("data/places/historie/oslo/places_historie/villa_grande.json");
const manifest=read("data/quiz/manifest.json");
const q=quiz.sets.flatMap(s=>s.questions);
test("Villa Grande: 21 sourced fullquiz questions in three distinct sets",()=>{
 assert.deepEqual(quiz.sets.map(s=>s.questions.length),[7,7,7]);
 assert.equal(new Set(q.map(v=>v.id)).size,21);
 assert.equal(q.filter(v=>/hvilket år|når ble|hvilken dato/i.test(v.question)).length,0);
 assert.deepEqual(q.slice(0,3).map(v=>v.id),["villa_grande_quiz_1","villa_grande_quiz_2","villa_grande_quiz_3"]);
 for(const v of q){
  assert.equal(v.options.length,4);
  assert.equal(v.options[v.answerIndex],v.answer);
  assert.ok(v.explanation.length>40);
  assert.ok(brief.claims.some(c=>c.claim_id===v.claim_id&&c.statement===v.knowledge));
  assert.ok(v.source_urls.every(s=>s.startsWith("https://")));
 }
 assert.equal(manifest.sets.filter(v=>v.targetId==="villa_grande").length,3);
});
test("Villa Grande: 10 QuizCard questions are verbatim from fullquiz",()=>{
 const index=new Map(q.map(v=>[v.id,v]));
 const cards=card.cards[0].questions;
 assert.equal(cards.length,10);
 assert.equal(new Set(cards.map(v=>v.sourceQuestionId)).size,10);
 for(const v of cards){
 const base=index.get(v.sourceQuestionId);
 assert.ok(base);
 for(const key of ["question","options","answer","answerIndex","knowledge","quiz_id"])assert.deepEqual(v[key],base[key]);
 }
});
test("Villa Grande: images and place location kept, Fagverk ready",()=>{
 assert.equal(place.id,"villa_grande");
 assert.equal(place.coordStatus,"verified");
 assert.equal(place.imageLicense,"CC BY-SA 3.0");
 assert.equal(place.fagverk?.article?.length,3);
 assert.equal(place.fagverk?.lenses?.length,3);
 assert.ok(place.fagverk?.source_urls?.some(url=>url.includes("lovdata.no")));
});

test("Villa Grande: canonical Knowledge IDs, QuizCard links and runtime Place-open are synchronized",()=>{
 const live=read("data/runtime/place-open/villa_grande.json").place;
 assert.equal(live.id,place.id);
 assert.equal(live.image,place.image);
 assert.equal(live.frontImage,place.frontImage);
 for(const item of q){
  assert.equal(item.knowledge_link_status,"linked");
  assert.ok(item.primary_knowledge_unit_id);
  assert.ok(item.knowledge_unit_ids?.includes(item.primary_knowledge_unit_id));
 }
 const byId=new Map(q.map(x=>[x.id,x]));
 for(const item of card.cards[0].questions){
  const source=byId.get(item.sourceQuestionId);
  assert.equal(item.primary_knowledge_unit_id,source.primary_knowledge_unit_id);
  assert.deepEqual(item.knowledge_unit_ids,source.knowledge_unit_ids);
 }
});
