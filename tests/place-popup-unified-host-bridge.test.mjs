import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const source = fs.readFileSync("js/ui/place-popup-unified-host-bridge.js", "utf8");
const loaderSource = fs.readFileSync("js/ui/place-card-status-surface.js", "utf8");

function setup() {
  const dom = new JSDOM(`<!doctype html><html><body class="hg-app">
    <div id="placeCard" data-current-place-id="direct_place">
      <div id="pcUnifiedKnowledgeHost"><span data-loading>loading</span></div>
    </div>
  </body></html>`, {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  const calls = [];
  let closes = 0;
  window.makePopup = function originalMakePopup(html, extraClass, onClose) {
    calls.push({ html, extraClass, onClose });
    return "legacy-popup";
  };
  window.closePopup = () => { closes += 1; };
  window.eval(source);
  return { dom, window, calls, get closes() { return closes; } };
}

test("critical Place loader installs the direct-host bridge before Unified runtime", () => {
  const bridgeIndex = loaderSource.indexOf('ensureScript("js/ui/place-popup-unified-host-bridge.js")');
  const unifiedIndex = loaderSource.indexOf('ensureScript("dist/web/place-unified-surface.js")');
  assert.ok(bridgeIndex >= 0, "critical Place loader must request the direct-host bridge");
  assert.ok(unifiedIndex > bridgeIndex, "direct-host bridge must be requested before Unified runtime");
  assert.match(loaderSource, /script\.async\s*=\s*false/, "dynamic Place scripts must execute in insertion order");
});

test("bridge leaves ordinary and Micro popup creation unchanged", () => {
  const env = setup();
  const { window, calls } = env;

  assert.equal(window.__HG_PLACE_POPUP_UNIFIED_HOST_BRIDGE_INSTALLED__, true);
  assert.equal(window.makePopup("<article>ordinary</article>", "place-popup place-popup-v2"), "legacy-popup");
  assert.equal(calls.length, 1);

  window.document.body.classList.add("hg-unified-place-staging");
  assert.equal(window.makePopup("<article>micro</article>", "place-popup place-popup-v2 micro-place-popup-shell"), "legacy-popup");
  assert.equal(calls.length, 2, "Micro must retain the standalone popup contract");

  assert.equal(window.makePopup("<article>person</article>", "person-popup-v2"), "legacy-popup");
  assert.equal(calls.length, 3, "non-Place popups must remain untouched");
  env.dom.window.close();
});

test("standard Unified Place renders directly inside the PlaceCard host", () => {
  const env = setup();
  const { window, calls } = env;
  window.document.body.classList.add("hg-unified-place-staging");

  let renderedEvent = null;
  window.addEventListener("hg:place-unified-host-rendered", event => { renderedEvent = event; });
  const result = window.makePopup(
    '<article class="hg-place-popup-v2"><h2 class="hg-modal-title">Direct Place</h2></article>',
    "place-popup place-popup-v2"
  );

  assert.equal(calls.length, 0, "legacy body-modal generator must not run for Unified standard Places");
  assert.equal(env.closes, 1, "direct rendering preserves makePopup close-before-open semantics");
  assert.ok(result instanceof window.HTMLElement);
  assert.equal(result.parentElement?.id, "pcUnifiedKnowledgeHost");
  assert.equal(result.dataset.hgUnifiedDirectHost, "1");
  assert.ok(result.matches(".hg-popup.place-popup-v2"));
  assert.ok(result.querySelector(":scope > .hg-popup-inner > .hg-place-popup-v2"));
  assert.equal(result.querySelector(".hg-popup-close")?.hidden, true);
  assert.equal(window.document.querySelector("body > .hg-popup.place-popup-v2"), null, "no staging body modal may be created");
  assert.equal(renderedEvent?.detail?.placeId, "direct_place");
  env.dom.window.close();
});

test("missing Unified host fails closed to the original popup generator", () => {
  const env = setup();
  const { window, calls } = env;
  window.document.body.classList.add("hg-unified-place-staging");
  window.document.getElementById("pcUnifiedKnowledgeHost")?.remove();

  assert.equal(window.makePopup("<article>fallback</article>", "place-popup place-popup-v2"), "legacy-popup");
  assert.equal(calls.length, 1);
  assert.equal(env.closes, 0);
  env.dom.window.close();
});
