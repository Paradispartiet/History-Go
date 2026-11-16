#!/usr/bin/env node
// One targeted acceptance contract for Tjuvholmen's already published collections.
// Archive and copyrighted sculpture-asset gates are intentionally NOT waived.
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
const load=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const card=load("reports/place-production/tjuvholmen-workcard-current.json");
const audit=load("reports/place-production/tjuvholmen-final-acceptance-20261116.json");
const media=load("reports/place-production/tjuvholmen-structures-source-candidates-20261112.json");
const oldReview=load("reports/place-production/tjuvholmen-source-review-20261112.json");
const sculptures=load("reports/place-production/tjuvholmen-objects-artworks-audit-20261112.json");
const rt=load("data/runtime/place-open/tjuvholmen.json");
assert.equal(card.place_id,"tjuvholmen");
assert.equal(audit.place_id,"tjuvholmen");
assert.equal(audit.formal_vferdig,"BLOCKED");
assert.equal(card.vferdig.status,"BLOCKED");
assert.equal(card.current_acceptance.status,"PUBLISHED_CONTENT_ACCEPTED_FORMAL_VFERDIG_BLOCKED");
assert.equal(card.people_portrait_coverage.pass,5);
assert.equal(card.people_portrait_coverage.blocked,0);
assert.equal(card.people_portrait_coverage.authentic_licensed_photos,2);
assert.equal(card.people_portrait_coverage.original_labeled_illustrations,3);
assert.equal(card.people_illustration_candidates.active_illustrations,3);
assert.equal(rt.people.length,5);
let photos=0, illustrations=0;
for(const p of rt.people) {
  assert.ok(p.image && fs.existsSync(p.image),"Missing published People image for "+p.id);
  assert.equal(sha(p.image),p.imageMeta?.assetSha256,"People SHA mismatch: "+p.id);
  if(p.imageMeta.assetKind==="illustration") {
    illustrations++;
    assert.equal(p.imageMeta.visibleDisclosure,"Illustrasjon");
  } else {
    photos++;
    assert.ok(/^CC BY/.test(p.imageMeta.license));
  }
}
assert.equal(photos,2);
assert.equal(illustrations,3);
assert.deepEqual(rt.place.place_card_profile.collection_ids,["people","brands","structures"]);
assert.equal(rt.brands.length,3);
assert.equal(rt.place.structures.length,3);
assert.equal(rt.stories.length,2);
assert.equal(media.candidates.length,3);
assert.equal(media.published_status.approved_preview_source_files,3);
assert.equal(media.published_status.full_originals_archived,0);
for(const candidate of media.candidates) {
  const structure=rt.place.structures.find(x=>x.id===candidate.id);
  assert.ok(structure,"Missing runtime Structure: "+candidate.id);
  assert.equal(sha(candidate.source_local_path),candidate.photo_sha256,"Source PREVIEW SHA mismatch "+candidate.id);
  assert.equal(sha(candidate.planned_asset),candidate.webp_sha256,"WebP SHA mismatch "+candidate.id);
  assert.equal(structure.image,candidate.planned_asset);
  assert.equal(structure.imageMeta.creator,candidate.photo_creator);
  assert.equal(structure.imageMeta.sourceIsFullOriginal,false);
  assert.equal(structure.imageMeta.fullResolutionOriginalPending,true);
  assert.equal(candidate.original_file_pending,true);
  assert.equal(structure.imageMeta.license,"CC BY-SA 3.0");
}
assert.equal(oldReview.current_release_snapshot.people.active_total,5);
assert.equal(oldReview.current_release_snapshot.people.text_only,0);
assert.equal(sculptures.artwork_candidates.length,8);
assert.equal(card.object_artwork_review.objectsActivated,0);
assert.equal((rt.place.objects||[]).length,0);
assert.equal(audit.approved.artwork_reference.documented_titles,8);
assert.equal(audit.blocked_external_gates.length,2);
assert.equal(audit.blocked_external_gates[0].archived,0);
assert.equal(audit.blocked_external_gates[1].approved,0);
console.log("TJUVHOLMEN_FINAL_PUBLISHED_ACCEPTANCE_PASS: People 5/5, Brands 3/3, Structures 3/3 source-preview, Stories 2, sculpture rights+full originals BLOCKED (not waived).");
