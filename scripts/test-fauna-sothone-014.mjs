import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const review=JSON.parse(read("data/natur/fauna/illustration-quality-sothone-20261114.json")),item=review.items[0];
const id="emne_fauna_sothone",latin="Fulica atra",quiz="quiz_fauna_sothone";
assert.equal(review.speciesNumber,14);
assert.equal(review.phaseSpeciesNumber,4);
assert.equal(review.baselineApproved,13);
assert.equal(review.approvedCountAfterRelease,14);
assert.equal(review.items.length,1);
assert.equal(item.catalogId,id);assert.equal(item.scientificName,latin);assert.equal(item.family,"Rallidae");
assert.equal(item.existingQuizId,quiz);assert.equal(item.reviewStatus,"approved");assert.equal(item.approvedForPublication,true);
assert.equal(item.originalBinaryVerified,true);assert(item.sourceReferences.length>=2);
for(const k of ["blackBackgroundReviewed","whiteBackgroundReviewed","trueAlphaWebP","fullImageReviewed","adultBlackHead",
"adultSlateBlackBody","whiteBillAndFrontalShield","adultRedIris","oliveLegsAndLobedToes","correctSpeciesNotCommonMoorhen"])
 assert(item.visualChecks[k],k+" must be true");
for(const p of ["data/natur/fauna/fugler_vatmark_og_skog.json","data/runtime/nature-all/fauna-001.json"]){
 const rows=JSON.parse(read(p)).flatMap(z=>z.kind==="emne_pack"?z.items:[z]);
 const entry=rows.find(z=>z.id===id);assert(entry,"Sothøne existing species record missing");
 assert.equal(entry.title,"Sothøne");assert.equal(entry.latin,latin);
 assert.equal(entry.taxonomy?.latin_navn,latin);
 assert.equal(entry.taxonomy?.familie,"Rallidae");
 assert(entry.quiz_ids?.includes(quiz),"Original quiz ID must be retained");
}
const b=fs.readFileSync(new URL(item.src,root));
assert.equal(b.length,234932);assert.equal(item.sizeBytes,b.length);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"46a1ff295fbae9ac9aa4eae2426a1af55c68e2ccd2440b6dccb9f507f6842556");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"b9bffe1eaed401a4e21fbe959f50464ac95bca57");
assert.equal(b.toString("ascii",0,4),"RIFF");
assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");
assert((b[20]&16)!==0,"WebP transparency required");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const sandbox={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),sandbox);
const reg=sandbox.window.HG_NATURE_FAUNA_APPROVED;
assert.equal(reg.count,14,"Exactly 14 original fauna drawings must be approved");
assert.equal(reg.get(id)?.src,item.src);
assert.equal(reg.get(id)?.scientificName,latin);
assert.equal(reg.get(id)?.gitBlobSha,item.gitBlobSha);
const prior={
  "emne_fauna_toppand": "9069d83c932b0ae316f03b367b7f3ce95a1788b1",
  "emne_fauna_graagas": "63289e4f9134a0b0e959b52c59a543e85476f556",
  "emne_fauna_knoppsvane": "dc1692279b0c32f955dadd3a33a48faaf3615f9e",
  "emne_fauna_fiskemaake": "6a0895456fbd3d990c291b1c14f108b1695d0494",
  "emne_fauna_graamaake": "775189e54b00b13a6859670401da027ebb766cc9",
  "emne_fauna_stokkand": "b16e4e48f6264a0a318f2b20128bc8d2e559505c",
  "emne_fauna_ringdue": "643eea93e2803fb1de8fcaaf6fba378aa7d61e74",
  "emne_fauna_kjottmeis": "3cb439a66db0b59072f13413fd9d2b2c01e4d816",
  "emne_fauna_blaameis": "038718c8ba46ee769d5c5cc76920229ed9d4171d",
  "emne_fauna_svarttrost": "61278635c130708fda7e42c958576db5a98040e5",
  "emne_fauna_skjaere": "e3da752bce1c4f637b80198559b805c98c1d82c7",
  "emne_fauna_kraake": "efbf5b4d09143192cb5c7405e07f04eadd15f1a1",
  "emne_fauna_graaspurv": "468b3c17af9a0b90aebe7ce1cdd6866f9224687f"
};
for(const [priorId,sha] of Object.entries(prior))
 assert.equal(reg.get(priorId)?.gitBlobSha,sha,priorId+" prior approved image must be retained");
assert(read("finn-fauna.html").includes("nature-fauna-approved.js?v=20261114-14"));
assert(read(".github/workflows/fauna-illustrations.yml").includes("scripts/test-fauna-sothone-014.mjs"));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Sothøne")'));
assert(read("scripts/test-nature-illustrations.mjs").includes("330"));
console.log("Finn Fauna #14 Sothøne: WebP alpha, dimensions, hashes, identity, quiz, and 13 previous original drawings OK.");
