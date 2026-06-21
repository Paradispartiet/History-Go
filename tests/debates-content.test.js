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

// Real Civication conflict axes (primary/secondary across every conflict file). A debate's
// conflict_id MUST be one of these — no inventing axes (SYSTEM_REGISTRY: no guessing).
const conflictDir = path.join(root, "data/Civication/conflicts");
const conflictAxes = new Set();
for (const f of fs.readdirSync(conflictDir).filter((n) => n.endsWith(".json"))) {
  const levels = read(`data/Civication/conflicts/${f}`).levels || [];
  for (const l of levels) {
    if (l && l.primary) conflictAxes.add(l.primary);
    if (l && l.secondary) conflictAxes.add(l.secondary);
  }
}
assert(conflictAxes.size > 0, "loaded Civication conflict axes");

const manifest = read("data/debates/manifest.json");
assert(Array.isArray(manifest.files) && manifest.files.length, "manifest lists files");

const seenDebateIds = new Set();
let total = 0;
let linked = 0;

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

    // conflict_id is optional, but when present must be a real Civication conflict axis so the
    // task bridge can resolve a conflict-targeted debate task (via hg_debate_log_v1 byConflict).
    if (d.conflict_id != null) {
      assert(conflictAxes.has(d.conflict_id), `${where}: conflict_id is a real axis (${d.conflict_id})`);
      linked++;
    }

    // Valid poles for this debate's axis: the two sides of conflict_id, plus the neutral "midt".
    const validPoles = new Set(["midt"]);
    if (d.conflict_id) String(d.conflict_id).split("_vs_").forEach((s) => validPoles.add(s));

    assert(Array.isArray(d.positions) && d.positions.length >= 2, `${where}: >=2 positions`);
    const posIds = new Set();
    for (const pos of d.positions) {
      assert(pos && typeof pos.id === "string" && pos.id.trim(), `${where}: position id`);
      assert(!posIds.has(pos.id), `${where}: duplicate position id ${pos.id}`);
      posIds.add(pos.id);
      assert(typeof pos.label === "string" && pos.label.trim(), `${where}: position label`);
      // each position leans to a pole of its axis (or "midt"); enables the leaning() reading.
      assert(typeof pos.pole === "string" && pos.pole.trim(), `${where}/${pos.id}: pole`);
      assert(validPoles.has(pos.pole), `${where}/${pos.id}: pole is a side of the axis or "midt" (got ${pos.pole})`);
    }
    total++;
  }
}

assert(total >= 3, "has seed content");
console.log(`debates content ok (${total} debates across ${manifest.files.length} files, ${linked} linked to conflicts)`);
