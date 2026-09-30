import fs from 'node:fs';

function replaceOnce(path, before, after) {
  const source = fs.readFileSync(path, 'utf8');
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${path}: expected exactly one match, found ${count}`);
  fs.writeFileSync(path, source.replace(before, after));
}

replaceOnce(
  'index.html',
  '  <!-- Ikke-kritiske scripts får aldri blokkere app-entry. -->\n  <script>\n',
  '  <script src="js/debug/HGTestMode.js"></script>\n\n  <!-- Ikke-kritiske scripts får aldri blokkere app-entry. -->\n  <script>\n'
);
replaceOnce('index.html', '        "js/debug/HGTestMode.js",\n', '');

const testModeUi = `  function ensureTestModeButton() {
    const testMode = window.HGTestMode;
    const geoStatus = document.getElementById("geoStatus");
    if (!testMode || !geoStatus || typeof testMode.isEnabled !== "function" || typeof testMode.setEnabled !== "function") return;

    let button = document.getElementById("btnTestMode");
    if (!button) {
      button = document.createElement("button");
      button.id = "btnTestMode";
      button.className = "iconbtn header-test-mode-button";
      button.type = "button";
      button.textContent = "TEST";
      geoStatus.insertAdjacentElement("beforebegin", button);
    }

    function render(enabled = testMode.isEnabled()) {
      const active = enabled === true;
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.setAttribute("aria-label", active ? "Slå av testmodus" : "Slå på testmodus");
      button.title = active ? "Testmodus på" : "Testmodus av";
    }

    if (button.dataset.hgTestModeBound !== "1") {
      button.dataset.hgTestModeBound = "1";
      button.addEventListener("click", () => {
        testMode.setEnabled(!testMode.isEnabled());
      });
      window.addEventListener("hg:testModeChanged", (event) => {
        render(event?.detail?.enabled === true);
      });
    }

    render();
  }

`;
replaceOnce(
  'js/ui/header-menu.js',
  '  function setLesesporMenuLabel() {\n',
  testModeUi + '  function setLesesporMenuLabel() {\n'
);
replaceOnce(
  'js/ui/header-menu.js',
  '    promoteMinDayToHeader();\n    setLesesporMenuLabel();\n',
  '    promoteMinDayToHeader();\n    ensureTestModeButton();\n    setLesesporMenuLabel();\n'
);

const cssBefore = `.iconbtn{
  width: 36px;
  height: 32px;
  border-radius: 999px;

  background: rgba(255,255,255,.08);
  color:#fff;
  border:1px solid var(--panel-border);

  display:inline-flex;
  align-items:center;
  justify-content:center;

  padding: 0;
  line-height: 1;
  font-size: 16px;
}
`;
const cssAfter = `${cssBefore}
.header-test-mode-button{
  width:auto;
  min-width:46px;
  padding:0 8px;
  font-size:11px;
  font-weight:800;
  letter-spacing:.05em;
}
.header-test-mode-button[aria-pressed="true"]{
  background:rgba(255,255,255,.22);
  box-shadow:inset 0 0 0 1px currentColor;
}
`;
replaceOnce('css/components.css', cssBefore, cssAfter);

replaceOnce('docs/HG_TEST_MODE.md', '# Skjult utviklermodus i History GO', '# Testmodus i History GO');
replaceOnce('docs/HG_TEST_MODE.md', 'Sist kontrollert: **2026-07-26**', 'Sist kontrollert: **2026-09-30**');
replaceOnce(
  'docs/HG_TEST_MODE.md',
  'Dette dokumentet eier reglene for den skjulte utviklermodusen i `index.html`-appen. Runtimefilen eier den faktiske tilstanden og implementasjonen.',
  'Dette dokumentet eier reglene for testmodus i `index.html`-appen. Runtimefilen eier den faktiske tilstanden og implementasjonen; headeren eier den synlige TEST-kontrollen.'
);
replaceOnce(
  'docs/HG_TEST_MODE.md',
  'Testmodus er et utviklerverktøy og vises ikke i den vanlige menyen. Vanlige spillere skal aldri kunne omgå GPS-gaten ved et tilfeldig menytrykk.',
  'Testmodus er et eksplisitt test- og QA-verktøy. `index.html` viser én tydelig `TEST`-knapp i headeren som kan slå GPS-bypass av og på. Knappen gir ingen andre privilegier enn den eksisterende `HGTestMode`-runtimekontrakten.'
);
replaceOnce(
  'docs/HG_TEST_MODE.md',
  'På en utviklerenhet kan testmodus aktiveres med:',
  'I index-appen kan testmodus slås av og på med den synlige `TEST`-knappen i headeren. På en utviklerenhet kan den også aktiveres med:'
);
replaceOnce(
  'docs/HG_TEST_MODE.md',
  '- utviklerkontroller som uttrykkelig leser `HGTestMode.isEnabled()`.',
  '- den synlige `TEST`-knappen i headeren, som bruker `HGTestMode.setEnabled(...)`;\n- utviklerkontroller som uttrykkelig leser `HGTestMode.isEnabled()`.'
);
replaceOnce(
  'docs/HG_TEST_MODE.md',
  '- offentlig knapp, menybryter eller synlig «Unlock all»-kontroll;',
  '- en generell «Unlock all»-kontroll eller andre skjulte privilegier utover GPS-testmodusen;'
);
replaceOnce(
  'docs/HG_TEST_MODE.md',
  '1. `js/debug/HGTestMode.js`;\n2. dette dokumentet;\n3. relevante smoke-/runtime-tester;\n4. `README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md` dersom subsystemgrenser endres.',
  '1. `js/debug/HGTestMode.js` dersom runtime-semantikken endres;\n2. dette dokumentet;\n3. relevante UI-/smoke-/runtime-tester;\n4. `README/SYSTEM_REGISTRY_SUBSYSTEM_CONTRACTS.md` dersom subsystemgrenser endres.'
);

replaceOnce(
  'docs/README.md',
  '5. [`HG_TEST_MODE.md`](./HG_TEST_MODE.md) — canonical skjult utviklermodus, storage-/aliasgrense og produktsikkerhet',
  '5. [`HG_TEST_MODE.md`](./HG_TEST_MODE.md) — canonical testmodus med eksplisitt headerkontroll, storage-/aliasgrense og produktsikkerhet'
);
replaceOnce(
  'docs/documentation_registry.json',
  '"role": "Canonical hidden developer/test-mode policy for index runtime and compatibility aliases",\n      "owns": [\n        "test_mode_policy"\n      ],\n      "last_verified": "2026-07-26"',
  '"role": "Canonical test-mode policy for index runtime, visible header control and compatibility aliases",\n      "owns": [\n        "test_mode_policy"\n      ],\n      "last_verified": "2026-09-30"'
);

fs.writeFileSync('tests/history-go-test-mode-header.test.js', `const assert = require('node:assert/strict');
const fs = require('node:fs');

const index = fs.readFileSync('index.html', 'utf8');
const headerMenu = fs.readFileSync('js/ui/header-menu.js', 'utf8');
const components = fs.readFileSync('css/components.css', 'utf8');
const contract = fs.readFileSync('docs/HG_TEST_MODE.md', 'utf8');

const runtimeScript = '<script src="js/debug/HGTestMode.js"></script>';
assert.equal(index.split(runtimeScript).length - 1, 1, 'HGTestMode skal lastes nøyaktig én gang');
assert.ok(index.indexOf(runtimeScript) < index.indexOf('<script type="module" src="./js/app.js'), 'HGTestMode må lastes før app.js');

const loaderStart = index.indexOf('const scripts = [');
const loaderEnd = index.indexOf('let chain = Promise.resolve()', loaderStart);
assert.ok(loaderStart >= 0 && loaderEnd > loaderStart, 'post-ready loader må finnes');
assert.doesNotMatch(index.slice(loaderStart, loaderEnd), /js\\/debug\\/HGTestMode\\.js/, 'HGTestMode må ikke ligge i post-ready loader');

assert.match(headerMenu, /button\\.id = "btnTestMode"/, 'headeren må opprette TEST-knappen');
assert.match(headerMenu, /button\\.textContent = "TEST"/, 'TEST-knappen må være synlig merket');
assert.match(headerMenu, /testMode\\.setEnabled\\(!testMode\\.isEnabled\\(\\)\\)/, 'knappen må bruke canonical HGTestMode');
assert.match(headerMenu, /hg:testModeChanged/, 'knappen må følge runtime-state');
assert.match(components, /\\.header-test-mode-button\\[aria-pressed="true"\\]/, 'aktiv testmodus må ha synlig state');

assert.match(contract, /synlige .*TEST.*knappen i headeren/, 'canonical kontrakt må tillate headerkontrollen');
assert.doesNotMatch(contract, /gir ingen offentlig knapp/, 'gammel hidden-only policy må være borte');
assert.match(contract, /generell «Unlock all»-kontroll/, 'TEST-knappen må ikke gjeninnføre Unlock all');

console.log('History Go TEST header contract OK');
`);
