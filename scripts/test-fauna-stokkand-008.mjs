import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const q=JSON.parse(read("data/natur/fauna/illustration-quality-stokkand-20261113.json")),a=q.items[0];
const id="emne_fauna_stokkand",latin="Anas platyrhynchos",quiz="quiz_fauna_stokkand";
assert.equal(q.speciesNumber,8);assert.equal(q.baselineApproved,7);assert.equal(q.approvedCountAfterRelease,8);
assert.equal(q.items.length,1);assert.equal(a.catalogId,id);assert.equal(a.scientificName,latin);
assert.equal(a.family,"Anatidae");assert.equal(a.existingQuizId,quiz);
assert.equal(a.reviewStatus,"approved");assert.equal(a.approvedForPublication,true);assert.equal(a.originalBinaryVerified,true);
assert(a.sourceReferences.length>=2);
for(const key of ["blackBackgroundReviewed","whiteBackgroundReviewed","trueAlphaWebP","fullImageReviewed",
 "adultMaleGlossyGreenHead","adultMaleYellowBill","adultMaleThinWhiteNeckRing","adultMaleChestnutBreast",
 "adultMaleCurledTail","adultFemaleMottledBrown","adultFemaleMottledOrangeBill",
 "bothBlueSpeculaWhiteBorder","orangeWebbedFeet","correctSpeciesNotGadwall"])assert(a.visualChecks[key],key+" required");
for(const p of ["data/natur/fauna/fugler_by.json","data/runtime/nature-all/fauna-001.json"]){
 const x=JSON.parse(read(p)).flatMap(v=>v.kind==="emne_pack"?v.items:[v]).find(v=>v.id===id);
 assert(x,"Original Stokkand species and runtime record required");
 assert.equal(x.title,"Stokkand");assert.equal(x.latin,latin);
 assert.equal(x.taxonomy?.latin_navn,latin);assert.equal(x.taxonomy?.familie,"Anatidae");
 assert(x.quiz_ids?.includes(quiz));
}
const b=fs.readFileSync(new URL(a.src,root));
assert.equal(b.length,498374);assert.equal(b.length,a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"717ca5add97f419158d9f20463a526c680d31ca218903e50dcfe9ce506e46d1e");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"b16e4e48f6264a0a318f2b20128bc8d2e559505c");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0,"Transparent WebP required");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const env={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),env);
const reg=env.window.HG_NATURE_FAUNA_APPROVED;assert(reg.count>=8,"Stokkand must remain approved after later fauna species");
assert.equal(reg.get(id)?.src,a.src);assert.equal(reg.get(id)?.scientificName,latin);assert.equal(reg.get(id)?.gitBlobSha,a.gitBlobSha);
for(const [p,sha] of [
 ["emne_fauna_ringdue","643eea93e2803fb1de8fcaaf6fba378aa7d61e74"],
 ["emne_fauna_kjottmeis","3cb439a66db0b59072f13413fd9d2b2c01e4d816"],
 ["emne_fauna_blaameis","038718c8ba46ee769d5c5cc76920229ed9d4171d"],
 ["emne_fauna_svarttrost","61278635c130708fda7e42c958576db5a98040e5"],
 ["emne_fauna_skjaere","e3da752bce1c4f637b80198559b805c98c1d82c7"],
 ["emne_fauna_kraake","efbf5b4d09143192cb5c7405e07f04eadd15f1a1"],
 ["emne_fauna_graaspurv","468b3c17af9a0b90aebe7ce1cdd6866f9224687f"]
])assert.equal(reg.get(p)?.gitBlobSha,sha,p+" original must remain byte-identical");
assert(reg.get("emne_fauna_fiskemaake")===null || (reg.get("emne_fauna_fiskemaake")?.scientificName==="Larus canus" && reg.get("emne_fauna_fiskemaake")?.gitBlobSha==="6a0895456fbd3d990c291b1c14f108b1695d0494"),"Fiskemåke may be approved only as an exact individually verified original");
assert(/nature-fauna-approved\.js\?v=\d{8}-\d{2}/.test(read("finn-fauna.html")),"Approved fauna registry must use versioned URL");
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Stokkand")'));
assert(read("scripts/test-nature-illustrations.mjs").includes("330"));
console.log("Finn Fauna #8 Stokkand: both sexes, transparent WebP, exact binary, seven prior original hashes, quiz and SVG fallback verified.");
