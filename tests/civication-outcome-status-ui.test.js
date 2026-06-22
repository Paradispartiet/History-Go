#!/usr/bin/env node
// Verifies CivicationOutcomeStatusUI: shows a standalone career-outcome banner exactly when there
// is a terminal outcome but no active job (the FIRED gap, where the day-phase panel is gone), and
// removes it otherwise.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const modPath = path.join(root, "js/Civication/ui/CivicationOutcomeStatusUI.js");

function makeEl() {
  return {
    children: [],
    className: "",
    innerHTML: "",
    attrs: {},
    parentNode: null,
    setAttribute(k, v) { this.attrs[k] = v; },
    insertBefore(c, ref) { c.parentNode = this; this.children.unshift(c); return c; },
    appendChild(c) { c.parentNode = this; this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; return c; },
    get firstChild() { return this.children[0] || null; }
  };
}

const head = makeEl();
const panels = makeEl();
panels.className = "civi-panels";
const byId = {};
const listeners = {};

// mutable test state
let outcomeVM = null;
let activePosition = null;

global.window = global;
global.window.addEventListener = (type, fn) => { listeners[type] = fn; };
global.CivicationCareerOutcomeRuntime = { getOutcomeViewModel: () => outcomeVM };
global.CivicationState = { getState: () => ({}), getActivePosition: () => activePosition };
global.document = {
  readyState: "complete",
  addEventListener() {},
  querySelector: (sel) => (sel === ".civi-panels" ? panels : null),
  getElementById: (id) => byId[id] || null,
  head,
  createElement: () => {
    const el = makeEl();
    Object.defineProperty(el, "id", { get() { return el._id || ""; }, set(v) { el._id = v; byId[v] = el; } });
    return el;
  }
};

vm.runInThisContext(fs.readFileSync(modPath, "utf8"), { filename: modPath });
const M = global.CivicationOutcomeStatusUI;
assert(M && typeof M.render === "function", "module exposed");

// shouldShow logic
assert.strictEqual(M.shouldShow({ hasOutcome: true }, null), true, "terminal + no job -> show");
assert.strictEqual(M.shouldShow({ hasOutcome: true }, { brand_id: "x" }), false, "terminal + active job -> hide (panel owns it)");
assert.strictEqual(M.shouldShow({ hasOutcome: false }, null), false, "no outcome -> hide");
assert.strictEqual(M.shouldShow(null, null), false, "no vm -> hide");

// no outcome -> nothing rendered
outcomeVM = { hasOutcome: false };
activePosition = null;
assert.strictEqual(M.render(), false, "nothing to show");
assert.strictEqual(panels.children.length, 0, "no banner appended");

// FIRED + no active job -> standalone banner inserted at top of .civi-panels
outcomeVM = { hasOutcome: true, status: "FIRED", statusLabel: "Arbeidsforhold avsluttet", statusDetail: "Videre meldinger går via NAV." };
activePosition = null;
assert.strictEqual(M.render(), true, "renders after FIRED");
assert.strictEqual(panels.children.length, 1, "banner inserted");
const el = byId.civiOutcomeStatus;
assert.ok(el, "container created");
assert.ok(/is-fired/.test(el.innerHTML), "fired styling");
assert.ok(/Arbeidsforhold avsluttet/.test(el.innerHTML), "shows label");
assert.ok(/NAV/.test(el.innerHTML), "shows detail");

// regaining an active job -> banner removed (day-phase panel takes over again)
activePosition = { brand_id: "norli" };
assert.strictEqual(M.render(), false, "hidden once a job is active");
assert.strictEqual(panels.children.length, 0, "banner removed");

// fires via updateProfile listener
assert.strictEqual(typeof listeners.updateProfile, "function", "updateProfile listener wired");
activePosition = null;
listeners.updateProfile();
assert.strictEqual(panels.children.length, 1, "re-rendered on updateProfile");

console.log("civication outcome status ui ok");
