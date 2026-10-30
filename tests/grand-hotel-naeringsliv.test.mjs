import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const paths = {
  place: "data/places/naeringsliv/oslo/grand_hotel.json",
  quiz: "data/quiz/naeringsliv/grand_hotel_sets.json",
  brief: "data/quiz/production_briefs/naeringsliv/grand_hotel.json",
  context: "data/quiz/production_context/naeringsliv/grand_hotel.json",
  card: "data/quizcards/naeringsliv/grand_hotel_quizcard_v1.json",
};

test("Grand Hotel has one canonical Næringsliv place and matching runtime", () => {
  const place = readJson(paths.place);
  const manifest = readJson("data/places/manifest.json");
  const index = readJson("data/places/places_index.json");
  const runtime = readJson("data/runtime/place-open/grand_hotel.json");
  const production = readJson("data/places/production/grand_hotel.json");
  const registry = readJson("data/fagverk/fagverk_registry.json");

  assert.equal(place.id, "grand_hotel");
  assert.equal(place.category, "naeringsliv");
  assert.equal(place.fagverk.subject_ids[0], "naeringsliv");
  assert.ok(place.fagverk.emne_ids.some((id) => id.startsWith("em_naering_")));
  assert.equal(index.filter((item) => item.id === "grand_hotel").length, 1);
  assert.equal(index.find((item) => item.id === "grand_hotel").category, "naeringsliv");
  assert.equal(index.find((item) => item.id === "grand_hotel").sourceFile, "places/naeringsliv/oslo/grand_hotel.json");
  assert.ok(manifest.files.includes("places/naeringsliv/oslo/grand_hotel.json"));
  assert.ok(!manifest.files.includes("places/media/oslo/grand_hotel.json"));
  assert.ok(!existsSync(new URL("../data/places/media/oslo/grand_hotel.json", import.meta.url)));
  assert.equal(runtime.place.category, "naeringsliv");
  assert.equal(runtime.place.sourceFile, "places/naeringsliv/oslo/grand_hotel.json");
  assert.equal(production.placeFile, paths.place);
  assert.equal(production.metadataSnapshot.category, "naeringsliv");
  assert.equal(registry.placeLinks.grand_hotel.sourceFile, "places/naeringsliv/oslo/grand_hotel.json");
});

test("Grand Hotel quiz and QuizCards use the same Næringsliv ownership", () => {
  const fagManifest = readJson("data/fag/fag_manifest.json");
  const quizManifest = readJson("data/quiz/manifest.json");
  const mediaCards = readJson("data/quizcards/media/manifest.json");
  const naeringCards = readJson("data/quizcards/naeringsliv/manifest.json");
  const quiz = readJson(paths.quiz);
  const brief = readJson(paths.brief);
  const context = readJson(paths.context);
  const card = readJson(paths.card);
  const emner = readJson("data/fag/naeringsliv/emner_naeringsliv_canonical_v4_5.json");
  const emneIds = new Set(emner.map((item) => item.emne_id));
  const questions = quiz.sets.flatMap((set) => set.questions);
  const claims = new Map(brief.claims.map((claim) => [claim.claim_id, claim]));
  const questionById = new Map(questions.map((item) => [item.id, item]));

  assert.equal(fagManifest.media.quizProduction.targets.grand_hotel, undefined);
  assert.equal(fagManifest.naeringsliv.quizProduction.targets.grand_hotel.quiz_file,
    "../quiz/naeringsliv/grand_hotel_sets.json");
  const activeSets = quizManifest.sets.filter((item) => item.targetId === "grand_hotel");
  assert.equal(activeSets.length, 3);
  assert.ok(activeSets.every((item) => item.categoryId === "naeringsliv" && item.file === paths.quiz));
  assert.equal(quiz.categoryId, "naeringsliv");
  assert.deepEqual(quiz.sets.map((s) => s.set_id),
    ["naeringsliv_grand_hotel_set_1", "naeringsliv_grand_hotel_set_2", "naeringsliv_grand_hotel_set_3"]);
  assert.deepEqual(activeSets.map((s) => s.set_id), quiz.sets.map((s) => s.set_id));
  assert.equal(brief.categoryId, "naeringsliv");
  assert.equal(context.categoryId, "naeringsliv");
  assert.equal(quiz.production_context.manifest_category, "naeringsliv");
  assert.equal(quiz.production_context.source_brief, paths.brief);
  assert.equal(quiz.production_context.context_artifact, paths.context);
  assert.equal(questions.length, 21);
  assert.equal(new Set(questions.map((q) => q.id)).size, 21);
  assert.ok(questions.every((q) => /^media_grand_hotel_set_[1-3]_q[1-7]$/.test(q.quiz_id)),
    "eksisterende quiz_id beholdes for lagret framdrift og Knowledge");
  assert.ok(questions.every((q) => /^ku_media_/.test(q.primary_knowledge_unit_id)),
    "eksisterende Knowledge-unit-ID-er beholdes ved kategoriflyttingen");
  assert.ok(questions.every((q) => q.knowledge_unit_ids.includes(q.primary_knowledge_unit_id)),
    "primær kunnskapsenhet må fortsatt være koblet");


  for (const question of questions) {
    assert.equal(question.categoryId, "naeringsliv", question.id);
    assert.ok(emneIds.has(question.emne_id), question.id);
    assert.equal(claims.get(question.claim_id)?.emne_id, question.emne_id, question.id);
    assert.ok(question.options.includes(question.answer), question.id);
    assert.equal(question.options[question.answerIndex], question.answer, question.id);
  }

  assert.equal(card.categoryId, "naeringsliv");
  assert.equal(card.cards.reduce((sum, section) => sum + section.questions.length, 0), 10);
  assert.ok(naeringCards.collections.includes("grand_hotel_quizcard_v1.json"));
  assert.ok(!mediaCards.collections.includes("grand_hotel_quizcard_v1.json"));
  assert.ok(!existsSync(new URL("../data/quiz/media/grand_hotel_sets.json", import.meta.url)));
  for (const section of card.cards) {
    assert.equal(section.categoryId, "naeringsliv");
    for (const question of section.questions) {
      const source = questionById.get(question.id);
      assert.ok(source, question.id);
      assert.equal(question.categoryId, "naeringsliv");
      assert.equal(question.sourceQuizFile, paths.quiz);
      assert.equal(question.question, source.question, question.id);
      assert.equal(question.answer, source.answer, question.id);
      assert.equal(question.emne_id, source.emne_id, question.id);
      assert.equal(question.primary_knowledge_unit_id, source.primary_knowledge_unit_id, question.id);
    }
  }
});

test("Grand Hotel is Næringsliv across the generated epoch index", () => {
  const index = readJson("data/epoker/epoke-place-index.json");
  const grandHotelEntries = [];
  function visit(node) {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== "object") return;
    if (node.place_id === "grand_hotel") grandHotelEntries.push(node);
    Object.values(node).forEach(visit);
  }
  visit(index);
  assert.ok(grandHotelEntries.length >= 1, "Grand Hotel må være med i epokeindeksen");
  for (const place of grandHotelEntries) {
    assert.equal(place.category, "naeringsliv");
    assert.equal(place.source_file, "places/naeringsliv/oslo/grand_hotel.json");
  }
});
