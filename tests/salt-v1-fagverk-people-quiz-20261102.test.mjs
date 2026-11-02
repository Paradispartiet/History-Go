#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = path => JSON.parse(fs.readFileSync(path,'utf8'));
const place=read('data/places/musikk/oslo/places_musikk/salt.json');
const runtime=read('data/runtime/place-open/salt.json');
const people=read('data/people/musikk/oslo/people_musikk_oslo.json');
const relations=read('data/relations.json');
const quiz=read('data/quiz/musikk/salt_sets_merged.json');
const cards=read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json');
const registry=read('data/fagverk/fagverk_registry.json');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;

test('SALT source-backed Fagverk matches real Place-open and registry',()=>{
 const f=place.fagverk;
 assert.equal(f.schema,'history_go_place_fagverk_v2');
 assert.equal(f.status,'curated');
 assert.equal(f.article.length,3);
 assert.equal(f.lenses.length,3);
 assert.ok(f.guiding_questions.length>=5);
 assert.ok(f.chapter_ids.length>=2);
 assert.ok(f.article.every(a=>a.length>350));
 assert.ok(f.source_urls.includes('https://www.salted.no/about/'));
 assert.ok(f.source_urls.includes('https://kunstkritikk.no/saltsmak-pa-stranden/'));
 assert.deepEqual(stable(runtime.place.fagverk),stable(f));
 assert.equal(registry.placeLinks.salt.status,'curated');
 assert.equal(runtime.place.frontImage,place.frontImage);
});
test('SALT People are backed by dated sources, not invented artist performances',()=>{
 const founders=['helga_marie_nordby','erlend_mogard_larsen'];
 assert.deepEqual(runtime.people.map(x=>x.id).sort(),founders.slice().sort());
 for(const id of founders){
  const p=people.find(x=>x.id===id);
  assert.ok(p && p.placeId==='salt' && p.links.length>=2);
  assert.ok(p.links.every(l=>l.url.startsWith('https://')));
  assert.deepEqual(stable(runtime.people.find(x=>x.id===id)),stable(p));
 }
 for(const id of ['aurora','sigrid','bugge_wesseltoft']){
  assert.ok(people.find(x=>x.id===id),'Stable person ID must be preserved: '+id);
  assert.ok(!runtime.people.some(x=>x.id===id),'Undocumented SALT association: '+id);
  assert.ok(!people.find(x=>x.id===id).places?.includes('salt'));
 }
 assert.ok(!relations.some(x=>x.place==='salt' && ['aurora','sigrid'].includes(x.person)));
});
test('SALT has 30 natural history quiz questions with 10 matching QuizCard answers',()=>{
 const questions=quiz.sets.flatMap(s=>s.questions);
 assert.equal(quiz.sets.length,5);
 assert.equal(questions.length,30);
 assert.equal(new Set(questions.map(q=>q.id)).size,30);
 assert.ok(questions.every(q=>q.quiz_id&&q.targetId==='salt'));
 const forbidden=/place-fil|em_musikk_|met_musikk_|Nuu\\/SALT|musikkmetodefil|`salt`/i;
 assert.ok(questions.every(q=>!forbidden.test(q.question+' '+q.knowledge)));
 const card=cards.cards.find(c=>c.targetId==='salt');
 assert.ok(card);
 assert.equal(card.questions.length,10);
 const byId=new Map(questions.map(q=>[q.id,q]));
 for(const q of card.questions){
  const source=byId.get(q.sourceQuestionId);
  assert.ok(source);
  assert.equal(q.question,source.question);
  assert.equal(q.answer,source.answer);
  assert.equal(q.answerIndex,source.answerIndex);
 }
});
