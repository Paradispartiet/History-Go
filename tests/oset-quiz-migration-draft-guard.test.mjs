import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const quizPath='data/quiz/historie/frysjadammen_sets.json';
const brief=read('data/quiz/production_briefs/historie/frysjadammen.json');
const quiz=read(quizPath);
const archived=read('data/knowledge/preserved_quiz_sources/frysjadammen_oset_legacy_20261117.json');
const manifest=read('data/quiz/manifest.json');
const fag=read('data/fag/fag_manifest.json');
const questions=quiz.sets.flatMap(x=>x.questions);

test('Oset has exactly one active four-set quiz with normal first two sets',()=>{
 assert.equal(brief.status,'reviewed');
 assert.equal(quiz.categoryId,'historie');assert.equal(quiz.targetId,'frysjadammen');
 assert.equal(quiz.sets.length,4);assert.equal(questions.length,28);
 assert.deepEqual(quiz.sets.map(s=>s.questions.length),[7,7,7,7]);
 assert.deepEqual(quiz.sets.map(s=>s.phase),['opening','middle','bridge','final']);
 assert.equal(quiz.production_context.profile,'normal_4x7');
 const sets=manifest.sets.filter(x=>x.targetId==='frysjadammen');
 assert.equal(sets.length,4);
 assert.ok(sets.every(x=>x.file===quizPath));
 assert.equal(fag.historie.quizProduction.targets.frysjadammen.quiz_file,'../quiz/historie/frysjadammen_sets.json');
 for(const q of questions.slice(0,14)){
  assert.ok(q.question&&q.options.length>=3&&q.options[q.answerIndex]===q.answer);
  assert.ok(!q.method_id&&!q.topic_hook_id&&!q.theory_ref,'opening must be normal');
  assert.ok(['fact','context','analysis','comparison'].includes(q.question_type));
 }
});
test('10 exact earned Quiz/Knowledge IDs continue; 32 legacy claims stay non-playable',()=>{
 const ledger=brief.existing_quiz_audit.legacy_id_knowledge_ledger;
 assert.equal(ledger.length,42);assert.equal(archived.questions.length,32);
 assert.equal(archived.status,'preserved_legacy_knowledge_only_not_playable');
 const active=new Set(questions.map(q=>q.quiz_id));
 const archiveRefs=new Set(archived.questions.map(q=>q.quiz_id));
 assert.equal(active.size,28);assert.equal(archiveRefs.size,32);
 for(let i=0;i<10;i++){
  const q=questions[i],legacy=ledger[i];
  assert.equal(q.id,legacy.legacy_id);
  assert.equal(q.quiz_id,legacy.legacy_quiz_id);
  assert.equal(q.primary_knowledge_unit_id,legacy.legacy_primary_knowledge_unit_id);
  assert.deepEqual(q.knowledge_unit_ids,legacy.legacy_knowledge_unit_ids);
 }
 for(let i=10;i<42;i++){
  const q=archived.questions[i-10],legacy=ledger[i];
  assert.equal(q.id,legacy.legacy_id);
  assert.equal(q.quiz_id,legacy.legacy_quiz_id);
  assert.equal(q.primary_knowledge_unit_id,legacy.legacy_primary_knowledge_unit_id);
  assert.deepEqual(q.knowledge_unit_ids,legacy.legacy_knowledge_unit_ids);
  assert.ok(!active.has(q.quiz_id),'archived not live');
 }
 for(const q of questions.slice(10))assert.ok(!new Set(ledger.map(x=>x.legacy_quiz_id)).has(q.quiz_id),'fresh quiz ID');
});
test('28 source claims, answers, and canonical Knowledge links are consistent',()=>{
 assert.equal(brief.claims.length,28);
 assert.equal(brief.proposed_questions.length,28);
 const claimIds=new Set();
 const registry=read('data/knowledge/knowledge_units.generated.json');
 const byKU=new Map(registry.units.map(x=>[x.knowledge_unit_id,x]));
 const legacyUnits=new Set(brief.existing_quiz_audit.legacy_id_knowledge_ledger.map(x=>x.legacy_primary_knowledge_unit_id));
 const allRefs=[...questions,...archived.questions];
 for(const entry of allRefs)for(const id of entry.knowledge_unit_ids){
  const unit=byKU.get(id);
  assert.ok(unit,'missing historical/new Knowledge '+id);
  assert.ok(unit.quiz_refs.includes(entry.quiz_id),'Knowledge reverse ref '+id);
 }
 for(let i=0;i<28;i++){
  const q=questions[i],claim=brief.claims[i],d=brief.proposed_questions[i];
  assert.ok(!claimIds.has(claim.claim_id));claimIds.add(claim.claim_id);
  assert.equal(claim.order,i+1);
  assert.equal(q.claim_id,claim.claim_id);
  assert.equal(q.claim_basis,claim.statement);
  assert.deepEqual(q.source,claim.source_ids);
  assert.deepEqual(q.source_urls,claim.source_ids.map(id=>brief.sources[id].url));
  assert.equal(q.answer,q.options[q.answerIndex]);
  assert.equal(q.knowledge,d.knowledge);
  assert.equal(q.knowledge_link_status,'linked');
  assert.ok(q.primary_knowledge_unit_id&&q.knowledge_unit_ids.includes(q.primary_knowledge_unit_id));
  assert.ok(q.sources.every(s=>s.url.startsWith('https://')&&s.review_status==='reviewed'));
  if(i>=10)assert.ok(!legacyUnits.has(q.primary_knowledge_unit_id),'new claim must not overwrite earned KU');
 }
});
test('live QuizCard has exactly 10 copied answers and Knowledge IDs',()=>{
 const card=read('data/quizcards/historie/oset_slusebru_quizcard_v1.json');
 const cm=read('data/quizcards/historie/manifest.json');
 assert.ok(cm.collections.includes('oset_slusebru_quizcard_v1.json'));
 assert.equal(card.cards.length,1);assert.equal(card.cards[0].questions.length,10);
 const byId=new Map(questions.map(q=>[q.id,q]));
 for(const item of card.cards[0].questions){
  const q=byId.get(item.sourceQuestionId);
  assert.ok(q);assert.equal(item.sourceQuizId,q.quiz_id);
  assert.deepEqual(item.options,q.options);
  assert.equal(item.answer,q.answer);
  assert.deepEqual(item.knowledge_unit_ids,q.knowledge_unit_ids);
  assert.equal(item.primary_knowledge_unit_id,q.primary_knowledge_unit_id);
 }
});
