import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const groups = [
  {region:'vestfold', file:'regional_bolk05_vestfold_v1_20261026.json', ids:['larvik_stasjon_vestfoldbanen','sandefjord_stasjon_vestfoldbanen']},
  {region:'telemark', file:'regional_bolk05_telemark_part1_v1_20261026.json', ids:['bo_stasjon_sorlandsbanen','df_ammonia_mael']}
];
const directYear = q => /^(?:når|hvilket år|i hvilket år|fra hvilket år)\\b/i.test(q.question);

test('By05 first four places retain source-backed Fagverk and licensed images', () => {
  for (const {region, ids} of groups) for (const id of ids) {
    const p = read(`data/places/by/${region}/${id}/${id}.json`);
    assert.equal(p.id, id);
    assert.equal(p.category, 'by');
    assert.equal(p.fagverk?.status, 'curated', id);
    assert.equal(p.fagverk?.article?.length, 3, id);
    assert.equal(p.fagverk?.lenses?.length, 3, id);
    assert.ok(p.fagverk?.source_urls?.length >= 2, id);
    assert.ok(p.fagverk.source_urls.every(s=>s.startsWith('https://')), id);
    assert.ok(p.image?.startsWith('https://commons.wikimedia.org/wiki/Special:Redirect/file/'), id);
    assert.equal(p.cardImage, p.image, id);
    for (const key of ['imageCredit','imageSourceUrl','imageLicense','imageLicenseUrl','imageCaption']) assert.ok(p[key], id+':'+key);
  }
});

test('By05 initial quizzes and QuizCards have exact parity, real sources, year cap and no fake Knowledge links', () => {
  let count = 0;
  for (const {file, ids} of groups) {
    const collection = read('data/quizcards/by/'+file);
    assert.equal(collection.cards.length, ids.length);
    for (const id of ids) {
      const quiz = read(`data/quiz/by/${id}_regional_v1_sets.json`);
      const questions = quiz.sets.flatMap(s => s.questions);
      const card = collection.cards.find(c => c.targetId === id);
      assert.ok(card, id);
      assert.equal(questions.length, 10, id);
      assert.equal(card.questionCount, 10, id);
      assert.equal(card.questions.length, 10, id);
      assert.ok(questions.filter(directYear).length <= 2, id);
      const unique = new Set();
      for (let i=0; i<10; i++) {
        const q=questions[i],cq=card.questions[i];
        assert.ok(!unique.has(q.id), q.id);
        unique.add(q.id);
        assert.equal(q.targetId, id);
        assert.equal(q.options[q.answerIndex], q.answer, q.id);
        assert.ok(q.source_urls?.length && q.source_urls.every(s=>s.startsWith('https://')), q.id);
        assert.ok(q.knowledge && q.explanation, q.id);
        assert.equal(q.knowledge_link_status, 'pending', q.id);
        assert.equal(cq.quiz_id, q.quiz_id, q.id);
        assert.equal(cq.answer, q.answer, q.id);
        assert.deepEqual(cq.options, q.options, q.id);
      }
      count += questions.length;
    }
  }
  assert.equal(count, 40);
});
