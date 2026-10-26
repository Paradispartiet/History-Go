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

const regionalBy03Groups = {
  akershus: ['tertitten_urskog_holandsbanen', 'kjeller_flyplass', 'hvitsten_sjobodene', 'son_ladested', 'holen_ladested'],
  ostfold: ['orje_sluser_haldenkanalen', 'kornsjo_grensestasjon', 'brekke_sluser_haldenkanalen', 'stromsfoss_sluser', 'homlungen_fyr'],
  buskerud: ['drammen_tollbod_havn', 'gamle_nesbyen', 'kroderbanen_kroderen_stasjon', 'riddergarden_honefoss', 'vikersund_stasjon_randsfjordbanen'],
  innlandet: ['eina_stasjon_totenbanen', 'fagernes_stasjon_valdresbanen', 'hamar_stasjon_jernbanebyen', 'lillehammer_stasjon', 'skibladner_gjovik']
};

test('Regional By-bolk 03 has exactly 20 canonical source-backed QuizCards with Knowledge and balanced dates', () => {
  const expected = Object.values(regionalBy03Groups).flat();
  assert.equal(expected.length, 20);
  assert.equal(new Set(expected).size, 20, 'regional place ID duplicated');

  for (const [region, placeIds] of Object.entries(regionalBy03Groups)) {
    const names = collections.filter(file => file.startsWith('regional_bolk03_' + region + '_v1_'));
    assert.equal(names.length, 1, region + ': missing/duplicate collection in By manifest');
    const collection = read('data/quizcards/by/' + names[0]);
    assert.equal(collection.cards?.length, 5, region + ': should have five cards');
    for (const placeId of placeIds) {
      const matches = collection.cards.filter(card => card.targetId === placeId);
      assert.equal(matches.length, 1, placeId + ': missing or duplicate card');
      const card = matches[0];
      const sourceFile = 'data/quiz/by/' + placeId + '_regional_v1_sets.json';
      assert.equal(card.sourceFile, sourceFile, placeId + ': wrong quiz source');
      assert.ok(manifest.some(set => set.targetId === placeId && set.file === sourceFile),
        placeId + ': source missing from canonical quiz manifest');
      const quiz = read(sourceFile);
      const sourceQuestions = quiz.sets.flatMap(set => set.questions || []);
      assert.equal(sourceQuestions.length, 10, placeId + ': quiz does not have ten questions');
      assert.equal(card.questionCount, 10, placeId + ': card questionCount mismatch');
      assert.equal(card.questions?.length, 10, placeId + ': card does not have ten questions');
      assert.equal(card.answerKey?.length, 10, placeId + ': answer key does not have ten entries');
      const sourceById = new Map(sourceQuestions.map(question => [question.id, question]));
      const sourceQuestionIds = new Set();
      let directDates = 0;
      for (let index = 0; index < 10; index++) {
        const question = card.questions[index];
        const source = sourceById.get(question.sourceQuestionId);
        assert.ok(source, placeId + ': invalid sourceQuestionId');
        assert.ok(!sourceQuestionIds.has(source.id), placeId + ': repeated question');
        sourceQuestionIds.add(source.id);
        assert.equal(question.sourceQuizFile, sourceFile, placeId + ': source filename mismatch');
        assert.equal(question.question, source.question, placeId + ': prompt differs from fullquiz');
        assert.deepEqual(question.options, source.options, placeId + ': choices differ from fullquiz');
        assert.equal(question.answer, source.answer, placeId + ': answer differs from fullquiz');
        assert.equal(question.answerIndex, source.options.indexOf(source.answer), placeId + ': answerIndex mismatch');
        assert.equal(question.knowledge, source.knowledge, placeId + ': explanation differs from fullquiz');
        assert.equal(card.answerKey[index].answer, source.answer, placeId + ': key answer mismatch');
        assert.ok(source.source_urls?.length, placeId + ': missing source reference');
        assert.ok(source.knowledge_unit_ids?.length, placeId + ': canonical Knowledge ID is missing');
        assert.ok(source.emne_id, placeId + ': emne ID is missing');
        assert.ok(String(source.knowledge || '').length >= 35, placeId + ': explanation too short');
        if (asksDate(question.question) || isYear(question.answer)) directDates++;
      }
      assert.ok(directDates <= 2, placeId + ': too many direct date/year questions (' + directDates + ')');
    }
  }
});
