#!/usr/bin/env node
// Verifies CivicationConsequenceFeedback: formats a metric delta into readable lines and renders
// a transient feedback element when a civication:consequence event fires.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const modPath = path.join(root, "js/Civication/ui/CivicationConsequenceFeedback.js");

// minimal DOM stub
function makeEl() {
  return {
    children: [],
    className: "",
    id: "",
    style: {},
    textContent: "",
    attrs: {},
    parentNode: null,
    setAttribute(k, v) { this.attrs[k] = v; },
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
global.window.addEventListener = (type, fn) => { if (type === "civication:consequence") listener = fn; };
global.requestAnimationFrame = (fn) => fn();
global.setTimeout = () => 0;
global.clearTimeout = () => {};
global.document = {
  head,
  body,
  getElementById: (id) => byId[id] || null,
  createElement: (tag) => {
    const el = makeEl();
    el.tagName = tag;
    // mimic getElementById tracking when an id is set on a style element
    Object.defineProperty(el, "id", {
      get() { return el._id || ""; },
      set(v) { el._id = v; byId[v] = el; }
    });
    return el;
  }
};

vm.runInThisContext(fs.readFileSync(modPath, "utf8"), { filename: modPath });
const M = global.CivicationConsequenceFeedback;
assert(M && typeof M.render === "function", "module exposed");

// formatDelta: signs, arrows, labels, drops zeros
const rows = M.formatDelta({ kundetillit: 1, integritet: -1, stress: 0 });
assert.strictEqual(rows.length, 2, "zero deltas dropped");
const kunde = rows.find((r) => r.key === "kundetillit");
const integ = rows.find((r) => r.key === "integritet");
assert.strictEqual(kunde.text, "Kundetillit +1", "positive formatted");
assert.strictEqual(kunde.dir, "up", "positive dir");
assert.strictEqual(integ.text, "Integritet −1", "negative formatted with unicode minus");
assert.strictEqual(integ.dir, "down", "negative dir");
assert.strictEqual(M.labelFor("brand_tillit"), "Merketillit", "label mapping");

// empty/garbage delta -> nothing
assert.strictEqual(M.formatDelta({}).length, 0, "empty delta -> no rows");
assert.strictEqual(M.render({ delta: {} }), null, "empty delta renders nothing");

// render appends a feedback element to body with the formatted chips
const el = M.render({ delta: { kundetillit: 1, integritet: -1 }, brand_name: "Norli" });
assert.ok(el, "element rendered");
assert.strictEqual(body.children.length, 1, "appended to body");
assert.strictEqual(el.className, "civi-consequence", "root class");
const text = JSON.stringify(collectText(el));
assert.ok(/Svaret ga konsekvens/.test(text), "has title");
assert.ok(/Kundetillit \+1/.test(text), "shows positive chip");
assert.ok(/Integritet −1/.test(text), "shows negative chip");

// styles injected once
assert.ok(byId.civiConsequenceStyles, "styles injected");

// the event listener is wired and renders
assert.strictEqual(typeof listener, "function", "listener registered");
listener({ detail: { delta: { faglighet: 2 } } });
assert.strictEqual(body.children.length, 1, "previous feedback replaced, one element");

function collectText(el) {
  const out = [];
  (function walk(n) {
    if (n.textContent) out.push(n.textContent);
    (n.children || []).forEach(walk);
  })(el);
  return out;
}

console.log("civication consequence feedback ok");
