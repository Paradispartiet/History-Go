#!/usr/bin/env node
// Source-backed Tjuvholmen sculpture works: no unlicensed photos or filler Objects.
import assert from "node:assert/strict";
import fs from "node:fs";
const read = p => JSON.parse(fs.readFileSync(p, "utf8"));
const audit=read("reports/place-production/tjuvholmen-objects-artworks-audit-20261112.json");
const place=read("data/places/by/oslo/places/tjuvholmen.json");
const runtime=read("data/runtime/place-open/tjuvholmen.json");
const card=read("reports/place-production/tjuvholmen-workcard-current.json");
const review=read("reports/place-production/tjuvholmen-source-review-20261112.json");
const items=audit.artwork_candidates;
assert.equal(audit.place_id,"tjuvholmen");
assert.equal(audit.parent_structure_id,"skulpturparken_skjaeret");
assert.equal(items.length,8);
assert.equal(new Set(items.map(w=>w.id)).size,8,"No duplicate works");
assert.deepEqual(items.reduce((x,w)=>(x[w.owner]=(x[w.owner]||0)+1,x),{}),
 {selvaag_art_collection:6,tjuvholmen_ks:2});
assert.deepEqual(items.filter(x=>x.owner==="tjuvholmen_ks").map(x=>x.id).sort(),
 ["ellsworth_kelly_untitled_totem","fischli_weiss_things_for_house_on_island"]);
for(const w of items) {
 assert.ok(w.title&&w.artist&&w.physical_artwork);
 assert.equal(w.artwork_rights_status,"NOT_CLEARED");
 assert.equal(w.photo_rights_status,"NO_IDENTIFIED_LICENSED_SINGLE_ARTWORK_PHOTOGRAPH");
 assert.equal(w.production_status,"RESEARCH_ONLY_NOT_IN_CANONICAL_OBJECTS_OR_PLACE_OPEN");
 assert.equal(w.image,null,"Do not mistake a website preview for a license");
 assert.equal(w.photo_source,null);
 assert.ok(w.source_urls.some(x=>x.startsWith("https://www.afmuseet.no/")));
 assert.ok(!w.approved_year || Number.isInteger(w.approved_year));
}
const eyes=items.find(x=>x.id==="louise_bourgeois_eyes");
assert.ok(eyes);
assert.equal(eyes.approved_year,null);
assert.deepEqual(eyes.reported_years,["1992","1997"]);
assert.ok(audit.image_rights.legal_source_url.includes("lovdata.no"));
assert.equal(audit.image_rights.decision,"NO_BINARY_IMPORT_FROM_UNLICENSED_WORK_PHOTOS");
assert.equal((place.objects||[]).length,0,"No fake Objects in canonical place");
assert.equal((runtime.place.objects||[]).length,0,"No fake Objects in runtime");
assert.deepEqual(place.place_card_profile.collection_ids,["people","brands","structures"]);
assert.deepEqual(runtime.place.place_card_profile.collection_ids,["people","brands","structures"]);
assert.equal(runtime.brands.length,3);
assert.equal(runtime.place.structures.length,3);
assert.equal(runtime.people.length,5);
assert.equal(card.object_artwork_review.candidates,8);
assert.equal(card.object_artwork_review.objectsActivated,0);
assert.equal(review.collection_review.objects.count,8);
assert.equal(card.vferdig.status,"BLOCKED");
console.log("TJUVHOLMEN_SCULPTURE_SOURCE_AUDIT_PASS eight documented works, zero unlicensed images, no fake Objects");
