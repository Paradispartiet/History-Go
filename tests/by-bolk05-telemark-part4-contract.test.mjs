import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const ids = ['kragero_stasjon_kragerobanen', 'brevik_byhistorie_tollbod'];
const collection = 'data/quizcards/by/regional_bolk05_telemark_part4_v1_20261026.json';

test('By05 Kragerø/Brevik have source-specific Fagverk and registered place links', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  for (const id of ids) {
    const place = read('data/places/by/telemark/' + id + '/' + id + '.json');
    assert.equal(place.id, id);
    assert.equal(place.fagverk?.status, 'curated');
    assert.equal(place.fagverk?.article?.length, 3);
    assert.equal(place.fagverk?.lenses?.length, 3);
    assert.ok(place.fagverk?.source_urls?.length >= 2);
    assert.ok(place.fagverk?.observable_traces?.length >= 2);
    assert.equal(registry.placeLinks[id]?.status, 'curated');
    assert.equal(registry.placeLinks[id]?.sourceFile, 'places/by/telemark/' + id + '/' + id + '.json');
  }
});

test('By05 Kragerø/Brevik 20 source-based questions match both QuizCards', () => {
  const cards = read(collection).cards;
  assert.equal(cards.length, 2);
  for (const id of ids) {
    const quiz = read('data/quiz/by/' + id + '_regional_v1_sets.json');
    const questions = quiz.sets.flatMap((set) => set.questions);
    const card = cards.find((item) => item.targetId === id);
    assert.ok(card, id);
    assert.equal(questions.length, 10);
    assert.equal(card.questionCount, 10);
    assert.equal(card.questions.length, 10);
    assert.equal(new Set(questions.map((q) => q.question)).size, 10);
    assert.ok(questions.filter((q) => /^(?:når|hvilket år|i hvilket år|fra hvilket år)\b/i.test(q.question)).length <= 2);
    questions.forEach((q, index) => {
      assert.equal(q.options[q.answerIndex], q.answer);
      assert.equal(q.knowledge_link_status, 'pending');
      assert.ok(q.source_urls?.length >= 1 && q.source_urls.every((url) => url.startsWith('https://')));
      assert.equal(q.quiz_id, card.questions[index].quiz_id);
      assert.equal(q.answer, card.questions[index].answer);
      assert.deepEqual(q.options, card.questions[index].options);
    });
  }
});

test('By05 Kragerø historical photo carries author and source metadata', () => {
  const id = 'kragero_stasjon_kragerobanen';
  const place = read('data/places/by/telemark/' + id + '/' + id + '.json');
  assert.match(place.image, /commons\.wikimedia\.org/);
  assert.match(place.imageSourceUrl, /Krager%C3%B8_stasjon\.jpeg/);
  assert.match(place.imageCredit, /Anders Beer Wilse/);
  assert.match(place.imageLicense, /Public domain/);
  assert.ok(place.imageCaption);
});
