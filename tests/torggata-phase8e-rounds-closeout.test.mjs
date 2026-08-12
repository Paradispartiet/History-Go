import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const place = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/places/by/oslo/places/torggata.json"), "utf8"));
const roundsSource = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-visual-collections.js"), "utf8");

test("Torggata 8E removes stale place.rounds without rewriting a hardcoded canonical list", () => {
  assert.equal(Object.prototype.hasOwnProperty.call(place, "rounds"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "rundinger"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "rounds_exclude"), false);
  assert.equal(place.category, "by");
  assert.ok(Array.isArray(place.objects) && place.objects.length > 0, "8B Objects skal bestå");
  assert.ok(Array.isArray(place.structures) && place.structures.length === 2, "8D Structures skal bestå med to fysiske anlegg");
});

test("Torggata final PlaceCard is people · objects · brands · structures with Badges separate", async () => {
  const legacyIds = [
    "pcWorksIcon", "pcDetailsIcon", "pcSpotsIcon", "pcCivicationStoreIcon", "pcNatureIcon",
    "pcForNaIcon", "pcFortellingerIcon", "pcLeksikonIcon", "pcPlayIcon", "pcTrainingIcon",
    "pcTasksIcon", "pcWonderkammerIcon", "pcStoriesIcon", "pcRoutesIcon"
  ];
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="torggata"><div class="pc-body"><div class="pc-title-row"><h2 id="pcTitle">Torggata</h2><div id="pcBadgesIcon" class="pc-round"></div></div><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div><div id="pcWorksIcon" class="pc-round"></div><div id="pcDetailsIcon" class="pc-round"></div><div id="pcSpotsIcon" class="pc-round"></div><div id="pcCivicationStoreIcon" class="pc-round"></div><div id="pcNatureIcon" class="pc-round"></div><div id="pcForNaIcon" class="pc-round"></div><div id="pcFortellingerIcon" class="pc-round"></div><div id="pcLeksikonIcon" class="pc-round"></div><div id="pcPlayIcon" class="pc-round"></div><div id="pcTrainingIcon" class="pc-round"></div><div id="pcTasksIcon" class="pc-round"></div><div id="pcWonderkammerIcon" class="pc-round"></div><div id="pcStoriesIcon" class="pc-round"></div><div id="pcRoutesIcon" class="pc-round"></div></div><div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcBadgesList"></div></div></div></body>', { url: "https://history-go.test/", runScripts: "outside-only" });

  const w = dom.window;
  w.PLACES = [place];
  w.eval(roundsSource);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  await w.HGVisualPlaceRounds.apply(place);

  assert.deepEqual(Array.from(w.HGVisualPlaceRounds.get(place)), ["people", "objects", "brands", "structures"]);
  assert.equal(w.HGVisualPlaceRounds.getFourth(place), "structures");
  assert.equal(w.HGVisualPlaceRounds.getItems(place, "structures").length, 2);

  const grid = w.document.querySelector(".pc-icons-quad");
  const visible = [...grid.querySelectorAll(".pc-round")].filter(el => !el.hidden);
  const ordered = visible.slice().sort((a, b) => Number(a.style.order) - Number(b.style.order)).map(el => el.id);
  assert.equal(grid.dataset.roundCount, "4");
  assert.equal(grid.dataset.roundCategory, "by");
  assert.equal(grid.dataset.roundFourth, "structures");
  assert.deepEqual(ordered, ["pcPeopleIcon", "pcObjectsIcon", "pcBrandsIcon", "pcCategoryCollectionIcon"]);
  assert.equal(w.document.getElementById("pcBadgesIcon").parentElement.className, "pc-title-row");
  assert.equal(w.document.getElementById("pcBadgesIcon").hidden, false);
  for (const id of legacyIds) assert.equal(w.document.getElementById(id).hidden, true, id);
  dom.window.close();
});
