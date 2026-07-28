#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(repoRoot, "js/hg_unlocks.js");
const source = fs.readFileSync(sourcePath, "utf8");

const storage = new Map();
const listeners = new Map();

class TestEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail;
  }
}

const windowStub = {
  DEBUG: false,
  addEventListener(type, handler) {
    const list = listeners.get(type) || [];
    list.push(handler);
    listeners.set(type, list);
  },
  dispatchEvent(event) {
    for (const handler of listeners.get(event.type) || []) handler(event);
    return true;
  }
};

const localStorageStub = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); }
};

const documentStub = {
  querySelector() { return null; },
  createElement() {
    return { dataset: {}, async: false, src: "", onerror: null };
  },
  head: { appendChild() {} }
};

vm.runInNewContext(source, {
  window: windowStub,
  localStorage: localStorageStub,
  document: documentStub,
  Event: TestEvent,
  CustomEvent: TestEvent,
  console,
  Date,
  Set,
  Array,
  Object,
  String
}, { filename: sourcePath });

assert.ok(windowStub.HGUnlocks, "HGUnlocks is exposed");
assert.strictEqual(windowStub.HGUnlocks.placeCollectionKey, "places_collected");

windowStub.dispatchEvent(new TestEvent("hg:target-unlock", {
  detail: { kind: "place", id: "quiz_only_place" }
}));

const collected = JSON.parse(storage.get("places_collected") || "{}");
assert.strictEqual(collected.quiz_only_place.source, "quiz", "quiz-unlocked place is collected");
assert.ok(Number.isFinite(collected.quiz_only_place.ts), "collection stores a timestamp");
assert.strictEqual(storage.has("visited_places"), false, "quiz unlock never writes physical visited_places");

windowStub.dispatchEvent(new TestEvent("hg:target-unlock", {
  detail: { kind: "person", id: "person_1" }
}));
const afterPerson = JSON.parse(storage.get("places_collected") || "{}");
assert.deepStrictEqual(Object.keys(afterPerson), ["quiz_only_place"], "person unlock does not enter place collection");

console.log("Quiz place unlock stays separate from physical visits.");
