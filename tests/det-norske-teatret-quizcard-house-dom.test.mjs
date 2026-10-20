import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const manifest = read("data/quizcards/scenekunst/manifest.json");
const collection = read("data/quizcards/scenekunst/scenekunst_oslo_v1_batch1.json");
const quiz = read("data/quiz/musikk/det_norske_teatret_sets_merged.json");
const expectedIds = [
  "musikk_det_norske_teatret_set_1_q1",
  "musikk_det_norske_teatret_set_1_q2",
  "musikk_det_norske_teatret_set_1_q4",
  "musikk_det_norske_teatret_set_2_q1",
  "musikk_det_norske_teatret_set_3_q1",
  "musikk_det_norske_teatret_set_3_q2",
  "musikk_det_norske_teatret_set_3_q3",
  "musikk_det_norske_teatret_set_3_q5",
  "musikk_det_norske_teatret_set_3_q6",
  "musikk_det_norske_teatret_set_4_q3"
];

test("DNT QuizCard retains the unique canonical ID with place-focused 1912/1913/1985 chronology", () => {
  assert.ok(manifest.collections.includes("scenekunst_oslo_v1_batch1.json"));
  const cards = collection.cards.filter(c => c.targetId === "det_norske_teatret");
  assert.equal(cards.length, 1, "No competing DNT QuizCards");
  const card = cards[0];
  assert.equal(card.card_id, "scenekunst_quizkort_v1_det_norske_teatret");
  assert.equal(card.categoryId, "scenekunst");
  assert.equal(card.questionCount, 10);
  assert.deepEqual(card.questions.map(q=>q.sourceQuizId), expectedIds);
  const source = quiz.sets.flatMap(s=>s.questions);
  assert.equal(quiz.categoryId, "musikk");
  assert.equal(source.length, 30, "Original 5x6 quiz must not be reduced");
  const byId = new Map(source.map(q=>[q.quiz_id,q]));
  assert.equal(byId.size, 30);
  for (const [i,c] of card.questions.entries()) {
    const q=byId.get(c.sourceQuizId);
    assert.ok(q, c.sourceQuizId);
    assert.equal(c.number, i+1);
    assert.equal(c.sourceQuestionId, q.id);
    assert.equal(c.question, q.question);
    assert.deepEqual(c.options, q.options);
    assert.equal(c.answer, q.answer);
    assert.equal(c.answerIndex, q.answerIndex);
    assert.equal(c.options[c.answerIndex], c.answer);
    assert.equal(c.emne_id, q.emne_id);
    assert.equal(c.knowledge, q.knowledge);
    assert.deepEqual(c.source_refs, q.source);
    assert.deepEqual(c.source_urls, q.source.filter(v=>v.startsWith("https://")));
    assert.ok(c.source_urls.length);
    assert.deepEqual(card.answerKey[i], {number:i+1,answer:q.answer,answerIndex:q.answerIndex});
  }
  const answers=card.questions.map(q=>q.answer);
  assert.ok(answers.includes("22. november 1912"), "Institution is founded in 1912, not house");
  assert.ok(answers.includes("Kristiansand"), "First performance happened in 1913 away from today's building");
  assert.ok(answers.includes("6. oktober 1913"), "Kristiania institution opening is historical context");
  assert.ok(answers.includes("1985"), "Current theatre building opening must appear");
  assert.ok(answers.includes("Romeo og Julie"), "1985 opening performance must appear");
  assert.ok(answers.includes("A/S Arkitektkontoret 4B"), "Architecture belongs to the current building");
});

test("DNT PlaceCard adapter displays the canonical Scenekunst QuizCard through the real manifest", async () => {
  const dom=new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="det_norske_teatret">
      <button id="pcFrontCardFlip" aria-label="Quizkort mangler"></button>
      <div id="pcQuizCardContent" hidden></div>
      <img id="pcQuizCardImage" alt="">
    </div>
  </body>`,{url:"https://history-go.test/",runScripts:"outside-only"});
  try {
    const w=dom.window;
    const requested=[];
    w.TEST_MODE=true;
    w.visited={};
    w.HG_I18N={t:(_key,fallback)=>fallback};
    w.openPlaceCard=async()=>true;
    w.DataHub={loadQuizCardsCollection:async path=>{
      requested.push(path);
      if(path==="scenekunst/manifest.json")return manifest;
      if(path==="scenekunst/scenekunst_oslo_v1_batch1.json")return collection;
      return null;
    }};
    w.eval(fs.readFileSync("js/ui/place-card-quizcards-patch.js","utf8"));
    await w.openPlaceCard({id:"det_norske_teatret",name:"Det Norske Teatret",category:"scenekunst"});
    const flip=w.document.getElementById("pcFrontCardFlip");
    const content=w.document.getElementById("pcQuizCardContent");
    assert.ok(requested.includes("scenekunst/manifest.json"));
    assert.ok(requested.includes("scenekunst/scenekunst_oslo_v1_batch1.json"));
    assert.equal(flip.getAttribute("aria-label"),"Vis quizkort");
    assert.equal(content.hidden,false);
    assert.ok(flip.classList.contains("has-quiz-card"));
    assert.match(content.textContent,/Scenekunstquiz/);
    assert.match(content.textContent,/1985/);
    assert.match(content.textContent,/Romeo og Julie/);
    assert.match(content.textContent,/Det Norske Teatret/);
    assert.equal(content.querySelectorAll(".pc-rendered-quiz-list li").length,10);
  } finally {dom.window.close();}
});
