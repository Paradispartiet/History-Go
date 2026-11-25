import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";
const root=new URL("../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const review=JSON.parse(read("data/natur/fauna/illustration-quality-sjoorre-20261125.json"));
const item=review.items?.[0],id="emne_fauna_sjoorre";
assert.equal(review.speciesNumber,36);assert.equal(review.baselineApproved,35);
assert.equal(review.approvedCountAfterRelease,36);
assert.equal(review.kind,"approved_original_verified_git_blob");assert.equal(review.items.length,1);
assert.equal(item.catalogId,id);assert.equal(item.scientificName,"Melanitta fusca");
assert.equal(item.family,"Anatidae");assert.equal(item.existingQuizId,null);
assert.equal(item.reviewStatus,"approved");assert.equal(item.approvedForPublication,true);
assert.equal(item.originalBinaryVerified,true);
for(const key of ["blackBackgroundReviewed","whiteBackgroundReviewed","trueAlphaWebP","fullImageReviewed","adultMale","velvetyBlackPlumage","paleIrisWhiteEyeCrescent","yellowOrangeBillWithDarkEdges","whiteWingSpeculum","fullBirdAndWaterVisible"])assert(item.visualChecks[key],key+" required");
assert(item.sourceReferences.length>=2);
const data=JSON.parse(read("data/runtime/nature-all/fauna-001.json")).flatMap(x=>x.kind==="emne_pack"?x.items:[x]);
const species=data.find(x=>x.id===id);
assert(species,"Sjøorre missing from runtime fauna");
assert.equal(species.title,"Sjøorre");assert.equal(species.latin,"Melanitta fusca");
assert.equal(species.taxonomy?.familie,"Anatidae");
assert(!species.quiz_ids?.length,"No existing Sjøorre quiz ID may be invented as part of an illustration PR");
const b=fs.readFileSync(new URL(item.src,root));
assert.equal(b.length,167358);assert.equal(item.sizeBytes,b.length);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"c5ec495e9f7bd6b0f0f90f5cc655a8dcaf128fe40f9a84d76f4f6d926008b8b3");
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),"e88b63fdaf4d9635982597568cd424f314fe607d");
assert.equal(item.gitBlobSha,"e88b63fdaf4d9635982597568cd424f314fe607d");assert.equal(item.sha256,"c5ec495e9f7bd6b0f0f90f5cc655a8dcaf128fe40f9a84d76f4f6d926008b8b3");
assert.equal(b.toString("ascii",0,4),"RIFF");assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");assert((b[20]&16)!==0,"true alpha required");
assert.deepEqual([b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1],[1024,1536]);
const sandbox={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),sandbox);
const reg=sandbox.window.HG_NATURE_FAUNA_APPROVED;
assert(reg.count>=36,"Sjøorre and later originals must remain approved");assert.equal(reg.get(id)?.src,item.src);
assert.equal(reg.get(id)?.scientificName,item.scientificName);assert.equal(reg.get(id)?.gitBlobSha,item.gitBlobSha);
const previous={
  "emne_fauna_kvinand": "d043e1ee98cdfd91dd686b89be0dd5ca8037f6f1",
  "emne_fauna_tjeld": "c5bc1284a129192d52ed8e756834bac3dbbba9b6",
  "emne_fauna_hvitkinngaas": "700c304c91f3cf64a109d5ae37081913746b6542",
  "emne_fauna_taarnseiler": "49822981f3584d594d6ae43fcd475563f2f1f4bd",
  "emne_fauna_bokfink": "f48fafe915612bc0b520af1388e62230901d3060",
  "emne_fauna_staer": "6e90951b0ee9b22674b0e9556013f09fbc87c2fd",
  "emne_fauna_kaie": "20e8714069a9bbd29100b1aaa73e4f497ab0bdcd",
  "emne_fauna_stillits": "c73db3e8a990927dbc03da3d9df884a9b77f50e9",
  "emne_fauna_pilfink": "6337492c57f28ef5d640336fc72db29f0dbe0bc9",
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
assert.equal(Object.keys(previous).length,35);
for(const [oldId,hash] of Object.entries(previous))assert.equal(reg.get(oldId)?.gitBlobSha,hash,oldId+" original SHA must remain unchanged");
assert.equal(reg.get("emne_fauna_lovsanger")?.gitBlobSha,"a8cfb708899e9cb77476c378a6395c38d0c1c0ed","Løvsanger #37 original must remain byte-identical");
assert(read("finn-fauna.html").includes("nature-fauna-approved.js?v=20261125-48"));
assert(read(".github/workflows/fauna-illustrations.yml").includes("scripts/test-fauna-sjoorre-036.mjs"));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Sjøorre")'));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Løvsanger")'));
console.log("Finn Fauna #36 Sjøorre: WebP, alpha, SHA-256, blob SHA, runtime ID, 35 prior hashes and next SVG fallback OK.");
