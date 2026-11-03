import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const SOURCE = fs.readFileSync(new URL("../js/core/bottomSheetController.js", import.meta.url), "utf8");

function createCard(classes = [], placeId = "") {
  const names = new Set(classes);
  const attributes = new Map();
  return {
    dataset: { currentPlaceId: placeId },
    classList: {
      contains: name => names.has(name),
      add: (...values) => values.forEach(value => names.add(value)),
      remove: (...values) => values.forEach(value => names.delete(value)),
    },
    setAttribute: (name, value) => attributes.set(name, String(value)),
    getAttribute: name => attributes.get(name) || null,
  };
}

function setup() {
  let currentCard = createCard();
  const window = {};
  const document = {
    getElementById: id => id === "placeCard" ? currentCard : null,
  };
  vm.runInNewContext(SOURCE, { window, document, console: { trace() {} } }, {
    filename: "js/core/bottomSheetController.js",
  });
  return {
    controller: window.bottomSheetController,
    card: () => currentCard,
    replaceCard: card => { currentCard = card; },
  };
}

test("reinitialization after background load preserves an open PlaceCard", () => {
  const app = setup();
  app.controller.init();
  assert.equal(app.card().classList.contains("is-hidden"), true);
  app.card().dataset.currentPlaceId = "groruddammen";
  app.controller.open();
  assert.equal(app.card().classList.contains("is-open"), true);
  app.controller.init(); // bootBackground repeats this after initial startup
  assert.equal(app.card().classList.contains("is-open"), true);
  assert.equal(app.card().classList.contains("is-hidden"), false);
  assert.equal(app.card().getAttribute("aria-hidden"), "false");
  assert.equal(app.card().dataset.currentPlaceId, "groruddammen");
});

test("a newly mounted active PlaceCard retains its open state", () => {
  const app = setup();
  app.controller.init();
  const replacement = createCard(["is-open"], "groruddammen");
  app.replaceCard(replacement);
  app.controller.init();
  assert.equal(replacement.classList.contains("is-open"), true);
  assert.equal(replacement.classList.contains("is-hidden"), false);
  assert.equal(replacement.getAttribute("aria-hidden"), "false");
});

test("a newly mounted unselected PlaceCard still starts hidden", () => {
  const app = setup();
  app.controller.init();
  const replacement = createCard(["is-open"]);
  app.replaceCard(replacement);
  app.controller.init();
  assert.equal(replacement.classList.contains("is-open"), false);
  assert.equal(replacement.classList.contains("is-hidden"), true);
  assert.equal(replacement.getAttribute("aria-hidden"), "true");
});
