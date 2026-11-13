import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const q=JSON.parse(read("data/natur/fauna/illustration-quality-graamaake-20261113.json")),a=q.items[0];
const id="emne_fauna_graamaake",latin="Larus argentatus",quiz="quiz_fauna_graamaake";
assert.equal(q.speciesNumber,9);assert.equal(q.baselineApproved,8);assert.equal(q.approvedCountAfterRelease,9);
assert.equal(q.items.length,1);assert.equal(a.catalogId,id);assert.equal(a.scientificName,latin);
assert.equal(a.family,"Laridae");assert.equal(a.existingQuizId,quiz);
assert.equal(a.reviewStatus,"approved");assert.equal(a.approvedForPublication,true);assert.equal(a.originalBinaryVerified,true);
assert(a.sourceReferences.length>=2);
for(const key of ["blackBackgroundReviewed","whiteBackgroundReviewed","trueAlphaWebP","fullImageReviewed","adultWhiteHeadUnderparts","paleGreyBack","blackWingtipsWhiteMirrors","yellowBillRedSpot","fleshPinkLegsWebbedFeet","correctSpeciesNotCommonGull"])assert(a.visualChecks[key],key+" required");
for(const p of ["data/natur/fauna/fugler_by.json","data/runtime/nature-all/fauna-001.json"]){
 const x=JSON.parse(read(p)).flatMap(v=>v.kind==="emne_pack"?v.items:[v]).find(v=>v.id===id);
 assert(x,"Existing Gråmåke species/runtime record required");
 assert.equal(x.title,"Gråmåke");assert.equal(x.latin,latin);
 assert.equal(x.taxonomy?.latin_navn,latin);assert.equal(x.taxonomy?.familie,"Laridae");
 assert(x.quiz_ids?.includes(quiz));
}
const b=fs.readFileSync(new URL(a.src,root));
assert.equal(b.length,414528);assert.equal(b.length,a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"6c8f22012375afad09a41ded9c64488f7ede8b16d4a72d03a019cd8e44b35b44");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"775189e54b00b13a6859670401da027ebb766cc9");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0,"Transparent WebP required");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const env={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),env);
const reg=env.window.HG_NATURE_FAUNA_APPROVED;assert(reg.count>=9,"Gråmåke and all previous birds must remain available");
assert.equal(reg.get(id)?.src,a.src);assert.equal(reg.get(id)?.scientificName,latin);assert.equal(reg.get(id)?.gitBlobSha,a.gitBlobSha);
for(const [p,sha] of [
 ["emne_fauna_stokkand","b16e4e48f6264a0a318f2b20128bc8d2e559505c"],
 ["emne_fauna_ringdue","643eea93e2803fb1de8fcaaf6fba378aa7d61e74"],
 ["emne_fauna_kjottmeis","3cb439a66db0b59072f13413fd9d2b2c01e4d816"],
 ["emne_fauna_blaameis","038718c8ba46ee769d5c5cc76920229ed9d4171d"],
 ["emne_fauna_svarttrost","61278635c130708fda7e42c958576db5a98040e5"],
 ["emne_fauna_skjaere","e3da752bce1c4f637b80198559b805c98c1d82c7"],
 ["emne_fauna_kraake","efbf5b4d09143192cb5c7405e07f04eadd15f1a1"],
 ["emne_fauna_graaspurv","468b3c17af9a0b90aebe7ce1cdd6866f9224687f"]
])assert.equal(reg.get(p)?.gitBlobSha,sha,p+" must remain byte-identical");
assert(reg.get("emne_fauna_fiskemaake")===null || reg.get("emne_fauna_fiskemaake")?.scientificName==="Larus canus","Fiskemåke may be added only with correct taxonomy");
assert(read("finn-fauna.html").includes("nature-fauna-approved.js?v=20261113-09"));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Gråmåke")'));
assert(read("scripts/test-nature-illustrations.mjs").includes("330"));
console.log("Finn Fauna #9 Gråmåke: adults, transparent original, binary hashes, eight prior originals and quiz verified.");
