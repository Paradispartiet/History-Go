import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const place = JSON.parse(fs.readFileSync("data/places/by/oslo/places/torggata.json", "utf8"));
const roundsSource = fs.readFileSync("js/ui/place-rounds-visual-collections.js", "utf8");

test("8F preserves the 8E ban on legacy place.rounds and uses a bounded profile", () => {
  assert.equal(Object.prototype.hasOwnProperty.call(place, "rounds"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "rundinger"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "rounds_exclude"), false);
  assert.deepStrictEqual(place.round_profile.content_round_ids, ["people", "images", "brands", "related"]);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "objects"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "structures"), false);
});

test("Torggata legacy profile becomes People · Brands · Relaterte steder with Badge separate", async () => {
  const legacyIds = [
    "pcWorksIcon", "pcDetailsIcon", "pcSpotsIcon", "pcCivicationStoreIcon", "pcNatureIcon",
    "pcForNaIcon", "pcFortellingerIcon", "pcLeksikonIcon", "pcPlayIcon", "pcTrainingIcon",
    "pcTasksIcon", "pcWonderkammerIcon", "pcStoriesIcon", "pcRoutesIcon"
  ];
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="torggata"><div class="pc-body"><div class="pc-title-row"><h2>Torggata</h2><div id="pcBadgesIcon" class="pc-round"></div></div><div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div>' + legacyIds.map(id => '<div id="' + id + '" class="pc-round"></div>').join("") + '</div><div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcBadgesList"></div></div></div></body>', { url:"https://history-go.test/", runScripts:"outside-only" });
  const w = dom.window;
  w.PLACES = [place];
  w.eval(roundsSource);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles:true }));
  await w.HGVisualPlaceRounds.apply(place);

  assert.deepStrictEqual(Array.from(w.HGVisualPlaceRounds.get(place)), ["people", "brands", "related"]);
  assert.equal(w.HGVisualPlaceRounds.getFourth(place), "related");
  assert.equal(w.HGVisualPlaceRounds.getItems(place, "images").length, 0);
  assert.equal(w.HGVisualPlaceRounds.getItems(place, "related").length, 3);

  const grid = w.document.querySelector(".pc-icons-quad");
  const visible = [...grid.querySelectorAll(".pc-round")].filter(el => !el.hidden);
  const ordered = visible.slice().sort((a,b) => Number(a.style.order) - Number(b.style.order)).map(el => el.id);
  assert.equal(grid.dataset.collectionCount, "3");
  assert.equal(grid.dataset.collectionProfileSource, "round_profile_v1_adapter");
  assert.deepStrictEqual(ordered, ["pcPeopleIcon", "pcBrandsIcon", "pcCategoryCollectionIcon"]);
  assert.equal(w.document.getElementById("pcObjectsIcon").hidden, true);
  assert.equal(w.document.getElementById("pcCategoryCollectionIcon").dataset.collectionId, "related");
  assert.equal(w.document.getElementById("pcBadgesIcon").parentElement.className, "pc-title-row");
  assert.equal(w.document.getElementById("pcBadgesIcon").hidden, false);
  for (const id of legacyIds) assert.equal(w.document.getElementById(id).hidden, true, id);
  dom.window.close();
});
