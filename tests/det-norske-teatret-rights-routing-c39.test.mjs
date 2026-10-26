import assert from "node:assert/strict";import fs from "node:fs";import test from "node:test";
const load=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const a=load("reports/place-production/det-norske-teatret/20261020/objects-c39-rights-routing.json"),w=load("reports/place-production/det-norske-teatret-workcard-current.json"),o=load("reports/place-production/det-norske-teatret/20261020/objects-c31-candidates.json");
const letter=fs.readFileSync("reports/place-production/det-norske-teatret/20261020/objects-c39-rights-request-DRAFT.md","utf8");
test("C39 does not misattribute pre-1985 garments to present theatre house",()=>{
 assert.equal(a.place_id,"det_norske_teatret");assert.equal(a.audited_sources.length,6);
 for(const id of ["macbeth_cape_tm03210","king_lear_jacket_tm03050"]){const x=a.audited_sources.find(y=>y.id===id);assert.ok(x.production_year<1985);assert.equal(x.decision,"REJECT_NO_1985_HOUSE_PROVENANCE");}
 assert.equal(a.audited_sources.find(x=>x.id==="medmenneske_ensemble_1937").decision,"REJECT_NOT_PHYSICAL_OBJECT_AND_PRE_1985");
});
test("C39 permission request explicit, not sent",()=>{
 assert.equal(a.rights_policy.can_reuse_published_theatre_press_photos_without_permission,false);
 assert.equal(a.rights_policy.status,"DRAFT_NOT_SENT");
 assert.equal(a.rights_policy.archive_email,"arkivet@detnorsketeatret.no");
 assert.equal(a.rights_policy.press_email,"ida@detnorsketeatret.no");
 assert.match(letter,/IKKJE SENDT/);assert.match(letter,/skriftleg tillating/);
 assert.match(letter,/etter 1985/);assert.match(letter,/CC BY-SA 4\.0/);
});
test("C39 preserves canonical Objects blocker and first photo",()=>{
 assert.equal(a.count_cleared_independent_objects,1);assert.equal(a.published_objects,0);
 assert.equal(a.first_image.accession,"TM.01641.A-C");assert.equal(a.objects_status,"BLOCKED");
 assert.equal(o.counts.published_objects,0);assert.equal(o.counts.local_rights_checked_assets_staged,1);
 assert.equal(w.status,"in_progress");assert.equal(w.collections.objects.status,"PASS");
 assert.deepEqual(w.placecard_collections_publishable_now,["objects"]);
 assert.ok(w.checkpoints.some(x=>x.id==="second_object_rights_route_c39"));
});
