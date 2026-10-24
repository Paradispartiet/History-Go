import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const places = [
  { id:'arbeidersamfunnets_plass',cat:'politikk',source:'data/places/politikk/oslo/places_politikk/arbeidersamfunnets_plass.json',sets:3,quizFile:'data/quiz/politikk/arbeidersamfunnets_plass_sets.json',cards:'data/quizcards/politikk/arbeidersamfunnets_plass_quizkort_v1.json' },
  { id:'politihuset_gronland',cat:'politikk',source:'data/places/politikk/oslo/places_politikk/politihuset_gronland.json',sets:3,quizFile:'data/quiz/politikk/politihuset_gronland_sets.json',cards:'data/quizcards/politikk/politihuset_gronland_quizkort_v1.json' },
  { id:'statsministerboligen',cat:'politikk',source:'data/places/politikk/oslo/places_politikk/statsministerboligen.json',sets:3,quizFile:'data/quiz/politikk/statsministerboligen_sets.json',cards:'data/quizcards/politikk/statsministerboligen_quizkort_v1.json' },
  { id:'nobels_fredssenter',cat:'historie',source:'data/places/historie/oslo/places_historie/nobels_fredssenter.json',sets:3,quizFile:'data/quiz/historie/nobels_fredssenter_sets.json',cards:'data/quizcards/historie/nobels_fredssenter_quizkort_v1.json' },
  { id:'vikaterrassen',cat:'by',source:'data/places/by/oslo/places/vikaterrassen.json',sets:3,quizFile:'data/quiz/by/vikaterrassen_sets.json',cards:'data/quizcards/by/vikaterrassen_quizkort_v1.json' },
  { id:'eldorado_bokhandel',cat:'litteratur',source:'data/places/litteratur/oslo/places_litteratur/eldorado_bokhandel.json',sets:5,quizFile:'data/quiz/litteratur/eldorado_bokhandel_sets_merged.json',cards:'data/quizcards/litteratur/topp10_lit_kort_batch3.json' }
];
const manifest = read('data/quiz/manifest.json');
const registry = read('data/fagverk/fagverk_registry.json');

for (const spec of places) {
  test(spec.id+' canonical Place, fullquiz, QuizCard and Knowledge contracts', () => {
    const p=read(spec.source),runtime=read('data/runtime/place-open/'+spec.id+'.json');
    assert.equal(p.id,spec.id);
    assert.equal(runtime.place.id,spec.id);
    for(const key of ['desc','popupDesc','fagverk','image']) {
      assert.deepEqual(runtime.place[key],p[key],spec.id+' runtime missing '+key);
    }
    assert.ok(p.fagverk && p.fagverk.article && p.fagverk.emne_ids?.length, spec.id+' lacks a curated source-based Fagverk');
    assert.ok(registry.placeLinks?.[spec.id],spec.id+' has no Fagverk registry entry');
    assert.ok(p.image,'Missing location photograph');
    if(spec.id!=='eldorado_bokhandel') {
      assert.ok(p.imageMeta?.sourcePage && p.imageMeta?.license && p.imageMeta?.creator,'Missing visual source and license');
      assert.ok(p.frontImage && fs.statSync(p.frontImage).size>10000,'Separate real portrait missing');
      const h=fs.readFileSync(p.frontImage).subarray(0,12);
      assert.equal(h.subarray(0,4).toString('ascii'),'RIFF');
      assert.equal(h.subarray(8,12).toString('ascii'),'WEBP');
      assert.equal(runtime.place.frontImage,p.frontImage,'portrait missing from runtime');
    }
    const quiz=read(spec.quizFile),sets=quiz.sets,questions=sets.flatMap(set=>set.questions);
    assert.equal(sets.length,spec.sets,'Wrong number of sets');
    assert.ok(sets.every(s=>s.questions.length===7),'A set must have exactly seven questions');
    assert.equal(questions.length,7*spec.sets);
    assert.equal(new Set(questions.map(q=>q.id)).size,questions.length,'Duplicate question ID');
    const index=new Map(questions.map(q=>[q.id,q]));
    for(const q of questions) {
      assert.equal(q.targetId,spec.id,'Quiz targets wrong place');
      assert.equal(q.categoryId,spec.cat,'Category mismatch');
      assert.ok(typeof q.question==='string' && q.question.length>10 && !/place-filen|riktig svar er/i.test(q.question),'Low-quality or internal question');
      assert.ok(Array.isArray(q.options) && q.options.length>=3 && q.options.length<=4,'Bad options');
      assert.equal(new Set(q.options).size,q.options.length,'Repeated alternatives');
      assert.equal(q.options[q.answerIndex],q.answer,'Fasit mismatch');
      assert.ok(typeof q.knowledge==='string' && q.knowledge.length>=25,'Knowledge explanation missing');
      assert.ok(q.primary_knowledge_unit_id && q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id),'Unlinked Knowledge');
      assert.equal(q.knowledge_link_status,'linked');
      assert.ok(q.source?.length,'External source not declared');
      if(quiz.sources) for(const urlOrId of q.source) assert.ok(quiz.sources[urlOrId] || String(urlOrId).startsWith('https://'), 'Source ID unresolvable');
    }
    assert.ok(manifest.sets.some(x=>x.targetId===spec.id && x.file===spec.quizFile),'Fullquiz absent from active manifest');
    const collection=read(spec.cards);
    const selected=collection.cards.filter(c=>c.targetId===spec.id);
    assert.equal(selected.length,1,'Canonical QuizCard duplicated or absent');
    assert.equal(selected[0].questions.length,10,'Exactly 10 QuizCard questions required');
    for(const q of selected[0].questions) {
      const original=index.get(q.sourceQuestionId);
      assert.ok(original,'QuizCard lost source-question mapping');
      for(const key of ['question','answer','answerIndex','options']) assert.deepEqual(q[key],original[key],'QuizCard '+key+' parity');
      assert.equal(q.primary_knowledge_unit_id,original.primary_knowledge_unit_id,'QuizCard Knowledge link drift');
    }
    assert.ok(selected[0].answerKey.length===10,'QuizCard answer key missing');
  });
}
test('Five new quiz source briefs and production contexts load and require 14 normal opening questions', () => {
  for(const x of places.filter(z=>z.sets===3)) {
    const c=read('data/quiz/production_context/'+x.cat+'/'+x.id+'.json');
    const b=read('data/quiz/production_briefs/'+x.cat+'/'+x.id+'.json');
    assert.equal(c.targetId,x.id);
    assert.equal(b.targetId,x.id);
    assert.equal(c.set_plan.length,3);
    assert.deepEqual(c.set_plan.map(s=>s.planned_questions),[7,7,7]);
    assert.equal(c.claim_bank.length,21);
    assert.equal(b.claims.length,21);
    assert.ok(Object.keys(c.resolved_files).length>=7);
  }
});
test('Three politics places have a recorded, source-checked fourteen-question opening', () => {
  for(const x of places.filter(z=>z.cat==='politikk')) {
    const report=read('data/places/politikk-production/'+x.id+'.json');
    assert.equal(report.placeId,x.id);
    assert.equal(report.status,'ready');
    assert.equal(report.quizOpening.status,'PASS');
    assert.equal(report.quizOpening.firstTwoSetsQuestionCount,14);
    assert.equal(report.gates.F.status,'PASS');
  }
});
