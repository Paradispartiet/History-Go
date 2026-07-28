import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-visual-collections.js"), "utf8");
const windows = new Set();

afterEach(() => {
  for (const window of windows) window.close();
  windows.clear();
});

function visibleRounds(window) {
  return [...window.document.querySelectorAll(".pc-icons-quad .pc-round")].filter(el => !el.hidden);
}

test("legacy PlaceCard render cannot leak old rounds back into an ordinary canonical grid", async () => {
  const dom = new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="p1">
      <div class="pc-body">
        <div class="pc-icons-quad">
          <div id="pcPeopleIcon" class="pc-round"></div>
          <div id="pcNatureIcon" class="pc-round"></div>
          <div id="pcBadgesIcon" class="pc-round"></div>
          <div id="pcWorksIcon" class="pc-round"></div>
          <div id="pcCivicationStoreIcon" class="pc-round"></div>
          <div id="pcBrandsIcon" class="pc-round"></div>
          <div id="pcForNaIcon" class="pc-round"></div>
          <div id="pcFortellingerIcon" class="pc-round"></div>
          <div id="pcLeksikonIcon" class="pc-round"></div>
          <div id="pcPlayIcon" class="pc-round"></div>
          <div id="pcTrainingIcon" class="pc-round"></div>
          <div id="pcTasksIcon" class="pc-round"></div>
          <div id="pcDetailsIcon" class="pc-round"></div>
          <div id="pcSpotsIcon" class="pc-round"></div>
        </div>
        <div id="pcPeopleList"></div><div id="pcNatureList"></div><div id="pcWorksList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div>
      </div>
    </div>
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });

  const { window } = dom;
  windows.add(window);
  window.PLACES = [{ id: "p1", category: "historie", rounds: ["badges", "people", "works", "nature", "map"] }];
  window.BADGES = [{ id: "historie", image: "badge.png" }];
  window.HGNaturePlaceMap = { open() {} };

  window.openPlaceCard = async () => {
    window.document.querySelectorAll(".pc-icons-quad .pc-round").forEach(el => { el.hidden = false; });
  };

  window.eval(source);
  window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
  await window.openPlaceCard(window.PLACES[0]);
  await new Promise(resolve => window.setTimeout(resolve, 20));

  const visible = visibleRounds(window);
  assert.equal(visible.length, 4);
  assert.deepEqual(visible.map(el => el.id).sort(), ["pcBadgesIcon", "pcPeopleIcon", "pcObjectsIcon", "pcBrandsIcon"].sort());
  assert.equal(window.document.getElementById("pcNatureMapIcon").hidden, true);

  const grid = window.document.querySelector(".pc-icons-quad");
  assert.equal(grid.dataset.roundCount, "4");
  assert.equal(grid.style.gridTemplateColumns, "repeat(2, var(--place-card-orb-size))");
  assert.equal(grid.style.gridTemplateRows, "repeat(2, var(--place-card-orb-size))");
});

test("nature grid replaces People and Objects with Flora, Fauna and nature-only Kart", () => {
  const dom = new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="n1"><div class="pc-body"><div class="pc-icons-quad">
      <div id="pcPeopleIcon" class="pc-round"></div><div id="pcBadgesIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div>
    </div><div id="pcPeopleList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div></div></div>
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  windows.add(window);
  const place = { id: "n1", category: "natur" };
  window.PLACES = [place];
  window.BADGES = [{ id: "natur", image: "badge.png" }];
  window.HGNaturePlaceMap = { open() {} };
  window.eval(source);
  window.document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
  window.HGVisualPlaceRounds.apply(place);

  assert.deepEqual(visibleRounds(window).map(el => el.id).sort(), ["pcBadgesIcon", "pcFloraIcon", "pcFaunaIcon", "pcNatureMapIcon"].sort());
});
