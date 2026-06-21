#!/usr/bin/env node
// Verifies the HGDebates History Go signal: records participation/position, is idempotent,
// dispatches hg:debate-participated, and keys by debateId or conflictId.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const debatesPath = path.join(root, "js/hgDebates.js");

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

vm.runInThisContext(fs.readFileSync(debatesPath, "utf8"), { filename: debatesPath });

const HG = global.HGDebates;
assert(HG && typeof HG.record === "function", "HGDebates.record exists");

// participation only
{
  const row = HG.record({ debateId: "d1" });
  assert.ok(row && row.participated === true, "participation recorded");
  assert.strictEqual(row.position, null, "no position yet");
  assert.strictEqual(HG.load().byId.d1.participated, true, "persisted");
  assert.ok(dispatched.some((e) => e.type === "hg:debate-participated"), "event dispatched");
}

// position recorded
{
  const row = HG.record({ debateId: "d1", position: "industri" });
  assert.strictEqual(row.position, "industri", "position set");
  assert.deepStrictEqual(row.positions, ["industri"], "positions tracked");
}

// idempotent: same position does not grow positions
{
  const before = HG.load().byId.d1.positions.length;
  HG.record({ debateId: "d1", position: "industri" });
  assert.strictEqual(HG.load().byId.d1.positions.length, before, "no duplicate position");
}

// keyed by conflictId when no debateId
{
  const row = HG.record({ conflictId: "c9", position: "menneske" });
  assert.ok(row, "conflict-keyed record");
  assert.strictEqual(HG.getById("c9").conflictId, "c9", "stored under conflict id");
  assert.strictEqual(HG.getById("c9").position, "menneske", "conflict position stored");
}

// byConflict index: a debate keyed by debateId is still resolvable by its conflict axis,
// mirroring how the Civication task bridge matches a conflict-targeted debate task.
{
  HG.record({ debateId: "munch_offentlig_kunst", conflictId: "ideal_vs_budsjett", position: "satsing" });
  const db = HG.load();
  assert.strictEqual(db.byConflict.ideal_vs_budsjett, "munch_offentlig_kunst", "byConflict maps axis -> debate key");
  // bridge-style resolution: conflict id -> byId key -> row
  const key = db.byConflict.ideal_vs_budsjett;
  assert.strictEqual(db.byId[key].position, "satsing", "conflict axis resolves to the debate row");
}

// junk: no id -> null, no write
{
  assert.strictEqual(HG.record({}), null, "no id -> null");
  assert.strictEqual(HG.record({ position: "x" }), null, "position without id -> null");
}

console.log("hg debate signal ok");
