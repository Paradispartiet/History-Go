import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => JSON.parse(readFileSync(new URL("../" + file, import.meta.url), "utf8"));
const full = read("data/quiz/historie/villa_stenersen_sets.json");
const card = read("data/quizcards/historie/villa_stenersen_quizcard_v1.json");
const brief = read("data/quiz/production_briefs/historie/villa_stenersen.json");
const place = read("data/places/historie/oslo/places_historie_added_batch_01/villa_stenersen.json");
const all = full.sets.flatMap((s) => s.questions);
const byId = new Map(all.map((q) => [q.id, q]));

test("Villa Stenersen: 3 × 7 questions with original answers and verified source IDs", () => {
  assert.equal(full.targetId, "villa_stenersen");
  assert.deepEqual(full.sets.map((s) => s.questions.length), [7, 7, 7]);
  assert.deepEqual(full.sets.map((s) => s.phase), ["opening", "bridge", "final"]);
  assert.equal(all.length, 21);
  assert.equal(new Set(all.map((q) => q.id)).size, 21);
  assert.equal(new Set(all.map((q) => q.quiz_id)).size, 21);
  for (const question of all) {
    assert.equal(question.targetId, "villa_stenersen");
    assert.equal(question.options[question.answerIndex], question.answer);
    assert.ok(question.knowledge.length > 35);
    assert.ok(brief.claims.some((c) => c.claim_id === question.claim_id));
    assert.ok(question.source.every((id) => brief.sources[id]?.review_status === "reviewed"));
    assert.ok(question.source_urls.every((url) => url.startsWith("https://")));
  }
  const directDates = all.filter((q) => /^Når (stod|ble|fikk|åpnet)/u.test(q.question));
  assert.equal(directDates.length, 1);
});

test("Villa Stenersen: QuizCard reuses exactly 10 original fullquiz questions", () => {
  assert.equal(card.cards.length, 1);
  const questions = card.cards[0].questions;
  assert.equal(questions.length, 10);
  assert.equal(new Set(questions.map((q) => q.sourceQuestionId)).size, 10);
  for (const question of questions) {
    const source = byId.get(question.sourceQuestionId);
    assert.ok(source, "Missing fullquiz question: " + question.sourceQuestionId);
    for (const field of ["question", "answer", "answerIndex", "knowledge", "quiz_id"]) {
      assert.deepEqual(question[field], source[field]);
    }
    assert.deepEqual(question.options, source.options);
  }
});

test("Villa Stenersen: Fagverk and licensed image are retained", () => {
  assert.equal(place.year, 1939);
  assert.equal(place.fagverk?.article?.length, 3);
  assert.equal(place.fagverk?.lenses?.length, 3);
  assert.match(place.imageMeta?.license || "", /CC BY-SA/u);
  assert.match(place.frontImageMeta?.license || "", /CC BY-SA/u);
  assert.match(place.image || "", /villa_stenersen_hero\.webp/u);
  assert.match(place.frontImage || "", /villa_stenersen_portrait\.webp/u);
});


test("Villa Stenersen: canonical production context matches the released quiz", () => {
  const context = read("data/quiz/production_context/historie/villa_stenersen.json");
  assert.equal(context.categoryId, "historie");
  assert.equal(context.targetId, full.targetId);
  assert.equal(context.planned_quiz_file, "data/quiz/historie/villa_stenersen_sets.json");
  assert.equal(context.source_review_status, "reviewed");
  assert.equal(context.profile_decision?.set_count, full.sets.length);
  assert.equal(context.profile_decision?.questions_per_set, 7);
});

test("Villa Stenersen: generated production context matches the 21 reviewed source claims", () => {
  const context = read("data/quiz/production_context/historie/villa_stenersen.json");
  assert.equal(context.targetId, "villa_stenersen");
  assert.equal(context.categoryId, "historie");
  assert.equal(context.source_review_status, "reviewed");
  assert.equal(context.claim_bank.length, 21);
  assert.equal(context.set_plan.length, 3);
  assert.equal(context.question_balance.total, 21);
});

test("Villa Stenersen: all 21 questions and ten QuizCard entries link to published Knowledge units", () => {
  const units = new Set(read("data/knowledge/knowledge_units.generated.json").units.map((u) => u.knowledge_unit_id));
  for (const question of all) {
    assert.equal(question.knowledge_link_status, "linked", question.id);
    assert.ok(question.primary_knowledge_unit_id, question.id);
    assert.ok(question.knowledge_unit_ids?.includes(question.primary_knowledge_unit_id), question.id);
    assert.ok(question.knowledge_unit_ids.every((id) => units.has(id)), question.id);
  }
  for (const question of card.cards[0].questions) {
    const original = byId.get(question.sourceQuestionId);
    assert.deepEqual(question.knowledge_unit_ids, original.knowledge_unit_ids, question.id);
    assert.equal(question.primary_knowledge_unit_id, original.primary_knowledge_unit_id, question.id);
  }
});


test("Villa Stenersen: published manifests and Fagverk registry stay in sync", () => {
  const manifest = read("data/quiz/manifest.json");
  const quizRefs = manifest.sets.filter((entry) => entry.targetId === "villa_stenersen");
  assert.equal(quizRefs.length, 3);
  assert.deepEqual(quizRefs.map((entry) => entry.set_id).sort(), full.sets.map((set) => set.set_id).sort());
  const cardManifest = read("data/quizcards/historie/manifest.json");
  assert.ok(cardManifest.collections.includes("villa_stenersen_quizcard_v1.json"));
  const fagverk = read("data/fagverk/fagverk_registry.json");
  assert.equal(fagverk.placeLinks.villa_stenersen?.status, "curated");
});
