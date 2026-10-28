import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const p=read("data/places/kunst/oslo/places_kunst/van_etten.json"),q=read("data/quiz/kunst/van_etten_sets.json"),c=read("data/quizcards/kunst/van_etten_quizcard_v1.json"),b=read("data/quiz/production_briefs/kunst/van_etten.json");
const fm=read("data/fag/fag_manifest.json"), qm=read("data/quiz/manifest.json"),cm=read("data/quizcards/kunst/manifest.json"),reg=read("data/fagverk/fagverk_registry.json"),questions=q.sets.flatMap(x=>x.questions);
test("Van Etten: canonical identity, three sets of seven and sourced answers",()=>{
 assert.equal(p.id,"van_etten");assert.equal(p.category,"kunst");assert.equal(p.coordStatus,"verified");
 assert.deepEqual(q.sets.map(s=>s.questions.length),[7,7,7]);assert.equal(new Set(questions.map(q=>q.id)).size,21);
 assert.equal(b.claims.length,21);assert.equal(qm.sets.filter(s=>s.targetId===p.id).length,3);assert.deepEqual(qm.sets.filter(s=>s.targetId===p.id).map(x=>x.set_id).sort(),q.sets.map(x=>x.set_id).sort());
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
test("Van Etten: QuizCard uses exact ten linked source questions",()=>{
 assert.ok(cm.collections.includes("van_etten_quizcard_v1.json"));
 const cs=c.cards[0].questions;assert.equal(cs.length,10);
 for(const item of cs){const original=questions.find(q=>q.id===item.sourceQuestionId);assert.ok(original);
  for(const f of ["question","options","answer","answerIndex","quiz_id","knowledge"])assert.deepEqual(item[f],original[f]);
  assert.equal(item.knowledge_link_status,"linked");assert.deepEqual(item.knowledge_unit_ids,original.knowledge_unit_ids);
 }
});
test("Van Etten: Fagverk, historical photograph label and generated Place-open",()=>{
 assert.equal(p.fagverk.article.length,3);assert.equal(p.fagverk.lenses.length,3);
 assert.ok(/2016/.test(p.imageCaption));assert.ok(/Smedgata 3/i.test(p.imageCaption));
 assert.equal(p.imageLicense,"CC BY-SA 4.0");
 for(const f of [p.image,p.frontImage])assert.ok(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\//.test(f));
 assert.ok(fm.kunst.quizProduction.targets.van_etten);
 assert.ok(reg.placeLinks.van_etten);
 const live=read("data/runtime/place-open/van_etten.json").place;
 assert.equal(live.id,p.id);assert.equal(live.image,p.image);assert.equal(live.frontImage,p.frontImage);
 assert.deepEqual(live.fagverk.article,p.fagverk.article);
});

test("Van Etten and Vaterland: canonical subject Knowledge registries contain published question IDs",()=>{
 const ku=new Set(read("data/knowledge/subjects/kunst/knowledge_units.generated.json").units.map(u=>u.knowledge_unit_id));
 for(const question of questions)assert.ok(question.knowledge_unit_ids.some(id=>ku.has(id)),question.id+" missing from Kunst Knowledge");
 const vat=read("data/quiz/subkultur/vaterland_bar_scene_sets.json");
 const sub=new Set(read("data/knowledge/subjects/subkultur/knowledge_units.generated.json").units.map(u=>u.knowledge_unit_id));
 for(const question of vat.sets.flatMap(s=>s.questions))assert.ok(question.knowledge_unit_ids?.some(id=>sub.has(id)),question.id+" missing from Subkultur Knowledge");
});
