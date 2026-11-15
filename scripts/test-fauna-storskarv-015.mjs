import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const review=JSON.parse(read("data/natur/fauna/illustration-quality-storskarv-20261115.json")),item=review.items[0];
const id="emne_fauna_storskarv",latin="Phalacrocorax carbo",quiz="quiz_fauna_storskarv";
assert.equal(review.speciesNumber,15);assert.equal(review.phaseSpeciesNumber,5);
assert.equal(review.baselineApproved,14);assert.equal(review.approvedCountAfterRelease,15);
assert.equal(item.catalogId,id);assert.equal(item.scientificName,latin);assert.equal(item.family,"Phalacrocoracidae");
assert.equal(item.existingQuizId,quiz);assert.equal(item.reviewStatus,"approved");
assert.equal(item.approvedForPublication,true);assert.equal(item.originalBinaryVerified,true);
assert(item.sourceReferences.length>=2);
for(const k of ["blackBackgroundReviewed","whiteBackgroundReviewed","trueAlphaWebP","fullImageReviewed","adultDarkIridescentPlumage","adultLongNeck","adultStrongHookedBill","yellowGularSkin","brightBlueGreenIris","whiteHeadAndThighPatchesBreeding","wingsOpenDryingPose","webbedFeet","correctSpeciesNotEuropeanShag"])
 assert(item.visualChecks[k],k+" must be true");
for(const p of ["data/natur/fauna/fugler_vatmark_og_skog.json","data/runtime/nature-all/fauna-001.json"]){
 const rows=JSON.parse(read(p)).flatMap(z=>z.kind==="emne_pack"?z.items:[z]);
 const entry=rows.find(z=>z.id===id);assert(entry,"Storskarv species record missing");
 assert.equal(entry.title,"Storskarv");assert.equal(entry.latin,latin);
 assert.equal(entry.taxonomy?.latin_navn,latin);assert.equal(entry.taxonomy?.familie,"Phalacrocoracidae");
 assert(entry.quiz_ids?.includes(quiz));
}
const b=fs.readFileSync(new URL(item.src,root));
assert.equal(b.length,353572);assert.equal(item.sizeBytes,b.length);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"d60f057c1ffea5b47ea84166cd23c16f2694856ada7eecd4d2fdb26c007ef25a");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"9eff35583a3797062cb579e5e072de9736022ff4");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0,"WebP alpha required");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const sandbox={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),sandbox);
const reg=sandbox.window.HG_NATURE_FAUNA_APPROVED;assert(reg.count>=15,"Storskarv must remain approved after future species");
assert.equal(reg.get(id)?.src,item.src);assert.equal(reg.get(id)?.scientificName,latin);assert.equal(reg.get(id)?.gitBlobSha,item.gitBlobSha);
for(const [priorId,expected] of Object.entries({
emne_fauna_sothone:"b9bffe1eaed401a4e21fbe959f50464ac95bca57",
emne_fauna_toppand:"9069d83c932b0ae316f03b367b7f3ce95a1788b1",
emne_fauna_graagas:"63289e4f9134a0b0e959b52c59a543e85476f556",
emne_fauna_knoppsvane:"dc1692279b0c32f955dadd3a33a48faaf3615f9e"
}))assert.equal(reg.get(priorId)?.gitBlobSha,expected,"previous approved originals remain untouched");
assert(/nature-fauna-approved\.js\?v=\d{8}-\d{2}/.test(read("finn-fauna.html")));
assert(read(".github/workflows/fauna-illustrations.yml").includes("scripts/test-fauna-storskarv-015.mjs"));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Storskarv")'));
assert(read("scripts/test-nature-illustrations.mjs").includes("330"));
console.log("Finn Fauna #15 Storskarv: WebP alpha, integrity, species identity, quiz and earlier approved originals preserved.");
