import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const id='gamle_aker_kirke';
const manifest=read('data/quizcards/historie/manifest.json');
const cards=manifest.collections.filter(file=>fs.existsSync('data/quizcards/historie/'+file)).flatMap(file=>read('data/quizcards/historie/'+file).cards||[]);
const card=cards.filter(row=>row.targetId===id);
const quiz=read('data/quiz/historie/gamle_aker_kirke_sets.json');
const full=quiz.sets.flatMap(set=>set.questions);
const place=read('data/places/historie/oslo/places_historie/gamle_aker_kirke.json');
const expected=[1,2,4,5,8,9,11,12,13,21].map(i=>'gamle_aker_kirke_quiz_'+String(i).padStart(2,'0'));

test('Gamle Aker retains its 21-question sourced fullquiz and existing canonical manifest',()=>{
 assert.deepEqual(quiz.sets.map(set=>set.questions.length),[7,7,7]);
 assert.equal(new Set(full.map(q=>q.id)).size,21);
 for(const q of full){
  assert.equal(q.answer,q.options[q.answerIndex],q.id);
  assert.equal(q.knowledge_link_status,'linked',q.id);
  assert.ok(q.primary_knowledge_unit_id,q.id);
  assert.ok(q.knowledge_unit_ids?.length>0,q.id);
  assert.ok(q.source?.length>0&&q.source.every(s=>/^https:\/\//.test(quiz.sources[s]||'')),q.id);
 }
});
test('exactly one existing QuizCard, ten unique sourced canonical questions and correct answers',()=>{
 assert.equal(card.length,1);
 const item=card[0];
 assert.equal(item.questionCount,10);
 assert.equal(item.questions.length,10);
 assert.deepEqual(item.questions.map(q=>q.sourceQuestionId),expected);
 assert.equal(new Set(item.questions.map(q=>q.sourceQuestionId)).size,10);
 assert.deepEqual(item.answerKey,item.questions.map(q=>({number:q.number,answer:q.answer})));
 for(let i=0;i<10;i++){
  const q=item.questions[i],source=full.find(x=>x.id===q.sourceQuestionId);
  assert.equal(q.sourceQuizId,source.quiz_id);
  assert.equal(q.question,source.question);
  assert.equal(q.answer,source.answer);
  assert.equal(q.answer,q.options[q.answerIndex]);
  assert.deepEqual([...q.options].sort(),[...source.options].sort());
  assert.equal(q.knowledge,source.knowledge);
  assert.equal(q.claim_id,source.claim_id);
  assert.ok(q.source_urls?.length>0&&q.source_urls.every(u=>u.startsWith('https://')));
  assert.deepEqual(q.source_urls,source.source.map(ref=>quiz.sources[ref]));
  assert.ok(!/kortet formidle|sentralt nøkkelord|hvilket emne hører|terminalplattformer/i.test(q.question+' '+q.options.join(' ')));
 }
});
test('Gamle Aker photo files and source credits remain canonical; no fake year assertion',()=>{
 assert.match(place.desc,/usikker/i);
 assert.match(place.popupDesc,/usikker/i);
 for(const filepath of [place.image,place.cardImage,place.for_na.beforeImage,place.for_na.nowImage]){
  assert.ok(filepath?.startsWith('bilder/places/'),String(filepath));
  assert.ok(fs.existsSync(filepath),'missing image '+filepath);
  assert.ok(fs.statSync(filepath).size>20000,'empty image '+filepath);
 }
 assert.equal(place.imageMeta.verified,true);
 assert.equal(place.imageMeta.license,'Public domain');
 assert.ok(place.for_na.beforeImageMeta.license);
});
