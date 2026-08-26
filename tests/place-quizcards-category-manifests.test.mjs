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
    requestedPaths.slice(0, 3).sort(),
    ["by/manifest.json", "historie/manifest.json", "litteratur/manifest.json"]
  );
  assert.ok(requestedPaths.includes("by/topp10_by_kort_batch5.json"));
  assert.equal(window.document.getElementById("pcFrontCardFlip").getAttribute("aria-label"), "Vis quizkort");
  assert.equal(window.document.getElementById("pcQuizCardContent").hidden, false);
  assert.match(window.document.getElementById("pcQuizCardContent").textContent, /Byquiz/);
  assert.match(window.document.getElementById("pcQuizCardContent").textContent, /Olaf Ryes plass/);

  dom.window.close();
});
