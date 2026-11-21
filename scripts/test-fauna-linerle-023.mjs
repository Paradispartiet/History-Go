import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const review=JSON.parse(read("data/natur/fauna/illustration-quality-linerle-20261116.json")),item=review.items[0];
const id="emne_fauna_linerle",latin="Motacilla alba",quiz="quiz_fauna_linerle";
assert.equal(review.speciesNumber,23);assert.equal(review.phaseSpeciesNumber,13);
assert.equal(review.baselineApproved,22);assert.equal(review.approvedCountAfterRelease,23);
assert.equal(review.items.length,1);assert.equal(item.catalogId,id);assert.equal(item.scientificName,latin);
assert.equal(item.family,"Motacillidae");assert.equal(item.existingQuizId,quiz);
assert.equal(item.reviewStatus,"approved");assert.equal(item.approvedForPublication,true);assert.equal(item.originalBinaryVerified,true);
assert(item.sourceReferences.length>=2);
for(const k of ["blackBackgroundReviewed","whiteBackgroundReviewed","trueAlphaWebP","fullImageReviewed","adultBlackCrown","adultBlackThroatAndBib","whiteFaceAndBelly","greyMantleSubspeciesAlba","blackWhiteWings","longBlackTailWhiteOuterFeathers","blackLegsAndThinBill","onStoneAndWalkingPose","wholeBirdAndTailVisible","correctSubspeciesNotDarkBackedYarrellii"])assert(item.visualChecks[k],k+" required");
for(const p of ["data/natur/fauna/fugler_vatmark_og_skog.json","data/runtime/nature-all/fauna-001.json"]){
 const rows=JSON.parse(read(p)).flatMap(z=>z.kind==="emne_pack"?z.items:[z]);
 const entry=rows.find(z=>z.id===id);assert(entry,"Linerle species missing");
 assert.equal(entry.title,"Linerle");assert.equal(entry.latin,latin);
 assert.equal(entry.taxonomy?.familie,"Motacillidae");assert.equal(entry.taxonomy?.latin_navn,latin);
 assert(entry.quiz_ids?.includes(quiz),"Existing quiz ID retained");
}
const b=fs.readFileSync(new URL(item.src,root));
assert.equal(b.length,276318);assert.equal(item.sizeBytes,b.length);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"034b6cf90b1a751bd3afe0affa7f94b2b1f775c307554746715c284589c93ba7");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"a8a23c43089d3624a0630397ca2bba28e120370f");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0,"WebP alpha required");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const sandbox={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),sandbox);
const reg=sandbox.window.HG_NATURE_FAUNA_APPROVED;assert(reg.count>=23,"Linerle remains approved after later species");
assert.equal(reg.get(id)?.src,item.src);assert.equal(reg.get(id)?.scientificName,latin);assert.equal(reg.get(id)?.gitBlobSha,item.gitBlobSha);
const prev={
 "emne_fauna_graatrost":"c3d967ffa6afe2b384ff1433a7af7beec4829bdb",
 "emne_fauna_rodstrupe":"f867a24c8608f1a3d8b8ec50fb47d54375738f1b",
 "emne_fauna_gronnfink":"4e6ee9392ca010aad7a06e23a0191fc5f89432cc",
 "emne_fauna_flaggspett":"4c43cdf4db47f2c652d43128d030189b300d1604",
 "emne_fauna_graahegre":"0c0a153a98ad3a9ac830ca255ecb171020675faa",
 "emne_fauna_sildemaake":"b89f8cc442174a9d0ea5be345c29c91c7e0ad68f",
 "emne_fauna_hettemaake":"111882da9a8bf94e18f8eb942901cdfa7c5faef0",
 "emne_fauna_storskarv":"9eff35583a3797062cb579e5e072de9736022ff4",
 "emne_fauna_sothone":"b9bffe1eaed401a4e21fbe959f50464ac95bca57",
 "emne_fauna_toppand":"9069d83c932b0ae316f03b367b7f3ce95a1788b1",
 "emne_fauna_graagas":"63289e4f9134a0b0e959b52c59a543e85476f556",
 "emne_fauna_knoppsvane":"dc1692279b0c32f955dadd3a33a48faaf3615f9e",
 "emne_fauna_fiskemaake":"6a0895456fbd3d990c291b1c14f108b1695d0494",
 "emne_fauna_graamaake":"775189e54b00b13a6859670401da027ebb766cc9",
 "emne_fauna_stokkand":"b16e4e48f6264a0a318f2b20128bc8d2e559505c",
 "emne_fauna_ringdue":"643eea93e2803fb1de8fcaaf6fba378aa7d61e74",
 "emne_fauna_kjottmeis":"3cb439a66db0b59072f13413fd9d2b2c01e4d816",
 "emne_fauna_blaameis":"038718c8ba46ee769d5c5cc76920229ed9d4171d",
 "emne_fauna_svarttrost":"61278635c130708fda7e42c958576db5a98040e5",
 "emne_fauna_skjaere":"e3da752bce1c4f637b80198559b805c98c1d82c7",
 "emne_fauna_kraake":"efbf5b4d09143192cb5c7405e07f04eadd15f1a1",
 "emne_fauna_graaspurv":"468b3c17af9a0b90aebe7ce1cdd6866f9224687f"
};
assert.equal(Object.keys(prev).length,22);
for(const [prevId,prevSha] of Object.entries(prev))assert.equal(reg.get(prevId)?.gitBlobSha,prevSha,prevId+" original remains unchanged");
assert.equal(reg.get("emne_fauna_tjeld"),null,"Tjeld retains its original SVG fallback");
assert(/nature-fauna-approved\.js\?v=\d{8}-\d{2}/.test(read("finn-fauna.html")),"Versioned approved fauna registry must load");
assert(read(".github/workflows/fauna-illustrations.yml").includes("scripts/test-fauna-linerle-023.mjs"));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Linerle")'));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Spettmeis")'));
assert(read("scripts/test-nature-illustrations.mjs").includes("330"));
console.log("Finn Fauna #23 Linerle: original WebP, alpha, checksum, 22 previous originals, species, quiz and browser contract OK.");
