import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root = "data/quizcards/historie";
const manifest = JSON.parse(fs.readFileSync(root + "/manifest.json", "utf8"));
const batchName = "topp10_historie_sted_kort_batch1.json";
const collection = JSON.parse(fs.readFileSync(root + "/" + batchName, "utf8"));
const quiz = JSON.parse(fs.readFileSync("data/quiz/historie/gamle_aker_kirke_sets.json", "utf8"));
const place = JSON.parse(fs.readFileSync("data/places/historie/oslo/places_historie/gamle_aker_kirke.json", "utf8"));
const allQuestions = quiz.sets.flatMap(set => set.questions);
const cards = collection.cards.filter(card => card.targetId === "gamle_aker_kirke");

test("Gamle Aker has one manifest-linked QuizCard, preserving the 21-question fullquiz", () => {
  assert.ok(manifest.collections.includes(batchName));
  assert.equal(cards.length, 1, "Do not create a second card for the same place");
  assert.equal(quiz.sets.length, 3);
  assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7]);
  assert.equal(new Set(allQuestions.map(question => question.id)).size, 21);
  assert.equal(cards[0].categoryId, "historie");
  assert.equal(cards[0].targetId, place.id);
  assert.equal(cards[0].questionCount, 10);
  assert.equal(cards[0].questions.length, 10);
  assert.equal(cards[0].answerKey.length, 10);
});

test("All ten Gamle Aker card prompts, answers and citations match the canonical quiz", () => {
  const questionsById = new Map(allQuestions.map(question => [question.id, question]));
  const card = cards[0];
  const ids = new Set();
  for (let index = 0; index < card.questions.length; index++) {
    const question = card.questions[index];
    const canonical = questionsById.get(question.sourceQuestionId);
    assert.ok(canonical, "Missing fullquiz source question: " + question.sourceQuestionId);
    assert.ok(!ids.has(canonical.id), "Duplicate question: " + canonical.id);
    ids.add(canonical.id);
    assert.equal(question.number, index + 1);
    assert.equal(question.question, canonical.question);
    assert.deepEqual(question.options, canonical.options);
    assert.equal(question.answerIndex, canonical.answerIndex);
    assert.equal(question.answer, canonical.answer);
    assert.equal(question.options[question.answerIndex], question.answer);
    assert.equal(question.sourceQuizId, canonical.quiz_id);
    assert.deepEqual(question.source_refs, canonical.source);
    assert.deepEqual(question.source_urls, canonical.source.map(ref => quiz.sources[ref]));
    assert.ok(question.source_urls.every(url => /^https:\/\//.test(url)));
    assert.equal(question.knowledge, canonical.knowledge);
    assert.equal(question.claim_id, canonical.claim_id);
    assert.equal(question.primary_knowledge_unit_id, canonical.primary_knowledge_unit_id);
    assert.deepEqual(question.knowledge_unit_ids, canonical.knowledge_unit_ids);
    assert.deepEqual(card.answerKey[index], { number: index + 1, answer: canonical.answer });
    assert.doesNotMatch(question.question, /quizkort|History Go|hovedtema|hva bør.*kort formidle/i);
  }
  assert.ok(card.questions.some(q => /fossil|ortocer/i.test(q.question + " " + q.answer)));
  assert.ok(card.questions.some(q => /riving|rev|1852/i.test(q.question + " " + q.answer)));
  assert.ok(card.questions.some(q => /bygg|alder|reist/i.test(q.question)));
});

test("Gamle Aker photo files and historical-photo provenance remain intact", () => {
  assert.equal(place.imageMeta?.verified, true);
  assert.match(place.imageMeta.sourceUrl, /commons\.wikimedia\.org/);
  assert.ok(place.imageMeta.license);
  for (const path of [place.image, place.cardImage, place.for_na.beforeImage, place.for_na.nowImage]) {
    assert.ok(fs.existsSync(path), "Missing canonical image asset: " + path);
    assert.ok(fs.statSync(path).size > 10_000, "Suspiciously small image asset: " + path);
  }
  assert.match(place.for_na.beforeImageMeta.license, /CC BY-SA/);
  assert.match(place.for_na.beforeImageMeta.sourcePage, /commons\.wikimedia\.org/);
});
