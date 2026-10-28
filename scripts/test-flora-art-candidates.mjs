import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";

const read=path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");
const binary=path=>fs.readFileSync(new URL("../"+path,import.meta.url));
const manifest=JSON.parse(read("data/natur/flora/illustration-candidates-batch01.json"));
assert.equal(manifest.schema,"history-go-flora-art-candidates-v1");
assert.equal(manifest.items.length,15);
const unique=new Set(), ids=new Set();
const manifestPaths=JSON.parse(read("data/runtime/nature-all.json")).groups.flora;
const all=manifestPaths.flatMap(path=>JSON.parse(read(path)))
 .flatMap(x=>x.kind==="emne_pack"?x.items:[x]);
const byId=new Map(all.map(x=>[String(x.id),x]));
let linked=0,uncertain=0;
for(const x of manifest.items){
 assert(!unique.has(x.src),"duplicate image path");
 unique.add(x.src);
 assert.match(x.src,/^bilder\/natur\/flora\/illustrasjonskandidater\/b01\/[a-z0-9_]+\.webp$/);
 assert.equal(x.approvedForPublication,false,"no automatic image approvals");
 assert.equal(x.transparent,true);
 assert(["needs_species_review","taxon_uncertain"].includes(x.reviewStatus));
 const buffer=binary(x.src);
 assert(buffer.length>15000&&buffer.length<100000,"unexpected file size: "+x.src);
 assert.equal(buffer.toString("ascii",0,4),"RIFF",x.src);
 assert.equal(buffer.toString("ascii",8,12),"WEBP",x.src);
 assert.equal(buffer.toString("ascii",12,16),"VP8X",x.src+" must be extended WebP");
 assert((buffer[20]&0x10)!==0,x.src+" has no alpha channel");
 const digest=createHash("sha1").update(Buffer.concat([Buffer.from("blob "+buffer.length+"\0"),buffer])).digest("hex");
 assert.equal(digest,x.gitBlobSha,"image differs from recorded source: "+x.src);
 if(x.catalogId){
  linked++;assert(!ids.has(x.catalogId),"duplicate catalog ID");
  ids.add(x.catalogId);
  assert(byId.has(x.catalogId),"unrecognized flora catalog ID");
  assert.equal(byId.get(x.catalogId).latin,x.scientificName,"scientific name mismatch");
 }else {
  assert(!ids.has(x.key));
 }
 if(x.reviewStatus==="taxon_uncertain")uncertain++;
}
assert.equal(linked,7);
assert.equal(uncertain,3);
const gallery=read("flora-illustrasjoner-bolk01.html");
for(const x of manifest.items)assert(gallery.includes(x.src),"candidate not shown: "+x.src);
assert(gallery.includes("ikke botanisk godkjent"),"gallery must state approval limit");
const review=read("js/ui/flora-illustration-review.js");
assert(review.includes('newCandidates = new Map()'));
assert(review.includes('candidate.approvedForPublication===false'));
assert(review.includes('for (const batch of ["01","02","03","04","05"])'),"all photo candidates batches must be included");
assert(review.includes('fetch("data/natur/flora/illustration-candidates-batch"+batch+".json")'),
  "all candidate manifests must be fetched through the current loader");
assert(review.includes('newCandidates.get(id)'),"candidate comparison absent");
assert(read("flora-illustration-review.html").includes("flora-illustrasjoner-bolk01.html"));
const front=read("finn-flora.html"), explorer=read("js/ui/nature-explorer.js");
assert(!front.includes("illustrasjonskandidater")&&!front.includes("illustration-candidates-batch01"),"candidates exposed on production flora");
assert(explorer.includes('window.HG_NATURE_FLORA_APPROVED'), 'release registry must prevent unreviewed SVGs');
assert(!explorer.includes("newCandidates"),"unapproved art must not reach live cards");
console.log("Flora candidate assets: 15 valid transparent WebP files, 7 catalog-linked for review, 3 uncertain; 0 published.");
