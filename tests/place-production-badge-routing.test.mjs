import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));

const index = read("data/badges/index.json");
const routing = read("data/badges/place_production_routing_v1.json");
const checklist = fs.readFileSync("docs/PLACE_PRODUCTION_CHECKLIST.md", "utf8");
const profiles = fs.readFileSync("docs/PLACE_PRODUCTION_PROFILES.md", "utf8");
const collectionContract = fs.readFileSync("data/places/README_place_rounds.md", "utf8");

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
    assert.ok(Array.isArray(route.candidate_collections) && route.candidate_collections.length === 4, `${badge.id}: exactly four candidate collections`);
    assert.ok(Array.isArray(route.research_lanes) && route.research_lanes.length > 0, `${badge.id}: research lanes`);
  }
});

test("all 19 badge families follow the canonical four-collection model", () => {
  const ordinary = ["people", "objects", "brands", "productions"];
  const expected = Object.fromEntries(badgeIds.map(id => [id, ordinary]));
  expected.by = ["people", "objects", "brands", "structures"];
  expected.natur = ["map", "flora", "fauna", "destinations"];
  expected.sport = ["people", "objects", "brands", "competitions"];

  assert.equal(badgeIds.length, 19);
  assert.equal(routing.rules.full_place_collection_count, 4);
  assert.deepEqual(routing.rules.standard_full_profile, ["people", "objects", "brands", "category_expression"]);
  assert.equal(routing.rules.related_is_placecard_collection, false);

  for (const id of badgeIds) {
    const collections = routing.badges[id].candidate_collections;
    assert.deepEqual(collections, expected[id], `${id}: canonical collection set`);
    assert.equal(new Set(collections).size, 4, `${id}: unique collections`);
    assert.equal(collections.includes("related"), false, `${id}: Related is not a PlaceCard collection`);
  }
});

test("the canonical documentation defines all 19 category expressions", () => {
  const rows = {
    by: ["People · Objects · Brands · Structures", "Byrom og anlegg"],
    historie: ["People · Objects · Brands · Productions", "Historiske hendelser"],
    kunst: ["People · Objects · Brands · Productions", "Kunstverk"],
    litteratur: ["People · Objects · Brands · Productions", "Bøker og tekster"],
    media: ["People · Objects · Brands · Productions", "Utgivelser og sendinger"],
    musikk: ["People · Objects · Brands · Productions", "Sanger og album"],
    naeringsliv: ["People · Objects · Brands · Productions", "Produksjon og tjenester"],
    natur: ["Map · Flora · Fauna · Destinations", "Turmål"],
    politikk: ["People · Objects · Brands · Productions", "Hendelser og vedtak"],
    psykologi: ["People · Objects · Brands · Productions", "Studier og metoder"],
    helse: ["People · Objects · Brands · Productions", "Behandling og omsorg"],
    utdanning: ["People · Objects · Brands · Productions", "Pedagogikk og programmer"],
    religion: ["People · Objects · Brands · Productions", "Ritualer og tradisjoner"],
    scenekunst: ["People · Objects · Brands · Productions", "Forestillinger"],
    sport: ["People · Objects · Brands · Competitions", "Kamper og konkurranser"],
    subkultur: ["People · Objects · Brands · Productions", "Uttrykk og utgivelser"],
    vitenskap: ["People · Objects · Brands · Productions", "Forskning og oppdagelser"],
    filosofi: ["People · Objects · Brands · Productions", "Tekster og fagverk"],
    film_tv: ["People · Objects · Brands · Productions", "Filmer og serier"]
  };

  assert.deepEqual(Object.keys(rows).sort(), [...badgeIds].sort());
  for (const [id, [collections, label]] of Object.entries(rows)) {
    assert.ok(
      collectionContract.includes(`| \`${id}\` | ${collections} | **${label}** |`),
      `${id}: documented category expression`
    );
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
