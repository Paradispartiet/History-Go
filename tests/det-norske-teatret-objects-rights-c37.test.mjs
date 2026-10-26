import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const objects=read("reports/place-production/det-norske-teatret/20261020/objects-c31-candidates.json");
const w=read("reports/place-production/det-norske-teatret-workcard-current.json");
const r=read("reports/place-production/det-norske-teatret/20261020/objects-c37-rights-adjudication.json");
test("C37 different exact physical objects are evaluated without false photo rights",()=>{
 assert.equal(r.place_id,"det_norske_teatret");
 assert.equal(objects.candidates.length,3);
 assert.equal(r.evaluated.length,3);
 assert.equal(new Set(r.evaluated.map(x=>x.object_id)).size,3);
 const hulda=objects.candidates.find(x=>x.id==="dnt_hulda_garborg_bunad_foyer");
 const dress=objects.candidates.find(x=>x.id==="dnt_juleroser_walstad_dress");
 assert.ok(hulda.sources.includes("https://www.huldabunader.no/pages/hulda-garborg"));
 assert.equal(hulda.site_evidence_c37.status,"TWO_SOURCE_REPORTED_DISPLAY_NOT_CURRENT_INVENTORY");
 assert.equal(hulda.rights.negative_image_check_c37.decision,"DO_NOT_USE_AS_OBJECT_MEMBER_IMAGE");
 assert.equal(dress.rights.license_search_c37.status,"NO_OPEN_LICENSE_VERIFIED");
 assert.match(dress.site_evidence_c37.distinction,/not Hulda Garborg/);
 for(const candidate of objects.candidates){
   assert.equal(candidate.publication_status,"BLOCKED");
   assert.equal(candidate.rights.distinct_physical_objects,1);
 }
});
test("C37 no false PlaceCard Objects publishing or invented local photo",()=>{
 assert.equal(r.publication_decision,"KEEP_OBJECTS_BLOCKED_NO_PREVIEW_NO_PLACE_CLOSEOUT");
 assert.equal(r.current_counts.rights_cleared_second_distinct_object,0);
 assert.equal(objects.counts.source_images_cleared_cc,1);
 assert.equal(objects.counts.local_rights_checked_assets_staged,1);
 assert.equal(objects.counts.local_member_images_published,0);
 assert.equal(objects.counts.published_objects,0);
 assert.equal(w.status,"in_progress");
 assert.equal(w.collections.objects.status,"PASS");
 assert.deepEqual(w.placecard_collections_publishable_now,["objects"]);
 assert.equal(w.manual_reviews.final_ui.status,"PENDING");
 assert.ok(w.checkpoints.some(x=>x.id==="objects_second_source_and_photo_rights_c37"));
});
