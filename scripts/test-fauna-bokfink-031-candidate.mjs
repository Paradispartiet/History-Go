import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const root=new URL("../",import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),"utf8");
const manifest=JSON.parse(read("data/natur/fauna/candidates/bokfink-031-20261121.json"));
const item=manifest.items?.[0];
assert.equal(manifest.schema,"history-go-fauna-single-species-review-v1");
assert.equal(manifest.speciesNumber,31);
assert.equal(manifest.phaseSpeciesNumber,5);
assert.equal(manifest.baselineApproved,30);
assert.equal(manifest.approvedCountAfterRelease,31);
assert.equal(manifest.kind,"candidate_original_pending_git_upload_and_fauna_flora_qa");
assert.equal(item.catalogId,"emne_fauna_bokfink");
assert.equal(item.scientificName,"Fringilla coelebs");
assert.equal(item.family,"Fringillidae");
assert.equal(item.existingQuizId,"quiz_fauna_bokfink");
assert.equal(item.reviewStatus,"candidate");
assert.equal(item.approvedForPublication,false);
assert.equal(item.originalBinaryVerifiedInGithub,false);
assert.deepEqual(item.dimensions,[1024,1536]);
assert.equal(item.sizeBytes,139174);
assert.match(item.sha256,/^[a-f0-9]{64}$/);
assert.match(item.expectedGitBlobSha,/^[a-f0-9]{40}$/);

for(const path of ["data/natur/fauna/artsdatabanken_oslo_fauna.json","data/runtime/nature-all/fauna-001.json"]){
 const all=JSON.parse(read(path)).flatMap(row=>row.kind==="emne_pack"?row.items:[row]);
 const species=all.find(row=>row.id===item.catalogId);
 assert(species,"Bokfink species missing from "+path);
 assert.equal(species.title,"Bokfink");
 assert.equal(species.latin,item.scientificName);
 assert.equal(species.taxonomy?.familie,item.family);
 assert(species.quiz_ids?.includes(item.existingQuizId),"Bokfink quiz ID must not change");
}

const sandbox={window:{}};
vm.runInNewContext(read("js/ui/nature-fauna-approved.js"),sandbox);
const reg=sandbox.window.HG_NATURE_FAUNA_APPROVED;
assert.equal(reg.count,30,"Previous 30 approved originals must remain unchanged");
assert.equal(reg.get(item.catalogId),null,"Candidate must not be shown as approved before full QA");
assert.equal(read("finn-fauna.html").includes("nature-fauna-approved.js?v=20261116-30"),true);

const binaryPath=item.expectedRepoPath;
if(fs.existsSync(new URL(binaryPath,root))){
 const bytes=fs.readFileSync(new URL(binaryPath,root));
 assert.equal(bytes.length,item.sizeBytes,"Candidate byte count changed");
 assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),item.sha256);
 const gitBlob=crypto.createHash("sha1").update(Buffer.concat([
  Buffer.from("blob "+bytes.length),Buffer.from([0]),bytes
 ])).digest("hex");
 assert.equal(gitBlob,item.expectedGitBlobSha,"Git blob differs from candidate");
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.equal(bytes.toString("ascii",12,16),"VP8X");
 assert((bytes[20]&16)!==0,"True alpha WebP required");
 assert.deepEqual([bytes.readUIntLE(24,3)+1,bytes.readUIntLE(27,3)+1],[1024,1536]);
 console.log("Bokfink #31: staged binary matches signed candidate; still not approved.");
}else{
 console.log("Bokfink #31: catalogue and quiz intact; 30 originals active; binary transfer still pending.");
}
