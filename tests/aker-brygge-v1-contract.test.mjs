import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";

const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const place=read("data/places/by/oslo/places/aker_brygge.json");
const index=read("data/places/places_index.json").find(x=>x.id==="aker_brygge");
const runtime=read("data/runtime/place-open/aker_brygge.json");
const quiz=read("data/quiz/by/aker_brygge_sets.json");
const card=read("data/quizcards/by/topp10_by_kort_batch1.json").cards.find(x=>x.targetId==="aker_brygge");

test("Aker Brygge has distinct local licensed hero and collectible images",()=>{
 assert.equal(place.id,"aker_brygge");
 assert.equal(place.place_card_profile.schema,"history_go_place_card_profile_v2");
 assert.deepEqual(place.place_card_profile.collection_ids,["people","brands","structures"]);
 assert.ok(place.fagverk?.article?.length>=4);
 assert.ok(place.externalLinks?.length>=4);
 assert.notEqual(place.image,place.frontImage);
 assert.equal(place.cardImage,place.frontImage);
 for(const [path,meta] of [[place.image,place.imageMeta],[place.frontImage,place.frontImageMeta]]){
   assert.ok(path.startsWith("bilder/places/oslo-havnefront06-20261109/"),path);
   assert.ok(fs.existsSync(path),"Missing WebP: "+path);
   const binary=fs.readFileSync(path);
   assert.equal(binary.toString("ascii",0,4),"RIFF");
   assert.equal(binary.toString("ascii",8,12),"WEBP");
   assert.equal(binary.length,meta.outputBytes,"Unexpected WebP bytes");
   assert.equal(crypto.createHash("sha256").update(binary).digest("hex"),meta.outputSha256);
   assert.equal(meta.license,"CC BY 4.0");
   assert.equal(meta.creator,"Jorge Franganillo");
   assert.ok(meta.sourcePage.startsWith("https://commons.wikimedia.org/wiki/File:"));
   assert.ok(meta.outputDimensions.every(n=>n>=900));
 }
 assert.equal(index.image,place.image);
 assert.equal(index.frontImage,place.frontImage);
 assert.equal(index.cardImage,place.cardImage);
 for(const k of Object.keys(place))assert.deepEqual(runtime.place[k],place[k],"Runtime mismatch: "+k);
 assert.deepEqual(runtime.place.place_card_profile.collection_ids,["people","brands","structures"]);
 assert.ok(runtime.people.length>=5);
 assert.deepEqual(runtime.brands.map(b=>b.id),["cos","olivia","rorbua","tiger_of_sweden","wiersholm"], "Only directly sourced place links enter runtime");
});
test("Aker Brygge QuizCard is identical to ten unique canonical questions",()=>{
 assert.equal(quiz.sets.length,8);
 assert.equal(quiz.sets.flatMap(s=>s.questions).length,56);
 assert.equal(card.card_id,"by_quizkort_topp10_batch1_aker_brygge");
 assert.equal(card.sourceFile,"data/quiz/by/aker_brygge_sets.json");
 assert.equal(card.questionCount,10);
 assert.equal(card.questions.length,10);
 assert.equal(card.answerKey.length,10);
 const bank=new Map(quiz.sets.flatMap(s=>s.questions).map(q=>[q.id,q]));
 let yearQuestions=0;const seen=new Set(),answers=new Set();
 for(const [i,q] of card.questions.entries()){
   const source=bank.get(q.sourceQuestionId);
   assert.ok(source,"Missing source question "+q.sourceQuestionId);
   assert.ok(!seen.has(source.id));seen.add(source.id);
   assert.ok(!answers.has(q.answer));answers.add(q.answer);
   assert.equal(q.sourceQuizId,source.quiz_id);
   assert.equal(q.sourceQuizFile,card.sourceFile);
   assert.equal(q.question,source.question);
   assert.deepEqual(q.options,source.options);
   assert.equal(q.answer,source.answer);
   assert.equal(q.answerIndex,source.options.indexOf(source.answer));
   assert.equal(q.knowledge,source.knowledge);
   assert.deepEqual(q.knowledge_unit_ids,source.knowledge_unit_ids);
   assert.deepEqual(q.source,source.source);
   assert.equal(card.answerKey[i].answer,q.answer);
   assert.equal(card.answerKey[i].answerIndex,q.answerIndex);
   assert.ok(source.knowledge_unit_ids?.length);
   if(/^(når|hvilket år|i hvilket år)\b/i.test(q.question) || /^(?:1\d{3}|20\d{2})$/.test(q.answer))yearQuestions++;
 }
 assert.ok(yearQuestions<=2,"Too many year-trivia questions");
});

