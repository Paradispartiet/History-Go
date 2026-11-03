import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import vm from "node:vm";

const root=new URL("../",import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),"utf8");
const doc=JSON.parse(read("data/natur/flora/illustration-quality-snoklokke-20261103.json"));
const a=doc.items[0], id="emne_flora_snoklokke";
assert.equal(doc.baselineApproved,60);
assert.equal(doc.approvedCountAfterRelease,61);
assert.equal(doc.items.length,1);
assert.equal(a.catalogId,id);
assert.equal(a.scientificName,"Galanthus nivalis");
assert.equal(a.reviewStatus,"approved");
assert.equal(a.approvedForPublication,true);
for(const record of [
  JSON.parse(read("data/natur/flora/blomster.json")).find(x=>x.id===id),
  JSON.parse(read("data/runtime/nature-all/flora-001.json")).flatMap(x=>x.kind==="emne_pack"?x.items:[x]).find(x=>x.id===id)
]) {
  assert(record,"Missing Snøklokke in canonical flora records");
  assert.equal(record.title,"Snøklokke");
  assert.equal(record.latin,"Galanthus nivalis");
  assert.equal(record.taxonomy.latin_navn,"Galanthus nivalis");
  assert.equal(record.taxonomy.familie,"Amaryllidaceae");
}
const b=fs.readFileSync(new URL(a.src,root));
assert.equal(b.length,a.sizeBytes);
assert.equal(crypto.createHash("sha256").update(b).digest("hex"),a.sha256);
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length),Buffer.from([0]),b])).digest("hex"),a.gitBlobSha);
assert.equal(b.toString("ascii",0,4),"RIFF");
assert.equal(b.toString("ascii",8,12),"WEBP");
assert.equal(b.toString("ascii",12,16),"VP8X");
assert((b[20]&0x10)!==0,"Transparent WebP alpha required");
assert.deepEqual([1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)],a.dimensions);
assert.equal(a.visualChecks.transparent,true);
assert.equal(a.visualChecks.blackBackgroundReviewed,true);
assert.equal(a.visualChecks.fullImageReviewed,true);
const env={window:{}};
vm.runInNewContext(read("js/ui/nature-flora-approved.js"),env,{timeout:2000});
const approved=env.window.HG_NATURE_FLORA_APPROVED;
assert(approved?.count>=61,"Snøklokke must be the 61st published illustration");
assert.equal(approved.get(id)?.src,a.src);
assert.equal(approved.get(id)?.gitBlobSha,a.gitBlobSha);
assert(read("finn-flora.html").includes("nature-flora-approved.js"));
console.log("Snøklokke #61: verified taxonomy, source WebP, alpha, 1024x1536, SHA256/Git SHA and approved registry.");
