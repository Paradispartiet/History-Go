const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createRuntime() {
  const listeners = new Map();
  const visited = {};
  let physicalWrites = 0;

  const window = {
    visited,
    TEST_MODE: true,
    DataHub: {},
    HG_I18N: { t: (_key, fallback) => fallback },
    saveVisitedFromQuiz(placeId) {
      physicalWrites += 1;
      visited[String(placeId)] = true;
    },
    openPlaceCard: async () => undefined,
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    dispatchEvent() {},
    showToast() {}
  };

  const context = {
    window,
    document: {
      getElementById() { return null; }
    },
    CustomEvent: class CustomEvent {
      constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail;
      }
    },
    console,
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: () => 1,
    requestAnimationFrame: (fn) => fn()
  };

  context.globalThis = context;
  vm.createContext(context);
  return { context, window, visited, getPhysicalWrites: () => physicalWrites };
}

test("quiz API always permits digital access without writing visited_places", () => {
  const runtime = createRuntime();
  const source = fs.readFileSync(
    path.join(__dirname, "..", "js", "ui", "place-card-quizcards-patch.js"),
    "utf8"
  );
  vm.runInContext(source, runtime.context);

  let boundApi = null;
  runtime.window.QuizEngine = {
    init(api) {
      boundApi = api;
    }
  };

  runtime.window.QuizEngine.init({
    getVisited: () => runtime.visited,
    saveVisitedFromQuiz: runtime.window.saveVisitedFromQuiz
  });

  assert.equal(boundApi.getVisited().any_place_id, true);
  assert.equal(boundApi.saveVisitedFromQuiz("digital_place"), false);
  assert.equal(runtime.visited.digital_place, undefined);
  assert.equal(runtime.getPhysicalWrites(), 0);
});

test("physical visit API retains the original persistence path", () => {
  const runtime = createRuntime();
  const source = fs.readFileSync(
    path.join(__dirname, "..", "js", "ui", "place-card-quizcards-patch.js"),
    "utf8"
  );
  vm.runInContext(source, runtime.context);

  assert.equal(runtime.window.saveVisitedFromQuiz("quiz_attempt"), false);
  assert.equal(runtime.visited.quiz_attempt, undefined);

  const result = runtime.window.HGPhysicalVisits.record({ id: "physical_place" });
  assert.equal(result.ok, true);
  assert.equal(runtime.visited.physical_place, true);
  assert.equal(runtime.getPhysicalWrites(), 1);
});