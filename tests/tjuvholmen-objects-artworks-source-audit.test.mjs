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
assert.equal(audit.classification_policy.entity_routing_decision.status,"CONDITIONAL_ROUTING_RESOLVED_NOT_PUBLISHED");
assert.equal(audit.classification_policy.entity_routing_decision.category,"by");
for(const w of items) {
 assert.equal(w.entity_routing.physical_installation,"BY_OBJECT_CANDIDATE_NOT_APPROVED");
 assert.equal(w.entity_routing.artwork_as_work,"PRODUCTIONS_LEVEL_CONCEPT_NOT_PLACE_CARD_SLOT");
 assert.equal(w.entity_routing.structure_relationship,"MEMBER_OF_EXISTING_SCULPTURE_PARK");
 assert.equal(w.entity_routing.image_clearance,"BLOCKED_BOTH_RIGHTS_LAYERS");
}
assert.equal(card.object_artwork_review.classification_status,"CONDITIONAL_BY_OBJECT_ROUTING_RESOLVED_RIGHTS_NOT_CLEARED");

const park=place.structures.find(x=>x.id==="skulpturparken_skjaeret");
const runtimePark=runtime.place.structures.find(x=>x.id==="skulpturparken_skjaeret");
assert.ok(park&&runtimePark);
assert.equal(runtimePark.desc,park.desc,"Park interpretive text must appear in PlaceCard runtime");
for(const title of ["Eyes","Edge II","Untitled (Totem)","White Snow Cake","MOONRISE. East. November.","Spalt","Things for a House on an Island"]) assert.ok(park.desc.includes(title), "Missing named work in park text: "+title);
assert.ok(park.desc.includes("Anish Kapoors Untitled (1997)"));
assert.ok(park.desc.includes("Selvaag Art Collection")&&park.desc.includes("Tjuvholmen KS"));
assert.ok(park.source_urls.includes("https://www.afmuseet.no/tjuvholmen-skulpturpark/"));
assert.equal(card.structure_asset_coverage.source_originals_archived,0,"No fake originals accepted after Wikimedia 429");
const eyes=items.find(x=>x.id==="louise_bourgeois_eyes");
assert.ok(eyes);
assert.equal(eyes.approved_year,1997);
assert.equal(eyes.year_resolution.status,"ACCEPTED_OWNER_PRIMARY_SOURCE");
assert.ok(eyes.year_resolution.owner_source.includes("selvaagartcollection.com"));
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
