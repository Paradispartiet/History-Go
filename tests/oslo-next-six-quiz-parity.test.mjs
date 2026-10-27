import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const scope={kontraskjaeret:'historie',palehaven_paleet:'historie',avisen_tiden_radhusgata_10:'historie',egertorget:'by',mustadgarden_kongens_gate_3:'historie',wessels_plass:'by'};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
for(const [id,category] of Object.entries(scope))test(`${id}: active quiz, source claims, Knowledge and ten fact-only QuizCards agree`,()=>{
 const file=`data/quiz/${category}/${id}_sets.json`;
 assert.ok(fs.existsSync(file),'Missing canonical fullquiz');
 const pack=read(file),questions=pack.sets.flatMap(s=>s.questions),brief=read(`data/quiz/production_briefs/${category}/${id}.json`);
 assert.equal(pack.targetId,id);assert.equal(questions.length,21);assert.deepEqual(pack.sets.map(s=>s.questions.length),[7,7,7]);
 assert.equal(new Set(questions.map(q=>q.id)).size,21);assert.equal(new Set(questions.map(q=>q.question)).size,21);
 const rows=read('data/quiz/manifest.json').sets.filter(e=>e.targetId===id);assert.equal(rows.length,3);assert.ok(rows.every(e=>e.file===file));
 const claims=new Map(brief.claims.map(c=>[c.claim_id,c]));
 const units=new Map(read('data/knowledge/knowledge_units.generated.json').units.map(u=>[u.knowledge_unit_id,u]));
 for(const [index,q] of questions.entries()){
  assert.equal(q.answer,q.options[q.answerIndex]);assert.equal(new Set(q.options).size,4);assert.ok(!/^\d{4}$/.test(q.answer));
  const claim=claims.get(q.claim_id);assert.ok(claim,q.id+' claim');assert.equal(q.claim_basis,claim.statement);assert.deepEqual(q.source,claim.source_ids);
  assert.ok(q.source.length&&q.source.every(s=>s.startsWith('https://')&&brief.sources[s]?.review_status==='reviewed'),q.id+' inspectable reviewed sources');
  assert.ok(q.knowledge_unit_ids?.length,q.id+' Knowledge');
  for(const ku of q.knowledge_unit_ids){const unit=units.get(ku);assert.ok(unit,q.id+' missing '+ku);assert.ok(unit.sources.some(s=>s.url?.startsWith('https://')),q.id+' Knowledge external provenance');}
  if(index<14){assert.ok(['fact','context','observation','comparison'].includes(q.question_type),q.id+' ordinary opening');assert.ok(!q.method_id&&!q.theory_ref&&!q.topic_hook_id,q.id+' no early theory');}
 }
 const cardFile=`${id}_quizkort_v1.json`,card=read(`data/quizcards/${category}/${cardFile}`).cards[0];
 assert.ok(read(`data/quizcards/${category}/manifest.json`).collections.includes(cardFile));assert.equal(card.targetId,id);assert.equal(card.questions.length,10);
 for(const c of card.questions){const q=questions.find(q=>q.id===c.sourceQuestionId);assert.ok(q);assert.equal(q.question_type,'fact');for(const key of ['question','options','answer','answerIndex','knowledge','knowledge_unit_ids'])assert.deepEqual(c[key],q[key],id+' card '+key);}
});
