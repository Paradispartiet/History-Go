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

const LEGACY_ICONS = [
  "pcPeopleIcon", "pcNatureIcon", "pcBadgesIcon", "pcWorksIcon", "pcBrandsIcon",
  "pcForNaIcon", "pcFortellingerIcon", "pcLeksikonIcon", "pcPlayIcon",
  "pcTrainingIcon", "pcTasksIcon", "pcCivicationStoreIcon", "pcDetailsIcon", "pcSpotsIcon"
];

function createRuntime(place, globals = {}) {
  const icons = LEGACY_ICONS.map(id => `<div id="${id}" class="pc-round"></div>`).join("");
  const dom = new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="${place.id}">
      <div class="pc-body">
        <div class="pc-icons-quad">${icons}</div>
        <div id="pcPeopleList"></div>
        <div id="pcNatureList"></div>
        <div id="pcBadgesList"></div>
        <div id="pcWorksList"></div>
        <div id="pcBrandsList"></div>
      </div>
    </div>
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });

  const { window } = dom;
  activeWindows.add(window);
  window.PLACES = [place];
  window.BADGES = [{ id: place.category, image: `badges/${place.category}.png` }];
  window.FLORA = globals.FLORA || [];
  window.FAUNA = globals.FAUNA || [];
  window.HGNaturePlaceMap = globals.HGNaturePlaceMap || { open() {} };
  Object.assign(window, globals);
  window.eval(source);
  window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
  window.HGVisualPlaceRounds.apply(place);
  return window;
}

function visibleIds(window) {
  return [...window.document.querySelectorAll(".pc-icons-quad .pc-round")]
    .filter(el => !el.hidden)
    .sort((a, b) => Number(a.style.order || 0) - Number(b.style.order || 0))
    .map(el => el.id);
}

test("ordinary places always use exactly Merker, People, Gjenstander and Brands", () => {
  const place = { id: "ordinary", category: "historie" };
  const window = createRuntime(place);
  assert.deepEqual(Array.from(window.HGVisualPlaceRounds.get(place)), ["badges", "people", "objects", "brands"]);
  assert.deepEqual(visibleIds(window), ["pcBadgesIcon", "pcPeopleIcon", "pcObjectsIcon", "pcBrandsIcon"]);
  assert.equal(window.document.querySelector(".pc-icons-quad").dataset.roundCount, "4");
});

test("ordinary places can never get a Map round, even through legacy rounds fields", () => {
  const place = {
    id: "ordinary-map-attempt",
    category: "historie",
    rounds: ["badges", "people", "objects", "map"],
    rundinger: ["map"],
    rounds_exclude: ["brands"]
  };
  const window = createRuntime(place);
  assert.deepEqual(Array.from(window.HGVisualPlaceRounds.get(place)), ["badges", "people", "objects", "brands"]);
  assert.equal(window.document.getElementById("pcNatureMapIcon").hidden, true);
});

test("nature places always use exactly Merker, Flora, Fauna and Kart", () => {
  const place = { id: "nature", category: "natur", flora: ["f1"], fauna: ["a1"] };
  const window = createRuntime(place, {
    FLORA: [{ id: "f1", name: "Furu", image: "flora/furu.jpg" }],
    FAUNA: [{ id: "a1", name: "Elg", image: "fauna/elg.jpg" }]
  });
  assert.deepEqual(Array.from(window.HGVisualPlaceRounds.get(place)), ["badges", "flora", "fauna", "map"]);
  assert.deepEqual(visibleIds(window), ["pcBadgesIcon", "pcFloraIcon", "pcFaunaIcon", "pcNatureMapIcon"]);
  assert.equal(window.document.getElementById("pcNatureIcon").hidden, true);
  assert.equal(window.document.getElementById("pcPeopleIcon").hidden, true);
});

test("Works, Details, Spots and Nature can exist as legacy DOM/data without becoming rounds", () => {
  const place = {
    id: "legacy-noise",
    category: "kunst",
    works: [{ id: "w" }],
    details: [{ id: "d" }],
    spots: [{ id: "s" }],
    nature: [{ id: "n" }]
  };
  const window = createRuntime(place);
  for (const id of ["pcWorksIcon", "pcDetailsIcon", "pcSpotsIcon", "pcNatureIcon"]) {
    assert.equal(window.document.getElementById(id).hidden, true, `${id} leaked into canonical grid`);
  }
});

test("People preview never changes the canonical People population", () => {
  const place = { id: "people", category: "historie" };
  const people = [
    { id: "p1", name: "En", image: "one.jpg", places: ["people"] },
    { id: "p2", name: "To", image: "two.jpg", places: ["people"] }
  ];
  const window = createRuntime(place, { PEOPLE: people });
  const icon = window.document.getElementById("pcPeopleIcon");
  icon.innerHTML = '<img src="one.jpg">';
  window.HGVisualPlaceRounds.apply(place);
  assert.deepEqual(Array.from(window.HGVisualPlaceRounds.get(place)), ["badges", "people", "objects", "brands"]);
  assert.equal(window.PEOPLE.length, 2);
});

test("physical Civication items may feed Gjenstander but digital noise does not", () => {
  const place = { id: "objects", category: "historie" };
  const window = createRuntime(place, {
    CIVICATION_STORE_BY_PLACE: {
      objects: [
        { id: "digital", title: "Digital", image: "digital.jpg" },
        { id: "physical", title: "Fysisk", image: "physical.jpg", placeSpecificReason: "Finnes her" }
      ]
    }
  });
  const list = window.document.getElementById("pcObjectsList").textContent;
  assert.match(list, /Fysisk/);
  assert.doesNotMatch(list, /Digital/);
});

test("Kart click is delegated only for a nature place", () => {
  let opened = 0;
  const nature = { id: "map-nature", category: "natur" };
  const window = createRuntime(nature, { HGNaturePlaceMap: { open() { opened += 1; } } });
  window.document.getElementById("pcNatureMapIcon").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.equal(opened, 1);

  const ordinary = { id: "map-ordinary", category: "historie" };
  window.PLACES = [ordinary];
  window.document.getElementById("placeCard").dataset.currentPlaceId = ordinary.id;
  window.HGVisualPlaceRounds.apply(ordinary);
  window.document.getElementById("pcNatureMapIcon").dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  assert.equal(opened, 1);
});

test("canonical grid is always a 2x2 layout", () => {
  const window = createRuntime({ id: "grid", category: "historie" });
  const grid = window.document.querySelector(".pc-icons-quad");
  assert.equal(grid.style.gridTemplateColumns, "repeat(2, var(--place-card-orb-size))");
  assert.equal(grid.style.gridTemplateRows, "repeat(2, var(--place-card-orb-size))");
  assert.equal(grid.dataset.roundCount, "4");
});
