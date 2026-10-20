const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const routePath = "data/routes/historical/routes_historical_alna.json";
const routes = readJson(routePath);
const manifest = readJson("data/routes/historical/manifest.json");
const placesManifest = readJson("data/places/manifest.json");
const sourcePack = readJson("data/routes/historical/sources_alna_20261020.json");
const existingRoutes = readJson("data/routes/historical/routes_historical_oslo.json");

assert.equal(routes.length, 1, "Alna file should define one route");
assert.ok(manifest.files.includes(path.basename(routePath)), "Alna route must be in the active manifest");

const route = routes[0];
assert.equal(route.id, "alna_fra_beite_til_industri_og_fjord");
assert.equal(route.type, "historical_route");
assert.equal(route.feature, "historiske_ruter");
assert.equal(route.routeArchetype, "river_route");
assert.equal(route.playModes.online.enabled, true);
assert.equal(route.chapters.length, 7);
assert.ok(!existingRoutes.some((r) => r.id === route.id), "route ID must be unique");
assert.equal(sourcePack.routeId, route.id);

const chapterIds = new Set();
for (const [index, chapter] of route.chapters.entries()) {
  assert.equal(chapter.sequence, index + 1, "chapter sequence");
  assert.ok(!chapterIds.has(chapter.id), "unique chapter ID");
  chapterIds.add(chapter.id);
  assert.equal(chapter.physical.enabled, true);
  assert.equal(chapter.physical.placeId, chapter.placeId);
  assert.ok(chapter.physical.gpsRadius > 0);
  assert.equal(chapter.physical.physicalCollected, false);
  assert.ok(chapter.narrativeText.trim().length > 100, "historical chapter needs substantive text");
  assert.ok(chapter.tasks.length && chapter.tasks.every((task) => task.prompt?.trim()));
  const source = sourcePack.chapters.find((row) => row.chapterId === chapter.id);
  assert.ok(source && source.placeId === chapter.placeId, "evidence must match chapter");
  assert.ok(source.sources.length >= 2 && source.sources.every((url) => url.startsWith("https://")));
  const sourceFile = `places/natur/oslo/places_oslo_natur_alnaelva_rute/${chapter.placeId}.json`;
  assert.ok(placesManifest.files.includes(sourceFile), "Place must belong to the active manifest");
  assert.equal(readJson(`data/${sourceFile}`).id, chapter.placeId, "canonical Place ID");
}

// Exercise the actual route player with the newly authored route, without
// depending on unrelated pre-existing example routes.
const storage = new Map();
const events = [];
const context = {
  console, Date, Promise, Set, JSON,
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value)
  },
  Event: class Event { constructor(type) { this.type = type; } },
  CustomEvent: class CustomEvent { constructor(type, init = {}) { this.type = type; this.detail = init.detail; } },
  document: { addEventListener() {}, getElementById() { return null; } },
  window: {
    DataHub: { loadHistoricalRoutes: async () => routes },
    dispatchEvent: (event) => events.push(event),
    rerenderActiveLeftPanelMode() {}
  }
};
context.window.window = context.window;
context.window.localStorage = context.localStorage;
context.window.Event = context.Event;
context.window.CustomEvent = context.CustomEvent;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "js/historical-routes.js"), "utf8"), context);

(async () => {
  const player = context.window.HGHistoricalRoutes;
  assert.ok(player);
  await player.load();
  assert.equal(player.getAll().length, 1);
  assert.equal(player.getRouteArchetypeLabel("river_route"), "Elverute");
  assert.ok(player.renderCards().includes(route.title));
  let progress = player.startRoute(route.id);
  assert.equal(progress.status, "started");
  assert.equal(progress.online.currentStopId, route.chapters[0].id);
  for (let index = 0; index < route.chapters.length; index += 1) {
    progress = player.completeCurrentChapter(route.id);
  }
  assert.equal(progress.status, "online_completed");
  assert.equal(progress.online.completed, true);
  assert.equal(progress.online.completedStopIds.length, 7);
  assert.equal(progress.physical.completed, false, "online travel is not GPS collection");
  assert.ok(events.some((event) => event.type === "hg:routeCompleted"));
  console.log("historical-routes-alna.test.js: PASS (7 places, source ties, runtime)");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
