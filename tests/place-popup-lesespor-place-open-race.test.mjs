import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const payload = JSON.parse(fs.readFileSync("data/runtime/place-open/alunverket.json", "utf8"));

test("stedspopupen prioriterer canonical place-open-lesespor over et gammelt bakgrunnsregister", async () => {
  let aggregateLoads = 0;
  const showPlacePopup = () => {};
  showPlacePopup.__hgPlacePopupV2 = true;
  const context = {
    console,
    showPlacePopup,
    LESESPOR: [{ id: "stale_other_place", place_ids: ["other_place"], title: "Gammel cache" }],
    DataHub: { loadLesespor: async () => {
      aggregateLoads += 1;
      return { items: context.LESESPOR };
    } },
    HGPlaceOpen: { get: id => id === payload.place.id ? payload : null }
  };
  context.window = context;
  vm.runInNewContext(fs.readFileSync("js/ui/place-popup-tabs.js", "utf8"), context, {
    filename: "place-popup-tabs.js"
  });

  const resolved = await context.HGPlacePopupTabs.resolveLesespor(payload.place.id);
  assert.equal(resolved.filter(item => item.place_ids?.includes(payload.place.id)).length, 4);
  assert.equal(resolved.some(item => item.id === "stale_other_place"), true);
  assert.equal(aggregateLoads, 0, "canonical place-open payload skal ikke vente på gammel aggregatcache");
});
