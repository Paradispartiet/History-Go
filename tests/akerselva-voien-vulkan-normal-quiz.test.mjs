import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const manifest=read("data/quiz/manifest.json");
const cards=read("data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json").cards;
for(const id of ["voienfossen","vulkan_industriomrade"]){
  test(id+": normal 4×7 quiz and 10 stable QuizCard questions",()=>{
    const quiz=read("data/quiz/historie/"+id+"_sets.json");
    assert.equal(quiz.targetId,id);
    assert.deepEqual(quiz.sets.map(s=>s.questions.length),[7,7,7,7]);
    assert.deepEqual(quiz.sets.map(s=>s.order),[1,2,3,4]);
    const entries=manifest.sets.filter(s=>s.targetId===id);
    assert.deepEqual(entries.map(s=>s.set_id),quiz.sets.map(s=>s.set_id));
    assert.deepEqual(entries.map(s=>s.order),[1,2,3,4]);
    const qs=quiz.sets.flatMap(s=>s.questions);
    const lookup=new Map(qs.map(q=>[q.id,q]));
    assert.equal(lookup.size,28);
    for(const q of qs){
      assert.equal(q.options[q.answerIndex],q.answer,q.id);
      assert.ok(q.source?.length,q.id+" missing source");
      assert.ok(q.knowledge?.length,q.id+" missing explanation");
      assert.ok(q.knowledge_unit_ids?.length,q.id+" missing Knowledge link");
      assert.ok(q.primary_knowledge_unit_id,q.id+" missing Knowledge primary");
    }
    const card=cards.find(c=>c.targetId===id);
    assert.ok(card,id);
    assert.equal(card.questions.length,10);
    for(const cq of card.questions){
      const source=lookup.get(cq.sourceQuestionId);
      assert.ok(source,cq.sourceQuestionId+" missing from fullquiz");
      for(const field of ["question","answer","options","answerIndex"])assert.deepEqual(cq[field],source[field],cq.sourceQuestionId+" "+field);
    }
  });
}
