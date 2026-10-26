import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const load = path => JSON.parse(fs.readFileSync(path, "utf8"));
const objects=load("reports/place-production/det-norske-teatret/20261020/objects-c31-candidates.json");
const portraits=load("reports/place-production/det-norske-teatret/20261020/portrait-rights-c31.json");
const card=load("reports/place-production/det-norske-teatret-workcard-current.json");
test("DNT C31 object candidates are three physical identities, not publication", () => {
 assert.equal(objects.place_id,"det_norske_teatret");
 assert.equal(objects.candidates.length,3);
 assert.equal(new Set(objects.candidates.map(x=>x.id)).size,3);
 assert.equal(objects.counts.source_images_cleared_cc,1);
 assert.equal(objects.counts.local_member_images_published,0);
 assert.equal(objects.counts.published_objects,0);
 for(const x of objects.candidates){assert.equal(x.publication_status,"BLOCKED",x.id);assert.equal(x.rights.distinct_physical_objects,1,x.id);assert.ok(x.site_relation && x.sources.length && x.blockers.length,x.id);}
 const mm=objects.candidates.find(x=>x.id==="dnt_costume_madame_de_sade_1989_tm01641");
 assert.equal(mm.museum_accession,"TM.01641.A-C");
 assert.equal(mm.historical_date,"1989-01-05");
 assert.equal(mm.physical_stage,"Scene 2");
 assert.equal(mm.rights.license,"CC BY-SA 4.0");
 assert.equal(mm.rights.source_pages.length,2);
 for(const x of objects.excluded_previous_venue_examples)assert.ok(x.year<1985);
 assert.equal(card.collections.objects.status,"PASS");
 assert.deepEqual(card.placecard_collections_publishable_now,["objects"]);
 assert.equal(card.status,"in_progress");
});
test("C31 people source rights findings do not bypass canonical C29 portrait hold",()=>{
 assert.equal(portraits.source_leads.length,2);
 assert.equal(portraits.current_published,57);
 assert.equal(portraits.remaining,30);
 assert.deepEqual(portraits.source_leads.map(p=>p.person_id).sort(),["ola_b_johannessen","rolf_just_nilsen"]);
 const rolf=portraits.source_leads.find(p=>p.person_id==="rolf_just_nilsen");
 assert.match(rolf.commons_rights,/no_known_copyright_restrictions/);
 assert.equal(rolf.alternate_license_claim.license,"CC BY-SA 4.0");
 assert.match(rolf.decision,/DO_NOT_REWRITE_COMMONS_NKNCR_AS_CC/);
 const ola=portraits.source_leads.find(p=>p.person_id==="ola_b_johannessen");
 assert.equal(ola.size.width,252);
 assert.equal(ola.license,"CC BY-SA 4.0");
 assert.equal(card.collections.people.portraits_published_count,57);
 assert.equal(card.collections.people.portraits_remaining_count,30);
 assert.equal(card.collections.people.status,"BLOCKED");
 assert.equal(card.manual_reviews.final_ui.status,"PENDING");
 assert.ok(card.checkpoints.some(c=>c.id==="objects_and_portraits_source_rights_c31"));
});
