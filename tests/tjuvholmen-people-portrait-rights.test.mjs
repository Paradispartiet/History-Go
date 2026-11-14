#!/usr/bin/env node
// Tjuvholmen People source and image-rights contract.
// Reject missing portrait paths and generic images represented as identifiable portraits.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const exists=file=>fs.existsSync(path.join(root,file));
const sha256=file=>crypto.createHash("sha256").update(fs.readFileSync(path.join(root,file))).digest("hex");
const audit=read("reports/place-production/tjuvholmen-people-portrait-rights-20261112.json");
const place=read("data/runtime/place-open/tjuvholmen.json");
const museum=read("data/runtime/place-open/astrup_fearnley.json");
const people=read("data/runtime/people-all.json").files.flatMap(read);
const sources=[
  read("data/people/kunst/oslo/people_kunst_oslo.json"),
  read("data/people/subkultur/oslo/people_subkultur_oslo.json"),
  read("data/people/filantroper/oslo/people_filantroper_oslo.json")
].flatMap(value=>Array.isArray(value)?value:(value.people||[]));

assert.equal(audit.place_id,"tjuvholmen");
assert.equal(audit.approved.length,2);
assert.equal(audit.pending.length,3);
assert.equal(place.people.length,5,"Five canonical People still connected");
assert.equal(place.brands.length,3,"Preserve three approved Brands");
assert.equal(place.place.structures.length,3,"Preserve three Structures");
assert.deepEqual(place.place.place_card_profile.collection_ids,["people","brands","structures"]);

const find=(rows,id)=>rows.find(row=>row.id===id);
for(const entry of audit.approved){
  const provenance=read(entry.provenance);
  assert.equal(provenance.personId,entry.person_id);
  assert.equal(provenance.reviewStatus,"manually_approved");
  assert.equal(provenance.license,entry.license);
  assert.ok(exists(provenance.path),"Approved photo missing "+entry.person_id);
  assert.equal(sha256(provenance.path),provenance.assetSha256,"Approved photo hash changed "+entry.person_id);
  assert.ok(exists(provenance.sourceLocalPath),"Original source missing "+entry.person_id);
  assert.equal(sha256(provenance.sourceLocalPath),provenance.sourceSha256);
  for(const registry of [people,place.people]){
    const item=find(registry,entry.person_id);
    assert.ok(item,"Missing approved Person "+entry.person_id);
    assert.equal(item.image,provenance.path,"Approved People source drift "+entry.person_id);
  }
}

for(const entry of audit.pending){
  assert.equal(entry.status,"PENDING");
  assert.equal(entry.current_image,"");
  for(const registry of [sources,people,place.people]){
    const item=find(registry,entry.person_id);
    assert.ok(item,"Missing Person "+entry.person_id);
    const image=entry.person_id==="bjarne_melgaard"?"bilder/kort/people/bjarne_melgaard_illustrasjon_v3.webp":`bilder/kort/people/${entry.person_id}_illustrasjon_v2.webp`;
    assert.equal(item.image,image,"Missing expected original illustration "+entry.person_id);
    assert.equal(item.cardImage,item.image);
    assert.equal(item.imageMeta.assetKind,"illustration");
    assert.equal(item.imageMeta.visibleDisclosure,"Illustrasjon");
    assert.equal(item.imageMeta.license,"user_authorized_history_go_publication_only");
    assert.ok(exists(item.image));
    assert.equal(sha256(item.image),item.imageMeta.assetSha256);
    assert.ok(!audit.approved.some(photo=>photo.person_id===entry.person_id),"Synthetic image must not be counted as licensed photo");
    assert.ok(item.name&&item.desc,"Text-only Person details lost "+entry.person_id);
  }
}
const astrup=find(museum.people,"hans_rasmus_astrup");
assert.ok(astrup,"Collector missing in museum runtime");
assert.equal(astrup.image,"bilder/kort/people/hans_rasmus_astrup_illustrasjon_v2.webp");
assert.equal(astrup.cardImage,astrup.image);
assert.equal(astrup.imageMeta.assetKind,"illustration");
assert.equal(audit.rights_clearance_status,"NO_PERMISSION_OBTAINED_NO_EXTERNAL_CONTACT_SENT");

console.log("TJUVHOLMEN_PEOPLE_IMAGE_RIGHTS_PASS: 2 licensed photos, 3 visible original editorial illustrations, original third-party photographic rights still pending");
