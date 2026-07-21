import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = read("data/places/natur/oslo/places_oslo_natur_hovedsteder/noklevann.json");
const mapFiles = ["data/natur/nature_place_map.json","data/natur/nature_bird_place_map.json","data/natur/nature_oslo_expansion_place_map.json","data/natur/nature_routes_place_map.json"];
const flora = new Set();
const fauna = new Set();
for (const file of mapFiles) {
  const entry = read(file).places?.noklevann;
  for (const id of entry?.flora || []) flora.add(typeof id === "string" ? id : id.id);
  for (const id of entry?.fauna || []) fauna.add(typeof id === "string" ? id : id.id);
}
const inventory = place.nature_profile?.species_inventory;
test("Nøklevann inventory matches active nature maps", () => {
  assert.ok(inventory);
  assert.equal(inventory.rule, "all_active_mapped_species_for_place");
  assert.deepEqual([...new Set(inventory.flora.map(item => item.id))].sort(), [...flora].sort());
  assert.deepEqual([...new Set(inventory.fauna.map(item => item.id))].sort(), [...fauna].sort());
  assert.equal(inventory.total_species, flora.size + fauna.size);
  assert.ok(inventory.total_species > 0);
});
test("Nøklevann inventory entries expose names, latin and map evidence", () => {
  for (const item of [...inventory.flora, ...inventory.fauna]) {
    assert.ok(item.id);
    assert.ok(item.name);
    assert.ok(item.latin);
    assert.equal(item.status, "aktiv_kartkobling");
    assert.ok(Array.isArray(item.maps) && item.maps.length >= 1);
  }
  assert.ok(place.quiz_profile.signature_features.length >= 4);
});
