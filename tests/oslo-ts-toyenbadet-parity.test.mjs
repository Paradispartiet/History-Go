import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const id='toyenbadet',p=read('data/places/sport/europa/norway/oslo_sport/'+id+'.json'),q=read('data/quiz/sport/'+id+'_sets.json'),c=read('data/quizcards/sport/'+id+'_quizcard_v1.json'),qm=read('data/quiz/manifest.json'),cm=read('data/quizcards/sport/manifest.json'),reg=read('data/fagverk/fagverk_registry.json');
const qs=q.sets.flatMap(s=>s.questions);
test('Tøyenbadet canonical place, sources and Fagverk',()=>{
 assert.equal(p.id,id);assert.equal(p.category,'sport');assert.equal(p.fagverk.schema,'history_go_place_fagverk_v2');assert.equal(p.fagverk.article.length,3);assert.equal(p.fagverk.lenses.length,3);
 assert.equal(p.imageLicense,'CC BY-SA 3.0');assert.match(p.imageCaption,/2013/);assert.ok(p.imageSourceUrl.includes('wikimedia'));
 assert.ok(reg.placeLinks[id]);assert.ok(p.fagverk.source_urls.length>=5);
});
test('Tøyenbadet fullquiz 3x7 with canonical Knowledge',()=>{
 assert.deepEqual(q.sets.map(s=>s.questions.length),[7,7,7]);
 assert.equal(new Set(qs.map(x=>x.id)).size,21);assert.equal(qm.sets.filter(x=>x.targetId===id).length,3);
 for(const x of qs){assert.equal(x.answer,x.options[x.answerIndex]);assert.ok(x.source_urls.length);assert.ok(x.claim_basis);assert.equal(x.knowledge_link_status,'linked');assert.ok(x.primary_knowledge_unit_id);}
});
test('Tøyenbadet QuizCard 10/10 identical source questions',()=>{
 assert.ok(cm.collections.includes(id+'_quizcard_v1.json'));
 const by=new Map(qs.map(x=>[x.id,x]));
 assert.equal(c.cards.length,1);assert.equal(c.cards[0].questions.length,10);assert.equal(c.cards[0].answerKey.length,10);
 for(let i=0;i<10;i++){const row=c.cards[0].questions[i],src=by.get(row.sourceQuestionId);assert.ok(src);for(const k of ['quiz_id','question','options','answer','answerIndex','knowledge','primary_knowledge_unit_id','knowledge_unit_ids'])assert.deepEqual(row[k],src[k]);assert.deepEqual(c.cards[0].answerKey[i],{number:i+1,answer:src.answer,answerIndex:src.answerIndex});}
});
