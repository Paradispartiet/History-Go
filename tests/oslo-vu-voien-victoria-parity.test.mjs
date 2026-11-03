import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = p => JSON.parse(readFileSync(p, 'utf8'));

const places = [
  {id:'voienfossen', name:'Vøyenfallene', place:'data/places/natur/oslo/places_oslo_natur_akerselvarute/voienfossen.json',quiz:'data/quiz/historie/voienfossen_sets.json',card:'data/quizcards/historie/voienfossen_quizcard_v1.json',manifest:'data/quizcards/historie/manifest.json',count:28,fag:5},
  {id:'victoria_terrasse', name:'Victoria terrasse', place:'data/places/politikk/oslo/places_politikk/victoria_terrasse.json',quiz:'data/quiz/politikk/victoria_terrasse_sets.json',card:'data/quizcards/politikk/topp10_politikk_oslo_sentrum_six_pr6579.json',manifest:'data/quizcards/politikk/manifest.json',count:21,fag:5}
];
for (const spec of places) {
  test(spec.name + ': existing Place, images, articles and fullquiz', () => {
    const p = read(spec.place), q = read(spec.quiz).sets.flatMap(s=>s.questions);
    assert.equal(p.id, spec.id);
    assert.ok(p.image);
    assert.equal(p.fagverk.article.length, spec.fag);
    assert.equal(q.length, spec.count);
    assert.equal(new Set(q.map(x=>x.id)).size, spec.count);
  });
  test(spec.name + ': quizcard uses ten exact, linked source questions', () => {
    const quiz = read(spec.quiz).sets.flatMap(s=>s.questions);
    const qmap = new Map(quiz.map(q=>[q.id,q]));
    const all = read(spec.card).cards;
    const cards = all.filter(c=>c.targetId===spec.id);
    assert.ok(read(spec.manifest).collections.includes(spec.card.split('/').pop()));
    assert.equal(cards.length, 1, 'single registered canonical card');
    const card=cards[0];
    assert.equal(card.questionCount, 10);
    assert.equal(card.questions.length, 10);
    assert.equal(card.answerKey.length, 10);
    assert.equal(card.sourceFile,spec.quiz);
    assert.equal(new Set(card.questions.map(q=>q.sourceQuestionId)).size,10);
    card.questions.forEach((q,i)=>{
      const source = qmap.get(q.sourceQuestionId);
      assert.ok(source, q.sourceQuestionId);
      assert.equal(q.sourceQuizId,source.quiz_id);
      assert.equal(q.sourceQuizFile,spec.quiz);
      assert.equal(q.question,source.question);
      assert.deepEqual(q.options,source.options);
      assert.equal(q.answer,source.answer);
      assert.equal(q.answerIndex,source.answerIndex);
      assert.equal(q.primary_knowledge_unit_id,source.primary_knowledge_unit_id);
      assert.deepEqual(q.knowledge_unit_ids,source.knowledge_unit_ids);
      assert.equal(q.knowledge_link_status,'linked');
      assert.deepEqual(card.answerKey[i],{number:i+1,answer:source.answer});
    });
  });
}
