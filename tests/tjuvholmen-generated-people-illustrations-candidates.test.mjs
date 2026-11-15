#!/usr/bin/env node
// Candidate-only gate: illustrated real people must not be silently activated as verified photos.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const manifest=read("reports/place-production/tjuvholmen-generated-people-illustration-candidates-20261112.json");
const audit=read("reports/place-production/tjuvholmen-people-portrait-rights-20261112.json");
const runtime=read("data/runtime/place-open/tjuvholmen.json");
const names=["bjarne_melgaard","stephen_butkus","hans_rasmus_astrup"];
assert.equal(manifest.place_id,"tjuvholmen");
assert.equal(manifest.asset_kind,"illustration");
assert.equal(manifest.visible_disclosure,"Illustrasjon");
assert.deepEqual(manifest.dimensions,[900,1200]);
assert.equal(manifest.status,"THREE_V1_CANDIDATES_QUARANTINED_THREE_EDITORIAL_ILLUSTRATIONS_ACTIVE");
assert.equal(manifest.committed_candidate_binary_count,3);
assert.equal(manifest.people.length,3);
assert.deepEqual(manifest.people.map(x=>x.person_id).sort(),names.slice().sort());
assert.equal(audit.illustration_alternative.approved_illustrations,3);
assert.equal(audit.illustration_alternative.media_paths_committed,6);
assert.equal(audit.illustration_alternative.active_published_illustrations,3);
assert.equal(audit.illustration_alternative.candidate_manifest,"reports/place-production/tjuvholmen-generated-people-illustration-candidates-20261112.json");
assert.equal(audit.approved.length,2);
assert.equal(audit.pending.length,3);
for(const entry of manifest.people){
 assert.equal(entry.review_status,entry.person_id==="bjarne_melgaard"?"V1_REJECTED_V3_USER_APPROVED_EDITORIAL_ACTIVE":"V1_HELD_V2_USER_APPROVED_EDITORIAL_ACTIVE");
 assert.match(entry.asset_sha256,/^[a-f0-9]{64}$/);
 assert.ok(entry.generation_id && entry.identity_note && entry.reference_urls.length>=1);
 assert.ok(entry.candidate_path.endsWith("_illustrasjon_v1.webp"));
 assert.ok(!fs.existsSync(path.join(root,entry.candidate_path)),"Active People portrait path must not be populated "+entry.person_id);
 assert.equal(entry.staged_path,`bilder/kort/people/candidates/tjuvholmen/${entry.person_id}_illustrasjon_v1.webp`);
 const buffer=fs.readFileSync(path.join(root,entry.staged_path));
 assert.equal(buffer.length,entry.staged_byte_count,"Byte count mismatch "+entry.person_id);
 assert.equal(crypto.createHash("sha256").update(buffer).digest("hex"),entry.asset_sha256,"Actual WebP SHA-256 mismatch "+entry.person_id);
 assert.equal(buffer.toString("ascii",0,4),"RIFF");
 assert.equal(buffer.toString("ascii",8,12),"WEBP");
 assert.equal(buffer.toString("ascii",12,16),"VP8 ");
 assert.equal(buffer.readUInt32LE(4)+8,buffer.length);
 assert.equal(buffer.readUInt8(23),0x9d);assert.equal(buffer.readUInt8(24),0x01);assert.equal(buffer.readUInt8(25),0x2a);
 assert.deepEqual([buffer.readUInt16LE(26)&0x3fff,buffer.readUInt16LE(28)&0x3fff],[900,1200]);
 assert.equal(manifest.new_published_portrait_count,3);
 const original=runtime.people.find(x=>x.id===entry.person_id);
 assert.ok(original);
 if (entry.person_id==="bjarne_melgaard") {
   assert.equal(original.image,"bilder/kort/people/bjarne_melgaard_illustrasjon_v3.webp");
   assert.equal(original.cardImage,original.image);
   assert.equal(original.imageMeta.assetKind,"illustration");
   const approved=fs.readFileSync(path.join(root,original.image));
   assert.equal(crypto.createHash("sha256").update(approved).digest("hex"),original.imageMeta.assetSha256);
 } else {
   const v2=entry.active_v2;
   assert.ok(v2,"Original v2 approval absent "+entry.person_id);
   assert.equal(original.image,v2.path);
   assert.equal(original.cardImage,original.image);
   assert.equal(original.imageMeta.assetKind,"illustration");
   assert.equal(original.imageMeta.visibleDisclosure,"Illustrasjon");
   assert.equal(original.imageMeta.assetSha256,v2.sha256);
   const active=fs.readFileSync(path.join(root,original.image));
   const candidate=fs.readFileSync(path.join(root,"bilder/kort/people/candidates/tjuvholmen/"+entry.person_id+"_illustrasjon_v2.webp"));
   assert.deepEqual(active,candidate,"Approved and source bytes differ "+entry.person_id);
   assert.equal(crypto.createHash("sha256").update(active).digest("hex"),v2.sha256);
   assert.equal(active.toString("ascii",0,4),"RIFF");
   assert.equal(active.toString("ascii",8,12),"WEBP");
   assert.deepEqual([active.readUInt16LE(26)&0x3fff,active.readUInt16LE(28)&0x3fff],[900,1200]);
 }
}
assert.equal(runtime.people.length,5);
assert.equal(runtime.brands.length,3);
assert.equal(runtime.place.structures.length,3);
assert.deepEqual(runtime.place.place_card_profile.collection_ids,["people","brands","structures"]);
console.log("TJUVHOLMEN_ORIGINAL_ILLUSTRATIONS_CANDIDATES_PASS: 3 v1 binaries quarantined, three distinct approved editorial illustrations active, authentic photos untouched");
