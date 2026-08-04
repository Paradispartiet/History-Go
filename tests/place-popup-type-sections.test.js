const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");

function createHarness() {
  const source = fs.readFileSync(
    path.join(__dirname, "..", "js", "ui", "place-popup-v2.js"),
    "utf8"
  );

  const captured = { html: "", extraClass: "", quizTarget: "" };
  const mediaClasses = new Set(["is-missing"]);
  const listeners = {};
  const image = {
    hidden: true,
    src: "",
    addEventListener(name, fn) { listeners[name] = fn; },
    removeAttribute(name) { if (name === "src") this.src = ""; }
  };
  const media = {
    classList: {
      add(...names) { names.forEach(name => mediaClasses.add(name)); },
      remove(...names) { names.forEach(name => mediaClasses.delete(name)); }
    }
  };
  const quizButton = {};
  const popup = {
    querySelector(selector) {
      if (selector === "[data-place-hero-media]") return media;
      if (selector === "[data-place-hero-image]") return image;
      if (selector.includes("data-quiz")) return quizButton;
      return null;
    }
  };

  const document = {
    querySelector(selector) {
      return selector === ".hg-popup.place-popup-v2" ? popup : null;
    }
  };

  const window = {
    showPlacePopup() {},
    makePopup(html, extraClass) {
      captured.html = html;
      captured.extraClass = extraClass;
    },
    enhanceQuizButton(button, targetId) {
      assert.equal(button, quizButton);
      captured.quizTarget = targetId;
    },
    getPeopleForPlace() { return []; },
    getRelationsForPlace() { return []; },
    filterCuratedRels(value) { return value; },
    getObservationsForTarget() { return []; },
    hasCompletedQuiz() { return false; },
    HGEvents: { getByPlace() { return []; } },
    HGStories: { getByPlace() { return []; } },
    HGReads: { recordStory() {} },
    CSS: { escape(value) { return value; } },
    PLACES: [
      { id: "fagerborg_kirke", name: "Fagerborg kirke", locatorType: "church" }
    ],
    setInterval(fn) { fn(); return 1; },
    clearInterval() {}
  };

  vm.runInNewContext(source, { window, document, Intl, console });
  return { window, captured };
}

test("renders Stensparken as the park reference profile", () => {
  const { window, captured } = createHarness();
  const stensparken = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "data", "places", "by", "oslo", "places", "stensparken.json"),
    "utf8"
  ));

  window.showPlacePopup(stensparken);

  assert.match(captured.html, /Nøkkeltall og landskap/);
  assert.match(captured.html, /48 daa/);
  assert.equal((captured.html.match(/48 daa/g) || []).length, 1);
  assert.equal((captured.html.match(/81 moh/g) || []).length, 1);
  assert.doesNotMatch(captured.html, /hg-place-facts/);
  assert.match(captured.html, /500 m/);
  assert.match(captured.html, /Blåsen/);
  assert.match(captured.html, /81 moh/);
  assert.match(captured.html, /Dette finnes her/);
  assert.match(captured.html, /data-place="fagerborg_kirke"/);
  assert.match(captured.html, /Historiske lag/);
  assert.match(captured.html, /1890–1900/);
  assert.match(captured.html, /Natur og landskap/);
  assert.match(captured.html, /Kalksteinsrygg/);
  assert.match(captured.html, /Artsliv/);
  assert.match(captured.html, /Kilder i stedprofilen/);
  assert.equal(captured.extraClass, "place-popup place-popup-v2");
  assert.equal(captured.quizTarget, "stensparken");
});

test("does not add type sections when structured data is absent", () => {
  const { window, captured } = createHarness();

  window.showPlacePopup({
    id: "plain_place",
    name: "Plain Place",
    category: "by",
    desc: "Kort tekst.",
    popupDesc: "Lang tekst."
  });

  assert.doesNotMatch(captured.html, /Nøkkeltall og landskap/);
  assert.doesNotMatch(captured.html, /Dette finnes her/);
  assert.doesNotMatch(captured.html, /Historiske lag/);
  assert.doesNotMatch(captured.html, /Natur og landskap/);
  assert.doesNotMatch(captured.html, /Kilder i stedprofilen/);
});
