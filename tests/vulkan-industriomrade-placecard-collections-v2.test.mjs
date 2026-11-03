import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const id = "vulkan_industriomrade";
const sourcePath = "data/places/natur/oslo/places_oslo_natur_akerselvarute/vulkan_industriomrade.json";
const runtimePath = "data/runtime/place-open/vulkan_industriomrade.json";

test("Vulkan has zero unregistered Brands without fabricated PlaceCard collections", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const byPlace = load("data/brands/brands_by_place.json");
  const rawMaster = load("data/brands/brands_master.json");
  const master = Array.isArray(rawMaster) ? rawMaster : rawMaster.brands;
  assert.equal(source.id, id);
  assert.equal(runtime.place.id, id);
  assert.deepEqual(source.brands, []);
  assert.deepEqual(runtime.place.brands, []);
  assert.deepEqual(runtime.brands, []);
  assert.deepEqual(byPlace[id] || [], []);
  assert.equal(master.filter(b => Array.isArray(b.place_ids) && b.place_ids.includes(id)).length, 0);
  assert.equal(source.place_card_profile, undefined);
  assert.equal(runtime.place.place_card_profile, undefined);
  // Preserve all pre-existing People refs, including entries requiring independent editorial review.
  assert.deepEqual(runtime.people.map(p => p.id).sort(), [
    "axel_ingvald_spone_amundsen", "ferdinand_ludvig_vibe",
    "halvor_hoaas", "kristin_jarmund", "mats_zuccarello",
    "oslo_graffiti_miljoet", "oslo_skateboardmiljoet",
  ].sort());
  assert.equal(source.civication_store.length, 5);
  assert.ok(source.civication_store.every(item => item.kind === "physical_object"));
});

test("Vulkan's quiz and both QuizCards keep existing source IDs, answers and Knowledge review flags", () => {
  const quiz = load("data/quiz/historie/vulkan_industriomrade_sets.json");
  const questions = quiz.sets.flatMap(s => s.questions);
  const originals = new Map(questions.map(q => [q.id, q]));
  assert.equal(quiz.sets.length, 4);
  assert.equal(questions.length, 28);
  assert.equal(originals.size, 28);
  assert.equal(questions.filter(q => q.knowledge_link_status === "linked" && q.primary_knowledge_unit_id).length, 13);
  assert.equal(questions.filter(q => q.knowledge_link_status === "editorial_review_required" && q.primary_knowledge_unit_id).length, 15);
  const historyCard = load("data/quizcards/historie/vulkan_industriomrade_quizcard_v1.json").cards.find(c => c.targetId === id);
  const natureCard = load("data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json").cards.find(c => c.targetId === id);
  assert.equal(historyCard?.questions.length, 10);
  assert.equal(natureCard?.questions.length, 10);
  for (const card of [historyCard, natureCard]) {
    for (const question of card.questions) {
      const original = originals.get(question.sourceQuestionId || question.id);
      assert.ok(original, `Unknown original question: ${question.sourceQuestionId || question.id}`);
      assert.equal(question.question, original.question);
      assert.deepEqual(question.options, original.options);
      assert.equal(question.answer, original.answer);
    }
  }
  assert.equal(historyCard.questions.filter(q => originals.get(q.sourceQuestionId || q.id).knowledge_link_status === "linked").length, 10);
  assert.equal(natureCard.questions.filter(q => originals.get(q.sourceQuestionId || q.id).knowledge_link_status === "editorial_review_required").length, 5);
});

test("Vulkan's 29 certified historical claims, existing CC0 image metadata and runtime parity survive", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const production = load("data/places/production/vulkan_industriomrade.json");
  assert.equal(production.placeId, id);
  assert.equal(production.status, "ready_v4_2");
  assert.equal(production.claims.length, 29);
  for (const key of ["desc", "popupDesc", "image", "frontImage", "cardImage", "imageCredit", "imageLicense", "imageSourceUrl", "lat", "lon"]) {
    assert.deepEqual(runtime.place[key], source[key], `Canonical/runtime mismatch: ${key}`);
  }
  assert.equal(source.imageLicense, "CC0");
  assert.match(source.popupDesc, /Halvor Hoaas/);
  assert.match(source.popupDesc, /Mathallen/);
  assert.match(fs.readFileSync(path.join(root, "reports/place-production/vulkan-industriomrade-placecard-curation-v1.md"), "utf8"), /v1_candidate/);
});
