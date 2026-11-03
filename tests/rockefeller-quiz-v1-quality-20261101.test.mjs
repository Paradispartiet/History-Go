import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const q=read('data/quiz/musikk/rockefeller_sets_merged.json').sets.flatMap(s=>s.questions);
const cards=read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json');
const card=cards.cards.find(c=>c.targetId==='rockefeller');
const questions=new Map(q.map(row=>[row.id,row]));
test('Rockefeller source-backed capacity and non-internal fullquiz',()=>{
 assert.equal(q.length,30);
 assert.equal(new Set(q.map(row=>row.id)).size,30);
 assert.deepEqual(q.map(x=>x.id),Array.from({length:30},(_,i)=>'rockefeller_quiz_'+(i+1)));
 for(const row of q){assert.equal(row.options[row.answerIndex],row.answer,row.id);assert.ok(row.source.some(s=>/^https?:\/\//.test(s)),row.id);assert.equal(row.knowledge_link_status,'linked',row.id);assert.ok(row.primary_knowledge_unit_id,row.id);}
 for(const id of [6,24,28,30])assert.doesNotMatch(questions.get('rockefeller_quiz_'+id).question,/place-filen|samlet analyse|musikkfaglig lesning|sceneøkosystem-rolle/i);
 for(const [id,count,source] of [[4,'1 300','rockefeller.no'],[26,'500','rockefeller.no']]) {
  const row=questions.get('rockefeller_quiz_'+id);
  assert.ok(row.answer.includes(count));
  assert.ok(row.source.some(s=>s.includes(source)));
  assert.doesNotMatch(row.knowledge,/1 350|Gateforening/);
 }
});
test('QuizCard preserves exact ten fullquiz source questions',()=>{
 assert.equal(card.questions.length,10);
 for(const [i,cq] of card.questions.entries()){
  const row=questions.get(cq.sourceQuestionId);
  assert.ok(row,cq.sourceQuestionId);
  for(const key of ['question','options','answer','answerIndex','knowledge'])assert.deepEqual(cq[key],row[key],row.id);
  assert.equal(card.answerKey[i].answer,row.answer);
 }
});
