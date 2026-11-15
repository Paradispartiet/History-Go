import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const review=JSON.parse(read("data/natur/fauna/illustration-quality-hettemaake-20261115.json")),item=review.items[0];
const id="emne_fauna_hettemaake",latin="Chroicocephalus ridibundus",quiz="quiz_fauna_hettemaake";
assert.equal(review.speciesNumber,16);assert.equal(review.phaseSpeciesNumber,6);
assert.equal(review.baselineApproved,15);assert.equal(review.approvedCountAfterRelease,16);
assert.equal(item.catalogId,id);assert.equal(item.scientificName,latin);assert.equal(item.family,"Laridae");
assert.equal(item.existingQuizId,quiz);assert.equal(item.reviewStatus,"approved");
assert.equal(item.approvedForPublication,true);assert.equal(item.originalBinaryVerified,true);
assert(item.sourceReferences.length>=2);
for(const k of ["blackBackgroundReviewed","whiteBackgroundReviewed","trueAlphaWebP","fullImageReviewed","adultChocolateBrownNotBlackHood","whiteEyeCrescents","redBill","redLegs","whiteBody","paleGreyUpperwings","blackPrimariesWithWhiteWingEdging","adultStandingAndInFlight","correctSpeciesNotCommonGull"])
 assert(item.visualChecks[k],k+" must be true");
for(const p of ["data/natur/fauna/fugler_vatmark_og_skog.json","data/runtime/nature-all/fauna-001.json"]){
 const rows=JSON.parse(read(p)).flatMap(z=>z.kind==="emne_pack"?z.items:[z]);
 const entry=rows.find(z=>z.id===id);assert(entry,"Hettemåke species missing in "+p);
 assert.equal(entry.title,"Hettemåke");assert.equal(entry.latin,latin);
 assert.equal(entry.taxonomy?.latin_navn,latin);assert.equal(entry.taxonomy?.familie,"Laridae");
 assert(entry.quiz_ids?.includes(quiz),"Existing quiz ID must be preserved");
}
const b=fs.readFileSync(new URL(item.src,root));
assert.equal(b.length,232722);assert.equal(item.sizeBytes,b.length);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"4d97b54144e6f694701d32d62e39edbfbe952db4aedd3e534174974c73b1550d");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"111882da9a8bf94e18f8eb942901cdfa7c5faef0");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0,"WebP transparency required");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const sandbox={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),sandbox);
const reg=sandbox.window.HG_NATURE_FAUNA_APPROVED;assert.equal(reg.count,16);
assert.equal(reg.get(id)?.src,item.src);assert.equal(reg.get(id)?.scientificName,latin);assert.equal(reg.get(id)?.gitBlobSha,item.gitBlobSha);
for(const [priorId,expected] of Object.entries({
 emne_fauna_storskarv:"9eff35583a3797062cb579e5e072de9736022ff4",
 emne_fauna_sothone:"b9bffe1eaed401a4e21fbe959f50464ac95bca57",
 emne_fauna_toppand:"9069d83c932b0ae316f03b367b7f3ce95a1788b1",
 emne_fauna_graagas:"63289e4f9134a0b0e959b52c59a543e85476f556"
}))assert.equal(reg.get(priorId)?.gitBlobSha,expected,"Earlier fauna original must be preserved");
assert(read("finn-fauna.html").includes("nature-fauna-approved.js?v=20261115-16"));
assert(read(".github/workflows/fauna-illustrations.yml").includes("scripts/test-fauna-hettemaake-016.mjs"));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Hettemåke")'));
assert(read("scripts/test-nature-illustrations.mjs").includes("330"));
console.log("Finn Fauna #16 Hettemåke: original alpha WebP, species, quiz and earlier originals preserved.");
