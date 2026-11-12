import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const q=JSON.parse(read("data/natur/fauna/illustration-quality-skjaere-20261112.json")),a=q.items[0],id="emne_fauna_skjaere",quiz="quiz_fauna_skjaere";
assert.equal(q.speciesNumber,3);assert.equal(q.baselineApproved,2);assert.equal(q.approvedCountAfterRelease,3);
assert.equal(a.catalogId,id);assert.equal(a.scientificName,"Pica pica");assert.equal(a.family,"Corvidae");assert.equal(a.existingQuizId,quiz);
assert.equal(a.reviewStatus,"approved");assert.equal(a.approvedForPublication,true);assert.equal(a.originalBinaryVerified,true);
assert(a.visualChecks.blackBackgroundReviewed&&a.visualChecks.trueAlphaWebP&&a.visualChecks.correctSpeciesNotHoodedCrow&&a.visualChecks.veryLongIridescentTail);
assert(a.sourceReferences.length>=2);
for(const p of ["data/natur/fauna/fugler_by.json","data/runtime/nature-all/fauna-001.json"]){
 const v=JSON.parse(read(p)).flatMap(x=>x.kind==="emne_pack"?x.items:[x]).find(x=>x.id===id);
 assert(v,"Original Skjære art must exist");assert.equal(v.title,"Skjære");assert.equal(v.latin,"Pica pica");assert.equal(v.taxonomy?.latin_navn,"Pica pica");assert.equal(v.taxonomy?.familie,"Corvidae");assert(v.quiz_ids?.includes(quiz));
}
const b=fs.readFileSync(new URL(a.src,root));assert.equal(b.length,201424);assert.equal(b.length,a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"970f33e9ac528ee2b69135774aab21292dfe6536c177e91371ea8f011cfe3164");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"e3da752bce1c4f637b80198559b805c98c1d82c7");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0);assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const sandbox={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),sandbox);
const aReg=sandbox.window.HG_NATURE_FAUNA_APPROVED;assert(aReg.count>=3,"Skjære remains approved");
assert.equal(aReg.get(id)?.src,a.src);assert.equal(aReg.get(id)?.scientificName,"Pica pica");assert.equal(aReg.get(id)?.gitBlobSha,a.gitBlobSha);
assert.equal(aReg.get("emne_fauna_kraake")?.gitBlobSha,"efbf5b4d09143192cb5c7405e07f04eadd15f1a1");
assert.equal(aReg.get("emne_fauna_graaspurv")?.gitBlobSha,"468b3c17af9a0b90aebe7ce1cdd6866f9224687f");

assert(read("finn-fauna.html").includes("nature-fauna-approved.js?v=20261112-03"));
console.log("Finn Fauna #3 Skjære: unique alpha WebP, correct species and quiz, 3 approved originals.");
