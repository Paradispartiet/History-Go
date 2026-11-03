import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const id = "alna_bryn";
const sourcePath = "data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_bryn.json";
const runtimePath = "data/runtime/place-open/alna_bryn.json";

test("Bryn river, railway and agencies must not be presented as canonical Brands", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const index = load("data/brands/brands_by_place.json");
  const all = load("data/brands/brands_master.json");
  const registry = Array.isArray(all) ? all : all.brands;
  assert.equal(source.id, id);
  assert.equal(runtime.place.id, id);
  assert.deepEqual(source.brands, []);
  assert.deepEqual(runtime.place.brands, []);
  assert.deepEqual(runtime.brands, []);
  assert.deepEqual(index[id] || [], []);
  assert.equal(registry.filter(item => item.place_ids?.includes(id)).length, 0);
  // A PlaceCard profile needs real supported collections; do not fabricate one.
  assert.equal(source.place_card_profile, undefined);
  assert.equal(runtime.place.place_card_profile, undefined);
  assert.deepEqual(runtime.people, []);
  assert.equal(source.civication_store.length, 4);
  assert.ok(source.civication_store.every(item => item.kind === "physical_object"));
  const report = fs.readFileSync(path.join(root, "reports/place-production/alna-bryn-placecard-curation-v1.md"), "utf8");
  assert.match(report, /v1_candidate/);
});

test("Bryn retains six fullquiz sets and ten aligned QuizCard questions", () => {
  const quiz = load("data/quiz/natur/alna_bryn_sets.json");
  const cards = load("data/quizcards/natur/topp10_natur_alna_v1_batch01.json");
  const card = cards.cards.find(c => c.targetId === id);
  const questions = quiz.sets.flatMap(s => s.questions);
  const map = new Map(questions.map(q => [q.id, q]));
  assert.equal(quiz.sets.length, 6);
  assert.equal(questions.length, 42);
  assert.equal(map.size, 42);
  assert.ok(questions.every(q => q.knowledge_link_status === "linked" && q.primary_knowledge_unit_id));
  assert.equal(card?.questions.length, 10);
  for (const q of card.questions) {
    const original = map.get(q.sourceQuestionId);
    assert.ok(original, `Missing source question: ${q.sourceQuestionId}`);
    assert.equal(q.question, original.question);
    assert.deepEqual(q.options, original.options);
    assert.equal(q.answer, original.answer);
  }
});

test("Bryn retains the certified v4.2 source history and licensed site images", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const packet = load("data/places/production/alna_bryn.json");
  for (const k of ["desc", "popupDesc", "image", "frontImage", "cardImage", "imageCredit", "imageLicense", "imageSourceUrl", "lat", "lon"]) {
    assert.deepEqual(runtime.place[k], source[k], `Canonical/runtime mismatch in ${k}`);
  }
  assert.equal(packet.placeId, id);
  assert.equal(packet.status, "ready_v4_2");
  assert.equal(packet.claims.length, 15);
  assert.equal(source.imageLicense, "CC BY-SA 3.0");
  assert.match(source.popupDesc, /Brynsfossen/);
  assert.match(source.popupDesc, /Hovedbanen/);
});
