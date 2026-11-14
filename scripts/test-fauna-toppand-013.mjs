import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const review=JSON.parse(read("data/natur/fauna/illustration-quality-toppand-20261114.json")),item=review.items[0];
const id="emne_fauna_toppand",latin="Aythya fuligula",quiz="quiz_fauna_toppand";
assert.equal(review.speciesNumber,13);assert.equal(review.phaseSpeciesNumber,3);
assert.equal(review.baselineApproved,12);assert.equal(review.approvedCountAfterRelease,13);
assert.equal(review.items.length,1);
assert.equal(item.catalogId,id);assert.equal(item.scientificName,latin);assert.equal(item.family,"Anatidae");
assert.equal(item.existingQuizId,quiz);assert.equal(item.reviewStatus,"approved");assert.equal(item.approvedForPublication,true);
assert.equal(item.originalBinaryVerified,true);assert(item.sourceReferences.length>=2);
for(const k of ["blackBackgroundReviewed","whiteBackgroundReviewed","trueAlphaWebP","fullImageReviewed",
"adultMaleBlackHeadAndBody","adultMaleWhiteFlanks","adultMaleDroopingCrest","adultMaleYellowEye",
"adultFemaleDarkBrownBody","adultFemaleShorterCrest","bothBluishBillsBlackTips","correctSpeciesNotGreaterScaup"])
 assert(item.visualChecks[k],k+" is required");
for(const p of ["data/natur/fauna/fugler_vatmark_og_skog.json","data/runtime/nature-all/fauna-001.json"]){
 const x=JSON.parse(read(p)).flatMap(z=>z.kind==="emne_pack"?z.items:[z]).find(z=>z.id===id);
 assert(x,"Toppand species/runtime record missing");
 assert.equal(x.title,"Toppand");assert.equal(x.latin,latin);
 assert.equal(x.taxonomy?.latin_navn,latin);assert.equal(x.taxonomy?.familie,"Anatidae");
 assert(x.quiz_ids?.includes(quiz));
}
const b=fs.readFileSync(new URL(item.src,root));
assert.equal(b.length,240766);assert.equal(b.length,item.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"38745de046848b900924b1e4a68dbe2fd75749c3cd8e32ca093d7e6032138441");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"9069d83c932b0ae316f03b367b7f3ce95a1788b1");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0,"Transparent WebP required");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const sandbox={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),sandbox);
const reg=sandbox.window.HG_NATURE_FAUNA_APPROVED;assert(reg.count>=13,"Toppand remains approved after later additions");
assert.equal(reg.get(id)?.src,item.src);assert.equal(reg.get(id)?.scientificName,latin);assert.equal(reg.get(id)?.gitBlobSha,item.gitBlobSha);
for(const [name,sha] of [["graagas","63289e4f9134a0b0e959b52c59a543e85476f556"],["knoppsvane","dc1692279b0c32f955dadd3a33a48faaf3615f9e"],["fiskemaake","6a0895456fbd3d990c291b1c14f108b1695d0494"],["graamaake","775189e54b00b13a6859670401da027ebb766cc9"],["stokkand","b16e4e48f6264a0a318f2b20128bc8d2e559505c"],["ringdue","643eea93e2803fb1de8fcaaf6fba378aa7d61e74"],["kjottmeis","3cb439a66db0b59072f13413fd9d2b2c01e4d816"],["blaameis","038718c8ba46ee769d5c5cc76920229ed9d4171d"],["svarttrost","61278635c130708fda7e42c958576db5a98040e5"],["skjaere","e3da752bce1c4f637b80198559b805c98c1d82c7"],["kraake","efbf5b4d09143192cb5c7405e07f04eadd15f1a1"],["graaspurv","468b3c17af9a0b90aebe7ce1cdd6866f9224687f"]])
 assert.equal(reg.get("emne_fauna_"+name)?.gitBlobSha,sha,name+" must remain byte-identical");
assert(/nature-fauna-approved\.js\?v=\d{8}-\d{2}/.test(read("finn-fauna.html")),"Fauna registry must be loaded");
assert(read(".github/workflows/fauna-illustrations.yml").includes("scripts/test-fauna-toppand-013.mjs"));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Toppand")'));
assert(read("scripts/test-nature-illustrations.mjs").includes("330"));
console.log("Finn Fauna #13 Toppand: original with alpha, correct pair, hashes, 12 previous species and quiz preserved.");
