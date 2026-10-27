import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));

const expectedTargets = [
  'larvik_stasjon_vestfoldbanen',
  'sandefjord_stasjon_vestfoldbanen',
  'bo_stasjon_sorlandsbanen',
  'df_ammonia_mael',
  'hogga_sluse_telemarkskanalen',
  'lunde_sluse_telemarkskanalen',
  'kjeldal_sluse_telemarkskanalen',
  'kragero_stasjon_kragerobanen',
  'brevik_byhistorie_tollbod',
  'mael_stasjon_rjukanbanen',
  'notodden_stasjon_industriarv',
  'rjukanbanen_rjukan_stasjon',
  'telemarkskanalen_vrangfoss',
  'tinnoset_stasjon_tinnosbanen',
  'treungen_stasjon_treungenbanen',
  'arendal_gamle_radhus',
  'arendal_stasjon',
  'arendal_tollbod',
  'trefoldighetskirken_arendal',
  'tyholmen_arendal_byhistorie',
];

test('By05 fullquiz manifest registers exactly one set for each of 20 canonical places', () => {
  const manifest = read('data/quiz/manifest.json');
  for (const id of expectedTargets) {
    const path = 'data/quiz/by/' + id + '_regional_v1_sets.json';
    const matching = manifest.sets.filter((entry) => entry.targetId === id && entry.file === path);
    assert.equal(matching.length, 1, id + ': missing or duplicate fullquiz manifest entries');
    assert.equal(matching[0].categoryId, 'by');
    const sets = read(path).sets;
    assert.equal(sets.length, 1, id);
    assert.equal(sets[0].questions.length, 10, id);
    assert.equal(matching[0].set_id, sets[0].set_id ?? sets[0].id, id);
  }
});

test('By05 QuizCard manifest registers every collection exactly once', () => {
  const manifest = read('data/quizcards/by/manifest.json');
  const files = fs.readdirSync('data/quizcards/by')
    .filter((name) => /^regional_bolk05_.*\.json$/.test(name));
  assert.equal(files.length, 16);
  for (const name of files) {
    assert.equal(manifest.collections.filter((entry) => entry === name).length, 1, name);
    const collection = read('data/quizcards/by/' + name);
    assert.ok(collection.cards.length >= 1);
    for (const card of collection.cards) {
      assert.equal(card.questionCount, 10);
      assert.equal(card.questions.length, 10);
    }
  }
});
