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

function waitFor(predicate, timeoutMs = 1000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (predicate()) return resolve();
      if (Date.now() - started >= timeoutMs) return reject(new Error("Timed out waiting for special Place Sheet state"));
      setTimeout(tick, 10);
    };
    tick();
  });
}

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
      </div>
    </div>
  </body></html>`, {
    url: "https://history-go.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.PLACES = [place];
  window.HGPlacePopupSportTraining = {
    isSportsPlace: value => String(value?.category || "").toLowerCase() === "sport",
    render: value => value?.training_profile
      ? '<section class="hg-section hg-place-section hg-place-sport-training-section" data-hg-sport-training="1"><h3>Trening</h3><p>Canonical trening</p></section>'
      : ''
  };
  return dom;
}

test("special profiles stay owner-backed without popup embedding or synthetic task data", () => {
  assert.match(specialSource, /nature_profile/);
  assert.match(specialSource, /HGPlacePopupSportTraining/);
  assert.match(specialSource, /data-hg-place-sheet-special-owner/);
  assert.doesNotMatch(specialSource, /fetch\(/);
  assert.doesNotMatch(specialSource, /task_profile/);
  assert.doesNotMatch(specialSource, /pcUnifiedKnowledgeHost/);
  assert.doesNotMatch(specialSource, /MutationObserver/);
  assert.match(registrySource, /"special"/);
  assert.match(registrySource, /\["special"\][\s\S]*\["news", "reading"\]/);
  assert.match(registrySource, /placeSheetSectionApplies/);
  assert.match(queueSource, /placeSheetSectionApplies\(id, placeId\)/);
  assert.match(queueSource, /id === "sources" \|\| id === "special"/);
  assert.match(shellSource, /sections\/special-sections/);
  assert.match(shellSource, /data-hg-place-sheet-onsite/);
  assert.match(shellSource, /pcEventsBox/);
});

test("Nature renders directly from the canonical nature profile before full-ready", async () => {
  const place = {
    id: "natur_place",
    name: "Natur",
    category: "Natur",
    placeTier: "standard",
    nature_profile: {
      summary: "Canonical natur",
      terrain: ["skog"],
      habitats: ["våtmark"],
      birding: { notable_species: ["hegre"], seasonal_focus: ["vår"] }
    }
  };
  const dom = makeDom(place);
  const { window } = dom;
  window.eval(runtimeSource);

  const queue = window.HGPlaceSheetRenderQueue.start(place.id);
  assert.ok(queue);
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: place.id, direct: true, phase: 6 } }));
  await queue.done;

  const slot = window.document.querySelector('[data-hg-place-sheet-section="special"]');
  assert.ok(slot);
  assert.equal(slot.hidden, false);
  assert.match(slot.textContent, /Canonical natur/);
  assert.match(slot.textContent, /Skog/);
  assert.match(slot.textContent, /Hegre/);
  assert.ok(slot.querySelector('[data-hg-place-sheet-special-owner="nature-landscape"]'));
  assert.equal(window.document.querySelector("#pcUnifiedKnowledgeHost"), null);
  assert.equal(window.HGPlaceSheetRenderQueue.current().sections.special, "rendered");
  assert.equal(window.HGPlaceSheetRenderQueue.current().phase, "full-ready");
  dom.window.close();
});

test("Sport/Trening renders through the canonical owner API without late popup injection", async () => {
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
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: place.id, direct: true, phase: 6 } }));
  await queue.done;

  const slot = window.document.querySelector('[data-hg-place-sheet-section="special"]');
  assert.ok(slot);
  const training = slot.querySelector('[data-hg-sport-training="1"]');
  assert.ok(training);
  assert.equal(training.getAttribute("data-hg-place-sheet-special-owner"), "sport-training");
  assert.match(training.textContent, /Canonical trening/);
  assert.equal(window.document.querySelector("#pcUnifiedKnowledgeHost"), null);
  assert.equal(window.HGPlaceSheetRenderQueue.current().sections.special, "rendered");
  assert.equal(window.HGPlaceSheetRenderQueue.current().phase, "full-ready");
  dom.window.close();
});

test("ordinary places omit special immediately instead of waiting for unrelated compatibility batches", async () => {
  const place = { id: "ordinary_place", name: "Ordinary", category: "By", placeTier: "standard" };
  const dom = makeDom(place);
  const { window } = dom;
  window.eval(runtimeSource);

  const queue = window.HGPlaceSheetRenderQueue.start(place.id);
  assert.ok(queue);
  const started = Date.now();
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: place.id, direct: true, phase: 6 } }));
  await waitFor(() => window.HGPlaceSheetRenderQueue.current()?.sections?.special === "omitted", 1000);
  const elapsed = Date.now() - started;

  assert.equal(window.HGPlaceSheetRenderQueue.current().sections.special, "omitted");
  assert.ok(elapsed < 1000, `ordinary special resolution should not wait for later compatibility batches; got ${elapsed}ms`);
  window.HGPlaceSheetRenderQueue.cancel();
  dom.window.close();
});

test("special profile stylesheet keeps owner sections responsive", () => {
  assert.match(css, /pc-sheet-special/);
  assert.match(css, /hg-place-nature-grid/);
  assert.match(css, /hg-place-sport-training-list/);
  assert.match(css, /@media \(max-width:720px\)/);
});
