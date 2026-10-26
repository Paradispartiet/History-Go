import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

// Exercises the actual shipped PlaceCard quiz-card controller, not a copied renderer.
test("Gamle Aker kirke resolves its existing, source-linked QuizCard in PlaceCard", async () => {
  const manifest = JSON.parse(fs.readFileSync("data/quizcards/historie/manifest.json", "utf8"));
  const collectionName = "topp10_historie_sted_kort_batch1.json";
  assert.ok(manifest.collections.includes(collectionName));
  const collection = JSON.parse(fs.readFileSync("data/quizcards/historie/" + collectionName, "utf8"));
  const card = collection.cards.find(entry => entry.targetId === "gamle_aker_kirke");
  assert.ok(card, "The canonical place must already have one card in the batch");

  const dom = new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="gamle_aker_kirke"></div>
    <button id="pcFrontCardFlip" aria-label="Quizkort mangler"></button>
    <div id="pcQuizCardContent" hidden></div>
    <img id="pcQuizCardImage" alt="">
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  const requested = [];
  window.TEST_MODE = true;
  window.visited = {};
  window.HG_I18N = { t: (_key, fallback) => fallback };
  window.openPlaceCard = async () => true;
  window.DataHub = {
    loadQuizCardsCollection: async path => {
      requested.push(path);
      if (path === "historie/manifest.json") return manifest;
      if (path === "historie/" + collectionName) return collection;
      return null;
    }
  };

  try {
    window.eval(fs.readFileSync("js/ui/place-card-quizcards-patch.js", "utf8"));
    const result = await window.openPlaceCard({
      id: "gamle_aker_kirke", name: "Gamle Aker kirke", category: "historie"
    });
    assert.equal(result, true);
    assert.ok(requested.includes("historie/manifest.json"));
    assert.ok(requested.includes("historie/" + collectionName));
    const rendered = window.document.getElementById("pcQuizCardContent");
    assert.equal(rendered.hidden, false);
    assert.equal(rendered.querySelectorAll("li").length, 10);
    assert.match(rendered.textContent, /Historiequiz/);
    assert.match(rendered.textContent, /Fossiler etter ortocerer/);
    assert.match(rendered.textContent, /Christiania kjøpte kirken/);
    const flip = window.document.getElementById("pcFrontCardFlip");
    assert.ok(flip.classList.contains("has-quiz-card"));
    assert.equal(flip.getAttribute("aria-label"), "Vis quizkort");
  } finally {
    dom.window.close();
  }
});
