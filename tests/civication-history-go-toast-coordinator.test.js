#!/usr/bin/env node
// The real History Go toast runtime, exercised with a deterministic DOM/clock.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const timers = new Map();
let clock = 0, timerId = 0, waitForApp = false;
function setTimer(fn, ms = 0) {
  const id = ++timerId;
  timers.set(id, { at: clock + Number(ms || 0), fn });
  return id;
}
function clearTimer(id) { timers.delete(id); }
function advance(ms) {
  const until = clock + ms;
  for (;;) {
    const next = [...timers].sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
    if (!next || next[1].at > until) break;
    clock = next[1].at;
    timers.delete(next[0]);
    next[1].fn();
  }
  clock = until;
}

const storage = new Map();
const localStorage = {
  getItem(k) { return storage.get(k) ?? null; },
  setItem(k, v) { storage.set(k, String(v)); },
  removeItem(k) { storage.delete(k); }
};
const nodes = new Map();
const listeners = new Map();
function element(tag) {
  const handlers = new Map();
  const el = {
    tagName: tag, style: { removeProperty(prop) { delete this[prop]; } },
    children: [], attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    addEventListener(k, fn) { handlers.set(k, fn); },
    fire(k) { handlers.get(k)?.(); },
    appendChild(child) {
      this.children.push(child);
      child.parentNode = this;
      if (child.id) nodes.set(child.id, child);
    }
  };
  Object.defineProperty(el, "innerHTML", {
    set(v) { this.children = []; this._html = v; },
    get() { return this._html || ""; }
  });
  return el;
}
const body = element("body");
body.classList = { contains(k) { return k === "hg-app" && waitForApp; } };
const document = {
  body, readyState: "loading",
  getElementById(id) { return nodes.get(id) || null; },
  createElement: element,
  addEventListener() {}
};
const location = { hash: "#/map", href: "index.html" };
const window = {
  location, API: {}, innerHeight: 840,
  addEventListener(name, callback) {
    const list = listeners.get(name) || [];
    list.push(callback);
    listeners.set(name, list);
  },
  emit(name) { (listeners.get(name) || []).forEach(fn => fn()); }
};
vm.runInNewContext(fs.readFileSync("js/ui/toast.js", "utf8"), {
  window, document, localStorage, location, console, Date, JSON, Math, Set, Map,
  URL, setTimeout: setTimer, clearTimeout: clearTimer
}, { filename: "js/ui/toast.js" });

const visible = () => {
  const toast = nodes.get("toast");
  return toast?.style.display === "block" ? toast.children.find(c => c.className === "toast-body")?.textContent : null;
};
window.showToast("Første", 1000);
window.showToast("Andre", 1000);
assert.equal(window.HGToastCoordinator.pendingCount, 1);
advance(260);
assert.equal(visible(), "Første");
advance(999);
assert.equal(visible(), "Første", "second toast must never replace the first early");
advance(1);
assert.equal(visible(), null);
advance(259);
assert.equal(visible(), null);
advance(1);
assert.equal(visible(), "Andre");
advance(1000);
assert.equal(visible(), null);

// Achievements take priority over a waiting ordinary toast, but do not interrupt one.
window.showToast("Aktiv", 600);
advance(260);
const order = [];
window.showToast("Venter", 600);
window.HGToastCoordinator.enqueueReward(done => {
  order.push("reward");
  setTimer(done, 400);
}, 40);
advance(600);
assert.equal(visible(), null);
advance(260);
assert.deepEqual(order, ["reward"]);
assert.equal(visible(), null);
advance(400);
advance(260);
assert.equal(visible(), "Venter");
advance(600);

// Open Civication sessions do not expire after a day or end when navigating back.
const api = window.HGCivicationMode;
const mission = {
  active: true, title: "Finn historien", target_type: "knowledge",
  completion_mode: "quiz_completed", quiz_id: "q-42",
  started_ts: Date.now() - 5 * 86400000, return_href: "Civication.html"
};
assert.equal(api.saveSession(mission), true);
assert.equal(api.getSession().quiz_id, "q-42");
storage.set("quiz_progress", JSON.stringify({ "q-42": { opened: true, answered: 2 } }));
assert.equal(api.evaluateCompletion(mission).completed, false,
  "a partially answered quiz must not count as completed");
storage.set("hg_unlocks_v1", JSON.stringify({ byQuiz: { "q-42": { quizId: "q-42" } } }));
assert.equal(api.evaluateCompletion(mission).completed, true,
  "persisted unlock evidence completes the quiz requirement");
api.returnToCivication();
assert.equal(location.href, "Civication.html");
assert.equal(api.getSession().quiz_id, "q-42", "return must not erase the session");

// Before the game is ready, messages remain queued rather than being lost.
waitForApp = true;
window.showToast("Oppstart", 700);
advance(3000);
assert.equal(visible(), null);
waitForApp = false;
window.emit("hg:appReady");
advance(260);
assert.equal(visible(), "Oppstart");
advance(700);
assert.equal(visible(), null);

const welcome = fs.readFileSync("js/ui/onboarding-welcome.js", "utf8");
for (const label of ["Civication + History Go", "Sted → Besøk → Quiz → Merke → Kort", "Stedskort krever"]) {
  assert.ok(welcome.includes(label), "missing onboarding explanation: " + label);
}
console.log("History Go toast queue, reward priority, mission persistence and welcome copy: OK");
