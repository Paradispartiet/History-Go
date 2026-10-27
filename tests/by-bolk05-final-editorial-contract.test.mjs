import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const places = {
  vestfold: ['larvik_stasjon_vestfoldbanen', 'sandefjord_stasjon_vestfoldbanen'],
  telemark: [
    'bo_stasjon_sorlandsbanen', 'df_ammonia_mael',
    'hogga_sluse_telemarkskanalen', 'lunde_sluse_telemarkskanalen',
    'kjeldal_sluse_telemarkskanalen', 'mael_stasjon_rjukanbanen',
    'notodden_stasjon_industriarv', 'rjukanbanen_rjukan_stasjon',
    'telemarkskanalen_vrangfoss', 'tinnoset_stasjon_tinnosbanen',
    'treungen_stasjon_treungenbanen', 'kragero_stasjon_kragerobanen',
    'brevik_byhistorie_tollbod'
  ],
  agder: [
    'arendal_gamle_radhus', 'arendal_stasjon', 'arendal_tollbod',
    'trefoldighetskirken_arendal', 'tyholmen_arendal_byhistorie'
  ]
};
const allIds = Object.values(places).flat();
const directYear = q => /^(?:når|hvilket år|i hvilket år|fra hvilket år)\b/i.test(q.question);
const cardFiles = fs.readdirSync('data/quizcards/by')
  .filter(name => /^regional_bolk05_(?:vestfold|telemark|agder).*\.json$/.test(name));
const cards = cardFiles.flatMap(name => read('data/quizcards/by/' + name).cards || []);

test('By05: exactly 20 canonical places have three-part Fagverk and registered source links', () => {
  assert.equal(allIds.length, 20);
  assert.equal(new Set(allIds).size, 20);
  const registry = read('data/fagverk/fagverk_registry.json');
  for (const [region, ids] of Object.entries(places)) for (const id of ids) {
    const path = 'data/places/by/' + region + '/' + id + '/' + id + '.json';
    const place = read(path);
    assert.equal(place.id, id);
    assert.equal(place.category, 'by');
    assert.equal(place.fagverk?.schema, 'history_go_place_fagverk_v2');
    assert.equal(place.fagverk?.status, 'curated');
    assert.equal(place.fagverk?.article?.length, 3, id);
    assert.equal(place.fagverk?.lenses?.length, 3, id);
    assert.ok(place.fagverk?.source_urls?.length >= 1, id);
    assert.ok(place.fagverk.source_urls.every(url => url.startsWith('https://')), id);
    assert.equal(registry.placeLinks[id]?.sourceFile, path.replace(/^data\//, ''), id);
    assert.equal(registry.placeLinks[id]?.status, 'curated', id);
  }
});

test('By05: 200 referenced quiz questions match the 20 QuizCards; no excessive date questions', () => {
  assert.equal(cardFiles.length, 16);
  assert.equal(cards.length, 20);
  assert.equal(new Set(cards.map(c => c.targetId)).size, 20);
  let total = 0;
  for (const id of allIds) {
    const quiz = read('data/quiz/by/' + id + '_regional_v1_sets.json');
    const questions = quiz.sets.flatMap(set => set.questions);
    const card = cards.find(c => c.targetId === id);
    assert.ok(card, id);
    assert.equal(questions.length, 10, id);
    assert.equal(card.questionCount, 10, id);
    assert.equal(card.questions?.length, 10, id);
    assert.ok(questions.filter(directYear).length <= 2, id);
    assert.equal(new Set(questions.map(q => q.question)).size, 10, id);
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i], cq = card.questions[i];
      assert.equal(q.targetId, id);
      assert.equal(q.options[q.answerIndex], q.answer, q.id);
      assert.ok(q.source_urls?.length && q.source_urls.every(url => url.startsWith('https://')), q.id);
      assert.ok(q.knowledge?.trim(), q.id);
      assert.ok(q.explanation?.trim(), q.id);
      assert.equal(q.knowledge_link_status, 'pending', q.id);
      assert.equal(cq.quiz_id, q.quiz_id, q.id);
      assert.equal(cq.answer, q.answer, q.id);
      assert.deepEqual(cq.options, q.options, q.id);
    }
    total += questions.length;
  }
  assert.equal(total, 200);
});
