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
const forbidden = /History Go|PlaceCard|QuizCard|Objects|Brands|canonical|targetId|targetet|quizkort|intern(?:e)? spill|spillterminologi|`[a-z0-9_]+`/i;

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

test("Oslo batch04: player-facing question, choices and Knowledge contain no internal implementation terminology", () => {
  const offenders = [];
  for (const id of ids) {
    for (const q of quizFor.get(id).questions) {
      for (const [field, value] of [["question", q.question], ["knowledge", q.knowledge], ...q.options.map((option, index) => ["option " + index, option])]) {
        if (typeof value === "string" && forbidden.test(value)) offenders.push({ id, qid: q.id, field, value });
      }
    }
  }
  assert.deepEqual(offenders, [], "Player-visible Oslo quiz terminology must be about history, not implementation");
  const revised = quizFor.get("grev_wedels_plass").questions.find(q => q.id === "grev_wedels_plass_quiz_22");
  assert.match(revised.question, /Kvinnetorso.*Hanne på stranden.*fontenen/, "The park-art question must remain grounded in actual artworks");
  assert.equal(revised.answer, "De er fysiske spor i selve parkrommet");
});

test("Oslo batch04: final source-aware revisions preserve place histories, chronology and linked Knowledge", () => {
  const units = new Map(read("data/knowledge/knowledge_units.generated.json").units.map(u => [u.knowledge_unit_id, u]));
  for (const id of ["grunnlovsbygget_bankplassen","akershus_kaier","oslo_mek","christiania_seildugsfabrik"]) {
    const q = quizFor.get(id).questions.find(q => q.id === id + "_quiz_30");
    assert.ok(q, id + ": synthesis question missing");
    assert.ok(!q.question.includes("`"), id + ": internal place slug in question");
    const unit = units.get(q.primary_knowledge_unit_id);
    assert.ok(unit && unit.canonical_claim === q.knowledge, id + ": stale Knowledge for synthesis");
  }
  const grev = quizFor.get("grev_wedels_plass").questions;
  for (const num of [23,27]) {
    const q = grev.find(q => q.id === "grev_wedels_plass_quiz_" + num);
    assert.ok(q && !forbidden.test(q.answer) && !forbidden.test(q.knowledge), q?.id + ": internal term survived");
    const unit = units.get(q.primary_knowledge_unit_id);
    assert.ok(unit && unit.canonical_claim === q.knowledge, q.id + ": canonical Knowledge mismatch");
  }
  const seilduk = quizFor.get("christiania_seildugsfabrik").questions.find(q => q.id === "christiania_seildugsfabrik_quiz_6");
  assert.match(seilduk.knowledge, /seilduk for sjøfarten/);
  assert.equal(units.get(seilduk.primary_knowledge_unit_id)?.canonical_claim, seilduk.knowledge);
});

test("Oslo batch04: the two formerly internal questions now teach place history with consistent Knowledge", () => {
  const unitRows = read("data/knowledge/knowledge_units.generated.json").units;
  const byKnowledgeId = new Map(unitRows.map(unit => [unit.knowledge_unit_id, unit]));
  const checks = [
    ["oslo_mek", "oslo_mek_quiz_1", "Hvilket skipsverft preget området som senere ble Aker Brygge?"],
    ["grev_wedels_plass", "grev_wedels_plass_quiz_7", "Hvilket byrom betegner navnet Grev Wedels plass?"]
  ];
  for (const [id, questionId, expectedText] of checks) {
    const q = quizFor.get(id).questions.find(item => item.id === questionId);
    assert.ok(q, questionId + ": canonical question missing");
    assert.equal(q.question, expectedText, questionId + ": editorial correction regressed");
    assert.ok(!forbidden.test(q.knowledge), questionId + ": internal terminology persists in Knowledge");
    assert.ok(!forbidden.test(q.claim_basis), questionId + ": internal terminology persists in source claim");
    assert.equal(q.knowledge_unit_ids[0], q.primary_knowledge_unit_id);
    const unit = byKnowledgeId.get(q.primary_knowledge_unit_id);
    assert.ok(unit, questionId + ": linked canonical Knowledge is missing");
    assert.equal(unit.canonical_claim, q.knowledge, questionId + ": derived Knowledge claim is out of sync");
    assert.equal(unit.summary, q.knowledge, questionId + ": derived Knowledge summary is stale");
    assert.ok(unit.quiz_refs.includes(q.quiz_id), questionId + ": Knowledge lost its source quiz reference");
  }
  const aker = quizFor.get("oslo_mek").questions.find(q => q.id === "oslo_mek_quiz_1");
  assert.ok(!forbidden.test(aker.topic), "Aker place topic must not reference the data model");
  assert.ok(!aker.core_concepts.some(concept => /target-avklaring|canonical/i.test(concept)), "Internal target concept must not be part of learning");
});

test("Oslo batch04: Grev Wedels plass civic preservation has a source-backed question and synchronized Knowledge", () => {
  const q = quizFor.get("grev_wedels_plass").questions.find(q => q.id === "grev_wedels_plass_quiz_34");
  assert.equal(q.question, "Hva gjorde Oslo Byes Vel i 1962 som fikk betydning for Grev Wedels plass?");
  assert.equal(q.answer, "Reddet Militærhospitalet fra ødeleggelse");
  assert.deepEqual(q.source, ["grev_oslobyesvel_event"]);
  assert.match(q.knowledge, /1962 reddet Oslo Byes Vel Militærhospitalet fra ødeleggelse/);
  assert.equal(q.claim_basis, q.knowledge);
  const units = read("data/knowledge/knowledge_units.generated.json").units;
  const unit = units.find(u => u.knowledge_unit_id === q.primary_knowledge_unit_id);
  assert.ok(unit, "Canonical Knowledge missing for q34");
  assert.equal(unit.canonical_claim, q.knowledge);
  assert.equal(unit.summary, q.knowledge);
  assert.ok(unit.quiz_refs.includes(q.quiz_id));
});
