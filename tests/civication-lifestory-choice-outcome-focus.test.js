// Real Min dag choice delegation: keep the next consequence discoverable
// without stealing focus from choices that navigate to another app surface.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css/civi-miniature-world.css"), "utf8");
const begin = source.indexOf("  function revealChoiceOutcome(panel, keyboardActivated) {");
const end = source.indexOf("  async function start() {", begin);
assert.ok(begin > 0 && end > begin, "outcome focus helper and real delegated click handler exist");
const delegation = source.slice(begin, end);

function runChoice({ keyboard = false, navigation = false, accepted = true, mapMode = false, outcome = true } = {}) {
  const calls = { chosen: [], focused: 0, scroll: [], attrs: {}, focusOptions: null };
  const focusTarget = {
    setAttribute(name, value) { calls.attrs[name] = value; },
    focus(options) { calls.focused++; calls.focusOptions = options; }
  };
  const destination = {
    querySelector: () => focusTarget,
    scrollIntoView(options) { calls.scroll.push(options); }
  };
  const panel = {
    handlers: {},
    addEventListener(name, handler) { this.handlers[name] = handler; },
    querySelector(selector) {
      if (selector === ".civi-lifestory-konsekvens") return outcome ? destination : null;
      if (selector === ".civi-lifestory-scene") return destination;
      return null;
    }
  };
  const choiceButton = {
    getAttribute(name) { return name === "data-lifestory-scene" ? "scene-a" : "choice-b"; }
  };
  const context = {
    content: { scenes: [{ id: "scene-a", valg: [{ id: "choice-b",
      ...(navigation ? { handling: { type: "gaa_til_byen" } } : {}) }] }] },
    document: { body: { classList: { contains(value) { return mapMode && value === "civi-mapmode"; } } } },
    onChoose(sceneId, choiceId) {
      calls.chosen.push([sceneId, choiceId]);
      return accepted;
    }
  };
  const binding = vm.runInNewContext(`(function() { ${delegation} return { bindDelegation, revealChoiceOutcome }; })()`, context);
  binding.bindDelegation(panel);
  const event = { detail: keyboard ? 0 : 1,
    target: { closest(selector) { return selector === "[data-lifestory-choice]" ? choiceButton : null; } } };
  panel.handlers.click(event);
  return { calls, panel, binding };
}

test("touch choice scrolls to result without stealing keyboard focus", () => {
  const { calls } = runChoice();
  assert.equal(calls.chosen.length, 1);
  assert.equal(calls.chosen[0][0], "scene-a");
  assert.equal(calls.chosen[0][1], "choice-b");
  assert.equal(calls.scroll.length, 1);
  assert.equal(calls.scroll[0].block, "start");
  assert.equal(calls.focused, 0);
});

test("keyboard choice restores focus to result label", () => {
  const { calls } = runChoice({ keyboard: true });
  assert.equal(calls.scroll.length, 1);
  assert.equal(calls.focused, 1);
  assert.equal(calls.attrs.tabindex, "-1");
  assert.equal(calls.focusOptions.preventScroll, true);
});

test("navigation choice leaves destination in control of focus and scroll", () => {
  const { calls } = runChoice({ navigation: true, keyboard: true });
  assert.equal(calls.chosen.length, 1);
  assert.equal(calls.focused, 0);
  assert.equal(calls.scroll.length, 0);
});

test("rejected choice and map view cannot scroll or focus Min dag", () => {
  for (const opts of [{ accepted: false }, { mapMode: true }]) {
    const { calls } = runChoice(opts);
    assert.equal(calls.scroll.length, 0);
    assert.equal(calls.focused, 0);
  }
});

test("rerender preserves just one delegated choice handler", () => {
  const { panel, binding } = runChoice();
  const handler = panel.handlers.click;
  binding.bindDelegation(panel);
  assert.equal(panel.handlers.click, handler);
});

test("result remains readable below fixed header and focus visibly marked", () => {
  assert.match(css, /\.civi-lifestory-konsekvens,[\s\S]*scroll-margin-top: 86px/);
  assert.match(css, /\.civi-lifestory-section-label\[tabindex="-1"\]:focus-visible/);
});
