import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const rootFile = (path) => new URL("../" + path, import.meta.url);
const read = (path) => JSON.parse(readFileSync(rootFile(path), "utf8"));

const place = read("data/places/by/oslo/oslo_domkirke/oslo_domkirke.json");
const quiz = read("data/quiz/historie/oslo_domkirke_sets.json");
const card = read("data/quizcards/historie/oslo_domkirke_quizkort_v1.json");
const all = quiz.sets.flatMap((set) => set.questions);
const byId = new Map(all.map((question) => [question.id, question]));

test("Oslo domkirke: 21 sourced questions with canonical Knowledge links", () => {
  assert.equal(place.id, "oslo_domkirke");
  assert.equal(quiz.targetId, place.id);
  assert.deepEqual(quiz.sets.map((set) => set.questions.length), [7, 7, 7]);
  assert.equal(all.length, 21);
  assert.equal(new Set(all.map((question) => question.id)).size, 21);
  assert.equal(new Set(all.map((question) => question.quiz_id)).size, 21);
  for (const question of all) {
    assert.equal(question.targetId, place.id, question.id);
    assert.equal(question.options.length, 4, question.id);
    assert.equal(question.options[question.answerIndex], question.answer, question.id);
    assert.ok(question.source?.length > 0, question.id);
    assert.ok(question.source.every((url) => url.startsWith("https://")), question.id);
    assert.ok(question.claim_id, question.id);
    assert.ok(question.knowledge?.length > 20, question.id);
    assert.equal(question.knowledge_link_status, "linked", question.id);
    assert.ok(question.primary_knowledge_unit_id, question.id);
    assert.ok(question.knowledge_unit_ids?.includes(question.primary_knowledge_unit_id), question.id);
  }
});

test("Oslo domkirke: all ten QuizCard questions retain source and Knowledge parity", () => {
  assert.equal(card.cards.length, 1);
  assert.equal(card.cards[0].targetId, place.id);
  assert.equal(card.cards[0].questions.length, 10);
  assert.equal(card.production_status, "knowledge_linked_browser_review_pending");
  const seen = new Set();
  for (const item of card.cards[0].questions) {
    assert.ok(!seen.has(item.sourceQuestionId), item.sourceQuestionId);
    seen.add(item.sourceQuestionId);
    const source = byId.get(item.sourceQuestionId);
    assert.ok(source, "Missing canonical fullquiz: " + item.sourceQuestionId);
    assert.equal(item.sourceQuizId, source.quiz_id);
    for (const key of [
      "question", "answer", "answerIndex", "knowledge", "emne_id",
      "claim_id", "knowledge_link_status", "primary_knowledge_unit_id",
      "knowledge_contract_version"
    ]) {
      assert.deepEqual(item[key], source[key], item.sourceQuestionId + ":" + key);
    }
    for (const key of ["options", "knowledge_unit_ids", "concept_ids", "term_ids"]) {
      assert.deepEqual(item[key], source[key], item.sourceQuestionId + ":" + key);
    }
    assert.equal(item.knowledge_link_status, "linked", item.sourceQuestionId);
  }
});

test("Oslo domkirke: Fagverk, manifests and documentary images remain bound", () => {
  assert.equal(place.fagverk?.article?.length, 3);
  assert.equal(place.fagverk?.lenses?.length, 3);
  assert.ok(place.fagverk?.source_urls?.length >= 2);
  const registry = read("data/fagverk/fagverk_registry.json");
  assert.equal(registry.placeLinks.oslo_domkirke?.status, "curated");
  const quizManifest = read("data/quiz/manifest.json");
  assert.equal(quizManifest.sets.filter((set) => set.targetId === place.id).length, 1);
  const cardManifest = read("data/quizcards/historie/manifest.json");
  assert.ok(cardManifest.collections.includes("oslo_domkirke_quizkort_v1.json"));
  for (const field of ["image", "cardImage", "frontImage"]) {
    const file = place[field];
    assert.ok(file?.endsWith(".webp"), field);
    const bytes = readFileSync(rootFile(file));
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF", field);
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP", field);
  }
  assert.match(place.imageMeta?.license || "", /CC BY-SA/u);
  assert.match(place.frontImageMeta?.license || "", /CC BY-SA/u);
});
