import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

// Permanent data acceptance for the 17 Places whose Fagverk was closed in #6553.
// This is NOT browser acceptance or editorial sign-off for v1.
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const ids = [
  "grunnlovsbygget_bankplassen", "akershus_kaier", "oslo_mek",
  "grensen_kjopesenter", "vippetangen_fisketorg", "frysja_industriomrade",
  "norges_varemesse", "bryn_industriomrade", "gronlikaia",
  "christiania_seildugsfabrik", "sagene_skole", "stortorget",
  "norges_bank_bankplassen_4", "gamle_trikkestallen", "gamle_radhus",
  "grev_wedels_plass", "sofienbergparken"
];
const cardBatches = [
  ["naeringsliv", "topp10_naeringsliv_oslo_v1_batch02.json"],
  ["by", "topp10_by_kort_batch8.json"],
  ["historie", "topp10_historie_oslo_minimum_v1_batch4.json"]
];
const fullManifest = read("data/quiz/manifest.json");
const quizFor = new Map();
const cardFor = new Map();
const knownDebts = new Map([
  ["oslo_mek_quiz_1", "Hvilket historisk verksted er riktig hovedanker for `oslo_mek`-targetet?"],
  ["grev_wedels_plass_quiz_7", "Hva er canonical sted i History Go?"]
]);
const forbidden = /History Go|canonical|targetId|targetet|quizkort|intern(?:e)? spill|spillterminologi/i;

test("Oslo batch04: each of 17 places has a unique fullquiz file, valid manifest entries and 21+ questions", () => {
  assert.equal(ids.length, 17);
  assert.equal(new Set(ids).size, 17);
  for (const id of ids) {
    const entries = (fullManifest.sets || []).filter(entry => entry.targetId === id);
    assert.ok(entries.length > 0, id + ": no active fullquiz manifest");
    const files = [...new Set(entries.map(entry => entry.file))];
    // Some 5x6 quizzes have five manifest rows, all pointing to the SAME file.
    assert.equal(files.length, 1, id + ": conflicting fullquiz file paths");
    assert.ok(fs.existsSync(files[0]), id + ": fullquiz file missing");
    const quiz = read(files[0]);
    assert.equal(quiz.targetId, id, id + ": source-target mismatch");
    assert.ok(quiz.sets?.length >= 3, id + ": fewer than three sets");
    const questions = quiz.sets.flatMap(set => set.questions || []);
    assert.ok(questions.length >= 21, id + ": fewer than 21 sourced fullquiz questions");
    if (entries.some(entry => entry.set_id)) {
      const actualIds = quiz.sets.map(set => set.set_id);
      assert.deepEqual(entries.map(entry => entry.set_id), actualIds, id + ": stale quiz manifest set ordering");
    }
    quizFor.set(id, { quiz, file: files[0], questions });
  }
});

test("Oslo batch04: fullquiz answer keys, unique questions, source links and Knowledge IDs are structurally intact", () => {
  let totalQuestions = 0;
  for (const id of ids) {
    const { questions } = quizFor.get(id);
    totalQuestions += questions.length;
    assert.equal(new Set(questions.map(q => q.id)).size, questions.length, id + ": duplicate question IDs");
    assert.equal(new Set(questions.map(q => q.question?.trim())).size, questions.length, id + ": duplicate question text");
    for (const q of questions) {
      assert.ok(q.question?.trim(), id + ": blank quiz question");
      assert.ok(Array.isArray(q.options) && q.options.length >= 3, q.id + ": options missing");
      assert.equal(new Set(q.options).size, q.options.length, q.id + ": duplicate answer choices");
      assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < q.options.length, q.id + ": invalid answer index");
      assert.equal(q.options[q.answerIndex], q.answer, q.id + ": inconsistent answer");
      assert.ok(Array.isArray(q.source) && q.source.length > 0, q.id + ": missing source references");
      assert.ok(q.primary_knowledge_unit_id, q.id + ": missing canonical Knowledge ID");
      assert.ok(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id), q.id + ": Knowledge link mismatch");
    }
  }
  assert.equal(totalQuestions, 503, "The 17-place fullquiz baseline changed; reconcile v1 production inventory");
});

test("Oslo batch04: exactly 170 QuizCard questions retain direct and exact canonical fullquiz parity", () => {
  for (const [category, file] of cardBatches) {
    const dir = "data/quizcards/" + category + "/";
    const manifest = read(dir + "manifest.json");
    assert.ok(manifest.collections.includes(file), "QuizCard collection not registered: " + dir + file);
    const collection = read(dir + file);
    for (const card of collection.cards || []) {
      if (!ids.includes(card.targetId)) continue;
      assert.ok(!cardFor.has(card.targetId), card.targetId + ": duplicate QuizCard");
      cardFor.set(card.targetId, card);
    }
  }
  assert.deepEqual([...cardFor.keys()].sort(), [...ids].sort(), "Not all 17 Places have exactly one active QuizCard");
  for (const id of ids) {
    const card = cardFor.get(id);
    const { file, questions } = quizFor.get(id);
    const byId = new Map(questions.map(q => [q.id, q]));
    assert.equal(card.questionCount, 10, id + ": incorrect card questionCount");
    assert.equal(card.questions?.length, 10, id + ": card must have ten questions");
    assert.equal(card.answerKey?.length, 10, id + ": missing card answer key");
    for (let index = 0; index < 10; index++) {
      const q = card.questions[index];
      const source = byId.get(q.sourceQuestionId);
      assert.ok(source, id + ": QuizCard source question not found: " + q.sourceQuestionId);
      assert.equal(q.sourceQuizFile, file, id + ": QuizCard points to wrong quiz file");
      assert.equal(q.number, index + 1, id + ": card question order");
      assert.equal(q.question, source.question, id + ": card question differs from canonical quiz");
      assert.deepEqual(q.options, source.options, id + ": card choices differ");
      assert.equal(q.answerIndex, source.answerIndex, id + ": answer index differs");
      assert.equal(q.answer, source.answer, id + ": answer differs");
      assert.equal(q.primary_knowledge_unit_id, source.primary_knowledge_unit_id, id + ": Knowledge ID differs");
      assert.deepEqual(q.knowledge_unit_ids, source.knowledge_unit_ids, id + ": Knowledge links differ");
      assert.equal(card.answerKey[index].answer, source.answer, id + ": answerKey differs");
      assert.equal(card.answerKey[index].number, index + 1, id + ": answerKey order differs");
      assert.ok(q.source_urls?.some(s => /^https:\/\//.test(s)), id + ": card lacks a public source URL");
    }
  }
  assert.equal([...cardFor.values()].reduce((n, c) => n + c.questions.length, 0), 170);
});

test("Oslo batch04: no new player-facing quiz question exposes internal model terminology", () => {
  const offenders = [];
  for (const id of ids) {
    for (const q of quizFor.get(id).questions) {
      if (forbidden.test(q.question)) offenders.push({ id, qid: q.id, question: q.question });
    }
  }
  for (const item of offenders) {
    assert.equal(item.question, knownDebts.get(item.qid), item.qid + ": newly introduced internal/game-facing language");
  }
  // The two pre-existing editorial defects must be rewritten before final v1.
  console.log("EDITORIAL_DEBT", JSON.stringify(offenders));
});
