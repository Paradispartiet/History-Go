import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const id='toyen_torg', place=read('data/places/by/oslo/places/'+id+'.json'),quiz=read('data/quiz/by/'+id+'_sets.json'),cards=read('data/quizcards/by/topp10_by_kort_batch1.json'),manifest=read('data/quizcards/by/manifest.json');
const all=quiz.sets.flatMap(s=>s.questions),card=cards.cards.find(c=>c.targetId===id);
test('Tøyen torg retains fully curated place and 28 Knowledge linked questions',()=>{
 assert.equal(place.id,id);assert.equal(place.production_status,'complete');assert.equal(place.fagverk.status,'curated');assert.equal(place.fagverk.article.length,6);
 assert.deepEqual(quiz.sets.map(s=>s.questions.length),[7,7,7,7]);
 assert.equal(all.length,28);assert.equal(new Set(all.map(q=>q.id)).size,28);
 assert.ok(all.every(q=>q.knowledge_link_status==='linked'&&q.primary_knowledge_unit_id));
});
test('Existing Tøyen torg QuizCard has 10/10 exact source questions and no synthetic year',()=>{
 assert.ok(manifest.collections.includes('topp10_by_kort_batch1.json'));
 assert.equal(cards.cards.length,10);
 assert.equal(card.card_id,'by_quizkort_topp10_batch1_toyen_torg');
 assert.equal(card.questionCount,10);assert.equal(card.questions.length,10);assert.equal(card.answerKey.length,10);
 const byId=new Map(all.map(q=>[q.id,q]));
 for(let i=0;i<10;i++){
 const row=card.questions[i],src=byId.get(row.sourceQuestionId);
 assert.ok(src,'Question missing in fullquiz: '+row.sourceQuestionId);
 for(const k of ['quiz_id','question','options','answer','answerIndex','knowledge','primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status'])assert.deepEqual(row[k],src[k]);
 assert.deepEqual(card.answerKey[i],{number:i+1,answer:src.answer,answerIndex:src.answerIndex});
 assert.equal(row.sourceQuizId,src.quiz_id);assert.equal(row.sourceQuizFile,'data/quiz/by/toyen_torg_sets.json');
 assert.ok(row.answer===row.options[row.answerIndex]);
 }
 assert.equal(card.questions.filter(q=>q.question_type==='concept').length,1);
});
test('The historical Tøyen torg photograph is already documented as public domain',()=>{
 assert.equal(place.for_na.beforeImage,'bilder/historisk/toyen_torg/toyen_senter_2006.webp');
 assert.equal(place.for_na.beforeImageMeta.license,'Public domain');
 assert.ok(place.for_na.beforeImageMeta.sourcePage.includes('commons.wikimedia.org'));
 assert.ok(fs.existsSync(new URL('../'+place.for_na.beforeImage,import.meta.url)));
});
