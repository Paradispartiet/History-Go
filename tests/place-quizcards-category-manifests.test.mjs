import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

const bundle = fs.readFileSync("js/ui/place-card-quizcards-patch.js", "utf8");

test("place-card quizkort lastes fra stedets by-manifest", async () => {
  const dom = new JSDOM(`<!doctype html><body>
    <button id="pcFrontCardFlip" aria-label="Quizkort mangler"></button>
    <div id="pcQuizCardContent" hidden></div>
    <img id="pcQuizCardImage" alt="">
  </body>`, {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  const requestedPaths = [];

  window.TEST_MODE = true;
  window.visited = {};
  window.HG_I18N = { t: (_key, fallback) => fallback };
  window.openPlaceCard = async () => true;
  window.DataHub = {
    loadQuizCardsCollection: async path => {
      requestedPaths.push(path);
      if (path === "by/manifest.json") {
        return { collections: ["topp10_by_kort_batch5.json"] };
      }
      if (path === "by/topp10_by_kort_batch5.json") {
        return {
          cards: [{
            categoryId: "by",
            targetId: "olaf_ryes_plass",
            title: "Olaf Ryes plass",
            questions: [{ number: 1, question: "Hva slags byrom?", answer: "En plass" }]
          }]
        };
      }
      return null;
    }
  };

  window.eval(bundle);
  await window.openPlaceCard({ id: "olaf_ryes_plass", name: "Olaf Ryes plass" });

  assert.deepEqual(
    requestedPaths.slice(0, 4).sort(),
    ["by/manifest.json", "historie/manifest.json", "litteratur/manifest.json", "scenekunst/manifest.json"]
  );
  assert.ok(requestedPaths.includes("by/topp10_by_kort_batch5.json"));
  assert.equal(window.document.getElementById("pcFrontCardFlip").getAttribute("aria-label"), "Vis quizkort");
  assert.equal(window.document.getElementById("pcQuizCardContent").hidden, false);
  assert.match(window.document.getElementById("pcQuizCardContent").textContent, /Byquiz/);
  assert.match(window.document.getElementById("pcQuizCardContent").textContent, /Olaf Ryes plass/);

  dom.window.close();
});


test("Dramatikkens hus bruker scenekunst-manifestet og rendrer riktig QuizCard", async () => {
  const dom = new JSDOM(`<!doctype html><body>
    <button id="pcFrontCardFlip" aria-label="Quizkort mangler"></button>
    <div id="pcQuizCardContent" hidden></div>
    <img id="pcQuizCardImage" alt="">
  </body>`, {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  const requestedPaths = [];
  const cardCollection = JSON.parse(fs.readFileSync("data/quizcards/scenekunst/dramatikkens_hus_quizkort_v1.json", "utf8"));

  window.TEST_MODE = true;
  window.visited = {};
  window.HG_I18N = { t: (_key, fallback) => fallback };
  window.openPlaceCard = async () => true;
  window.DataHub = {
    loadQuizCardsCollection: async path => {
      requestedPaths.push(path);
      if (path === "scenekunst/manifest.json") {
        return { collections: ["dramatikkens_hus_quizkort_v1.json"] };
      }
      if (path === "scenekunst/dramatikkens_hus_quizkort_v1.json") {
        return cardCollection;
      }
      return null;
    }
  };

  window.eval(bundle);
  await window.openPlaceCard({ id: "dramatikkens_hus", name: "Dramatikkens hus", category: "scenekunst" });

  assert.ok(requestedPaths.includes("scenekunst/manifest.json"));
  assert.ok(requestedPaths.includes("scenekunst/dramatikkens_hus_quizkort_v1.json"));
  assert.equal(window.document.getElementById("pcFrontCardFlip").getAttribute("aria-label"), "Vis quizkort");
  assert.equal(window.document.getElementById("pcQuizCardContent").hidden, false);
  assert.match(window.document.getElementById("pcQuizCardContent").textContent, /Scenekunstquiz/);
  assert.match(window.document.getElementById("pcQuizCardContent").textContent, /Dramatikkens hus/);
  assert.match(window.document.getElementById("pcQuizCardContent").textContent, /liveness/i);

  dom.window.close();
});

test("canonical PlaceCard-loaderen inkluderer scenekunst og keyboard-flip", () => {
  const source = fs.readFileSync("js/ui/place-card.js", "utf8");
  assert.match(source, /data\/quizcards\/scenekunst\/manifest\.json/);
  assert.match(source, /scenekunst\/dramatikkens_hus_quizkort_v1\.json/);
  assert.match(source, /categoryId === "scenekunst"/);
  assert.match(source, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(source, /classList\.toggle\("is-flipped"\)/);
});
