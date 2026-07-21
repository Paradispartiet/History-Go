#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");

const cards = JSON.parse(fs.readFileSync("data/natur/fauna/marine_akrafjorden_batch_1.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("data/natur/fauna/manifest.json", "utf8"));
const map = JSON.parse(fs.readFileSync("data/natur/nature_etne_place_map.json", "utf8"));
const audit = JSON.parse(fs.readFileSync("reports/etne-natur-batch-9-akrafjorden-artskart.json", "utf8"));

assert.equal(cards.length, 20);
assert.equal(new Set(cards.map(card => card.id)).size, 20);
assert.ok(cards.every(card => Number.isInteger(card.taxonomy.artskart_taxon_id)));
assert.ok(cards.every(card => card.evidence.waterbody_code === "NO0260020600-C"));
assert.ok(manifest.files.includes("marine_akrafjorden_batch_1.json"));

const place = map.places.akrafjorden;
assert.ok(place);
assert.equal(place.analysis_scope, "exact_vann_nett_waterbody_polygon");
assert.equal(place.fauna.length, 31);
assert.equal(place.published_species_count, 31);
assert.equal(place.remaining_species_level_taxa_count, 230);
assert.equal(place.excluded_higher_taxa_count, 99);
assert.equal(new Set(place.fauna).size, place.fauna.length);

for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
for (const forbidden of ["emne_fauna_byfluer", "emne_kratt_einer", "emne_flora_parkslirekne", "emne_lav_ringlav"]) {
  assert.ok(!place.fauna.includes(forbidden), forbidden);
}

const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) {
  const source = audited.get(card.latin);
  assert.ok(source, card.latin);
  assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId));
}

console.log("Etne Åkrafjorden marine species batch 1 OK");
