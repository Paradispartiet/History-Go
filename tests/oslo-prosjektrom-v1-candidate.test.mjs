import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const place = read("data/places/kunst/oslo/places_kunst/oslo_prosjektrom.json");
const open = read("data/runtime/place-open/oslo_prosjektrom.json");
const quiz = read("data/quiz/kunst/oslo_prosjektrom_sets.json");
const cards = read("data/quizcards/kunst/oslo_prosjektrom_quizcard_v1.json");
const quizManifest = read("data/quiz/manifest.json");
const cardManifest = read("data/quizcards/kunst/manifest.json");
const fagverkRegistry = read("data/fagverk/fagverk_registry.json");
const production = read("data/places/production/oslo_prosjektrom.json");

const questions = quiz.sets.flatMap((set) => set.questions);

test("Oslo Prosjektrom: one canonical venue at the documented entrance", () => {
  assert.equal(place.id, "oslo_prosjektrom");
  assert.equal(place.category, "kunst");
  assert.equal(place.address.street, "Platous gate");
  assert.equal(place.address.number, "18");
  assert.equal(place.coordStatus, "verified");
  assert.ok(place.desc.includes("2006"));
  assert.ok(!place.desc.includes("Platous gate 10"));
  assert.ok(!place.popupDesc.includes("Platous gate 10"));
  assert.deepEqual(open.place.fagverk, place.fagverk);
  assert.equal(open.place.popupDesc, place.popupDesc);
});

test("Oslo Prosjektrom: 21 source-backed questions and an identical ten-question QuizCard", () => {
  assert.deepEqual(quiz.sets.map((set) => set.questions.length), [7, 7, 7]);
  assert.equal(questions.length, 21);
  assert.equal(new Set(questions.map((item) => item.id)).size, 21);
  assert.equal(new Set(questions.map((item) => item.question)).size, 21);
  for (const question of questions) {
    assert.equal(question.targetId, place.id);
    assert.equal(question.categoryId, "kunst");
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.equal(question.options[question.answerIndex], question.answer);
    assert.ok(question.explanation && question.explanation.length > 25);
    assert.ok(question.source_urls.length);
    assert.ok(question.source_urls.every((url) => url.startsWith("https://")));
    assert.ok(question.claim_id.startsWith("claim_oslo_prosjektrom_"));
  }
  const registered = quizManifest.sets.filter((row) => row.targetId === place.id);
  assert.deepEqual(registered.map((row) => row.set_id), quiz.sets.map((row) => row.set_id));
  assert.ok(cardManifest.collections.includes("oslo_prosjektrom_quizcard_v1.json"));
  const cardQuestions = cards.cards[0].questions;
  assert.equal(cardQuestions.length, 10);
  for (let i = 0; i < cardQuestions.length; i += 1) {
    for (const field of ["id", "question", "options", "answer", "answerIndex", "quiz_id", "explanation"])
      assert.deepEqual(cardQuestions[i][field], questions[i][field]);
    assert.equal(cardQuestions[i].sourceQuestionId, questions[i].id);
  }
});

test("Oslo Prosjektrom: curated place Fagverk and source-to-claim package", () => {
  assert.equal(place.fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(place.fagverk.level, "standard");
  assert.equal(place.fagverk.status, "curated");
  assert.equal(place.fagverk.article.length, 3);
  assert.equal(place.fagverk.lenses.length, 3);
  assert.equal(fagverkRegistry.placeLinks[place.id].status, "curated");
  assert.equal(production.placeId, place.id);
  assert.equal(production.claims.length, 33);
  assert.equal(production.sentenceCoverage.desc.length, 2);
  assert.equal(production.sentenceCoverage.popupDesc.length, 12);
  const knownClaims = new Set(production.claims.map((claim) => claim.id));
  for (const coverage of [...production.sentenceCoverage.desc, ...production.sentenceCoverage.popupDesc])
    assert.ok(coverage.claimIds.every((id) => knownClaims.has(id)));
  for (const question of questions)
    assert.ok(knownClaims.has(question.claim_id));
});
