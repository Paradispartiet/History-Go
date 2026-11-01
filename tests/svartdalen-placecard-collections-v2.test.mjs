import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const placeId = "svartdalen";
const sourcePath = "data/places/natur/oslo/places_oslo_natur_alnaelva_rute/svartdalen.json";
const runtimePath = "data/runtime/place-open/svartdalen.json";

test("Svartdalen must not render terrain names and agencies as Brands", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const byPlace = load("data/brands/brands_by_place.json");
  const brandCatalog = load("data/brands/brands_master.json");
  const allBrands = Array.isArray(brandCatalog) ? brandCatalog : brandCatalog.brands;

  assert.equal(source.id, placeId);
  assert.equal(runtime.place.id, placeId);
  assert.deepEqual(source.brands, []);
  assert.deepEqual(runtime.place.brands, []);
  assert.deepEqual(runtime.brands, []);
  assert.deepEqual(byPlace[placeId] || [], []);
  assert.equal(allBrands.filter(item =>
    Array.isArray(item.place_ids) && item.place_ids.includes(placeId)).length, 0);
  assert.deepEqual(source.place_card_profile.collection_ids, []);
  assert.deepEqual(runtime.place.place_card_profile, source.place_card_profile);
  assert.equal(source.place_card_profile.schema, "history_go_place_card_profile_v2");

  // Do not manufacture People or claim game-store field cards are historical objects.
  assert.deepEqual(runtime.people, []);
  assert.ok(source.civication_store.length >= 4);
  assert.equal(source.place_card_profile.collection_ids.includes("objects"), false);
});

test("Svartdalen keeps all existing Knowledge-linked questions and QuizCard mapping", () => {
  const quiz = load("data/quiz/natur/svartdalen_sets.json");
  const cards = load("data/quizcards/natur/topp10_natur_alna_v1_batch01.json");
  const card = cards.cards.find(c => c.targetId === placeId);
  const questions = quiz.sets.flatMap(set => set.questions);
  const ids = new Map(questions.map(q => [q.id, q]));
  assert.equal(quiz.sets.length, 6);
  assert.equal(questions.length, 42);
  assert.equal(ids.size, 42);
  assert.ok(questions.every(q => q.knowledge_link_status === "linked" && q.primary_knowledge_unit_id));
  assert.equal(card?.questions.length, 10);
  for (const question of card.questions) {
    const original = ids.get(question.sourceQuestionId);
    assert.ok(original, `Missing canonical fullquiz question: ${question.sourceQuestionId}`);
    assert.equal(question.question, original.question);
    assert.deepEqual(question.options, original.options);
    assert.equal(question.answer, original.answer);
  }
});

test("Svartdalen's documentary photo and historical source text are unchanged", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const packet = load("data/places/production/svartdalen.json");
  for (const key of ["desc", "popupDesc", "image", "frontImage", "cardImage", "imageCredit", "imageLicense", "imageSourceUrl"]) {
    assert.equal(runtime.place[key], source[key], `Mismatch in ${key}`);
  }
  assert.equal(source.imageLicense, "Public domain");
  assert.equal(packet.status, "ready_v4_2");
  assert.equal(packet.placeId, placeId);
  assert.match(source.popupDesc, /Kværnerfossene/);
  assert.match(source.popupDesc, /2011/);
});
