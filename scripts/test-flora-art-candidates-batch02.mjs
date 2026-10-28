import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
const read=path=>fs.readFileSync(new URL("../"+path,import.meta.url),"utf8");
const readBytes=path=>fs.readFileSync(new URL("../"+path,import.meta.url));
const manifest=JSON.parse(read("data/natur/flora/illustration-candidates-batch02.json"));
assert.equal(manifest.batch,"02");
assert.equal(manifest.items.length,2);
const catalog=JSON.parse(read("data/runtime/nature-all/flora-001.json"))
  .flatMap(x=>x.kind==="emne_pack"?x.items:[x]);
const used=new Set();
for(const p of manifest.items){
 assert.equal(p.approvedForPublication,false,"a candidate cannot override an artsfoto");
 assert.equal(p.transparent,true);
 assert(["needs_species_review","needs_redraw"].includes(p.reviewStatus));
 assert(p.issues.length>=24,"missing botanical quality finding");
 assert(p.botanicalReferenceUrl.startsWith("https://"),"missing botanical reference");
 assert(!used.has(p.catalogId),"duplicate species");used.add(p.catalogId);
 const entry=catalog.find(c=>c.id===p.catalogId);
 assert(entry,"unknown catalog id: "+p.catalogId);
 assert.equal(entry.latin,p.scientificName);
 assert.match(p.src,/^bilder\/natur\/flora\/illustrasjonskandidater\/b02\/\d{2}_[a-z]+\.webp$/);
 const bin=readBytes(p.src);
 assert(bin.length>20000 && bin.length<800000,"unexpected image size");
 assert.equal(bin.toString("ascii",0,4),"RIFF","not a RIFF image");
 assert.equal(bin.toString("ascii",8,12),"WEBP","not WebP");
 assert.equal(bin.toString("ascii",12,16),"VP8X","not extended WebP");
 assert((bin[20]&0x10)!==0,"image missing alpha channel");
 const sha=crypto.createHash("sha1")
  .update(Buffer.concat([Buffer.from("blob "+bin.length+"\0"),bin])).digest("hex");
 assert.equal(sha,p.gitBlobSha,"file changed after reviewed upload");
 const gallery=read("flora-illustrasjoner-bolk02.html");
 assert(gallery.includes(p.src),"missing image on review gallery");
 assert(gallery.includes(p.issues),"missing QA finding on gallery");
}
assert.equal(manifest.items.find(p=>p.catalogId==="emne_flora_ballblom")?.reviewStatus,"needs_redraw",
 "globeflower morphology warning must survive");
const js=read("js/ui/flora-illustration-review.js");
assert(js.includes('["01","02"]'),"new batch missing in review gallery");
assert(js.includes('candidate.approvedForPublication===false'),"review gate disabled");
const explorer=read("js/ui/nature-explorer.js");
const app=read("finn-flora.html");
assert.match(explorer,/const approvedFloraIllustrations = new Set\(\);/,"unapproved art accidentally enabled");
assert(!app.includes("illustrasjonskandidater/b02/"),"candidate leaked into app");
console.log("Flora candidate batch 02: 2 alpha WebP assets, botanical QA flags and photo-only production gate valid.");
