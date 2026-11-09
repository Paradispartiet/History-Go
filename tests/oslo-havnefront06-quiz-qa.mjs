#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const plans=[['kunst','astrup_fearnley'],['naeringsliv','amerikalinjen'],['natur','akerselva_utlop_bjorvika']];
const manifest=read('data/quiz/manifest.json');
const actualQuizIds=new Set();
const unitIndex=read('data/knowledge/knowledge_units.generated.json');
const knowledgeUnits=new Set((unitIndex.units||[]).map(x=>x.knowledge_unit_id));
for(const [category,id] of plans){
 const quizPath='data/quiz/'+category+'/'+id+'_oslo06_sets.json';
 const cardPath='data/quizcards/'+category+'/'+id+'_quizcard_v1.json';
 test(id+' has exactly 3x7 active question sets, 21 unique sourced claims and correct phases',()=>{
   const doc=read(quizPath),brief=read('data/quiz/production_briefs/'+category+'/'+id+'.json');
   assert.equal(doc.categoryId,category);assert.equal(doc.targetId,id);
   assert.deepEqual(doc.sets.map(s=>s.questions.length),[7,7,7]);
   assert.deepEqual(doc.sets.map(s=>s.phase),['opening','bridge','final']);
   assert.deepEqual(doc.sets.map(s=>s.set_id),[1,2,3].map(n=>category+'_'+id+'_set_'+n));
   assert.equal(brief.claims.length,21);
   const flat=doc.sets.flatMap(s=>s.questions);
   assert.equal(new Set(flat.map(q=>q.claim_id)).size,21);
   for(const [i,q] of flat.entries()){
      const c=brief.claims[i];
      assert.equal(q.claim_id,c.claim_id);
      assert.equal(q.claim_basis,c.statement);
      assert.equal(q.knowledge,c.statement);
      assert.deepEqual(q.source,c.source_ids);
      assert.deepEqual(q.source_urls,c.source_ids.map(key=>brief.sources[key].url));
      assert.equal(q.answer,q.options[q.answerIndex]);
      assert.equal(q.options.length,3);
      assert.equal(new Set(q.options).size,3);
      assert.ok(q.primary_knowledge_unit_id?.startsWith('ku_'+category+'_'),q.quiz_id+' unlinked canonical KU');
      assert.ok(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id),q.quiz_id+' missing KU array');
      assert.equal(q.knowledge_link_status,'linked');
      assert.ok(knowledgeUnits.has(q.primary_knowledge_unit_id),q.quiz_id+' KU not indexed');
      assert.ok(!actualQuizIds.has(q.quiz_id),'duplicate quiz id '+q.quiz_id);
      actualQuizIds.add(q.quiz_id);
   }
 });
 test(id+' has matching one-surface QuizCard questions and manifest resolution',()=>{
   const doc=read(quizPath),card=read(cardPath).cards[0],brief=read('data/quiz/production_briefs/'+category+'/'+id+'.json');
   const flat=doc.sets.flatMap(s=>s.questions);
   assert.equal(card.targetId,id);assert.equal(card.categoryId,category);
   assert.equal(card.format,'single_surface_top10_with_answer_key');
   assert.equal(card.questionCount,10);assert.equal(card.questions.length,10);
   for(const [i,q] of card.questions.entries()){
      const source=flat[brief.quizCard_candidate_source_question_numbers[i]-1];
      for(const field of ['id','quiz_id','question','answer','answerIndex','knowledge','primary_knowledge_unit_id'])assert.deepEqual(q[field],source[field],id+' '+field+' mismatch at '+i);
      assert.deepEqual(q.options,source.options);
      assert.deepEqual(q.knowledge_unit_ids,source.knowledge_unit_ids);
      assert.equal(q.sourceQuizFile,quizPath);
   }
   const qEntries=manifest.sets.filter(x=>x.targetId===id);
   assert.equal(qEntries.length,3);
   assert.deepEqual(qEntries.map(x=>x.file),[quizPath,quizPath,quizPath]);
   const cardManifest=read('data/quizcards/'+category+'/manifest.json');
   assert.equal(cardManifest.collections.filter(x=>x===id+'_quizcard_v1.json').length,1);
 });
}
test('all original harborfront quiz sets are retained unchanged',()=>{
 const counts={aker_brygge:8,akershus_kaier:5,akrobaten_gangbro:1};
 for(const [id,count] of Object.entries(counts))assert.equal(manifest.sets.filter(e=>e.targetId===id).length,count,id);
});
