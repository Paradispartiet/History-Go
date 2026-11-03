import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const id = "voienfossen";
const sourcePath = "data/places/natur/oslo/places_oslo_natur_akerselvarute/voienfossen.json";
const runtimePath = "data/runtime/place-open/voienfossen.json";

test("Vøyenfossen does not misclassify rivers, factories or historical institutions as canonical Brands", () => {
  const place = load(sourcePath);
  const runtime = load(runtimePath);
  const byPlace = load("data/brands/brands_by_place.json");
  const brands = load("data/brands/brands_master.json");
  const catalog = Array.isArray(brands) ? brands : brands.brands;
  assert.equal(place.id, id);
  assert.equal(runtime.place.id, id);
  assert.deepEqual(place.brands, []);
  assert.deepEqual(runtime.place.brands, []);
  assert.deepEqual(runtime.brands, []);
  assert.deepEqual(byPlace[id] || [], []);
  assert.equal(catalog.filter(item => Array.isArray(item.place_ids) && item.place_ids.includes(id)).length, 0);
  assert.equal(place.place_card_profile, undefined);
  assert.equal(runtime.place.place_card_profile, undefined);
  // Real sourced People must not be removed by this Brand cleanup.
  const people = new Set(runtime.people.map(person => person.id));
  for (const personId of ["knud_graah_voyenfallene", "halvor_schou", "oluf_nicolai_roll_nydalen"]) {
    assert.ok(people.has(personId), `Missing existing historical person: ${personId}`);
  }
  assert.equal(runtime.people.length, 3);
  assert.equal(place.civication_store.length, 4);
  assert.ok(place.civication_store.every(product => product.kind === "physical_object"));
  const report = fs.readFileSync(path.join(root, "reports/place-production/voienfossen-placecard-curation-v1.md"), "utf8");
  assert.match(report, /v1_candidate/);
});

test("Vøyenfossen preserves 28 Knowledge-linked historical questions and both 10-question QuizCards", () => {
  const quiz = load("data/quiz/historie/voienfossen_sets.json");
  const questions = quiz.sets.flatMap(set => set.questions);
  const indexed = new Map(questions.map(q => [q.id, q]));
  assert.equal(quiz.sets.length, 4);
  assert.equal(questions.length, 28);
  assert.equal(indexed.size, 28);
  assert.ok(questions.every(q => q.knowledge_link_status === "linked" && q.primary_knowledge_unit_id));
  const cards = [
    load("data/quizcards/historie/voienfossen_quizcard_v1.json").cards.find(c => c.targetId === id),
    load("data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json").cards.find(c => c.targetId === id),
  ];
  for (const [i, card] of cards.entries()) {
    assert.equal(card?.questions.length, 10, `QuizCard ${i} must have ten questions`);
    for (const q of card.questions) {
      const original = indexed.get(q.sourceQuestionId || q.id);
      assert.ok(original, `Unknown quiz source: ${q.sourceQuestionId || q.id}`);
      assert.equal(q.question, original.question);
      assert.deepEqual(q.options, original.options);
      assert.equal(q.answer, original.answer);
    }
  }
});

test("Vøyenfossen keeps its v4.2 history, photo metadata, and source/runtime parity", () => {
  const place = load(sourcePath);
  const runtime = load(runtimePath);
  const packet = load("data/places/production/voienfossen.json");
  assert.equal(packet.status, "ready_v4_2");
  assert.equal(packet.placeId, id);
  assert.equal(packet.claims.length, 26);
  assert.equal(place.imageLicense, "CC BY-SA 4.0");
  for (const field of ["desc", "popupDesc", "image", "frontImage", "cardImage", "imageCredit", "imageLicense", "imageSourceUrl", "lat", "lon"]) {
    assert.deepEqual(runtime.place[field], place[field], `Canonical/runtime mismatch: ${field}`);
  }
  assert.match(place.popupDesc, /Knud Graah/);
  assert.match(place.popupDesc, /Hjula Væverier/);
});
