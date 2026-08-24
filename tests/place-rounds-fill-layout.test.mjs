import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-fill-layout.js"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "../css/place-rounds-fill-layout.css"), "utf8");

function layoutFor(count) {
  const dom = new JSDOM(`<body><div id="placeCard"><div class="pc-icons-quad" data-collection-count="${count}"></div></div></body>`, { runScripts: "outside-only" });
  const w = dom.window;
  const grid = w.document.querySelector(".pc-icons-quad");
  grid.getBoundingClientRect = () => ({ width: 330, height: 220 });
  Object.defineProperty(grid, "clientWidth", { value: 330 });
  Object.defineProperty(grid, "clientHeight", { value: 220 });
  w.getComputedStyle = () => ({ gap: "10px" });
  w.ResizeObserver = undefined;
  w.eval(script);
  w.HGPlaceRoundsFillLayout.layout();
  return { dom, grid };
}

test("two collections use one balanced row", () => {
  const { dom, grid } = layoutFor(2);
  assert.equal(grid.style.getPropertyValue("--hg-collection-fill-height"), "108px");
  assert.equal(grid.style.getPropertyValue("--hg-collection-circle-size"), "108px");
  dom.window.close();
});

test("three and four collections use balanced two-row sizing", () => {
  for (const count of [3, 4]) {
    const { dom, grid } = layoutFor(count);
    assert.equal(grid.style.getPropertyValue("--hg-collection-fill-height"), "105px");
    assert.equal(grid.style.getPropertyValue("--hg-collection-circle-size"), "105px");
    dom.window.close();
  }
});

test("CSS owns 2/3/4 layouts and shape rules", () => {
  for (const count of [2, 3, 4]) assert.match(css, new RegExp(`data-collection-count="${count}"`));
  assert.match(css, /data-collection-shape="circle"[\s\S]*border-radius:50%/);
  assert.match(css, /data-collection-shape="rectangle"[\s\S]*border-radius:clamp/);
  assert.match(css, /data-collection-position="2"[\s\S]*grid-column:1 \/ -1/);
  assert.match(script, /\[2, 3, 4\]\.includes\(count\)/);
});
