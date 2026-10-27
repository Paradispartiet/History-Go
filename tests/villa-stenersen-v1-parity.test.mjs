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
