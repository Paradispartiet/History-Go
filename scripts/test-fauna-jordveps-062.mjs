import assert from "node:assert/strict";
import fs from "node:fs";import crypto from "node:crypto";import vm from "node:vm";
const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"),binary=p=>fs.readFileSync(new URL("../"+p,import.meta.url));
const blob=b=>crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
const review=JSON.parse(read("data/natur/fauna/illustration-quality-jordveps-20261128.json")),a=review.items[0],id="emne_fauna_vanlig_veps";
assert.equal(review.speciesNumber,62);assert.equal(review.baselineApproved,61);assert.equal(review.approvedCountAfterRelease,62);
assert.equal(a.scientificName,"Vespula vulgaris");
const b=binary(a.src);assert.equal(b.length,749506);assert.equal(blob(b),"91a51eab6b6621a2c2be319ef56dffee01f9a711");
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),"a1dbbe381e200bdd0006bd058f8e192326d0e2f728b43df17c3b8f46f3886147");
assert.equal(b.toString("ascii",12,16),"VP8L");const bits=b.readUInt32LE(21);assert.deepEqual([(bits&0x3fff)+1,((bits>>>14)&0x3fff)+1],[1024,1536]);
const source=JSON.parse(read("data/natur/fauna/insekter_humler_og_veps.json"));const manifest=JSON.parse(read("data/runtime/nature-all.json"));const runtime=manifest.groups.fauna.flatMap(p=>JSON.parse(read(p)));
for(const key of [id,"emne_fauna_jordveps"]){assert.deepEqual(source.find(x=>x.id===key),runtime.find(x=>x.id===key));}
const canonical=source.find(x=>x.id===id);assert.equal(canonical.latin,"Vespula vulgaris");assert.equal(canonical.taxonomy.norsk_navn,"Jordveps");assert.deepEqual(canonical.quiz_ids,["quiz_fauna_vanlig_veps"]);assert(canonical.aliases.includes("Vanlig veps"));
const group=source.find(x=>x.id==="emne_fauna_jordveps");assert.equal(group.latin,"Vespula-gruppen");assert.equal(group.taxonomy.norsk_navn,"Vespula-veps");assert.deepEqual(group.quiz_ids,["quiz_fauna_jordveps"]);
const ctx={window:{}};vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),ctx);const reg=ctx.window.HG_NATURE_FAUNA_APPROVED;assert(reg.count>=62);assert.equal(reg.get(id)?.src,a.src);assert.equal(reg.get(id)?.scientificName,canonical.latin);
const prior=[
 {id:"emne_fauna_metallbie",src:"bilder/natur/fauna/godkjent/61_metallbie_v1.webp",sha:"7f5c0c320fb56694d0410b327c4b356fda3ae7c5"},
 {id:"emne_fauna_bladskjaererbie",src:"bilder/natur/fauna/godkjent/60_bladskjaererbie_v1.webp",sha:"0dc4638b300eb0d2a1c77b4eb1295c9ce22f4f95"},
 {id:"emne_fauna_sandbie",src:"bilder/natur/fauna/godkjent/59_sandbie_v1.webp",sha:"c31b4dd4c3279497ec35cc02c58ecd5ca9128595"},
 {id:"emne_fauna_murerbie",src:"bilder/natur/fauna/godkjent/58_murerbie_v1.webp",sha:"a63a65a32c4d80a2a81fdf823a9bf9e2124ccbf2"},
 {id:"emne_fauna_trehumle",src:"bilder/natur/fauna/godkjent/57_trehumle_v1.webp",sha:"5112097150a1e2e0c211deac374c337713276718"},
 {id:"emne_fauna_enghumle",src:"bilder/natur/fauna/godkjent/56_enghumle_v1.webp",sha:"abeb7ac603325a3b41b18df8416ae62c39c49981"},
 {id:"emne_fauna_markhumle",src:"bilder/natur/fauna/godkjent/55_markhumle_v1.webp",sha:"49128d5ec6ec6bc05696dd8a671f20b0ca4b2c84"},
 {
  "id": "emne_fauna_lys_jordhumle",
  "src": "bilder/natur/fauna/godkjent/54_lys_jordhumle_v1.webp",
  "sha": "360a3c6dc42c00896485f593502e308fc83ce20c"
 },
 {
  "id": "emne_fauna_hagehumle",
  "src": "bilder/natur/fauna/godkjent/53_hagehumle_v1.webp",
  "sha": "d969c6df5282dc2d40d4249cda47ca742e89fdc5"
 },
 {
  "id": "emne_fauna_steinhumle",
  "src": "bilder/natur/fauna/godkjent/52_steinhumle_v1.webp",
  "sha": "5a7c66a5c7b840ea99d5fff12a08ea4ba4eed641"
 },
 {
  "id": "emne_fauna_aakerhumle",
  "src": "bilder/natur/fauna/godkjent/51_aakerhumle_v1.webp",
  "sha": "7b34b77d690f2445df25b4061364fae3ee93be43"
 },
 {
  "id": "emne_fauna_jordhumle",
  "src": "bilder/natur/fauna/godkjent/50_jordhumle_v1.webp",
  "sha": "b940c2faa365ae0aa1af22e43c890c3f06519357"
 },
 {
  "id": "emne_fauna_honningbie",
  "src": "bilder/natur/fauna/godkjent/49_honningbie_v1.webp",
  "sha": "b96980829e614f3c5f9a410ce7cf31c9e89df4ac"
 },
 {
  "id": "emne_fauna_ekorn",
  "src": "bilder/natur/fauna/godkjent/48_ekorn_v1.webp",
  "sha": "4d581507a74152f6ed0bbec26b738ccef4bff417"
 },
 {
  "id": "emne_fauna_aerfugl",
  "src": "bilder/natur/fauna/godkjent/47_aerfugl_v1.webp",
  "sha": "3b75c618cce8d5a7258e7ca6510e146a3f184fef"
 },
 {
  "id": "emne_fauna_fossekall",
  "src": "bilder/natur/fauna/godkjent/46_fossekall_v1.webp",
  "sha": "bb8eb8f2b59a02d469f0531195f29651198d3a8b"
 },
 {
  "id": "emne_fauna_munk",
  "src": "bilder/natur/fauna/godkjent/45_munk_v1.webp",
  "sha": "4d5b3d2ef13a225dcecc23edd7237c656ce68253"
 },
 {
  "id": "emne_fauna_kattugle",
  "src": "bilder/natur/fauna/godkjent/44_kattugle_v1.webp",
  "sha": "c2b0f8cc47cb87ab19920a5ddfee167f16f68024"
 },
 {
  "id": "emne_fauna_dvergspett",
  "src": "bilder/natur/fauna/godkjent/43_dvergspett_v1.webp",
  "sha": "6aa86d927215a864ce0d32ddbec31337b48f8062"
 },
 {
  "id": "emne_fauna_hvitryggspett",
  "src": "bilder/natur/fauna/godkjent/42_hvitryggspett_v1.webp",
  "sha": "995aee26570d954ba33bfb34d6252b06234edbf1"
 },
 {
  "id": "emne_fauna_jernspurv",
  "src": "bilder/natur/fauna/godkjent/41_jernspurv_v1.webp",
  "sha": "09aec68b4055d7c4aa6a60d97a6a1f9ae09c2d58"
 },
 {
  "id": "emne_fauna_rodvingetrost",
  "src": "bilder/natur/fauna/godkjent/40_rodvingetrost_v1.webp",
  "sha": "1f83145ebdb08968d523c58e3b39c3e43a4d9e70"
 },
 {
  "id": "emne_fauna_gulsanger",
  "src": "bilder/natur/fauna/godkjent/39_gulsanger_v1.webp",
  "sha": "e78100653356fdcfd3f6a5dbcef5ac094ec0b31c"
 },
 {
  "id": "emne_fauna_svarthvit_fluesnapper",
  "src": "bilder/natur/fauna/godkjent/38_svarthvit_fluesnapper_v1.webp",
  "sha": "90b25e78ef79b3e9e7f8a04624fb4122c2ede371"
 },
 {
  "id": "emne_fauna_lovsanger",
  "src": "bilder/natur/fauna/godkjent/37_lovsanger_v1.webp",
  "sha": "a8cfb708899e9cb77476c378a6395c38d0c1c0ed"
 },
 {
  "id": "emne_fauna_sjoorre",
  "src": "bilder/natur/fauna/godkjent/36_sjoorre_v1.webp",
  "sha": "e88b63fdaf4d9635982597568cd424f314fe607d"
 },
 {
  "id": "emne_fauna_kvinand",
  "src": "bilder/natur/fauna/godkjent/35_kvinand_v1.webp",
  "sha": "d043e1ee98cdfd91dd686b89be0dd5ca8037f6f1"
 },
 {
  "id": "emne_fauna_tjeld",
  "src": "bilder/natur/fauna/godkjent/34_tjeld_v1.webp",
  "sha": "c5bc1284a129192d52ed8e756834bac3dbbba9b6"
 },
 {
  "id": "emne_fauna_hvitkinngaas",
  "src": "bilder/natur/fauna/godkjent/33_hvitkinngaas_v1.webp",
  "sha": "700c304c91f3cf64a109d5ae37081913746b6542"
 },
 {
  "id": "emne_fauna_taarnseiler",
  "src": "bilder/natur/fauna/godkjent/32_taarnseiler_v1.webp",
  "sha": "49822981f3584d594d6ae43fcd475563f2f1f4bd"
 },
 {
  "id": "emne_fauna_bokfink",
  "src": "bilder/natur/fauna/godkjent/31_bokfink_v1.webp",
  "sha": "f48fafe915612bc0b520af1388e62230901d3060"
 },
 {
  "id": "emne_fauna_staer",
  "src": "bilder/natur/fauna/godkjent/30_staer_v1.webp",
  "sha": "6e90951b0ee9b22674b0e9556013f09fbc87c2fd"
 },
 {
  "id": "emne_fauna_kaie",
  "src": "bilder/natur/fauna/godkjent/29_kaie_v1.webp",
  "sha": "20e8714069a9bbd29100b1aaa73e4f497ab0bdcd"
 },
 {
  "id": "emne_fauna_stillits",
  "src": "bilder/natur/fauna/godkjent/28_stillits_v1.webp",
  "sha": "c73db3e8a990927dbc03da3d9df884a9b77f50e9"
 },
 {
  "id": "emne_fauna_pilfink",
  "src": "bilder/natur/fauna/godkjent/27_pilfink_v1.webp",
  "sha": "6337492c57f28ef5d640336fc72db29f0dbe0bc9"
 },
 {
  "id": "emne_fauna_notteskrike",
  "src": "bilder/natur/fauna/godkjent/26_notteskrike_v1.webp",
  "sha": "a0ae529e88ba334447fb5a4a3e0efceb4cc050fd"
 },
 {
  "id": "emne_fauna_maaltrost",
  "src": "bilder/natur/fauna/godkjent/25_maaltrost_v1.webp",
  "sha": "428e21d71d9c16a0718f330775fec34c25040aba"
 },
 {
  "id": "emne_fauna_spettmeis",
  "src": "bilder/natur/fauna/godkjent/24_spettmeis_v1.webp",
  "sha": "70244f32ad0ce67ac7f3e9a469e25aeadba62d3e"
 },
 {
  "id": "emne_fauna_linerle",
  "src": "bilder/natur/fauna/godkjent/23_linerle_v1.webp",
  "sha": "a8a23c43089d3624a0630397ca2bba28e120370f"
 },
 {
  "id": "emne_fauna_graatrost",
  "src": "bilder/natur/fauna/godkjent/22_graatrost_v1.webp",
  "sha": "c3d967ffa6afe2b384ff1433a7af7beec4829bdb"
 },
 {
  "id": "emne_fauna_rodstrupe",
  "src": "bilder/natur/fauna/godkjent/21_rodstrupe_v1.webp",
  "sha": "f867a24c8608f1a3d8b8ec50fb47d54375738f1b"
 },
 {
  "id": "emne_fauna_gronnfink",
  "src": "bilder/natur/fauna/godkjent/20_gronnfink_v1.webp",
  "sha": "4e6ee9392ca010aad7a06e23a0191fc5f89432cc"
 },
 {
  "id": "emne_fauna_flaggspett",
  "src": "bilder/natur/fauna/godkjent/19_flaggspett_v1.webp",
  "sha": "4c43cdf4db47f2c652d43128d030189b300d1604"
 },
 {
  "id": "emne_fauna_graahegre",
  "src": "bilder/natur/fauna/godkjent/18_graahegre_v1.webp",
  "sha": "0c0a153a98ad3a9ac830ca255ecb171020675faa"
 },
 {
  "id": "emne_fauna_sildemaake",
  "src": "bilder/natur/fauna/godkjent/17_sildemaake_v1.webp",
  "sha": "b89f8cc442174a9d0ea5be345c29c91c7e0ad68f"
 },
 {
  "id": "emne_fauna_hettemaake",
  "src": "bilder/natur/fauna/godkjent/16_hettemaake_v1.webp",
  "sha": "111882da9a8bf94e18f8eb942901cdfa7c5faef0"
 },
 {
  "id": "emne_fauna_storskarv",
  "src": "bilder/natur/fauna/godkjent/15_storskarv_v1.webp",
  "sha": "9eff35583a3797062cb579e5e072de9736022ff4"
 },
 {
  "id": "emne_fauna_sothone",
  "src": "bilder/natur/fauna/godkjent/14_sothone_v1.webp",
  "sha": "b9bffe1eaed401a4e21fbe959f50464ac95bca57"
 },
 {
  "id": "emne_fauna_toppand",
  "src": "bilder/natur/fauna/godkjent/13_toppand_v1.webp",
  "sha": "9069d83c932b0ae316f03b367b7f3ce95a1788b1"
 },
 {
  "id": "emne_fauna_graagas",
  "src": "bilder/natur/fauna/godkjent/12_graagaas_v1.webp",
  "sha": "63289e4f9134a0b0e959b52c59a543e85476f556"
 },
 {
  "id": "emne_fauna_knoppsvane",
  "src": "bilder/natur/fauna/godkjent/11_knoppsvane_v1.webp",
  "sha": "dc1692279b0c32f955dadd3a33a48faaf3615f9e"
 },
 {
  "id": "emne_fauna_fiskemaake",
  "src": "bilder/natur/fauna/godkjent/10_fiskemaake_v1.webp",
  "sha": "6a0895456fbd3d990c291b1c14f108b1695d0494"
 },
 {
  "id": "emne_fauna_graamaake",
  "src": "bilder/natur/fauna/godkjent/09_graamaake_v1.webp",
  "sha": "775189e54b00b13a6859670401da027ebb766cc9"
 },
 {
  "id": "emne_fauna_stokkand",
  "src": "bilder/natur/fauna/godkjent/08_stokkand_v1.webp",
  "sha": "b16e4e48f6264a0a318f2b20128bc8d2e559505c"
 },
 {
  "id": "emne_fauna_ringdue",
  "src": "bilder/natur/fauna/godkjent/07_ringdue_v1.webp",
  "sha": "643eea93e2803fb1de8fcaaf6fba378aa7d61e74"
 },
 {
  "id": "emne_fauna_kjottmeis",
  "src": "bilder/natur/fauna/godkjent/06_kjottmeis_v1.webp",
  "sha": "3cb439a66db0b59072f13413fd9d2b2c01e4d816"
 },
 {
  "id": "emne_fauna_blaameis",
  "src": "bilder/natur/fauna/godkjent/05_blaameis_v1.webp",
  "sha": "038718c8ba46ee769d5c5cc76920229ed9d4171d"
 },
 {
  "id": "emne_fauna_svarttrost",
  "src": "bilder/natur/fauna/godkjent/04_svarttrost_v1.webp",
  "sha": "61278635c130708fda7e42c958576db5a98040e5"
 },
 {
  "id": "emne_fauna_skjaere",
  "src": "bilder/natur/fauna/godkjent/03_skjaere_v1.webp",
  "sha": "e3da752bce1c4f637b80198559b805c98c1d82c7"
 },
 {
  "id": "emne_fauna_kraake",
  "src": "bilder/natur/fauna/godkjent/02_kraake_v1.webp",
  "sha": "efbf5b4d09143192cb5c7405e07f04eadd15f1a1"
 },
 {
  "id": "emne_fauna_graaspurv",
  "src": "bilder/natur/fauna/godkjent/01_graaspurv_v1.webp",
  "sha": "468b3c17af9a0b90aebe7ce1cdd6866f9224687f"
 }
];



assert.equal(prior.length,61);
for(const old of prior){assert.equal(reg.get(old.id)?.src,old.src);assert.equal(reg.get(old.id)?.gitBlobSha,old.sha);assert.equal(blob(binary(old.src)),old.sha,old.id+" original changed");}
assert.equal(reg.get("emne_fauna_sandveps"),null);assert.equal(reg.get("emne_fauna_jordveps"),null);
assert(read("finn-fauna.html").includes("nature-fauna-approved.js?v=20261128-66"));
assert(read("scripts/test-fauna-approved-browser.mjs").includes('fill("Vanlig veps")'));
console.log("Jordveps #62: exact original, taxonomy, distinct Vespula group, preserved quiz references and all 61 previous binaries verified");
