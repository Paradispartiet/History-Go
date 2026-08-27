import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));

const index = read("data/badges/index.json");
const routing = read("data/badges/place_production_routing_v1.json");
const checklist = fs.readFileSync("docs/PLACE_PRODUCTION_CHECKLIST.md", "utf8");
const profiles = fs.readFileSync("docs/PLACE_PRODUCTION_PROFILES.md", "utf8");

const badgeFiles = index.files.map(path => ({ path, badge: read(path) }));
const badgeIds = badgeFiles.map(({ badge }) => badge.id);

test("every canonical badge family has badge-driven place-production routing", () => {
  assert.equal(routing.schema, "history_go_badge_driven_place_production_v1");
  assert.equal(index.files.length, 19);
  assert.deepEqual(Object.keys(routing.badges).sort(), [...badgeIds].sort());

  for (const { path, badge } of badgeFiles) {
    assert.ok(badge.id, path);
    assert.ok(Array.isArray(badge.sub) && badge.sub.length > 0, `${badge.id}: canonical underbadges`);
    const route = routing.badges[badge.id];
    assert.ok(route, `${badge.id}: routing`);
    assert.ok(Array.isArray(route.candidate_collections) && route.candidate_collections.length > 0, `${badge.id}: candidate collections`);
    assert.ok(Array.isArray(route.research_lanes) && route.research_lanes.length > 0, `${badge.id}: research lanes`);
  }
});

test("routing requires underbadges and sources before final content plan", () => {
  assert.deepEqual(routing.rules.routing_order, [
    "universal_canonical_core",
    "primary_badge_family",
    "active_underbadge_ids",
    "place_specific_source_review",
    "confirmed_production_profile",
    "final_content_plan"
  ]);
  assert.equal(routing.rules.underbadges_refine_not_fill, true);
  assert.equal(routing.rules.sources_override_candidate_hints, true);
  assert.equal(routing.rules.no_filler, true);
  assert.equal(routing.rules.no_empty_placecard_collections, true);
});

test("place-production governance requires the badge gate", () => {
  for (const text of [checklist, profiles]) {
    assert.match(text, /HOVEDBADGE|hovedbadge/i);
    assert.match(text, /UNDERBADGE|underbadge/i);
    assert.match(text, /place_production_routing_v1\.json/);
  }
  assert.match(profiles, /Badge-drevet innholdsplan/i);
  assert.match(profiles, /kildene avgjør/i);
});
