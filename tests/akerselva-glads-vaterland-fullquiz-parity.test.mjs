import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const manifest=read("data/quiz/manifest.json");
const cards=read("data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json").cards;
for(const [id,p] of [["glads_molle","data/quiz/historie/glads_molle_sets.json"],["vaterland_historisk_elvelop","data/quiz/by/vaterland_historisk_elvelop_sets.json"]]){
  test(id+": narrow fullquiz, original QuizCard and canonical Knowledge parity",()=>{
    const doc=read(p),card=cards.find(x=>x.targetId===id);
    assert.equal(doc.targetId,id);
    assert.deepEqual(doc.sets.map(s=>s.questions.length),[7,7,7]);
    assert.deepEqual(doc.sets.map(s=>s.order),[1,2,3]);
    assert.deepEqual(manifest.sets.filter(x=>x.targetId===id).map(x=>x.set_id),doc.sets.map(s=>s.set_id));
    assert.ok(card&&card.questions.length===10);
    const quiz=doc.sets.flatMap(s=>s.questions),byId=new Map(quiz.map(q=>[q.id,q]));
    assert.equal(byId.size,21);
    for(const q of quiz){
      assert.equal(q.answer,q.options[q.answerIndex],q.id);
      assert.ok(q.source?.length&&q.knowledge?.length,q.id);
      assert.ok(q.primary_knowledge_unit_id&&q.knowledge_unit_ids?.length,q.id);
    }
    for(const c of card.questions){
      const q=byId.get(c.sourceQuestionId);
      assert.ok(q,"QuizCard source must exist: "+c.sourceQuestionId);
      for(const field of ["question","options","answer","answerIndex"]){
        assert.deepEqual(c[field],q[field],c.sourceQuestionId+" "+field);
      }
    }
  });
}
