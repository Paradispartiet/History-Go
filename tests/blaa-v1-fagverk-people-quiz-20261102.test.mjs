#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = path => JSON.parse(fs.readFileSync(path,'utf8'));
const place=read('data/places/musikk/oslo/places_musikk/blaa.json');
const runtime=read('data/runtime/place-open/blaa.json');
const people=read('data/people/musikk/oslo/people_musikk_oslo.json');
const quiz=read('data/quiz/musikk/blaa_sets_merged.json');
const cards=read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json');
const registry=read('data/fagverk/fagverk_registry.json');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;

test('Blå source-backed Fagverk matches canonical Place-open and live Music taxonomy',()=>{
 const f=place.fagverk;
 assert.equal(place.id,'blaa');
 assert.equal(f.schema,'history_go_place_fagverk_v2');
 assert.equal(f.status,'curated');
 assert.equal(f.article.length,3);
 assert.equal(f.lenses.length,3);
 assert.ok(f.guiding_questions.length>=5);
 assert.ok(f.chapter_ids.length>=2);
 assert.ok(f.article.every(a=>a.length>350));
 assert.ok(f.source_urls.includes('https://oslobyleksikon.no/side/Bl%C3%A5'));
 assert.ok(f.source_urls.includes('https://www.ballade.no/bransjen/bla-har-solgt-bardriften/'));
 assert.ok(f.emne_ids.every(id=>id.startsWith('em_musikk_vit_')));
 assert.ok(f.lenses.every(l=>l.emne_id.startsWith('em_musikk_vit_')));
 assert.deepEqual(stable(runtime.place.fagverk),stable(f));
 assert.equal(registry.placeLinks.blaa.status,'curated');
 assert.equal(runtime.place.image,place.image);
 assert.equal(runtime.place.frontImage,place.frontImage);
});
test('Blå People: documented founders and musician; no unverified Garbarek venue link',()=>{
 const expected=['martin_revheim','kjell_einar_karlsen','bugge_wesseltoft'];
 assert.deepEqual(runtime.people.map(p=>p.id).sort(),expected.slice().sort());
 for(const id of expected){
  const p=people.find(x=>x.id===id);
  assert.ok(p && p.places.includes('blaa'),id);
  assert.ok(p.links.length>=1,'Missing source for '+id);
  assert.ok(p.links.every(x=>x.url.startsWith('https://')));
  assert.deepEqual(stable(runtime.people.find(x=>x.id===id)),stable(p));
 }
 const jan=people.find(p=>p.id==='jan_garbarek');
 assert.ok(jan);
 assert.ok(!jan.places.includes('blaa'));
 assert.ok(!runtime.people.some(p=>p.id==='jan_garbarek'));
});
test('Blå fullquiz 30, QuizCard 10, original IDs and answers are preserved',()=>{
 const questions=quiz.sets.flatMap(s=>s.questions);
 assert.equal(quiz.sets.length,5);
 assert.equal(questions.length,30);
 assert.equal(new Set(questions.map(q=>q.id)).size,30);
 assert.ok(questions.every(q=>q.quiz_id&&q.targetId==='blaa'));
 const forbidden=/place-fil|em_musikk_|met_musikk_|musikkmetodefil|\`blaa\`/i;
 assert.ok(questions.every(q=>!forbidden.test(q.question+' '+q.knowledge)));
 const card=cards.cards.find(c=>c.targetId==='blaa');
 assert.ok(card);
 assert.equal(card.questions.length,10);
 const byId=new Map(questions.map(q=>[q.id,q]));
 for(const q of card.questions){
  const source=byId.get(q.sourceQuestionId);
  assert.ok(source,'Missing QuizCard source '+q.sourceQuestionId);
  assert.equal(q.question,source.question);
  assert.equal(q.answer,source.answer);
  assert.equal(q.answerIndex,source.answerIndex);
 }
});
