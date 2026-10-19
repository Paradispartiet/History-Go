import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import vm from "node:vm";
import test from "node:test";

const read = file => fs.readFileSync(file, "utf8");
const json = file => JSON.parse(read(file));
const batch = json("data/places/production-tiers/v1-oslo-quizcards-20261019-batch03.json");
const collection = row => json(row.quizcard_file).cards.find(card => card.targetId === row.place_id);
const load = async file => {
  try { return json(path.join("data/quizcards", file)); } catch { return null; }
};

test("all twenty cards preserve ten distinct active questions, answers and Knowledge references", () => {
  const active = json("data/quiz/manifest.json").sets;
  assert.equal(batch.places.length, 20);
  assert.equal(new Set(batch.places.map(row => row.place_id)).size, 20);
  for (const row of batch.places) {
    assert.ok(active.some(item => item.targetId === row.place_id && item.file === row.quiz_file));
    assert.equal(crypto.createHash("sha256").update(read(row.quiz_file)).digest("hex"), row.quiz_sha256,
      row.place_id + ": source quiz must remain unchanged");
    const card = collection(row);
    assert.equal(card.categoryId, row.category);
    assert.equal(card.questions.length, 10);
    assert.equal(new Set(card.questions.map(q => q.question)).size, 10);
    assert.equal(card.answerKey.length, 10);
    const source = json(row.quiz_file).sets.flatMap(set => set.questions);
    for (const [index, q] of card.questions.entries()) {
      const original = source.find(item => item.id === q.sourceQuestionId);
      assert.ok(original, q.sourceQuestionId);
      for (const field of ["question", "options", "answer", "primary_knowledge_unit_id", "knowledge_unit_ids"])
        assert.deepEqual(q[field], original[field], q.sourceQuestionId + ": " + field);
      assert.equal(q.options[q.answerIndex], q.answer);
      assert.equal(q.number, index + 1);
      assert.deepEqual(card.answerKey[index], {number: index + 1, answer: q.answer, answerIndex: q.answerIndex});
      assert.ok(q.source_urls.length && q.source_urls.every(url => /^https?:\/\//.test(url)));
      assert.ok(q.reviewed_source_urls.length && q.reviewed_source_urls.every(url =>
        q.source_urls.includes(url) && batch.reviewed_source_urls.includes(url)));
      assert.ok(q.knowledge.length > 20);
      assert.doesNotMatch(q.question, /History Go|flatquiz|targetet|place-filen|næringslivslesning|korrigert/i);
    }
    const manifest = json("data/quizcards/" + row.category + "/manifest.json");
    // Runtime ignores pre-existing unavailable legacy collections. A missing new
    // collection still fails the exact-one-target assertion below.
    const cards = manifest.collections.flatMap(file => {
      const filename = "data/quizcards/" + row.category + "/" + file;
      return fs.existsSync(filename) ? json(filename).cards || [] : [];
    });
    assert.equal(cards.filter(item => item.targetId === row.place_id).length, 1, row.place_id + ": duplicate card");
  }
});

test("shipping PlaceCard resolver reaches all twenty cards through real category manifests", async () => {
  const source = read("js/ui/place-card.js");
  const begin = source.indexOf("const PLACE_CARD_QUIZ_CARD_MANIFEST_PATHS");
  const end = source.indexOf("\n/**", source.indexOf("function renderPlaceCardQuizData(", begin));
  assert.ok(begin > 0 && end > begin);
  const sandbox = {window:{DataHub:{loadQuizCardsCollection:load}},
    fetch: async file => ({ok:true,json:async () => json(file)}),
    escapePlaceCardHTML: text => String(text ?? ""), tUI: (_key, fallback) => fallback};
  vm.createContext(sandbox);
  vm.runInContext(source.slice(begin, end) + "\nglobalThis.resolveCard=resolvePlaceCardQuizData;", sandbox);
  for (const row of batch.places) {
    const card = await sandbox.resolveCard({id:row.place_id,category:row.category});
    assert.equal(card?.targetId, row.place_id);
    assert.equal(card.questions.length, 10);
  }
});

test("shipping compatibility controller also resolves every card, including Næringsliv", async () => {
  const { JSDOM } = await import("jsdom");
  const dom = new JSDOM('<button id="pcFrontCardFlip"></button><div id="pcQuizCardContent" hidden></div><img id="pcQuizCardImage">',
    {url:"https://history-go.test",runScripts:"outside-only"});
  try {
    dom.window.TEST_MODE = true;
    dom.window.openPlaceCard = async () => true;
    dom.window.DataHub = {loadQuizCardsCollection:load};
    dom.window.eval(read("js/ui/place-card-quizcards-patch.js"));
    for (const row of batch.places) {
      await dom.window.openPlaceCard({id:row.place_id,category:row.category});
      const content = dom.window.document.getElementById("pcQuizCardContent");
      assert.equal(content.hidden, false);
      assert.equal(content.querySelector("h3").textContent, collection(row).title);
      assert.equal(content.querySelectorAll("li").length, 10);
    }
  } finally { dom.window.close(); }
});
