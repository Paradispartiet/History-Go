import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const review=JSON.parse(read("data/natur/flora/illustration-quality-batch06-20261028.json"));
const manifest=JSON.parse(read("data/natur/flora/illustration-candidates-batch06.json"));
const runtime=JSON.parse(read("data/runtime/nature-all.json"));
const catalog=runtime.groups.flora.flatMap(p=>JSON.parse(read(p))).flatMap(x=>x.kind==="emne_pack"?x.items:[x]);
const env={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env);
vm.runInNewContext(read("js/ui/nature-flora-photographs.js"),env);
const approved=env.window.HG_NATURE_FLORA_APPROVED;
assert.equal(review.batch,"06");
assert.equal(review.items.length,4);
assert.equal(manifest.items.length,4);
assert.equal(review.originalApprovedSpeciesCount,9);
assert.equal(review.approvedSpeciesCountAfterRelease,11);
assert.equal(approved.count,15);
const expected=[
  ["01_ryllik",null,"Achillea millefolium","needs_catalog_entry"],
  ["02_geitrams","emne_flora_geitrams","Chamerion angustifolium","approved"],
  ["03_groblad","emne_flora_groblad","Plantago major","approved"],
  ["04_tiriltunge","emne_flora_tiriltunge","Lotus corniculatus","needs_redraw"]
];
const seen=new Set();
for(const [key,id,latin,status] of expected){
  const x=review.items.find(a=>a.key===key), c=manifest.items.find(a=>a.key===key);
  assert(x&&c,"candidate missing: "+key);
  assert.equal(x.catalogId,id);assert.equal(c.catalogId,id);
  assert.equal(x.scientificName,latin);assert.equal(c.scientificName,latin);
  assert.equal(x.reviewStatus,status);assert.equal(c.reviewStatus,status);
  assert.equal(c.approvedForPublication,false,"inventory cannot publish a candidate");
  assert.equal(x.approvedForPublication,status==="approved");
  assert.equal(c.src,x.src);assert.equal(c.gitBlobSha,x.gitBlobSha);
  assert.equal(approved.get(id)?.src===x.src,x.approvedForPublication);
  if(id){assert.equal(catalog.find(a=>a.id===id)?.latin,latin);}
  else {assert(catalog.some(a=>a.id==="emne_flora_ryllik" && a.latin===latin),"batch 07 catalog entry missing");}
  if(x.approvedForPublication){
    assert.equal(x.botanicalVisualDecision,"passed");
    assert(env.window.HG_NATURE_FLORA_PHOTOS.get(id),"licensed photo reserve missing");
  }else{assert(x.requiredWork.length>=3,"held candidate needs concrete next steps");}
  assert(x.sourceReferences.length>=2 && x.sourceReferences.every(u=>u.startsWith("https://")));
  assert(x.observations.length>150 && x.limitations.length>30);
  assert(x.visualChecks.transparent && x.visualChecks.blackBackgroundReviewed && x.visualChecks.fullImageReviewed);
  assert.match(x.sourceSha256,/^[0-9a-f]{64}$/);assert.match(x.alphaSha256,/^[0-9a-f]{64}$/);
  const b=fs.readFileSync(new URL("../"+x.src,import.meta.url));
  assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
  assert.equal(b.toString("ascii",12,16),"VP8X");assert(b[20]&0x10,"alpha flag missing");
  assert.equal(b.length,x.sizeBytes);
  assert.deepEqual([1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)],[1024,1536]);
  assert.deepEqual(x.dimensions,[1024,1536]);assert.equal(x.alphaRange[0],0);assert(x.alphaRange[1]>=253);
  const sha=crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
  assert.equal(sha,x.gitBlobSha);assert.equal(crypto.createHash("sha256").update(b).digest("hex"),x.sha256);
  assert(!seen.has(sha));seen.add(sha);
  assert(read("flora-illustrasjoner-bolk06.html").includes(x.src));
}
assert(approved.has("emne_flora_tiriltunge"));
assert.notEqual(approved.get("emne_flora_tiriltunge").src,review.items.find(x=>x.key==="04_tiriltunge").src,"old rejected artwork must remain inactive");
assert(approved.has("emne_flora_ryllik"),"batch 07 must link to the new canonical ID");
assert(!approved.has("emne_flora_rodkløver"),"previous red-clover rejection must remain");
assert(read("flora-illustration-review.html").includes("flora-illustrasjoner-bolk06.html"));
assert(read(".github/workflows/nature-illustrations.yml").includes("node scripts/test-flora-art-candidates-batch06.mjs"));
console.log("Flora batch 06: four exact alpha WebP files, two originally accepted, yarrow linked by batch 07, trefoil rejected; 15 production approvals.");
