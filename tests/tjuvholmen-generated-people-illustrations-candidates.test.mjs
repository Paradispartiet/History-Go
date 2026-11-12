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
assert.equal(manifest.status,"THREE_LOCAL_WEBP_CANDIDATES_NOT_COMMITTED_NOT_ACTIVE");
assert.equal(manifest.people.length,3);
assert.deepEqual(manifest.people.map(x=>x.person_id).sort(),names.slice().sort());
assert.equal(audit.illustration_alternative.approved_illustrations,0);
assert.equal(audit.illustration_alternative.media_paths_committed,0);
assert.equal(audit.illustration_alternative.candidate_manifest,"reports/place-production/tjuvholmen-generated-people-illustration-candidates-20261112.json");
assert.equal(audit.approved.length,2);
assert.equal(audit.pending.length,3);
for(const entry of manifest.people){
 assert.equal(entry.review_status,"CANDIDATE_NOT_IDENTITY_APPROVED");
 assert.match(entry.asset_sha256,/^[a-f0-9]{64}$/);
 assert.ok(entry.generation_id && entry.identity_note && entry.reference_urls.length>=1);
 assert.ok(entry.candidate_path.endsWith("_illustrasjon_v1.webp"));
 assert.ok(!fs.existsSync(path.join(root,entry.candidate_path)),"File imported without candidate state transition "+entry.person_id);
 const original=runtime.people.find(x=>x.id===entry.person_id);
 assert.ok(original);
 assert.equal(original.image,"","Illustration must not silently replace identity-unverified image "+entry.person_id);
 assert.equal(original.cardImage,"","Illustration must not silently replace cardImage "+entry.person_id);
}
assert.equal(runtime.people.length,5);
assert.equal(runtime.brands.length,3);
assert.equal(runtime.place.structures.length,3);
assert.deepEqual(runtime.place.place_card_profile.collection_ids,["people","brands","structures"]);
console.log("TJUVHOLMEN_ORIGINAL_ILLUSTRATIONS_CANDIDATES_PASS 3 generated, 0 committed, 0 active");
