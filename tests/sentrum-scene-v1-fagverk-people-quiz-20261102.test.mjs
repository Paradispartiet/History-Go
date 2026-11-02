#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const place=read('data/places/musikk/oslo/places_musikk/sentrum_scene.json'),runtime=read('data/runtime/place-open/sentrum_scene.json'),people=read('data/people/musikk/oslo/people_musikk_oslo.json'),artPeople=read('data/people/kunst/oslo/people_kunst_oslo_politics_places_batch_02.json'),byPeople=read('data/people/by/oslo/people_by_oslo.json'),quiz=read('data/quiz/musikk/sentrum_scene_sets_merged.json'),cards=read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json'),registry=read('data/fagverk/fagverk_registry.json');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
test('Sentrum Scene curated Fagverk and source history',()=>{
 assert.equal(place.id,'sentrum_scene');assert.equal(place.fagverk.status,'curated');assert.equal(place.fagverk.article.length,3);assert.equal(place.fagverk.lenses.length,3);assert.ok(place.fagverk.chapter_ids.length>=2);
 assert.ok(place.fagverk.emne_ids.every(x=>x.startsWith('em_musikk_vit_')));assert.ok(place.fagverk.article.every(x=>x.length>350));
 assert.deepEqual(stable(runtime.place.fagverk),stable(place.fagverk));assert.equal(registry.placeLinks.sentrum_scene.status,'curated');assert.equal(place.frontImage,runtime.place.frontImage);
});
test('Two historically documented People, no unrelated Rockefeller concert ties',()=>{
 const expected=['ove_bang','inger_sitter'];assert.deepEqual(runtime.people.map(x=>x.id).sort(),expected.slice().sort());
 for(const id of expected){const p=[...byPeople,...artPeople,...people].find(x=>x.id===id);assert.ok(p&&p.places.includes('sentrum_scene')&&p.links?.length);assert.ok(p.links.every(x=>x.url.startsWith('https://')));assert.deepEqual(stable(runtime.people.find(x=>x.id===id)),stable(p));}
 for(const id of ['mari_boine','morten_harket']){const p=people.find(x=>x.id===id);assert.ok(p&&p.places.includes('rockefeller'));assert.ok(!p.places.includes('sentrum_scene'));assert.ok(!runtime.people.some(x=>x.id===id));}
});
test('Fullquiz 30, original ten QuizCards and generated Knowledge links',()=>{
 const qs=quiz.sets.flatMap(x=>x.questions);assert.equal(quiz.sets.length,5);assert.equal(qs.length,30);assert.equal(new Set(qs.map(x=>x.id)).size,30);
 assert.ok(qs.every(x=>x.quiz_id&&x.targetId==='sentrum_scene'));assert.ok(qs.every(x=>!/place-fil|em_musikk_|met_musikk_|musikkmetodefil/i.test(x.question+' '+x.knowledge)));
 assert.ok(qs.every(x=>x.knowledge_unit_ids?.includes(x.primary_knowledge_unit_id)&&x.knowledge_link_status==='linked'));
 const card=cards.cards.find(x=>x.targetId==='sentrum_scene');assert.equal(card.questions.length,10);const by=new Map(qs.map(x=>[x.id,x]));
 for(const c of card.questions){const q=by.get(c.sourceQuestionId);assert.ok(q);assert.equal(q.question,c.question);assert.equal(q.answer,c.answer);assert.equal(q.answerIndex,c.answerIndex);}
});
