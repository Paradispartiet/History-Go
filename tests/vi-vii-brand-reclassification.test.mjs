import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

test("VI, VII is retired as a Place and preserved as an unmapped Brand", () => {
  const placeManifest = readJson("data/places/manifest.json");
  const placeIndex = readJson("data/places/places_index.json");
  const coordinateManifest = readJson("data/coordinate-evidence/manifest.json");
  const brandMaster = readJson("data/brands/brands_master.json");
  const raw = readJson("data/brands/brands_master_raw.json");
  const catalog = readJson("data/brands/brands_catalog.json");
  const catalogV17 = readJson("data/brands/brands_catalog_v17.json");

  assert.equal(placeManifest.files.includes("places/kunst/oslo/places_kunst/vi_vii_gallery.json"), false);
  assert.equal(placeIndex.some((place) => place.id === "vi_vii_gallery"), false);
  assert.equal(coordinateManifest.files.includes("oslo/kunst/vi_vii_gallery.json"), false);
  assert.equal(fs.existsSync("data/places/kunst/oslo/places_kunst/vi_vii_gallery.json"), false);
  assert.equal(fs.existsSync("data/coordinate-evidence/oslo/kunst/vi_vii_gallery.json"), false);
  assert.equal(fs.existsSync("data/runtime/place-open/vi_vii_gallery.json"), false);

  for (const dataset of [brandMaster, raw, catalog, catalogV17]) {
    assert.equal(dataset.filter((brand) => brand.id === "vi_vii").length, 1);
  }

  const brand = brandMaster.find((item) => item.id === "vi_vii");
  assert.equal(brand.brand_type, "gallery_brand");
  assert.equal(brand.state, "verified_unmapped");
  assert.deepEqual(brand.place_ids, []);
  assert.equal(brand.asset_status, "holdback_no_verified_local_wordmark");
  assert.ok(brand.source_urls.includes("https://vivii.no/Gallery"));
  assert.ok(brand.source_urls.includes("https://vivii.no/Exhibitions"));
});

test("Kunst comparison targets no longer reference the retired Place ID", () => {
  const files = [
    "data/places/kunst/oslo/places_kunst/oslo_prosjektrom.json",
    "data/places/kunst/oslo/places_kunst/the_oslo_gallery.json",
    "data/places/kunst/oslo/places_kunst/kunstnerforbundet.json"
  ];
  for (const file of files) {
    assert.equal(fs.readFileSync(file, "utf8").includes("vi_vii_gallery"), false, file);
  }
});
