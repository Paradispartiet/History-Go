#!/usr/bin/env node
// Verifies the History Go debate surface (HGDebatesContent): loads debates, opens one (records
// participation via HGDebates), and records the chosen position on a position click.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const loaderPath = path.join(root, "js/debates/debates_loader.js");

const records = [];
let clickHandler = null;
let popupHtml = null;

global.window = global;
global.console = { ...console, warn() {}, error() {} };
const positionsById = {};
global.HGDebates = {
  record: (x) => { records.push(x); if (x && x.position) positionsById[x.debateId] = x.position; },
  getById: (id) => (positionsById[id] ? { id, position: positionsById[id] } : null)
};
global.showToast = () => {};
global.makePopup = (html) => { popupHtml = html; };
global.openPlaceCard = undefined; // patchPlaceCard: no original -> skipped
global.document = {
  readyState: "complete",
  addEventListener: (type, fn) => { if (type === "click") clickHandler = fn; },
  querySelector: () => null,
  getElementById: () => null,
  createElement: () => ({ dataset: {}, classList: { add() {}, toggle() {} } })
};

const MANIFEST = { files: ["data/debates/debates_by.json"] };
const DATA = [
  {
    id: "d1",
    title: "T",
    question: "Q?",
    context: ["bakgrunn"],
    place_id: "p1",
    conflict_id: "bevaring_vs_utvikling",
    positions: [{ id: "pro", label: "Pro" }, { id: "con", label: "Con" }]
  }
];
global.fetch = async (p) => ({
  ok: true,
  json: async () => (String(p).endsWith("manifest.json") ? MANIFEST : DATA)
});

vm.runInThisContext(fs.readFileSync(loaderPath, "utf8"), { filename: loaderPath });
const C = global.HGDebatesContent;
assert(C && typeof C.open === "function", "HGDebatesContent exposed");

(async () => {
  await C.init();
  assert.ok(C.getById("d1"), "getById finds debate");
  assert.strictEqual(C.getByPlace("p1").length, 1, "getByPlace indexes by place");
  assert.strictEqual(C.getById("nope"), null, "unknown id -> null");

  // open records participation (no position yet) and renders position buttons
  const ok = await C.open("d1");
  assert.strictEqual(ok, true, "open returns true");
  assert.deepStrictEqual(records[0], { debateId: "d1", conflictId: "bevaring_vs_utvikling" }, "participation recorded with conflict");
  assert.ok(/data-debate-position="pro"/.test(popupHtml), "popup renders positions");

  // conflict chip is rendered with a human-readable, derived label
  assert.strictEqual(C.conflictLabel("bevaring_vs_utvikling"), "Bevaring vs. utvikling", "derived conflict label");
  assert.strictEqual(C.conflictLabel(""), "", "no conflict -> empty label");
  assert.ok(/hg-debate__conflict/.test(popupHtml), "popup renders conflict chip");
  assert.ok(/Bevaring vs\. utvikling/.test(popupHtml), "chip shows derived label");

  // unknown debate -> false
  assert.strictEqual(await C.open("ghost"), false, "unknown debate -> false");

  // simulate a position click -> records the position
  assert.strictEqual(typeof clickHandler, "function", "click handler registered");
  const host = { querySelector: () => ({ textContent: "" }), querySelectorAll: () => [] };
  const btn = {
    getAttribute: (k) => (k === "data-debate-id" ? "d1" : k === "data-debate-position" ? "pro" : null),
    closest: (sel) => (sel === ".hg-debate" ? host : btn)
  };
  clickHandler({ target: { closest: (sel) => (sel === "[data-debate-position]" ? btn : null) } });
  assert.deepStrictEqual(
    records[records.length - 1],
    { debateId: "d1", position: "pro" },
    "position recorded on click"
  );

  // reopening the debate recalls the prior position: chip + pre-marked button + note
  await C.open("d1");
  assert.ok(/class="hg-debate__position is-chosen"[^>]*data-debate-position="pro"/.test(popupHtml), "prior position pre-marked on reopen");
  assert.ok(/Du valgte: Pro/.test(popupHtml), "prior position note shown");

  console.log("hg debate surface ok");
})().catch((err) => { console.error(err); process.exit(1); });
