const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");

const repoRoot = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(repoRoot, "js/core/pos.js"), "utf8");
const pickerCss = fs.readFileSync(path.join(repoRoot, "css/popups.css"), "utf8");

async function bootPicker() {
  const dom = new JSDOM(
    '<!doctype html><html><body class="hg-app"><span id="geoStatus"></span></body></html>',
    { url: "https://example.test/History-Go/", runScripts: "outside-only" }
  );
  const { window } = dom;

  window.PLACES = [
    { id: "munchmuseet", name: "Munchmuseet", category: "kunst", lat: 59.9068, lon: 10.7557 },
    { id: "mollergata_19", name: "Møllergata 19", category: "historie", lat: 59.9143, lon: 10.7468 },
    { id: "hidden_place", name: "Munch hemmelig", category: "kunst", lat: 59.9, lon: 10.7, hidden: true },
    { id: "stub_place", name: "Munch stub", category: "kunst", lat: 59.9, lon: 10.7, stub: true },
    { id: "missing_coordinates", name: "Munch uten koordinat", category: "kunst" }
  ];
  window.CATEGORY_LIST = [
    { id: "kunst", name: "Kunst" },
    { id: "historie", name: "Historie" }
  ];
  window.fetch = async () => ({
    ok: true,
    json: async () => ({
      locations: [
        { cityId: "oslo", label: "Oslo", lat: 59.9139, lon: 10.7522, places: [] },
        { cityId: "lisboa", label: "Lisboa", lat: 38.7223, lon: -9.1393, places: [] }
      ]
    })
  });

  vm.runInContext(source, dom.getInternalVMContext(), { filename: "js/core/pos.js" });
  await window.HGPos.openLocationPicker();
  return dom;
}

(async () => {
  const dom = await bootPicker();
  const { window } = dom;
  const { document } = window;

  const modal = document.getElementById("locationPickerModal");
  assert(modal, "location picker opens");
  assert.equal(modal.getAttribute("role"), "dialog");
  assert.equal(modal.getAttribute("aria-modal"), "true");

  const normalizedMatches = window.HGPos.searchLocationPlaces("mollergata");
  assert.deepEqual(Array.from(normalizedMatches, (place) => place.id), ["mollergata_19"], "search normalizes ø/å");
  assert.equal(
    window.HGPos.setLocationFromPlace({ id: "private_address", name: "Privat adresse", lat: 59.9, lon: 10.7 }),
    false,
    "manual location cannot use an object outside canonical PLACES"
  );
  assert.equal(
    window.HGPos.setLocationFromPlace({ id: "munchmuseet", name: "Egendefinert adresse" }),
    true,
    "a canonical place id can be selected"
  );
  assert.equal(
    window.HGPos.getLocationOverride().label,
    "Munchmuseet",
    "stored labels come from canonical PLACES rather than arbitrary input"
  );

  const input = document.getElementById("locationPlaceSearch");
  input.value = "munch";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));

  const results = Array.from(document.querySelectorAll("[data-location-search-place]"));
  assert.equal(results.length, 1, "only selectable canonical places appear in results");
  assert.equal(results[0].getAttribute("data-location-search-place"), "munchmuseet");
  assert.match(results[0].textContent, /Munchmuseet/);
  assert.match(results[0].textContent, /Kunst/);
  assert.equal(document.querySelector("[data-location-quick]").hidden, true, "quick choices yield to search results");

  results[0].click();
  assert.equal(document.getElementById("locationPickerModal"), null, "picker closes after selecting a place");

  const override = window.HGPos.getLocationOverride();
  assert.equal(override.placeId, "munchmuseet");
  assert.equal(override.label, "Munchmuseet");
  assert.equal(override.lat, 59.9068);
  assert.equal(override.lon, 10.7557);
  assert.equal(override.source, "history-go-place-picker");
  assert.equal(window.HGPos.getPos().mode, "manual");

  const pickerStart = source.indexOf("async function openLocationPicker()");
  const pickerEnd = source.indexOf("\n  function setPos", pickerStart);
  const pickerSource = source.slice(pickerStart, pickerEnd);
  assert(!pickerSource.includes("style="), "location picker no longer relies on inline layout styles");
  assert.match(pickerSource, /id="locationPlaceSearch"/);
  assert.match(pickerSource, /data-location-search-place/);

  assert.match(pickerCss, /#locationPickerModal \.hg-location-picker-card/);
  assert.match(pickerCss, /#locationPickerModal #locationPlaceSearch\s*\{[^}]*font-size:\s*16px/s);
  assert.match(pickerCss, /@media \(max-width: 640px\)[\s\S]*align-items:\s*flex-end/);

  dom.window.close();
  console.log("location picker place search tests passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
