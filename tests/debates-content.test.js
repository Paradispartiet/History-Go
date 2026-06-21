#!/usr/bin/env node
// Content integrity for data/debates/: every debate is well-formed, ids are unique, place_id
// resolves against the generated places index, and category is a canonical domain.

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

const CANONICAL = new Set([
  "by", "historie", "kunst", "litteratur", "musikk", "naeringsliv", "natur",
  "politikk", "popkultur", "psykologi", "sport", "subkultur", "vitenskap"
]);

const placesIndex = read("data/places/places_index.json");
const placeIds = new Set((Array.isArray(placesIndex) ? placesIndex : []).map((p) => p && p.id));

const manifest = read("data/debates/manifest.json");
assert(Array.isArray(manifest.files) && manifest.files.length, "manifest lists files");

const seenDebateIds = new Set();
let total = 0;

for (const file of manifest.files) {
  assert(fs.existsSync(path.join(root, file)), `manifest file exists: ${file}`);
  const debates = read(file);
  assert(Array.isArray(debates), `${file} is an array`);

  for (const d of debates) {
    const where = `${file} :: ${d && d.id}`;
    assert(d && typeof d.id === "string" && d.id.trim(), `${where}: id`);
    assert(!seenDebateIds.has(d.id), `${where}: duplicate debate id`);
    seenDebateIds.add(d.id);

    assert(typeof d.title === "string" && d.title.trim(), `${where}: title`);
    assert(typeof d.question === "string" && d.question.trim(), `${where}: question`);
    assert(CANONICAL.has(d.category), `${where}: canonical category (got ${d.category})`);
    assert(typeof d.place_id === "string" && d.place_id.trim(), `${where}: place_id`);
    assert(placeIds.has(d.place_id), `${where}: place_id resolves in places_index (${d.place_id})`);

    assert(Array.isArray(d.positions) && d.positions.length >= 2, `${where}: >=2 positions`);
    const posIds = new Set();
    for (const pos of d.positions) {
      assert(pos && typeof pos.id === "string" && pos.id.trim(), `${where}: position id`);
      assert(!posIds.has(pos.id), `${where}: duplicate position id ${pos.id}`);
      posIds.add(pos.id);
      assert(typeof pos.label === "string" && pos.label.trim(), `${where}: position label`);
    }
    total++;
  }
}

assert(total >= 3, "has seed content");
console.log(`debates content ok (${total} debates across ${manifest.files.length} files)`);
