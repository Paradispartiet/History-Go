import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {validateRequest,validateCommons} from "../scripts/place-production/stage-dnt-object-image-c32.mjs";
const read=(p)=>JSON.parse(fs.readFileSync(p,"utf8"));
const q=read("reports/place-production/det-norske-teatret/20261020/object-image-intake-c32.json");
const reg=read("reports/place-production/det-norske-teatret/20261020/objects-c31-candidates.json");
const place=read("data/places/scenekunst/oslo/places_scenekunst/det_norske_teatret.json");
const card=read("reports/place-production/det-norske-teatret-workcard-current.json");
test("C32 request only stages a local costume image in a draft PR",()=>{
 assert.doesNotThrow(()=>validateRequest(q,reg,place));
 assert.equal(reg.counts.published_objects,0);
 assert.equal(card.collections.objects.status,"BLOCKED");
 assert.equal(card.status,"in_progress");
 assert.equal(q.publication,"DRAFT_IMAGE_ONLY_CANONICAL_OBJECT_BLOCKED");
 assert.ok(!fs.existsSync(q.image_path),"Local media must not be part of the source request PR");
});
test("C32 image preflight rejects swapped content and rights",()=>{
 const page={title:q.file_title};
 const info={mime:"image/jpeg",width:900,height:1200,size:900000,url:"https://upload.wikimedia.org/wikipedia/commons/e/ee/costume.jpg",extmetadata:{LicenseShortName:{value:q.license},Artist:{value:"Lone Lunde"},ImageDescription:{value:"Ragnhild Hilt - Madame de Sade - TM.01641.A-C"}}};
 assert.doesNotThrow(()=>validateCommons(page,info,q));
 assert.throws(()=>validateRequest({...q,creator:"Unknown"},reg,place));
 assert.throws(()=>validateCommons({...page,title:"File:Other.jpg"},info,q));
 assert.throws(()=>validateCommons(page,{...info,extmetadata:{...info.extmetadata,LicenseShortName:{value:"no known copyright restrictions"}}},q));
 assert.throws(()=>validateCommons(page,{...info,url:"https://example.com/costume.jpg"},q));
 assert.throws(()=>validateCommons(page,{...info,extmetadata:{...info.extmetadata,ImageDescription:{value:"another theatre"}}},q));
});
