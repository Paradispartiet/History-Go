import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-visual-collections.js"), "utf8");
const activeWindows = new Set();

afterEach(() => {
  for (const window of activeWindows) window.close();
  activeWindows.clear();
});

function createRuntime(place, globals = {}) {
  const dom = new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="${place.id}">
      <div class="pc-body">
        <div class="pc-icons-quad">
          <div id="pcBadgesIcon" class="pc-round"></div>
          <div id="pcPeopleIcon" class="pc-round"></div>
          <div id="pcWorksIcon" class="pc-round"></div>
          <div id="pcNatureIcon" class="pc-round"></div>
          <div id="pcBrandsIcon" class="pc-round"></div>
        </div>
        <div id="pcBadgesList"></div>
        <div id="pcPeopleList"></div>
      </div>
      <button id="pcClose"></button>
    </div>
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });

  const { window } = dom;
  activeWindows.add(window);
  window.PLACES = [place];
  window.BADGES = [{ id: place.category, image: "badge.png" }];
  window.HGPlaceRounds = {};
  Object.assign(window, globals);
  window.eval(source);
  window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
  window.HGVisualPlaceRounds.apply(place);
  return window;
}

test("canonical round registry contains only the six supported round types", () => {
  const window = createRuntime({ id: "p1", category: "historie" });
  assert.deepEqual(Array.from(window.HGVisualPlaceRounds.ids), ["badges", "people", "objects", "flora", "fauna", "map"]);
});

test("ordinary places always use exactly badges, people, objects and map", () => {
  const place = {
    id: "p2",
    category: "scenekunst",
    rounds: ["badges", "works", "brands", "nature", "people", "objects"],
    people: [{ id: "person", image: "person.jpg" }],
    objects: [{ id: "object", title: "Objekt", image: "object.jpg" }]
  };
  const window = createRuntime(place);
  assert.deepEqual(Array.from(window.HGVisualPlaceRounds.get(place)), ["badges", "people", "objects", "map"]);
  assert.equal(window.document.querySelector(".pc-icons-quad").dataset.roundCount, "4");
});

test("nature places always replace people and objects with flora and fauna", () => {
  const place = { id: "p3", category: "natur", flora: ["f1"], fauna: ["a1"] };
  const window = createRuntime(place, {
    FLORA: [{ id: "f1", name: "Blåveis", image: "flora.jpg", _kind: "flora" }],
    FAUNA: [{ id: "a1", name: "Ekorn", image: "fauna.jpg", _kind: "fauna" }]
  });
  assert.deepEqual(Array.from(window.HGVisualPlaceRounds.get(place)), ["badges", "flora", "fauna", "map"]);
  assert.equal(window.document.getElementById("pcPeopleIcon").hidden, true);
  assert.equal(window.document.getElementById("pcObjectsIcon").hidden, true);
  assert.equal(window.document.getElementById("pcFloraIcon").hidden, false);
  assert.equal(window.document.getElementById("pcFaunaIcon").hidden, false);
});

test("map round is always present and collapses PlaceCard", () => {
  let collapsed = 0;
  const place = { id: "p4", category: "historie" };
  const window = createRuntime(place, { collapsePlaceCard: () => { collapsed += 1; } });
  const mapIcon = window.document.getElementById("pcMapIcon");
  assert.equal(mapIcon.hidden, false);
  mapIcon.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.equal(collapsed, 1);
});

test("legacy round declarations cannot leak into the four-slot grid", () => {
  const place = { id: "p5", category: "by", rounds: ["works", "nature", "brands", "details", "spots", "badges"] };
  const window = createRuntime(place);
  const visible = [...window.document.querySelectorAll(".pc-icons-quad .pc-round")].filter(el => !el.hidden).map(el => el.id).sort();
  assert.deepEqual(visible, ["pcBadgesIcon", "pcMapIcon", "pcObjectsIcon", "pcPeopleIcon"].sort());
});

test("people preview remains presentation only", () => {
  const place = { id: "p6", category: "historie", people: [{ id: "a", image: "a.jpg" }, { id: "b", image: "b.jpg" }] };
  const window = createRuntime(place);
  assert.deepEqual(Array.from(window.HGVisualPlaceRounds.get(place)), ["badges", "people", "objects", "map"]);
  assert.equal(window.HGVisualPlaceRounds.get(place).includes("people"), true);
});
