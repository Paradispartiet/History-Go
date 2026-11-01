import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const rock=read('data/quiz/musikk/rockefeller_sets_merged.json').sets.flatMap(s=>s.questions);
const sen=read('data/quiz/musikk/sentrum_scene_sets_merged.json').sets.flatMap(s=>s.questions);
const card=read('data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json').cards.find(x=>x.targetId==='rockefeller');
const units=new Map(read('data/knowledge/knowledge_units.generated.json').units.map(x=>[x.knowledge_unit_id,x]));
const match=id=>[...rock,...sen].find(q=>q.id===id);
test('No internal Knowledge prose in the reviewed Rockefeller questions',()=>{
 assert.equal(rock.length,30);assert.equal(card.questions.length,10);
 for(const id of ['rockefeller_quiz_3','rockefeller_quiz_28','rockefeller_quiz_29','sentrum_scene_quiz_27']){
  const q=match(id);assert.ok(q);assert.doesNotMatch(q.knowledge,/place-filen|place-filene|kontrasttarget/i);
  const claims=q.knowledge.match(/[^.!?]+[.!?]/g).map(x=>x.trim());
  assert.equal(claims.length,q.knowledge_unit_ids.length,id);
  q.knowledge_unit_ids.forEach((unitId,i)=>assert.equal(units.get(unitId)?.canonical_claim,claims[i],unitId));
 }
 assert.equal(match('rockefeller_quiz_28').knowledge_unit_ids[0],match('sentrum_scene_quiz_27').knowledge_unit_ids[0]);
});
test('Rockefeller QuizCard retains parity with fullquiz source',()=>{
 const questions=new Map(rock.map(q=>[q.id,q]));
 for(const row of card.questions)for(const key of ['question','answer','knowledge','options','answerIndex'])assert.deepEqual(row[key],questions.get(row.sourceQuestionId)[key]);
});
