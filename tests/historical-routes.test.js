const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const routeFile = path.join(ROOT, "data/routes/historical/routes_historical_oslo.json");
const routes = JSON.parse(fs.readFileSync(routeFile, "utf8"));
const placeIndex = JSON.parse(fs.readFileSync(path.join(ROOT, "data/places/places_index.json"), "utf8"));
const placeIds = new Set(placeIndex.map((place) => place.id));

assert.strictEqual(routes.length, 1, "v0.1 skal ha én eksempelrute");
const route = routes[0];
assert.strictEqual(route.type, "historical_route");
assert.strictEqual(route.feature, "historiske_ruter");
assert.strictEqual(route.playModes.online.enabled, true);
assert.strictEqual(route.playModes.physical.enabled, true);
assert.ok(route.chapters.length >= 3);
route.chapters.forEach((chapter) => {
  assert.ok(placeIds.has(chapter.placeId), `Ukjent placeId: ${chapter.placeId}`);
  assert.strictEqual(chapter.physical.placeId, chapter.placeId);
  assert.strictEqual(chapter.physical.enabled, true);
  assert.ok(chapter.physical.gpsRadius > 0);
  assert.strictEqual(chapter.physical.physicalCollected, false);
  assert.ok(chapter.narrativeText);
  assert.ok(chapter.tasks.length >= 1);
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
  assert.strictEqual(api.getAll().length, 1);

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
