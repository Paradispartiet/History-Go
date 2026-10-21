import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {validateRequest,validateCommons} from "../scripts/place-production/stage-dnt-object-image-c32.mjs";
const read=(p)=>JSON.parse(fs.readFileSync(p,"utf8"));
const q=read("reports/place-production/det-norske-teatret/20261020/object-image-intake-c32.json");
const reg=read("reports/place-production/det-norske-teatret/20261020/objects-c31-candidates.json");
const place=read("data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json");
const card=read("reports/place-production/det-norske-teatret-workcard-current.json");
// Historical C32 prepublication input: never relax the original fail-closed staging script.
const preC50Place={...place,objects:undefined};
test("C32 asset must remain a noncanonical source draft even when staged",()=>{
 assert.doesNotThrow(()=>validateRequest(q,reg,preC50Place));
 assert.throws(()=>validateRequest(q,reg,place),/renewed audit/);
 assert.equal(reg.counts.published_objects,0);
 assert.equal(card.collections.objects.status,"PASS");
 assert.equal(card.status,"in_progress");
 assert.equal(q.publication,"DRAFT_IMAGE_ONLY_CANONICAL_OBJECT_BLOCKED");
 if (fs.existsSync(q.image_path)) {
   const provenance=read("reports/place-production/det-norske-teatret/20261020/object-image-c32-generated.json");
   assert.equal(reg.counts.local_rights_checked_assets_staged,1);
   assert.equal(provenance.asset_path,q.image_path);
   assert.equal(provenance.license,q.license);
   assert.equal(provenance.candidate_id,q.candidate_id);
   assert.equal(provenance.status,"LOCAL_IMAGE_IN_DRAFT_NOT_CANONICAL");
 }
});
test("C32 image preflight rejects swapped content and rights",()=>{
 const page={title:q.file_title};
 const info={mime:"image/jpeg",width:900,height:1200,size:900000,url:"https://upload.wikimedia.org/wikipedia/commons/e/ee/costume.jpg",extmetadata:{LicenseShortName:{value:q.license},Artist:{value:"Lone Lunde"},ImageDescription:{value:"Ragnhild Hilt - Madame de Sade - TM.01641.A-C"}}};
 assert.doesNotThrow(()=>validateCommons(page,info,q));
 assert.throws(()=>validateRequest({...q,creator:"Unknown"},reg,preC50Place));
 assert.throws(()=>validateCommons({...page,title:"File:Other.jpg"},info,q));
 assert.throws(()=>validateCommons(page,{...info,extmetadata:{...info.extmetadata,LicenseShortName:{value:"no known copyright restrictions"}}},q));
 assert.throws(()=>validateCommons(page,{...info,url:"https://example.com/costume.jpg"},q));
 assert.doesNotThrow(()=>validateCommons(page,{...info,extmetadata:{LicenseShortName:{value:q.license},Artist:{value:"Lone Lunde"}}},q));
 assert.throws(()=>validateCommons(page,{...info,extmetadata:{...info.extmetadata,ImageDescription:{value:"Madame de Sade TM.09999.A-B"}}},q));
});
