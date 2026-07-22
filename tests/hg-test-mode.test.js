const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "..", "js", "debug", "HGTestMode.js"),
  "utf8"
);

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(String(key), String(value));
    },
    removeItem(key) {
      values.delete(String(key));
    }
  };
}

function runRuntime({ storage = {}, href = "https://example.test/History-Go/" } = {}) {
  const listeners = new Map();
  const localStorage = createStorage(storage);
  const location = { href };
  const history = {
    state: null,
    replaced: null,
    replaceState(_state, _title, url) {
      this.replaced = String(url);
    }
  };

  const window = {
    localStorage,
    location,
    history,
    dispatchEvent() {},
    addEventListener(type, handler) {
      const group = listeners.get(type) || [];
      group.push(handler);
      listeners.set(type, group);
    }
  };
  window.window = window;

  vm.runInContext(source, vm.createContext({
    window,
    localStorage,
    location,
    history,
    URL,
    CustomEvent: class CustomEvent {
      constructor(type, init = {}) {
        this.type = type;
        this.detail = init.detail;
      }
    }
  }), { filename: "js/debug/HGTestMode.js" });

  return {
    window,
    localStorage,
    history,
    emit(type) {
      for (const handler of listeners.get(type) || []) handler();
    }
  };
}

{
  const runtime = runRuntime({ storage: { HG_OPEN_MODE: "1" } });
  assert.equal(runtime.window.HGTestMode.isEnabled(), false);
  assert.equal(runtime.window.HG_TEST_MODE, false);
  assert.equal(runtime.window.TEST_MODE, false);
  assert.equal(runtime.window.OPEN_MODE, false);
  assert.equal(runtime.localStorage.getItem("HG_OPEN_MODE"), null);
  assert.equal(runtime.localStorage.getItem("HG_TEST_MODE"), null);
}

{
  const runtime = runRuntime({ storage: { HG_TEST_MODE: "1" } });
  assert.equal(runtime.window.HGTestMode.enabled, true);
  assert.equal(runtime.window.HG_TEST_MODE, true);
  assert.equal(runtime.window.TEST_MODE, true);
  assert.equal(runtime.window.OPEN_MODE, true);
  assert.equal(runtime.localStorage.getItem("HG_OPEN_MODE"), "1");

  runtime.emit("hg:criticalReady");
  assert.equal(runtime.localStorage.getItem("HG_OPEN_MODE"), null);
  assert.equal(runtime.localStorage.getItem("HG_TEST_MODE"), "1");
}

{
  const runtime = runRuntime({
    href: "https://example.test/History-Go/?foo=bar&hgTest=1#/map"
  });
  assert.equal(runtime.window.HGTestMode.isEnabled(), true);
  assert.equal(runtime.localStorage.getItem("HG_TEST_MODE"), "1");
  assert.equal(runtime.history.replaced, "/History-Go/?foo=bar#/map");

  runtime.window.HGTestMode.disable();
  assert.equal(runtime.window.HGTestMode.isEnabled(), false);
  assert.equal(runtime.localStorage.getItem("HG_TEST_MODE"), null);
  assert.equal(runtime.localStorage.getItem("HG_OPEN_MODE"), null);
}

{
  const runtime = runRuntime({
    storage: { HG_TEST_MODE: "1" },
    href: "https://example.test/History-Go/?hgTest=0"
  });
  assert.equal(runtime.window.HGTestMode.isEnabled(), false);
  assert.equal(runtime.localStorage.getItem("HG_TEST_MODE"), null);
  assert.equal(runtime.history.replaced, "/History-Go/");
}

console.log("hidden test mode tests passed");
