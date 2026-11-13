import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const review=JSON.parse(read("data/natur/fauna/illustration-quality-fiskemaake-20261113.json")),item=review.items[0];
const id="emne_fauna_fiskemaake",latin="Larus canus",quiz="quiz_fauna_fiskemaake";
assert.equal(review.speciesNumber,10);assert.equal(review.baselineApproved,9);assert.equal(review.approvedCountAfterRelease,10);
assert.equal(review.items.length,1);
assert.equal(item.catalogId,id);assert.equal(item.scientificName,latin);
assert.equal(item.family,"Laridae");assert.equal(item.existingQuizId,quiz);
assert.equal(item.reviewStatus,"approved");assert.equal(item.approvedForPublication,true);assert.equal(item.originalBinaryVerified,true);
assert(item.sourceReferences.length>=2);
for(const key of ["blackBackgroundReviewed","whiteBackgroundReviewed","trueAlphaWebP","fullImageReviewed","adultWhiteHeadUnderparts","mediumGreyMantle","blackWingtipsWhiteMirrors","slenderBillNoRedSpot","greenYellowLegsWebbedFeet","smallerLighterThanHerringGull","correctSpeciesNotHerringGull"])assert(item.visualChecks[key],key+" is required");
for(const path of ["data/natur/fauna/fugler_by.json","data/runtime/nature-all/fauna-001.json"]){
 const record=JSON.parse(read(path)).flatMap(x=>x.kind==="emne_pack"?x.items:[x]).find(x=>x.id===id);
 assert(record,"Fiskemåke in original source and runtime is required");
 assert.equal(record.title,"Fiskemåke");assert.equal(record.latin,latin);
 assert.equal(record.taxonomy?.latin_navn,latin);assert.equal(record.taxonomy?.familie,"Laridae");
 assert(record.quiz_ids?.includes(quiz));
}
const b=fs.readFileSync(new URL(item.src,root));
assert.equal(b.length,380846);assert.equal(item.sizeBytes,b.length);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"ee43e300a7036c7e1b13b73767128bd91054918f43147d76ef151db93ed8dd40");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"6a0895456fbd3d990c291b1c14f108b1695d0494");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0,"Transparent WebP is mandatory");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const env={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),env);
const reg=env.window.HG_NATURE_FAUNA_APPROVED;assert.equal(reg.count,10);
assert.equal(reg.get(id)?.src,item.src);assert.equal(reg.get(id)?.scientificName,latin);assert.equal(reg.get(id)?.gitBlobSha,item.gitBlobSha);
for(const [key,sha] of [
["emne_fauna_graamaake","775189e54b00b13a6859670401da027ebb766cc9"],
["emne_fauna_stokkand","b16e4e48f6264a0a318f2b20128bc8d2e559505c"],
["emne_fauna_ringdue","643eea93e2803fb1de8fcaaf6fba378aa7d61e74"],
["emne_fauna_kjottmeis","3cb439a66db0b59072f13413fd9d2b2c01e4d816"],
["emne_fauna_blaameis","038718c8ba46ee769d5c5cc76920229ed9d4171d"],
["emne_fauna_svarttrost","61278635c130708fda7e42c958576db5a98040e5"],
["emne_fauna_skjaere","e3da752bce1c4f637b80198559b805c98c1d82c7"],
["emne_fauna_kraake","efbf5b4d09143192cb5c7405e07f04eadd15f1a1"],
["emne_fauna_graaspurv","468b3c17af9a0b90aebe7ce1cdd6866f9224687f"]
])assert.equal(reg.get(key)?.gitBlobSha,sha,key+" original must remain byte-identical");
assert.equal(reg.get("emne_fauna_rodstrupe"),null,"Unapproved Rødstrupe keeps its own SVG");
assert(read("finn-fauna.html").includes("nature-fauna-approved.js?v=20261113-10"));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Fiskemåke")'));
assert(read("scripts/test-nature-illustrations.mjs").includes("330"));
console.log("Finn Fauna #10 Fiskemåke: correct species, binary hashes, ten original WebPs, all prior originals and quiz preserved.");
