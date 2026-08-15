const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createStorage(seed = {}) {
  const store = new Map(Object.entries(seed));
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
  };
}

(() => {
  let currentPlaceId = "kulturkirken_jakob";
  const localStorage = createStorage();
  const listeners = [];
  const appendedScripts = [];

  const document = {
    getElementById(id) {
      return id === "placeCard"
        ? { dataset: { currentPlaceId } }
        : null;
    },
    querySelector() { return null; },
    createElement() {
      return {
        dataset: {},
        async: false,
        src: "",
        onerror: null
      };
    },
    head: {
      appendChild(node) { appendedScripts.push(node); }
    }
  };

  const window = {
    DEBUG: false,
    addEventListener(type, handler, options) {
      listeners.push({ type, handler, options });
    },
    dispatchEvent() {}
  };

  const context = vm.createContext({
    window,
    document,
    localStorage,
    console,
    JSON,
    Date,
    Number,
    String,
    Array,
    Object,
    Set,
    Map,
    Event: class Event {},
    CustomEvent: class CustomEvent {}
  });

  const source = fs.readFileSync(path.join(__dirname, "..", "js", "hg_unlocks.js"), "utf8");
  vm.runInContext(source, context, { filename: "hg_unlocks.js" });

  const guard = window.HGUnlocks.preserveNextUpTriEvent;
  assert.equal(typeof guard, "function");

  const captureListener = listeners.find(item => item.type === "hg:mpNextUp");
  assert.ok(captureListener, "NextUp state guard should be registered");
  assert.equal(captureListener.options, true, "NextUp state guard should run in capture phase");

  const jakobTri = {
    schema: "hg_nextup_v4",
    current_place_id: "kulturkirken_jakob",
    generated_at: "2026-08-15T05:00:00.000Z",
    suggestions: [
      { type: "spatial", target_id: "rockefeller", label: "Rockefeller", score: 88 },
      { type: "concept", target_id: "livemusikk", label: "Livemusikk", score: 80 }
    ]
  };

  let event = { detail: { tri: jakobTri } };
  guard(event);
  assert.equal(event.detail.tri, jakobTri, "resolved tri should pass through unchanged");

  // Reproduces the progressive PlaceCard reopen: place-card.js emits tri:null,
  // while its nav Set prevents HGNavigator from running a second time.
  event = { detail: { tri: null } };
  guard(event);
  assert.equal(event.detail.tri.current_place_id, "kulturkirken_jakob");
  assert.equal(event.detail.tri.suggestions.length, 2);
  assert.equal(event.detail.tri.suggestions[0].target_id, "rockefeller");

  // A newer mode rebuild is written directly by nextUpRuntime. Stored state must
  // win over the in-memory copy so a later progressive reopen cannot roll it back.
  const newerJakobTri = {
    ...jakobTri,
    schema: "hg_nextup_v4_progression",
    generated_at: "2026-08-15T05:05:00.000Z",
    suggestions: [
      { type: "quiz", target_id: "kulturkirken_jakob", label: "Ta quiz", score: 97 }
    ]
  };
  localStorage.setItem("hg_nextup_tri", JSON.stringify(newerJakobTri));
  event = { detail: { tri: null } };
  guard(event);
  assert.equal(event.detail.tri.schema, "hg_nextup_v4_progression");
  assert.equal(event.detail.tri.suggestions[0].type, "quiz");

  // Never leak the previous place's suggestions into a newly opened place.
  currentPlaceId = "torggata";
  event = { detail: { tri: null } };
  guard(event);
  assert.equal(event.detail.tri.schema, "hg_nextup_pending_v1");
  assert.equal(event.detail.tri.current_place_id, "torggata");
  assert.equal(event.detail.tri.suggestions.length, 0);

  const torggataTri = {
    schema: "hg_nextup_v4",
    current_place_id: "torggata",
    suggestions: [
      { type: "spatial", target_id: "youngstorget", label: "Youngstorget", score: 90 }
    ]
  };
  event = { detail: { tri: torggataTri } };
  guard(event);

  // Simulate localStorage currently containing another place. Per-place memory
  // must still restore Torggata when the one-shot nav Set skips rebuilding it.
  localStorage.setItem("hg_nextup_tri", JSON.stringify(newerJakobTri));
  event = { detail: { tri: null } };
  guard(event);
  assert.equal(event.detail.tri.current_place_id, "torggata");
  assert.equal(event.detail.tri.suggestions[0].target_id, "youngstorget");

  assert.equal(appendedScripts.length, 2, "existing NextUp extension bootstrapping should remain intact");

  console.log("nextup-progressive-placecard-state.test.js: ok");
})();
