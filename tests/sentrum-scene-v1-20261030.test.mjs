import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = f => JSON.parse(fs.readFileSync(f,'utf8'));
const place = read('data/places/musikk/oslo/places_musikk/sentrum_scene.json');
const quiz = read('data/quiz/musikk/sentrum_scene_sets_merged.json');
const cards = read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json');
const story = read('data/stories/stories_sentrum_scene.json');
const questions = quiz.sets.flatMap(set => set.questions);
const card = cards.cards.find(c => c.targetId === 'sentrum_scene');
test('Sentrum Scene remains a canonical music venue with own source-backed Fagverk', () => {
 assert.equal(place.id,'sentrum_scene');
 assert.deepEqual(place.underbadge_ids,['konsertsteder']);
 assert.equal(place.fagverk.schema,'history_go_place_fagverk_v2');
 assert.equal(place.fagverk.status,'curated');
 assert.equal(place.fagverk.article.length,3);
 for(const line of place.fagverk.article) assert.ok(line.length > 260);
 assert.equal(read('data/fagverk/fagverk_registry.json').placeLinks.sentrum_scene.field,'fagverk');
});
test('30 real quiz questions retain IDs, source support and Knowledge',()=>{
 assert.deepEqual(quiz.sets.map(s=>s.questions.length),[6,6,6,6,6]);
 assert.equal(questions.length,30);
 assert.equal(new Set(questions.map(q=>q.id)).size,30);
 for(const q of questions){
  assert.ok(!/place-filen|hvilket musikkemne|emne_id|hvilken metode passer|samlet analyse/i.test(q.question),q.id);
  assert.equal(q.answer,q.options[q.answerIndex],q.id);
  assert.ok(q.source?.length,q.id);
  assert.equal(q.knowledge_link_status,'linked',q.id);
  assert.ok(q.primary_knowledge_unit_id,q.id);
 }
});
test('QuizCard is 10 exact source questions with no numeric-answer overload',()=>{
 assert.equal(card.questions.length,10);
 let numeric=0;
 for(const [i,cq] of card.questions.entries()){
  const source=questions.find(q=>q.id===cq.sourceQuestionId);
  assert.ok(source,cq.sourceQuestionId);
  for(const key of ['question','options','answer','answerIndex','knowledge']) assert.deepEqual(cq[key],source[key],key);
  assert.equal(cq.sourceQuizId,source.quiz_id);
  assert.equal(card.answerKey[i].answer,source.answer);
  if(/(?:^|\s)\d{3,4}(?:\s|$)/.test(cq.answer)) numeric++;
 }
 assert.ok(numeric<=2);
});
test('Historical Story separates 1992 conference use from 2005 concert venue',()=>{
 assert.equal(story.length,1);
 assert.equal(story[0].year,2005);
 assert.ok(story[0].story.includes('konferansesenter i 1992'));
 assert.ok(story[0].story.includes('konsertscene i 2005'));
 assert.ok(story[0].story.includes('1956'));
});
