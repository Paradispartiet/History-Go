const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const runtimeSource = fs.readFileSync(path.join(ROOT, "js/nextUpRuntime.js"), "utf8");

const listeners = new Map();
const storage = new Map();
let loadCount = 0;
let openedRouteId = null;
let progressStatus = "not_started";

const route = {
  id: "historisk-oslo-test",
  type: "historical_route",
  title: "Historisk Oslo-test",
  narrativeText: "En kort historisk testreise gjennom byen.",
  routeArchetype: "urban_time_route",
  historicalPeriod: "Middelalderbyen",
  playModes: {
    online: { enabled: true },
    physical: { enabled: true }
  },
  chapters: [
    { id: "kapittel-1", placeId: "sted-1", physical: { enabled: true } },
    { id: "kapittel-2", physical: { enabled: false } }
  ]
};

function getProgress() {
  return {
    status: progressStatus,
    online: {
      started: ["started", "online_in_progress", "online_completed"].includes(progressStatus),
      completed: progressStatus === "online_completed"
    },
    physical: { completed: false }
  };
}

const context = {
  console,
  Promise,
  JSON,
  Number,
  Object,
  String,
  Math,
  Array,
  localStorage: {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key)
  },
  document: {
    readyState: "loading",
    body: {
      classList: { contains: () => false }
    },
    head: { appendChild() {} },
    addEventListener() {},
    querySelector: () => null,
    getElementById: () => null,
    createElement: () => ({
      setAttribute() {},
      classList: { contains: () => false, toggle() {} },
      style: {},
      appendChild() {},
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener() {}
    })
  },
  window: {
    HGHistoricalRoutes: {
      load: async () => {
        loadCount += 1;
        return [route];
      },
      getAll: () => [route],
      getProgress,
      getRouteArchetypeLabel: () => "Tidsreise i byen",
      open: (routeId) => {
        openedRouteId = routeId;
      }
    },
    addEventListener: (type, handler) => {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(handler);
    },
    dispatchEvent: (event) => {
      (listeners.get(event.type) || []).forEach((handler) => handler(event));
    },
    setTimeout: (fn) => {
      fn();
      return 0;
    },
    HG_I18N: { t: (_key, fallback) => fallback },
    PLACES: [],
    NEARBY_PLACES: []
  }
};

context.window.window = context.window;
context.window.document = context.document;
context.window.localStorage = context.localStorage;
context.globalThis = context.window;

vm.createContext(context);
vm.runInContext(runtimeSource, context);

function assertHistoricalSuggestion(status, expectedAction) {
  progressStatus = status;
  const suggestion = context.window.HGNextUpHistoricalRoutes.buildSuggestion();
  assert.ok(suggestion, `expected historical suggestion for ${status}`);
  assert.strictEqual(suggestion.type, "historisk_rute");
  assert.strictEqual(suggestion.target_id, route.id);
  assert.strictEqual(suggestion.meta.route_id, route.id);
  assert.strictEqual(suggestion.meta.status, status);
  assert.strictEqual(suggestion.meta.action_label, expectedAction);
  assert.strictEqual(suggestion.meta.route_archetype_label, "Tidsreise i byen");
  assert.strictEqual(suggestion.meta.chapter_count, 2);
  assert.strictEqual(suggestion.meta.physical_chapter_count, route.chapters[0].physical.enabled ? 1 : 0);
  assert.strictEqual(suggestion.meta.text_only_chapter_count, route.chapters[0].physical.enabled ? 1 : 2);
}

(async () => {
  assert.ok(listeners.has("hg:historicalRoutesReady"), "NextUp skal lytte på hg:historicalRoutesReady");
  assert.ok(listeners.has("hg:historicalRouteProgress"), "progresjonslytteren skal beholdes");

  assertHistoricalSuggestion("not_started", "Start reisen");
  assertHistoricalSuggestion("started", "Fortsett reisen");
  assertHistoricalSuggestion("online_in_progress", "Fortsett reisen");
  assertHistoricalSuggestion("online_completed", "Samle fysiske stopp senere");

  route.chapters.forEach((chapter) => {
    delete chapter.placeId;
    chapter.physical = { enabled: false };
  });
  assertHistoricalSuggestion("online_completed", "Spill reisen på nytt");

  context.window.HGHistoricalRoutes.open(route.id);
  assert.strictEqual(openedRouteId, route.id);

  context.window.dispatchEvent({ type: "hg:historicalRoutesReady" });
  await Promise.resolve();
  await Promise.resolve();
  assert.strictEqual(loadCount, 1, "ready-eventet skal bruke eksisterende load() én gang");

  console.log("nextup-historical-routes.test.js: OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
