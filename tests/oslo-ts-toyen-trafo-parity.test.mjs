import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const id='toyen_trafo',p=read('data/places/naeringsliv/oslo/places_naeringsliv_oslo_kultureiendommer_batch_04/'+id+'.json'),q=read('data/quiz/naeringsliv/'+id+'_sets.json'),c=read('data/quizcards/naeringsliv/'+id+'_quizcard_v1.json'),qm=read('data/quiz/manifest.json'),cm=read('data/quizcards/naeringsliv/manifest.json'),reg=read('data/fagverk/fagverk_registry.json');
const qs=q.sets.flatMap(s=>s.questions);
test('Tøyen trafo Place, source, licensed photo, Fagverk',()=>{
 assert.equal(p.id,id);assert.equal(p.category,'naeringsliv');assert.equal(p.year,1915);assert.equal(p.fagverk.schema,'history_go_place_fagverk_v2');
 assert.equal(p.fagverk.article.length,3);assert.equal(p.fagverk.lenses.length,3);assert.equal(p.imageLicense,'CC BY-SA 4.0');
 assert.match(p.imageCaption,/1931/);assert.ok(p.imageSourceUrl.includes('commons.wikimedia.org'));assert.ok(p.imageMeta.sourcePage);
 assert.ok(reg.placeLinks[id]);assert.equal(p.fagverk.source_urls.length,5);
});
test('Tøyen trafo 21 canonical Knowledge-linked source questions',()=>{
 assert.deepEqual(q.sets.map(s=>s.questions.length),[7,7,7]);assert.equal(new Set(qs.map(x=>x.id)).size,21);assert.equal(qm.sets.filter(x=>x.targetId===id).length,3);
 for(const x of qs){assert.equal(x.answer,x.options[x.answerIndex]);assert.ok(x.source_urls.length);assert.ok(x.claim_basis);assert.equal(x.knowledge_link_status,'linked');assert.ok(x.primary_knowledge_unit_id);}
});
test('Tøyen trafo QuizCard 10/10 fullquiz parity',()=>{
 assert.ok(cm.collections.includes(id+'_quizcard_v1.json'));assert.equal(c.cards[0].questions.length,10);
 const by=new Map(qs.map(x=>[x.id,x]));
 for(let i=0;i<10;i++){const row=c.cards[0].questions[i],src=by.get(row.sourceQuestionId);assert.ok(src);for(const k of ['quiz_id','question','options','answer','answerIndex','knowledge','primary_knowledge_unit_id','knowledge_unit_ids'])assert.deepEqual(row[k],src[k]);assert.deepEqual(c.cards[0].answerKey[i],{number:i+1,answer:src.answer,answerIndex:src.answerIndex});}
});
