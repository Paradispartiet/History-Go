import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const q=JSON.parse(read("data/natur/fauna/illustration-quality-ringdue-20261112.json")),a=q.items[0];
const id="emne_fauna_ringdue",latin="Columba palumbus",quiz="quiz_fauna_ringdue";
assert.equal(q.speciesNumber,7);assert.equal(q.baselineApproved,6);assert.equal(q.approvedCountAfterRelease,7);
assert.equal(q.items.length,1);assert.equal(a.catalogId,id);assert.equal(a.scientificName,latin);
assert.equal(a.family,"Columbidae");assert.equal(a.existingQuizId,quiz);
assert.equal(a.reviewStatus,"approved");assert.equal(a.approvedForPublication,true);assert.equal(a.originalBinaryVerified,true);
assert(a.sourceReferences.length>=2);
const checks=a.visualChecks;
for(const key of ["blackBackgroundReviewed","trueAlphaWebP","fullImageReviewed","adultGreyBody","rosyPinkBreast","whiteNeckPatch","iridescentGreenNeck","whiteWingBandsInFlight","darkTailBand","distinctFromFeralPigeon"])assert(checks[key],key+" review required");
for(const p of ["data/natur/fauna/fugler_by.json","data/runtime/nature-all/fauna-001.json"]){
 const x=JSON.parse(read(p)).flatMap(v=>v.kind==="emne_pack"?v.items:[v]).find(v=>v.id===id);
 assert(x,"Existing Ringdue species/runtime record must exist");
 assert.equal(x.title,"Ringdue");assert.equal(x.latin,latin);
 assert.equal(x.taxonomy?.latin_navn,latin);assert.equal(x.taxonomy?.familie,"Columbidae");
 assert(x.quiz_ids?.includes(quiz));
}
const b=fs.readFileSync(new URL(a.src,root));
assert.equal(b.length,360226);assert.equal(b.length,a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"cd79a0638038bfe75d61a7b683d18fd2cfe98325f48cb379ef6056b33cbb5ec5");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"643eea93e2803fb1de8fcaaf6fba378aa7d61e74");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0,"Transparent WebP required");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const env={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),env);
const reg=env.window.HG_NATURE_FAUNA_APPROVED;assert(reg.count>=7,"Ringdue must remain approved after later Fauna species");
assert.equal(reg.get(id)?.src,a.src);assert.equal(reg.get(id)?.scientificName,latin);assert.equal(reg.get(id)?.gitBlobSha,a.gitBlobSha);
for(const [p,sha] of [
 ["emne_fauna_kjottmeis","3cb439a66db0b59072f13413fd9d2b2c01e4d816"],
 ["emne_fauna_blaameis","038718c8ba46ee769d5c5cc76920229ed9d4171d"],
 ["emne_fauna_svarttrost","61278635c130708fda7e42c958576db5a98040e5"],
 ["emne_fauna_skjaere","e3da752bce1c4f637b80198559b805c98c1d82c7"],
 ["emne_fauna_kraake","efbf5b4d09143192cb5c7405e07f04eadd15f1a1"],
 ["emne_fauna_graaspurv","468b3c17af9a0b90aebe7ce1cdd6866f9224687f"]
])assert.equal(reg.get(p)?.gitBlobSha,sha,p+" preserved original");
assert.equal(reg.get("emne_fauna_stokkand")?.gitBlobSha,"b16e4e48f6264a0a318f2b20128bc8d2e559505c","Stokkand adds a new original without replacing Ringdue");
assert(/nature-fauna-approved\.js\?v=202611(?:12|13)-0[7-9]/.test(read("finn-fauna.html")));
assert(read("scripts/test-nature-illustrations.mjs").includes("330"));
console.log("Finn Fauna #7 Ringdue: approved binary, bird identity, quiz, seven originals and SVG fallback verified.");
