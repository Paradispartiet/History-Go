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

test("CSS owns adaptive one-to-four layouts and semantic shape rules", () => {
  for (const count of [1, 2, 3, 4]) {
    assert.match(css, new RegExp(`data-collection-count="${count}"`));
  }
  assert.match(css, /data-collection-count="3"[\s\S]*data-collection-position="2"/);
  assert.match(css, /data-collection-shape="circle"[\s\S]*border-radius:50%/);
  assert.match(css, /data-collection-shape="rectangle"[\s\S]*border-radius:clamp/);
  assert.match(script, /count < 1 \|\| count > 4/);
  assert.match(script, /ids\.length === 4/);
});

test("existing four-collection v2 profiles stay on the stable compatibility renderer", () => {
  const dom = new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="legacy-four"><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"></div><div id="pcObjectsIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div><div id="pcCategoryCollectionIcon" class="pc-round" data-collection-id="related"></div></div></div></body>`, { runScripts: "outside-only" });
  const w = dom.window;
  w.PLACES = [{
    id: "legacy-four",
    place_card_profile: {
      schema: "history_go_place_card_profile_v2",
      collection_ids: ["people", "objects", "brands", "related"]
    }
  }];
  w.ResizeObserver = undefined;
  w.eval(script);
  assert.equal(w.HGPlaceRoundsFillLayout.applyCuratedVisibility(), null);
  assert.equal(w.document.querySelectorAll(".pc-icons-quad .pc-round[hidden]").length, 0);
  dom.window.close();
});

test("adaptive profiles expose only image-ready requested collections", () => {
  const dom = new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="curated-three"><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"><img class="pc-person-img" src="people.webp"></div><div id="pcObjectsIcon" class="pc-round"></div><div id="pcCategoryCollectionIcon" class="pc-round" data-collection-id="related"><img class="pc-person-img" src="related.webp"></div></div></div></body>`, { runScripts: "outside-only" });
  const w = dom.window;
  w.PLACES = [{
    id: "curated-three",
    place_card_profile: {
      schema: "history_go_place_card_profile_v2",
      collection_ids: ["people", "objects", "related"]
    }
  }];
  w.ResizeObserver = undefined;
  w.eval(script);
  assert.equal(w.HGPlaceRoundsFillLayout.applyCuratedVisibility(), 2);
  assert.equal(w.document.getElementById("pcPeopleIcon").hidden, false);
  assert.equal(w.document.getElementById("pcObjectsIcon").hidden, true);
  assert.equal(w.document.getElementById("pcCategoryCollectionIcon").hidden, false);
  assert.equal(w.document.querySelector(".pc-icons-quad").dataset.collectionRequestedCount, "3");
  dom.window.close();
});
