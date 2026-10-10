// Psykoteori must use canonical Fagverk IDs and remain a read-only learning surface.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const json = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const catalog = json("data/psychology/psychology_theories.json");
const phenomena = json("data/psychology/psychology_phenomena.json").phenomena;
const ids = new Set();
assert.equal(catalog.fagverk_subject, "psykologi");
assert.equal(catalog.chapters.length, 6);
assert.equal(catalog.theories.length, 14);

for (const chapter of catalog.chapters) {
  const canonical = json("data/fagverk/psykologi/" + chapter.id + ".json");
  assert.equal(canonical.chapter_id, chapter.id, "canonical chapter must exist");
  assert.equal(canonical.subject_id, "psykologi");
  for (const theory of catalog.theories.filter((item) => item.chapter_id === chapter.id)) {
    assert.ok(!ids.has(theory.id), "theory IDs must be unique");
    ids.add(theory.id);
    assert.ok(canonical.emne_ids.includes(theory.emne_id), "emne must be in canonical chapter: " + theory.id);
    for (const key of ["title", "founders", "period"]) {
      assert.ok(typeof theory[key] === "string" && theory[key].trim().length > 3,
        "missing metadata " + key + " on " + theory.id);
    }
    for (const key of ["idea", "method", "limit", "example", "contrast"]) {
      assert.ok(typeof theory[key] === "string" && theory[key].trim().length > 60,
        "missing authored analysis " + key + " on " + theory.id);
    }
    assert.ok(theory.example.startsWith("Undervisningsscenario:"), "example must be marked hypothetical");
    assert.ok(typeof theory.example_secondary === "string" && theory.example_secondary.startsWith("Undervisningsscenario:") && theory.example_secondary.length > 120,
      "missing second authored hypothetical scenario: " + theory.id);
    assert.notEqual(theory.example, theory.example_secondary, "teaching scenarios must not repeat each other: " + theory.id);
    for (const phenomenonId of theory.related_phenomena) {
      assert.ok(phenomena.some((item) => item.id === phenomenonId),
        "unknown phenomenon: " + phenomenonId);
    }
  }
}
for (const theory of catalog.theories) {
  assert.ok(ids.has(theory.compare_with), "missing compared theory: " + theory.id);
}
assert.equal(ids.size, catalog.theories.length);

// DOM stub captures view transitions without loading the full History Go app.
let rendered = "";
const handlers = new Map();
const node = (selector, dataset = {}) => ({
  dataset,
  addEventListener(event, fn) { handlers.set(selector + ":" + event, fn); },
  classList: { add() {}, remove() {} },
  setAttribute() {},
  appendChild() {},
  querySelector(sel) { return sel === ".psychology-room-content" ? content : node(sel); }
});
const content = {
  set innerHTML(value) { rendered = value; },
  get innerHTML() { return rendered; }
};
let overlay = null;
const existing = new Map();
global.document = {
  body: { appendChild(value) { overlay = value; } },
  getElementById(id) { return id === "psychologyRoomOverlay" ? overlay : null; },
  createElement() { return node("overlay"); },
  querySelector(selector) {
    if (!existing.has(selector)) existing.set(selector, node(selector));
    return existing.get(selector);
  },
  querySelectorAll(selector) {
    if (selector === "[data-theory-id]") return catalog.theories.map((item) => node("theory:" + item.id, { theoryId: item.id }));
    if (selector === "[data-theory-phenomenon]") return phenomena.map((item) => node("related:" + item.id, { theoryPhenomenon: item.id }));
    if (selector === "[data-phenomenon-theory]") return catalog.theories.map((item) => node("linked:" + item.id, { phenomenonTheory: item.id }));
    return [];
  }
};
const storage = new Map();
global.localStorage = {
  getItem(key) { return storage.get(key) || null; },
  setItem(key, value) { storage.set(key, String(value)); }
};
global.window = global;
global.Event = class { constructor(type) { this.type = type; } };
global.CustomEvent = class extends Event {};
global.dispatchEvent = () => true;
global.fetch = async (url) => ({
  ok: true,
  async json() { return json(String(url).replace(/^\/+/, "")); }
});
vm.runInThisContext(fs.readFileSync(path.join(root, "js/psychologyRoom.js"), "utf8"), { filename: "psychologyRoom.js" });
const press = (selector) => {
  const handler = handlers.get(selector + ":click");
  assert.equal(typeof handler, "function", "missing click action for " + selector);
  handler();
};

(async () => {
  await window.PsychologyRoom.open();
  assert.match(rendered, /data-psych-action="theories"/);
  press("[data-psych-action='theories']");
  assert.match(rendered, /Psykoteori/);
  assert.match(rendered, /fagverk\.html\?subject=psykologi&amp;chapter=/);
  press("theory:behaviorisme");
  assert.match(rendered, /Hvordan undersøkes dette\?/);
  assert.match(rendered, /Kilder og rekkevidde/);
  assert.match(rendered, /psychology\.fas\.harvard\.edu\/people\/b-f-skinner/);
  assert.match(rendered, /Hele teorikortet er ennå ikke kildegodkjent/);
  assert.match(rendered, /rel="noopener noreferrer"/);
  assert.match(rendered, /Sammenlign teoriene/);
  assert.match(rendered, /subject=psykologi&amp;emne=em_psy_betinging_vaner/);
  assert.match(rendered, /Også relevant for/);
  assert.match(rendered, /subject=psykologi&amp;emne=em_psy_atferd_laring/);
  assert.match(rendered, /Atferd og læring/);
  assert.match(rendered, /Undervisningseksempel 1 \(hypotetisk\)/);
  assert.match(rendered, /Undervisningseksempel 2 \(hypotetisk\)/);
  assert.match(rendered, /plagsom lyd/);
  press("related:unngaelsesforsterkning");
  assert.match(rendered, /Teoretisk bakgrunn/);
  press("linked:behaviorisme");
  assert.match(rendered, /Fordypning i psykologifagverket/);
  assert.equal(storage.size, 0, "theory navigation must not write personal data");
  console.log("psychology-room-theory.test.js passed");
})().catch((error) => { console.error(error); process.exitCode = 1; });
