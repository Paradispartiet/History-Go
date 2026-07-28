import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptSource = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-fill-layout.js"), "utf8");
const cssSource = fs.readFileSync(path.join(__dirname, "../css/place-rounds-fill-layout.css"), "utf8");

function runtime(count) {
  const dom = new JSDOM(`<!doctype html><body><div id="placeCard"><div class="pc-icons-quad" data-round-count="${count}"></div></div></body>`, {
    runScripts: "outside-only",
    url: "https://history-go.test/"
  });
  const { window } = dom;
  const grid = window.document.querySelector(".pc-icons-quad");
  grid.getBoundingClientRect = () => ({ width: 330, height: 220, top: 0, left: 0, right: 330, bottom: 220 });
  Object.defineProperty(grid, "clientWidth", { value: 330, configurable: true });
  Object.defineProperty(grid, "clientHeight", { value: 220, configurable: true });
  window.getComputedStyle = () => ({ gap: "10px", columnGap: "10px" });
  window.ResizeObserver = undefined;
  window.eval(scriptSource);
  window.HGPlaceRoundsFillLayout.layout();
  return { window, grid };
}

test("4 rundinger bruker størst mulig kvadrat i et 2x2-felt", () => {
  const { window, grid } = runtime(4);
  assert.equal(grid.style.getPropertyValue("--hg-round-fill-size"), "105px");
  window.close();
});

test("6 rundinger bruker størst mulig kvadrat i et 3x2-felt", () => {
  const { window, grid } = runtime(6);
  assert.equal(grid.style.getPropertyValue("--hg-round-fill-size"), "103px");
  window.close();
});

test("layout-CSS fyller sidefeltet og beholder canonical 2x2/3x2", () => {
  assert.match(cssSource, /\.pc-side-stack\s*\{[\s\S]*width:100%/);
  assert.match(cssSource, /data-round-count="4"[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(cssSource, /data-round-count="6"[\s\S]*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(cssSource, /--hg-round-fill-size/);
});
