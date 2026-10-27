import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (file) => JSON.parse(readFileSync(new URL("../" + file, import.meta.url), "utf8"));
const quiz = read("data/quiz/kunst/villa_romsli_sets.json");
const card = read("data/quizcards/kunst/villa_romsli_quizcard_v1.json");
const brief = read("data/quiz/production_briefs/kunst/villa_romsli.json");
const place = read("data/places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_06/villa_romsli.json");
const questions = quiz.sets.flatMap((set) => set.questions);
test("Villa Romsli: 21 reviewed original questions, three sets of seven", () => {
  assert.equal(quiz.targetId, "villa_romsli");
  assert.deepEqual(quiz.sets.map((s) => s.questions.length), [7,7,7]);
  assert.deepEqual(quiz.sets.map((s) => s.phase), ["opening","bridge","final"]);
  assert.equal(questions.length, 21);
  assert.equal(new Set(questions.map((q) => q.id)).size, 21);
  assert.equal(new Set(questions.map((q) => q.quiz_id)).size, 21);
  for (const q of questions) {
    assert.equal(q.targetId, "villa_romsli");
    assert.equal(q.options.length, 4);
    assert.equal(q.options[q.answerIndex], q.answer);
    assert.ok(q.explanation.length > 45);
    assert.ok(brief.claims.some((claim) => claim.claim_id === q.claim_id));
    assert.ok(q.source.every((id) => brief.sources[id]?.review_status === "reviewed"));
    assert.ok(q.source_urls.every((url) => url.startsWith("https://")));
  }
  assert.equal(questions.filter((q) => /^Hvilken dato /u.test(q.question)).length, 1);
});
test("Villa Romsli: QuizCard reuses ten exact fullquiz questions", () => {
  const cardQuestions = card.cards[0].questions;
  assert.equal(cardQuestions.length, 10);
  assert.equal(new Set(cardQuestions.map((q) => q.sourceQuestionId)).size, 10);
  const byId = new Map(questions.map((q) => [q.id,q]));
  for (const question of cardQuestions) {
    const original = byId.get(question.sourceQuestionId);
    assert.ok(original, question.sourceQuestionId);
    for (const field of ["question","answer","answerIndex","knowledge","quiz_id"]) {
      assert.deepEqual(question[field],original[field]);
    }
    assert.deepEqual(question.options,original.options);
  }
});
test("Villa Romsli: three-part Fagverk and verified existing coordinates", () => {
  assert.equal(place.id,"villa_romsli");
  assert.equal(place.coordStatus,"verified");
  assert.equal(place.fagverk?.article?.length,3);
  assert.equal(place.fagverk?.lenses?.length,3);
  assert.ok(place.fagverk.source_urls.some((url) => url.includes("oslo.kommune.no")));
});
