import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const placeId = "det_norske_teatret";
const category = "scenekunst";
const manifestPath = "data/quizcards/scenekunst/manifest.json";
const sourcePath = "data/quiz/musikk/det_norske_teatret_sets_merged.json";
const workcardPath = "reports/place-production/det-norske-teatret-workcard-current.json";
const read = (filename) => JSON.parse(fs.readFileSync(filename, "utf8"));

function findPublishedCard() {
  const manifest = read(manifestPath);
  assert.equal(manifest.categoryId, category);
  const cards = manifest.collections.flatMap((filename) => {
    const collection = read(path.join("data/quizcards/scenekunst", filename));
    assert.equal(collection.categoryId, category);
    return collection.cards ?? [];
  });
  const matches = cards.filter((card) => card.targetId === placeId);
  assert.equal(matches.length, 1, "Det Norske Teatret must have exactly one Scenekunst QuizCard");
  return matches[0];
}

test("Det Norske Teatret has one published ten-question QuizCard wired through Scenekunst", () => {
  const card = findPublishedCard();
  assert.equal(card.card_id, "scenekunst_quizkort_v1_det_norske_teatret");
  assert.equal(card.categoryId, category);
  assert.equal(card.sourceFile, sourcePath);
  assert.equal(card.format, "single_surface_top10_with_answer_key");
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions.length, 10);
  assert.equal(card.answerKey.length, 10);
  const runtime = fs.readFileSync("js/ui/place-card.js", "utf8");
  assert.ok(runtime.includes('"data/quizcards/scenekunst/manifest.json"'), "canonical PlaceCard must load the Scenekunst manifest");
});

test("the ten QuizCard questions retain exact canonical quiz identity, options, answers and source links", () => {
  const card = findPublishedCard();
  const source = read(sourcePath);
  assert.equal(source.targetId, placeId);
  assert.equal(source.sets.length, 5);
  const allQuestions = source.sets.flatMap((set) => set.questions);
  assert.equal(allQuestions.length, 30);
  const sourceById = new Map(allQuestions.map((q) => [q.quiz_id, q]));
  const selectedIds = new Set();
  for (const [index, question] of card.questions.entries()) {
    assert.equal(question.number, index + 1);
    assert.ok(!selectedIds.has(question.sourceQuizId), "duplicate source question");
    selectedIds.add(question.sourceQuizId);
    const canonical = sourceById.get(question.sourceQuizId);
    assert.ok(canonical, question.sourceQuizId + " must resolve to the canonical quiz");
    assert.equal(question.sourceQuestionId, canonical.id);
    assert.equal(question.question, canonical.question);
    assert.deepEqual(question.options, canonical.options);
    assert.equal(question.answer, canonical.answer);
    assert.equal(question.answerIndex, canonical.answerIndex);
    assert.equal(question.options[question.answerIndex], question.answer);
    assert.deepEqual(card.answerKey[index], { number: index + 1, answer: question.answer, answerIndex: question.answerIndex });
    assert.ok(question.source_urls.length > 0, "no anonymous historical claim");
    for (const url of question.source_urls) {
      assert.match(url, /^https:\/\//);
      assert.ok(canonical.source.includes(url), url + " must be traced to the canonical question");
    }
  }
});

test("1912 founding, 1913 first performances and the 1985 building stay separate", () => {
  const card = findPublishedCard();
  const answers = card.questions.map((q) => q.answer);
  assert.ok(answers.includes("22. november 1912"), "institutional founding must remain 1912");
  assert.ok(answers.includes("Kristiansand"), "the first performance was not at the present Oslo building");
  assert.ok(answers.includes("6. oktober 1913"), "Kristiania performances must remain 1913");
  const workcard = read(workcardPath);
  assert.equal(workcard.place_id, placeId);
  assert.match(workcard.identity, /1985/);
  assert.match(workcard.content_plan.stories, /Bøndernes Hus/);
  assert.equal(workcard.status, "in_progress", "published v1 quiz does not close major Place production");
});

test("the workcard no longer misreports an already-published v1 QuizCard as missing", () => {
  const workcard = read(workcardPath);
  assert.match(workcard.content_plan.quizcard, /V1_PUBLISHED/);
  assert.match(workcard.content_plan.quizcard, /scenekunst_oslo_v1_batch1\.json/);
  assert.notEqual(workcard.checkpoints.find((item) => item.id === "quiz_revision")?.status, "NOT_STARTED");
  assert.equal(workcard.manual_reviews.final_ui.status, "PENDING");
});
