import test from 'node:test';
import assert from 'node:assert/strict';
import {buildOsloFourV1Batch} from '../scripts/build-oslo-four-v1-batch.mjs';

test('all four remaining Oslo sites have complete staged v1 content and correct QuizCard parity',()=>{
 const pack=buildOsloFourV1Batch();
 assert.deepEqual(pack.map(x=>x.id),['linderud_gard','sarabraten','saeterhytten_bygdoy','kristiania_teglverk_bryn']);
 assert.equal(pack.length,4);
 assert.equal(pack.reduce((n,x)=>n+x.quiz.sets.flatMap(s=>s.questions).length,0),91);
 assert.equal(pack.reduce((n,x)=>n+x.card.questions.length,0),40);
 for(const entry of pack){
   assert.ok(entry.place.desc.length>110,entry.id+' desc');
   assert.ok(entry.place.popupDesc.length>600,entry.id+' popupDesc');
   assert.ok(entry.place.fagverk.article.length>=3,entry.id+' Fagverk');
   assert.equal(entry.place.fagverk.status,'in_production');
   assert.ok(entry.place.image&&entry.place.frontImage&&entry.place.cardImage);
   assert.ok(entry.place.lat>59&&entry.place.lat<61&&entry.place.lon>10&&entry.place.lon<11);
   assert.equal(entry.place.coordRole,'display_marker');
   assert.equal(entry.place.coordStatus,'candidate');
   assert.equal(entry.place.r>0,true);
   assert.equal(entry.review_status,'CANDIDATE_NOT_ACTIVE');
   const questions=entry.quiz.sets.flatMap(s=>s.questions);
   assert.equal(questions.length,entry.id==='linderud_gard'?28:21);
   assert.equal(entry.card.questions.length,10);
   assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
   for(const q of questions){
     assert.equal(q.options[q.answerIndex],q.answer,entry.id+' '+q.id);
     assert.equal(q.options.length,4);
     assert.ok(q.source_urls.every(x=>x.startsWith('https://')));
   }
   for(const c of entry.card.questions){
     const q=questions.find(q=>q.id===c.sourceQuestionId);
     assert.ok(q,entry.id+' card source missing');
     assert.equal(c.question,q.question);
     assert.equal(c.answer,q.answer);
     assert.equal(c.options[c.answerIndex],c.answer);
   }
 }
});
test('industrial site never makes a false promise of access or documentary photography',()=>{
 const tegl=buildOsloFourV1Batch().find(x=>x.id==='kristiania_teglverk_bryn');
 assert.match(tegl.place.coordNote,/Privat industriområde/);
 assert.match(tegl.place.imageMeta.caption,/ikke dokumentarfoto/);
 assert.ok(tegl.images.every(([,svg])=>svg.includes('Historisk illustrasjon')));
 assert.equal(tegl.images.length,3);
});
import fs from 'node:fs';

test('candidate files exist as separate Place and quiz JSON, without silent live activation',()=>{
 const pack=buildOsloFourV1Batch();
 const manifest=JSON.parse(fs.readFileSync('data/places/manifest.json','utf8'));
 for(const entry of pack){
   assert.ok(fs.existsSync(entry.placePath),entry.id+' missing Place source');
   assert.ok(fs.existsSync(entry.quizPath),entry.id+' missing quiz source');
   const place=JSON.parse(fs.readFileSync(entry.placePath,'utf8'));
   const quiz=JSON.parse(fs.readFileSync(entry.quizPath,'utf8'));
   assert.equal(place.id,entry.id);
   assert.equal(quiz.sets.flatMap(set=>set.questions).length,entry.quiz.sets.flatMap(set=>set.questions).length);
   assert.ok(!manifest.files.includes(entry.placePath.replace(/^data\\//,'')),entry.id+' unexpectedly published');
 }
});
