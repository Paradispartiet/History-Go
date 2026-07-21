#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");
const cards = JSON.parse(fs.readFileSync("data/natur/fauna/marine_akrafjorden_batch_11.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("data/natur/fauna/manifest.json", "utf8"));
const map = JSON.parse(fs.readFileSync("data/natur/nature_etne_place_map.json", "utf8"));
const audit = JSON.parse(fs.readFileSync("reports/etne-natur-batch-9-akrafjorden-artskart.json", "utf8"));
assert.equal(cards.length, 14);
assert.equal(new Set(cards.map(card => card.id)).size, 14);
assert.ok(cards.every(card => Number.isInteger(card.taxonomy.artskart_taxon_id)));
assert.ok(manifest.files.includes("marine_akrafjorden_batch_11.json"));
const place = map.places.akrafjorden;
assert.equal(place.published_species_batch, 11);
assert.equal(place.fauna.length, 225);
assert.equal(place.published_species_count, 225);
assert.equal(place.published_new_species_card_count, 214);
assert.equal(place.linked_existing_species_card_count, 11);
assert.equal(place.remaining_publishable_species_level_taxa_count, 0);
assert.equal(place.unreviewed_species_level_taxa_count, 0);
assert.equal(place.excluded_species_level_edge_taxa_count, 36);
assert.equal(place.unmatched_taxa_count, 0);
assert.equal(place.species_level_audit_complete, true);
assert.equal(new Set(place.fauna).size, place.fauna.length);
for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) { const source = audited.get(card.latin); assert.ok(source, card.latin); assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId)); assert.equal(source.rankAssessment.likelySpecies, true); }
console.log("Etne Åkrafjorden marine species batch 11 OK");
