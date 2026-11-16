import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const review=JSON.parse(read("data/natur/fauna/illustration-quality-pilfink-20261116.json")),item=review.items[0];
const id="emne_fauna_pilfink",latin="Passer montanus",quiz="quiz_fauna_pilfink";
assert.equal(review.speciesNumber,27);assert.equal(review.phaseSpeciesNumber,1);
assert.equal(review.baselineApproved,26);assert.equal(review.approvedCountAfterRelease,27);
assert.equal(item.catalogId,id);assert.equal(item.scientificName,latin);assert.equal(item.family,"Passeridae");
assert.equal(item.existingQuizId,quiz);assert.equal(item.reviewStatus,"approved");
assert.equal(item.approvedForPublication,true);assert.equal(item.originalBinaryVerified,true);
assert(item.sourceReferences.length>=2);
for(const k of ["blackBackgroundReviewed","whiteBackgroundReviewed","trueAlphaWebP","fullImageReviewed","adultChestnutCrown","adultWhiteCheeks","adultBlackCheekSpots","adultWhiteCollar","adultSmallBlackBib","adultStreakedBrownUpperparts","adultDoublePaleWingBars","fullPerchVisible","correctPasserMontanusNotHouseSparrow"])assert(item.visualChecks[k],k+" must be true");
for(const p of ["data/natur/fauna/artsdatabanken_oslo_fauna.json","data/runtime/nature-all/fauna-001.json"]){
 const rows=JSON.parse(read(p)).flatMap(z=>z.kind==="emne_pack"?z.items:[z]);
 const record=rows.find(z=>z.id===id);assert(record,"Pilfink species missing");
 assert.equal(record.title,"Pilfink");assert.equal(record.latin,latin);
 assert.equal(record.taxonomy?.familie,"Passeridae");assert.equal(record.taxonomy?.latin_navn,latin);
 assert(record.quiz_ids?.includes(quiz),"Quiz ID must be preserved");
}
const b=fs.readFileSync(new URL(item.src,root));
assert.equal(b.length,270756);assert.equal(item.sizeBytes,b.length);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"739a63cb2e8620b347878260004e88d2e869e7c25cb31731e7c6c91436673199");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"6337492c57f28ef5d640336fc72db29f0dbe0bc9");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0,"Transparent WebP required");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const sandbox={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),sandbox);
const reg=sandbox.window.HG_NATURE_FAUNA_APPROVED;
assert(reg.count>=27,"Pilfink remains approved after subsequent species");
assert.equal(reg.get(id)?.src,item.src);assert.equal(reg.get(id)?.scientificName,latin);assert.equal(reg.get(id)?.gitBlobSha,item.gitBlobSha);
const previous={
  "emne_fauna_notteskrike": "a0ae529e88ba334447fb5a4a3e0efceb4cc050fd",
  "emne_fauna_maaltrost": "428e21d71d9c16a0718f330775fec34c25040aba",
  "emne_fauna_spettmeis": "70244f32ad0ce67ac7f3e9a469e25aeadba62d3e",
  "emne_fauna_linerle": "a8a23c43089d3624a0630397ca2bba28e120370f",
  "emne_fauna_graatrost": "c3d967ffa6afe2b384ff1433a7af7beec4829bdb",
  "emne_fauna_rodstrupe": "f867a24c8608f1a3d8b8ec50fb47d54375738f1b",
  "emne_fauna_gronnfink": "4e6ee9392ca010aad7a06e23a0191fc5f89432cc",
  "emne_fauna_flaggspett": "4c43cdf4db47f2c652d43128d030189b300d1604",
  "emne_fauna_graahegre": "0c0a153a98ad3a9ac830ca255ecb171020675faa",
  "emne_fauna_sildemaake": "b89f8cc442174a9d0ea5be345c29c91c7e0ad68f",
  "emne_fauna_hettemaake": "111882da9a8bf94e18f8eb942901cdfa7c5faef0",
  "emne_fauna_storskarv": "9eff35583a3797062cb579e5e072de9736022ff4",
  "emne_fauna_sothone": "b9bffe1eaed401a4e21fbe959f50464ac95bca57",
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
assert.equal(Object.keys(previous).length,26);
for(const [prevId,prevSha]of Object.entries(previous))assert.equal(reg.get(prevId)?.gitBlobSha,prevSha,prevId+" must be preserved");
assert.equal(reg.get("emne_fauna_kaie"),null,"Unapproved Kaie keeps original SVG fallback");
assert(/nature-fauna-approved\.js\?v=\d{8}-\d{2}/.test(read("finn-fauna.html")),"Versioned fauna registry must load");
assert(read(".github/workflows/fauna-illustrations.yml").includes("scripts/test-fauna-pilfink-027.mjs"));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Pilfink")'));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Bokfink")'));
assert(read("scripts/test-nature-illustrations.mjs").includes("330"));
console.log("Finn Fauna #27 Pilfink: alpha, checksums, species, quiz, 26 earlier originals and browser fallback OK.");
