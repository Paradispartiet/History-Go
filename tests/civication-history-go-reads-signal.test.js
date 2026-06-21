#!/usr/bin/env node
// Verifies the HGReads History Go signal: records story/leksikon/person engagement,
// is idempotent, dispatches hg:content-read, and ignores empty ids.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const readsPath = path.join(root, "js/hgReads.js");

const dispatched = [];
global.window = global;
global.console = { ...console, warn() {} };
global.localStorage = (() => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(String(k)) ? m.get(String(k)) : null),
    setItem: (k, v) => m.set(String(k), String(v)),
    removeItem: (k) => m.delete(String(k)),
    clear: () => m.clear()
  };
})();
global.dispatchEvent = (evt) => { dispatched.push(evt); return true; };
global.Event = class { constructor(t) { this.type = t; } };
global.CustomEvent = class { constructor(t, init) { this.type = t; this.detail = (init && init.detail) || null; } };

vm.runInThisContext(fs.readFileSync(readsPath, "utf8"), { filename: readsPath });

const HG = global.HGReads;
assert(HG && typeof HG.recordStory === "function", "HGReads exposes recordStory");

// story keyed by storyId, keeps placeId
{
  const row = HG.recordStory({ storyId: "s1", placeId: "akershus_festning" });
  assert.strictEqual(row.placeId, "akershus_festning", "story keeps placeId");
  assert.strictEqual(HG.load().stories.s1.placeId, "akershus_festning", "persisted");
  assert.ok(dispatched.some((e) => e.type === "hg:content-read"), "event dispatched");
}

// story falls back to placeId as key when no storyId
{
  const row = HG.recordStory({ placeId: "stortinget" });
  assert.strictEqual(row.id, "stortinget", "keyed by placeId fallback");
}

// leksikon keeps category + emne
{
  const row = HG.recordLeksikon({ leksikonId: "lx1", categoryId: "historie", emneId: "e1" });
  assert.strictEqual(row.categoryId, "historie", "leksikon category");
  assert.strictEqual(row.emneId, "e1", "leksikon emne");
}

// person opened
{
  const row = HG.recordPerson({ personId: "p1" });
  assert.strictEqual(row.id, "p1", "person recorded");
  assert.strictEqual(HG.load().persons.p1.id, "p1", "person persisted");
}

// idempotent: re-record same person does not change persisted ts_first
{
  const first = HG.load().persons.p1.ts_first;
  HG.recordPerson({ personId: "p1" });
  assert.strictEqual(HG.load().persons.p1.ts_first, first, "ts_first stable");
}

// empty ids -> null, no write
{
  assert.strictEqual(HG.recordStory({}), null, "story without id -> null");
  assert.strictEqual(HG.recordPerson({}), null, "person without id -> null");
  assert.strictEqual(HG.recordLeksikon({}), null, "leksikon without id -> null");
}

console.log("hg reads signal ok");
