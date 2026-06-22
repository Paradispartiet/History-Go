#!/usr/bin/env node
// Verifies CivicationMilestoneHighlight: builds a reason line from a milestone detail and renders
// a prominent highlight card when a civication:milestone event fires.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const modPath = path.join(root, "js/Civication/ui/CivicationMilestoneHighlight.js");

function makeEl() {
  return {
    children: [],
    className: "",
    style: {},
    textContent: "",
    attrs: {},
    parentNode: null,
    _listeners: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    addEventListener(t, fn) { this._listeners[t] = fn; },
    appendChild(c) { c.parentNode = this; this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; },
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    }
  };
}

let listener = null;
const head = makeEl();
const body = makeEl();
const byId = {};
global.window = global;
global.window.addEventListener = (type, fn) => { if (type === "civication:milestone") listener = fn; };
global.requestAnimationFrame = (fn) => fn();
global.setTimeout = () => 0;
global.clearTimeout = () => {};
// reuse shared metric labels (as in the real app where consequence feedback is loaded too)
global.CivicationConsequenceFeedback = { labelFor: (k) => (k === "kundetillit" ? "Kundetillit" : String(k)) };
global.document = {
  head,
  body,
  getElementById: (id) => byId[id] || null,
  createElement: () => {
    const el = makeEl();
    Object.defineProperty(el, "id", { get() { return el._id || ""; }, set(v) { el._id = v; byId[v] = el; } });
    return el;
  }
};

vm.runInThisContext(fs.readFileSync(modPath, "utf8"), { filename: modPath });
const M = global.CivicationMilestoneHighlight;
assert(M && typeof M.render === "function", "module exposed");

// reasonText: metric + threshold, reuses shared label
assert.strictEqual(M.reasonText({ metric: "kundetillit", threshold: 3 }), "Kundetillit nådde 3", "reason line");
assert.strictEqual(M.reasonText({}), "", "no metric -> empty reason");

// no subject -> nothing rendered
assert.strictEqual(M.render({ subject: "" }), null, "empty subject renders nothing");

// render a full milestone
const el = M.render({
  subject: "Kunder begynner å spørre etter deg",
  summary: "Du har bygget kundetillit.",
  metric: "kundetillit",
  threshold: 3,
  value: 3,
  brand_name: "Norli"
});
assert.ok(el, "element rendered");
assert.strictEqual(body.children.length, 1, "appended to body");
assert.strictEqual(el.className, "civi-milestone", "root class");
const text = collectText(el).join(" | ");
assert.ok(/Milepæl nådd/.test(text), "kicker shown");
assert.ok(/Kunder begynner å spørre etter deg/.test(text), "subject shown");
assert.ok(/Kundetillit nådde 3/.test(text), "reason shown");
assert.ok(/Du har bygget kundetillit/.test(text), "summary shown");
assert.ok(byId.civiMilestoneStyles, "styles injected");
assert.strictEqual(typeof el._listeners.click, "function", "click dismiss wired");

// listener wired and renders
assert.strictEqual(typeof listener, "function", "event listener registered");
listener({ detail: { subject: "Du får ansvar for anbefalingsbordet", metric: "faglighet", threshold: 3 } });
assert.strictEqual(body.children.length, 1, "previous highlight replaced, one element");

function collectText(node) {
  const out = [];
  (function walk(n) {
    if (n.textContent) out.push(n.textContent);
    (n.children || []).forEach(walk);
  })(node);
  return out;
}

console.log("civication milestone highlight ok");
