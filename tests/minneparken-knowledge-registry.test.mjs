import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(path)=>JSON.parse(fs.readFileSync(path,'utf8'));
const ID='minneparken_gamlebyen';
const quizFile=`data/quiz/historie/${ID}_sets.json`;
const q=read(quizFile);
const card=read(`data/quizcards/historie/${ID}_quizcard_v1.json`);
const registry=read('data/knowledge/knowledge_units.generated.json');
const brief=read(`data/quiz/production_briefs/historie/${ID}.json`);
const history=read(`data/places/historie-production/${ID}.json`);
const qm=read('data/quiz/manifest.json');
const cm=read('data/quizcards/historie/manifest.json');
const sm=read('data/stories/stories_manifest.json');
const qs=q.sets.flatMap(s=>s.questions);
const byUnit=new Map(registry.units.map(unit=>[unit.knowledge_unit_id,unit]));
const sourceUrls=new Set(Object.values(brief.sources).map(s=>s.url));

test('21/21 reviewed Minneparken questions own real canonical Knowledge links and external source edges',()=>{
  assert.equal(qs.length,21);
  const unique=new Set();
  for(const question of qs){
    assert.equal(question.knowledge_link_status,'linked',question.quiz_id);
    assert.ok(question.knowledge_unit_ids?.includes(question.primary_knowledge_unit_id),question.quiz_id);
    assert.ok(question.source_urls?.length,question.quiz_id);
    for(const url of question.source_urls)assert.ok(sourceUrls.has(url),question.quiz_id);
    for(const id of question.knowledge_unit_ids){
      unique.add(id);
      const unit=byUnit.get(id);
      assert.ok(unit,`missing canonical KU ${id}`);
      assert.equal(unit.subject_id,'historie');
      assert.ok(unit.quiz_refs.includes(question.quiz_id),`missing KU reverse link ${id}`);
      assert.ok(['reviewed','canonical'].includes(unit.status),`unreviewed KU: ${id}`);
      const urls=new Set(unit.sources.map(source=>source.url).filter(Boolean));
      for(const url of question.source_urls)assert.ok(urls.has(url),`${id} / ${url}`);
      assert.ok(unit.emne_ids.includes(question.emne_id),`${id} lost explicit emne link`);
    }
  }
  assert.equal(unique.size,32);
});

test('QuizCard mirrors source Knowledge links, but only as an inactive candidate',()=>{
  assert.equal(card.cards[0].questions.length,10);
  assert.equal(card.production_status,'not_active_editorial_approval_pending');
  for(const question of card.cards[0].questions){
    const source=qs.find(q=>q.id===question.sourceQuestionId);
    assert.ok(source,question.id);
    for(const field of ['primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status','sources']){
      assert.deepEqual(question[field],source[field],`QuizCard ${question.id} diverged in ${field}`);
    }
  }
});

test('Knowledge pre-registration never approves the Historie physical, quiz or story gates',()=>{
  assert.equal(history.status,'blocked');
  for(const gate of ['F','G','H'])assert.equal(history.gates[gate].status,'N/A');
  assert.ok(!(qm.files||[]).includes(quizFile));
  assert.ok(!(qm.sets||[]).some(s=>s.targetId===ID||s.file===quizFile));
  assert.ok(!cm.collections.includes(`${ID}_quizcard_v1.json`));
  assert.ok(!sm.files.some(s=>s.path===`data/stories/stories_${ID}.json`));
});
