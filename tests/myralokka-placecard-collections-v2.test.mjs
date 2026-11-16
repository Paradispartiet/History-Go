import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const id = "myralokka";
const sourcePath = "data/places/natur/oslo/places_oslo_natur_akerselvarute/myralokka.json";
const runtimePath = "data/runtime/place-open/myralokka.json";

test("Myraløkka does not surface park names, historic factories or agencies as canonical Brands", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const byPlace = load("data/brands/brands_by_place.json");
  const catalog = load("data/brands/brands_master.json");
  const brands = Array.isArray(catalog) ? catalog : catalog.brands;
  assert.equal(source.id, id);
  assert.equal(runtime.place.id, id);
  assert.deepEqual(source.brands, []);
  assert.deepEqual(runtime.place.brands, []);
  assert.deepEqual(runtime.brands, []);
  assert.deepEqual(byPlace[id] || [], []);
  assert.equal(brands.filter(b => Array.isArray(b.place_ids) && b.place_ids.includes(id)).length, 0);
  assert.equal(source.place_card_profile, undefined);
  assert.equal(runtime.place.place_card_profile, undefined);
  assert.deepEqual(runtime.people, []);
  // Interpretive store models are not authenticated physical Objects in the park.
  assert.equal(source.civication_store.length, 4);
  assert.ok(source.civication_store.every(p => p.kind === "physical_object"));
});

test("Myraløkka retains 42 stable quiz IDs, 40 linked Knowledge units and ten sourced QuizCard links", () => {
  const quiz = load("data/quiz/natur/myralokka_sets.json");
  const cards = load("data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json");
  const card = cards.cards.find(c => c.targetId === id);
  const questions = quiz.sets.flatMap(s => s.questions);
  const originals = new Map(questions.map(q => [q.id, q]));
  assert.equal(quiz.sets.length, 6);
  assert.equal(questions.length, 42);
  assert.equal(originals.size, 42);
  assert.equal(questions.filter(q => q.knowledge_link_status === "linked" && q.primary_knowledge_unit_id).length, 40);
  const pending = questions.filter(q => q.knowledge_link_status === "editorial_review_required" && q.primary_knowledge_unit_id);
  assert.deepEqual(pending.map(q => q.id), ["myralokka_s2_q5", "myralokka_s2_q6"]);
  assert.equal(questions.filter(q => q.knowledge_link_evidence?.reviewedAt === "2026-11-16").length, 19);
  assert.equal(card?.questions.length, 10);
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions.filter(q => /^(?:Når|Hvilket år)\b/u.test(q.question)).length, 1);
  for (const item of card.questions) {
    const original = originals.get(item.sourceQuestionId);
    assert.ok(original, `Missing original question ${item.sourceQuestionId}`);
    assert.equal(original.knowledge_link_status, "linked", `Unreviewed QuizCard source: ${item.sourceQuestionId}`);
    assert.equal(item.sourceQuizId, original.quiz_id);
    assert.equal(item.question, original.question);
    assert.deepEqual(item.options, original.options);
    assert.equal(item.answer, original.answer);
    assert.equal(item.answerIndex, original.answerIndex);
    assert.deepEqual(item.source_urls, original.source.filter(s => /^https?:\/\//u.test(s)));
    assert.deepEqual(item.source_refs, original.source);
  }
  assert.deepEqual(card.answerKey, card.questions.map(({ number, answer, answerIndex }) => ({ number, answer, answerIndex })));
});

test("Myraløkka preserves approved history, photo attribution, coordinates and runtime parity", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const packet = load("data/places/production/myralokka.json");
  for (const key of ["desc", "popupDesc", "image", "frontImage", "cardImage", "imageCredit", "imageLicense", "imageSourceUrl", "lat", "lon"]) {
    assert.deepEqual(runtime.place[key], source[key], `Mismatch in ${key}`);
  }
  assert.equal(packet.placeId, id);
  assert.equal(packet.status, "ready_v4_2");
  assert.equal(packet.claims.length, 26);
  assert.equal(source.imageLicense, "Public domain");
  assert.match(source.popupDesc, /Bentse teglverk/);
  assert.match(source.popupDesc, /Myrens Verksted/);
  const report = fs.readFileSync(path.join(root, "reports/place-production/myralokka-placecard-curation-v1.md"), "utf8");
  assert.match(report, /v1_candidate/);
});
