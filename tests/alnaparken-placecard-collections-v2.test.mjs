import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = name => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const placeId = "alnaparken";
const sourcePath = "data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alnaparken.json";
const runtimePath = "data/runtime/place-open/alnaparken.json";

test("Alnaparken cannot display park names, river names, authorities and organizations as Brands", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const byPlace = load("data/brands/brands_by_place.json");
  const catalog = load("data/brands/brands_master.json");
  const allBrands = Array.isArray(catalog) ? catalog : catalog.brands;

  assert.equal(source.id, placeId);
  assert.equal(runtime.place.id, placeId);
  assert.deepEqual(source.brands, []);
  assert.deepEqual(runtime.place.brands, []);
  assert.deepEqual(runtime.brands, []);
  assert.deepEqual(byPlace[placeId] || [], []);
  assert.equal(allBrands.filter(item => Array.isArray(item.place_ids) && item.place_ids.includes(placeId)).length, 0);

  // Never fill a v2 PlaceCard collection with invented people or merchandise.
  assert.equal(source.place_card_profile, undefined);
  assert.equal(runtime.place.place_card_profile, undefined);
  assert.deepEqual(runtime.people, []);
  assert.equal(source.civication_store.length, 4);
  assert.ok(source.civication_store.every(item => item.kind === "physical_object"));
  const audit = fs.readFileSync(path.join(root, "reports/place-production/alnaparken-placecard-curation-v1.md"), "utf8");
  assert.match(audit, /v1_candidate/);
});

test("Alnaparken keeps all 42 Knowledge questions and its ten synchronized QuizCard questions", () => {
  const quiz = load("data/quiz/natur/alnaparken_sets.json");
  const cards = load("data/quizcards/natur/topp10_natur_alna_v1_batch01.json");
  const card = cards.cards.find(c => c.targetId === placeId);
  const questions = quiz.sets.flatMap(s => s.questions);
  const ids = new Map(questions.map(q => [q.id, q]));
  assert.equal(quiz.sets.length, 6);
  assert.equal(questions.length, 42);
  assert.equal(ids.size, 42);
  assert.ok(questions.every(q => q.knowledge_link_status === "linked" && q.primary_knowledge_unit_id));
  assert.equal(card?.questions.length, 10);
  for (const q of card.questions) {
    const original = ids.get(q.sourceQuestionId);
    assert.ok(original, `Missing canonical fullquiz question: ${q.sourceQuestionId}`);
    assert.equal(q.question, original.question);
    assert.deepEqual(q.options, original.options);
    assert.equal(q.answer, original.answer);
  }
});

test("Alnaparken's v4.2 historical prose and licensed documentary photographs retain canonical/runtime parity", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const packet = load("data/places/production/alnaparken.json");
  for (const key of ["desc", "popupDesc", "image", "frontImage", "cardImage", "imageCredit", "imageLicense", "imageSourceUrl", "lat", "lon"]) {
    assert.deepEqual(runtime.place[key], source[key], `Mismatch in ${key}`);
  }
  assert.equal(packet.status, "ready_v4_2");
  assert.equal(packet.placeId, placeId);
  assert.equal(packet.claims.length, 16);
  assert.equal(source.imageLicense, "CC BY-SA 3.0");
  assert.match(source.popupDesc, /1958/);
  assert.match(source.popupDesc, /2001/);
  assert.match(source.popupDesc, /2005/);
});
