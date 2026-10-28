import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const id='toyen_hovedgard',p=read('data/places/historie/oslo/places_historie/'+id+'.json'),q=read('data/quiz/historie/'+id+'_sets.json'),c=read('data/quizcards/historie/'+id+'_quizcard_v1.json'),qm=read('data/quiz/manifest.json'),cm=read('data/quizcards/historie/manifest.json'),registry=read('data/fagverk/fagverk_registry.json');
const qs=q.sets.flatMap(s=>s.questions);
test('Tøyen hovedgård retains canonical location and has licensed image plus curated Fagverk',()=>{
 assert.equal(p.id,id);assert.equal(p.category,'historie');assert.equal(p.coordStatus,'verified');assert.equal(p.address.street,'Trondheimsveien');assert.equal(p.address.number,'23B');assert.equal(p.year,1721);
 assert.equal(p.fagverk.schema,'history_go_place_fagverk_v2');assert.equal(p.fagverk.status,'curated');assert.equal(p.fagverk.article.length,3);assert.equal(p.fagverk.lenses.length,3);
 assert.equal(p.imageLicense,'CC BY-SA 3.0');assert.match(p.imageCaption,/2009/);assert.ok(p.imageSourceUrl.includes('commons.wikimedia.org'));
 assert.equal(registry.placeLinks[id].field,'fagverk');
});
test('Tøyen hovedgård 21/21 quiz and active manifest with canonical Knowledge',()=>{
 assert.deepEqual(q.sets.map(s=>s.questions.length),[7,7,7]);assert.equal(new Set(qs.map(q=>q.id)).size,21);assert.equal(qm.sets.filter(s=>s.targetId===id).length,3);
 for(const row of qs){assert.equal(row.answer,row.options[row.answerIndex]);assert.ok(row.source_urls.length);assert.ok(row.claim_basis);assert.ok(row.primary_knowledge_unit_id);assert.equal(row.knowledge_link_status,'linked');}
});
test('Tøyen hovedgård 10/10 QuizCard exact parity with fullquiz',()=>{
 assert.ok(cm.collections.includes(id+'_quizcard_v1.json'));assert.equal(c.cards[0].questions.length,10);
 const by=new Map(qs.map(q=>[q.id,q]));
 for(let i=0;i<10;i++){const row=c.cards[0].questions[i],src=by.get(row.sourceQuestionId);assert.ok(src);for(const k of ['quiz_id','question','options','answer','answerIndex','knowledge','primary_knowledge_unit_id','knowledge_unit_ids'])assert.deepEqual(row[k],src[k]);assert.deepEqual(c.cards[0].answerKey[i],{number:i+1,answer:src.answer,answerIndex:src.answerIndex});}
});
