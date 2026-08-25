import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const PLACE_ID = "torggata";
const place = JSON.parse(fs.readFileSync("data/places/by/oslo/places/torggata.json", "utf8"));
const favoritesSource = fs.readFileSync("js/state/favorites.js", "utf8");
const readerSource = fs.readFileSync("js/progress/profileProgressReader.js", "utf8");
const placeCardSource = fs.readFileSync("js/ui/place-card.js", "utf8");
const placeCardStatusSource = fs.readFileSync("js/ui/place-card-status-surface.js", "utf8");
const placeCardEpokeSource = fs.readFileSync("js/ui/place-card-epoke.js", "utf8");
const nearbyStatusSource = fs.readFileSync("js/ui/nearby-status-surface.js", "utf8");
const nearbyControlTest = fs.readFileSync("tests/nearby-card-favorite-control.test.js", "utf8");

function createRuntime() {
  const values = new Map();
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
  const window = { localStorage };
  const context = vm.createContext({ window, localStorage, console });
  vm.runInContext(favoritesSource, context, { filename: "favorites.js" });
  vm.runInContext(readerSource, context, { filename: "profileProgressReader.js" });
  return { window, localStorage };
}

test("Torggata uses the existing favorite owner and profile reader", () => {
  const { window, localStorage } = createRuntime();
  const favorites = window.HGFavoritePlaces;
  const reader = window.HGProfileProgressReader;

  assert.equal(favorites.key, "hg_favorite_place_ids_v1");
  assert.equal(favorites.has(PLACE_ID), false);
  assert.equal(favorites.toggle(PLACE_ID), true);
  assert.equal(favorites.has(PLACE_ID), true);
  assert.equal(reader.isFavoritePlace(PLACE_ID), true);
  assert.deepEqual(Array.from(reader.getFavoritePlaceIdList()), [PLACE_ID]);
  assert.deepEqual(Array.from(reader.getProfileProgressSummary().favoritePlaceIds), [PLACE_ID]);
  assert.equal(JSON.parse(localStorage.getItem(favorites.key))[0], PLACE_ID);
  assert.equal(favorites.toggle(PLACE_ID), false);
});

test("visited, quiz and next action remain independent", () => {
  const { window, localStorage } = createRuntime();
  const reader = window.HGProfileProgressReader;
  const summary = () => reader.getPlaceProgressSummary(PLACE_ID, { category: "by" });

  assert.deepEqual(
    { visited: summary().visited, quizCompleted: summary().quizCompleted, status: summary().status, nextAction: summary().nextAction },
    { visited: false, quizCompleted: false, status: "unknown", nextAction: "open" }
  );

  localStorage.setItem("visited_places", JSON.stringify({ [PLACE_ID]: true }));
  assert.deepEqual(
    { visited: summary().visited, quizCompleted: summary().quizCompleted, status: summary().status, nextAction: summary().nextAction },
    { visited: true, quizCompleted: false, status: "visited", nextAction: "quiz" }
  );

  localStorage.setItem("visited_places", JSON.stringify({}));
  localStorage.setItem("quiz_progress", JSON.stringify({ by: { completed: [PLACE_ID] } }));
  assert.deepEqual(
    { visited: summary().visited, quizCompleted: summary().quizCompleted, status: summary().status, nextAction: summary().nextAction },
    { visited: false, quizCompleted: true, status: "quiz_completed", nextAction: "visit" }
  );

  localStorage.setItem("visited_places", JSON.stringify({ [PLACE_ID]: true }));
  assert.deepEqual(
    { visited: summary().visited, quizCompleted: summary().quizCompleted, status: summary().status, nextAction: summary().nextAction },
    { visited: true, quizCompleted: true, status: "completed", nextAction: "completed" }
  );
});

test("PlaceCard, Nearby and profile share the canonical favorite/progress sources", () => {
  assert.match(placeCardSource, /HGFavoritePlaces\?\.has/);
  assert.match(placeCardSource, /HGFavoritePlaces\?\.toggle/);
  assert.match(placeCardSource, /HGPlaceCardStatusSurface\?\.render/);
  assert.match(placeCardStatusSource, /getPlaceProgressSummary/);
  assert.match(placeCardStatusSource, /summary\.favorite/);
  assert.match(placeCardStatusSource, /document\.createElement\("button"\)/);
  assert.match(placeCardStatusSource, /const openPlace = currentOpenPlace\(\)/);
  assert.match(placeCardEpokeSource, /window\.HGPlaceCardEpoke = \{ render \}/);
  assert.match(nearbyStatusSource, /getPlaceProgressSummary/);
  assert.match(nearbyStatusSource, /summary\.favorite/);
  assert.match(nearbyControlTest, /Nearby cards must not create a favorite star button/);
});

test("Torggata place data contains no competing local progress state", () => {
  assert.equal(place.id, PLACE_ID);
  for (const key of ["favorite", "favorite_state", "visited", "visit_status", "quiz_completed", "progress", "next_action"]) {
    assert.equal(Object.hasOwn(place, key), false, "unexpected place-local progress key: " + key);
  }
});
