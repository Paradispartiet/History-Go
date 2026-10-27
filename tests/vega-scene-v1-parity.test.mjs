import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const p=read("data/places/scenekunst/oslo/vega_scene/vega_scene.json"),q=read("data/quiz/scenekunst/vega_scene_sets.json"),c=read("data/quizcards/scenekunst/vega_scene_quizcard_v1.json"),b=read("data/quiz/production_briefs/scenekunst/vega_scene.json");
const fm=read("data/fag/fag_manifest.json"), qm=read("data/quiz/manifest.json"),cm=read("data/quizcards/scenekunst/manifest.json"),reg=read("data/fagverk/fagverk_registry.json"),questions=q.sets.flatMap(x=>x.questions);
test("Vega Scene: canonical identity, three sets of seven and sourced answers",()=>{
 assert.equal(p.id,"vega_scene");assert.equal(p.category,"scenekunst");assert.equal(p.coordStatus,"verified");
 assert.deepEqual(q.sets.map(s=>s.questions.length),[7,7,7]);assert.equal(new Set(questions.map(q=>q.id)).size,21);
 assert.equal(b.claims.length,21);assert.equal(qm.sets.filter(s=>s.targetId===p.id).length,3);assert.deepEqual(qm.sets.filter(s=>s.targetId===p.id).map(s=>s.set_id).sort(),q.sets.map(s=>s.set_id).sort());assert.ok(fm.scenekunst.quizProduction.targets.vega_scene.source_brief.includes("/scenekunst/"));
 assert.equal(questions.filter(q=>/^(I hvilket år|Hvilken dato|Når ble)/iu.test(q.question)).length,0);
 for(const q of questions){
  assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert.equal(q.options[q.answerIndex],q.answer);assert.ok(q.knowledge.length>35);
  assert.ok(q.source.every(s=>b.sources[s]?.review_status==="reviewed"));
  assert.ok(b.claims.some(s=>s.claim_id===q.claim_id));
  assert.equal(q.knowledge_link_status,"linked");
  assert.ok(q.primary_knowledge_unit_id&&q.knowledge_unit_ids?.length);
 }
});
test("Vega Scene: QuizCard uses exact ten linked source questions",()=>{
 assert.ok(cm.collections.includes("vega_scene_quizcard_v1.json"));
 const cs=c.cards[0].questions;assert.equal(cs.length,10);
 for(const item of cs){const original=questions.find(q=>q.id===item.sourceQuestionId);assert.ok(original);
  for(const f of ["question","options","answer","answerIndex","quiz_id","knowledge"])assert.deepEqual(item[f],original[f]);
  assert.equal(item.knowledge_link_status,"linked");assert.deepEqual(item.knowledge_unit_ids,original.knowledge_unit_ids);
 }
});
test("Vega Scene: Fagverk, historical photograph label and generated Place-open",()=>{
 assert.equal(p.fagverk.article.length,3);assert.equal(p.fagverk.lenses.length,3);
 assert.ok(/2025/.test(p.imageCaption));assert.ok(/røde fasade/i.test(p.imageCaption));
 assert.equal(p.imageLicense,"CC BY-SA 4.0");
 for(const f of [p.image,p.frontImage])assert.ok(existsSync(new URL("../"+f,import.meta.url)));
 assert.ok(fm.scenekunst.quizProduction.targets.vega_scene);
 assert.ok(reg.placeLinks.vega_scene);
 const live=read("data/runtime/place-open/vega_scene.json").place;
 assert.equal(live.id,p.id);assert.equal(live.image,p.image);assert.equal(live.frontImage,p.frontImage);
 assert.deepEqual(live.fagverk.article,p.fagverk.article);
});
