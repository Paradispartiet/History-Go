import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read = p => JSON.parse(readFileSync(p, 'utf8'));
const specs = [
  {id:'vettakollen', place:'data/places/natur/oslo/places_natur/vettakollen.json',quiz:'data/quiz/natur/vettakollen_sets.json',card:'data/quizcards/natur/topp10_natur_vettakollen_20261021.json',manifest:'data/quizcards/natur/manifest.json',count:21,fag:4},
  {id:'universitetsplassen',place:'data/places/by/oslo/places/universitetsplassen.json',quiz:'data/quiz/by/universitetsplassen_sets.json',card:'data/quizcards/by/topp10_by_kort_batch5.json',manifest:'data/quizcards/by/manifest.json',count:56,fag:3}
];

for (const s of specs) {
  test(s.id+' existing source and QuizCard Knowledge parity', () => {
    const place=read(s.place),full=read(s.quiz).sets.flatMap(x=>x.questions),docs=read(s.card);
    assert.equal(place.id,s.id);
    assert.ok(place.image);
    assert.equal(place.fagverk.article.length,s.fag);
    assert.equal(full.length,s.count);
    const cards=docs.cards.filter(c=>c.targetId===s.id);
    assert.equal(cards.length,1);
    assert.ok(read(s.manifest).collections.includes(s.card.split('/').pop()));
    const card=cards[0],byId=new Map(full.map(q=>[q.id,q]));
    assert.equal(card.questionCount,10);
    assert.equal(card.questions.length,10);
    assert.equal(card.answerKey.length,10);
    assert.equal(card.sourceFile,s.quiz);
    assert.equal(new Set(card.questions.map(q=>q.sourceQuestionId)).size,10);
    card.questions.forEach((q,i)=>{
      const source=byId.get(q.sourceQuestionId);
      assert.ok(source, q.sourceQuestionId);
      assert.equal(q.number,i+1);
      assert.equal(q.sourceQuizId,source.quiz_id);
      assert.equal(q.sourceQuizFile,s.quiz);
      assert.equal(q.question,source.question);
      assert.deepEqual(q.options,source.options);
      assert.equal(q.answer,source.answer);
      assert.equal(q.answerIndex,source.answerIndex);
      assert.equal(q.primary_knowledge_unit_id,source.primary_knowledge_unit_id);
      assert.deepEqual(q.knowledge_unit_ids,source.knowledge_unit_ids);
      assert.equal(q.knowledge_link_status,'linked');
      assert.deepEqual(card.answerKey[i],{number:i+1,answer:source.answer,answerIndex:source.answerIndex});
    });
  });
}
