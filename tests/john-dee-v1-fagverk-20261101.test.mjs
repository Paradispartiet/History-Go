#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => JSON.parse(fs.readFileSync(p,'utf8'));
const place = read('data/places/musikk/oslo/places_musikk/john_dee.json');
const runtime = read('data/runtime/place-open/john_dee.json');
const people = read('data/people/musikk/oslo/people_musikk_oslo.json');
const quiz = read('data/quiz/musikk/john_dee_sets_merged_REVISED.json');
const cards = read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json');

test('John Dee has curated sourced Fagverk synchronized with Place-open',()=>{
  const f = place.fagverk;
  assert.equal(place.id,'john_dee');
  assert.equal(f?.schema,'history_go_place_fagverk_v2');
  assert.equal(f?.status,'curated');
  assert.equal(f.article.length,3);
  assert.equal(f.lenses.length,3);
  assert.ok(f.guiding_questions.length>=5);
  assert.ok(f.chapter_ids.length>=2);
  for(const article of f.article)assert.ok(article.length>300);
  assert.ok(f.source_urls.includes('https://www.ballade.no/populaermusikk/john-dee-lillebror-fyller-10-ar/'));
  assert.ok(f.source_urls.includes('https://www.rockefeller.no/booking-utleie-johndee'));
  assert.deepEqual(runtime.place.fagverk,f);
  assert.equal(runtime.place.id,'john_dee');
  assert.equal(runtime.place.frontImage,place.frontImage);
  assert.equal(runtime.place.image,place.image);
});

test('John Dee does not inherit undocumented Jokke association',()=>{
 const jokke = people.find(p=>p.id==='joachim_nielsen');
 assert.ok(jokke);
 assert.ok(jokke.places.includes('rockefeller'),'Rockefeller association must remain');
 assert.ok(!jokke.places.includes('john_dee'),'Jokke concert documentation is Rockefeller-only');
 assert.ok(!runtime.people.some(p=>p.id==='joachim_nielsen'));
 assert.deepEqual(runtime.people.map(p=>p.id),['bo_terje_hustoft'],'John Dee People must be independently documented');
});

test('John Dee keeps original 30-question quiz and 10-card question parity',()=>{
 const questions=quiz.sets.flatMap(s=>s.questions);
 assert.equal(quiz.sets.length,5);
 assert.equal(questions.length,30);
 assert.equal(new Set(questions.map(q=>q.id)).size,30);
 const forbidden=/place-fil|em_musikk_|met_musikk_|musikkdata|History Go|quiz|`john_dee`/i;
 assert.ok(questions.every(q=>!forbidden.test(q.question+' '+q.knowledge)),'No internal quiz metadata in historical prose');
 assert.ok(questions.every(q=>q.quiz_id && q.targetId==='john_dee'));
 const card=cards.cards.find(c=>c.targetId==='john_dee');
 assert.ok(card);
 assert.equal(card.questions.length,10);
 const byId=new Map(questions.map(q=>[q.id,q]));
 for(const q of card.questions){
  const source=byId.get(q.sourceQuestionId);
  assert.ok(source,'Missing original source question: '+q.sourceQuestionId);
  assert.equal(q.question,source.question);
  assert.equal(q.answer,source.answer);
  assert.equal(q.answerIndex,source.answerIndex);
 }
});

test('John Dee v1 is backed by real mobile and desktop browser evidence',()=>{
 const tiers=read('data/places/production-tiers/v1-oslo-nature-music-20261017-batch02.json');
 const john=tiers.places.find(p=>p.place_id==='john_dee');
 assert.equal(john?.content_level,'v1');
 assert.ok(john.v1_browser_evidence.workflow_run_ids.includes(41357190082));
 assert.deepEqual(john.v1_browser_evidence.checked_viewports,['mobile_390x844','desktop_1440x1000']);
});
