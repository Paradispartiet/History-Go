#!/usr/bin/env node
const fs = require("node:fs");
const assert = require("node:assert/strict");
const cards = JSON.parse(fs.readFileSync("data/natur/fauna/marine_akrafjorden_batch_8.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("data/natur/fauna/manifest.json", "utf8"));
const map = JSON.parse(fs.readFileSync("data/natur/nature_etne_place_map.json", "utf8"));
const audit = JSON.parse(fs.readFileSync("reports/etne-natur-batch-9-akrafjorden-artskart.json", "utf8"));
assert.equal(cards.length, 20);
assert.equal(new Set(cards.map(card => card.id)).size, 20);
assert.ok(cards.every(card => Number.isInteger(card.taxonomy.artskart_taxon_id)));
assert.ok(manifest.files.includes("marine_akrafjorden_batch_8.json"));
const place = map.places.akrafjorden;
assert.ok(place.published_species_batch >= 8);
assert.ok(place.fauna.length >= 171);
assert.ok(place.published_species_count >= 171);
assert.ok(place.remaining_species_level_taxa_count <= 90);
assert.equal(place.excluded_higher_taxa_count, 99);
assert.equal(new Set(place.fauna).size, place.fauna.length);
const expectedEdgeTaxa = ["Motacilla cinerea","Turdus torquatus","Xanthoria aureola","Antitrichia curtipendula","Atriplex prostrata","Carex nigra subsp. nigra","Collema flaccidum","Collema subflaccidum","Corvus corax","Corvus corone subsp. cornix","Deilephila elpenor","Eleocharis quinqueflora","Equisetum sylvaticum","Filipendula ulmaria","Frullania fragilifolia","Frullania tamarisci","Fuscopannaria mediterranea","Gyalecta flotowii"];
assert.ok(expectedEdgeTaxa.every(taxon => place.excluded_species_level_edge_taxa.includes(taxon)));
for (const card of cards) assert.ok(place.fauna.includes(card.id), card.id);
const audited = new Map(audit.unmatchedTaxa.map(item => [item.scientificName, item]));
for (const card of cards) { const source = audited.get(card.latin); assert.ok(source, card.latin); assert.equal(card.taxonomy.artskart_taxon_id, Number(source.taxonId)); assert.equal(source.rankAssessment.likelySpecies, true); }
console.log("Etne Åkrafjorden marine species batch 8 OK");
