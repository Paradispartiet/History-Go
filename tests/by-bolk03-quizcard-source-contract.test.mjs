import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const ids = [
  'bankplassen', 'birkelunden', 'bogstadveien', 'christiania_torv',
  'hammersborg_torg', 'helsfyr', 'karl_johan', 'majorstuen_krysset',
  'nydalen', 'ring_3', 'rodelokka', 'slottsparken',
  'spikersuppa', 'storgata', 'torggata', 'ullern',
  'ullevål_hageby', 'vaalerenga', 'vikaterrassen', 'vinderen'
];
const collections = read('data/quizcards/by/manifest.json').collections;
const cards = collections.flatMap(file => read('data/quizcards/by/' + file).cards || []);
const manifest = read('data/quiz/manifest.json').sets;
const isYear = answer =>
  /^(?:(?:i|fra)\s+)?(?:1\d{3}|20\d{2})(?:[-–]\d{2,4})?(?:-årene)?$/i.test(String(answer || '').trim());
const asksDate = question =>
  /^(?:når|hvilket år|i hvilket år|fra hvilket år|fra hvilket tiår)\b/i.test(String(question || '').trim());

test('By-bolk 03 reuses twenty unique canonical By places and their ten-question cards', () => {
  assert.equal(ids.length, 20);
  assert.equal(new Set(ids).size, 20);
  for (const id of ids) {
    const matches = cards.filter(card => card.targetId === id);
    assert.equal(matches.length, 1, id + ': duplicate/missing card');
    assert.equal(matches[0].categoryId, 'by', id);
    assert.equal(matches[0].questions?.length, 10, id);
    assert.equal(matches[0].questionCount, 10, id);
    assert.equal(matches[0].answerKey?.length, 10, id);
  }
});

test('By-bolk 03 QuizCard source IDs, questions, answer keys, and Knowledge agree with existing fullquiz', () => {
  for (const id of ids) {
    const card = cards.find(entry => entry.targetId === id);
    const manifestFiles = [...new Set(manifest
      .filter(entry => entry.targetId === id && entry.file?.startsWith('data/quiz/by/'))
      .map(entry => entry.file))];
    assert.ok(manifestFiles.includes(card.sourceFile), id + ': unregistered source file');
    const quiz = read(card.sourceFile);
    const bank = quiz.sets.flatMap(set => set.questions || []);
    const byId = new Map(bank.map(question => [question.id, question]));
    const seenQuestionIds = new Set();
    const seenAnswers = new Set();
    let yearCount = 0;
    let datePrompts = 0;
    for (let index = 0; index < 10; index++) {
      const entry = card.questions[index];
      const source = byId.get(entry.sourceQuestionId);
      assert.ok(source, id + ': source ID missing in fullquiz ' + entry.sourceQuestionId);
      assert.ok(!seenQuestionIds.has(entry.sourceQuestionId), id + ': repeated question ID');
      assert.ok(!seenAnswers.has(entry.answer), id + ': repeated answer');
      seenQuestionIds.add(entry.sourceQuestionId);
      seenAnswers.add(entry.answer);
      assert.equal(entry.sourceQuizId, source.quiz_id, id + ': quiz_id mismatch');
      assert.equal(entry.question, source.question, id + ': altered source question');
      assert.deepEqual(entry.options, source.options, id + ': altered options');
      assert.equal(entry.answer, source.answer, id + ': answer mismatch');
      assert.equal(entry.answerIndex, source.options.indexOf(source.answer), id + ': invalid answerIndex');
      assert.equal(entry.knowledge, source.knowledge, id + ': Knowledge explanation diverged');
      if (entry.sourceQuizFile) assert.equal(entry.sourceQuizFile, card.sourceFile, id + ': wrong quiz file pointer');
      assert.equal(card.answerKey[index].answer, source.answer, id + ': answerKey mismatch');
      if (typeof card.answerKey[index].answerIndex === 'number') {
        assert.equal(card.answerKey[index].answerIndex, entry.answerIndex, id + ': answerKey index mismatch');
      }
      if (entry.knowledge_unit_ids && source.knowledge_unit_ids)
        assert.deepEqual(entry.knowledge_unit_ids, source.knowledge_unit_ids, id + ': Knowledge unit mismatch');
      if (source.source?.length) assert.ok(entry.source?.length || entry.source_refs?.length || entry.source_urls?.length,
        id + ': lost registered source references');
      if (isYear(entry.answer)) yearCount++;
      if (asksDate(entry.question)) datePrompts++;
    }
    assert.ok(yearCount <= 2, id + ': too many year or decade answers: ' + yearCount);
    assert.ok(datePrompts <= 2, id + ': too many date trivia questions: ' + datePrompts);
  }
});
