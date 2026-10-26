import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const manifest = read("data/quiz/manifest.json");
const quizCards = read("data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json");
const places = [
  { id: "glads_molle", file: "data/quiz/historie/glads_molle_sets.json" },
  { id: "vaterland_historisk_elvelop", file: "data/quiz/by/vaterland_historisk_elvelop_sets.json" },
];

for (const { id, file } of places) {
  test(`${id}: 3 × 7 sourced questions, stable quiz/card wiring`, () => {
    const quiz = read(file);
    assert.equal(quiz.targetId, id);
    assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7]);
    const manifestSets = manifest.sets.filter(entry => entry.targetId === id);
    assert.deepEqual(manifestSets.map(entry => entry.set_id), quiz.sets.map(set => set.set_id));
    const questions = quiz.sets.flatMap(set => set.questions);
    const ids = new Set();
    for (const question of questions) {
      assert.ok(!ids.has(question.id), `duplicate ID ${question.id}`);
      ids.add(question.id);
      assert.equal(question.options[question.answerIndex], question.answer, question.id);
      assert.ok(question.source?.length, `source missing: ${question.id}`);
      assert.ok(question.knowledge?.length, `knowledge missing: ${question.id}`);
      assert.ok(question.knowledge_unit_ids?.length, `Knowledge link missing: ${question.id}`);
    }
    const card = quizCards.cards.find(item => item.targetId === id);
    assert.ok(card, id);
    assert.equal(card.questions.length, 10);
    const byId = new Map(questions.map(question => [question.id, question]));
    for (const question of card.questions) {
      const full = byId.get(question.sourceQuestionId);
      assert.ok(full, `QuizCard lost fullquiz ID ${question.sourceQuestionId}`);
      for (const field of ["question", "options", "answer", "answerIndex"]) {
        assert.deepEqual(question[field], full[field], `${question.sourceQuestionId} ${field}`);
      }
    }
  });
}
