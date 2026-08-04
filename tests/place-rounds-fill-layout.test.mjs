import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-fill-layout.js"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "../css/place-rounds-fill-layout.css"), "utf8");

test("four rounds fill a two by two grid", () => {
  const dom = new JSDOM('<body><div id="placeCard"><div class="pc-icons-quad" data-round-count="4"></div></div></body>', { runScripts: "outside-only" });
  const w = dom.window;
  const grid = w.document.querySelector(".pc-icons-quad");
  grid.getBoundingClientRect = () => ({ width: 330, height: 220 });
  Object.defineProperty(grid, "clientWidth", { value: 330 });
  Object.defineProperty(grid, "clientHeight", { value: 220 });
  w.getComputedStyle = () => ({ gap: "10px" });
  w.ResizeObserver = undefined;
  w.eval(script);
  w.HGPlaceRoundsFillLayout.layout();
  assert.equal(grid.style.getPropertyValue("--hg-round-fill-size"), "105px");
  dom.window.close();
});

test("only the canonical four-round layout remains", () => {
  assert.match(css, /data-round-count="4"[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(css, /data-round-count="3"/);
  assert.doesNotMatch(css, /data-round-count="6"/);
  assert.match(script, /count !== 4/);
});
