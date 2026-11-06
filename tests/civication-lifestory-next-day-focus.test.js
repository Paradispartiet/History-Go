// Guard that "Start neste dag" preserves the player's reading/focus position
// without jumping when the actual shell calendar refuses to advance.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.join(__dirname, "../js/Civication/ui/CivicationLifestoryUI.js"), "utf8");
const beginNext = source.indexOf("  async function onNextDay(keyboardActivated = false) {");
const endNext = source.indexOf("  function onRestart() {", beginNext);
const beginFocus = source.indexOf("  function revealNextDay(panel, keyboardActivated) {");
const endFocus = source.indexOf("  function bindDelegation(panel) {", beginFocus);
assert.ok(beginNext > 0 && endNext > beginNext && beginFocus > 0 && endFocus > beginFocus,
  "actual next-day transition and focus helper must remain testable");
const realFunctions = source.slice(beginNext, endNext) + "\n" + source.slice(beginFocus, endFocus);
assert.match(source, /onNextDay\(event\.detail === 0\)/, "keyboard origin is passed from the next-day control");

function setup({ shell = false, blocked = false, keyboard = false, mapMode = false,
  hasScene = true } = {}) {
  const actions = { scroll: 0, focus: 0, renders: 0, saves: 0, dispatches: 0, lastFocusOptions: null, attrs: {} };
  const state = { dag: 3, livsdag: 3, dagFerdig: true };
  let shellDay = 3;
  const heading = {
    setAttribute(name, value) { actions.attrs[name] = value; },
    focus(options) { actions.focus++; actions.lastFocusOptions = options; }
  };
  const destination = {
    querySelector(selector) { return selector === "h3" ? heading : null; },
    scrollIntoView(options) {
      assert.equal(options.block, "start");
      actions.scroll++;
    }
  };
  const panel = {
    querySelector(selector) {
      if (selector === ".civi-lifestory-scene") return hasScene ? destination : null;
      if (selector === ".civi-lifestory-summary") return destination;
      return null;
    }
  };
  const window = {
    CivicationLifestoryRunner: {
      startNextDay(nextState) { nextState.livsdag++; nextState.dag++; nextState.dagFerdig = false; }
    },
    CivicationLifestoryState: { load: () => null, save: () => { actions.saves++; } },
    dispatchEvent: () => { actions.dispatches++; }
  };
  const scope = {
    state, content: {}, window, document: {
      body: { classList: { contains: cls => cls === "civi-mapmode" && mapMode } }
    },
    Event: class { constructor(type) { this.type = type; } },
    dayAdvancePending: false,
    shellStoryUnavailable: () => false,
    getShellDay: () => shell ? shellDay : null,
    syncSharedPrivateState() {},
    ensureShellDayAdvanced: async () => {
      if (blocked) return false;
      shellDay++;
      return true;
    },
    syncToShellCalendar: () => {
      state.livsdag++; state.dag++; state.dagFerdig = false;
    },
    render: () => { actions.renders++; },
    getPanel: () => panel
  };
  const api = vm.runInNewContext(`(function() {
    ${realFunctions}
    return { runNextDay: onNextDay, revealNextDay };
  })()`, scope);
  return { api, state, actions, scope, keyboard };
}

test("local Min dag advances, saves and scrolls to the new scene on touch", async () => {
  const { api, state, actions } = setup();
  await api.runNextDay(false);
  assert.equal(state.livsdag, 4);
  assert.equal(state.dagFerdig, false);
  assert.equal(actions.saves, 1);
  assert.equal(actions.renders, 1);
  assert.equal(actions.scroll, 1);
  assert.equal(actions.focus, 0);
});

test("keyboard next-day focus moves from replaced button to new heading", async () => {
  const { api, actions } = setup({ keyboard: true });
  await api.runNextDay(true);
  assert.equal(actions.scroll, 1);
  assert.equal(actions.focus, 1);
  assert.equal(actions.attrs.tabindex, "-1");
  assert.equal(actions.lastFocusOptions.preventScroll, true);
});

test("shell day stays put when pending inbox work blocks day transition", async () => {
  const { api, state, actions } = setup({ shell: true, blocked: true });
  await api.runNextDay(true);
  assert.equal(state.livsdag, 3);
  assert.equal(actions.renders, 1);
  assert.equal(actions.scroll, 0);
  assert.equal(actions.focus, 0);
});

test("canonical shell day transition reveals new scene exactly once", async () => {
  const { api, state, actions } = setup({ shell: true });
  await api.runNextDay(true);
  assert.equal(state.livsdag, 4);
  assert.equal(actions.scroll, 1);
  assert.equal(actions.focus, 1);
});

test("do not steal focus or scroll when the map takes over", async () => {
  const { api, actions } = setup({ mapMode: true });
  await api.runNextDay(true);
  assert.equal(actions.scroll, 0);
  assert.equal(actions.focus, 0);
});

test("if a chapter still ends in summary, give summary a focus landing point", async () => {
  const { api, actions } = setup({ hasScene: false });
  await api.runNextDay(true);
  assert.equal(actions.focus, 1);
  assert.equal(actions.scroll, 1);
});
