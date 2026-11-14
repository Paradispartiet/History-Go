#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const report=load("reports/place-production/tjuvholmen-people-illustration-visual-qa-20261113.json");
const manifest=load("reports/place-production/tjuvholmen-generated-people-illustration-candidates-20261112.json");
const runtime=load("data/runtime/place-open/tjuvholmen.json");
const workcard=load("reports/place-production/tjuvholmen-workcard-current.json");
assert.equal(report.place_id,"tjuvholmen");
assert.equal(report.result,"ONE_OF_THREE_ILLUSTRATIONS_EDITORIAL_USER_APPROVED_ONE_ACTIVE_TWO_HELD");
assert.equal(manifest.visual_qa_report,"reports/place-production/tjuvholmen-people-illustration-visual-qa-20261113.json");
assert.equal(report.entries.length,3);
assert.equal(report.publication_gates.v1_illustrations_approved,0);
assert.equal(report.publication_gates.new_v2_webps_committed,0);
assert.equal(report.publication_gates.place_card_illustrations_active,1);
assert.equal(report.publication_gates.vferdig,"BLOCKED");
assert.equal(workcard.vferdig.status,"BLOCKED");
assert.equal(manifest.committed_candidate_binary_count,3);
assert.equal(manifest.new_published_portrait_count,1);
assert.equal(report.rejected_other_candidate.status,"REJECTED_NEVER_COMMITTED");
const ids=["bjarne_melgaard","stephen_butkus","hans_rasmus_astrup"];
assert.deepEqual(report.entries.map(x=>x.person_id).sort(),ids.slice().sort());
for(const review of report.entries){
  const prior=manifest.people.find(x=>x.person_id===review.person_id);
  assert.ok(prior);
  assert.equal(prior.visual_qa_v1,review.v1_decision);
  assert.equal(prior.review_status,review.person_id==="bjarne_melgaard"?"V1_REJECTED_V3_USER_APPROVED_EDITORIAL_ACTIVE":"CANDIDATE_NOT_IDENTITY_APPROVED");
  assert.equal(review.v1_path,prior.staged_path);
  assert.ok(fs.existsSync(path.join(root,prior.staged_path)));
  const runtimePerson=runtime.people.find(x=>x.id===review.person_id);
  assert.ok(runtimePerson);
  if(review.person_id==="bjarne_melgaard") {
    assert.equal(runtimePerson.image,"bilder/kort/people/bjarne_melgaard_illustrasjon_v3.webp");
    assert.equal(runtimePerson.cardImage,runtimePerson.image);
    assert.equal(runtimePerson.imageMeta.assetKind,"illustration");
  } else {
    assert.equal(runtimePerson.image,"");
    assert.equal(runtimePerson.cardImage,"");
  }
}
const melgaard=report.entries.find(x=>x.person_id==="bjarne_melgaard");
assert.equal(melgaard.v1_decision,"REJECT_FOR_ACTIVE_PERSON_PORTRAIT");
assert.equal(melgaard.alternative.status,"NEW_LOCAL_V2_CANDIDATE_NOT_COMMITTED_NOT_IDENTITY_APPROVED");
assert.equal(melgaard.alternative.sha256,manifest.people.find(x=>x.person_id==="bjarne_melgaard").local_v2_candidate_not_committed.sha256);
assert.deepEqual(melgaard.alternative.dimensions,[900,1200]);
assert.equal(fs.existsSync(path.join(root,melgaard.alternative.expected_staged_path)),false,"Unapproved v2 must not be committed silently");
assert.deepEqual(runtime.place.place_card_profile.collection_ids,["people","brands","structures"]);
assert.equal(runtime.people.length,5);
assert.equal(runtime.brands.length,3);
assert.equal(runtime.place.structures.length,3);
console.log("TJUVHOLMEN_ILLUSTRATION_LIKENESS_QA_PASS: v1 held/rejected, Melgaard v3 user-approved editorial active, others held");
