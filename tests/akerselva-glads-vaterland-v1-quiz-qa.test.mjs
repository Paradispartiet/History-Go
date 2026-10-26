import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const manifest=read("data/quiz/manifest.json");
const cards=read("data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json").cards;
for(const [id,file] of [["glads_molle","data/quiz/historie/glads_molle_sets.json"],["vaterland_historisk_elvelop","data/quiz/by/vaterland_historisk_elvelop_sets.json"]]){
  test(id+": 3x7 fullquiz, factual sources and unchanged QuizCard parity",()=>{
    const data=read(file);
    assert.deepEqual(data.sets.map(s=>s.questions.length),[7,7,7]);
    const ids=data.sets.flatMap(s=>s.questions);
    assert.equal(new Set(ids.map(q=>q.id)).size,21);
    assert.deepEqual(manifest.sets.filter(s=>s.targetId===id).map(s=>s.set_id),data.sets.map(s=>s.set_id));
    for(const q of ids){
      assert.equal(q.answer,q.options[q.answerIndex],q.id);
      assert.ok(q.source?.length>0,q.id+" source missing");
      assert.ok(q.knowledge?.trim(),q.id+" explanation missing");
      assert.ok(q.primary_knowledge_unit_id,q.id+" Knowledge ID missing");
    }
    const lookup=new Map(ids.map(q=>[q.id,q]));
    const card=cards.find(c=>c.targetId===id);
    assert.equal(card?.questions.length,10);
    for(const q of card.questions){
      const linked=lookup.get(q.sourceQuestionId);
      assert.ok(linked,q.sourceQuestionId);
      for(const field of ["question","answer","options","answerIndex"])assert.deepEqual(q[field],linked[field],q.sourceQuestionId+" "+field);
    }
  });
}
