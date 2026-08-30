import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

await import("../js/quiz/answer-shuffle.js");
const { shuffleQuestion } = globalThis.HGQuizAnswerShuffle;

// Runtime presentation may change answer order, but canonical question data and answer identity must remain stable.
test("shuffle preserves the correct answer and remaps its displayed index", () => {
  const question = { options: ["Riktig", "B", "C", "D"], answer: "Riktig", answerIndex: 0 };
  const source = structuredClone(question);
  const values = [0, 0, 0];
  const shuffled = shuffleQuestion(question, () => values.shift() ?? 0);
  assert.deepEqual(question, source, "canonical question data must not be mutated");
  assert.deepEqual([...shuffled.options].sort(), [...question.options].sort());
  assert.equal(shuffled.options[shuffled.answerIndex], "Riktig");
  assert.notEqual(shuffled.answerIndex, 0, "controlled shuffle must move a first-slot answer");
});

test("shuffle resolves the correct index from answer text when needed", () => {
  const shuffled = shuffleQuestion({ options: ["A", "B", "C"], answer: "B" }, () => 0);
  assert.equal(shuffled.options[shuffled.answerIndex], "B");
});

test("quiz runtime loads the shuffler before quizzes and uses shuffled presentation", () => {
  const app = fs.readFileSync("js/app.js", "utf8");
  const runtime = fs.readFileSync("js/quizzes.js", "utf8");
  assert.ok(app.indexOf("js/quiz/answer-shuffle.js") < app.indexOf("js/quizzes.js"));
  assert.match(runtime, /HGQuizAnswerShuffle\?\.shuffleQuestion\?\.\(q\)/);
  assert.doesNotMatch(runtime, /const options = arr\(q\.options \|\| q\.choices\);\n\s*const answerIndex/);
});
