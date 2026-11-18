import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root=process.cwd();
const json=(p)=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const staged=json("data/places/object-candidates/tjuvholmen.json");
const canonical=json("data/places/by/oslo/places/tjuvholmen.json");
const runtime=json("data/runtime/place-open/tjuvholmen.json");
const plan=json("reports/place-production/tjuvholmen-illustration-production-plan-20261117.json");

test("eight documented sculpture objects are live and use their original illustrations",()=>{
 assert.equal(staged.objects.length,8);
 assert.equal(canonical.objects.length,8);
 assert.equal(runtime.place.objects.length,8);
 assert.equal(plan.status.artwork_images_active,8);
 assert.deepEqual(canonical.place_card_profile.collection_ids,["people","objects","brands","structures"]);
 assert.deepEqual(runtime.place.place_card_profile.collection_ids,canonical.place_card_profile.collection_ids);
 const ids=new Set(),works=new Set();
 for(const o of canonical.objects){
  assert.equal(o.physicalObject,true);
  assert.equal(o.objectType,"public_sculpture");
  assert.equal(o.parentStructureId,"skulpturparken_skjaeret");
  assert.ok(o.artist&&o.title&&Number.isInteger(o.year));
  assert.ok(o.source_urls.length>=2);
  assert.ok(o.source_urls.every(url=>/^https:\/\//.test(url)));
  assert.ok(!ids.has(o.id)&&!works.has(o.artworkId));
  ids.add(o.id);works.add(o.artworkId);
  assert.equal(o.imageKind,"illustration");
  assert.equal(o.imageMeta.disclosure,"Illustrasjon – ikke fotografi");
  assert.ok(o.imageAlt.startsWith("Illustrasjon – ikke fotografi:"));
  assert.ok(o.image.startsWith("bilder/kort/objects/candidates/tjuvholmen/"));
  assert.ok(existsSync(resolve(root,o.image)),o.image);
  const member=plan.artwork_illustrations.find(x=>x.id===o.artworkId);
  assert.ok(member);
  assert.equal(member.repo_candidate_path,o.image);
  assert.equal(member.app_sha256,o.imageMeta.assetSha256);
  assert.equal(o.publication.active,true);
  assert.equal(o.publication.placeCardConnected,true);
  assert.equal(o.publication.artworkRightsReview,"USER_ASSERTED_PERMITTED_NOT_INDEPENDENTLY_VERIFIED");
  assert.equal(o.publication.commercialUseReviewed,false);
  const archive=staged.objects.find(x=>x.id===o.id);
  assert.ok(archive);
  assert.deepEqual(runtime.place.objects.find(x=>x.id===o.id),o);
 }
 assert.ok(canonical.structures.some(x=>x.id==="skulpturparken_skjaeret"));
});
test("existing Tjuvholmen collections, images and quiz remain",()=>{
 assert.ok(canonical.structures.length===3);
 assert.ok(canonical.image&&canonical.frontImage);
 assert.ok(canonical.quiz_profile);
 assert.ok(runtime.people.length>=5);
 assert.ok(runtime.brands.length>=3);
});
