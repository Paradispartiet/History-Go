import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const get=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const qp='data/quiz/historie/bjoelsenfossen_sets.json';
const quiz=get(qp),archive=get('data/knowledge/preserved_quiz_sources/bjoelsenfossen_legacy_20261121.json');
const brief=get('data/quiz/production_briefs/historie/bjoelsenfossen.json');
const card=get('data/quizcards/historie/bjoelsenfossen_quizcard_v1.json');
const manifest=get('data/quiz/manifest.json');
const fag=get('data/fag/fag_manifest.json');
const questions=quiz.sets.flatMap(s=>s.questions);
const ledger=brief.existing_quiz_audit.legacy_id_knowledge_ledger;
test('Bjølsenfossen has one 4x7 runtime quiz, consistent brief, and canonical context',()=>{
 assert.equal(quiz.targetId,'bjoelsenfossen');assert.equal(quiz.categoryId,'historie');
 assert.equal(quiz.sets.length,4);assert.deepEqual(quiz.sets.map(s=>s.questions.length),[7,7,7,7]);
 assert.deepEqual(quiz.sets.map(s=>s.phase),['opening','middle','bridge','final']);
 assert.equal(questions.length,28);assert.equal(brief.claims.length,28);assert.equal(brief.proposed_questions.length,28);
 assert.equal(quiz.production_context.profile,'normal_4x7');
 assert.equal(manifest.sets.filter(x=>x.targetId==='bjoelsenfossen').length,4);
 assert.equal(fag.historie.quizProduction.targets.bjoelsenfossen.quiz_file,'../quiz/historie/bjoelsenfossen_sets.json');
 const context=get('data/quiz/production_context/historie/bjoelsenfossen.json');
 assert.equal(context.targetId,'bjoelsenfossen');assert.equal(context.profile,'normal_4x7');
 for(let i=0;i<28;i++){
  const q=questions[i],claim=brief.claims[i],proposal=brief.proposed_questions[i];
  assert.equal(q.claim_id,claim.claim_id);assert.equal(proposal.source_claim_id,q.claim_id);
  assert.equal(q.question,proposal.question);assert.equal(q.answer,proposal.answer);
  assert.equal(q.options.length,3);assert.equal(q.options[q.answerIndex],q.answer);
  assert.ok(q.knowledge);assert.ok(q.source_urls.length);
  assert.ok(q.source_urls.every(x=>x.startsWith('https://')));
  assert.equal(q.knowledge_link_status,'linked');
  assert.ok(q.knowledge_unit_ids.includes(q.primary_knowledge_unit_id));
  assert.ok(q.emne_id&&q.emne_ids.includes(q.emne_id));
  assert.equal(q.sources.length,q.source_urls.length);
 }
});
test('Five existing quiz and Knowledge IDs preserved, all 37 others archived, no ID conflicts',()=>{
 assert.equal(ledger.length,42);assert.equal(archive.questions.length,37);
 assert.equal(archive.status,'preserved_legacy_knowledge_only_not_playable');
 const origById=new Map(ledger.map(x=>[x.legacy_id,x]));
 const oldIds=new Set(ledger.map(x=>x.legacy_quiz_id));
 const activeIds=new Set(questions.map(x=>x.quiz_id));
 const archivedIds=new Set(archive.questions.map(x=>x.quiz_id));
 assert.equal(activeIds.size,28);assert.equal(archivedIds.size,37);
 assert.equal([...activeIds].filter(id=>oldIds.has(id)).length,5);
 assert.equal([...activeIds].filter(id=>!oldIds.has(id)).length,23);
 const keep=new Set(['bjoelsenfossen_s1_q1','bjoelsenfossen_s1_q4','bjoelsenfossen_s2_q1','bjoelsenfossen_s2_q3','bjoelsenfossen_s2_q5']);
 for(const q of questions.filter(x=>keep.has(x.id))){
  const old=origById.get(q.id);assert.ok(old);
  assert.equal(q.quiz_id,old.legacy_quiz_id);assert.equal(q.primary_knowledge_unit_id,old.legacy_primary_knowledge_unit_id);
  assert.deepEqual(q.knowledge_unit_ids,old.legacy_knowledge_unit_ids);
 }
 for(const q of archive.questions){
  const old=origById.get(q.id);assert.ok(old);
  assert.equal(q.quiz_id,old.legacy_quiz_id);
  assert.equal(q.primary_knowledge_unit_id,old.legacy_primary_knowledge_unit_id);
  assert.deepEqual(q.knowledge_unit_ids,old.legacy_knowledge_unit_ids);
  assert.ok(!activeIds.has(q.quiz_id));
 }
});
test('QuizCard is source exact and all historical Knowledge reverse references survive',()=>{
 assert.ok(get('data/quizcards/historie/manifest.json').collections.includes('bjoelsenfossen_quizcard_v1.json'));
 const picked=card.cards[0].questions;
 assert.equal(card.cards[0].targetId,'bjoelsenfossen');assert.equal(picked.length,10);
 const byId=new Map(questions.map(q=>[q.id,q]));
 for(const q of picked){const source=byId.get(q.sourceQuestionId);assert.ok(source);
  assert.equal(q.sourceQuizId,source.quiz_id);assert.equal(q.answer,source.answer);
  assert.deepEqual(q.options,source.options);
  assert.deepEqual(q.knowledge_unit_ids,source.knowledge_unit_ids);
  assert.equal(q.sourceQuizFile,qp);
 }
 const registry=get('data/knowledge/knowledge_units.generated.json');
 const units=new Map(registry.units.map(u=>[u.knowledge_unit_id,u]));
 for(const q of [...questions,...archive.questions])for(const id of q.knowledge_unit_ids){
  const u=units.get(id);assert.ok(u,'Missing Knowledge ID '+id);
  assert.ok(u.quiz_refs.includes(q.quiz_id),'Lost Knowledge owner '+id+' / '+q.quiz_id);
 }
});
