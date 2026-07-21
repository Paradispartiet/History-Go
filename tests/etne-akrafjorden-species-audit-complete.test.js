#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");
const map = JSON.parse(fs.readFileSync("data/natur/nature_etne_place_map.json", "utf8"));
const audit = JSON.parse(fs.readFileSync("reports/etne-natur-batch-9-akrafjorden-artskart.json", "utf8"));
const place = map.places.akrafjorden;
let newCardCount = 0;
for (let batch = 1; batch <= 11; batch += 1) {
  const cards = JSON.parse(fs.readFileSync("data/natur/fauna/marine_akrafjorden_batch_" + batch + ".json", "utf8"));
  newCardCount += cards.length;
}
assert.equal(newCardCount, 214);
assert.equal(audit.summary.unmatchedLikelySpeciesCount, 250);
assert.equal(newCardCount + place.excluded_species_level_edge_taxa_count, 250);
assert.equal(place.fauna.length, place.linked_existing_species_card_count + newCardCount);
assert.equal(place.fauna.length, 225);
assert.equal(place.excluded_species_level_edge_taxa.length, 36);
assert.equal(new Set(place.excluded_species_level_edge_taxa).size, 36);
assert.equal(place.reviewed_species_level_taxa_count, 250);
assert.equal(place.unreviewed_species_level_taxa_count, 0);
assert.equal(place.remaining_publishable_species_level_taxa_count, 0);
assert.equal(place.excluded_higher_taxa_count, audit.summary.unmatchedNeedsRankReviewCount);
assert.equal(place.species_level_audit_complete, true);
assert.equal(place.higher_taxa_review_complete, true);
console.log("Etne Åkrafjorden species-level audit complete");
