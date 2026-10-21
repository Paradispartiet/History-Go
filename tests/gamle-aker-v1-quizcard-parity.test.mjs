import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

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

test("All 21 canonical fullquiz questions have unambiguous answers, sources and Knowledge links", () => {
  const ids = new Set();
  for (const question of allQuestions) {
    assert.ok(question.id && !ids.has(question.id), "Missing or duplicate fullquiz question ID");
    ids.add(question.id);
    assert.ok(question.question?.trim());
    assert.ok(question.knowledge?.trim());
    assert.ok(question.claim_id?.trim(), "Missing claim: " + question.id);
    assert.ok(question.quiz_id?.trim(), "Missing quiz ID: " + question.id);
    assert.ok(question.options.length >= 3, "Too few options: " + question.id);
    assert.equal(new Set(question.options).size, question.options.length, "Repeated options: " + question.id);
    assert.equal(question.options[question.answerIndex], question.answer, "Bad answerIndex: " + question.id);
    assert.ok(question.source.length > 0, "No source: " + question.id);
    assert.ok(question.source.every(ref => /^https:\/\//.test(quiz.sources[ref])), "Unresolved source: " + question.id);
    assert.ok(question.primary_knowledge_unit_id?.trim(), "Missing Knowledge ID: " + question.id);
    assert.ok(question.knowledge_unit_ids.includes(question.primary_knowledge_unit_id), "Broken Knowledge parity: " + question.id);
    assert.doesNotMatch(question.question, /History Go|quizkort|hovedtema|hva bør.*kort formidle/i);
  }
  assert.equal(ids.size, 21);
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

test("Gamle Aker QuizCard resolves and renders through the existing PlaceCard loader", async () => {
  const bundle = fs.readFileSync("js/ui/place-card-quizcards-patch.js", "utf8");
  const dom = new JSDOM(`<!doctype html><body>
    <button id="pcFrontCardFlip" aria-label="Quizkort mangler"></button>
    <div id="pcQuizCardContent" hidden></div>
    <img id="pcQuizCardImage" alt="">
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  try {
    const { window } = dom;
    const paths = [];
    window.TEST_MODE = true;
    window.visited = {};
    window.HG_I18N = { t: (_key, fallback) => fallback };
    window.openPlaceCard = async () => true;
    window.DataHub = {
      loadQuizCardsCollection: async path => {
        paths.push(path);
        if (path === "historie/manifest.json") return { collections: [batchName] };
        if (path === "historie/" + batchName) return collection;
        return null;
      }
    };
    window.eval(bundle);
    await window.openPlaceCard({ id: "gamle_aker_kirke", name: "Gamle Aker kirke", category: "historie" });
    assert.ok(paths.includes("historie/manifest.json"));
    assert.ok(paths.includes("historie/" + batchName));
    const flip = window.document.getElementById("pcFrontCardFlip");
    const content = window.document.getElementById("pcQuizCardContent");
    assert.equal(flip.getAttribute("aria-label"), "Vis quizkort");
    assert.equal(content.hidden, false);
    assert.match(content.textContent, /Gamle Aker kirke/);
    assert.match(content.textContent, /Hva kan være synlig i kalksteinen/);
    assert.doesNotMatch(content.textContent, /hva bør et godt.*kort formidle/i);
  } finally {
    dom.window.close();
  }
});
