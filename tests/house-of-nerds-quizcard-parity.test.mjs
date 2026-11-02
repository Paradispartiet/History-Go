import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const quiz = read("data/quiz/subkultur/house_of_nerds_sets.json");
const brief = read("data/quiz/production_briefs/subkultur/house_of_nerds.json");
const card = read("data/quizcards/subkultur/house_of_nerds_quizcard_v1.json");
const manifest = read("data/quiz/manifest.json");
const cardManifest = read("data/quizcards/subkultur/manifest.json");
const questions = quiz.sets.flatMap((set) => set.questions);

test("House of Nerds canonical narrow 3x7 with two direct fact opening sets", () => {
  assert.deepEqual(quiz.sets.map((set) => set.phase), ["opening", "bridge", "final"]);
  assert.deepEqual(quiz.sets.map((set) => set.questions.length), [7, 7, 7]);
  assert.equal(questions.length, 21);
  assert.equal(new Set(questions.map((q) => q.id)).size, 21);
  assert.ok(questions.slice(0, 14).every((q) => q.question_type === "fact"));
  assert.deepEqual([0, 1, 2].map((index) => questions.filter((q) => q.answerIndex === index).length), [7, 7, 7]);
});

test("House of Nerds answer, claim and source traceability", () => {
  assert.equal(brief.claims.length, 21);
  const sourceIds = new Set(Object.keys(brief.sources));
  for (const [index, q] of questions.entries()) {
    assert.equal(q.answer, q.options[q.answerIndex], q.id);
    assert.equal(new Set(q.options).size, q.options.length, q.id);
    assert.equal(q.claim_id, brief.claims[index].claim_id, q.id);
    assert.equal(q.claim_basis, brief.claims[index].statement, q.id);
    assert.deepEqual(q.source, brief.claims[index].source_ids, q.id);
    assert.ok(q.source.length > 0 && q.source.every((id) => sourceIds.has(id)), q.id);
    assert.equal(q.placeId, "house_of_nerds");
    assert.equal(q.knowledge_link_status, "linked", q.id);
    assert.ok(q.primary_knowledge_unit_id?.startsWith("ku_"), q.id);
    assert.ok(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id), q.id);
  }
});

test("House of Nerds final learning binds evidence to a bounded theory and method", () => {
  const final = quiz.sets.at(-1).questions;
  assert.equal(quiz.production_context.theory_start_phase, "final");
  assert.equal(quiz.production_context.method_start_phase, "final");
  assert.ok(final.some((q) => q.topic_hook_id === "scene_fellesskap" && q.thinker_id === "will_straw" && q.theory_ref?.why_it_helps?.includes("House of Nerds")));
  assert.ok(final.some((q) => q.method_id === "met_sub_sceneanalyse"));
  assert.ok(final.some((q) => q.method_id === "met_sub_kommersialiseringsanalyse"));
  assert.ok(!questions.slice(0, 14).some((q) => q.topic_hook_id || q.thinker_id || q.theory_ref || q.method_id));
});

test("House of Nerds QuizCard uses first 10 verbatim quiz questions", () => {
  assert.equal(card.cards.length, 1);
  assert.equal(card.cards[0].targetId, "house_of_nerds");
  assert.equal(card.cards[0].questionCount, 10);
  assert.equal(card.cards[0].questions.length, 10);
  for (const [index, item] of card.cards[0].questions.entries()) {
    const q = questions[index];
    for (const key of ["question", "answer", "answerIndex"]) {
      assert.deepEqual(item[key], q[key], `card question ${index + 1}: ${key}`);
    }
    assert.deepEqual(item.options, q.options, `card question ${index + 1} options`);
    assert.equal(item.sourceQuestionId, q.id);
    assert.equal(item.claim_id, q.claim_id);
    assert.equal(item.primary_knowledge_unit_id, q.primary_knowledge_unit_id);
  }
});

test("House of Nerds manifests register the exact canonical quiz and card", () => {
  const quizEntries = manifest.sets.filter((item) => item.targetId === "house_of_nerds");
  assert.equal(quizEntries.length, 3);
  assert.ok(quizEntries.every((item) => item.file === "data/quiz/subkultur/house_of_nerds_sets.json"));
  assert.ok(cardManifest.collections.includes("house_of_nerds_quizcard_v1.json"));
});
