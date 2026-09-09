import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const specialSource = fs.readFileSync("js/ui/place-sheet/sections/special-sections.ts", "utf8");
const registrySource = fs.readFileSync("js/ui/place-sheet/place-section-registry.ts", "utf8");
const queueSource = fs.readFileSync("js/ui/place-sheet/place-sheet-render-queue.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet-special.css", "utf8");

function makeDom(place) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body class="hg-app">
    <div id="placeCard" class="is-unified-place is-place-sheet-phase1">
      <div class="pc-body">
        <section class="pc-sheet-shell" data-hg-place-sheet-shell="1" data-place-id="${place.id}">
          <div data-hg-place-sheet-section="about">Om</div>
          <section data-hg-place-sheet-section="history">Historie</section>
          <section data-hg-place-sheet-section="stories">Fortellinger</section>
          <section data-hg-place-sheet-section="before-after">Før/etter</section>
          <section data-hg-place-sheet-section="news">Nyheter</section>
          <section data-hg-place-sheet-section="reading">Lesespor</section>
          <section data-hg-place-sheet-section="language">Språk</section>
          <section data-hg-place-sheet-section="learning"><div class="hg-place-learning-section">Fagverk</div></section>
          <section data-hg-place-sheet-section="sources">Kilder</section>
        </section>
        <section id="pcUnifiedKnowledgeHost"><div class="hg-popup place-popup-v2"><article class="hg-place-popup-v2"><div class="hg-place-popup-body"></div></article></div></section>
      </div>
    </div>
  </body></html>`, {
    url: "https://history-go.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.PLACES = [place];
  window.openPlaceCard = async value => value;
  window.showPlacePopup = () => null;
  window.showPlacePopup.__hgPlacePopupV2 = true;
  window.showPlacePopup.__hgPlacePopupTabs = true;
  window.showPlacePopup.__hgPlacePopupDirectTabs = true;
  window.__HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__ = true;
  window.HGPlacePopupTabs = {};
  window.HGPlacePopupDirectTabs = {};
  window.HGPlacePopupSportTraining = { isSportsPlace: value => String(value?.category || "").toLowerCase() === "sport" };
  return dom;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

test("Phase 5 keeps canonical owners and adds no synthetic task data owner", () => {
  assert.match(specialSource, /\.hg-place-nature-section/);
  assert.match(specialSource, /data-hg-sport-training/);
  assert.doesNotMatch(specialSource, /fetch\(/);
  assert.doesNotMatch(specialSource, /task_profile/);
  assert.match(registrySource, /"special"/);
  assert.match(registrySource, /placeSheetSectionApplies/);
  assert.match(queueSource, /placeSheetSectionApplies\(id, placeId\)/);
  assert.match(queueSource, /id === "sources" \|\| id === "special"/);
  assert.match(shellSource, /sections\/special-sections/);
  assert.match(shellSource, /data-hg-place-sheet-onsite/);
  assert.match(shellSource, /pcEventsBox/);
});

test("Natur keeps exact DOM identity when adopted into the Place Sheet", async () => {
  const place = { id: "natur_place", name: "Natur", category: "Natur", placeTier: "standard" };
  const dom = makeDom(place);
  const { window } = dom;
  const body = window.document.querySelector("#pcUnifiedKnowledgeHost .hg-place-popup-body");
  const nature = window.document.createElement("section");
  nature.className = "hg-section hg-place-section hg-place-nature-section";
  nature.innerHTML = "<h3>Natur og landskap</h3><p>Canonical natur</p>";
  body.appendChild(nature);

  window.eval(runtimeSource);
  const queue = window.HGPlaceSheetRenderQueue.start(place.id);
  assert.ok(queue);
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: place.id } }));
  await queue.done;

  const slot = window.document.querySelector('[data-hg-place-sheet-section="special"]');
  assert.ok(slot);
  assert.equal(slot.hidden, false);
  assert.equal(slot.querySelector(".hg-place-nature-section"), nature, "canonical Nature node must be moved, not cloned");
  assert.equal(window.document.querySelectorAll(".hg-place-nature-section").length, 1);
  assert.equal(window.HGPlaceSheetRenderQueue.current().sections.special, "rendered");
  assert.equal(window.HGPlaceSheetRenderQueue.current().phase, "full-ready");
  dom.window.close();
});

test("late canonical Sport/Trening injection is adopted before full-ready", async () => {
  const place = {
    id: "sport_place",
    name: "Sport",
    category: "Sport",
    placeTier: "standard",
    sport_profile: { discipline: "test" },
    training_profile: { summary: "Tren her", exercises: [{ title: "Intervall" }] }
  };
  const dom = makeDom(place);
  const { window } = dom;
  window.eval(runtimeSource);

  const queue = window.HGPlaceSheetRenderQueue.start(place.id);
  assert.ok(queue);
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: place.id } }));

  await wait(40);
  const body = window.document.querySelector("#pcUnifiedKnowledgeHost .hg-place-popup-body");
  const training = window.document.createElement("section");
  training.className = "hg-section hg-place-section hg-place-sport-training-section";
  training.setAttribute("data-hg-sport-training", "1");
  training.innerHTML = "<h3>Trening</h3><p>Canonical trening</p>";
  body.appendChild(training);

  await queue.done;
  const slot = window.document.querySelector('[data-hg-place-sheet-section="special"]');
  assert.ok(slot);
  assert.equal(slot.querySelector('[data-hg-sport-training="1"]'), training, "late owner node must remain the same node");
  assert.equal(window.HGPlaceSheetRenderQueue.current().sections.special, "rendered");
  assert.equal(window.HGPlaceSheetRenderQueue.current().phase, "full-ready");
  dom.window.close();
});

test("ordinary places omit special immediately instead of waiting for a special timeout", async () => {
  const place = { id: "ordinary_place", name: "Ordinary", category: "By", placeTier: "standard" };
  const dom = makeDom(place);
  const { window } = dom;
  window.eval(runtimeSource);

  const queue = window.HGPlaceSheetRenderQueue.start(place.id);
  assert.ok(queue);
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: place.id } }));
  const started = Date.now();
  await queue.done;
  const elapsed = Date.now() - started;

  assert.equal(window.HGPlaceSheetRenderQueue.current().sections.special, "omitted");
  assert.equal(window.HGPlaceSheetRenderQueue.current().phase, "full-ready");
  assert.ok(elapsed < 1000, `ordinary special resolution should not wait for the 1800ms compatibility timeout; got ${elapsed}ms`);
  dom.window.close();
});

test("special profile stylesheet keeps owner sections responsive", () => {
  assert.match(css, /pc-sheet-special/);
  assert.match(css, /hg-place-nature-grid/);
  assert.match(css, /hg-place-sport-training-list/);
  assert.match(css, /@media \(max-width:720px\)/);
});
