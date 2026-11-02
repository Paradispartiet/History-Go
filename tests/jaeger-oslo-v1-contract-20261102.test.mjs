import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const p=read("data/places/subkultur/oslo/places_subkultur/jaeger_oslo.json");
const runtime=read("data/runtime/place-open/jaeger_oslo.json");
const reg=read("data/fagverk/fagverk_registry.json");
const qfile="data/quiz/musikk/jaeger_oslo_sets_merged.json";
const quiz=read(qfile);
const manifest=read("data/quiz/manifest.json");
const c=read("data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json").cards.find(x=>x.targetId==="jaeger_oslo");

test("Jaeger retains canonical identity and Geonorge point",()=>{
 assert.equal(p.id,"jaeger_oslo");
 assert.equal(p.category,"musikk");
 assert.equal(p.address.number,"9");
 assert.equal(p.coordSourceId,"geonorge-adresser-v1:0301:12356:9");
 assert.equal(p.lat,59.913899495519225);
 assert.equal(p.lon,10.743437565163234);
});
test("Jaeger source-grounded historical article separates company formation and club opening",()=>{
 assert.match(p.popupDesc,/januar 2011/);
 assert.match(p.popupDesc,/Garage Oslo/);
 assert.match(p.popupDesc,/Kaman Leung/);
 assert.match(p.popupDesc,/september 2010/);
 assert(!/I History Go bør|Spørsmål bør|quizprofil/i.test(p.popupDesc));
 assert(p.externalLinks.some(x=>x.url.includes("ra.co/news/13362")));
});
test("Jaeger curated Fagverk is linked to canonical Place-open and registry",()=>{
 assert.equal(p.fagverk.status,"curated");
 assert.equal(reg.placeLinks.jaeger_oslo.status,"curated");
 assert.equal(p.fagverk.article.length,3);
 assert.equal(p.fagverk.lenses.length,3);
 assert(p.fagverk.article.every(x=>x.length>300));
 for(const key of ["desc","popupDesc","externalLinks","fagverk"])assert.deepEqual(runtime.place[key],p[key]);
});
test("Jaeger has 30 unique sourced quiz questions and 10 accurate QuizCard questions",()=>{
 assert.equal(quiz.targetId,"jaeger_oslo");
 assert.equal(quiz.categoryId,"musikk");
 assert.equal(quiz.sets.length,5);
 assert(quiz.sets.every(s=>s.questions.length===6));
 const qs=quiz.sets.flatMap(s=>s.questions);
 assert.equal(new Set(qs.map(q=>q.id)).size,30);
 assert(qs.every(q=>q.answer===q.options[q.answerIndex]));
 assert(qs.every(q=>q.source.some(x=>x.startsWith("https://"))));
 assert(qs.every(q=>q.knowledge.length>40));
 assert.equal(manifest.sets.filter(s=>s.targetId==="jaeger_oslo").length,5);
 assert.equal(c.questions.length,10);
 assert.equal(c.answerKey.length,10);
 const byId=new Map(qs.map(q=>[q.id,q]));
 for(const [i,item] of c.questions.entries()){
  const full=byId.get(item.sourceQuestionId);
  assert(full,item.sourceQuestionId);
  assert.equal(item.question,full.question);
  assert.deepEqual(item.options,full.options);
  assert.equal(item.answer,full.answer);
  assert.equal(item.answerIndex,full.answerIndex);
  assert.equal(c.answerKey[i].answer,full.answer);
 }
});
test("Jaeger media has two distinct CC BY-SA 3.0 original photos",()=>{
 const paths=[p.image,p.frontImage,p.cardImage];
 assert.equal(new Set(paths).size,3);
 for(const path of paths){assert(path?.endsWith(".webp"));assert(fs.existsSync(path));assert(fs.statSync(path).size>10000);}
 assert.notEqual(p.imageMeta.sourcePage,p.frontImageMeta.sourcePage);
 assert.equal(p.imageMeta.creator,"Anne-Sophie Ofrim");
 assert.equal(p.imageMeta.license,"CC BY-SA 3.0");
 assert.equal(p.frontImageMeta.orientation,"portrait");
 for(const key of ["image","frontImage","cardImage"])assert.equal(runtime.place[key],p[key]);
});
test("Jaeger fullquiz is bound to canonical Knowledge",()=>{
 const qs=quiz.sets.flatMap(s=>s.questions);
 for(const q of qs){
  assert.equal(q.knowledge_link_status,"linked",q.id);
  assert(q.primary_knowledge_unit_id?.startsWith("ku_"),q.id);
  assert(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id),q.id);
  assert(q.concept_ids?.length>0,q.id);
 }
});
