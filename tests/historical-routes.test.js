const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const routeFile = path.join(ROOT, "data/routes/historical/routes_historical_oslo.json");
const routes = JSON.parse(fs.readFileSync(routeFile, "utf8"));
const placesManifest = JSON.parse(fs.readFileSync(path.join(ROOT, "data/places/manifest.json"), "utf8"));
const placeIds = new Set();
placesManifest.files.forEach((file) => {
  const placeFile = path.join(ROOT, "data", file);
  if (!fs.existsSync(placeFile)) return;
  const data = JSON.parse(fs.readFileSync(placeFile, "utf8"));
  const places = Array.isArray(data) ? data : (Array.isArray(data.places) ? data.places : []);
  places.forEach((place) => {
    if (place?.id) placeIds.add(place.id);
  });
});

assert.ok(routes.length >= 5, "historiske ruter skal inneholde eksempelrute og v0.3-utvidelser");
const route = routes[0];
assert.strictEqual(route.type, "historical_route");
assert.strictEqual(route.feature, "historiske_ruter");
assert.strictEqual(route.playModes.online.enabled, true);
assert.strictEqual(route.playModes.physical.enabled, true);
assert.ok(route.chapters.length >= 3);
routes.forEach((historicalRoute) => {
  assert.strictEqual(historicalRoute.type, "historical_route");
  assert.strictEqual(historicalRoute.feature, "historiske_ruter");
  assert.strictEqual(historicalRoute.playModes.online.enabled, true);
  assert.ok(historicalRoute.chapters.length >= 3);
  historicalRoute.chapters.forEach((chapter) => {
    if (chapter.placeId) {
      assert.ok(placeIds.has(chapter.placeId), `Ukjent placeId: ${chapter.placeId}`);
      assert.strictEqual(chapter.physical.placeId, chapter.placeId);
      assert.strictEqual(chapter.physical.enabled, true);
      assert.ok(chapter.physical.gpsRadius > 0);
    } else {
      assert.strictEqual(chapter.physical.enabled, false);
      assert.strictEqual(chapter.physical.placeId, undefined);
      assert.strictEqual(chapter.physical.gpsRadius, undefined);
    }
    assert.strictEqual(chapter.physical.physicalCollected, false);
    assert.ok(chapter.narrativeText);
    assert.ok(chapter.tasks.length >= 1);
  });
});

const storage = new Map();
const dispatched = [];
const context = {
  console,
  Date,
  Promise,
  Set,
  JSON,
  localStorage: {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, value)
  },
  Event: class Event { constructor(type) { this.type = type; } },
  CustomEvent: class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } },
  document: {
    addEventListener() {},
    getElementById() { return null; }
  },
  window: {
    DataHub: { loadHistoricalRoutes: async () => routes },
    dispatchEvent: (event) => dispatched.push(event),
    rerenderActiveLeftPanelMode() {}
  }
};
context.window.window = context.window;
context.window.localStorage = context.localStorage;
context.window.Event = context.Event;
context.window.CustomEvent = context.CustomEvent;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(ROOT, "js/historical-routes.js"), "utf8"), context);

(async () => {
  const api = context.window.HGHistoricalRoutes;
  assert.ok(api, "HGHistoricalRoutes API skal finnes før ready-event");
  assert.strictEqual(dispatched[0]?.type, "hg:historicalRoutesReady");
  await api.load();
  assert.strictEqual(api.getAll().length, routes.length);
  assert.strictEqual(api.getRouteArchetypeLabel("trade_route"), "Handelsrute");
  assert.strictEqual(api.getRouteArchetypeLabel("unknown_future_route"), "Unknown future route");
  assert.strictEqual(api.getRouteArchetypeLabel(""), "Historisk rute");
  assert.ok(api.renderCards().includes("Tidsreise i byen"));
  assert.ok(!api.renderCards().includes(">Historisk rute · urban_time_route<"));

  let progress = api.startRoute(route.id);
  assert.strictEqual(progress.status, "started");
  assert.strictEqual(progress.online.currentStopId, route.chapters[0].id);

  progress = api.completeCurrentChapter(route.id);
  assert.strictEqual(progress.status, "online_in_progress");
  assert.deepStrictEqual(Array.from(progress.online.completedStopIds), [route.chapters[0].id]);

  for (let index = 1; index < route.chapters.length; index += 1) {
    progress = api.completeCurrentChapter(route.id);
  }
  assert.strictEqual(progress.status, "online_completed");
  assert.strictEqual(progress.online.completed, true);
  assert.strictEqual(progress.online.completedStopIds.length, route.chapters.length);
  assert.strictEqual(progress.physical.completed, false, "online-spill skal ikke fullføre fysisk samling");
  assert.ok(dispatched.filter((event) => event.type === "updateProfile").length >= route.chapters.length + 1);

  console.log("historical-routes.test.js: OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
