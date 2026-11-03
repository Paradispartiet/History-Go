import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), "utf8");
const doc = JSON.parse(read("data/natur/flora/illustration-quality-smorbukk-20261103.json"));
const a = doc.items[0], id = "emne_flora_smor_bukk";
assert.equal(doc.baselineApproved, 58);
assert.equal(doc.approvedCountAfterRelease, 59);
assert.equal(a.catalogId,id);
assert.equal(a.scientificName,"Hylotelephium maximum");
assert.equal(a.approvedForPublication,true);
assert.equal(a.reviewStatus,"approved");
assert.equal(a.dimensions.join("x"),"1024x1536");
const catalog = JSON.parse(read("data/natur/flora/blomster.json")).find(x => x.id === id);
const runtime = JSON.parse(read("data/runtime/nature-all/flora-001.json"))
    .flatMap(x => x.kind === "emne_pack" ? x.items : [x]).find(x => x.id === id);
for(const x of [catalog,runtime]){
  assert(x,"Missing canonical Smørbukk catalog/runtime entry");
  assert.equal(x.title,"Smørbukk");
  assert.equal(x.latin,"Hylotelephium maximum");
  assert.equal(x.taxonomy.latin_navn,"Hylotelephium maximum");
  assert.equal(x.taxonomy.familie,"Crassulaceae");
  assert(!JSON.stringify(x).includes("Pimpinella saxifraga"),"Old gjeldkarve misidentification present");
}
const b=fs.readFileSync(new URL(a.src,root));
assert.equal(b.length,a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),a.sha256);
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),a.gitBlobSha);
assert.equal(b.toString("ascii",0,4),"RIFF");
assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");
assert((b[20]&0x10)!==0,"Original alpha channel required");
assert.deepEqual([1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)],a.dimensions);
assert(a.visualChecks.blackBackgroundReviewed && a.visualChecks.fullImageReviewed);
const env={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env,{timeout:2000});
const approved=env.window.HG_NATURE_FLORA_APPROVED;
assert(approved?.count >= 59, "The 59 Smørbukk-era approvals must remain available");
assert.equal(approved.get(id)?.src,a.src);
assert.equal(approved.get(id)?.gitBlobSha,a.gitBlobSha);
assert(read("finn-flora.html").includes("nature-flora-approved.js"));
console.log("Smørbukk #59: taxonomy corrected, exact WebP, true alpha, SHA256 and Git SHA, 59 approved illustrations including Smørbukk.");
