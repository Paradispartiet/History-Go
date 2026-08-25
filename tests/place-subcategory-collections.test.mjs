import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const runtimeSource = fs.readFileSync(path.join(__dirname, "../js/ui/place-subcategory-collections.js"), "utf8");
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/places/regler/place_card_profile_v2.schema.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/categories/category_contract.json"), "utf8"));
const windows = new Set();
afterEach(() => { for (const w of windows) w.close(); windows.clear(); });

function make(place) {
  const dom = new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="${place.id}"><div class="pc-body"><div class="pc-icons-quad"><div id="pcFloraIcon" class="pc-round"></div><div id="pcFaunaIcon" class="pc-round"></div><div id="pcNatureMapIcon" class="pc-round"></div><div id="pcCategoryCollectionIcon" class="pc-round"></div></div></div></div></body>`, { url:"https://history-go.test/", runScripts:"outside-only" });
  const w = dom.window;
  windows.add(w);
  w.PLACES = [place];
  w.HGPlaceCardCollections = { __canonicalPlaceCardCollectionsV2:true };
  w.HGPlaceRoundsFillLayout = { scheduleLayout() {} };
  w.openPlaceCard = async () => undefined;
  w.requestAnimationFrame = fn => { fn(); return 1; };
  w.eval(runtimeSource);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles:true }));
  return w;
}

test("canonical Place category contract materializes both new undercategories without changing Fagverk specializations", () => {
  const nature = categories.canonicalPlaceSubcategories.natur.find(row => row.id === "miljo_gjenbruk");
  const literature = categories.canonicalPlaceSubcategories.litteratur.find(row => row.id === "lesekiosk");
  assert.equal(nature.status, "foundation_materialized");
  assert.ok(nature.fagverkChapterIds.includes("sirkulaer_okonomi_avfall_ombruk"));
  assert.equal(literature.status, "foundation_materialized");
  assert.ok(literature.fagverkChapterIds.includes("lesekultur_bokdeling_offentlighet"));
  assert.deepEqual(categories.canonicalSubcategories.natur.map(row => row.id), ["geografi"]);
  assert.deepEqual(categories.canonicalSubcategories.litteratur.map(row => row.id), ["sprak_lingvistikk"]);
});

test("PlaceCard schema accepts the exact Miljø & gjenbruk four-surface profile", () => {
  const text = JSON.stringify(schema);
  for (const id of ["reuse", "materials", "environment", "systems"]) assert.ok(text.includes(`\"${id}\"`), id);
  const circular = schema.oneOf.find(row => row.title.includes("Miljø & gjenbruk"));
  assert.deepEqual(circular.properties.collection_ids.prefixItems.map(row => row.const), ["reuse", "materials", "environment", "systems"]);
});

test("Miljø & gjenbruk renders four rectangular resource surfaces and hides Nature defaults", () => {
  const place = {
    id:"station",
    category:"natur",
    subcategory_id:"miljo_gjenbruk",
    circular_profile:{
      reuse:[{ id:"reuse_1", title:"Gratis ombruk" }],
      materials:[{ id:"material_1", title:"Treverk" }],
      environment:[{ id:"environment_1", title:"Avfallshierarkiet" }],
      systems:[{ id:"system_1", title:"Kommunal gjenvinningsstasjon" }]
    }
  };
  const w = make(place);
  assert.equal(w.HGPlaceSubcategoryCollections.apply(place), true);
  const ids = ["pcReuseIcon", "pcMaterialsIcon", "pcEnvironmentIcon", "pcSystemsIcon"];
  for (const [index, id] of ids.entries()) {
    const el = w.document.getElementById(id);
    assert.equal(el.hidden, false, id);
    assert.equal(el.dataset.collectionShape, "rectangle", id);
    assert.equal(el.style.order, String(index), id);
  }
  for (const id of ["pcFloraIcon", "pcFaunaIcon", "pcNatureMapIcon", "pcCategoryCollectionIcon"]) {
    assert.equal(w.document.getElementById(id).hidden, true, id);
  }
  assert.equal(w.document.querySelector(".pc-icons-quad").dataset.collectionCount, "4");
  assert.equal(w.document.querySelector(".pc-icons-quad").dataset.collectionProfileSource, "subcategory:miljo_gjenbruk");
});

test("ordinary Nature place is not claimed by the subcategory renderer", () => {
  const place = { id:"forest", category:"natur" };
  const w = make(place);
  assert.equal(w.HGPlaceSubcategoryCollections.apply(place), false);
});
