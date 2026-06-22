#!/usr/bin/env node
// Verifies HGDebatesContent.leaning(): tallies the player's recorded positions across every
// debate sharing a conflict axis, maps each choice to its pole, and reports the dominant lean.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const loaderPath = path.join(root, "js/debates/debates_loader.js");

const positionsById = {};
global.window = global;
global.console = { ...console, warn() {}, error() {} };
global.HGDebates = {
  record: () => {},
  getById: (id) => (positionsById[id] ? { id, position: positionsById[id] } : null)
};
global.showToast = () => {};
global.makePopup = () => {};
global.openPlaceCard = undefined;
global.document = {
  readyState: "complete",
  addEventListener: () => {},
  querySelector: () => null,
  getElementById: () => null,
  createElement: () => ({ dataset: {}, classList: { add() {}, toggle() {} } })
};

const MANIFEST = { files: ["debates.json"] };
// Three debates on the bevaring_vs_utvikling axis, plus one on another axis.
const DATA = [
  { id: "d_a", conflict_id: "bevaring_vs_utvikling", place_id: "p", category: "by",
    positions: [{ id: "keep", pole: "bevaring" }, { id: "build", pole: "utvikling" }, { id: "mid", pole: "midt" }] },
  { id: "d_b", conflict_id: "bevaring_vs_utvikling", place_id: "p", category: "by",
    positions: [{ id: "keep", pole: "bevaring" }, { id: "build", pole: "utvikling" }, { id: "mid", pole: "midt" }] },
  { id: "d_c", conflict_id: "bevaring_vs_utvikling", place_id: "p", category: "by",
    positions: [{ id: "keep", pole: "bevaring" }, { id: "build", pole: "utvikling" }, { id: "mid", pole: "midt" }] },
  { id: "other", conflict_id: "ideal_vs_budsjett", place_id: "p", category: "by",
    positions: [{ id: "x", pole: "ideal" }, { id: "y", pole: "budsjett" }] }
];
global.fetch = async (p) => ({ ok: true, json: async () => (String(p).endsWith("manifest.json") ? MANIFEST : DATA) });

vm.runInThisContext(fs.readFileSync(loaderPath, "utf8"), { filename: loaderPath });
const C = global.HGDebatesContent;

(async () => {
  await C.init();

  // no recorded positions yet
  let l = C.leaning("bevaring_vs_utvikling");
  assert.strictEqual(l.total, 0, "no positions -> total 0");
  assert.strictEqual(l.lean, null, "no positions -> no lean");
  assert.strictEqual(l.poleA, "bevaring");
  assert.strictEqual(l.poleB, "utvikling");

  // player leans bevaring: two keep, one build
  positionsById.d_a = "keep";
  positionsById.d_b = "keep";
  positionsById.d_c = "build";
  l = C.leaning("bevaring_vs_utvikling");
  assert.strictEqual(l.total, 3, "three positions counted");
  assert.strictEqual(l.counts.bevaring, 2, "two bevaring");
  assert.strictEqual(l.counts.utvikling, 1, "one utvikling");
  assert.strictEqual(l.counts.midt, 0, "zero midt");
  assert.deepStrictEqual(
    l.distribution.map((item) => [item.pole, item.label, item.count]),
    [["bevaring", "Bevaring", 2], ["utvikling", "Utvikling", 1], ["midt", "Midt imellom", 0]],
    "distribution exposes labels and counts"
  );
  assert.strictEqual(l.lean, "bevaring", "dominant lean is bevaring");

  // a tie between the two poles resolves to midt
  positionsById.d_c = "build";
  positionsById.d_b = "build";
  l = C.leaning("bevaring_vs_utvikling");
  assert.strictEqual(l.lean, "utvikling", "2 build vs 1 keep -> utvikling");
  positionsById.d_a = "mid";
  l = C.leaning("bevaring_vs_utvikling");
  assert.strictEqual(l.counts.midt, 1, "midt counted");
  assert.strictEqual(l.lean, "utvikling", "2 utvikling vs 0 bevaring -> utvikling");

  // side-pole equality resolves to midt
  positionsById.d_a = "keep";
  positionsById.d_b = "build";
  positionsById.d_c = undefined;
  l = C.leaning("bevaring_vs_utvikling");
  assert.strictEqual(l.counts.bevaring, 1, "one bevaring in side-pole tie");
  assert.strictEqual(l.counts.utvikling, 1, "one utvikling in side-pole tie");
  assert.strictEqual(l.lean, "midt", "side-pole equality -> midt");

  // midt dominance resolves to midt
  positionsById.d_a = "mid";
  positionsById.d_b = "mid";
  positionsById.d_c = "keep";
  l = C.leaning("bevaring_vs_utvikling");
  assert.strictEqual(l.counts.midt, 2, "two midt positions counted");
  assert.strictEqual(l.lean, "midt", "midt dominance -> midt");

  // a different axis is independent
  const other = C.leaning("ideal_vs_budsjett");
  assert.strictEqual(other.total, 0, "other axis unaffected");

  // poleLabel humanizes
  assert.strictEqual(C.poleLabel("myke_trafikanter"), "Myke trafikanter", "pole label humanized");
  assert.strictEqual(C.poleLabel("midt"), "Midt imellom", "midt label");

  // leaningAll: only axes with recorded positions, sorted by engagement
  const all = C.leaningAll();
  assert.strictEqual(all.length, 1, "only the engaged axis is listed");
  assert.strictEqual(all[0].conflictId, "bevaring_vs_utvikling", "engaged axis surfaced");

  // overview popup reflects the engaged axis and lean
  const overview = C.overviewHtml();
  assert.ok(/Dine debatt-tendenser/.test(overview), "overview titled");
  assert.ok(/Bevaring vs\. utvikling/.test(overview), "overview lists axis");
  assert.ok(/Midt imellom/.test(overview), "overview shows midt lean");
  assert.ok(/3 standpunkt/.test(overview), "overview shows total count");
  assert.ok(/Bevaring 1 · Utvikling 0 · Midt imellom 2/.test(overview), "overview shows distribution counts");

  // empty overview state still works when no axes are engaged
  delete positionsById.d_a;
  delete positionsById.d_b;
  delete positionsById.d_c;
  let emptyOverview = C.overviewHtml();
  assert.ok(/Du har ikke tatt standpunkt/.test(emptyOverview), "empty state shown");

  // restore one engaged axis before checking leaningAll and a second axis
  positionsById.d_a = "keep";

  // engage a second axis -> it appears too
  positionsById.other = "x";
  const all2 = C.leaningAll();
  assert.strictEqual(all2.length, 2, "second engaged axis appears");

  console.log("hg debate leaning ok");
})().catch((err) => { console.error(err); process.exit(1); });
