import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const quiz=read('data/quiz/musikk/rockefeller_sets_merged.json').sets.flatMap(s=>s.questions);
const card=read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json').cards.find(c=>c.targetId==='rockefeller');
const byId=new Map(quiz.map(q=>[q.id,q]));
test('Rockefeller 30 source-backed questions have correct answer and no internal prose',()=>{
 assert.equal(quiz.length,30);assert.equal(new Set(quiz.map(q=>q.id)).size,30);
 for(const q of quiz){assert.equal(q.options[q.answerIndex],q.answer,q.id);assert.ok(q.source.some(x=>x.startsWith('https://')),q.id);assert.ok(q.primary_knowledge_unit_id,q.id);assert.equal(q.knowledge_link_status,'linked',q.id);assert.doesNotMatch(q.question+' '+q.knowledge,/flatquiz|place-fil|kontrasttarget|samlet analyse|musikkfaglig lesning/i,q.id);}
 assert.equal(byId.get('rockefeller_quiz_3').answer,'Mariboes gate 5B');
 assert.equal(byId.get('rockefeller_quiz_4').answer,'1 300 publikummere');
 assert.equal(byId.get('rockefeller_quiz_26').answer,'500 publikummere');
});
test('Rockefeller QuizCard ten questions match source exactly',()=>{
 assert.equal(card.questions.length,10);
 for(const [i,cq] of card.questions.entries()){const q=byId.get(cq.sourceQuestionId);assert.ok(q,cq.sourceQuestionId);for(const key of ['question','options','answer','answerIndex','knowledge'])assert.deepEqual(cq[key],q[key],key);assert.equal(card.answerKey[i].answer,q.answer);}
});
