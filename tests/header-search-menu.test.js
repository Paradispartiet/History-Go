const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.join(__dirname, "..");

function fakeClassList() {
  const values = new Set();
  return {
    toggle(name, force) {
      const enabled = force === undefined ? !values.has(name) : Boolean(force);
      if (enabled) values.add(name);
      else values.delete(name);
      return enabled;
    },
    contains(name) {
      return values.has(name);
    }
  };
}

function fakeElement(options = {}) {
  const listeners = new Map();
  const attributes = new Map();
  return {
    dataset: {},
    style: {},
    classList: fakeClassList(),
    hidden: Boolean(options.hidden),
    value: "",
    blurred: false,
    innerHTML: "",
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    addEventListener(type, listener) {
      const group = listeners.get(type) || [];
      group.push(listener);
      listeners.set(type, group);
    },
    dispatch(type, event) {
      for (const listener of listeners.get(type) || []) listener(event);
    },
    contains(node) {
      return node === this;
    },
    blur() {
      this.blurred = true;
    }
  };
}

function runScript(relativePath, context) {
  const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
  vm.runInContext(source, vm.createContext(context), { filename: relativePath });
}

function testHeaderMenuApi() {
  const root = fakeElement();
  const button = fakeElement();
  const panel = fakeElement({ hidden: true });
  const elements = { headerMenu: root, headerMenuButton: button, headerMenuPanel: panel };
  const documentListeners = new Map();
  const document = {
    readyState: "complete",
    querySelector(selector) {
      return String(selector).startsWith("link[") ? fakeElement() : null;
    },
    getElementById(id) {
      return elements[id] || null;
    },
    addEventListener(type, listener) {
      documentListeners.set(type, listener);
    }
  };
  const window = {};

  runScript("js/ui/header-menu.js", { window, document, console });

  assert.equal(typeof window.HGHeaderMenu?.close, "function");
  window.HGHeaderMenu.open();
  assert.equal(panel.hidden, false);
  assert.equal(button.getAttribute("aria-expanded"), "true");

  window.HGHeaderMenu.close();
  assert.equal(panel.hidden, true);
  assert.equal(button.getAttribute("aria-expanded"), "false");
  assert.equal(root.classList.contains("is-open"), false);
}

function testPlaceSelectionClosesWholeMenu() {
  const input = fakeElement();
  const results = fakeElement();
  const elements = { globalSearch: input, searchResults: results };
  const document = {
    getElementById(id) {
      return elements[id] || null;
    },
    addEventListener() {}
  };
  const selectedPlace = { id: "test-place", name: "Teststed", lat: 59.9, lon: 10.7 };
  let closeCount = 0;
  let navigatedPlace = null;
  const callOrder = [];
  const window = {
    PLACES: [selectedPlace],
    PEOPLE: [],
    CATEGORY_LIST: [],
    HGHeaderMenu: {
      close() {
        closeCount += 1;
        callOrder.push("close-menu");
      }
    },
    flyToPlace(place) {
      navigatedPlace = place;
      callOrder.push("navigate-to-place");
    }
  };
  window.window = window;

  class HTMLInputElement {
    static [Symbol.hasInstance](value) { return value === input; }
  }
  class Element {
    static [Symbol.hasInstance](value) { return !!value && typeof value.closest === "function"; }
  }
  class HTMLElement {
    static [Symbol.hasInstance](value) { return !!value && typeof value === "object" && "dataset" in value; }
  }

  runScript("js/ui/search.js", { window, document, console, HTMLInputElement, Element, HTMLElement });

  const item = { dataset: { place: selectedPlace.id } };
  results.dispatch("click", {
    target: {
      closest(selector) {
        return selector === ".search-item" ? item : null;
      }
    }
  });

  assert.equal(input.blurred, true);
  assert.equal(results.style.display, "none");
  assert.equal(closeCount, 1);
  assert.equal(navigatedPlace, selectedPlace);
  assert.deepEqual(callOrder, ["close-menu", "navigate-to-place"]);
}

function testSearchWidthRules() {
  const theme = fs.readFileSync(path.join(repoRoot, "css/theme.css"), "utf8");
  const search = fs.readFileSync(path.join(repoRoot, "css/search.css"), "utf8");

  assert.match(theme, /\.header-menu-panel\s*\{[^}]*width:\s*min\(400px,\s*calc\(100vw - 24px\)\)/s);
  assert.match(search, /body\.hg-app\.hg-phone \.header-menu-search #globalSearch\s*\{[^}]*max-width:\s*none/s);
}

function testMenuLabelsDescribeTheirRealDestinations() {
  const index = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");

  assert.match(index, /class="header-menu-action[^\"]*civication-nav-link"[\s\S]*aria-label="Civication"[\s\S]*<span class="header-menu-action-label">Civication<\/span>/);
  assert.doesNotMatch(index, /Lås opp testmodus/);
  assert.doesNotMatch(index, /id="openToggle"/);
  assert.doesNotMatch(index, /id="btnUnlockAll"/);
  assert.match(index, /<script src="js\/debug\/HGTestMode\.js"><\/script>/);
}

testHeaderMenuApi();
testPlaceSelectionClosesWholeMenu();
testSearchWidthRules();
testMenuLabelsDescribeTheirRealDestinations();
console.log("header search menu tests passed");
