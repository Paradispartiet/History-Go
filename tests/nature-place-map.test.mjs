import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "../js/ui/nature-place-map.js"), "utf8");
const windows = new Set();

afterEach(() => {
  for (const window of windows) window.close();
  windows.clear();
});

function runtime() {
  const dom = new JSDOM("<!doctype html><head></head><body></body>", {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  windows.add(dom.window);
  dom.window.eval(source);
  return dom.window;
}

test("nature map refuses ordinary places", () => {
  const window = runtime();
  assert.equal(window.HGNaturePlaceMap.open({ id: "oslo", name: "Oslo", category: "by" }), false);
  assert.equal(window.document.getElementById("hgNaturePlaceMap"), null);
});

test("nature map opens a dedicated Norgeskart hiking surface for nature places", () => {
  const window = runtime();
  const place = { id: "oyungen", name: "Øyungen", category: "natur", lat: 60.046, lon: 10.733 };
  assert.equal(window.HGNaturePlaceMap.open(place), true);
  const root = window.document.getElementById("hgNaturePlaceMap");
  const frame = root.querySelector("[data-nature-map-frame]");
  assert.equal(root.hidden, false);
  assert.match(frame.getAttribute("src"), /^https:\/\/norgeskart\.no\//);
  assert.match(frame.getAttribute("src"), /project=norgeskart/);
  assert.match(decodeURIComponent(frame.getAttribute("src")), /Øyungen/);
});

test("nature map never delegates to or manipulates the History GO main map", () => {
  const window = runtime();
  let mainMapCalls = 0;
  window.map = { flyTo() { mainMapCalls += 1; }, easeTo() { mainMapCalls += 1; } };
  window.HGNaturePlaceMap.open({ id: "n", name: "Natursted", category: "natur" });
  assert.equal(mainMapCalls, 0);
});
