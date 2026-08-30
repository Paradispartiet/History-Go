import assert from "node:assert/strict";
import test from "node:test";
import { auditQuestionCollection, collectQuestions } from "../scripts/audit-quiz-answer-position-bias.mjs";

const q = (idx, n = 4) => ({
  id: `q_${idx}`,
  options: Array.from({ length: n }, (_, i) => `o${i}`),
  answerIndex: idx,
  answer: `o${idx}`
});

test("recursive collector finds questions inside sets", () => {
  assert.equal(collectQuestions({ sets: [{ questions: [q(0), q(1)] }] }).length, 2);
});

test("a fixed first-slot quiz is rejected", () => {
  const errors = auditQuestionCollection(Array.from({ length: 7 }, () => q(0)), "fixture");
  assert.ok(errors.some((error) => error.includes("same stored position")));
});

test("distributed correct-answer positions pass", () => {
  const questions = Array.from({ length: 14 }, (_, i) => q(i % 4));
  assert.deepEqual(auditQuestionCollection(questions, "fixture"), []);
});

test("answerIndex integrity remains mandatory", () => {
  const broken = Array.from({ length: 4 }, (_, i) => q(i % 2));
  broken[0].answer = "not-the-indexed-answer";
  assert.ok(auditQuestionCollection(broken, "fixture").some((error) => error.includes("does not point to answer")));
});
