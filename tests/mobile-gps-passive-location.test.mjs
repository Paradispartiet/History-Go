import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

// Test the same compact browser bundle that the static site loads on mobile.
const runtime = readFileSync(new URL("../js/core/pos.js", import.meta.url), "utf8");

function launchPositionRuntime() {
  const stored = new Map();
  const recordedVisits = [];
  const notifications = [];
  const openedCards = [];
  const geoEvents = [];
  let nearbyRefreshes = 0;

  const page = {
    console,
    navigator: { geolocation: {} },
    document: {
      readyState: "loading",
      getElementById: () => null,
      addEventListener: () => {}
    },
    localStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, String(value)),
      removeItem: (key) => stored.delete(key)
    },
    CustomEvent: class {
      constructor(type, options = {}) {
        this.type = type;
        this.detail = options.detail;
      }
    },
    Event: class {
      constructor(type) { this.type = type; }
    },
    addEventListener: () => {},
    dispatchEvent: (event) => geoEvents.push(event.type),
    renderNearbyPlaces: () => { nearbyRefreshes += 1; },
    showToast: (message) => notifications.push(message),
    openPlaceCard: (place) => openedCards.push(place.id),
    saveVisitedFromQuiz: (id) => recordedVisits.push(id),
    distMeters: (from, to) => Math.hypot(
      (from.lat - to.lat) * 111_000,
      (from.lon - to.lon) * 55_000
    ),
    PLACES: [
      { id: "park", name: "Park", lat: 59.9, lon: 10.7, r: 100 },
      { id: "square", name: "Square", lat: 59.9001, lon: 10.7001, r: 100 }
    ],
    visited: {}
  };
  page.window = page;
  runInNewContext(runtime, page, { timeout: 1500 });
  return {
    page,
    recordedVisits,
    notifications,
    openedCards,
    geoEvents,
    getNearbyRefreshes: () => nearbyRefreshes
  };
}

test("repeated passive mobile GPS updates never auto-register or navigate", () => {
  const app = launchPositionRuntime();
  for (let i = 0; i < 6; i++) {
    app.page.HGPos.setPos(59.9 + i * 0.00001, 10.7, 20);
  }
  assert.deepEqual(app.recordedVisits, []);
  assert.deepEqual(app.notifications, []);
  assert.deepEqual(app.openedCards, []);
  assert.ok(app.getNearbyRefreshes() >= 6);
  assert.equal(app.page.HGPos.getPos().lat, 59.90005);
});

test("manual city/place selection never fabricates a GPS visit, even in opt-in mode", () => {
  const app = launchPositionRuntime();
  app.page.HG_AUTODISCOVER_PLACES = true;
  assert.equal(app.page.HGPos.setLocationOverride({
    lat: 59.9,
    lon: 10.7,
    label: "Simulert sted"
  }), true);
  assert.deepEqual(app.recordedVisits, []);
  assert.deepEqual(app.openedCards, []);
  assert.equal(app.page.HGPos.getPos().mode, "manual");
  app.page.HGPos.setPos(59.9, 10.7, 10); // background GPS while virtual city is selected
  assert.deepEqual(app.recordedVisits, []);
  assert.deepEqual(app.openedCards, []);
});

test("explicit legacy opt-in can discover nearby places but cannot hijack the card", () => {
  const app = launchPositionRuntime();
  app.page.HG_AUTODISCOVER_PLACES = true;
  app.page.HGPos.setPos(59.9, 10.7, 10);
  assert.deepEqual(app.recordedVisits, ["park", "square"]);
  assert.equal(app.notifications.length, 2);
  assert.deepEqual(app.openedCards, []);
});
