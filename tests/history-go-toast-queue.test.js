#!/usr/bin/env node
// Regression: startup toasts must be serialized, not replaced every 350 ms.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

let now = 0;
let timerId = 0;
const timers = new Map();
const setTimer = (callback, delay = 0) => {
  const id = ++timerId;
  timers.set(id, { callback, at: now + Number(delay) });
  return id;
};
function advance(delta) {
  const end = now + delta;
  while (true) {
    const next = [...timers].filter(([, task]) => task.at <= end)
      .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
    if (!next) break;
    now = next[1].at;
    timers.delete(next[0]);
    next[1].callback();
  }
  now = end;
}

class Element {
  constructor() {
    this.style = { removeProperty(name) { delete this[name]; } };
    this.children = [];
    this.attributes = {};
    this.handlers = {};
    this.classList = { contains: () => false };
  }
  set innerHTML(_) { this.children = []; }
  appendChild(child) { this.children.push(child); return child; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  addEventListener(name, handler) { (this.handlers[name] ||= []).push(handler); }
}

const toast = new Element();
const modal = new Element();
modal.setAttribute("aria-hidden", "true");
const document = {
  readyState: "loading",
  body: { classList: { contains: (name) => name === "hg-app" } },
  getElementById(id) { return id === "toast" ? toast : id === "hgOnboardingModal" ? modal : null; },
  createElement: () => new Element(),
  addEventListener() {}
};
const events = {};
const window = {
  __HG_APP_READY__: false,
  el: { toast },
  API: {},
  addEventListener(name, handler) { (events[name] ||= []).push(handler); }
};
const emit = (name) => (events[name] || []).forEach(handler => handler());
const sandbox = {
  window, document, location: { hash: "#/map" },
  localStorage: { getItem: () => null },
  setTimeout: setTimer, clearTimeout: (id) => timers.delete(id),
  Date, console
};
const source = fs.readFileSync(path.join(__dirname, "..", "js", "ui", "toast.js"), "utf8");
vm.runInNewContext(source, sandbox, { filename: "toast.js" });

const visibleText = () => toast.children[1]?.textContent;
window.showToast("Første", 1000);
window.showToast("Andre", 1000);
assert.equal(toast.style.display, undefined, "startup notifications wait for app readiness");

window.__HG_APP_READY__ = true;
emit("hg:appReady");
advance(260);
assert.equal(visibleText(), "Første");
advance(900);
assert.equal(visibleText(), "Første", "another toast cannot overwrite an active toast");
advance(100);
assert.equal(toast.style.display, "none");
advance(250);
assert.equal(visibleText(), "Andre", "second toast is shown after first finished");

modal.setAttribute("aria-hidden", "false");
window.showToast("Tredje", 1000);
advance(1250);
assert.equal(visibleText(), "Andre", "onboarding defers subsequent toasts");
modal.setAttribute("aria-hidden", "true");
emit("hg:onboardingClosed");
assert.equal(visibleText(), "Tredje", "queued notification returns when onboarding closes");

console.log("History Go toast queue is sequential and restores after onboarding");
