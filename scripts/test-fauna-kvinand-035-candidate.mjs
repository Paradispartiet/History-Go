import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const root=new URL("../",import.meta.url);
const read=(path)=>fs.readFileSync(new URL(path,root),"utf8");
const manifest=JSON.parse(read("data/natur/fauna/candidates/35_kvinand_20261124.json"));
const item=manifest.items?.[0];
const id="emne_fauna_kvinand",quiz="quiz_fauna_kvinand";

assert.equal(manifest.schema,"history-go-fauna-single-species-candidate-v1");
assert.equal(manifest.speciesNumber,35);
assert.equal(manifest.phaseSpeciesNumber,9);
assert.equal(manifest.baselineApproved,34);
assert.equal(manifest.publicationStatus,"not_uploaded_not_published");
assert.equal(manifest.items.length,1);
assert.equal(item.catalogId,id);
assert.equal(item.scientificName,"Bucephala clangula");
assert.equal(item.family,"Anatidae");
assert.equal(item.existingQuizId,quiz);
assert.equal(item.approvedForPublication,false);
assert.equal(item.imagePresentInRepo,false);
assert.deepEqual(item.dimensions,[1024,1536]);
assert.equal(item.sizeBytes,204012);
assert.equal(item.expectedGitBlobSha,"d043e1ee98cdfd91dd686b89be0dd5ca8037f6f1");
assert.equal(item.expectedSha256,"1be6fcd929158213f72a523e0ad53476f2b3d80d299e120a924b2581ebd9ef2b");
for(const check of ["trueAlphaWebP","blackBackgroundPreviewCreated","whiteBackgroundPreviewCreated","entireBirdVisible","goldenYellowEye","iridescentDarkGreenHead","whiteCheekSpot","whiteBodyBlackBack","distinctiveBlackAndWhiteWingPattern"]){
 assert.equal(item.visualChecks[check],true,check);
}
assert(item.sourceReferences.length>=2);

for(const path of ["data/natur/fauna/artsdatabanken_oslo_fauna.json","data/runtime/nature-all/fauna-001.json"]){
 const rows=JSON.parse(read(path)).flatMap(x=>x.kind==="emne_pack"?x.items:[x]);
 const species=rows.find(x=>x.id===id);
 assert(species,"Kvinand missing from "+path);
 assert.equal(species.title,"Kvinand");
 assert.equal(species.latin,"Bucephala clangula");
 assert.equal(species.taxonomy?.familie,"Anatidae");
 assert(species.quiz_ids?.includes(quiz),"Keep the existing Kvinand quiz ID");
}

const sandbox={window:{}};
vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),sandbox);
const approved=sandbox.window.HG_NATURE_FAUNA_APPROVED;
assert.equal(approved.count,34,"Candidate work must not change the existing 34 approvals");
assert.equal(approved.get(id),null,"Kvinand must keep its legacy SVG fallback");
assert.equal(approved.get("emne_fauna_tjeld")?.gitBlobSha,"c5bc1284a129192d52ed8e756834bac3dbbba9b6");
assert.equal(approved.get("emne_fauna_hvitkinngaas")?.gitBlobSha,"700c304c91f3cf64a109d5ae37081913746b6542");
assert(read("finn-fauna.html").includes("nature-fauna-approved.js?v=20261121-34"));
assert(!fs.existsSync(new URL(item.expectedRepoSrc,root)),"Candidate file is not committed: do not accidentally mark it approved");

console.log("Kvinand #35 staging contract PASS – source metadata locked; 34 approved originals and fallback unchanged. NOT a publication approval.");
