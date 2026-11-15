#!/usr/bin/env node
// Mirror validated canonical Knowledge links into a NOT-PLAYABLE QuizCard.
// Never activate either runtime quiz manifest or change Historie release gates.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ID='minneparken_gamlebyen';
const quizFile=`data/quiz/historie/${ID}_sets.json`;
const cardFile=`data/quizcards/historie/${ID}_quizcard_v1.json`;
const load=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));
const quiz=load(quizFile),card=load(cardFile);
const registry=load('data/knowledge/knowledge_units.generated.json');
const history=load(`data/places/historie-production/${ID}.json`);
const qm=load('data/quiz/manifest.json'),cm=load('data/quizcards/historie/manifest.json');
assert.equal(history.status,'blocked');
assert.equal(history.gates.G.status,'N/A');
assert.ok(!(qm.files||[]).includes(quizFile));
assert.ok(!(qm.sets||[]).some(s=>s.targetId===ID||s.file===quizFile));
assert.ok(!cm.collections.includes(`${ID}_quizcard_v1.json`));
const full=quiz.sets.flatMap(s=>s.questions);
assert.equal(full.length,21);
assert.equal(card.cards.length,1);
assert.equal(card.cards[0].questions.length,10);
const byId=new Map(full.map(q=>[q.id,q]));
const byUnit=new Map(registry.units.map(u=>[u.knowledge_unit_id,u]));
const unique=new Set();
for(const q of full){
  assert.equal(q.knowledge_link_status,'linked',q.id);
  assert.ok(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id),q.id);
  for(const id of q.knowledge_unit_ids){
    unique.add(id);
    const unit=byUnit.get(id);
    assert.ok(unit,`${q.id} missing canonical ${id}`);
    assert.equal(unit.subject_id,'historie');
    assert.ok(unit.quiz_refs.includes(q.quiz_id),`${q.id} missing back-reference for ${id}`);
    assert.ok(['reviewed','canonical'].includes(unit.status),id);
    const urls=new Set(unit.sources.map(s=>s.url).filter(Boolean));
    for(const url of q.source_urls)assert.ok(urls.has(url),`${id} missing ${url}`);
  }
}
assert.equal(unique.size,32,'Expected 32 unique source-linked historical Knowledge claims');
const fields=['primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status','knowledge_contract_version'];
for(const c of card.cards[0].questions){
  const source=byId.get(c.sourceQuestionId);
  assert.ok(source,c.sourceQuestionId);
  for(const field of fields)c[field]=JSON.parse(JSON.stringify(source[field]));
  assert.deepEqual(c.sources,source.sources,'Sources must remain identical');
  assert.deepEqual(c.options,source.options,'Answers must remain identical');
  assert.equal(c.answer,source.answer);
}
card.production_status='not_active_editorial_approval_pending';
const old=fs.readFileSync(cardFile,'utf8');
const next=JSON.stringify(card,null,2)+'\n';
if(old!==next)fs.writeFileSync(cardFile,next);
console.log('PASS Minneparken QuizCard: 10 mirrored questions, 21 linked source questions, 32 real canonical units; playable manifests remain untouched.');
