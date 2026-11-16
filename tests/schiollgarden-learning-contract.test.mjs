import assert from 'node:assert/strict';
import fs from 'node:fs';
const id='schiollgarden_prinsens_gate_26';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const quiz=read(`data/quiz/by/${id}_sets.json`), brief=read(`data/quiz/production_briefs/by/${id}.json`);
const card=read(`data/quizcards/by/${id}_quizcard_v1.json`).cards[0];
const full=quiz.sets.flatMap(s=>s.questions), byId=new Map(full.map(q=>[q.id,q]));
assert.equal(quiz.sets.length,3);assert.ok(quiz.sets.every(s=>s.questions.length===7));
assert.equal(new Set(full.map(q=>q.question)).size,21);
assert.deepEqual([0,1,2].map(i=>full.filter(q=>q.answerIndex===i).length),[7,7,7]);
assert.ok(full.slice(0,14).every(q=>!q.method_id&&!q.theory_ref&&!q.topic_hook_id));
assert.equal(card.questions.length,10);assert.equal(card.answerKey.length,10);
assert.ok(read('data/quizcards/by/manifest.json').collections.includes(`${id}_quizcard_v1.json`));
const units=new Map(read('data/knowledge/knowledge_units.generated.json').units.map(u=>[u.knowledge_unit_id,u]));
const uniqueUnits=new Set();
for(const q of full){
 assert.equal(q.answer,q.options[q.answerIndex]);
 assert.equal(q.knowledge_link_status,'linked',q.id);
 assert.ok(q.knowledge_unit_ids.includes(q.primary_knowledge_unit_id));
 const claim=brief.claims.find(c=>c.claim_id===q.claim_id);
 assert.equal(q.claim_basis,claim.statement);assert.deepEqual(q.source,claim.source_ids);
 for(const ku of q.knowledge_unit_ids){
  uniqueUnits.add(ku);const u=units.get(ku);assert.ok(u,ku);assert.ok(u.quiz_refs.includes(q.quiz_id),ku);
  const urls=new Set(u.sources.map(s=>s.url).filter(Boolean));
  for(const url of q.source_urls)assert.ok(urls.has(url),`${ku} missing inspectable source ${url}`);
 }
}
for(const c of card.questions){
 const q=byId.get(c.sourceQuestionId);assert.ok(q,c.sourceQuestionId);assert.equal(q.question_type,'fact');
 for(const k of ['question','options','answer','answerIndex','knowledge','primary_knowledge_unit_id','knowledge_unit_ids','source_urls'])assert.deepEqual(c[k],q[k],`${c.sourceQuestionId} ${k}`);
 assert.equal(card.answerKey[c.number-1].answer,q.answer);
}
console.log(JSON.stringify({place:id,questions:full.length,cardQuestions:card.questions.length,uniqueKnowledgeUnits:uniqueUnits.size,status:'passed'}));
