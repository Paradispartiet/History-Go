import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const source=read("data/places/subkultur/oslo/places_subkultur/the_villa.json");
const runtime=read("data/runtime/place-open/the_villa.json");
const registry=read("data/fagverk/fagverk_registry.json");
const quizFile="data/quiz/musikk/the_villa_sets_merged.json";
const quiz=read(quizFile);
const manifest=read("data/quiz/manifest.json");
const collection=read("data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json");

test("The Villa canonical identity and Geonorge point remain unchanged",()=>{
 assert.equal(source.id,"the_villa");
 assert.equal(source.category,"musikk");
 assert.equal(source.address.number,"23");
 assert.equal(source.lat,59.91563512459411);
 assert.equal(source.lon,10.74856019808857);
 assert.equal(source.coordSourceId,"geonorge-adresser-v1:0301:14943:23");
 assert(source.secondaryBadgeIds.includes("subkultur"));
});
test("The Villa has sourced history, 2010-11 closure and distinct local scene",()=>{
 assert.match(source.desc,/2007/);
 assert.match(source.popupDesc,/HeadOn/);
 assert.match(source.popupDesc,/2010/);
 assert.match(source.popupDesc,/2011/);
 assert.match(source.popupDesc,/Charlotte Thorstvedt/);
 assert(!/I History Go bør|Spørsmål bør|quizprofil/i.test(source.popupDesc));
 assert(source.externalLinks.some(e=>e.url.includes("dagsavisen.no")));
 assert(source.externalLinks.some(e=>e.url.includes("theguardian.com")));
});
test("The Villa curated Fagverk and actual Place-open are linked",()=>{
 assert.equal(source.fagverk.status,"curated");
 assert.equal(source.fagverk.article.length,3);
 assert.equal(source.fagverk.lenses.length,3);
 assert(source.fagverk.article.every(p=>p.length>300));
 assert.equal(registry.placeLinks.the_villa.status,"curated");
 for(const key of ["desc","popupDesc","externalLinks","fagverk"])assert.deepEqual(runtime.place[key],source[key]);
});
test("30 original sourced fullquiz questions and 10 source-matched QuizCard questions",()=>{
 assert.equal(quiz.targetId,"the_villa");
 assert.equal(quiz.categoryId,"musikk");
 assert.equal(quiz.sets.length,5);
 assert(quiz.sets.every(s=>s.questions.length===6));
 const qs=quiz.sets.flatMap(s=>s.questions);
 assert.equal(new Set(qs.map(q=>q.id)).size,30);
 assert(qs.every(q=>q.answer===q.options[q.answerIndex]&&q.source.some(url=>url.startsWith("https://"))));
 assert(qs.every(q=>q.knowledge.length>40));
 const entries=manifest.sets.filter(x=>x.targetId==="the_villa");
 assert.equal(entries.length,5);
 assert(entries.every(x=>x.file===quizFile));
 const c=collection.cards.find(x=>x.targetId==="the_villa");
 assert.equal(c.questions.length,10);
 assert.equal(c.answerKey.length,10);
 const byId=new Map(qs.map(q=>[q.id,q]));
 for(const [i,item] of c.questions.entries()){
  const full=byId.get(item.sourceQuestionId);
  assert(full);
  assert.equal(item.question,full.question);
  assert.deepEqual(item.options,full.options);
  assert.equal(item.answer,full.answer);
  assert.equal(item.answerIndex,full.answerIndex);
  assert.equal(c.answerKey[i].answer,full.answer);
 }
});
test("Media images are local, licensed, and correctly bound to Place-open",()=>{
 const paths=[source.image,source.frontImage,source.cardImage];
 assert.equal(new Set(paths).size,3);
 for(const p of paths) {
  assert(p?.endsWith(".webp"));
  assert(fs.existsSync(p));
  assert(fs.statSync(p).size>10000);
 }
 for(const key of ["image","frontImage","cardImage"])assert.equal(runtime.place[key],source[key]);
 assert.equal(source.imageMeta.creator,"Jan-Tore Egge");
 assert.equal(source.imageMeta.license,"CC BY-SA 4.0");
 assert.equal(source.frontImageMeta.orientation,"portrait");
});
test("Every The Villa question is synchronized with canonical Knowledge",()=>{
 for(const q of quiz.sets.flatMap(s=>s.questions)){
  assert.equal(q.knowledge_link_status,"linked",q.id);
  assert(q.primary_knowledge_unit_id?.startsWith("ku_"),q.id);
  assert(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id),q.id);
  assert(q.concept_ids?.length>0,q.id);
 }
});
