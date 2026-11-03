import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const id='viking_planet_oslo';
const p=read('data/places/historie/oslo/places_historie/viking_planet_oslo.json');
const q=read('data/quiz/historie/viking_planet_oslo_sets.json');
const c=read('data/quizcards/historie/viking_planet_oslo_quizcard_v1.json');
const qm=read('data/quiz/manifest.json'),cm=read('data/quizcards/historie/manifest.json');
const fm=read('data/fag/fag_manifest.json'),fr=read('data/fagverk/fagverk_registry.json');
test('Viking Planet: canonical site, 21 questions and manifests',()=>{
 assert.equal(p.id,id);assert.equal(p.category,'historie');
 assert.equal(p.fagverk.article.length,3);assert.equal(p.fagverk.lenses.length,3);
 assert.deepEqual(q.sets.map(x=>x.questions.length),[7,7,7]);
 const qs=q.sets.flatMap(s=>s.questions);
 assert.equal(new Set(qs.map(x=>x.id)).size,21);
 assert.equal(qm.sets.filter(x=>x.targetId===id).length,3);
 assert.ok(fm.historie.quizProduction.targets[id]);assert.ok(fr.placeLinks[id]);
 for(const x of qs){assert.equal(x.options.length,4);assert.equal(x.options[x.answerIndex],x.answer);assert.ok(x.source_urls.length);assert.ok(x.knowledge.length>30);assert.equal(x.knowledge_link_status,'linked');assert.ok(x.primary_knowledge_unit_id);}
});
test('Viking Planet: card 10/10 exact active source parity',()=>{
 assert.ok(cm.collections.includes('viking_planet_oslo_quizcard_v1.json'));
 const byId=new Map(q.sets.flatMap(s=>s.questions).map(q=>[q.id,q]));
 const card=c.cards[0];assert.equal(card.targetId,id);assert.equal(card.questions.length,10);assert.equal(card.answerKey.length,10);
 for(let i=0;i<10;i++){const x=card.questions[i],s=byId.get(x.sourceQuestionId);assert.ok(s);
 for(const key of ['question','options','answer','answerIndex','quiz_id','knowledge','primary_knowledge_unit_id','knowledge_unit_ids'])assert.deepEqual(x[key],s[key],key);
 assert.deepEqual(card.answerKey[i],{number:i+1,answer:s.answer});assert.equal(x.knowledge_link_status,'linked');}
});