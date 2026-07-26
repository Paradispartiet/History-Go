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

  const captured = { html: "", extraClass: "", quizTarget: "", image: null };
  const mediaClasses = new Set(["is-missing"]);
  const media = {
    classList: {
      add(...names) { names.forEach(name => mediaClasses.add(name)); },
      remove(...names) { names.forEach(name => mediaClasses.delete(name)); }
    }
  };
  const listeners = {};
  const image = {
    hidden: true,
    src: "",
    addEventListener(name, fn) { listeners[name] = fn; },
    removeAttribute(name) { if (name === "src") this.src = ""; }
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
    setInterval(fn) { fn(); return 1; },
    clearInterval() {}
  };

  vm.runInNewContext(source, {
    window,
    document,
    Intl,
    console
  });

  captured.image = image;
  captured.imageListeners = listeners;
  captured.mediaClasses = mediaClasses;
  return { window, captured };
}

test("uses popupDesc as the long place article and keeps desc as a lead", () => {
  const { window, captured } = createHarness();

  window.showPlacePopup({
    id: "storgata",
    name: "Storgata",
    category: "by",
    year: 1850,
    desc: "Kort ingress om gaten.",
    popupDesc: "Første lange avsnitt.\n\nAndre lange avsnitt.",
    image: "missing-primary.jpg",
    cardImage: "fallback-card.png",
    locatorType: "street",
    anchors: [
      { name: "Kirkeristen" },
      { name: "Nybrua" }
    ],
    routeSegments: [
      { lengthM: 400 },
      { lengthM: 475.1 }
    ],
    quiz_profile: {
      place_type: "gate",
      subtype: "sporveisgate",
      signature_features: ["Trikk og handel deler samme rom"],
      must_include: ["Se etter sporene i kjørebanen"]
    }
  });

  assert.match(captured.html, /Kort fortalt/);
  assert.match(captured.html, /Kort ingress om gaten\./);
  assert.match(captured.html, /Første lange avsnitt\./);
  assert.match(captured.html, /Andre lange avsnitt\./);
  assert.match(captured.html, /875 m/);
  assert.match(captured.html, /Kirkeristen/);
  assert.match(captured.html, /Nybrua/);
  assert.match(captured.html, /Særtrekk/);
  assert.match(captured.html, /Se etter på stedet/);
  assert.doesNotMatch(captured.html, /Ingen relasjoner registrert ennå/);
  assert.doesNotMatch(captured.html, /Ingen observasjoner ennå/);
  assert.equal(captured.extraClass, "place-popup place-popup-v2");
  assert.equal(captured.quizTarget, "storgata");
});

test("tries image candidates and hides the image after all candidates fail", () => {
  const { window, captured } = createHarness();

  window.showPlacePopup({
    id: "image-test",
    name: "Image Test",
    popupDesc: "Long text",
    image: "first.jpg",
    cardImage: "second.png"
  });

  assert.equal(captured.image.src, "first.jpg");
  captured.imageListeners.error();
  assert.equal(captured.image.src, "second.png");
  captured.imageListeners.error();
  assert.equal(captured.image.src, "");
  assert.equal(captured.image.hidden, true);
  assert.equal(captured.mediaClasses.has("is-missing"), true);
});
