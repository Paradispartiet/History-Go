import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const place=read("data/places/kunst/oslo/places_kunst/vigelandmuseet.json"),quiz=read("data/quiz/kunst/vigelandmuseet_sets.json"),card=read("data/quizcards/kunst/vigelandmuseet_quizcard_v1.json"),brief=read("data/quiz/production_briefs/kunst/vigelandmuseet.json");
const qm=read("data/quiz/manifest.json"),cm=read("data/quizcards/kunst/manifest.json"),reg=read("data/fagverk/fagverk_registry.json"),fm=read("data/fag/fag_manifest.json");
const all=quiz.sets.flatMap(s=>s.questions),sha=d=>crypto.createHash("sha256").update(d).digest("hex");
test("Vigelandmuseet source, photo and separate canonical site",()=>{
 assert.equal(place.id,"vigelandmuseet");assert.equal(place.category,"kunst");assert.equal(place.year,1947);
 assert.equal(place.coordStatus,"verified");assert.equal(place.imageLicense,"Public domain");
 assert.equal(place.fagverk.article.length,3);assert.equal(place.fagverk.lenses.length,3);
 assert.ok(!place.id.includes("parken"));
 for(const [filename,metadata] of [[place.image,place.imageMeta],[place.frontImage,place.frontImageMeta]]){
  const file=new URL("../"+filename,import.meta.url);assert.ok(fs.existsSync(file));
  const buf=fs.readFileSync(file);assert.equal(sha(buf),metadata.outputSha256);assert.ok(buf.length>5000);
 }
 const live=read("data/runtime/place-open/vigelandmuseet.json").place;
 assert.equal(live.id,place.id);assert.equal(live.image,place.image);assert.deepEqual(live.fagverk.article,place.fagverk.article);
});
test("Vigelandmuseet: 21 source-backed questions",()=>{
 assert.deepEqual(quiz.sets.map(s=>s.questions.length),[7,7,7]);
 assert.equal(new Set(all.map(q=>q.id)).size,21);assert.equal(brief.claims.length,21);
 assert.equal(qm.sets.filter(s=>s.targetId==="vigelandmuseet").length,3);
 assert.equal(all.filter(q=>/^(I hvilket år|Når ble|Hvilken dato)/iu.test(q.question)).length,0);
 for(const q of all){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
  assert.equal(q.options[q.answerIndex],q.answer);assert.ok(q.knowledge.length>35);
  assert.ok(q.source.every(s=>brief.sources[s]?.review_status==="reviewed"));
  assert.ok(brief.claims.some(c=>c.claim_id===q.claim_id));
  assert.equal(q.knowledge_link_status,"linked");assert.ok(q.primary_knowledge_unit_id&&q.knowledge_unit_ids?.length);
 }
});
test("Vigelandmuseet QuizCard parity and Fagverk registration",()=>{
 assert.ok(cm.collections.includes("vigelandmuseet_quizcard_v1.json"));
 assert.ok(fm.kunst.quizProduction.targets.vigelandmuseet);assert.ok(reg.placeLinks.vigelandmuseet);
 const ten=card.cards[0].questions;assert.equal(ten.length,10);
 for(const c of ten){const q=all.find(x=>x.id===c.sourceQuestionId);assert.ok(q);
  for(const key of ["question","options","answer","answerIndex","quiz_id","knowledge"])assert.deepEqual(c[key],q[key]);
  assert.equal(c.knowledge_link_status,"linked");assert.deepEqual(c.knowledge_unit_ids,q.knowledge_unit_ids);
 }
});
