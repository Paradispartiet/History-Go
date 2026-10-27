#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const timers = new Map();
let now = 0, nextTimer = 0;
const schedule = (fn, ms = 0) => {
  const id = ++nextTimer;
  timers.set(id, { fn, at: now + Number(ms) });
  return id;
};
const advance = ms => {
  const until = now + ms;
  while (true) {
    const timer = [...timers].filter(([, t]) => t.at <= until).sort((a,b) => a[1].at - b[1].at)[0];
    if (!timer) break;
    now = timer[1].at;
    timers.delete(timer[0]);
    timer[1].fn();
  }
  now = until;
};
const dom = new Map();
const element = name => ({
  name, id: "", textContent: "", innerHTML: "",
  setAttribute(key, val) { this[key] = val; },
  appendChild(child) { dom.set(child.id, child); },
  remove() { dom.delete(this.id); }
});
const document = {
  body: element("body"), head: element("head"),
  createElement: element,
  getElementById: id => dom.get(id) || null
};
const listeners = new Map();
const window = {
  document,
  addEventListener(name, fn) {
    if (!listeners.has(name)) listeners.set(name, []);
    listeners.get(name).push(fn);
  }
};
vm.runInNewContext(fs.readFileSync("js/progress/HGDailyProgressToast.js", "utf8"), {
  window, document, console, Set, Math, Number, String,
  setTimeout: schedule, clearTimeout: id => timers.delete(id)
});
const toast = window.HG_DailyProgressToast;
assert.equal(toast.show("<Mål>", "Første oppdrag"), true);
assert.equal(toast.show("Neste", "Andre oppdrag"), true);
assert.equal(toast.isVisible(), false);
const tasks = [];
window.HGToastRuntime = { enqueueReward(fn) { tasks.push(fn); return true; } };
(listeners.get("hg:appReady") || []).forEach(fn => fn());
assert.equal(tasks.length, 2);
let releases = 0;
tasks[0](() => releases++);
assert.equal(toast.isVisible(), true);
assert.match(document.getElementById("hgDailyProgressToast").innerHTML, /&lt;Mål&gt;/);
const css = document.getElementById("hgDailyProgressToastStyle").textContent;
assert.match(css, /--hg-mission-notification-bottom/);
assert.match(css, /z-index:2147481800/);
advance(2599);
assert.equal(toast.isVisible(), true);
advance(1);
assert.equal(toast.isVisible(), false);
assert.equal(releases, 1);
tasks[1](() => releases++);
toast.hide();
assert.equal(releases, 2);
assert.equal(toast.isVisible(), false);
assert.equal(toast.show("Avbryt", "Venter"), true);
toast.hide();
tasks[2](() => releases++);
assert.equal(releases, 3);
assert.equal(toast.isVisible(), false);
assert.equal(toast.show("Avvis", "", { type: "unknown" }), false);
console.log("Daily progress toast queue and overlay: OK");
