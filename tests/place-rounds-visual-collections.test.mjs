import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-visual-collections.js"), "utf8");

const BASE_ICONS = [
  "pcPeopleIcon",
  "pcNatureIcon",
  "pcBadgesIcon",
  "pcWorksIcon",
  "pcBrandsIcon",
  "pcForNaIcon",
  "pcFortellingerIcon",
  "pcLeksikonIcon",
  "pcPlayIcon",
  "pcTrainingIcon",
  "pcTasksIcon",
  "pcCivicationStoreIcon"
];

const BASE_LISTS = [
  "pcPeopleList",
  "pcNatureList",
  "pcBadgesList",
  "pcWorksList",
  "pcBrandsList"
];

function createRuntime(place, globals = {}) {
  const icons = BASE_ICONS.map(id => `<div id="${id}" class="pc-round" hidden></div>`).join("");
  const lists = BASE_LISTS.map(id => `<div id="${id}"></div>`).join("");
  const dom = new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="${place.id}">
      <div class="pc-body">
        <div class="pc-icons-quad">${icons}</div>
        ${lists}
      </div>
    </div>
  </body>`, {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });

  const { window } = dom;
  window.PLACES = [place];
  window.BADGES = [{ id: place.category, name: place.category, image: `badges/${place.category}.png` }];
  window.HGPlaceRounds = {};
  Object.assign(window, globals);
  window.eval(source);
  window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
  window.HGVisualPlaceRounds.apply(place);
  return window;
}

function addPreview(window, id, src = `${id}.jpg`) {
  const icon = window.document.getElementById(id);
  icon.innerHTML = `<img src="${src}" alt="">`;
}

test("canonical palette is exactly the eight agreed visual rounds", () => {
  const window = createRuntime({ id: "p1", category: "historie" });
  assert.deepEqual(
    window.HGVisualPlaceRounds.ids,
    ["badges", "people", "works", "objects", "details", "spots", "nature", "brands"]
  );
});

test("text-only Objects do not count as image-ready", () => {
  const place = {
    id: "p2",
    category: "historie",
    objects: [{ id: "obj1", title: "Objekt uten bilde" }]
  };
  const window = createRuntime(place);
  assert.equal(window.HGVisualPlaceRounds.isImageReady(place, "objects"), false);

  place.objects.push({ id: "obj2", title: "Objekt med bilde", image: "objects/obj2.jpg" });
  window.HGVisualPlaceRounds.apply(place);
  assert.equal(window.HGVisualPlaceRounds.isImageReady(place, "objects"), true);
});

test("Civication contributes to Objects only for a visual physical/place-specific item", () => {
  const place = { id: "p3", category: "historie" };
  const window = createRuntime(place, {
    CIVICATION_STORE_BY_PLACE: {
      p3: [
        "legacy_string",
        { id: "digital", title: "Digital ting", image: "digital.jpg" },
        { id: "physical", title: "Fysisk ting", image: "physical.jpg", placeSpecificReason: "Finnes på stedet" }
      ]
    }
  });

  const ids = window.HGVisualPlaceRounds.getItems(place, "objects").map(item => item.id);
  assert.deepEqual(ids, ["physical"]);
});

test("automatic selection expands to six only when six strong visual collections exist", () => {
  const place = {
    id: "p4",
    category: "historie",
    people: [{ id: "person", image: "person.jpg" }],
    works: [{ id: "work", image: "work.jpg" }],
    objects: [{ id: "object", image: "object.jpg" }],
    details: [{ id: "detail", image: "detail.jpg" }],
    spots: [{ id: "spot", image: "spot.jpg" }]
  };
  const window = createRuntime(place);
  assert.deepEqual(
    window.HGVisualPlaceRounds.get(place),
    ["badges", "people", "objects", "spots", "details", "works"]
  );
  assert.equal(window.HGVisualPlaceRounds.readiness(place).complete, true);
});

test("automatic selection stays at four when only four strong visual collections exist", () => {
  const place = {
    id: "p5",
    category: "historie",
    people: [{ id: "person", image: "person.jpg" }],
    objects: [{ id: "object", image: "object.jpg" }],
    spots: [{ id: "spot", image: "spot.jpg" }]
  };
  const window = createRuntime(place);
  assert.deepEqual(window.HGVisualPlaceRounds.get(place), ["badges", "people", "objects", "spots"]);
  assert.equal(window.HGVisualPlaceRounds.readiness(place).complete, true);
});

test("incomplete legacy data keeps the 4-slot design but is explicitly marked not production-ready", () => {
  const place = {
    id: "p6",
    category: "historie",
    people: [{ id: "person", image: "person.jpg" }]
  };
  const window = createRuntime(place);
  const selected = window.HGVisualPlaceRounds.get(place);
  const readiness = window.HGVisualPlaceRounds.readiness(place);

  assert.equal(selected.length, 4);
  assert.equal(readiness.complete, false);
  assert.ok(readiness.missingImages.length >= 1);
  assert.equal(window.document.getElementById("placeCard").dataset.roundReadiness, "incomplete");
});

test("a valid explicit six-round set is preserved and Badges is mandatory", () => {
  const place = {
    id: "p7",
    category: "kunst",
    rounds: ["badges", "works", "people", "details", "spots", "objects"]
  };
  const window = createRuntime(place);
  assert.deepEqual(window.HGVisualPlaceRounds.get(place), place.rounds);

  const invalid = {
    id: "p8",
    category: "kunst",
    rounds: ["works", "people", "details", "spots"]
  };
  window.PLACES = [invalid];
  window.document.getElementById("placeCard").dataset.currentPlaceId = invalid.id;
  assert.ok(window.HGVisualPlaceRounds.get(invalid).includes("badges"));
});

test("4-round and 6-round layouts are true 2x2 and 3x2 grids", () => {
  const four = {
    id: "p9",
    category: "historie",
    people: [{ image: "person.jpg" }],
    objects: [{ image: "object.jpg" }],
    spots: [{ image: "spot.jpg" }]
  };
  const window = createRuntime(four);
  const grid = window.document.querySelector(".pc-icons-quad");
  assert.equal(grid.style.gridTemplateColumns, "repeat(2, var(--place-card-orb-size))");
  assert.equal(grid.style.gridTemplateRows, "repeat(2, var(--place-card-orb-size))");

  const six = {
    id: "p10",
    category: "historie",
    people: [{ image: "person.jpg" }],
    works: [{ image: "work.jpg" }],
    objects: [{ image: "object.jpg" }],
    details: [{ image: "detail.jpg" }],
    spots: [{ image: "spot.jpg" }]
  };
  window.PLACES = [six];
  grid.parentElement.closest("#placeCard").dataset.currentPlaceId = six.id;
  window.HGVisualPlaceRounds.apply(six);
  assert.equal(grid.style.gridTemplateColumns, "repeat(3, var(--place-card-orb-size))");
  assert.equal(grid.style.gridTemplateRows, "repeat(2, var(--place-card-orb-size))");
});

test("existing Brands with a real logo remain image-ready without changing Brands semantics", () => {
  const place = { id: "p11", category: "naeringsliv", brand_ids: ["brand_a"] };
  const window = createRuntime(place, {
    HGBrands: {
      getById(id) {
        return id === "brand_a" ? { id, name: "Brand A", logo: "brands/a.png" } : null;
      }
    }
  });
  assert.equal(window.HGVisualPlaceRounds.isImageReady(place, "brands"), true);
});
