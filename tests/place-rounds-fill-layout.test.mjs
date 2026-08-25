import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-fill-layout.js"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "../css/place-rounds-fill-layout.css"), "utf8");

function layoutFor(count, { width = 330, height = 220, gap = 10 } = {}) {
  const dom = new JSDOM(`<body><div id="placeCard"><div class="pc-icons-quad" data-collection-count="${count}"></div></div></body>`, { runScripts: "outside-only" });
  const w = dom.window;
  const grid = w.document.querySelector(".pc-icons-quad");
  grid.getBoundingClientRect = () => ({ width, height });
  Object.defineProperty(grid, "clientWidth", { value: width });
  Object.defineProperty(grid, "clientHeight", { value: height });
  w.getComputedStyle = () => ({ gap: `${gap}px` });
  w.ResizeObserver = undefined;
  w.eval(script);
  w.HGPlaceRoundsFillLayout.layout();
  return { dom, grid };
}

test("four collections use balanced two-row sizing", () => {
  const { dom, grid } = layoutFor(4);
  assert.equal(grid.style.getPropertyValue("--hg-collection-fill-height"), "105px");
  assert.equal(grid.style.getPropertyValue("--hg-collection-circle-size"), "105px");
  dom.window.close();
});

test("tall PlaceCards enlarge circles and rectangles to nearly fill each cell", () => {
  const { dom, grid } = layoutFor(4, { width: 330, height: 300, gap: 4 });
  assert.equal(grid.style.getPropertyValue("--hg-collection-fill-height"), "148px");
  assert.equal(grid.style.getPropertyValue("--hg-collection-circle-size"), "148px");
  dom.window.close();
});

test("CSS owns the fixed four-cell layout and shape rules", () => {
  assert.match(css, /data-collection-count="4"/);
  assert.doesNotMatch(css, /data-collection-count="[23]"/);
  assert.match(css, /data-collection-shape="circle"[\s\S]*border-radius:50%/);
  assert.match(css, /data-collection-shape="rectangle"[\s\S]*border-radius:clamp/);
  assert.match(script, /count !== 4/);
});
