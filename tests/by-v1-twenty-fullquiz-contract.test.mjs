import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=(file)=>JSON.parse(fs.readFileSync(file,'utf8'));
const ids=[
 'akrobaten_gangbro','frogner','grorud','holmlia','losaeter','okern',
 'sagene','skoyen','sukkerbiten_badstulandsby','torshov','torshovparken'
];
const manifest=read('data/quiz/manifest.json');
const cards=read('data/quizcards/by/oslo_v1_historiske_fakta_20261024.json').cards;
test('eleven historical By fullquizzes have loadable set_id and exact QuizCard references',()=>{
 assert.equal(cards.length,ids.length);
 for(const id of ids){
  const file='data/quiz/by/'+id+'_oslo_v1_sets.json';
  const refs=manifest.sets.filter(x=>x.categoryId==='by'&&x.targetId===id&&x.file===file);
  assert.equal(refs.length,1,id+': precisely one canonical By manifest row');
  const quiz=read(file);
  assert.equal(quiz.targetId,id);
  assert.equal(quiz.sets.length,1);
  const set=quiz.sets[0];
  assert.equal(refs[0].set_id,set.set_id,id+': manifest must reference the quiz engine set_id');
  assert.equal(set.set_id,set.id,id+': persisted set_id must match question prefixes');
  assert.equal(refs[0].order,1);
  assert.equal(set.questions.length,10);
  const card=cards.find(x=>x.targetId===id);
  assert.ok(card,id+': missing QuizCard');
  assert.equal(card.questions.length,10);
  for(let i=0;i<10;i++){
   const q=set.questions[i],cq=card.questions[i];
   assert.equal(q.quiz_id,set.set_id+'_q'+(i+1));
   assert.equal(cq.sourceQuestionId,q.id);
   assert.equal(cq.sourceQuizId,q.quiz_id);
   assert.ok(q.options.includes(q.answer));
   assert.equal(q.answerIndex,q.options.indexOf(q.answer));
   assert.ok(q.knowledge_unit_ids.length>=1,id+': missing Knowledge');
   assert.ok(q.emne_id,id+': missing By emne');
  }
 }
});
