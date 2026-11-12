import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const q=JSON.parse(read("data/natur/fauna/illustration-quality-kjottmeis-20261112.json")),a=q.items[0];
const id="emne_fauna_kjottmeis",latin="Parus major",quiz="quiz_fauna_kjottmeis";
assert.equal(q.speciesNumber,6);assert.equal(q.baselineApproved,5);assert.equal(q.approvedCountAfterRelease,6);
assert.equal(q.items.length,1);assert.equal(a.catalogId,id);assert.equal(a.scientificName,latin);
assert.equal(a.family,"Paridae");assert.equal(a.existingQuizId,quiz);
assert.equal(a.reviewStatus,"approved");assert.equal(a.approvedForPublication,true);assert.equal(a.originalBinaryVerified,true);
assert(a.sourceReferences.length>=2);
assert(a.visualChecks.blackBackgroundReviewed&&a.visualChecks.whiteBackgroundReviewed&&a.visualChecks.trueAlphaWebP);
assert(a.visualChecks.fullImageReviewed&&a.visualChecks.blackHead&&a.visualChecks.whiteCheeks&&a.visualChecks.greenishBack);
assert(a.visualChecks.yellowUnderparts&&a.visualChecks.adultMaleBroadBlackBellyStripe&&a.visualChecks.adultFemaleNarrowBlackBellyStripe&&a.visualChecks.distinctFromBlueTit);
for(const p of ["data/natur/fauna/fugler_by.json","data/runtime/nature-all/fauna-001.json"]){
 const x=JSON.parse(read(p)).flatMap(v=>v.kind==="emne_pack"?v.items:[v]).find(v=>v.id===id);
 assert(x,"Original Kjøttmeis species/runtime required");
 assert.equal(x.title,"Kjøttmeis");assert.equal(x.latin,latin);
 assert.equal(x.taxonomy?.latin_navn,latin);assert.equal(x.taxonomy?.familie,"Paridae");
 assert(x.quiz_ids?.includes(quiz));
}
const b=fs.readFileSync(new URL(a.src,root));
assert.equal(b.length,362818);assert.equal(b.length,a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"f348ab817d3b8a306796babe8dfcbf8d27e1597b414691dc5ae88f5dc0ee53dc");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"3cb439a66db0b59072f13413fd9d2b2c01e4d816");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0,"Transparent WebP required");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const env={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),env);
const reg=env.window.HG_NATURE_FAUNA_APPROVED;assert(reg.count>=6,"Kjøttmeis remains approved after later additions");
assert.equal(reg.get(id)?.src,a.src);assert.equal(reg.get(id)?.scientificName,latin);
assert.equal(reg.get(id)?.gitBlobSha,a.gitBlobSha);
for(const [p,sha] of [
 ["emne_fauna_blaameis","038718c8ba46ee769d5c5cc76920229ed9d4171d"],
 ["emne_fauna_svarttrost","61278635c130708fda7e42c958576db5a98040e5"],
 ["emne_fauna_skjaere","e3da752bce1c4f637b80198559b805c98c1d82c7"],
 ["emne_fauna_kraake","efbf5b4d09143192cb5c7405e07f04eadd15f1a1"],
 ["emne_fauna_graaspurv","468b3c17af9a0b90aebe7ce1cdd6866f9224687f"]
])assert.equal(reg.get(p)?.gitBlobSha,sha,p+" original preserved");
assert.equal(reg.get("emne_fauna_ringdue")?.gitBlobSha,"643eea93e2803fb1de8fcaaf6fba378aa7d61e74","Ringdue now has an approved original");
assert(read("finn-fauna.html").includes("nature-fauna-approved.js?v=20261112-07"));
assert(read("scripts/test-nature-illustrations.mjs").includes("330"));
console.log("Finn Fauna #6 Kjøttmeis: verified original WebP, sex dimorphism, quiz, 6 originals and legacy SVGs.");
