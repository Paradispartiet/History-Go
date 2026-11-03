import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const place=read("data/places/film/oslo/places/vika_kino.json"),quiz=read("data/quiz/by/vika_kino_sets.json"),card=read("data/quizcards/by/vika_kino_quizcard_v1.json"),brief=read("data/quiz/production_briefs/by/vika_kino.json");
const qm=read("data/quiz/manifest.json"),cm=read("data/quizcards/by/manifest.json"),reg=read("data/fagverk/fagverk_registry.json"),fm=read("data/fag/fag_manifest.json");
const all=quiz.sets.flatMap(s=>s.questions);
test("Vika kino: corrected date and canonical identity",()=>{
 assert.equal(place.id,"vika_kino");assert.equal(place.year,1997);assert.equal(place.category,"by");
 assert.equal(place.coordStatus,"verified");assert.equal(place.imageLicense,"CC BY-SA 4.0");
 assert.ok(place.popupDesc.includes("12. desember 1997"));
 assert.equal(place.fagverk.article.length,3);assert.equal(place.fagverk.lenses.length,3);
 for(const asset of [place.image,place.frontImage])assert.ok(existsSync(new URL("../"+asset,import.meta.url)));
 const live=read("data/runtime/place-open/vika_kino.json").place;
 assert.equal(live.year,1997);assert.equal(live.id,place.id);assert.deepEqual(live.fagverk.article,place.fagverk.article);
});
test("Vika kino: 21 sourced questions and three sets",()=>{
 assert.deepEqual(quiz.sets.map(s=>s.questions.length),[7,7,7]);
 assert.equal(new Set(all.map(q=>q.id)).size,21);
 assert.equal(brief.claims.length,21);assert.equal(qm.sets.filter(s=>s.targetId==="vika_kino").length,3);
 assert.ok(all.filter(q=>/^Når åpnet/iu.test(q.question)).length<=1);
 for(const q of all){
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert.equal(q.answer,q.options[q.answerIndex]);assert.ok(q.knowledge.length>30);
  assert.ok(q.source.every(id=>brief.sources[id]?.review_status==="reviewed"));
  assert.ok(brief.claims.some(c=>c.claim_id===q.claim_id));
  assert.equal(q.knowledge_link_status,"linked");
  assert.ok(q.primary_knowledge_unit_id&&q.knowledge_unit_ids?.length);
 }
});
test("Vika kino: QuizCard, Fagverk and category by are linked",()=>{
 assert.ok(cm.collections.includes("vika_kino_quizcard_v1.json"));
 assert.ok(fm.by.quizProduction.targets.vika_kino);assert.ok(reg.placeLinks.vika_kino);
 const cs=card.cards[0].questions;assert.equal(cs.length,10);
 for(const c of cs){
  const q=all.find(x=>x.id===c.sourceQuestionId);assert.ok(q);
  for(const k of ["question","answer","answerIndex","options","knowledge","quiz_id"])assert.deepEqual(c[k],q[k]);
  assert.equal(c.knowledge_link_status,"linked");assert.deepEqual(c.knowledge_unit_ids,q.knowledge_unit_ids);
 }
});
