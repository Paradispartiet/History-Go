import fs from "node:fs";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function write(path, content) {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true });
  fs.writeFileSync(path, content);
}

function replaceOnce(source, before, after, label) {
  const first = source.indexOf(before);
  if (first < 0) throw new Error(`Fant ikke blokk for ${label}`);
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Blokken for ${label} finnes flere ganger`);
  }
  return source.slice(0, first) + after + source.slice(first + before.length);
}

const testModeRuntime = `(function () {
  "use strict";

  const root = window;
  const STORAGE_KEY = "HG_TEST_MODE";
  const LEGACY_STORAGE_KEY = "HG_OPEN_MODE";
  const QUERY_KEY = "hgTest";

  let enabled = false;
  let initialized = false;
  let bootFinalized = false;

  function safeGet(key) {
    try {
      return root.localStorage?.getItem?.(key) ?? null;
    } catch {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      root.localStorage?.setItem?.(key, value);
    } catch {}
  }

  function safeRemove(key) {
    try {
      root.localStorage?.removeItem?.(key);
    } catch {}
  }

  function syncGlobals(next) {
    enabled = next === true;
    root.HG_TEST_MODE = enabled;
    root.TEST_MODE = enabled;
    root.OPEN_MODE = enabled;

    if (root.HG_ENV && typeof root.HG_ENV === "object") {
      root.HG_ENV.testMode = enabled;
      root.HG_ENV.openMode = enabled;
    }

    return enabled;
  }

  function emitChange() {
    try {
      root.dispatchEvent?.(new CustomEvent("hg:testModeChanged", {
        detail: { enabled }
      }));
    } catch {}
  }

  function cleanQueryOverride() {
    try {
      const url = new URL(root.location.href);
      const raw = url.searchParams.get(QUERY_KEY);
      if (raw !== "1" && raw !== "0") return null;

      url.searchParams.delete(QUERY_KEY);
      const cleanUrl = `${url.pathname}${url.search}${url.hash}`;
      root.history?.replaceState?.(root.history.state, "", cleanUrl);
      return raw === "1";
    } catch {
      return null;
    }
  }

  function prepareLegacyBootBridge() {
    safeRemove(LEGACY_STORAGE_KEY);
    if (!bootFinalized && enabled) safeSet(LEGACY_STORAGE_KEY, "1");
  }

  function setEnabled(next, options = {}) {
    const previous = enabled;
    const normalized = next === true;

    if (options.persist !== false) {
      if (normalized) safeSet(STORAGE_KEY, "1");
      else safeRemove(STORAGE_KEY);
    }

    syncGlobals(normalized);
    prepareLegacyBootBridge();

    if (previous !== enabled && options.emit !== false) emitChange();
    return enabled;
  }

  function init() {
    if (initialized) return syncGlobals(enabled);
    initialized = true;

    const queryOverride = cleanQueryOverride();
    const stored = safeGet(STORAGE_KEY) === "1";

    safeRemove(LEGACY_STORAGE_KEY);
    return setEnabled(queryOverride === null ? stored : queryOverride, {
      persist: true,
      emit: false
    });
  }

  function finalizeBoot() {
    bootFinalized = true;
    safeRemove(LEGACY_STORAGE_KEY);
    return enabled;
  }

  function isEnabled() {
    if (!initialized) init();
    return enabled;
  }

  function enable() {
    return setEnabled(true);
  }

  function disable() {
    return setEnabled(false);
  }

  const api = {
    STORAGE_KEY,
    QUERY_KEY,
    get enabled() {
      return enabled;
    },
    init,
    isEnabled,
    setEnabled,
    enable,
    disable,
    finalizeBoot
  };

  root.HGTestMode = api;
  root.HG_TestMode = api;
  init();

  root.addEventListener?.("hg:criticalReady", finalizeBoot, { once: true });
  root.addEventListener?.("hg:appReady", finalizeBoot, { once: true });
})();
`;

const testModeTest = `const assert = require("node:assert/strict");
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

  const context = {
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
  };

  vm.runInContext(source, vm.createContext(context), {
    filename: "js/debug/HGTestMode.js"
  });

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
`;

const testModeDocs = `# Skjult utviklermodus i History GO

## Grunnregel

Testmodus er et utviklerverktøy og skal ikke vises i den vanlige menyen. Vanlige spillere skal aldri kunne omgå GPS-gaten ved et tilfeldig menytrykk.

Den eneste varige nøkkelen er:

\`HG_TEST_MODE\`

## Aktivere og deaktivere

På en utviklerenhet kan testmodus aktiveres med:

\`?hgTest=1\`

Eksempel:

\`/History-Go/?hgTest=1\`

Den kan deaktiveres med:

\`?hgTest=0\`

Parameteren fjernes fra adresselinjen etter at den er lest. Valget lagres i \`localStorage\`.

Fra nettleserkonsollen kan utviklere bruke:

\`HGTestMode.enable()\`

\`HGTestMode.disable()\`

\`HGTestMode.isEnabled()\`

## Kompatibilitet

\`window.TEST_MODE\` og \`window.OPEN_MODE\` beholdes midlertidig som runtime-aliaser for gammel kode.

Den gamle lagringsnøkkelen \`HG_OPEN_MODE\` er ikke lenger en brukerinnstilling. Runtime legger den bare inn kort under oppstart dersom eldre boot-kode trenger den, og sletter den når kritisk boot er ferdig.

## Produktkontrakt

Testmodus kan fortsatt brukes til GPS-bypass, runtime health, smoke-tester og isolerte demoer. Den gir ingen offentlig knapp, menybryter eller synlig Unlock all-kontroll.
`;

write("js/debug/HGTestMode.js", testModeRuntime);
write("tests/hg-test-mode.test.js", testModeTest);
write("docs/HG_TEST_MODE.md", testModeDocs);

let index = read("index.html");
index = replaceOnce(index, `    <button id="btnUnlockAll" class="iconbtn" type="button" aria-label="Unlock all" title="Unlock all" data-hg-i18n-aria-label="ui.attr.unlockAll" data-hg-i18n-title="ui.attr.unlockAll">🔓</button>\n\n`, "", "offentlig Unlock all-knapp");
index = replaceOnce(index, `          <label class="header-menu-action header-menu-toggle">\n            <span class="header-menu-action-icon" aria-hidden="true">🔓</span>\n            <span class="header-menu-action-label">Lås opp testmodus</span>\n            <span class="toggle">\n              <input id="openToggle" type="checkbox" aria-label="Lås opp testmodus" />\n              <span></span>\n            </span>\n          </label>\n`, "", "offentlig testmodusbryter");
index = replaceOnce(index, `  <!-- App scripts -->\n  <script src="js/i18n.js"></script>`, `  <!-- App scripts -->\n  <script src="js/debug/HGTestMode.js"></script>\n  <script src="js/i18n.js"></script>`, "tidlig testmodus-runtime");
write("index.html", index);

let dom = read("js/ui/dom.js");
dom = replaceOnce(dom, `  open:       document.getElementById("openToggle"),\n`, "", "utdatert openToggle DOM-cache");
write("js/ui/dom.js", dom);

let components = read("css/components.css");
components = replaceOnce(components, `#btnUnlockAll{ opacity: .85; }\n#btnUnlockAll:hover{ opacity: 1; }\n\n`, "", "utdatert Unlock all CSS");
write("css/components.css", components);

let headerTest = read("tests/header-search-menu.test.js");
headerTest = replaceOnce(headerTest, `function testMenuLabelsDescribeTheirRealDestinations() {\n  const index = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");\n\n  assert.match(index, /class="header-menu-action[^\\"]*civication-nav-link"[\\s\\S]*aria-label="Civication"[\\s\\S]*<span class="header-menu-action-label">Civication<\\/span>/);\n  assert.match(index, /<span class="header-menu-action-label">Lås opp testmodus<\\/span>[\\s\\S]*<input id="openToggle"/);\n  assert.doesNotMatch(index, /<span class="header-menu-action-label">Vis åpne steder<\\/span>/);\n}\n`, `function testMenuLabelsDescribeTheirRealDestinations() {\n  const index = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");\n\n  assert.match(index, /class="header-menu-action[^\\"]*civication-nav-link"[\\s\\S]*aria-label="Civication"[\\s\\S]*<span class="header-menu-action-label">Civication<\\/span>/);\n  assert.doesNotMatch(index, /Lås opp testmodus/);\n  assert.doesNotMatch(index, /id="openToggle"/);\n  assert.doesNotMatch(index, /id="btnUnlockAll"/);\n  assert.match(index, /<script src="js\\/debug\\/HGTestMode\\.js"><\\/script>/);\n}\n`, "header-test for skjult testmodus");
write("tests/header-search-menu.test.js", headerTest);

let globals = read("schemas/globals.d.ts");
globals = replaceOnce(globals, `    TEST_MODE?: boolean;\n    HG_OPEN_MODE?: boolean;\n    OPEN_MODE?: boolean;`, `    TEST_MODE?: boolean;\n    OPEN_MODE?: boolean;`, "utdatert HG_OPEN_MODE-global");
write("schemas/globals.d.ts", globals);

let appGlobals = read("schemas/app-globals.d.ts");
appGlobals = replaceOnce(appGlobals, `    HG_TEST_MODE?: any;\n    HGTestMode?: any;\n    HG_TestMode?: any;`, `    HG_TEST_MODE?: boolean;\n    HGTestMode?: any;\n    HG_TestMode?: any;`, "HG_TEST_MODE type");
write("schemas/app-globals.d.ts", appGlobals);

let guard = read(".github/workflows/typescript-guard.yml");
guard = replaceOnce(guard, `      - name: Social Meet Spotmeeting browser smoke\n        run: npm run test:social-meet-spotmeeting-smoke\n`, `      - name: Social Meet Spotmeeting browser smoke\n        run: npm run test:social-meet-spotmeeting-smoke\n\n      - name: Test hidden developer mode\n        run: node tests/hg-test-mode.test.js && node tests/header-search-menu.test.js\n`, "CI-test for skjult utviklermodus");
write(".github/workflows/typescript-guard.yml", guard);

console.log("Hidden test mode changes applied.");
