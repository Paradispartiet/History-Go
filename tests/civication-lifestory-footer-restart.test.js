#!/usr/bin/env node
// The destructive Life Story restart is a secondary footer action, not a day-end choice.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "Civication.html"), "utf8");
const css = fs.readFileSync(path.join(root, "css/fixed-shell.css"), "utf8");
const source = fs.readFileSync(path.join(root, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8");

assert.match(html, /id="civiMoreMenuToggle"[^>]+aria-controls="civiMoreMenu"/);
assert.match(html, /id="civiMoreMenu"[^>]+hidden/);
assert.match(html, /data-lifestory-restart>Start livet på nytt<\/button>/);
assert.ok(html.indexOf('id="civiMoreMenu"') > html.indexOf('</div>\n  <!-- A separate fixed menu'),
  "popup lives outside scrollable footer to avoid clipping");
assert.match(css, /\.civi-footer-more-menu\s*\{[^}]*position:\s*fixed/s);
assert.match(css, /\.civi-footer-more-menu\[hidden\]\s*\{[^}]*display:\s*none/s);
const summary = source.slice(source.indexOf("function renderSummaryHtml("), source.indexOf("function renderPanelsHtml("));
assert.ok(!summary.includes("data-lifestory-restart"), "day and week summaries do not offer restart");
assert.ok(summary.includes("data-lifestory-next-day"), "next-day control remains available");
assert.ok(summary.includes("data-lifestory-next-action"), "next-action control remains available");
assert.ok(summary.includes("data-lifestory-continue"), "continuation remains available");

class Element {
  constructor() { this.listeners = {}; this.attrs = {}; this.hidden = false; this.focused = false; }
  addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
  setAttribute(name, value) { this.attrs[name] = value; }
  getAttribute(name) { return this.attrs[name]; }
  contains(target) { return this === target; }
  focus() { this.focused = true; }
  emit(type, event = {}) { for (const fn of this.listeners[type] || []) fn(event); }
}
const toggle = new Element();
const menu = new Element();
const restart = new Element();
const outside = new Element();
menu.hidden = true;
menu.contains = target => target === menu || target === restart;
restart.closest = selector => selector === "[data-lifestory-restart]" ? restart : null;
const listeners = {};
const doc = {
  getElementById: id => ({ civiMoreMenuToggle: toggle, civiMoreMenu: menu })[id] || null,
  addEventListener: (type, fn) => (listeners[type] ||= []).push(fn)
};
const win = { confirms: 0, restarts: 0, allowed: false, confirm() { this.confirms++; return this.allowed; } };
const begin = source.indexOf("  function bindFooterRestart() {");
const end = source.indexOf("  async function onContinue(id) {", begin);
assert.ok(begin > 0 && end > begin, "the real footer menu handler is present");
const handler = vm.runInNewContext(`(function() {
  let content = { role: {} }, state = {};
  function shellStoryUnavailable() { return false; }
  function onRestart() { window.restarts += 1; }
  ${source.slice(begin, end)}
  return bindFooterRestart;
})()`, { window: win, document: doc });
handler();
handler(); // repeated startup must not register duplicate clicks
assert.equal(toggle.listeners.click.length, 1);
assert.equal(menu.listeners.click.length, 1);

toggle.emit("click");
assert.equal(menu.hidden, false);
assert.equal(toggle.getAttribute("aria-expanded"), "true");
menu.emit("click", { target: restart });
assert.equal(win.confirms, 1);
assert.equal(win.restarts, 0, "cancelling must preserve save");
assert.equal(menu.hidden, true);

toggle.emit("click");
for (const fn of listeners.click || []) fn({ target: outside });
assert.equal(menu.hidden, true, "outside click closes submenu");

toggle.emit("click");
for (const fn of listeners.keydown || []) fn({ key: "Escape" });
assert.equal(menu.hidden, true);
assert.equal(toggle.focused, true, "Escape restores focus");

win.allowed = true;
toggle.emit("click");
menu.emit("click", { target: restart });
assert.equal(win.restarts, 1, "confirmed restart occurs exactly once");
assert.equal(toggle.getAttribute("aria-expanded"), "false");
console.log("Civication footer life restart test passed");
